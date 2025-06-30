'use client';

import { useState } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Star,
  Share2,
  MoreVertical,
  User,
  Calendar,
  Tag
} from 'lucide-react';
import { db, storage } from '../firebase';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isShared: boolean;
  fileUrl: string;
}

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Data Structures Notes',
    content: `# Data Structures Overview

## Arrays
- Linear data structure
- Contiguous memory allocation
- O(1) access time
- Fixed size in most languages

## Linked Lists
- Dynamic data structure
- Non-contiguous memory
- O(n) access time
- Flexible size

## Trees
- Hierarchical data structure
- Binary trees, AVL trees, Red-Black trees
- Used for searching and sorting

## Graphs
- Network data structure
- Vertices and edges
- Used for modeling relationships`,
    tags: ['Algorithms', 'Data Structures', 'Computer Science'],
    category: 'Computer Science',
    author: 'Alice',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    isFavorite: true,
    isShared: true,
    fileUrl: ''
  },
  {
    id: '2',
    title: 'Web Development Concepts',
    content: `# Modern Web Development

## Frontend Technologies
- React.js for UI components
- Next.js for full-stack applications
- TypeScript for type safety
- Tailwind CSS for styling

## Backend Technologies
- Node.js runtime
- Express.js framework
- MongoDB for NoSQL database
- Firebase for real-time features

## Best Practices
- Component-based architecture
- Responsive design
- Performance optimization
- Security considerations`,
    tags: ['Web Development', 'React', 'Next.js', 'JavaScript'],
    category: 'Web Development',
    author: 'Bob',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-11',
    isFavorite: false,
    isShared: false,
    fileUrl: ''
  },
  {
    id: '3',
    title: 'Machine Learning Basics',
    content: `# Introduction to Machine Learning

## Types of ML
1. **Supervised Learning**
   - Classification
   - Regression

2. **Unsupervised Learning**
   - Clustering
   - Dimensionality reduction

3. **Reinforcement Learning**
   - Q-learning
   - Policy gradients

## Popular Algorithms
- Linear Regression
- Logistic Regression
- Decision Trees
- Random Forest
- Support Vector Machines
- Neural Networks`,
    tags: ['Machine Learning', 'AI', 'Python', 'Statistics'],
    category: 'Artificial Intelligence',
    author: 'Charlie',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-09',
    isFavorite: true,
    isShared: true,
    fileUrl: ''
  }
];

const categories = [
  'Computer Science',
  'Web Development',
  'Artificial Intelligence',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Other'
];

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tags: [],
    category: 'Computer Science'
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags || [],
      category: newNote.category || 'Computer Science',
      author: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
      isShared: false,
      fileUrl: fileUrl || ''
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({
      title: '',
      content: '',
      tags: [],
      category: 'Computer Science'
    });
    setShowCreateForm(false);
    setSelectedNote(note);
  };

  const updateNote = () => {
    if (!editingNote) return;

    const updatedNote = {
      ...editingNote,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setNotes(prev => prev.map(note => 
      note.id === editingNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const toggleShare = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isShared: !note.isShared } : note
    ));
  };

  const addTag = (tag: string) => {
    if (editingNote && !editingNote.tags.includes(tag)) {
      setEditingNote(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tag]
      } : null);
    }
  };

  const removeTag = (tag: string) => {
    if (editingNote) {
      setEditingNote(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      } : null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const storageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setFileUrl(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-[600px]">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Notes & Documents
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      <div className="flex h-[500px]">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-4 border-b">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedNote?.id === note.id
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                    <div className="flex items-center gap-1">
                      {note.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      {note.isShared && <Share2 className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{note.category}</span>
                    <span>{note.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                    <div className="flex items-center gap-2">
                      {selectedNote.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {selectedNote.isShared && <Share2 className="w-4 h-4 text-blue-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedNote.id)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition"
                    >
                      <Star className={`w-4 h-4 ${selectedNote.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleShare(selectedNote.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition"
                    >
                      <Share2 className={`w-4 h-4 ${selectedNote.isShared ? 'text-blue-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => setEditingNote(selectedNote)}
                      className="p-2 text-gray-400 hover:text-purple-500 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedNote.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated {selectedNote.updatedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {selectedNote.category}
                  </span>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {editingNote ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full text-xl font-semibold border-b border-gray-200 pb-2 focus:outline-none focus:border-purple-500"
                    />
                    <textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="w-full h-64 border rounded-lg p-3 focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Write your note content here..."
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editingNote.tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addTag(e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={updateNote}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-900">{selectedNote.content}</pre>
                  </div>
                )}
                {selectedNote?.fileUrl && (
                  <div className="mt-4">
                    <a href={selectedNote.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Attached File</a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a note to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={8}
                  placeholder="Write your note content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Add tags separated by commas"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setNewNote(prev => ({ ...prev, tags }));
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleFileUpload} className="bg-blue-500 text-white px-3 py-1 rounded ml-2">Upload File</button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 