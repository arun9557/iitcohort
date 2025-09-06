// Example integration of the new voice chat system
import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Badge, Alert, AlertIcon } from '@chakra-ui/react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceChatButton } from './VoiceChatButton';
import { VoiceChatPanel } from './VoiceChatPanel';
import { ParticipantAudio } from './ParticipantAudio';

interface VoiceChatIntegrationProps {
  roomId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  participantIds: string[];
  participants: Array<{
    id: string;
    displayName: string;
    photoURL?: string;
  }>;
}

export function VoiceChatIntegration({
  roomId,
  userId,
  userDisplayName,
  userPhotoURL,
  participantIds,
  participants
}: VoiceChatIntegrationProps) {
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isConnected,
    isMuted,
    participants: participantStreams,
    isSpeaking,
    connectionStates,
    onlineUsers,
    connect,
    disconnect,
    toggleMute
  } = useVoiceChat(roomId, userId, participantIds);

  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      setError('Failed to connect to voice chat. Please check your microphone permissions.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect from voice chat:', error);
    }
  };

  const handleToggleMute = () => {
    try {
      toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Error Display */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Voice Chat Controls */}
      <Box>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">
              Voice Chat
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={isConnected ? 'green' : 'gray'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isConnected && (
                <Badge colorScheme={isMuted ? 'red' : 'green'}>
                  {isMuted ? 'Muted' : 'Unmuted'}
                </Badge>
              )}
              <Badge colorScheme="blue">
                {onlineUsers.length} Online
              </Badge>
            </HStack>
          </VStack>

          <HStack spacing={2}>
            <VoiceChatButton
              roomId={roomId}
              userId={userId}
              participantIds={participantIds}
            />
            {isConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowVoicePanel(!showVoicePanel)}
              >
                {showVoicePanel ? 'Hide Panel' : 'Show Panel'}
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Connection Status */}
      {isConnected && (
        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Connection Status:
          </Text>
          <HStack spacing={2} wrap="wrap">
            {participants.map((participant) => {
              const connectionState = connectionStates[participant.id];
              const isOnline = onlineUsers.includes(participant.id);
              const isParticipantSpeaking = isSpeaking[participant.id];
              
              return (
                <Badge
                  key={participant.id}
                  colorScheme={
                    connectionState === 'connected' ? 'green' :
                    connectionState === 'connecting' ? 'yellow' :
                    connectionState === 'failed' ? 'red' : 'gray'
                  }
                  variant={isParticipantSpeaking ? 'solid' : 'subtle'}
                >
                  {participant.displayName}: {connectionState || 'unknown'}
                  {isParticipantSpeaking && ' 🎤'}
                </Badge>
              );
            })}
          </HStack>
        </Box>
      )}

      {/* Voice Chat Panel */}
      {showVoicePanel && (
        <VoiceChatPanel
          roomId={roomId}
          userId={userId}
          participants={participants}
          isOpen={showVoicePanel}
          onClose={() => setShowVoicePanel(false)}
        />
      )}

      {/* Participant Audio Streams */}
      {isConnected && (
        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Active Audio Streams:
          </Text>
          <HStack spacing={4} wrap="wrap">
            {participants.map((participant) => {
              const stream = participantStreams[participant.id];
              const isParticipantSpeaking = isSpeaking[participant.id];
              
              if (!stream) return null;
              
              return (
                <ParticipantAudio
                  key={participant.id}
                  userId={participant.id}
                  displayName={participant.displayName}
                  photoURL={participant.photoURL}
                  stream={stream}
                  isSpeaking={isParticipantSpeaking}
                />
              );
            })}
          </HStack>
        </Box>
      )}

      {/* Usage Instructions */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" color="gray.700">
          <strong>How to use:</strong>
          <br />
          1. Click "Join Voice" to start voice chat
          <br />
          2. Allow microphone access when prompted
          <br />
          3. Use "Mute/Unmute" to control your microphone
          <br />
          4. Green indicators show when someone is speaking
          <br />
          5. Click "Leave Voice" to disconnect
        </Text>
      </Box>
    </VStack>
  );
}

// Example usage in a room component:
/*
import { VoiceChatIntegration } from './VoiceChatIntegration';

function RoomComponent() {
  const roomId = "room-123";
  const userId = "user-456";
  const userDisplayName = "John Doe";
  const userPhotoURL = "https://example.com/avatar.jpg";
  
  const participantIds = ["user-789", "user-101"];
  const participants = [
    { id: "user-789", displayName: "Jane Smith", photoURL: "https://example.com/jane.jpg" },
    { id: "user-101", displayName: "Bob Johnson", photoURL: "https://example.com/bob.jpg" }
  ];

  return (
    <div>
      <h1>Room: {roomId}</h1>
      
      <VoiceChatIntegration
        roomId={roomId}
        userId={userId}
        userDisplayName={userDisplayName}
        userPhotoURL={userPhotoURL}
        participantIds={participantIds}
        participants={participants}
      />
      
      // ... other room content
    </div>
  );
}
*/
