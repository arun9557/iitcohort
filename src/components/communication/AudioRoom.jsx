// src/components/AudioRoom.tsx
import { useEffect } from 'react';
export default function AudioRoom({ roomId, userId, onStreamReady, onStreamError }) {
    useEffect(() => {
        // This component now only handles local media stream initialization
        // WebRTC connections are managed by MemberList
        const initMedia = async () => {
            try {
                console.log(`Initializing audio for room: ${roomId}, user: ${userId}`);
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                // Notify parent component that stream is ready
                onStreamReady(stream);
            }
            catch (error) {
                console.error('Error accessing microphone:', error);
                if (onStreamError) {
                    onStreamError(error);
                }
            }
        };
        initMedia();
        // Cleanup function
        return () => {
            // Stream cleanup is handled by the parent component (MemberList)
        };
    }, [roomId, userId, onStreamReady, onStreamError]);
    // This component doesn't render anything visible
    // It's just a container for audio stream initialization
    return null;
}
