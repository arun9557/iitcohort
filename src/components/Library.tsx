'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Share2, 
  Star, 
  MoreVertical, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Clock, 
  User, 
  Tag, 
  Filter as FilterIcon,
  Eye,
  Trash2,
  BookOpen,
  Loader2
} from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'audio' | 'presentation';
  category: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Timestamp;
  downloads: number;
  rating: number;
  isPublic: boolean;
}

const categories = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Engineering',
  'Literature',
  'History',
  'Other'
];

const fileTypes = [
  { value: 'document', label: 'Document', icon: FileText, color: 'text-blue-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
  { value: 'image', label: 'Image', icon: Image, color: 'text-green-500' },
  { value: 'audio', label: 'Audio', icon: Music, color: 'text-purple-500' },
  { value: 'presentation', label: 'Presentation', icon: FileText, color: 'text-orange-500' }
];

const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'document' as LibraryItem['type'],
    category: 'Computer Science',
    tags: [] as string[],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'library'), (snapshot) => {
      const libraryItems = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as LibraryItem[];
      setItems(libraryItems);
    });

    // Check for dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('File size exceeds 100MB limit');
        return;
      }
      setSelectedFile(file);
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
        setNewItem(prev => ({ ...prev, type: 'document' }));
      } else if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) {
        setNewItem(prev => ({ ...prev, type: 'video' }));
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
        setNewItem(prev => ({ ...prev, type: 'image' }));
      } else if (['mp3', 'wav', 'flac'].includes(extension || '')) {
        setNewItem(prev => ({ ...prev, type: 'audio' }));
      } else if (['ppt', 'pptx'].includes(extension || '')) {
        setNewItem(prev => ({ ...prev, type: 'presentation' }));
      }
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !newItem.title.trim()) {
      setError('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `library/${Date.now()}_${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const libraryItem: Omit<LibraryItem, 'id'> = {
        title: newItem.title,
        description: newItem.description,
        type: newItem.type,
        category: newItem.category,
        tags: newItem.tags,
        fileUrl: downloadURL,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadedBy: 'current-user@iitcohort.com',
        uploadedAt: Timestamp.now(),
        downloads: 0,
        rating: 0,
        isPublic: newItem.isPublic
      };

      await addDoc(collection(db, 'library'), libraryItem);
      
      setNewItem({
        title: '',
        description: '',
        type: 'document',
        category: 'Computer Science',
        tags: [],
        isPublic: true
      });
      setSelectedFile(null);
      setShowUploadModal(false);
      setError(null);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'library', id));
      setDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete file. Please try again.');
      console.error('Error deleting file:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newItem.tags.includes(newTag)) {
      setNewItem(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const allTags = Array.from(new Set(items.flatMap(item => item.tags)));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesType && matchesTag;
  });

  const getFileIcon = (type: LibraryItem['type']) => {
    const fileType = fileTypes.find(ft => ft.value === type);
    return fileType ? fileType.icon : FileText;
  };

  const getFileColor = (type: LibraryItem['type']) => {
    const fileType = fileTypes.find(ft => ft.value === type);
    return fileType ? fileType.color : 'text-gray-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (item: LibraryItem) => {
    return ['image', 'video'].includes(item.type);
  };

  return (
    <div className={`container mx-auto p-6 space-y-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Resource Library</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover and share educational resources
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Upload Resource
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Types</option>
              {fileTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`border rounded-lg px-3 py-2 hover:bg-opacity-10 transition-all ${isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-5 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getFileColor(item.type).replace('text-', 'bg-').replace('-500', '-100')}`}>
                  {React.createElement(getFileIcon(item.type), { className: `w-6 h-6 ${getFileColor(item.type)}` })}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">{item.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 truncate">{item.title}</h3>
              <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.description}
              </p>
              
              <div className={`flex items-center gap-2 text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock className="w-4 h-4" />
                {item.uploadedAt.toDate().toLocaleDateString()}
              </div>
              
              <div className={`flex items-center gap-2 text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Download className="w-4 h-4" />
                {item.downloads} downloads
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(item.fileSize)}
                </span>
                <div className="flex gap-2">
                  {canPreview(item) && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {deleteConfirm === item.id && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Confirm delete?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-5 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getFileColor(item.type).replace('text-', 'bg-').replace('-500', '-100')}`}>
                  {React.createElement(getFileIcon(item.type), { className: `w-6 h-6 ${getFileColor(item.type)}` })}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  <div className={`flex flex-wrap items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{item.category}</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>{item.downloads} downloads</span>
                    <span>{item.uploadedAt.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{item.rating.toFixed(1)}</span>
                  </div>
                  {canPreview(item) && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    onClick={() => {
                      // Increment download count (mock)
                      setItems(prev => prev.map(i => i.id === item.id ? { ...i, downloads: i.downloads + 1 } : i));
                    }}
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {deleteConfirm === item.id && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Confirm delete?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
          <h3 className="text-xl НАТО font-medium mb-2">No resources found</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start by uploading your first resource
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Upload Resource
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            <h3 className="text-xl font-semibold mb-6">Upload Resource</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.mkv,.jpg,.jpeg,.png,.gif,.mp3,.wav,.flac,.ppt,.pptx"
                />
                {selectedFile && (
                  <p className={`text-sm mt-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Resource title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  rows={4}
                  placeholder="Resource description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    onClick={addTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newItem.isPublic}
                  onChange={(e) => setNewItem({...newItem, isPublic: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this resource public
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={uploadFile}
                disabled={uploading || !selectedFile || !newItem.title.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setError(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Library;