'use client';
import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send } from 'lucide-react';
import { isOwner } from '../utils/auth';
export default function RoomChat({ roomId, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [roomId]);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const sendMessage = async () => {
        if (!message.trim())
            return;
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
            user: currentUser,
            text: message,
            timestamp: Timestamp.now(),
        });
        setMessage('');
    };
    // Debug: Log message info including admin status when messages change
    useEffect(() => {
        if (messages.length > 0) {
            console.log('Current messages in RoomChat:', messages);
            messages.forEach(msg => {
                console.log(`Message from ${msg.user}, isAdmin: ${isOwner(msg.user)}`);
            });
        }
    }, [messages]);
    // isOwner function is imported from auth utility
    return (<div className="bg-gray-50 rounded-xl shadow p-4 flex flex-col h-full border border-gray-200 relative">
      <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar pr-1">
        {messages.map((msg) => (<div key={msg.id} className="mb-3 flex">
            <div className="bg-white rounded-2xl shadow-sm px-4 py-2 max-w-[80%] hover:shadow-md transition-all border border-gray-100 flex items-center gap-2">
              <span className="font-semibold text-blue-600">{msg.user}</span>
              {isOwner(msg.user) && (<span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">ADMIN</span>)}
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-900">{msg.text}</span>
            </div>
          </div>))}
        <div ref={messagesEndRef}/>
      </div>
      <div className="sticky bottom-0 left-0 w-full bg-transparent z-10 pt-2">
        <div className="flex gap-2 items-center bg-white rounded-2xl shadow px-3 py-2 border border-gray-200">
          <input className="flex-1 bg-transparent border-0 text-gray-900 text-sm placeholder-gray-400 focus:ring-0 focus:outline-none" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()}/>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition flex items-center gap-1 shadow" onClick={sendMessage}>
            <Send className="w-4 h-4 mr-1"/> Send
          </button>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>);
}
