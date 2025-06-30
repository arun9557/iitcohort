'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../firebase';

interface Member {
  uid: string;
  name: string;
  status: 'online' | 'offline';
  role?: 'admin' | 'member';
}

export default function MemberList({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if realtimeDb is available
      if (!realtimeDb) {
        setError('Realtime Database not available');
        return;
      }

      const membersRef = ref(realtimeDb, 'users');
      const unsubscribe = onValue(membersRef, (snapshot) => {
        const data = snapshot.val() || {};
        const list: Member[] = Object.entries(data).map(([uid, info]: [string, unknown]) => ({
          uid,
          name: (info as { name: string }).name,
          status: (info as { status: string }).status as 'online' | 'offline',
          role: ((info as { role?: string }).role as 'admin' | 'member') || 'member',
        }));
        setMembers(list);
      }, (error) => {
        console.error('Database error:', error);
        setError('Failed to load members');
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('MemberList error:', err);
      setError('Database not configured');
    }
  }, []);

  // Show demo data if database is not available
  if (error) {
    const demoMembers: Member[] = [
      { uid: '1', name: 'Admin User', status: 'online', role: 'admin' },
      { uid: '2', name: 'John Doe', status: 'online', role: 'member' },
      { uid: '3', name: 'Jane Smith', status: 'offline', role: 'member' },
      { uid: '4', name: 'Bob Wilson', status: 'online', role: 'member' },
    ];

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4">Members (Demo)</h3>
        <p className="text-sm text-gray-500 mb-4">Using demo data - enable Realtime Database for live updates</p>
        <ul className="space-y-2">
          {demoMembers.filter(m => m.role === 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-2 font-semibold text-indigo-700">
              <span>👑</span>
              <span>{m.name} {m.uid === currentUserId && '(You)'}</span>
              <span className={m.status === 'online' ? 'text-green-500' : 'text-gray-400'}>
                ● {m.status}
              </span>
            </li>
          ))}
          {demoMembers.filter(m => m.role !== 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-2">
              <span>👤</span>
              <span>{m.name} {m.uid === currentUserId && '(You)'}</span>
              <span className={m.status === 'online' ? 'text-green-500' : 'text-gray-400'}>
                ● {m.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">Members</h3>
      <ul className="space-y-2">
        {members.filter(m => m.role === 'admin').map(m => (
          <li key={m.uid} className="flex items-center gap-2 font-semibold text-indigo-700">
            <span>👑</span>
            <span>{m.name} {m.uid === currentUserId && '(You)'}</span>
            <span className={m.status === 'online' ? 'text-green-500' : 'text-gray-400'}>
              ● {m.status}
            </span>
          </li>
        ))}
        {members.filter(m => m.role !== 'admin').map(m => (
          <li key={m.uid} className="flex items-center gap-2">
            <span>👤</span>
            <span>{m.name} {m.uid === currentUserId && '(You)'}</span>
            <span className={m.status === 'online' ? 'text-green-500' : 'text-gray-400'}>
              ● {m.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 