import { ref, set, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';

export interface RTCConfig {
  iceServers: RTCIceServer[];
}

export const rtcConfig: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

type TrackEvent = (stream: MediaStream) => void;
type IceCandidateEvent = (candidate: RTCIceCandidate, targetUserId: string) => void;

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onTrackCallbacks: TrackEvent[] = [];
  private onIceCandidateCallbacks: IceCandidateEvent[] = [];
  
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false // Voice only
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    // Close existing connection if any
    this.closePeerConnection(userId);

    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      this.onTrackCallbacks.forEach(callback => {
        callback(event.streams[0]);
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidateCallbacks.forEach(callback => {
          callback(event.candidate!, userId);
        });
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  onTrack(callback: TrackEvent) {
    this.onTrackCallbacks.push(callback);
    return () => {
      this.onTrackCallbacks = this.onTrackCallbacks.filter(cb => cb !== callback);
    };
  }

  onIceCandidate(callback: IceCandidateEvent) {
    this.onIceCandidateCallbacks.push(callback);
    return () => {
      this.onIceCandidateCallbacks = this.onIceCandidateCallbacks.filter(cb => cb !== callback);
    };
  }

  closePeerConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((_, userId) => {
      this.closePeerConnection(userId);
    });
  }

  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error('Peer connection not found');
    }
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(userId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId) || this.createPeerConnection(userId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async setRemoteDescription(userId: string, description: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(userId) || this.createPeerConnection(userId);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}
