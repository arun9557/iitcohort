'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../firebase';

interface Member {
  uid: string;
  name: string;
  email?: string;
  status: 'online' | 'offline';
  role?: 'admin' | 'member';
  lastSignInTime?: string;
}

export default function MemberList({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAuthenticatedUsers = async () => {
      try {
        setLoading(true);
        
        // Get online users from Realtime Database
        const onlineUsers = new Map<string, { status: string; role?: string }>();
        
        if (realtimeDb) {
          const membersRef = ref(realtimeDb, 'users');
          const snapshot = await new Promise<unknown>((resolve) => {
            const unsubscribe = onValue(membersRef, (snapshot) => {
              unsubscribe();
              resolve(snapshot);
            });
          });
          // Type assertion for snapshot
          const data = (snapshot as any).val ? (snapshot as any).val() || {} : {};
          Object.entries(data).forEach(([uid, info]: [string, unknown]) => {
            onlineUsers.set(uid, {
              status: (info as { status: string }).status,
              role: (info as { role?: string }).role
            });
          });
        }

        // For now, we'll use the existing Realtime Database approach
        // since Firebase Admin SDK (required for listUsers) can't be used in client-side code
        // The sync-auth-to-db.js script should be run periodically to sync all auth users
        
        if (realtimeDb) {
          const membersRef = ref(realtimeDb, 'users');
          const unsubscribe = onValue(membersRef, (snapshot) => {
            const data = snapshot.val() || {};
            const list: Member[] = Object.entries(data).map(([uid, info]: [string, unknown]) => ({
              uid,
              name: (info as { name: string }).name,
              email: (info as { email?: string }).email,
              status: (info as { status: string }).status as 'online' | 'offline',
              role: ((info as { role?: string }).role as 'admin' | 'member') || 'member',
              lastSignInTime: (info as { lastSignInTime?: string }).lastSignInTime,
            }));
            setMembers(list);
            setLoading(false);
          }, (error) => {
            console.error('Database error:', error);
            setError('Failed to load members');
            setLoading(false);
          });
          
          return () => unsubscribe();
        } else {
          setError('Realtime Database not available');
          setLoading(false);
        }
      } catch (err) {
        console.error('MemberList error:', err);
        setError('Failed to load members');
        setLoading(false);
      }
    };

    fetchAllAuthenticatedUsers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>👥</span>
          All Members
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading members...</span>
        </div>
      </div>
    );
  }

  // Show demo data if database is not available
  if (error) {
    const demoMembers: Member[] = [
      { uid: '1', name: 'Admin User', email: 'admin@iitj.ac.in', status: 'online', role: 'admin' },
      { uid: '2', name: 'John Doe', email: 'john@iitj.ac.in', status: 'online', role: 'member' },
      { uid: '3', name: 'Jane Smith', email: 'jane@iitj.ac.in', status: 'offline', role: 'member' },
      { uid: '4', name: 'Bob Wilson', email: 'bob@iitj.ac.in', status: 'online', role: 'member' },
      { uid: '5', name: 'Alice Johnson', email: 'alice@iitj.ac.in', status: 'offline', role: 'member' },
      { uid: '6', name: 'Charlie Brown', email: 'charlie@iitj.ac.in', status: 'online', role: 'member' },
      { uid: '7', name: 'Diana Prince', email: 'diana@iitj.ac.in', status: 'online', role: 'admin' },
      { uid: '8', name: 'Eve Adams', email: 'eve@iitj.ac.in', status: 'offline', role: 'member' },
      { uid: '9', name: 'Frank Miller', email: 'frank@iitj.ac.in', status: 'online', role: 'member' },
      { uid: '10', name: 'Grace Lee', email: 'grace@iitj.ac.in', status: 'offline', role: 'member' },
      { uid: '11', name: 'Henry Davis', email: 'henry@iitj.ac.in', status: 'online', role: 'member' },
      { uid: '12', name: 'Ivy Chen', email: 'ivy@iitj.ac.in', status: 'offline', role: 'member' },
    ];

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>👥</span>
          All Members ({demoMembers.length})
        </h3>
        <p className="text-sm text-gray-500 mb-4">Using demo data - run sync-auth-to-db.js to sync all authenticated users</p>
        
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
                  <div className="font-semibold text-indigo-700">{m.name}</div>
                  <div className="text-xs text-indigo-500">{m.email}</div>
                  {m.uid === currentUserId && <span className="text-xs text-indigo-500">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </li>
            ))}
            {demoMembers.filter(m => m.status === 'online' && m.role !== 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-100">
                <span className="text-lg">👤</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.email}</div>
                  {m.uid === currentUserId && <span className="text-xs text-green-500">(You)</span>}
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
                  <div className="font-semibold text-gray-600">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                  {m.uid === currentUserId && <span className="text-xs text-gray-500">(You)</span>}
                </div>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              </li>
            ))}
            {demoMembers.filter(m => m.status === 'offline' && m.role !== 'admin').map(m => (
              <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
                <span className="text-lg">👤</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-500">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                  {m.uid === currentUserId && <span className="text-xs text-gray-400">(You)</span>}
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
                <div className="font-semibold text-indigo-700">{m.name}</div>
                {m.email && <div className="text-xs text-indigo-500">{m.email}</div>}
                {m.uid === currentUserId && <span className="text-xs text-indigo-500">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </li>
          ))}
          {members.filter(m => m.status === 'online' && m.role !== 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-100">
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <div className="font-medium text-gray-700">{m.name}</div>
                {m.email && <div className="text-xs text-gray-500">{m.email}</div>}
                {m.uid === currentUserId && <span className="text-xs text-green-500">(You)</span>}
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
                <div className="font-semibold text-gray-600">{m.name}</div>
                {m.email && <div className="text-xs text-gray-400">{m.email}</div>}
                {m.uid === currentUserId && <span className="text-xs text-gray-500">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </li>
          ))}
          {members.filter(m => m.status === 'offline' && m.role !== 'admin').map(m => (
            <li key={m.uid} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
              <span className="text-lg">👤</span>
              <div className="flex-1">
                <div className="font-medium text-gray-500">{m.name}</div>
                {m.email && <div className="text-xs text-gray-400">{m.email}</div>}
                {m.uid === currentUserId && <span className="text-xs text-gray-400">(You)</span>}
              </div>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 