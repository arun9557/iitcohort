import { ref, set, onValue, off, remove } from 'firebase/database';
import { database } from '../firebase/config';

type SignalType = 'offer' | 'answer' | 'candidate' | 'hangup';

interface Signal {
  type: SignalType;
  from: string;
  to: string;
  data: any;
  timestamp: number;
}

type SignalCallback = (signal: Signal) => void;

export class FirebaseSignalingService {
  private roomId: string;
  private userId: string;
  private signalRef: ReturnType<typeof ref> | null = null;
  private signalListeners: Set<SignalCallback> = new Set();

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  // Initialize the signaling service
  initialize() {
    this.signalRef = ref(database, `signals/${this.roomId}`);
    
    // Listen for incoming signals
    onValue(this.signalRef, (snapshot) => {
      const signals = snapshot.val() || {};
      
      // Process each signal
      Object.entries(signals).forEach(([signalId, signalData]) => {
        const signal = signalData as Signal;
        
        // Only process signals meant for the current user
        if (signal.to === this.userId) {
          // Notify listeners
          this.signalListeners.forEach(callback => callback(signal));
          
          // Remove the signal after processing
          this.removeSignal(signalId);
        }
      });
    });
  }

  // Clean up resources
  cleanup() {
    if (this.signalRef) {
      off(this.signalRef);
      this.signalRef = null;
    }
    this.signalListeners.clear();
  }

  // Add a signal listener
  onSignal(callback: SignalCallback): () => void {
    this.signalListeners.add(callback);
    return () => this.signalListeners.delete(callback);
  }

  // Send a signal to a specific user
  async sendSignal(type: SignalType, to: string, data: any) {
    if (!this.signalRef) return;

    const signal: Signal = {
      type,
      from: this.userId,
      to,
      data,
      timestamp: Date.now()
    };

    // Create a new signal entry
    const newSignalRef = ref(database, `signals/${this.roomId}/${Date.now()}_${this.userId}_${to}`);
    await set(newSignalRef, signal);
  }

  // Remove a processed signal
  private async removeSignal(signalId: string) {
    if (!this.signalRef) return;
    const signalToRemoveRef = ref(database, `signals/${this.roomId}/${signalId}`);
    await remove(signalToRemoveRef);
  }

  // Send an offer to start a WebRTC connection
  sendOffer(to: string, offer: RTCSessionDescriptionInit) {
    return this.sendSignal('offer', to, { sdp: offer });
  }

  // Send an answer to an offer
  sendAnswer(to: string, answer: RTCSessionDescriptionInit) {
    return this.sendSignal('answer', to, { sdp: answer });
  }

  // Send ICE candidate
  sendIceCandidate(to: string, candidate: RTCIceCandidate) {
    return this.sendSignal('candidate', to, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    });
  }

  // Notify other user to hang up
  sendHangup(to: string) {
    return this.sendSignal('hangup', to, {});
  }
}
