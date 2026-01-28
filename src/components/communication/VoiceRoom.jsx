import { useRef } from 'react';
export default function VoiceRoom({ roomName = "IITJodhpurBatchVoiceRoom" }) {
    const containerRef = useRef(null);
    // Fullscreen handler
    const handleFullScreen = () => {
        const elem = containerRef.current;
        if (elem) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            else if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
        }
    };
    return (<div ref={containerRef} className="w-full min-h-[70vh] h-full relative bg-black rounded shadow" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Full Screen Button */}
      <button onClick={handleFullScreen} className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-gray-800 px-3 py-1 rounded shadow border border-gray-300 transition" title="Full Screen">
        ⛶ Full Screen
      </button>
      <iframe src={`https://meet.jit.si/${roomName}`} className="w-full h-full min-h-[60vh] border rounded" allow="camera; microphone; fullscreen; display-capture" title="Voice Chat Room" style={{ flex: 1 }}></iframe>
    </div>);
}
