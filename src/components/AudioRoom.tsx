// src/components/AudioRoom.tsx
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer, { Instance as PeerInstance, SignalData } from 'simple-peer';

const socket = io('http://localhost:5000');

interface AudioRoomProps {
  roomId: string;
  userId: string;
}

interface PeerRef {
  peerID: string;
  peer: PeerInstance;
}

function AudioRoom({ roomId, userId }: AudioRoomProps) {
  // Audio element ref is kept for future audio control
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const peersRef = useRef<PeerRef[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  // Mute state and handler
  const [muted, setMuted] = useState(false);
  // Track peers state for future use when displaying connected users
  // The peers array is kept for future use when displaying connected users
  const [peers, setPeers] = useState<PeerInstance[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setStream(stream);
      if (userAudio.current) userAudio.current.srcObject = stream;
      socket.emit('join-room', roomId, userId);

      socket.on('user-connected', (otherUserId: string) => {
        const peer = createPeer(otherUserId, socket.id || '', stream);
        peersRef.current.push({ peerID: otherUserId, peer });
        setPeers((users) => [...users, peer]);
      });

      socket.on('signal', ({ userId: from, signal }: { userId: string; signal: unknown }) => {
        const item = peersRef.current.find((p) => p.peerID === from);
        if (item) {
          item.peer.signal(signal as Peer.SignalData);
        } else {
          const peer = addPeer(signal as Peer.SignalData, from, stream);
          peersRef.current.push({ peerID: from, peer });
          setPeers((users) => [...users, peer]);
        }
      });

      socket.on('user-disconnected', (id: string) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
        setPeers((users) => users.filter((p) => {
          const peerRef = peersRef.current.find(ref => ref.peer === p);
          return peerRef?.peerID !== id;
        }));
      });
    });
  }, [roomId, userId]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal: unknown) => {
      socket.emit('signal', { userId: userToSignal, signal });
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
    });

    return peer;
  }

  function addPeer(incomingSignal: unknown, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal: unknown) => {
      socket.emit('signal', { userId: callerID, signal });
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
    });

    peer.signal(incomingSignal as SignalData);

    return peer;
  }

  // Mute/unmute logic
  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setMuted(!enabled);
      }
    }
  };

  return (
    <div className="audio-room">
      <div className="audio-controls">
        <button 
          onClick={toggleMute}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <div className="connected-users">
          Connected: {peers.length} user{peers.length !== 1 ? 's' : ''}
        </div>
      </div>
      <audio ref={userAudio} autoPlay muted={muted} />
    </div>
  );
}

export default AudioRoom;
