// src/components/AudioRoom.tsx
import React, { useEffect, useRef, useState, RefObject } from 'react';
import io from 'socket.io-client';
import Peer, { Instance as PeerInstance } from 'simple-peer';

const socket = io('http://localhost:5000'); // Apne signaling server ka URL daalein

interface AudioRoomProps {
  roomId: string;
  userId: string;
}

interface PeerRef {
  peerID: string;
  peer: PeerInstance;
}

function AudioRoom({ roomId, userId }: AudioRoomProps) {
  const [peers, setPeers] = useState<PeerInstance[]>([]);
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const peersRef = useRef<PeerRef[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);

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

      socket.on('signal', ({ userId: from, signal }: { userId: string; signal: any }) => {
        const item = peersRef.current.find((p) => p.peerID === from);
        if (item) {
          item.peer.signal(signal);
        } else {
          const peer = addPeer(signal, from, stream);
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
        setPeers((users) => users.filter((p) => (p as any).peerID !== id));
      });
    });
  }, [roomId, userId]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal: any) => {
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

  function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal: any) => {
      socket.emit('signal', { userId: callerID, signal });
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
    });

    peer.signal(incomingSignal);

    return peer;
  }

  // Mute/unmute logic
  const toggleMute = () => {
    if (stream) {
      const enabled = !stream.getAudioTracks()[0].enabled;
      stream.getAudioTracks()[0].enabled = enabled;
      setMuted(!enabled);
    }
  };

  return (
    <div>
      <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
      <audio ref={userAudio} autoPlay muted />
      {/* Yahan aap connected users ki list bhi dikha sakte hain */}
    </div>
  );
}

export default AudioRoom;
