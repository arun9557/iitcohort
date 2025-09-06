import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { FirebaseSignalingService } from '../services/signaling';

interface VoiceChatState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: Record<string, boolean>;
  participants: string[];
}

export function useVoiceChat(roomId: string, userId: string, participantIds: string[]) {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isMuted: false,
    isSpeaking: {},
    participants: [],
  });

  const rtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<FirebaseSignalingService | null>(null);
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize services
  useEffect(() => {
    rtcService.current = new WebRTCService();
    signalingService.current = new FirebaseSignalingService(roomId, userId);
    
    return () => {
      rtcService.current?.stopLocalStream();
      rtcService.current?.closeAllConnections();
      signalingService.current?.cleanup();
    };
  }, [roomId, userId]);

  // Handle incoming signals
  useEffect(() => {
    if (!signalingService.current) return;

    const handleSignal = async (signal: any) => {
      if (!rtcService.current) return;

      switch (signal.type) {
        case 'offer':
          const answer = await rtcService.current.createAnswer(signal.from, signal.data.sdp);
          signalingService.current?.sendAnswer(signal.from, answer);
          break;
        case 'answer':
          await rtcService.current.setRemoteDescription(signal.from, signal.data.sdp);
          break;
        case 'candidate':
          await rtcService.current.addIceCandidate(signal.from, signal.data);
          break;
        case 'hangup':
          rtcService.current.closePeerConnection(signal.from);
          break;
      }
    };

    signalingService.current.initialize();
    return signalingService.current.onSignal(handleSignal);
  }, [userId]);

  // Connect to voice chat
  const connect = useCallback(async () => {
    if (!rtcService.current || !signalingService.current) return;

    try {
      await rtcService.current.initializeLocalStream();
      setState(prev => ({ ...prev, isConnected: true }));
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
    }
  }, []);

  // Disconnect from voice chat
  const disconnect = useCallback(() => {
    rtcService.current?.stopLocalStream();
    rtcService.current?.closeAllConnections();
    setState(prev => ({ ...prev, isConnected: false }));
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

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    startCall,
  };
}
