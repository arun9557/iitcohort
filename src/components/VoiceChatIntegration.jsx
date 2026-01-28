// Example integration of the new voice chat system
import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Badge } from '@chakra-ui/react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceChatButton } from './VoiceChatButton';
import { VoiceChatPanel } from './VoiceChatPanel';
import { ParticipantAudio } from './ParticipantAudio';
export function VoiceChatIntegration({ roomId, userId, participantIds, participants }) {
    const [showVoicePanel, setShowVoicePanel] = useState(false);
    const { isConnected, isMuted, participants: participantStreams, isSpeaking, connectionStates, onlineUsers } = useVoiceChat(roomId, userId, participantIds);
    return (<VStack gap={4} align="stretch">

      {/* Voice Chat Controls */}
      <Box>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="bold">
              Voice Chat
            </Text>
            <HStack gap={2}>
              <Badge colorScheme={isConnected ? 'green' : 'gray'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isConnected && (<Badge colorScheme={isMuted ? 'red' : 'green'}>
                  {isMuted ? 'Muted' : 'Unmuted'}
                </Badge>)}
              <Badge colorScheme="blue">
                {onlineUsers.length} Online
              </Badge>
            </HStack>
          </VStack>

          <HStack gap={2}>
            <VoiceChatButton roomId={roomId} userId={userId} participantIds={participantIds}/>
            {isConnected && (<Button size="sm" variant="outline" onClick={() => setShowVoicePanel(!showVoicePanel)}>
                {showVoicePanel ? 'Hide Panel' : 'Show Panel'}
              </Button>)}
          </HStack>
        </HStack>
      </Box>

      {/* Connection Status */}
      {isConnected && (<Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Connection Status:
          </Text>
          <HStack gap={2} wrap="wrap">
            {participants.map((participant) => {
                const connectionState = connectionStates[participant.id];
                const isParticipantSpeaking = isSpeaking[participant.id];
                return (<Badge key={participant.id} colorScheme={connectionState === 'connected' ? 'green' :
                        connectionState === 'connecting' ? 'yellow' :
                            connectionState === 'failed' ? 'red' : 'gray'} variant={isParticipantSpeaking ? 'solid' : 'subtle'}>
                  {participant.displayName}: {connectionState || 'unknown'}
                  {isParticipantSpeaking && ' 🎤'}
                </Badge>);
            })}
          </HStack>
        </Box>)}

      {/* Voice Chat Panel */}
      {showVoicePanel && (<VoiceChatPanel roomId={roomId} userId={userId} participants={participants} isOpen={showVoicePanel} onClose={() => setShowVoicePanel(false)}/>)}

      {/* Participant Audio Streams */}
      {isConnected && (<Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Active Audio Streams:
          </Text>
          <HStack gap={4} wrap="wrap">
            {participants.map((participant) => {
                const stream = participantStreams[participant.id];
                const isParticipantSpeaking = isSpeaking[participant.id];
                if (!stream)
                    return null;
                return (<ParticipantAudio key={participant.id} userId={participant.id} displayName={participant.displayName} stream={stream} isSpeaking={isParticipantSpeaking}/>);
            })}
          </HStack>
        </Box>)}

      {/* Usage Instructions */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" color="gray.700">
          <strong>How to use:</strong>
          <br />
          1. Click &quot;Join Voice&quot; to start voice chat
          <br />
          2. Allow microphone access when prompted
          <br />
          3. Use &quot;Mute/Unmute&quot; to control your microphone
          <br />
          4. Green indicators show when someone is speaking
          <br />
          5. Click &quot;Leave Voice&quot; to disconnect
        </Text>
      </Box>
    </VStack>);
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
