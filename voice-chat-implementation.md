# Discord-like Voice Chat Implementation Guide

Aapke IIT Cohort project mein Discord jaisa live voice feature add karne ke liye yeh complete implementation guide hai.

## Main Issues & Solutions

### 1. WebRTC Configuration

```typescript
// services/webrtc.ts
interface RTCConfig {
  iceServers: RTCIceServer[];
}

export const rtcConfig: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false // Voice only
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  closePeerConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }
}
```

### 2. Firebase Real-time Signaling

```typescript
// services/firebase-signaling.ts
import { database } from './firebase';
import { ref, push, onValue, set, serverTimestamp } from 'firebase/database';

export class FirebaseSignalingService {
  private roomId: string;
  private userId: string;

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  // Send offer to start WebRTC connection
  async sendOffer(to: string, offer: RTCSessionDescriptionInit) {
    const signalRef = ref(database, `voice-signals/${this.roomId}`);
    await push(signalRef, {
      type: 'offer',
      from: this.userId,
      to,
      data: offer,
      timestamp: serverTimestamp()
    });
  }

  // Send answer to offer
  async sendAnswer(to: string, answer: RTCSessionDescriptionInit) {
    const signalRef = ref(database, `voice-signals/${this.roomId}`);
    await push(signalRef, {
      type: 'answer',
      from: this.userId,
      to,
      data: answer,
      timestamp: serverTimestamp()
    });
  }

  // Send ICE candidate
  async sendIceCandidate(to: string, candidate: RTCIceCandidate) {
    const signalRef = ref(database, `voice-signals/${this.roomId}`);
    await push(signalRef, {
      type: 'candidate',
      from: this.userId,
      to,
      data: {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      },
      timestamp: serverTimestamp()
    });
  }

  // Listen for incoming signals
  onSignal(callback: (signal: any) => void) {
    const signalRef = ref(database, `voice-signals/${this.roomId}`);
    
    return onValue(signalRef, (snapshot) => {
      const signals = snapshot.val();
      if (signals) {
        Object.values(signals).forEach((signal: any) => {
          if (signal.to === this.userId) {
            callback(signal);
          }
        });
      }
    });
  }
}
```

### 3. Voice Chat Hook Implementation

```typescript
// hooks/useVoiceChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { FirebaseSignalingService } from '../services/firebase-signaling';

export function useVoiceChat(roomId: string, userId: string, participantIds: string[]) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Record<string, MediaStream>>({});
  const [isSpeaking, setIsSpeaking] = useState<Record<string, boolean>>({});

  const rtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<FirebaseSignalingService | null>(null);
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize services
  useEffect(() => {
    rtcService.current = new WebRTCService();
    signalingService.current = new FirebaseSignalingService(roomId, userId);

    // Handle incoming signals
    const unsubscribe = signalingService.current.onSignal(async (signal) => {
      if (!rtcService.current) return;

      switch (signal.type) {
        case 'offer':
          const answer = await rtcService.current.createAnswer(signal.from, signal.data);
          signalingService.current?.sendAnswer(signal.from, answer);
          break;
        case 'answer':
          await rtcService.current.setRemoteDescription(signal.from, signal.data);
          break;
        case 'candidate':
          await rtcService.current.addIceCandidate(signal.from, signal.data);
          break;
      }
    });

    return () => {
      unsubscribe();
      rtcService.current?.stopLocalStream();
      rtcService.current?.closeAllConnections();
    };
  }, [roomId, userId]);

  // Connect to voice chat
  const connect = useCallback(async () => {
    if (!rtcService.current || !signalingService.current) return;

    try {
      await rtcService.current.initializeLocalStream();
      setIsConnected(true);

      // Start calls with all participants
      participantIds.forEach(participantId => {
        if (participantId !== userId) {
          startCall(participantId);
        }
      });
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
    }
  }, [participantIds, userId]);

  // Disconnect from voice chat
  const disconnect = useCallback(() => {
    rtcService.current?.stopLocalStream();
    rtcService.current?.closeAllConnections();
    setIsConnected(false);
    setParticipants({});
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuteState = !isMuted;
    rtcService.current?.getLocalStream()?.getAudioTracks().forEach(track => {
      track.enabled = !newMuteState;
    });
    setIsMuted(newMuteState);
  }, [isMuted]);

  // Start call with participant
  const startCall = useCallback(async (participantId: string) => {
    if (!rtcService.current || !signalingService.current) return;

    try {
      const offer = await rtcService.current.createOffer(participantId);
      await signalingService.current.sendOffer(participantId, offer);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  }, []);

  return {
    isConnected,
    isMuted,
    participants,
    isSpeaking,
    connect,
    disconnect,
    toggleMute,
  };
}
```

### 4. Voice Chat Components

```typescript
// components/VoiceChatButton.tsx
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import { Button, HStack, Tooltip, useToast } from '@chakra-ui/react';
import { useVoiceChat } from '../hooks/useVoiceChat';

interface VoiceChatButtonProps {
  roomId: string;
  userId: string;
  participantIds: string[];
}

export function VoiceChatButton({ roomId, userId, participantIds }: VoiceChatButtonProps) {
  const toast = useToast();
  const { isConnected, isMuted, connect, disconnect, toggleMute } = useVoiceChat(
    roomId,
    userId,
    participantIds
  );

  const handleToggleVoiceChat = () => {
    try {
      if (isConnected) {
        disconnect();
      } else {
        connect();
      }
    } catch (error) {
      console.error('Error toggling voice chat:', error);
      toast({
        title: 'Voice Chat Error',
        description: 'Failed to toggle voice chat',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <HStack spacing={2}>
      <Button
        leftIcon={isConnected ? <FaPhoneSlash /> : <FaMicrophone />}
        colorScheme={isConnected ? 'red' : 'green'}
        onClick={handleToggleVoiceChat}
      >
        {isConnected ? 'Leave Voice' : 'Join Voice'}
      </Button>
      
      {isConnected && (
        <Tooltip label={isMuted ? 'Unmute' : 'Mute'}>
          <Button
            leftIcon={isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            onClick={toggleMute}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
}
```

### 5. Participant Audio Component

```typescript
// components/ParticipantAudio.tsx
import { useEffect, useRef } from 'react';
import { Box, Text, Avatar, VStack } from '@chakra-ui/react';

interface ParticipantAudioProps {
  userId: string;
  displayName: string;
  stream: MediaStream | null;
  isSpeaking: boolean;
  photoURL?: string;
}

export function ParticipantAudio({ 
  userId, 
  displayName, 
  stream, 
  isSpeaking, 
  photoURL 
}: ParticipantAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <VStack spacing={2} p={3} borderRadius="lg" bg={isSpeaking ? 'green.100' : 'gray.50'}>
      <Avatar 
        size="md" 
        name={displayName} 
        src={photoURL}
        border={isSpeaking ? '2px solid green' : '2px solid gray'}
      />
      <Text fontSize="sm" fontWeight="medium">
        {displayName}
      </Text>
      {isSpeaking && (
        <Text fontSize="xs" color="green.600">
          Speaking...
        </Text>
      )}
      <audio 
        ref={audioRef} 
        autoPlay 
        playsInline 
        style={{ display: 'none' }}
      />
    </VStack>
  );
}
```

### 6. Voice Chat Panel

```typescript
// components/VoiceChatPanel.tsx
import { VStack, Heading, SimpleGrid, Box, Text, Button } from '@chakra-ui/react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { ParticipantAudio } from './ParticipantAudio';

interface Participant {
  id: string;
  displayName: string;
  photoURL?: string;
}

interface VoiceChatPanelProps {
  roomId: string;
  userId: string;
  participants: Participant[];
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceChatPanel({
  roomId,
  userId,
  participants,
  isOpen,
  onClose,
}: VoiceChatPanelProps) {
  const { isConnected, isMuted, participants: participantStreams, isSpeaking, connect, disconnect, toggleMute } = useVoiceChat(
    roomId,
    userId,
    participants.map(p => p.id)
  );

  if (!isOpen) return null;

  return (
    <VStack
      position="fixed"
      bottom="4"
      right="4"
      bg="white"
      boxShadow="lg"
      borderRadius="lg"
      p={4}
      spacing={4}
      maxW="400px"
      maxH="80vh"
      overflowY="auto"
      zIndex={1000}
    >
      <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">Voice Chat</Heading>
        <Box>
          <Button
            colorScheme={isConnected ? 'red' : 'green'}
            onClick={isConnected ? disconnect : connect}
            size="sm"
            mr={2}
          >
            {isConnected ? 'Leave' : 'Join'}
          </Button>
          {isConnected && (
            <Button
              colorScheme={isMuted ? 'gray' : 'red'}
              onClick={toggleMute}
              size="sm"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          )}
        </Box>
      </Box>

      <SimpleGrid columns={2} spacing={4} width="100%">
        {participants.map((participant) => (
          <ParticipantAudio
            key={participant.id}
            userId={participant.id}
            displayName={participant.displayName}
            photoURL={participant.photoURL}
            isSpeaking={!!isSpeaking[participant.id]}
            stream={participantStreams[participant.id] || null}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
```

## Implementation Steps

### Step 1: Update WebRTC Service
- Add proper error handling
- Implement connection state management
- Add audio level detection for speaking indicators

### Step 2: Enhance Firebase Signaling
- Add connection cleanup
- Implement retry logic for failed signals
- Add user presence tracking

### Step 3: Improve Voice Chat Hook
- Add reconnection logic
- Implement audio level monitoring
- Add connection quality indicators

### Step 4: Update Components
- Add loading states
- Implement error handling
- Add connection status indicators

### Step 5: Integration with Existing Components
- Update AudioRoom component to use new voice chat
- Integrate with room management
- Add voice chat to project collaboration features

## Key Features

1. **Real-time Voice Communication**: WebRTC-based peer-to-peer audio
2. **Firebase Signaling**: Real-time signaling for connection establishment
3. **Mute/Unmute Controls**: Individual and global mute functionality
4. **Speaking Indicators**: Visual feedback when participants are speaking
5. **Connection Management**: Automatic reconnection and error handling
6. **Responsive UI**: Mobile-friendly voice chat interface

## Testing Checklist

- [ ] Microphone permissions work correctly
- [ ] Voice chat connects successfully
- [ ] Audio quality is good
- [ ] Mute/unmute functions properly
- [ ] Speaking indicators work
- [ ] Multiple participants can join
- [ ] Connection handles network issues
- [ ] UI is responsive on mobile

## Deployment Notes

1. Ensure HTTPS is enabled for WebRTC
2. Configure Firebase Realtime Database rules
3. Test on different browsers and devices
4. Monitor Firebase usage for signaling
5. Implement proper error logging

Yeh implementation aapke IIT Cohort project mein professional-grade voice chat feature provide karega, Discord jaisa experience ke saath!
