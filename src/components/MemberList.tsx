'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // apne config ke hisab se

interface Member {
  uid: string;
  name?: string;
  email?: string;
}

export default function MemberList({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Local mute state for each member (UI only)
  const [muted, setMuted] = useState<{ [uid: string]: boolean }>({});

  const toggleMute = useCallback((uid: string) => {
    setMuted(prev => ({ ...prev, [uid]: !prev[uid] }));
  }, []);

  useEffect(() => {
    // Firestore se users fetch karo
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
            }));
            setMembers(list);
            setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div>Loading members...</div>;
  }

  // Define special members (order matters)
  const specialOrder = [
    { key: 'arun2061292007' },
    { key: 'arunshekhram' },
    { key: 'meettomar07' },
    { key: 'ashishkrs1977' },
    { key: 'shubham229177' },
  ];

  // Helper to get displayName
  const getDisplayName = (m: Member) => {
    if (m.name) return m.name;
    if (m.email) return m.email.split('@')[0];
    return m.uid;
  };

  // Split members into special and others
  const specialMembers = specialOrder
    .map(s => members.find(m => getDisplayName(m) === s.key))
    .filter((m): m is Member => Boolean(m)); // TypeScript type guard

  const otherMembers = members.filter(
    m => !specialOrder.some(s => getDisplayName(m) === s.key)
  );

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>👥</span>
        All Members <span className="text-gray-400 font-normal">({members.length})</span>
      </h3>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Special members first */}
        {specialMembers.map((m) => {
          const displayName = getDisplayName(m);
          return (
            <li key={m.uid} className={`flex flex-col items-center justify-center p-4 rounded-xl shadow border-2 border-yellow-400 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative`} style={{ minHeight: 140, boxShadow: '0 0 8px 1px #facc15' }}>
              {/* Tag */}
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#facc15',
                color: 'black',
                borderRadius: '8px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2
              }}>Owner</span>
              {/* Mic Icon (clickable) */}
              <button
                type="button"
                className="flex items-center justify-center mb-1 focus:outline-none"
                onClick={() => toggleMute(m.uid)}
                tabIndex={0}
                aria-label={muted[m.uid] ? 'Unmute' : 'Mute'}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {muted[m.uid] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1m-6-5V7a3 3 0 016 0v5m-9 4v-1a9 9 0 0118 0v1m-9 4v2m-4 0h8" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18c2.21 0 4-1.79 4-4V7a4 4 0 10-8 0v7c0 2.21 1.79 4 4 4zm6-4v-1a6 6 0 10-12 0v1m6 4v2m-4 0h8" />
                  </svg>
                )}
              </button>
              {/* Avatar Initials */}
              <div className="w-12 h-12 mb-2 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 w-full flex flex-col items-center">
                <div className="font-bold text-gray-800 text-base mb-0.5 text-center break-words max-w-[110px] leading-tight" style={{wordBreak: 'break-word'}}>{displayName}</div>
                {m.email && <div className="text-xs text-gray-400 text-center truncate max-w-[110px]">{m.email}</div>}
                {m.uid === currentUserId && <span className="block text-xs text-blue-500 font-medium mt-1">(You)</span>}
              </div>
            </li>
          );
        })}
        {/* Other members */}
        {otherMembers.map(m => {
          const displayName = getDisplayName(m);
          return (
            <li key={m.uid} className={`flex flex-col items-center justify-center p-4 rounded-xl shadow border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${m.uid === currentUserId ? 'ring-2 ring-blue-400' : ''}`}
                style={{ minHeight: 140 }}>
              {/* Mic Icon (clickable) */}
              <button
                type="button"
                className="flex items-center justify-center mb-1 focus:outline-none"
                onClick={() => toggleMute(m.uid)}
                tabIndex={0}
                aria-label={muted[m.uid] ? 'Unmute' : 'Mute'}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {muted[m.uid] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1m-6-5V7a3 3 0 016 0v5m-9 4v-1a9 9 0 0118 0v1m-9 4v2m-4 0h8" />
                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18c2.21 0 4-1.79 4-4V7a4 4 0 10-8 0v7c0 2.21 1.79 4 4 4zm6-4v-1a6 6 0 10-12 0v1m6 4v2m-4 0h8" />
                  </svg>
                )}
              </button>
              {/* Avatar Initials */}
              <div className="w-12 h-12 mb-2 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 w-full flex flex-col items-center">
                <div className="font-bold text-gray-800 text-base mb-0.5 text-center break-words max-w-[110px] leading-tight" style={{wordBreak: 'break-word'}}>{displayName}</div>
                {m.email && <div className="text-xs text-gray-400 text-center truncate max-w-[110px]">{m.email}</div>}
                {m.uid === currentUserId && <span className="block text-xs text-blue-500 font-medium mt-1">(You)</span>}
              </div>
            </li>
          );
        })}
        </ul>
    </div>
  );
} 