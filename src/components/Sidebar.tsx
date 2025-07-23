'use client';

import React from 'react';

interface SidebarProps {
  onSelect: (tab: string) => void;
  activeTab?: string;
}

export default function Sidebar({ onSelect, activeTab }: SidebarProps) {
  const navSections = [
    {
      title: 'Main Features',
      items: [
        { key: 'dashboard', icon: '🏠', label: 'Dashboard', color: 'from-blue-500 to-blue-700' },
        { key: 'projects', icon: '📁', label: 'Projects', color: 'from-green-500 to-green-700' },
        { key: 'voice', icon: '🎤', label: 'Voice Chat', color: 'from-purple-500 to-purple-700' },
        { key: 'members', icon: '👥', label: 'Members', color: 'from-orange-500 to-orange-700' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { key: 'notes', icon: '📝', label: 'Notes', color: 'from-yellow-400 to-yellow-600' },
        { key: 'meetings', icon: '📅', label: 'Meetings', color: 'from-red-400 to-red-600' },
        { key: 'whiteboard', icon: '🎨', label: 'Whiteboard', color: 'from-pink-400 to-pink-600' },
        { key: 'library', icon: '📚', label: 'Library', color: 'from-indigo-400 to-indigo-600' },
        { key: 'activity', icon: '📊', label: 'Activity', color: 'from-orange-400 to-orange-600' },
      ],
    },
    {
      title: 'Development',
      items: [
        { key: 'colab', icon: '🧪', label: 'Google Colab', color: 'from-orange-400 to-orange-600' },
        { key: 'vscode', icon: '🖥️', label: 'VS Code', color: 'from-gray-400 to-gray-600' },
        { key: 'knime', icon: '🔬', label: 'KNIME Output', color: 'from-teal-400 to-teal-600' },
      ],
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-glass glass-card shadow-2xl border border-white/30 flex flex-col backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">IITCohort</h2>
            <p className="text-blue-100 text-sm">Smart Collaboration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navSections.map(section => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item.key}>
                  <button
                    onClick={() => onSelect(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden
                      ${activeTab === item.key
                        ? 'bg-gradient-to-r ' + item.color + ' text-white scale-105 shadow-xl'
                        : 'text-gray-700 hover:bg-white/40 hover:scale-105 hover:shadow-lg'}
                    `}
                    style={{
                      boxShadow: activeTab === item.key ? '0 4px 24px 0 #2563eb33' : undefined,
                      zIndex: activeTab === item.key ? 2 : 1,
                    }}
                  >
                    <span className="text-lg drop-shadow-sm transition-all duration-200">
                      {item.icon}
                    </span>
                    <span className="font-medium transition-all duration-200">
                      {item.label}
                    </span>
                    {activeTab === item.key && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-lg animate-pulse" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 bg-white/60 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            © 2024 IITCohort
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
