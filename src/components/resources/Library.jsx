'use client';
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronLeft, ChevronRight, Search, Upload, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import FileUpload from './FileUpload';
import FileManager from './FileManager';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
const categories = [
    'All Categories',
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Literature',
    'History',
    'Other'
];
const fileTypes = [
    'All Types',
    'Document',
    'Video',
    'Image',
    'Audio',
    'Presentation'
];
const sortOptions = [
    'Recently Added',
    'Name A-Z',
    'Name Z-A',
    'Most Downloaded',
    'Highest Rated'
];
const Library = () => {
    const [libraryItems, setLibraryItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedFileType, setSelectedFileType] = useState('All Types');
    const [selectedSort, setSelectedSort] = useState('Recently Added');
    const [currentPage, setCurrentPage] = useState(1);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('library');
    const itemsPerPage = 8;
    useEffect(() => {
        // Real-time fetch of public files from Firestore
        const q = query(collection(db, 'files'), where('isPublic', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const files = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || data.name || '',
                    description: data.description || '',
                    type: data.type || 'document',
                    category: data.category || 'Other',
                    tags: data.tags || [],
                    fileUrl: data.url || '',
                    fileName: data.name || '',
                    fileSize: data.size || 0,
                    uploadedBy: data.uploadedBy || '',
                    uploadedAt: data.uploadedAt ? (typeof data.uploadedAt === 'string' ? data.uploadedAt : (data.uploadedAt.toDate ? data.uploadedAt.toDate().toISOString() : '')) : '',
                    downloads: data.downloads || 0,
                    rating: data.rating || 0,
                    isPublic: true,
                    isFavorite: false,
                };
            });
            setLibraryItems(files);
        });
        return () => unsubscribe();
    }, []);
    const filteredItems = libraryItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
        const matchesFileType = selectedFileType === 'All Types' || item.type === selectedFileType.toLowerCase();
        return matchesSearch && matchesCategory && matchesFileType;
    });
    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (selectedSort) {
            case 'Name A-Z':
                return a.title.localeCompare(b.title);
            case 'Name Z-A':
                return b.title.localeCompare(a.title);
            case 'Most Downloaded':
                return b.downloads - a.downloads;
            case 'Highest Rated':
                return b.rating - a.rating;
            default:
                return 0; // Recently Added - keep original order
        }
    });
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedItems.slice(startIndex, endIndex);
    const recentlyUploaded = libraryItems.slice(0, 4); // First 4 items as recently uploaded
    const toggleFavorite = (id) => {
        setLibraryItems(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    };
    return (<div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Public Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#121417] tracking-light text-[32px] font-bold leading-tight">Library</h1>
                <p className="text-[#677183] text-sm font-normal leading-normal">Explore and manage your academic resources</p>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('library')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'library'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Library
            </button>
          <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upload'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Upload className="w-4 h-4 inline mr-1"/>
                  Upload
          </button>
          <button onClick={() => setActiveTab('files')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <FolderOpen className="w-4 h-4 inline mr-1"/>
                  Files
          </button>
        </div>
      </div>

            {/* Tab Content */}
            {activeTab === 'library' && (<>
            {/* Search Bar */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#677183] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <Search className="w-6 h-6"/>
                  </div>
              <input placeholder="Search for resources" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121417] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#677183] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
              </label>
            </div>
              </>)}

            {activeTab === 'library' && (<>
            {/* Filters */}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              {/* Categories Dropdown */}
              <div className="relative">
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                  <p className="text-[#121417] text-sm font-medium leading-normal">Categories</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]"/>
                </button>
                {showCategoryDropdown && (<div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {categories.map((category) => (<button key={category} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                    }}>
                        {category}
            </button>))}
          </div>)}
              </div>
              
              {/* File Types Dropdown */}
              <div className="relative">
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2" onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)}>
                  <p className="text-[#121417] text-sm font-medium leading-normal">File Types</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]"/>
                </button>
                {showFileTypeDropdown && (<div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {fileTypes.map((type) => (<button key={type} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => {
                        setSelectedFileType(type);
                        setShowFileTypeDropdown(false);
                    }}>
                        {type}
                      </button>))}
              </div>)}
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2" onClick={() => setShowSortDropdown(!showSortDropdown)}>
                  <p className="text-[#121417] text-sm font-medium leading-normal">Sort</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]"/>
                </button>
                {showSortDropdown && (<div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {sortOptions.map((option) => (<button key={option} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => {
                        setSelectedSort(option);
                        setShowSortDropdown(false);
                    }}>
                        {option}
                      </button>))}
                  </div>)}
              </div>
              </div>
              
            {/* Recently Uploaded */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recently Uploaded</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {recentlyUploaded.map((item) => (<div key={item.id} className="flex flex-col gap-3 pb-3">
                  <div className="w-full aspect-square rounded-xl cursor-pointer hover:opacity-90 transition-opacity overflow-hidden" onClick={() => console.log('View item:', item.title)}>
                    <Image src={item.fileUrl} alt={item.title} width={158} height={158} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <p className="text-[#121417] text-base font-medium leading-normal">{item.title}</p>
                    <p className="text-[#677183] text-sm font-normal leading-normal">{item.category}</p>
                  </div>
                </div>))}
              </div>

            {/* Resources */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Resources</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {currentItems.map((item) => (<div key={item.id} className="flex flex-col gap-3 pb-3">
                  <div className="w-full aspect-square rounded-xl cursor-pointer hover:opacity-90 transition-opacity overflow-hidden relative" onClick={() => console.log('View item:', item.title)}>
                    <Image src={item.fileUrl} alt={item.title} width={158} height={158} className="w-full h-full object-cover"/>
                    <button className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                }}>
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}/>
                    </button>
                  </div>
                  <div>
                    <p className="text-[#121417] text-base font-medium leading-normal">{item.title}</p>
                    <p className="text-[#677183] text-sm font-normal leading-normal">{item.category}</p>
                  </div>
                </div>))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (<div className="flex items-center justify-center p-4">
                <button className="flex size-10 items-center justify-center disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-[18px] h-[18px] text-[#121417]"/>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} className={`text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center rounded-full ${currentPage === page
                        ? 'text-[#121417] bg-[#f1f2f4]'
                        : 'text-[#121417]'}`} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>))}
                
          <button className="flex size-10 items-center justify-center disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-[18px] h-[18px] text-[#121417]"/>
          </button>
        </div>)}

            {/* Summary */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Summary</h2>
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dddfe4]">
                <p className="text-[#121417] text-base font-medium leading-normal">Total Files</p>
                <p className="text-[#121417] tracking-light text-2xl font-bold leading-tight">{libraryItems.length}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dddfe4]">
                <p className="text-[#121417] text-base font-medium leading-normal">Storage Used</p>
                <p className="text-[#121417] tracking-light text-2xl font-bold leading-tight">12 GB / 50 GB</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dddfe4]">
                <p className="text-[#121417] text-base font-medium leading-normal">Most Popular Tags</p>
                <p className="text-[#121417] tracking-light text-2xl font-bold leading-tight">Computer Science, Math, Literature</p>
              </div>
              </div>
              </>)}

            {/* Upload Tab */}
            {activeTab === 'upload' && (<div className="p-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Files</h2>
                  <p className="text-gray-600">Upload and share your academic resources with the team</p>
                </div>
                <FileUpload onFileUploaded={(file) => {
                console.log('File uploaded:', file);
                // Optionally switch to files tab after upload
                setActiveTab('files');
            }} maxFileSize={100} // 100MB limit
         allowedTypes={[
                'image/*',
                'video/*',
                'audio/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
            ]}/>
              </div>)}

            {/* Files Tab */}
            {activeTab === 'files' && (<div className="p-4">
                <FileManager />
              </div>)}
            </div>
        </div>
      </div>
    </div>);
};
export default Library;
