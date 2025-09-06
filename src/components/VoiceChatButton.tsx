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
