import { ref, set, onValue, off, remove, push, serverTimestamp } from 'firebase/database';
import { realtimeDb as database } from '../firebase';

type SignalType = 'offer' | 'answer' | 'candidate' | 'hangup' | 'user-joined' | 'user-left';

interface Signal {
  type: SignalType;
  from: string;
  to: string;
  data: any;
  timestamp: number;
  id?: string;
}

type SignalCallback = (signal: Signal) => void;
type UserPresenceCallback = (userId: string, isOnline: boolean) => void;

export class FirebaseSignalingService {
  private roomId: string;
  private userId: string;
  private signalRef: ReturnType<typeof ref> | null = null;
  private presenceRef: ReturnType<typeof ref> | null = null;
  private signalListeners: Set<SignalCallback> = new Set();
  private presenceListeners: Set<UserPresenceCallback> = new Set();
  private processedSignals: Set<string> = new Set();

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  // Initialize the signaling service
  initialize() {
    if (!database) {
      console.error('Realtime Database not available');
      return;
    }
    
    this.signalRef = ref(database, `voice-signals/${this.roomId}`);
    this.presenceRef = ref(database, `voice-presence/${this.roomId}`);
    
    // Listen for incoming signals
    onValue(this.signalRef, (snapshot) => {
      const signals = snapshot.val() || {};
      
      // Process each signal
      Object.entries(signals).forEach(([signalId, signalData]) => {
        const signal = signalData as Signal;
        
        // Skip if already processed
        if (this.processedSignals.has(signalId)) return;
        
        // Only process signals meant for the current user
        if (signal.to === this.userId) {
          this.processedSignals.add(signalId);
          
          // Notify listeners
          this.signalListeners.forEach(callback => callback(signal));
          
          // Remove the signal after processing (with delay to ensure delivery)
          setTimeout(() => this.removeSignal(signalId), 1000);
        }
      });
    });

    // Set user presence
    this.setUserPresence(true);
    
    // Listen for user presence changes
    onValue(this.presenceRef, (snapshot) => {
      const presence = snapshot.val() || {};
      Object.entries(presence).forEach(([userId, userData]) => {
        if (userId !== this.userId) {
          const isOnline = (userData as any)?.online === true;
          this.presenceListeners.forEach(callback => callback(userId, isOnline));
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
    if (this.presenceRef) {
      off(this.presenceRef);
      this.presenceRef = null;
    }
    
    // Set user as offline
    this.setUserPresence(false);
    
    this.signalListeners.clear();
    this.presenceListeners.clear();
    this.processedSignals.clear();
  }

  // Add a signal listener
  onSignal(callback: SignalCallback): () => void {
    this.signalListeners.add(callback);
    return () => this.signalListeners.delete(callback);
  }

  // Add a presence listener
  onPresenceChange(callback: UserPresenceCallback): () => void {
    this.presenceListeners.add(callback);
    return () => this.presenceListeners.delete(callback);
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

    try {
      // Create a new signal entry with push for unique ID
      const newSignalRef = push(this.signalRef);
      await set(newSignalRef, signal);
    } catch (error) {
      console.error('Failed to send signal:', error);
      throw error;
    }
  }

  // Set user presence
  private async setUserPresence(online: boolean) {
    if (!this.presenceRef || !database) return;

    const userPresenceRef = ref(database, `voice-presence/${this.roomId}/${this.userId}`);
    if (online) {
      await set(userPresenceRef, {
        online: true,
        lastSeen: serverTimestamp()
      });
    } else {
      await set(userPresenceRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
    }
  }

  // Remove a processed signal
  private async removeSignal(signalId: string) {
    if (!this.signalRef || !database) return;
    const signalToRemoveRef = ref(database, `voice-signals/${this.roomId}/${signalId}`);
    try {
      await remove(signalToRemoveRef);
    } catch (error) {
      console.warn('Failed to remove signal:', error);
    }
  }

  // Send an offer to start a WebRTC connection
  sendOffer(to: string, offer: RTCSessionDescriptionInit) {
    return this.sendSignal('offer', to, offer);
  }

  // Send an answer to an offer
  sendAnswer(to: string, answer: RTCSessionDescriptionInit) {
    return this.sendSignal('answer', to, answer);
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

  // Broadcast user joined
  broadcastUserJoined() {
    return this.sendSignal('user-joined', 'all', { userId: this.userId });
  }

  // Broadcast user left
  broadcastUserLeft() {
    return this.sendSignal('user-left', 'all', { userId: this.userId });
  }
}
