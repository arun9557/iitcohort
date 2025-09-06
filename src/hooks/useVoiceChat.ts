import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { FirebaseSignalingService } from '../services/signaling';

interface VoiceChatState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: Record<string, boolean>;
  participants: Record<string, MediaStream>;
  connectionStates: Record<string, RTCPeerConnectionState>;
  onlineUsers: string[];
}

export function useVoiceChat(roomId: string, userId: string, participantIds: string[]) {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isMuted: false,
    isSpeaking: {},
    participants: {},
    connectionStates: {},
    onlineUsers: [],
  });

  const rtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<FirebaseSignalingService | null>(null);
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});
  const speakingInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize services
  useEffect(() => {
    rtcService.current = new WebRTCService();
    signalingService.current = new FirebaseSignalingService(roomId, userId);
    
    return () => {
      if (speakingInterval.current) {
        clearInterval(speakingInterval.current);
      }
      rtcService.current?.stopLocalStream();
      rtcService.current?.closeAllConnections();
      signalingService.current?.cleanup();
    };
  }, [roomId, userId]);

  // Handle incoming signals
  useEffect(() => {
    if (!signalingService.current || !rtcService.current) return;

    const handleSignal = async (signal: any) => {
      if (!rtcService.current) return;

      try {
        switch (signal.type) {
          case 'offer':
            const answer = await rtcService.current.createAnswer(signal.from, signal.data);
            await signalingService.current?.sendAnswer(signal.from, answer);
            break;
          case 'answer':
            await rtcService.current.setRemoteDescription(signal.from, signal.data);
            break;
          case 'candidate':
            await rtcService.current.addIceCandidate(signal.from, signal.data);
            break;
          case 'hangup':
            rtcService.current.closePeerConnection(signal.from);
            setState(prev => ({
              ...prev,
              participants: { ...prev.participants, [signal.from]: undefined as any },
              connectionStates: { ...prev.connectionStates, [signal.from]: 'closed' }
            }));
            break;
          case 'user-joined':
            if (signal.data.userId !== userId) {
              setState(prev => ({
                ...prev,
                onlineUsers: [...prev.onlineUsers.filter(id => id !== signal.data.userId), signal.data.userId]
              }));
            }
            break;
          case 'user-left':
            setState(prev => ({
              ...prev,
              onlineUsers: prev.onlineUsers.filter(id => id !== signal.data.userId),
              participants: { ...prev.participants, [signal.data.userId]: undefined as any }
            }));
            break;
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    };

    const handlePresenceChange = (userId: string, isOnline: boolean) => {
      setState(prev => ({
        ...prev,
        onlineUsers: isOnline 
          ? [...prev.onlineUsers.filter(id => id !== userId), userId]
          : prev.onlineUsers.filter(id => id !== userId)
      }));
    };

    signalingService.current.initialize();
    const unsubscribeSignal = signalingService.current.onSignal(handleSignal);
    const unsubscribePresence = signalingService.current.onPresenceChange(handlePresenceChange);

    return () => {
      unsubscribeSignal();
      unsubscribePresence();
    };
  }, [userId]);

  // Connect to voice chat
  const connect = useCallback(async () => {
    if (!rtcService.current || !signalingService.current) return;

    try {
      await rtcService.current.initializeLocalStream();
      setState(prev => ({ ...prev, isConnected: true }));

      // Broadcast user joined
      await signalingService.current.broadcastUserJoined();

      // Start calls with all participants
      participantIds.forEach(participantId => {
        if (participantId !== userId) {
          startCall(participantId);
        }
      });

      // Start speaking detection
      startSpeakingDetection();
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      throw error;
    }
  }, [participantIds, userId]);

  // Disconnect from voice chat
  const disconnect = useCallback(async () => {
    if (speakingInterval.current) {
      clearInterval(speakingInterval.current);
      speakingInterval.current = null;
    }

    // Broadcast user left
    if (signalingService.current) {
      await signalingService.current.broadcastUserLeft();
    }

    rtcService.current?.stopLocalStream();
    rtcService.current?.closeAllConnections();
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      participants: {},
      connectionStates: {},
      isSpeaking: {}
    }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuteState = !state.isMuted;
    rtcService.current?.getLocalStream()?.getAudioTracks().forEach(track => {
      track.enabled = !newMuteState;
    });
    setState(prev => ({ ...prev, isMuted: newMuteState }));
  }, [state.isMuted]);

  // Start a call with a participant
  const startCall = useCallback(async (participantId: string) => {
    if (!rtcService.current || !signalingService.current) return;

    try {
      const offer = await rtcService.current.createOffer(participantId);
      await signalingService.current.sendOffer(participantId, offer);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  }, []);

  // Start speaking detection
  const startSpeakingDetection = useCallback(() => {
    if (speakingInterval.current) {
      clearInterval(speakingInterval.current);
    }

    speakingInterval.current = setInterval(() => {
      if (rtcService.current) {
        const isSpeaking = rtcService.current.isSpeaking();
        setState(prev => ({
          ...prev,
          isSpeaking: { ...prev.isSpeaking, [userId]: isSpeaking }
        }));
      }
    }, 100);
  }, [userId]);

  // Handle incoming tracks
  useEffect(() => {
    if (!rtcService.current) return;

    const handleTrack = (stream: MediaStream, userId: string) => {
      setState(prev => ({
        ...prev,
        participants: { ...prev.participants, [userId]: stream }
      }));
    };

    const handleConnectionStateChange = (state: RTCPeerConnectionState, userId: string) => {
      setState(prev => ({
        ...prev,
        connectionStates: { ...prev.connectionStates, [userId]: state }
      }));
    };

    const unsubscribeTrack = rtcService.current.onTrack(handleTrack);
    const unsubscribeConnectionState = rtcService.current.onConnectionStateChange(handleConnectionStateChange);

    return () => {
      unsubscribeTrack();
      unsubscribeConnectionState();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    startCall,
  };
}
