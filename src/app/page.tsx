// iit_batch_collab_platform: Next.js + Firebase starter

'use client';

import * as React from 'react';
import { useState, useEffect, ReactElement, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, limit, writeBatch, getDocs, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  BookOpen, 
  MessageCircle, 
  Lightbulb,
  Plus,
  Search,
  Settings,
  X,
  Video,
  ImageIcon,
  Music,
  Download,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Menu
} from 'lucide-react';
import Whiteboard from '../components/Whiteboard';
import KanbanBoard from '../components/KanbanBoard';
import MeetingScheduler from '../components/MeetingScheduler';
import NotesManager from '../components/NotesManager';
import Sidebar from '../components/Sidebar';
import VoiceRoom from '../components/VoiceRoom';
import MemberList from '../components/MemberList';
import RoomChat from '../components/RoomChat';
import Library from '../components/Library';
import KnimeOutput from '../components/KnimeOutput';
import VSCodeSelector from "../components/VSCodeSelector";
import GoogleColab from '../components/GoogleColab';
import UserMenu from '../components/UserMenu';
import NotificationBell from '../components/NotificationBell';
import { auth, db, syncUserToDatabase } from "../firebase";
import { isOwner } from "../utils/auth";
// import { getAnalytics } from "firebase/analytics"; // isko abhi comment kar dein

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: Timestamp;
}

interface ChatSectionProps {
  messages: ChatMessage[];
  sendMessage: () => void;
  message: string;
  setMessage: (message: string) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  color: string;
}

interface FutureProject {
  id: string;
  title: string;
  description: string;
  phase: string;
  members: number;
  tags: string[];
  color: string;
}

interface Activity {
  id: string;
  type: 'project' | 'message' | 'file' | 'meeting';
  user: string;
  action: string;
  target: string;
  time: string;
  icon: string;
  color: string;
}


// Feature components
const ProjectsSection = ({ futureProjects, setActiveTab }: { futureProjects: FutureProject[], setActiveTab: (tab: string) => void }) => {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: 'Web Development Project', description: 'Team meeting tomorrow at 10 AM', status: 'In Progress', color: 'blue' },
    { id: '2', title: 'Machine Learning Assignment', description: 'Deadline: Friday, 3 PM', status: 'Pending', color: 'green' },
    { id: '3', title: 'Database Design', description: 'Review session scheduled', status: 'Completed', color: 'purple' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', status: 'In Progress', color: 'blue' });

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        ...newProject
      };
      setProjects([...projects, project]);
      setNewProject({ title: '', description: '', status: 'In Progress', color: 'blue' });
      setShowAddModal(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-500',
      green: 'bg-green-50 border-green-500',
      purple: 'bg-purple-50 border-purple-500',
      red: 'bg-red-50 border-red-500',
      yellow: 'bg-yellow-50 border-yellow-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Projects Discussion</h3>
            <p className="text-sm text-gray-500">Manage your team projects</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm"
            onClick={() => setActiveTab('projects')}
          >
            View All
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {/* Current Projects */}
        {projects.map((project) => (
          <div key={project.id} className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
            <p className="text-sm text-gray-600">{project.description}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Future Projects */}
        {futureProjects.map((project) => (
          <div key={`future-${project.id}`} className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Future</span>
                  <span className="text-xs text-gray-500">👥 {project.members} members</span>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('projects')}
            className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200"
          >
            📁 All Projects
          </button>
          <button 
            className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200"
          >
            📋 Kanban Board
          </button>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProject.color}
                  onChange={(e) => setNewProject({...newProject, color: e.target.value})}
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                  onClick={addProject}
                >
                  Add Project
                </button>
                <button
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatSection: React.FC<ChatSectionProps & { setActiveTab: (tab: string) => void }> = ({ messages, sendMessage, message, setMessage, setActiveTab }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 min-h-[500px] lg:min-h-[650px] h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
              <div>
          <h3 className="text-xl font-bold text-gray-900">Quick Chat</h3>
          <p className="text-sm text-gray-500">Real-time communication</p>
              </div>
              </div>
      <div className="flex gap-2">
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm"
          onClick={() => setActiveTab('members')}
        >
          View All
        </button>
      </div>
    </div>
    <div className="space-y-4 mb-6 max-h-[400px] lg:max-h-[600px] overflow-y-auto flex-1">
      {messages.slice(-20).map((msg, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {msg.user.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{msg.user}
  {isOwner(msg.user) && (
    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">ADMIN</span>
  )}
</span>
              <span className="text-xs text-gray-500">
                {msg.timestamp?.toDate().toLocaleTimeString() || 'Now'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-800">{msg.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-200 pt-4">
      <div className="flex gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <button
        onClick={sendMessage}
          disabled={!message.trim()}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
      >
        Send
        </button>
      </div>
    </div>
  </div>
);

const LibrarySection = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [recentFiles] = useState([
    { id: '1', title: 'Data Structures Notes.pdf', type: 'document', size: '2.3 MB', uploadedBy: 'Prof. Sharma', date: '2 hours ago' },
    { id: '2', title: 'Machine Learning Lecture.mp4', type: 'video', size: '45.2 MB', uploadedBy: 'Dr. Patel', date: '1 day ago' },
    { id: '3', title: 'Chemistry Lab Report.docx', type: 'document', size: '1.1 MB', uploadedBy: 'Student', date: '3 days ago' }
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-green-500" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Library Files</h3>
            <p className="text-sm text-gray-500">Shared resources & documents</p>
          </div>
        </div>
        <button 
          className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:bg-purple-50 px-3 py-1 rounded-lg transition-all duration-200"
          onClick={() => setActiveTab('library')}
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {recentFiles.map((file) => (
          <div key={file.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200">
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
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600 font-medium">Total Files: 127</span>
          <span className="text-gray-600 font-medium">Storage: 2.3 GB</span>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('library')}
            className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200"
          >
            📚 Full Library
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className="bg-green-50 text-green-700 py-3 px-4 rounded-lg hover:bg-green-100 transition-all duration-200 text-sm font-medium border border-green-200"
          >
            📝 Notes
          </button>
        </div>
      </div>
    </div>
  );
};

const FuturePlanningSection = ({ 
  setActiveTab, 
  futureProjects, 
  setFutureProjects 
}: { 
  setActiveTab: (tab: string) => void;
  futureProjects: FutureProject[];
  setFutureProjects: React.Dispatch<React.SetStateAction<FutureProject[]>>;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFutureProject, setNewFutureProject] = useState<Omit<FutureProject, 'id'>>({
    title: '',
    description: '',
    phase: 'Planning phase',
    members: 1,
    tags: [],
    color: 'yellow'
  });
  const [newTag, setNewTag] = useState('');

  const addFutureProject = () => {
    if (newFutureProject.title.trim()) {
      const project: FutureProject = {
        id: Date.now().toString(),
        ...newFutureProject
      };
      setFutureProjects([...futureProjects, project]);
      setNewFutureProject({
        title: '',
        description: '',
        phase: 'Planning phase',
        members: 1,
        tags: [],
        color: 'yellow'
      });
      setShowAddModal(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newFutureProject.tags.includes(newTag)) {
      const updatedTags = [...newFutureProject.tags, newTag];
      setNewFutureProject(prev => ({
        ...prev,
        tags: updatedTags
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    const updatedTags = newFutureProject.tags.filter(t => t !== tag);
    setNewFutureProject(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-50 border-yellow-500',
      green: 'bg-green-50 border-green-500',
      blue: 'bg-blue-50 border-blue-500',
      purple: 'bg-purple-50 border-purple-500',
      red: 'bg-red-50 border-red-500'
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  const getTagColorClasses = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  const handleProjectClick = (project: FutureProject) => {
    // Navigate to Projects section
    setActiveTab('projects');
    // You can also add the project to the main projects list here
    console.log('Navigating to Projects section with:', project);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Future Projects</h3>
            <p className="text-sm text-gray-500">Plan upcoming initiatives</p>
          </div>
        </div>
        <button 
          className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {futureProjects.map((project) => (
          <div 
            key={project.id} 
            className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => handleProjectClick(project)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                <div className="flex items-center gap-3 mb-2">
              {project.tags.map((tag, index) => (
                    <span key={index} className={`${getTagColorClasses(project.color)} text-xs px-2 py-1 rounded-lg font-medium`}>
                  {tag}
                </span>
              ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>👥 {project.members} members</span>
                  <span>📅 {project.phase}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('projects')}
            className="bg-yellow-50 text-yellow-700 py-3 px-4 rounded-lg hover:bg-yellow-100 transition-all duration-200 text-sm font-medium border border-yellow-200"
          >
            📁 All Projects
          </button>
          <button 
            onClick={() => setActiveTab('kanban')}
            className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200"
          >
            📋 Kanban Board
          </button>
        </div>
      </div>

      {/* Add Future Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Future Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newFutureProject.title}
                  onChange={(e) => setNewFutureProject({...newFutureProject, title: e.target.value})}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newFutureProject.description}
                  onChange={(e) => setNewFutureProject({...newFutureProject, description: e.target.value})}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newFutureProject.phase}
                  onChange={(e) => setNewFutureProject({...newFutureProject, phase: e.target.value})}
                >
                  <option value="Planning phase">Planning phase</option>
                  <option value="Research phase">Research phase</option>
                  <option value="Development phase">Development phase</option>
                  <option value="Testing phase">Testing phase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newFutureProject.members}
                  onChange={(e) => setNewFutureProject({...newFutureProject, members: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newFutureProject.color}
                  onChange={(e) => setNewFutureProject({...newFutureProject, color: e.target.value})}
                >
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    onClick={addTag}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newFutureProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                  onClick={addFutureProject}
                >
                  Add Project
                </button>
                <button
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityFeed = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'project',
      user: 'Arun Kumar',
      action: 'created a new project',
      target: 'Machine Learning Assignment',
      time: '2 minutes ago',
      icon: '📁',
      color: 'blue'
    },
    {
      id: '2',
      type: 'message',
      user: 'Priya Sharma',
      action: 'sent a message in',
      target: 'General Chat',
      time: '5 minutes ago',
      icon: '💬',
      color: 'green'
    },
    {
      id: '3',
      type: 'file',
      user: 'Rahul Patel',
      action: 'uploaded a file',
      target: 'lecture_notes.pdf',
      time: '10 minutes ago',
      icon: '📄',
      color: 'purple'
    },
    {
      id: '4',
      type: 'meeting',
      user: 'Dr. Kumar',
      action: 'scheduled a meeting',
      target: 'Project Review',
      time: '15 minutes ago',
      icon: '📅',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
            <p className="text-sm text-gray-500">Recent team activities</p>
          </div>
        </div>
        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:bg-orange-50 px-3 py-1 rounded-lg transition-all duration-200">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
            <div className={`w-8 h-8 ${getColorClasses(activity.color)} rounded-lg flex items-center justify-center text-sm`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600"> {activity.action} </span>
                <span className="font-medium text-gray-900">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-orange-50 text-orange-700 py-3 px-4 rounded-lg hover:bg-orange-100 transition-all duration-200 text-sm font-medium border border-orange-200">
            📊 All Activities
          </button>
          <button className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200">
            🔔 Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickActions = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const actions = [
    {
      title: 'Join Voice Chat',
      icon: '🎤',
      color: 'blue',
      action: () => setActiveTab('voice'),
      description: 'Start voice communication'
    },
    {
      title: 'Create Note',
      icon: '📝',
      color: 'green',
      action: () => setActiveTab('notes'),
      description: 'Write quick notes'
    },
    {
      title: 'Open Whiteboard',
      icon: '🎨',
      color: 'purple',
      action: () => setActiveTab('whiteboard'),
      description: 'Collaborative drawing'
    },
    {
      title: 'Schedule Meeting',
      icon: '📅',
      color: 'orange',
      action: () => setActiveTab('meetings'),
      description: 'Plan team meetings'
    },
    {
      title: 'Upload File',
      icon: '📁',
      color: 'indigo',
      action: () => setActiveTab('library'),
      description: 'Share documents'
    },
    {
      title: 'VS Code',
      icon: '🖥️',
      color: 'gray',
      action: () => setActiveTab('vscode'),
      description: 'Code together'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Access tools instantly</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`p-4 rounded-xl border transition-all duration-200 ${getColorClasses(action.color)} group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.icon}</span>
              <div className="text-left">
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs opacity-75">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Owner usernames (email prefix) - used in isOwner function

// Main component wrapped with Suspense to handle the workStore error
function HomeContent(): ReactElement {
  // Live date and time state (must be at the very top)
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  // Format date and time for display
  const formattedTime = dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = dateTime.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [futureProjects, setFutureProjects] = useState<FutureProject[]>([
    {
      id: '1',
      title: 'AI Research Project',
      description: 'Advanced machine learning algorithms for data analysis',
      phase: 'Planning phase',
      members: 4,
      tags: ['AI', 'ML', 'Research'],
      color: 'blue'
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for campus services',
      phase: 'Development phase',
      members: 6,
      tags: ['Mobile', 'React Native', 'UI/UX'],
      color: 'green'
    }
  ]);
  // Authentication states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add state for VS Code tab selection
  const [vsTab, setVsTab] = useState<'advanced' | 'monaco'>('advanced');
  // State for notifications with proper type for timestamp
  const [notifications, setNotifications] = useState<{
    id: string;
    message: string;
    timestamp: Timestamp;
    userEmail?: string;
  }[]>([]);

  // Add notification to Firestore - wrapped in useCallback to prevent recreation on each render
  const addNotification = useCallback(async (message: string) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'notifications'), {
        message,
        timestamp: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [user]);

  const clearNotifications = async () => {
    try {
      // Delete all notifications
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      const batch = writeBatch(db);
      notificationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Listen for notifications
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(10) // Only keep the 10 most recent notifications
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        message: doc.data().message,
        timestamp: doc.data().timestamp,
        userEmail: doc.data().userEmail
      }));
      setNotifications(notificationsList);
    });
    
    return () => unsubscribe();
  }, [user, addNotification]); // Added addNotification to dependency array

  // Live dashboard stats
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [meetingCount, setMeetingCount] = useState<number | null>(null);
  const [fileCount, setFileCount] = useState<number | null>(null);

  // Fetch project count
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), snap => {
      setProjectCount(snap.size);
    });
    return () => unsub();
  }, []);

  // Fetch member count
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setMemberCount(snap.size);
    });
    return () => unsub();
  }, []);

  // Fetch file count
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'files'), snap => {
      setFileCount(snap.size);
    });
    return () => unsub();
  }, []);

  // Fetch today's meetings count
  useEffect(() => {
    // Get today's date string in YYYY-MM-DD format
    const todayStr = new Date().toISOString().slice(0, 10);
    const q = query(
      collection(db, 'meetings'),
      where('date', '==', todayStr)
    );
    const unsub = onSnapshot(q, snap => {
      setMeetingCount(snap.size);
    });
    return () => unsub();
  }, []);

  // DEBUG: Log users and meetings collection data
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      console.log('USERS COLLECTION:', snap.docs.map(doc => doc.data()));
    });
    const unsubMeetings = onSnapshot(collection(db, 'meetings'), snap => {
      console.log('MEETINGS COLLECTION:', snap.docs.map(doc => doc.data()));
    });
    return () => {
      unsubUsers();
      unsubMeetings();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        syncUserToDatabase(user);
        addNotification(`Welcome back, ${user.email?.split('@')[0]}! 👋`);
      } else {
        // If you want to set offline for previous user, you need to track previous user
        // For now, this will only set offline if user logs out from this session
      }
    });
    return () => unsubscribe();
  }, [addNotification]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}) as ChatMessage).reverse();
      setChatMessages(messages);
    });
    return () => unsubscribe();
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    await addDoc(collection(db, 'chats'), {
      user: user.email,
      text: message,
      timestamp: Timestamp.now()
    });
    setMessage('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setAuthError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      if (userCredential && userCredential.user) {
        syncUserToDatabase(userCredential.user);
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        setAuthError((error as { message: string }).message);
      } else {
        setAuthError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      addNotification("You've been logged out.");
    } catch (error) {
      console.error("Error signing out: ", error);
      addNotification("Error logging out.");
    }
  };

  const handleSwitchAccount = () => {
    setUser(null); // This will show the login form
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projectCount !== null ? projectCount : '...'}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{memberCount !== null ? memberCount : '...'}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Meetings Today</p>
                    <p className="text-2xl font-bold text-gray-900">{meetingCount !== null ? meetingCount : '...'}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Files Shared</p>
                    <p className="text-2xl font-bold text-gray-900">{fileCount !== null ? fileCount : '...'}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <ProjectsSection futureProjects={futureProjects} setActiveTab={setActiveTab} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
              <ChatSection 
                messages={chatMessages}
                sendMessage={sendMessage}
                message={message}
                setMessage={setMessage}
                setActiveTab={setActiveTab}
              />
            </motion.div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <ChatSection 
                  messages={chatMessages}
                  sendMessage={sendMessage}
                  message={message}
                  setMessage={setMessage}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
              <LibrarySection setActiveTab={setActiveTab} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <QuickActions setActiveTab={setActiveTab} />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <FuturePlanningSection setActiveTab={setActiveTab} futureProjects={futureProjects} setFutureProjects={setFutureProjects} />
            </motion.div>
          </div>
        );
      case 'projects':
        return <KanbanBoard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'meetings':
        return <MeetingScheduler />;
      case 'notes':
        return <NotesManager />;
      case 'whiteboard':
        return <Whiteboard />;
      case 'library':
        return <Library />;
      case 'voice':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Voice Chat Room</h2>
                  <p className="text-gray-600">Real-time voice communication with your team</p>
                </div>
              </div>
              <VoiceRoom roomName="IITJodhpurBatchVoiceRoom" />
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Team Communication</h2>
                  <p className="text-gray-600">Chat with team members and manage discussions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RoomChat roomId="main-room" currentUser={user?.email || 'Anonymous'} />
                </div>
                <div>
                  <MemberList currentUserId={user?.uid || ''} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'knime':
        return <KnimeOutput />;
      case 'colab':
        return <GoogleColab />;
      case 'vscode':
        return (
          <div className="flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden" style={{padding: 0, margin: 0}}>
            {/* Top Tab Bar */}
            <div className="flex items-center h-12 bg-[#181a20] border-b border-[#23272e] px-2 gap-1 select-none">
              <button
                onClick={() => setVsTab('advanced')}
                className={`px-6 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none ${
                  vsTab === 'advanced'
                    ? 'bg-[#181a20] text-white border-[#2563eb]'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                Online VS Code
              </button>
              <button
                onClick={() => setVsTab('monaco')}
                className={`px-6 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none ${
                  vsTab === 'monaco'
                    ? 'bg-[#181a20] text-white border-[#2563eb]'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                Monaco Editor
              </button>
            </div>
            {/* Editor Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <VSCodeSelector selectedOption={vsTab} />
            </div>
          </div>
        );
      case 'activity':
        return <ActivityFeed />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">IITCohort</h1>
            <p className="text-gray-600">Smart Batch Collaboration Platform</p>
          </div>
          
          {/* Authentication Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
          <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
              </div>
            </div>
            
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your password"
                    required
                  />
          <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
                </div>
              </div>
            )}
            
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          

        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
           style={{ minWidth: sidebarOpen ? 256 : 0 }}>
        <Sidebar onSelect={setActiveTab} activeTab={activeTab} />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toggle Sidebar Button */}
        <button
          className="absolute top-4 left-4 z-50 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition-all"
          onClick={() => setSidebarOpen(open => !open)}
          style={{ left: sidebarOpen ? 272 : 16, transition: 'left 0.3s' }}
          title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Header */}
        <header className="bg-white/80 glass-card shadow-lg border-b border-white/30 px-8 py-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">I</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IITCohort</h1>
                <p className="text-sm text-gray-500">Smart Collaboration Platform</p>
              </div>
            </div>
            {/* Live Date and Time - modern look */}
            <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-gradient-to-r from-yellow-100 to-blue-100 shadow-sm border border-blue-200">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/>
              </svg>
              <span className="font-semibold text-blue-700 tracking-wide">{formattedDate}</span>
              <span className="text-gray-400 font-bold">|</span>
              <span className="font-mono text-lg text-blue-900">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Activity Feed Button */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
                <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
            </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Search className="w-5 h-5" />
              </button>
              {/* Notification Bell - Visible to all users */}
              <NotificationBell
                notifications={notifications}
                onClear={clearNotifications}
                onAddNotification={(message) => {
                  if (isOwner(user)) {
                    addNotification(message);
                  }
                }}
                user={user}
              />
              <button className="text-gray-500 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              {user && (
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onSwitchAccount={handleSwitchAccount}
                />
              )}
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main
          className={
            activeTab === 'vscode'
              ? 'flex-1 overflow-hidden p-0'
              : 'flex-1 overflow-auto p-8'
          }
        >
          {activeTab === 'vscode' ? (
            renderTabContent()
          ) : (
            <div className="glass-card shadow-xl p-8 mb-8">
          {activeTab === 'dashboard' && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
                    <h2 className="text-3xl font-bold mb-2">
                      Welcome back, {user.email?.split('@')[0]}! 👋
              </h2>
                    <p className="text-blue-100 text-lg">
                Your smart collaboration hub for IIT batch projects and learning
              </p>
                  </div>
            </div>
          )}
          {renderTabContent()}
            </div>
          )}
        </main>
        {/* Notification Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  {notification.userEmail && (
                    <p className="text-xs text-gray-500">From: {notification.userEmail}</p>
                  )}
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tab configuration moved to component usage

export default function Page() {
  return <HomeContent />;
}