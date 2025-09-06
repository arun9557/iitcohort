// src/components/AudioRoom.tsx
import { useEffect } from 'react';

interface AudioRoomProps {
  roomId: string;
  userId: string;
  onStreamReady: (stream: MediaStream) => void;
  onStreamError?: (error: Error) => void;
}

export default function AudioRoom({ 
  roomId, 
  userId, 
  onStreamReady,
  onStreamError 
}: AudioRoomProps) {
  useEffect(() => {
    // This component now only handles local media stream initialization
    // WebRTC connections are managed by MemberList
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // Notify parent component that stream is ready
        onStreamReady(stream);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        if (onStreamError) {
          onStreamError(error as Error);
        }
      }
    };

    initMedia();

    // Cleanup function
    return () => {
      // Stream cleanup is handled by the parent component (MemberList)
    };
  }, [onStreamReady, onStreamError]);

  // This component doesn't render anything visible
  // It's just a container for audio stream initialization
  return null;
}