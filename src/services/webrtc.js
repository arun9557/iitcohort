export const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};
export class WebRTCService {
    peerConnections = new Map();
    localStream = null;
    onTrackCallbacks = [];
    onIceCandidateCallbacks = [];
    onConnectionStateCallbacks = [];
    audioContext = null;
    analyser = null;
    dataArray = null;
    async initializeLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1,
                },
                video: false // Voice only
            });
            // Initialize audio context for level monitoring
            this.initializeAudioContext();
            return this.localStream;
        }
        catch (error) {
            console.error('Error accessing microphone:', error);
            throw new Error(`Failed to access microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    initializeAudioContext() {
        if (!this.localStream)
            return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.localStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            source.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }
        catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }
    createPeerConnection(userId) {
        // Close existing connection if any
        this.closePeerConnection(userId);
        const peerConnection = new RTCPeerConnection(rtcConfig);
        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }
        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            this.onTrackCallbacks.forEach(callback => {
                callback(event.streams[0], userId);
            });
        };
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.onIceCandidateCallbacks.forEach(callback => {
                    callback(event.candidate, userId);
                });
            }
        };
        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            this.onConnectionStateCallbacks.forEach(callback => {
                callback(peerConnection.connectionState, userId);
            });
        };
        // Handle ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state for ${userId}:`, peerConnection.iceConnectionState);
        };
        this.peerConnections.set(userId, peerConnection);
        return peerConnection;
    }
    onTrack(callback) {
        this.onTrackCallbacks.push(callback);
        return () => {
            this.onTrackCallbacks = this.onTrackCallbacks.filter(cb => cb !== callback);
        };
    }
    onIceCandidate(callback) {
        this.onIceCandidateCallbacks.push(callback);
        return () => {
            this.onIceCandidateCallbacks = this.onIceCandidateCallbacks.filter(cb => cb !== callback);
        };
    }
    onConnectionStateChange(callback) {
        this.onConnectionStateCallbacks.push(callback);
        return () => {
            this.onConnectionStateCallbacks = this.onConnectionStateCallbacks.filter(cb => cb !== callback);
        };
    }
    closePeerConnection(userId) {
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
    async createOffer(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (!peerConnection) {
            throw new Error('Peer connection not found');
        }
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    }
    async createAnswer(userId, offer) {
        const peerConnection = this.peerConnections.get(userId) || this.createPeerConnection(userId);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    }
    async addIceCandidate(userId, candidate) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection && peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }
    async setRemoteDescription(userId, description) {
        const peerConnection = this.peerConnections.get(userId) || this.createPeerConnection(userId);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    }
    getLocalStream() {
        return this.localStream;
    }
    stopLocalStream() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.dataArray = null;
    }
    // Get current audio level for speaking detection
    getAudioLevel() {
        if (!this.analyser || !this.dataArray)
            return 0;
        this.analyser.getByteFrequencyData(this.dataArray);
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length / 255; // Normalize to 0-1
    }
    // Check if user is currently speaking
    isSpeaking(threshold = 0.1) {
        return this.getAudioLevel() > threshold;
    }
    // Get connection state for a specific user
    getConnectionState(userId) {
        const peerConnection = this.peerConnections.get(userId);
        return peerConnection ? peerConnection.connectionState : null;
    }
    // Get all active connections
    getActiveConnections() {
        return Array.from(this.peerConnections.keys());
    }
    // Check if local stream is active
    isLocalStreamActive() {
        return this.localStream !== null && this.localStream.active;
    }
}
