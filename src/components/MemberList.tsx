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
      { uid: '5', name: 'Alice Johnson', status: 'offline', role: 'member' },
      { uid: '6', name: 'Charlie Brown', status: 'online', role: 'member' },
      { uid: '7', name: 'Diana Prince', status: 'online', role: 'admin' },
      { uid: '8', name: 'Eve Adams', status: 'offline', role: 'member' },
    ];

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>👥</span>
          All Members ({demoMembers.length})
        </h3>
        <p className="text-sm text-gray-500 mb-4">Using demo data - enable Realtime Database for live updates</p>
        
        {/* Online Members */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Online ({demoMembers.filter(m => m.status === 'online').length})
          </h4>
          <ul className="space-y-2">
            {demoMembers.filter(m => m.status === 'online' && m.role === 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="text-lg">👑</span>
                <div className="flex-1">
                  <span className="font-semibold text-indigo-700">{m.name}</span>
                  {m.uid === currentUserId && <span className="text-xs text-indigo-500 ml-1">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </li>
            ))}
            {demoMembers.filter(m => m.status === 'online' && m.role !== 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-100">
                <span className="text-lg">👤</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{m.name}</span>
                  {m.uid === currentUserId && <span className="text-xs text-green-500 ml-1">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Offline Members */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Offline ({demoMembers.filter(m => m.status === 'offline').length})
          </h4>
          <ul className="space-y-2">
            {demoMembers.filter(m => m.status === 'offline' && m.role === 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
                <span className="text-lg">👑</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-600">{m.name}</span>
                  {m.uid === currentUserId && <span className="text-xs text-gray-500 ml-1">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              </li>
            ))}
            {demoMembers.filter(m => m.status === 'offline' && m.role !== 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
                <span className="text-lg">👤</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-500">{m.name}</span>
                  {m.uid === currentUserId && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>👥</span>
        All Members ({members.length})
      </h3>
      
      {/* Online Members */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Online ({members.filter(m => m.status === 'online').length})
        </h4>
        <ul className="space-y-2">
          {members.filter(m => m.status === 'online' && m.role === 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
              <span className="text-lg">👑</span>
              <div className="flex-1">
                <span className="font-semibold text-indigo-700">{m.name}</span>
                {m.uid === currentUserId && <span className="text-xs text-indigo-500 ml-1">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </li>
          ))}
          {members.filter(m => m.status === 'online' && m.role !== 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-100">
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <span className="font-medium text-gray-700">{m.name}</span>
                {m.uid === currentUserId && <span className="text-xs text-green-500 ml-1">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Offline Members */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          Offline ({members.filter(m => m.status === 'offline').length})
        </h4>
        <ul className="space-y-2">
          {members.filter(m => m.status === 'offline' && m.role === 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
              <span className="text-lg">👑</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-600">{m.name}</span>
                {m.uid === currentUserId && <span className="text-xs text-gray-500 ml-1">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </li>
          ))}
          {members.filter(m => m.status === 'offline' && m.role !== 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <span className="font-medium text-gray-500">{m.name}</span>
                {m.uid === currentUserId && <span className="text-xs text-gray-400 ml-1">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 