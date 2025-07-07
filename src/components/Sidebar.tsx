'use client';

import React from 'react';

interface SidebarProps {
  onSelect: (tab: string) => void;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">IITCohort</h2>
            <p className="text-blue-100 text-sm">Smart Collaboration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Main Features
          </h3>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => onSelect('dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('projects')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group"
              >
                <span className="text-lg">📁</span>
                <span className="font-medium">Projects</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('voice')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 group"
              >
                <span className="text-lg">🎤</span>
                <span className="font-medium">Voice Chat</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('members')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 group"
              >
                <span className="text-lg">👥</span>
                <span className="font-medium">Members</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Tools
          </h3>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => onSelect('notes')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-all duration-200 group"
              >
                <span className="text-lg">📝</span>
                <span className="font-medium">Notes</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('meetings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
              >
                <span className="text-lg">📅</span>
                <span className="font-medium">Meetings</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('whiteboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-all duration-200 group"
              >
                <span className="text-lg">🎨</span>
                <span className="font-medium">Whiteboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('library')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 group"
              >
                <span className="text-lg">📚</span>
                <span className="font-medium">Library</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('activity')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 group"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">Activity</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Development
          </h3>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => onSelect('vscode')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
              >
                <span className="text-lg">🖥️</span>
                <span className="font-medium">VS Code</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelect('knime')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200 group"
              >
                <span className="text-lg">🔬</span>
                <span className="font-medium">KNIME Output</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            © 2024 IITCohort
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
