import { useEffect, useRef } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FaUser, FaVolumeUp } from 'react-icons/fa';

interface ParticipantAudioProps {
  userId: string;
  displayName: string;
  isSpeaking: boolean;
  stream: MediaStream | null;
}

export function ParticipantAudio({ userId, displayName, isSpeaking, stream }: ParticipantAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !stream) return;

    // Set the stream as the source for the audio element
    audioElement.srcObject = stream;

    return () => {
      if (audioElement) {
        audioElement.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <VStack
      p={2}
      spacing={2}
      borderRadius="md"
      bg={isSpeaking ? 'blue.50' : 'transparent'}
      borderWidth={isSpeaking ? '1px' : '1px'}
      borderColor={isSpeaking ? 'blue.200' : 'gray.200'}
      transition="all 0.2s"
      minW="120px"
    >
      <Box position="relative">
        <Box
          p={3}
          borderRadius="full"
          bg="blue.100"
          color="blue.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FaUser size={20} />
          {isSpeaking && (
            <Box
              position="absolute"
              bottom={0}
              right={0}
              bg="green.400"
              borderRadius="full"
              p={1}
              boxSize="12px"
            />
          )}
        </Box>
      </Box>
      
      <Text fontSize="sm" fontWeight="medium" textAlign="center" noOfLines={1}>
        {displayName}
      </Text>
      
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        style={{ display: 'none' }}
        onError={(e) => console.error(`Error with audio for ${userId}:`, e)}
      />
      
      {isSpeaking && (
        <Box color="green.500" display="flex" alignItems="center">
          <FaVolumeUp />
          <Text ml={1} fontSize="xs">
            Speaking
          </Text>
        </Box>
      )}
    </VStack>
  );
}
