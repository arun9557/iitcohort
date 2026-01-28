import { ref, set, onValue, off, remove, push, serverTimestamp } from 'firebase/database';
import { realtimeDb as database } from '../firebase';
export class FirebaseSignalingService {
    roomId;
    userId;
    signalRef = null;
    presenceRef = null;
    signalListeners = new Set();
    presenceListeners = new Set();
    processedSignals = new Set();
    constructor(roomId, userId) {
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
                const signal = signalData;
                // Skip if already processed
                if (this.processedSignals.has(signalId))
                    return;
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
                    const isOnline = userData?.online === true;
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
    onSignal(callback) {
        this.signalListeners.add(callback);
        return () => this.signalListeners.delete(callback);
    }
    // Add a presence listener
    onPresenceChange(callback) {
        this.presenceListeners.add(callback);
        return () => this.presenceListeners.delete(callback);
    }
    // Send a signal to a specific user
    async sendSignal(type, to, data) {
        if (!this.signalRef)
            return;
        const signal = {
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
        }
        catch (error) {
            console.error('Failed to send signal:', error);
            throw error;
        }
    }
    // Set user presence
    async setUserPresence(online) {
        if (!this.presenceRef || !database)
            return;
        const userPresenceRef = ref(database, `voice-presence/${this.roomId}/${this.userId}`);
        if (online) {
            await set(userPresenceRef, {
                online: true,
                lastSeen: serverTimestamp()
            });
        }
        else {
            await set(userPresenceRef, {
                online: false,
                lastSeen: serverTimestamp()
            });
        }
    }
    // Remove a processed signal
    async removeSignal(signalId) {
        if (!this.signalRef || !database)
            return;
        const signalToRemoveRef = ref(database, `voice-signals/${this.roomId}/${signalId}`);
        try {
            await remove(signalToRemoveRef);
        }
        catch (error) {
            console.warn('Failed to remove signal:', error);
        }
    }
    // Send an offer to start a WebRTC connection
    sendOffer(to, offer) {
        return this.sendSignal('offer', to, offer);
    }
    // Send an answer to an offer
    sendAnswer(to, answer) {
        return this.sendSignal('answer', to, answer);
    }
    // Send ICE candidate
    sendIceCandidate(to, candidate) {
        return this.sendSignal('candidate', to, {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
        });
    }
    // Notify other user to hang up
    sendHangup(to) {
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
