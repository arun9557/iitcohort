'use client';

export default function VoiceRoom({ roomName = "IITJodhpurBatchVoiceRoom" }) {
  return (
    <div className="w-full h-[500px]">
      <iframe
        src={`https://meet.jit.si/${roomName}`}
        className="w-full h-full border rounded"
        allow="camera; microphone; fullscreen; display-capture"
        title="Voice Chat Room"
      ></iframe>
    </div>
  );
} 