'use client';

import React, { useState } from 'react';
import { 
  Star, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';

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
  uploadedAt: string;
  downloads: number;
  rating: number;
  isPublic: boolean;
  isFavorite: boolean;
}

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

const initialLibraryItems: LibraryItem[] = [
  {
    id: '1',
    title: 'Advanced Physics Notes',
    description: '',
    type: 'document',
    category: 'Physics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBogmfqvCQF2wZuS8KzeVNTBmqRG3C5Y1bUJUytc8on-MXXhJxK8JEohONW2tEIsNIS4LX2WIMBmCLbh7nDLYlNe1EZfYwlMH59pRah72fiiCSvTSnxAiPczltcrJZtrD1mAu_-aEkdsfzQEfJPbkpuQq-enycejkyDKDhE-8fmETJJAefZrxUnjQYaKXOEu_DZ8nHjcP6PJ0J8VX3QBBR9ZsWKBmA4hya67VpDFKLjyFwGnN8mfn2zBCqrT7T9znTUOh8LY95NjYU',
    fileName: 'Advanced Physics Notes',
    fileSize: 2.3 * 1024 * 1024,
    uploadedBy: 'Prof. Sharma',
    uploadedAt: '2024-04-01',
    downloads: 45,
    rating: 4.5,
    isPublic: true,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Quantum Mechanics',
    description: '',
    type: 'document',
    category: 'Physics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmu6u25b5uSe244JVnbuS8bq-xPvg789AQ0xB9V5x3h5vm55N-lxzWAp7rBijg4QeAz1On93uwyS65LOaSPrhq3YIuRfpKc4oMOFB91F1OOM4lk0DpGlpJhuCrPEzvBckCsVaPY1ljwAU9TU7YoRHL1YlXAb9DMmBHIQRkIB88n3E2YElqoAV6KzyisRXWcdHlLHdn16cieQSJrByKZZSlOgV5cLp7UkexsMOpFaVL2p6sAGAx9GnfuOjkvS6B9jtC6oVUi6-6oho',
    fileName: 'Quantum Mechanics',
    fileSize: 1.8 * 1024 * 1024,
    uploadedBy: 'Dr. Patel',
    uploadedAt: '2024-03-31',
    downloads: 32,
    rating: 4.2,
    isPublic: true,
    isFavorite: false
  },
  {
    id: '3',
    title: 'Thermodynamics',
    description: '',
    type: 'document',
    category: 'Physics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADwXPIsp61oE-oRMicIqLl_kHOP2bun2BsDTkeAyueCsOOoR8RbrZqmSLHI5tEy41VKv6wXqBQpZGpB1iz_UIu1nborxIut9bC5IZ25l6IgCD5-9aT8SOlojF3IGKlsPVIiNaSsVoF1IPWJS-b9p7wiNiQhRApOYGMa2ai1n1qvShf-zQkjXZ3x5wc4FrwAKygNLErLHdT6FFg-kGD0VHeFLi8kTdh2EP8ESNmc3p8kxLMO7ETUlVf9XaY4W6MLj6Z6Ffp82WksQY',
    fileName: 'Thermodynamics',
    fileSize: 3.1 * 1024 * 1024,
    uploadedBy: 'Prof. Kumar',
    uploadedAt: '2024-03-29',
    downloads: 28,
    rating: 4.0,
    isPublic: true,
    isFavorite: true
  },
  {
    id: '4',
    title: 'Electromagnetism',
    description: '',
    type: 'document',
    category: 'Physics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2nJaVrnFkl2cMA8eC5rKHjK8xMIk3PR20HO2Az1Hw3KCcJiKaZz3wxHT3ccze8AAmc4vUj7nwHxOkotbPw2Wcxeu9Vky8vY9K41rwOYzGFIpeaiJo_EkdsMJnOJs1Ts1NcjPyC-02QsagqOPrsU-mMSrx2kPVt_oV6S18cvcr5umR1LDDkpYKE8QWTgmwhpomlyGkEF3f7Iq5NuDArg9anjOMsyhLY0dvkswWg7ck7mgZjY2xi1_OhOD-pyEBVCMZ2o11sODrCU8',
    fileName: 'Electromagnetism',
    fileSize: 4.2 * 1024 * 1024,
    uploadedBy: 'Dr. Singh',
    uploadedAt: '2024-03-22',
    downloads: 56,
    rating: 4.7,
    isPublic: true,
    isFavorite: false
  },
  {
    id: '5',
    title: 'Introduction to Algorithms',
    description: '',
    type: 'document',
    category: 'Computer Science',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdKjYw7PiWmaowVBnlXb0tPy9FhKyIaWOwFs2TXz8eZuifotWjraeXeo-SzZkHYnQkfkC_6sKWsXcPdJvqp0cuWcYKci9j4nP_KgeRgwQcdHnVovo8siDe_WTl3dFbFyD2QW68VdY0mLj3pgzHdbBsnkfTa1jYGnRvTxy0Ri80n6nu2UMplERjleoX7Bb6os9RLHyor_1kY6Surh7zWwVU7NMvY2bekU4G-0-Kd-yPjh3bLx_G_MCJryfbZk45Htk-TYU3TX_oTE0',
    fileName: 'Introduction to Algorithms',
    fileSize: 5.6 * 1024 * 1024,
    uploadedBy: 'Prof. Gupta',
    uploadedAt: '2024-03-15',
    downloads: 89,
    rating: 4.8,
    isPublic: true,
    isFavorite: true
  },
  {
    id: '6',
    title: 'Calculus I Notes',
    description: '',
    type: 'document',
    category: 'Mathematics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnxHyi-c3KH73eNIjRHeRYIoX1LbfQ3B8YwymTUK6FtbHBXAVjb9MywY774eWZ1CZs4BpKzbXl2iPbkbB53tGrOh3pCDKksDDgDY83AZTMgNqaRYX_e1gO7fGRCYas8k7DiUnFtsXKfryFMESij9OOVcTbPW7vYkzzM761Ld7Zn029nq_nNFn27psD0y_xKl1t974BrYMaFNBwz_OzMi-1bgmNXouaHafXH6Z-SbxsXlBcIS0kbqwI9rxaKYa2GnD2QHkpFjedtSo',
    fileName: 'Calculus I Notes',
    fileSize: 2.8 * 1024 * 1024,
    uploadedBy: 'Dr. Verma',
    uploadedAt: '2024-03-08',
    downloads: 67,
    rating: 4.3,
    isPublic: true,
    isFavorite: false
  },
  {
    id: '7',
    title: "Shakespeare's Sonnets",
    description: '',
    type: 'document',
    category: 'Literature',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa_QZRhT5S3KUZUPYPJjx5KOtWO-SJJ4H3FXC3t01Gbuk5aL7v3ciaw-5z7XmCvAYP5HSwuxS1hV1TM0QBOn0BmxthJDXe5xMiupE1YyFWAI5d6owsCEM-dI7gKFlXasuoieHkQ7ouzXuzJYSQyYsil0BZ2CxF6KUeZTVWuPdlzsQZU3G_xVygpbP0AnpGE635zUARKlbz4elx_UVZ_m_S6E874pFd53iZp8TUYXsJaSE4EJLxF4YalYfb6xWpZDZwO3m1c40WQxk',
    fileName: "Shakespeare's Sonnets",
    fileSize: 1.5 * 1024 * 1024,
    uploadedBy: 'Prof. Johnson',
    uploadedAt: '2024-02-15',
    downloads: 34,
    rating: 4.1,
    isPublic: true,
    isFavorite: true
  },
  {
    id: '8',
    title: 'Linear Algebra',
    description: '',
    type: 'document',
    category: 'Mathematics',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoSlQ3b2lU3UbGzKlWnJPUFC2RjprILzJ5IZogg8NRiqsP36RReM7Zw209gHZQ4pgsU3SKf2OxadGYRUK13Y3n8qP-djk3UEQT_rdaiq4SiTjiLsRRxd4E1j-NOgeyge5Lh0VTO8XFEmBZWJ0bdyBihHNf1Ps8WEXlMcel8dse3p42gx_wm1YlDlB7ttjSq8NVygRW_l_7-QQ2q9SWvqPLcwHd3Sh3lGozlWUOGrgoRlGRZvkkeLXG4byBIQoeNi2Hi9VYyUYj8z4',
    fileName: 'Linear Algebra',
    fileSize: 3.9 * 1024 * 1024,
    uploadedBy: 'Dr. Kumar',
    uploadedAt: '2024-02-10',
    downloads: 78,
    rating: 4.6,
    isPublic: true,
    isFavorite: false
  },
  {
    id: '9',
    title: 'Organic Chemistry',
    description: '',
    type: 'document',
    category: 'Chemistry',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1PmXxR2BzTUeG2Uf6HG7tFxeHJ3gunSf1OOfi-0rbVIn_374EzXIofPzraPlCmOawiogenw_vawjdXkk4FrNvg2qNPSyglYkjeu0CppXc4-V9zfDmcY59U6DsKfWMA34FTo5wnL1zryOy7Vi6_QdUvjWvDEjIIYqKvJzqtdbdA_6j45D4LkVlnVr9Sr8WLdGwmBrcZRxWRU4NEOMT4QWPeoB9yYp3u4yK-eysAstKzRNDdGARYcCw_alEyVZoyMOXzm1mDAGzVDk',
    fileName: 'Organic Chemistry',
    fileSize: 4.7 * 1024 * 1024,
    uploadedBy: 'Prof. Singh',
    uploadedAt: '2024-01-15',
    downloads: 92,
    rating: 4.4,
    isPublic: true,
    isFavorite: true
  },
  {
    id: '10',
    title: 'World History',
    description: '',
    type: 'document',
    category: 'History',
    tags: [],
    fileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAbct-7hy4p8uxEKjRZW7yIC6EyvV-kQvkplShH2TAriKfrwpxkD-B_XxqPW16MMANlN-M48iw2I6vXasqoAkaYM9nQ0T69xmn_g7nZgtkb8pIVYSr3PPCE4XhPqQCs31sNCwcogEnGLAEdcXBHLr21fguTLW9EHvdV-aiUZ94ORBFoJtkOkOb2vhijcRJlQMmRL2DfhVDYBMvbS8td8ytBN9KulD_VIsPhG9CqAEUEEO0upjSM1OcaDCOErl-6B4gI2HSqjLDGrY',
    fileName: 'World History',
    fileSize: 6.1 * 1024 * 1024,
    uploadedBy: 'Prof. Brown',
    uploadedAt: '2024-01-10',
    downloads: 45,
    rating: 4.0,
    isPublic: true,
    isFavorite: false
  }
];

const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>(initialLibraryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFileType, setSelectedFileType] = useState('All Types');
  const [selectedSort, setSelectedSort] = useState('Recently Added');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const itemsPerPage = 8;

  const filteredItems = items.filter(item => {
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

  const recentlyUploaded = items.slice(0, 4); // First 4 items as recently uploaded

  const toggleFavorite = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{fontFamily: '"Public Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#121417] tracking-light text-[32px] font-bold leading-tight">Library</h1>
                <p className="text-[#677183] text-sm font-normal leading-normal">Explore and manage your academic resources</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#677183] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    placeholder="Search for resources"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121417] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#677183] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Filters */}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              {/* Categories Dropdown */}
              <div className="relative">
                <button 
                  className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <p className="text-[#121417] text-sm font-medium leading-normal">Categories</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Types Dropdown */}
              <div className="relative">
                <button 
                  className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2"
                  onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)}
                >
                  <p className="text-[#121417] text-sm font-medium leading-normal">File Types</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]" />
                </button>
                {showFileTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {fileTypes.map((type) => (
                      <button
                        key={type}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedFileType(type);
                          setShowFileTypeDropdown(false);
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-2"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <p className="text-[#121417] text-sm font-medium leading-normal">Sort</p>
                  <ChevronDown className="w-5 h-5 text-[#121417]" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedSort(option);
                          setShowSortDropdown(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recently Uploaded */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recently Uploaded</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {recentlyUploaded.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundImage: `url(${item.fileUrl})` }}
                    onClick={() => console.log('View item:', item.title)}
                  />
                  <div>
                    <p className="text-[#121417] text-base font-medium leading-normal">{item.title}</p>
                    <p className="text-[#677183] text-sm font-normal leading-normal">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resources */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Resources</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {currentItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 pb-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity relative"
                    style={{ backgroundImage: `url(${item.fileUrl})` }}
                    onClick={() => console.log('View item:', item.title)}
                  >
                    <button
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <div>
                    <p className="text-[#121417] text-base font-medium leading-normal">{item.title}</p>
                    <p className="text-[#677183] text-sm font-normal leading-normal">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center p-4">
                <button 
                  className="flex size-10 items-center justify-center disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-[18px] h-[18px] text-[#121417]" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center rounded-full ${
                      currentPage === page 
                        ? 'text-[#121417] bg-[#f1f2f4]' 
                        : 'text-[#121417]'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  className="flex size-10 items-center justify-center disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-[18px] h-[18px] text-[#121417]" />
                </button>
              </div>
            )}

            {/* Summary */}
            <h2 className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Summary</h2>
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dddfe4]">
                <p className="text-[#121417] text-base font-medium leading-normal">Total Files</p>
                <p className="text-[#121417] tracking-light text-2xl font-bold leading-tight">{items.length}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;