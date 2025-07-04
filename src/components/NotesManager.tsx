'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCircle, FaPlus, FaBell, FaTag, FaArchive, FaTrash, FaThumbtack, FaUndo } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const sidebarItems = [
  { key: 'notes', label: 'Notes', icon: <FaTag /> },
  { key: 'reminders', label: 'Reminders', icon: <FaBell /> },
  { key: 'labels', label: 'Labels', icon: <FaTag /> },
  { key: 'archive', label: 'Archive', icon: <FaArchive /> },
  { key: 'trash', label: 'Trash', icon: <FaTrash /> },
];

const colorOptions = [
  { label: 'Yellow', className: 'bg-yellow-100' },
  { label: 'Pink', className: 'bg-pink-100' },
  { label: 'Green', className: 'bg-green-100' },
  { label: 'Blue', className: 'bg-blue-100' },
  { label: 'Purple', className: 'bg-purple-100' },
  { label: 'Red', className: 'bg-red-100' },
  { label: 'Gray', className: 'bg-gray-100' },
];

const dummyNotes = [
  {
    id: '1',
    title: 'Project Ideas',
    body: 'Build a modern dashboard with React and Tailwind.',
    pinned: true,
    label: 'Work',
    date: '2024-06-01',
    color: 'bg-yellow-100',
    checklist: null,
    archived: false,
    trashed: false,
    reminder: null,
  },
  {
    id: '2',
    title: 'Shopping List',
    body: '',
    pinned: false,
    label: 'Personal',
    date: '2024-06-02',
    color: 'bg-pink-100',
    checklist: [
      { text: 'Milk', checked: false },
      { text: 'Eggs', checked: true },
      { text: 'Bread', checked: false },
    ],
    archived: false,
    trashed: false,
    reminder: '2024-06-10',
  },
  {
    id: '3',
    title: 'Meeting Notes',
    body: 'Discuss project timeline and deliverables.',
    pinned: false,
    label: 'Work',
    date: '2024-06-03',
    color: 'bg-green-100',
    checklist: null,
    archived: true,
    trashed: false,
    reminder: null,
  },
  {
    id: '4',
    title: 'Ideas',
    body: 'Try a new color palette for the app.',
    pinned: false,
    label: 'Design',
    date: '2024-06-04',
    color: 'bg-blue-100',
    checklist: null,
    archived: false,
    trashed: true,
    reminder: null,
  },
  {
    id: '5',
    title: 'Doctor Appointment',
    body: 'Visit Dr. Sharma at 5pm.',
    pinned: false,
    label: 'Health',
    date: '2024-06-05',
    color: 'bg-purple-100',
    checklist: null,
    archived: false,
    trashed: false,
    reminder: '2024-06-11',
  },
];

type Note = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  label: string;
  date: string;
  color: string;
  checklist: { text: string; checked: boolean }[] | null;
  archived: boolean;
  trashed: boolean;
  reminder: string | null;
  visibility: 'public' | 'private';
  ownerId: string;
};

interface MasonryGridProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
  onRestore: (note: Note) => void;
  onPin: (note: Note) => void;
  onReminder: (note: Note) => void;
}

function MasonryGrid({ notes, onEdit, onArchive, onDelete, onRestore, onPin, onReminder }: MasonryGridProps) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 w-full">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`mb-4 break-inside-avoid rounded-xl shadow p-4 cursor-pointer transition-all duration-150 ${note.color} bg-white border border-gray-200 hover:scale-[1.02] group`}
          onClick={() => onEdit(note)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg text-gray-900">{note.title}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {!note.archived && !note.trashed && (
                <button onClick={() => onPin(note)} title="Pin" className="text-gray-500 hover:text-yellow-600"><FaThumbtack /></button>
              )}
              {!note.archived && !note.trashed && (
                <button onClick={() => onArchive(note)} title="Archive" className="text-gray-500 hover:text-blue-600"><FaArchive /></button>
              )}
              {!note.trashed && (
                <button onClick={() => onDelete(note)} title="Delete" className="text-gray-500 hover:text-red-600"><FaTrash /></button>
              )}
              {note.trashed && (
                <button onClick={() => onRestore(note)} title="Restore" className="text-gray-500 hover:text-green-600"><FaUndo /></button>
              )}
              {!note.trashed && (
                <button onClick={() => onReminder(note)} title="Set Reminder" className="text-gray-500 hover:text-purple-600"><FaBell /></button>
              )}
            </div>
          </div>
          {note.body && <div className="mb-2 text-sm text-gray-700">{note.body}</div>}
          {note.checklist && (
            <ul className="mb-2">
              {note.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={item.checked} readOnly className="accent-blue-500" />
                  <span className={item.checked ? 'line-through text-gray-400' : 'text-gray-700'}>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><FaTag className="inline" /> {note.label}</span>
            <span>{new Date(note.date).toLocaleTimeString()}</span>
          </div>
          {note.reminder && <div className="mt-1 text-xs text-purple-600 flex items-center gap-1"><FaBell /> {new Date(note.reminder).toLocaleTimeString()}</div>}
        </div>
      ))}
    </div>
  );
}

export default function NotesManager() {
  const [activeSidebar, setActiveSidebar] = useState<string>('notes');
  const [notes, setNotes] = useState<Note[]>(dummyNotes.map(n => ({ ...n, visibility: 'public', ownerId: '' })));
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [search, setSearch] = useState<string>('');
  const [showNew, setShowNew] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<Note>({
    id: '',
    title: '',
    body: '',
    checklist: null,
    color: colorOptions[0].className,
    label: '',
    pinned: false,
    archived: false,
    trashed: false,
    date: new Date().toISOString().slice(0, 10),
    reminder: null,
    visibility: 'public',
    ownerId: '',
  });
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore: Fetch notes (public + user's private) in real-time
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'notes'),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          body: data.body || '',
          pinned: data.pinned || false,
          label: data.label || '',
          date: data.date || '',
          color: data.color || colorOptions[0].className,
          checklist: data.checklist || null,
          archived: data.archived || false,
          trashed: data.trashed || false,
          reminder: data.reminder || null,
          visibility: data.visibility || 'public',
          ownerId: data.ownerId || '',
        } as Note;
      });
      setNotes(
        allNotes.filter(n => n.visibility === 'public' || (n.visibility === 'private' && n.ownerId === currentUser.uid))
      );
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Unique labels for Labels section
  const uniqueLabels = Array.from(new Set(notes.filter(n => !n.trashed).map(n => n.label).filter(Boolean)));

  // Filter notes by sidebar section and visibility
  let filteredNotes = notes.filter((n) => {
    // Only show public notes or private notes owned by current user
    if (n.visibility === 'private' && n.ownerId !== currentUser?.uid) return false;
    if (activeSidebar === 'notes') return !n.archived && !n.trashed;
    if (activeSidebar === 'reminders') return !!n.reminder && !n.trashed;
    if (activeSidebar === 'archive') return n.archived && !n.trashed;
    if (activeSidebar === 'trash') return n.trashed;
    if (activeSidebar === 'labels' && labelFilter) return n.label === labelFilter && !n.trashed;
    return false;
  });
  if (activeSidebar !== 'labels') setTimeout(() => setLabelFilter(null), 0);
  if (search) {
    filteredNotes = filteredNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body.toLowerCase().includes(search.toLowerCase())
    );
  }

  function handleSaveEdit(note: Note) {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    setEditNote(null);
  }

  async function handleAddNote() {
    if (!currentUser) return;
    const noteToAdd = {
      ...newNote,
      date: new Date().toISOString().slice(0, 10),
      ownerId: currentUser.uid,
    };
    const { id: _id, ...noteToAddWithoutId } = noteToAdd;
    await addDoc(collection(db, 'notes'), noteToAddWithoutId);
    setShowNew(false);
    setNewNote({
      id: '',
      title: '',
      body: '',
      checklist: null,
      color: colorOptions[0].className,
      label: '',
      pinned: false,
      archived: false,
      trashed: false,
      date: new Date().toISOString().slice(0, 10),
      reminder: null,
      visibility: 'public',
      ownerId: '',
    });
  }

  function handleArchive(note: Note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, archived: !n.archived } : n));
  }
  function handleDelete(note: Note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, trashed: true } : n));
  }
  function handleRestore(note: Note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, trashed: false, archived: false } : n));
  }
  function handlePin(note: Note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, pinned: !n.pinned } : n));
  }
  function handleReminder(note: Note) {
    const newDate = prompt('Set reminder date (YYYY-MM-DD):', note.reminder || '');
    if (newDate) setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, reminder: newDate } : n));
  }

  return (
    <div className="flex min-h-screen bg-[#f9fbfa] text-gray-900">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-2">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-150 ${activeSidebar === item.key ? 'bg-gray-100 text-yellow-600' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={() => setActiveSidebar(item.key)}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          {activeSidebar === 'labels' && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Labels</div>
              {uniqueLabels.length === 0 && <div className="text-xs text-gray-400">No labels</div>}
              {uniqueLabels.map((label) => (
                <button
                  key={label}
                  className={`block w-full text-left px-4 py-1 rounded hover:bg-gray-100 ${labelFilter === label ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}
                  onClick={() => setLabelFilter(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <FaSearch className="text-gray-400" />
            <input
              className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 px-2 py-1"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FaUserCircle className="text-3xl text-gray-400 ml-6" />
        </header>

        {/* Notes Grid */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f9fbfa]">
          <MasonryGrid
            notes={filteredNotes}
            onEdit={(note: Note) => setEditNote(note)}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPin={handlePin}
            onReminder={handleReminder}
          />
        </main>
      </div>

      {/* Floating New Note Button */}
      <button
        className="fixed bottom-8 right-8 bg-yellow-400 text-gray-900 rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-yellow-300 transition-all z-50"
        onClick={() => setShowNew(true)}
      >
        <FaPlus /> New Note
      </button>

      {/* Edit Note Modal */}
      {editNote && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <input
              className="w-full bg-transparent border-b border-gray-300 text-gray-900 text-lg font-bold mb-2 outline-none"
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value } as Note)}
              placeholder="Title"
            />
            <textarea
              className="w-full bg-transparent border-b border-gray-300 text-gray-800 mb-2 outline-none min-h-[60px]"
              value={editNote.body}
              onChange={(e) => setEditNote({ ...editNote, body: e.target.value } as Note)}
              placeholder="Take a note..."
            />
            <div className="flex items-center gap-2 mt-2">
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
                value={editNote.color}
                onChange={(e) => setEditNote({ ...editNote, color: e.target.value } as Note)}
              >
                {colorOptions.map((c) => (
                  <option key={c.className} value={c.className}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* Color preview dot */}
              <span className={`w-4 h-4 rounded-full border border-gray-300 ${editNote.color}`}></span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setEditNote(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold"
                onClick={() => handleSaveEdit(editNote)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <input
              className="w-full bg-transparent border-b border-gray-300 text-gray-900 text-lg font-bold mb-2 outline-none"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="w-full bg-transparent border-b border-gray-300 text-gray-800 mb-2 outline-none min-h-[60px]"
              value={newNote.body}
              onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
              placeholder="Take a note..."
            />
            <div className="flex items-center gap-2 mt-2">
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
                value={newNote.color}
                onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
              >
                {colorOptions.map((c) => (
                  <option key={c.className} value={c.className}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* Color preview dot */}
              <span className={`w-4 h-4 rounded-full border border-gray-300 ${newNote.color}`}></span>
            </div>
            {/* Visibility Option */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-medium">Visibility:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={newNote.visibility === 'public'}
                  onChange={() => setNewNote({ ...newNote, visibility: 'public' })}
                />
                <span>Public</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={newNote.visibility === 'private'}
                  onChange={() => setNewNote({ ...newNote, visibility: 'private' })}
                />
                <span>Private</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowNew(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold"
                onClick={handleAddNote}
                disabled={!newNote.title.trim() || !currentUser}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
