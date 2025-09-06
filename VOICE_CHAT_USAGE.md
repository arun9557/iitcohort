# Voice Chat System Usage Guide

## Overview

The new voice chat system provides Discord-like real-time voice communication for your IIT Cohort project. It uses WebRTC for peer-to-peer audio connections and Firebase Realtime Database for signaling.

## Key Features

- ✅ Real-time voice communication
- ✅ Mute/unmute controls
- ✅ Speaking indicators
- ✅ Connection status monitoring
- ✅ User presence tracking
- ✅ Automatic reconnection
- ✅ Mobile-friendly interface

## Quick Start

### 1. Basic Integration

```tsx
import { VoiceChatButton } from './components/VoiceChatButton';
import { useVoiceChat } from './hooks/useVoiceChat';

function MyComponent() {
  const roomId = "room-123";
  const userId = "user-456";
  const participantIds = ["user-789", "user-101"];

  return (
    <VoiceChatButton
      roomId={roomId}
      userId={userId}
      participantIds={participantIds}
    />
  );
}
```

### 2. Advanced Integration

```tsx
import { VoiceChatIntegration } from './components/VoiceChatIntegration';

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
    <VoiceChatIntegration
      roomId={roomId}
      userId={userId}
      userDisplayName={userDisplayName}
      userPhotoURL={userPhotoURL}
      participantIds={participantIds}
      participants={participants}
    />
  );
}
```

### 3. Custom Implementation

```tsx
import { useVoiceChat } from './hooks/useVoiceChat';

function CustomVoiceChat() {
  const {
    isConnected,
    isMuted,
    participants,
    isSpeaking,
    connect,
    disconnect,
    toggleMute
  } = useVoiceChat(roomId, userId, participantIds);

  return (
    <div>
      <button onClick={isConnected ? disconnect : connect}>
        {isConnected ? 'Leave Voice' : 'Join Voice'}
      </button>
      
      {isConnected && (
        <button onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      )}
      
      {Object.entries(participants).map(([userId, stream]) => (
        <audio key={userId} ref={ref => {
          if (ref) ref.srcObject = stream;
        }} autoPlay />
      ))}
    </div>
  );
}
```

## Components

### VoiceChatButton
Simple button component for joining/leaving voice chat.

**Props:**
- `roomId: string` - Unique room identifier
- `userId: string` - Current user ID
- `participantIds: string[]` - Array of participant user IDs

### VoiceChatPanel
Full-featured voice chat panel with participant list.

**Props:**
- `roomId: string` - Unique room identifier
- `userId: string` - Current user ID
- `participants: Participant[]` - Array of participant objects
- `isOpen: boolean` - Whether panel is visible
- `onClose: () => void` - Callback when panel is closed

### ParticipantAudio
Individual participant audio component with speaking indicators.

**Props:**
- `userId: string` - Participant user ID
- `displayName: string` - Participant display name
- `stream: MediaStream | null` - Audio stream
- `isSpeaking: boolean` - Whether participant is speaking
- `photoURL?: string` - Optional avatar URL

## Hooks

### useVoiceChat

Main hook for voice chat functionality.

**Parameters:**
- `roomId: string` - Unique room identifier
- `userId: string` - Current user ID
- `participantIds: string[]` - Array of participant user IDs

**Returns:**
- `isConnected: boolean` - Whether user is connected to voice chat
- `isMuted: boolean` - Whether user is muted
- `participants: Record<string, MediaStream>` - Audio streams from participants
- `isSpeaking: Record<string, boolean>` - Speaking status for each participant
- `connectionStates: Record<string, RTCPeerConnectionState>` - Connection states
- `onlineUsers: string[]` - List of online user IDs
- `connect: () => Promise<void>` - Connect to voice chat
- `disconnect: () => Promise<void>` - Disconnect from voice chat
- `toggleMute: () => void` - Toggle mute state

## Services

### WebRTCService
Handles WebRTC peer-to-peer connections.

**Key Methods:**
- `initializeLocalStream()` - Get user's microphone
- `createPeerConnection(userId)` - Create connection to participant
- `createOffer(userId)` - Create connection offer
- `createAnswer(userId, offer)` - Create connection answer
- `addIceCandidate(userId, candidate)` - Add ICE candidate
- `isSpeaking(threshold?)` - Check if user is speaking
- `getAudioLevel()` - Get current audio level

### FirebaseSignalingService
Handles real-time signaling via Firebase.

**Key Methods:**
- `initialize()` - Start listening for signals
- `sendOffer(to, offer)` - Send connection offer
- `sendAnswer(to, answer)` - Send connection answer
- `sendIceCandidate(to, candidate)` - Send ICE candidate
- `broadcastUserJoined()` - Notify others user joined
- `broadcastUserLeft()` - Notify others user left

## Firebase Setup

### Database Rules

Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "voice-signals": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "voice-presence": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
```

## Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Try refreshing the page

2. **Connection Failed**
   - Check Firebase configuration
   - Verify network connectivity
   - Check browser console for errors

3. **No Audio**
   - Check system volume
   - Verify microphone is working
   - Check browser audio settings

4. **Poor Audio Quality**
   - Check network connection
   - Close other applications using microphone
   - Try different browser

### Debug Mode

Enable debug logging by adding to your component:

```tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Voice chat state:', {
      isConnected,
      isMuted,
      participants: Object.keys(participants),
      isSpeaking,
      connectionStates,
      onlineUsers
    });
  }
}, [isConnected, isMuted, participants, isSpeaking, connectionStates, onlineUsers]);
```

## Performance Tips

1. **Limit Participants**: Keep voice rooms to 8-10 participants max
2. **Cleanup**: Always call `disconnect()` when component unmounts
3. **Network**: Use stable internet connection for best quality
4. **Browser**: Close unnecessary tabs to free up resources

## Security Considerations

1. **Authentication**: Ensure users are authenticated before joining voice chat
2. **Room Access**: Implement proper room access controls
3. **Data Privacy**: Voice data is peer-to-peer, not stored on servers
4. **Firebase Rules**: Use proper security rules for signaling data

## Future Enhancements

- [ ] Video support
- [ ] Screen sharing
- [ ] Recording capabilities
- [ ] Noise cancellation improvements
- [ ] Push-to-talk mode
- [ ] Voice effects
- [ ] Group management
- [ ] Call quality indicators

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Test with different browsers
4. Check network connectivity
5. Review this documentation

Happy voice chatting! 🎤✨
