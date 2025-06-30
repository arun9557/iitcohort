'use client';

interface SidebarProps {
  onSelect: (tab: string) => void;
  theme?: 'light' | 'dark';
}

export default function Sidebar({ onSelect, theme = 'light' }: SidebarProps) {
  return (
    <div className={`w-64 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-[#1e1e2f] text-white'} p-4 space-y-4 h-screen flex flex-col`}>
      <h2 className="text-xl font-bold mb-6">BatchHub</h2>
      <ul className="space-y-2 flex-1">
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('dashboard')}>🏠 Dashboard</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('projects')}>📁 Projects</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('voice')}>🎤 Voice Chat</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('members')}>🧑‍🤝‍🧑 Members</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('notes')}>📝 Notes</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('meetings')}>📅 Meetings</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('whiteboard')}>🎨 Whiteboard</li>
        <li className={`hover:bg-opacity-80 p-2 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-[#292940]'
        }`} onClick={() => onSelect('library')}>📚 Library</li>
      </ul>
      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>© IITCohort</div>
    </div>
  );
} 