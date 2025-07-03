'use client';

import React, { useState } from 'react';
import { FaSearch, FaUserCircle, FaPlus, FaBell, FaTag, FaArchive, FaTrash, FaThumbtack, FaUndo } from 'react-icons/fa';

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
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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

function MasonryGrid({ notes, onEdit, onArchive, onDelete, onRestore, onPin, onReminder }) {
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
  const [activeSidebar, setActiveSidebar] = useState('notes');
  const [notes, setNotes] = useState(dummyNotes);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    body: '',
    checklist: null,
    color: colorOptions[0].className,
    label: '',
    pinned: false,
    archived: false,
    trashed: false,
    reminder: null,
  });
  const [labelFilter, setLabelFilter] = useState(null);

  // Unique labels for Labels section
  const uniqueLabels = Array.from(new Set(notes.filter(n => !n.trashed).map(n => n.label).filter(Boolean)));

  // Filter notes by sidebar section
  let filteredNotes = notes.filter((n) => {
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

  function handleSaveEdit(note) {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    setEditNote(null);
  }

  function handleAddNote() {
    setNotes((prev) => [
      {
        ...newNote,
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setShowNew(false);
    setNewNote({ title: '', body: '', checklist: null, color: colorOptions[0].className, label: '', pinned: false, archived: false, trashed: false, reminder: null });
  }

  function handleArchive(note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, archived: !n.archived } : n));
  }
  function handleDelete(note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, trashed: true } : n));
  }
  function handleRestore(note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, trashed: false, archived: false } : n));
  }
  function handlePin(note) {
    setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, pinned: !n.pinned } : n));
  }
  function handleReminder(note) {
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
            onEdit={setEditNote}
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
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="w-full bg-transparent border-b border-gray-300 text-gray-800 mb-2 outline-none min-h-[60px]"
              value={editNote.body}
              onChange={(e) => setEditNote({ ...editNote, body: e.target.value })}
              placeholder="Take a note..."
            />
            <div className="flex items-center gap-2 mt-2">
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
                value={editNote.color}
                onChange={(e) => setEditNote({ ...editNote, color: e.target.value })}
              >
                {colorOptions.map((c) => (
                  <option key={c.className} value={c.className}>
                    {c.label}
                  </option>
                ))}
              </select>
              {/* Color preview dot */}
              <span className={`inline-block w-4 h-4 rounded-full ml-2 align-middle ${editNote.color}`}></span>
              <input
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
                value={editNote.label}
                onChange={(e) => setEditNote({ ...editNote, label: e.target.value })}
                placeholder="Label"
              />
              <button
                className={`p-2 rounded ${editNote.pinned ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-yellow-600'}`}
                onClick={() => setEditNote({ ...editNote, pinned: !editNote.pinned })}
                title="Pin note"
              >
                <FaThumbtack />
              </button>
              <button
                className={`p-2 rounded ${editNote.archived ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-blue-600'}`}
                onClick={() => setEditNote({ ...editNote, archived: !editNote.archived })}
                title="Archive"
              >
                <FaArchive />
              </button>
              <button
                className={`p-2 rounded ${editNote.trashed ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-red-600'}`}
                onClick={() => setEditNote({ ...editNote, trashed: !editNote.trashed })}
                title="Trash"
              >
                <FaTrash />
              </button>
              <button
                className={`p-2 rounded ${editNote.reminder ? 'bg-purple-200 text-purple-900' : 'bg-gray-200 text-purple-600'}`}
                onClick={() => handleReminder(editNote)}
                title="Set Reminder"
              >
                <FaBell />
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setEditNote(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-yellow-400 text-gray-900 font-bold" onClick={() => handleSaveEdit(editNote)}>Save</button>
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
              <span className={`inline-block w-4 h-4 rounded-full ml-2 align-middle ${newNote.color}`}></span>
              <input
                className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900"
                value={newNote.label}
                onChange={(e) => setNewNote({ ...newNote, label: e.target.value })}
                placeholder="Label"
              />
              <button
                className={`p-2 rounded ${newNote.pinned ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-yellow-600'}`}
                onClick={() => setNewNote({ ...newNote, pinned: !newNote.pinned })}
                title="Pin note"
              >
                <FaThumbtack />
              </button>
              <button
                className={`p-2 rounded ${newNote.archived ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-blue-600'}`}
                onClick={() => setNewNote({ ...newNote, archived: !newNote.archived })}
                title="Archive"
              >
                <FaArchive />
              </button>
              <button
                className={`p-2 rounded ${newNote.trashed ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-red-600'}`}
                onClick={() => setNewNote({ ...newNote, trashed: !newNote.trashed })}
                title="Trash"
              >
                <FaTrash />
              </button>
              <button
                className={`p-2 rounded ${newNote.reminder ? 'bg-purple-200 text-purple-900' : 'bg-gray-200 text-purple-600'}`}
                onClick={() => handleReminder(newNote)}
                title="Set Reminder"
              >
                <FaBell />
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-yellow-400 text-gray-900 font-bold" onClick={handleAddNote}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 