'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaUser, FaUserTie, FaGraduationCap, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { ChakraProvider } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import Peer from 'simple-peer';
import io, { Socket } from 'socket.io-client';
import AudioRoom from './AudioRoom';

interface Member {
  uid: string;
  displayName: string;
  email: string;
  role?: string;
  photoURL?: string;
}

interface MemberListProps {
  currentUserId: string;
}

export default function MemberList({ currentUserId }: MemberListProps) {
  // Local state
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [speaking, setSpeaking] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false); // Track local user's mute state
  
  // Handle stream errors
  const handleError = useCallback((error: Error) => {
    console.error('Error with audio stream:', error);
    // You can add error handling UI here if needed
  }, []);
  
  // Refs
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const toast = useToast();

  // Fetch members from Firestore
  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData: Member[] = [];
      snapshot.forEach((doc) => {
        membersData.push({ uid: doc.id, ...doc.data() } as Member);
      });
      setMembers(membersData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle stream from AudioRoom component
  const handleStreamReady = useCallback((newStream: MediaStream) => {
    console.log('Stream ready from AudioRoom', newStream);
    setStream(newStream);
    
    // Create audio element for local preview (muted)
    if (!userAudio.current) {
      const audio = document.createElement('audio');
      audio.id = `user-audio-${currentUserId}`;
      audio.muted = true; // Mute local audio to prevent echo
      audio.autoplay = true;
      // @ts-ignore - playsInline is valid for audio elements in browsers
      audio.playsInline = true;
      document.body.appendChild(audio);
      userAudio.current = audio;
    }
    userAudio.current.srcObject = newStream;
    
    // Join the room after getting media access
    if (socketRef.current) {
      socketRef.current.emit('join-room', 'members-audio-room', currentUserId);
      console.log('Joined room with ID:', currentUserId);
    }
  }, [currentUserId]);
  
  const handleStreamError = useCallback((error: Error) => {
    console.error('Error accessing microphone:', error);
    setLoading(false);
    toast({
      title: 'Microphone Error',
      description: 'Failed to access microphone. Please check permissions.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socketRef.current || !stream) return;
    
    const socket = socketRef.current;
    
    const handleUserConnected = (otherUserId: string) => {
      if (!stream || !otherUserId || otherUserId === currentUserId) return;
      
      console.log('User connected:', otherUserId);
      
      // Check if we already have a peer for this user
      const existingPeer = peersRef.current.find(p => p.peerID === otherUserId);
      if (existingPeer) {
        console.log('Peer already exists for user:', otherUserId);
        return;
      }
      
      console.log('Creating peer for user:', otherUserId);
      const peer = createPeer(otherUserId, socket.id || 'unknown', stream);
      peersRef.current = [...peersRef.current, { peerID: otherUserId, peer }];
    };

    const handleIncomingSignal = (payload: { signal: unknown; callerID: string }) => {
      const { signal, callerID } = payload;
      console.log('Received signal from:', callerID);
      
      // Check if we already have a peer for this user
      const existingPeer = peersRef.current.find(p => p.peerID === callerID);
      if (existingPeer) {
        console.log('Peer already exists for user:', callerID);
        return;
      }
      
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream || undefined,
      });

      peer.on('signal', (signalData) => {
        socket.emit('returning-signal', { signal: signalData, callerID });
      });

      peer.on('stream', (remoteStream) => {
        console.log('Received stream from:', callerID);
        
        // Create or update audio element for this peer
        let audioElement = document.getElementById(`user-audio-${callerID}`) as HTMLAudioElement;
        if (!audioElement) {
          audioElement = document.createElement('audio');
          audioElement.id = `user-audio-${callerID}`;
          audioElement.autoplay = true;
          // @ts-ignore - playsInline is valid for audio elements in browsers
          audioElement.playsInline = true;
          document.body.appendChild(audioElement);
        }
        audioElement.srcObject = remoteStream;
        
        // Update speaking state based on audio activity
        setupAudioMeter(remoteStream, callerID);
      });

      peer.signal(signal);
      peersRef.current = [...peersRef.current, { peerID: callerID, peer }];
    };

    const handleUserDisconnected = (userId: string) => {
      console.log('User disconnected:', userId);
      const peerObj = peersRef.current.find(p => p.peerID === userId);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
    };

    // Set up event listeners
    socket.on('user-connected', handleUserConnected);
    socket.on('receive-signal', handleIncomingSignal);
    socket.on('user-disconnected', handleUserDisconnected);

    // Clean up
    return () => {
      socket.off('user-connected', handleUserConnected);
      socket.off('receive-signal', handleIncomingSignal);
      socket.off('user-disconnected', handleUserDisconnected);
    };
  }, [stream, currentUserId, createPeer, setupAudioMeter]);

  // Create a peer connection
  const createPeer = (userToSignal: string, callerID: string, stream: MediaStream) => {
    if (!socketRef.current) return new Peer();
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current?.emit('send-signal', {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      // Handle incoming stream
      console.log('Received stream from:', userToSignal);
      // You'll need to create audio elements for each peer's stream
    });

    return peer;
  };

  // Setup audio level meter for voice activity detection
  const setupAudioMeter = (audioStream: MediaStream, userId: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(audioStream);
    const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    
    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    
    javascriptNode.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const values = array.reduce((a, b) => a + b, 0) / array.length;
      
      // Update speaking state based on volume threshold
      const isSpeaking = values > 20; // Adjust threshold as needed
      setSpeaking(prev => ({
        ...prev,
        [userId]: isSpeaking
      }));
    };
    
    // Return cleanup function
    return () => {
      try {
        javascriptNode.disconnect();
        analyser.disconnect();
        microphone.disconnect();
      } catch (e) {
        console.error('Error cleaning up audio meter:', e);
      }
    };
  };
  
  // Toggle mute state
  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMuteState = !audioTracks[0].enabled;
        audioTracks[0].enabled = newMuteState;
        setIsMuted(!newMuteState);
        
        // Update the global muted state
        setMuted(prev => ({
          ...prev,
          [currentUserId]: !newMuteState
        }));
        
        // Update speaking state when muting
        if (newMuteState) {
          setSpeaking(prev => ({
            ...prev,
            [currentUserId]: false
          }));
        }
        
        // Notify other users of mute state change
        if (socketRef.current) {
          socketRef.current.emit('user-mute-state', {
            userId: currentUserId,
            isMuted: !newMuteState
          });
        }
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up all peer connections
      peersRef.current.forEach(({ peer }) => {
        try {
          peer.destroy();
        } catch (error) {
          console.error('Error destroying peer:', error);
        }
      });
      
      // Clean up local stream
      if (stream) {
        try {
          stream.getTracks().forEach(track => {
            track.stop();
            stream.removeTrack(track);
          });
        } catch (error) {
          console.error('Error cleaning up stream:', error);
        }
      }
      
      // Remove audio element safely
      if (userAudio.current && userAudio.current.parentNode) {
        try {
          userAudio.current.pause();
          userAudio.current.srcObject = null;
          userAudio.current.parentNode.removeChild(userAudio.current);
        } catch (error) {
          console.error('Error removing audio element:', error);
        }
      }
    };
  }, [stream]);

  // Render member list
  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {/* AudioRoom component for handling media stream */}
      <AudioRoom 
        roomId="default-room" // You might want to make this dynamic based on your app's routing
        userId={currentUserId}
        onStreamReady={handleStreamReady}
        onStreamError={handleError}
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Members ({members.length})</h2>
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'} text-white`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
      </div>
      
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.uid}
            className={`flex items-center p-3 rounded-lg ${
              member.uid === currentUserId ? 'bg-blue-50' : 'bg-white'
            } ${speaking[member.uid] ? 'ring-2 ring-red-400' : ''}`}
          >
            <div className="mr-3">
              {member.role === 'teacher' ? (
                <FaUserTie className="text-blue-600" />
              ) : member.role === 'student' ? (
                <FaGraduationCap className="text-green-600" />
              ) : (
                <FaUser className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {member.displayName}
                {member.uid === currentUserId && ' (You)'}
              </div>
              <div className="text-sm text-gray-500 truncate">{member.email}</div>
            </div>
            <div className="flex items-center ml-2">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${
                  muted[member.uid] ? 'bg-red-500' : 'bg-green-500'
                }`}
                title={muted[member.uid] ? 'Muted' : 'Unmuted'}
              />
              {speaking[member.uid] && (
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
