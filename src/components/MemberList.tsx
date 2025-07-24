'use client';

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { isOwner } from '../utils/auth';

const socket = io('http://localhost:5000'); // Apne signaling server ka URL

interface Member {
  uid: string;
  name?: string;
  email?: string;
}

export default function MemberList({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Local mute state for each member (UI only)
  const [muted, setMuted] = useState<{ [uid: string]: boolean }>({});

  const userAudio = useRef<HTMLAudioElement | null>(null);
  interface PeerConnection {
    peerID: string;
    peer: Peer.Instance;
  }
  const peersRef = useRef<PeerConnection[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Fetch users from Firestore
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const membersData = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      } as Member));
      
      setMembers(membersData);
      setLoading(false);
      
      // Debug: Log all members and their admin status
      console.log('All members:', membersData);
      membersData.forEach(member => {
        const email = member.email || '';
        const uid = member.uid || '';
        const isAdmin = isOwner(email || uid);
        console.log(`Member: ${member.name || email || uid}, isAdmin: ${isAdmin}`);
      });
    });
    
    return () => unsub();
  }, []);

  useEffect(() => {
    // Only run for current user
    if (!currentUserId) return;
    
    let userStream: MediaStream | null = null;
    
    const setupMedia = async () => {
      try {
        // Request microphone access
        userStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        console.log('Got user media stream', userStream);
        setStream(userStream);
        
        // Create audio element for local preview (muted)
        if (!userAudio.current) {
          const audio = document.createElement('audio');
          audio.muted = true; // Mute local audio to prevent echo
          audio.autoplay = true;
          document.body.appendChild(audio);
          userAudio.current = audio;
        }
        userAudio.current.srcObject = userStream;
        
        // Join the room after getting media access
        socket.emit('join-room', 'members-audio-room', currentUserId);
        console.log('Joined room with ID:', currentUserId);
        
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };
    
    setupMedia();
    
    // Set up socket event listeners
    const handleUserConnected = (otherUserId: string) => {
      if (!userStream || !otherUserId) return;
      
      console.log('User connected:', otherUserId);
      if (otherUserId !== currentUserId) {  // Don't connect to self
        const peer = createPeer(otherUserId, socket.id || 'unknown', userStream);
        peersRef.current = [...peersRef.current, { peerID: otherUserId, peer }];
        console.log('Created peer for user:', otherUserId);
      }
    };
    
    const handleSignal = ({ userId: from, signal }: { userId: string; signal: any }) => {
      if (!userStream || !from) return;
      
      console.log('Received signal from:', from);
      const existingPeer = peersRef.current.find(p => p.peerID === from);
      
      if (existingPeer) {
        console.log('Signaling existing peer:', from);
        existingPeer.peer.signal(signal);
      } else if (from !== currentUserId) {  // Don't connect to self
        console.log('Adding new peer from signal:', from);
        const peer = addPeer(signal, from, userStream);
        peersRef.current = [...peersRef.current, { peerID: from, peer }];
      }
    };
    
    const handleUserDisconnected = (id: string) => {
      console.log('User disconnected:', id);
      const peerObj = peersRef.current.find(p => p.peerID === id);
      if (peerObj) {
        console.log('Destroying peer:', id);
        peerObj.peer.destroy();
      }
      peersRef.current = peersRef.current.filter(p => p.peerID !== id);
    };
    
    // Set up socket listeners
    socket.on('user-connected', handleUserConnected);
    socket.on('signal', handleSignal);
    socket.on('user-disconnected', handleUserDisconnected);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up...');
      socket.off('user-connected', handleUserConnected);
      socket.off('signal', handleSignal);
      socket.off('user-disconnected', handleUserDisconnected);
      
      // Stop all tracks in the stream
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
      
      // Clean up all peer connections
      peersRef.current.forEach(({ peer }) => {
        if (peer.destroy) peer.destroy();
      });
      peersRef.current = [];
      
      // Clean up audio element
      if (userAudio.current) {
        userAudio.current.pause();
        if (userAudio.current.parentNode) {
          userAudio.current.parentNode.removeChild(userAudio.current);
        }
        userAudio.current = null;
      }
    };
  }, [currentUserId]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    console.log('Creating peer to signal:', userToSignal);
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', signal => {
      console.log('Sending signal to:', userToSignal);
      socket.emit('signal', { 
        userId: userToSignal, 
        signal,
        from: currentUserId
      });
    });

    peer.on('stream', remoteStream => {
      console.log('Received remote stream from:', userToSignal);
      
      // Create audio element for remote stream
      const audio = document.createElement('audio');
      audio.id = `audio-${userToSignal}`;
      audio.autoplay = true;
      audio.setAttribute('playsinline', ''); // For iOS compatibility
      audio.srcObject = remoteStream;
      
      // Add to DOM but keep it hidden (we just want the audio)
      audio.style.display = 'none';
      document.body.appendChild(audio);
      
      // Handle when audio starts playing
      const onPlaying = () => {
        console.log('Playing audio from:', userToSignal);
        audio.removeEventListener('playing', onPlaying);
      };
      audio.addEventListener('playing', onPlaying);
    });
    
    peer.on('error', err => {
      console.error('Peer error:', err);
    });
    
    peer.on('connect', () => {
      console.log('Peer connected to:', userToSignal);
    });

    return peer;
  }

  function addPeer(incomingSignal: Peer.SignalData, callerID: string, stream: MediaStream) {
    console.log('Adding peer from signal:', callerID);
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', signal => {
      console.log('Sending signal back to:', callerID);
      socket.emit('signal', { 
        userId: callerID, 
        signal,
        from: currentUserId
      });
    });

    peer.on('stream', remoteStream => {
      console.log('Received remote stream from:', callerID);
      
      // Remove any existing audio element for this peer
      const existingAudio = document.getElementById(`audio-${callerID}`);
      if (existingAudio) {
        existingAudio.remove();
      }
      
      // Create new audio element for remote stream
      const audio = document.createElement('audio');
      audio.id = `audio-${callerID}`;
      audio.autoplay = true;
      audio.setAttribute('playsinline', ''); // For iOS compatibility
      audio.srcObject = remoteStream;
      
      // Add to DOM but keep it hidden (we just want the audio)
      audio.style.display = 'none';
      document.body.appendChild(audio);
      
      // Handle when audio starts playing
      const onPlaying = () => {
        console.log('Playing audio from:', callerID);
        audio.removeEventListener('playing', onPlaying);
      };
      audio.addEventListener('playing', onPlaying);
    });
    
    peer.on('error', err => {
      console.error('Peer error:', err);
    });
    
    peer.on('connect', () => {
      console.log('Peer connected from:', callerID);
    });

    // Handle the incoming signal
    try {
      console.log('Processing incoming signal from:', callerID);
      peer.signal(incomingSignal);
    } catch (err) {
      console.error('Error processing signal:', err);
    }

    return peer;
  }

  // Mute/unmute logic
  const toggleMute = (uid: string) => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setMuted(prev => ({ ...prev, [uid]: !prev[uid] }));
    }
  };
  
  if (loading) {
    return <div>Loading members...</div>;
  }

  // Helper to get displayName
  const getDisplayName = (m: Member) => {
    if (m.name) return m.name;
    if (m.email) return m.email.split('@')[0];
    return m.uid;
  };

  // Sort members with admins first
  const sortedMembers = [...members].sort((a, b) => {
    const aIsAdmin = isOwner(a.email || a.uid) ? 0 : 1;
    const bIsAdmin = isOwner(b.email || b.uid) ? 0 : 1;
    return aIsAdmin - bIsAdmin;
  });

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>👥</span>
        All Members <span className="text-gray-400 font-normal">({members.length})</span>
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sortedMembers.map((m) => {
          const displayName = getDisplayName(m);
          const isAdmin = isOwner(m.email || m.uid);
          return (
            <li 
              key={m.uid} 
              className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                isAdmin 
                  ? 'border-2 border-yellow-400 shadow-[0_0_8px_1px_#facc15]' 
                  : 'border border-gray-200'
              } bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative`} 
              style={{ minHeight: 140 }}
            >
              {isAdmin && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#facc15',
                  color: 'black',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 2
                }}>
                  ADMIN
                </span>
              )}
              {/* Mic Icon (clickable) */}
              <button
                type="button"
                className="flex items-center justify-center mb-1 focus:outline-none"
                onClick={() => toggleMute(m.uid)}
                tabIndex={0}
                aria-label={muted[m.uid] ? 'Unmute' : 'Mute'}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {muted[m.uid] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1m-6-5V7a3 3 0 016 0v5m-9 4v-1a9 9 0 0118 0v1m-9 4v2m-4 0h8" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18c2.21 0 4-1.79 4-4V7a4 4 0 10-8 0v7c0 2.21 1.79 4 4 4zm6-4v-1a6 6 0 10-12 0v1m6 4v2m-4 0h8" />
                  </svg>
                )}
              </button>
              {/* Avatar Initials */}
              <div className="w-12 h-12 mb-2 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 w-full flex flex-col items-center">
                <div className="font-bold text-gray-800 text-base mb-0.5 text-center break-words max-w-[110px] leading-tight" style={{wordBreak: 'break-word'}}>
                  {displayName}
                </div>
              </div>
              {/* Email */}
              {m.email && (
                <span
                  className="text-xs text-gray-500 text-center truncate w-full"
                  title={m.email}
                >
                  {m.email}
                </span>
              )}
              {m.uid === currentUserId && (
                <span className="block text-xs text-blue-500 font-medium mt-1">
                  (You)
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <audio ref={userAudio} autoPlay muted />
    </div>
  );
} 