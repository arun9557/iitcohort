// iit_batch_collab_platform: Next.js + Firebase starter

'use client';

import { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  BookOpen, 
  MessageCircle, 
  Lightbulb,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  X,
  Video,
  Image,
  Music,
  Download,
  Mail,
  Lock,
  Eye,
  EyeOff
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
import { auth, db, syncUserToDatabase, setUserOffline } from "../firebase";
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

interface Lecture {
  id: string;
  title: string;
  professor: string;
  duration: string;
  progress: number;
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5 text-blue-500" />
          Projects Discussion
        </h3>
        <div className="flex gap-2">
          <button 
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition text-sm"
            onClick={() => setActiveTab('projects')}
          >
            View All
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {/* Current Projects */}
        {projects.map((project) => (
          <div key={project.id} className={`p-3 rounded-lg border-l-4 ${getColorClasses(project.color)}`}>
            <h4 className="font-semibold text-gray-900">{project.title}</h4>
            <p className="text-sm text-gray-800">{project.description}</p>
          </div>
        ))}
        
        {/* Future Projects */}
        {futureProjects.map((project) => (
          <div key={`future-${project.id}`} className={`p-3 rounded-lg border-l-4 ${getColorClasses(project.color)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{project.title}</h4>
                <p className="text-sm text-gray-800">{project.description}</p>
                <div className="mt-2 flex gap-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Future</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('projects')}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            📁 All Projects
          </button>
          <button 
            onClick={() => setActiveTab('kanban')}
            className="flex-1 bg-purple-50 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
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

const LecturesSection = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [lectures, setLectures] = useState<Lecture[]>([
    { id: '1', title: 'Data Structures & Algorithms', professor: 'Dr. Sharma', duration: '2 hours', progress: 75 },
    { id: '2', title: 'Machine Learning Basics', professor: 'Prof. Patel', duration: '1.5 hours', progress: 45 },
    { id: '3', title: 'Database Management', professor: 'Dr. Kumar', duration: '3 hours', progress: 90 }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLecture, setNewLecture] = useState({ title: '', professor: '', duration: '', progress: 0 });

  const addLecture = () => {
    if (newLecture.title.trim() && newLecture.professor.trim()) {
      const lecture: Lecture = {
        id: Date.now().toString(),
        ...newLecture
      };
      setLectures([...lectures, lecture]);
      setNewLecture({ title: '', professor: '', duration: '', progress: 0 });
      setShowAddModal(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Lecture Content
        </h3>
        <div className="flex gap-2">
          <button 
            className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition text-sm"
            onClick={() => setActiveTab('library')}
          >
            View All
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-gray-900">{lecture.title}</h4>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{lecture.duration}</span>
            </div>
            <p className="text-xs text-gray-800 mb-2">by {lecture.professor}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${lecture.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-800 mt-1">
              <span>Progress</span>
              <span>{lecture.progress}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('library')}
            className="flex-1 bg-indigo-50 text-indigo-700 py-2 px-3 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
          >
            📚 Library
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition text-sm font-medium"
          >
            📝 Notes
          </button>
        </div>
      </div>

      {/* Add Lecture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Lecture</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
                  placeholder="Enter lecture title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLecture.professor}
                  onChange={(e) => setNewLecture({...newLecture, professor: e.target.value})}
                  placeholder="Enter professor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLecture.duration}
                  onChange={(e) => setNewLecture({...newLecture, duration: e.target.value})}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLecture.progress}
                  onChange={(e) => setNewLecture({...newLecture, progress: parseInt(e.target.value) || 0})}
                  placeholder="0-100"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition"
                  onClick={addLecture}
                >
                  Add Lecture
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
  <div className="bg-white rounded-lg p-6 shadow-sm min-h-[500px] lg:min-h-[650px] h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <MessageCircle className="w-5 h-5 text-green-500" />
        Quick Chat
      </h3>
      <div className="flex gap-2">
        <button 
          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition text-sm"
          onClick={() => setActiveTab('members')}
        >
          View All
        </button>
      </div>
    </div>
    <div className="space-y-3 mb-4 max-h-[400px] lg:max-h-[600px] overflow-y-auto flex-1">
      {messages.slice(-20).map((msg, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {msg.user.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">{msg.user}</span>
              <span className="text-xs text-gray-500">
                {msg.timestamp && typeof msg.timestamp === 'object' && typeof msg.timestamp.toDate === 'function'
                  ? msg.timestamp.toDate().toLocaleTimeString()
                  : (typeof msg.timestamp === 'string' || typeof msg.timestamp === 'number')
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : ''}
              </span>
            </div>
            <p className="text-sm text-gray-900">{msg.text}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
      >
        Send
      </button>
    </div>
    
    {/* Quick Actions */}
    <div className="pt-4 border-t border-gray-200">
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('members')}
          className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition text-sm font-medium"
        >
          🧑‍🤝‍🧑 Members
        </button>
        <button 
          onClick={() => setActiveTab('voice')}
          className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
        >
          🎤 Voice Chat
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
      case 'image': return <Image className="w-4 h-4 text-green-500" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Recent Library Files
        </h3>
        <button 
          className="text-purple-500 hover:text-purple-700 text-sm font-medium"
          onClick={() => setActiveTab('library')}
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {recentFiles.map((file) => (
          <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="flex-shrink-0">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">{file.title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{file.size}</span>
                <span>•</span>
                <span>{file.uploadedBy}</span>
                <span>•</span>
                <span>{file.date}</span>
              </div>
            </div>
            <button className="text-purple-500 hover:text-purple-700">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">Total Files: 127</span>
          <span className="text-gray-600">Storage: 2.3 GB</span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('library')}
            className="flex-1 bg-purple-50 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
          >
            📚 Full Library
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition text-sm font-medium"
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Future Projects
        </h3>
        <button 
          className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {futureProjects.map((project) => (
          <div 
            key={project.id} 
            className={`p-3 rounded-lg border-l-4 ${getColorClasses(project.color)} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => handleProjectClick(project)}
          >
            <h4 className="font-semibold text-gray-900">{project.title}</h4>
            <p className="text-sm text-gray-800">{project.description}</p>
            <div className="mt-2 flex gap-2">
              {project.tags.map((tag, index) => (
                <span key={index} className={`${getTagColorClasses(project.color)} text-xs px-2 py-1 rounded`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('projects')}
            className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            📁 All Projects
          </button>
          <button 
            onClick={() => setActiveTab('kanban')}
            className="bg-purple-50 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
          >
            📋 Kanban Board
          </button>
          <button 
            onClick={() => setActiveTab('meetings')}
            className="bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition text-sm font-medium"
          >
             Meetings
          </button>
          <button 
            onClick={() => setActiveTab('whiteboard')}
            className="bg-orange-50 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-100 transition text-sm font-medium"
          >
            🎨 Whiteboard
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

// Main component wrapped with Suspense to handle the workStore error
function HomeContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        syncUserToDatabase(user);
      } else {
        // If you want to set offline for previous user, you need to track previous user
        // For now, this will only set offline if user logs out from this session
      }
    });
    return () => unsubscribe();
  }, []);

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
    if (user) {
      setUserOffline(user);
    }
    await signOut(auth);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProjectsSection futureProjects={futureProjects} setActiveTab={setActiveTab} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LecturesSection setActiveTab={setActiveTab} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="h-full"
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
              transition={{ delay: 0.4 }}
            >
              <LibrarySection setActiveTab={setActiveTab} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2 lg:col-span-3"
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Voice Chat Room</h2>
              <VoiceRoom roomName="IITJodhpurBatchVoiceRoom" />
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Room Chat</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    <div className="flex h-screen bg-gray-50">
      {/* Discord-style Sidebar */}
      <Sidebar onSelect={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">IITCohort</h1>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Beta</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                Welcome back, {user.email}!
              </h2>
              <p className="text-gray-600">
                Your smart collaboration hub for IIT batch projects and learning
              </p>
            </div>
          )}
          
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

// Tab configuration moved to component usage

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}