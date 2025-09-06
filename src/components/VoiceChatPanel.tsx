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
  const { isConnected, isMuted, isSpeaking, connect, disconnect, toggleMute } = useVoiceChat(
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
      gap={4}
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

      <SimpleGrid columns={2} gap={4} width="100%">
        {participants.map((participant) => (
          <ParticipantAudio
            key={participant.id}
            userId={participant.id}
            displayName={participant.displayName}
            isSpeaking={!!isSpeaking[participant.id]}
            stream={null} // The actual stream will be managed by the useVoiceChat hook
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
