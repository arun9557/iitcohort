import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import { Button, HStack } from '@chakra-ui/react';
import { useVoiceChat } from '../hooks/useVoiceChat';
export function VoiceChatButton({ roomId, userId, participantIds }) {
    const { isConnected, isMuted, connect, disconnect, toggleMute } = useVoiceChat(roomId, userId, participantIds);
    const handleToggleVoiceChat = () => {
        try {
            if (isConnected) {
                disconnect();
            }
            else {
                connect();
            }
        }
        catch (error) {
            console.error('Error toggling voice chat:', error);
        }
    };
    return (<HStack gap={2}>
      <Button colorScheme={isConnected ? 'red' : 'green'} onClick={handleToggleVoiceChat}>
        {isConnected ? <FaPhoneSlash /> : <FaMicrophone />} {isConnected ? 'Leave Voice' : 'Join Voice'}
      </Button>
      
      {isConnected && (<Button colorScheme={isMuted ? 'gray' : 'red'} onClick={toggleMute}>
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} {isMuted ? 'Unmute' : 'Mute'}
        </Button>)}
    </HStack>);
}
