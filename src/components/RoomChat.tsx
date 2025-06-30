'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Timestamp;
}

export default function RoomChat({ roomId, currentUser }: { roomId: string; currentUser: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Message);
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    await addDoc(collection(db, `rooms/${roomId}/messages`), {
      user: currentUser,
      text: message,
      timestamp: Timestamp.now(),
    });
    setMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-semibold">{msg.user}:</span> <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1 rounded-lg text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
} 