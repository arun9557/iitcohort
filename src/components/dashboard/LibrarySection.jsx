import React, { useState } from 'react';
import { FileText, Video, ImageIcon, Music, BookOpen, Download } from 'lucide-react';

const LibrarySection = ({ setActiveTab }) => {
    const [recentFiles] = useState([
        { id: '1', title: 'Data Structures Notes.pdf', type: 'document', size: '2.3 MB', uploadedBy: 'Prof. Sharma', date: '2 hours ago' },
        { id: '2', title: 'Machine Learning Lecture.mp4', type: 'video', size: '45.2 MB', uploadedBy: 'Dr. Patel', date: '1 day ago' },
        { id: '3', title: 'Chemistry Lab Report.docx', type: 'document', size: '1.1 MB', uploadedBy: 'Student', date: '3 days ago' }
    ]);
    const getFileIcon = (type) => {
        switch (type) {
            case 'document': return <FileText className="w-4 h-4 text-blue-500"/>;
            case 'video': return <Video className="w-4 h-4 text-red-500"/>;
            case 'image': return <ImageIcon className="w-4 h-4 text-green-500"/>;
            case 'audio': return <Music className="w-4 h-4 text-purple-500"/>;
            default: return <FileText className="w-4 h-4 text-gray-500"/>;
        }
    };
    return (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600"/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Library Files</h3>
            <p className="text-sm text-gray-500">Shared resources & documents</p>
          </div>
        </div>
        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:bg-purple-50 px-3 py-1 rounded-lg transition-all duration-200" onClick={() => setActiveTab('library')}>
          View All
        </button>
      </div>
      <div className="space-y-4">
        {recentFiles.map((file) => (<div key={file.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {getFileIcon(file.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">{file.title}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  {file.size}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  {file.uploadedBy}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  {file.date}
                </span>
              </div>
            </div>
            <button className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-all duration-200">
              <Download className="w-4 h-4"/>
            </button>
          </div>))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600 font-medium">Total Files: 127</span>
          <span className="text-gray-600 font-medium">Storage: 2.3 GB</span>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTab('library')} className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200">
            📚 Full Library
          </button>
          <button onClick={() => setActiveTab('notes')} className="bg-green-50 text-green-700 py-3 px-4 rounded-lg hover:bg-green-100 transition-all duration-200 text-sm font-medium border border-green-200">
            📝 Notes
          </button>
        </div>
      </div>
    </div>);
};

export default LibrarySection;