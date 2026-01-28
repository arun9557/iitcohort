// iit_batch_collab_platform: React + Vite + Firebase
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, limit, writeBatch, getDocs, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Users, FileText, BookOpen, MessageCircle, Lightbulb, Plus, Search, Settings, X, Video, ImageIcon, Music, Download, Mail, Lock, Eye, EyeOff, ChevronLeft, Menu } from 'lucide-react';
import Whiteboard from './components/resources/Whiteboard';
import KanbanBoard from './components/projects/KanbanBoard';
import MeetingScheduler from './components/projects/MeetingScheduler';
import NotesManager from './components/resources/NotesManager';
import Sidebar from './components/layout/Sidebar';
import VoiceRoom from './components/communication/VoiceRoom';
import MemberList from './components/layout/MemberList';
import RoomChat from './components/communication/RoomChat';
import Library from './components/resources/Library';
import KnimeOutput from './components/editors/KnimeOutput';
import VSCodeSelector from './components/editors/VSCodeSelector';
import GoogleColab from './components/editors/GoogleColab';
import UserMenu from './components/layout/UserMenu';
import NotificationBell from './components/layout/NotificationBell';
import { auth, db, syncUserToDatabase } from "./firebase";
import { isOwner } from "./utils/auth";
// Feature components
import ProjectsSection from './components/dashboard/ProjectsSection';
import ChatSection from './components/dashboard/ChatSection';
import LibrarySection from './components/dashboard/LibrarySection';
import FuturePlanningSection from './components/dashboard/FuturePlanningSection';
import ActivityFeed from './components/dashboard/ActivityFeed';
import QuickActions from './components/dashboard/QuickActions';

// Owner usernames (email prefix) - used in isOwner function
// Main component wrapped with Suspense to handle the workStore error
export default function App() {
  // ... rest of HomeContent code ...

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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [futureProjects, setFutureProjects] = useState([
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
  const [vsTab, setVsTab] = useState('advanced');
  // State for notifications with proper type for timestamp
  const [notifications, setNotifications] = useState([]);
  // Add notification to Firestore - wrapped in useCallback to prevent recreation on each render
  const addNotification = useCallback(async (message) => {
    if (!user)
      return;
    try {
      await addDoc(collection(db, 'notifications'), {
        message,
        timestamp: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email
      });
    }
    catch (error) {
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
    }
    catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  // Listen for notifications
  useEffect(() => {
    if (!user)
      return;
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(10) // Only keep the 10 most recent notifications
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
  const [projectCount, setProjectCount] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [meetingCount, setMeetingCount] = useState(null);
  const [fileCount, setFileCount] = useState(null);
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
    const q = query(collection(db, 'meetings'), where('date', '==', todayStr));
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
      }
      else {
        // If you want to set offline for previous user, you need to track previous user
        // For now, this will only set offline if user logs out from this session
      }
    });
    return () => unsubscribe();
  }, [addNotification]);
  useEffect(() => {
    if (!user)
      return;
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).reverse();
      setChatMessages(messages);
    });
    return () => unsubscribe();
  }, [user]);
  const sendMessage = async () => {
    if (!message.trim() || !user)
      return;
    await addDoc(collection(db, 'chats'), {
      user: user.email,
      text: message,
      timestamp: Timestamp.now()
    });
    setMessage('');
  };
  const handleAuth = async (e) => {
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
      }
      else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      if (userCredential && userCredential.user) {
        syncUserToDatabase(userCredential.user);
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
    catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setAuthError(error.message);
      }
      else {
        setAuthError('An unknown error occurred');
      }
    }
    finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      addNotification("You've been logged out.");
    }
    catch (error) {
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
        return (<div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
              <ProjectsSection futureProjects={futureProjects} setActiveTab={setActiveTab} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <ChatSection messages={chatMessages} sendMessage={sendMessage} message={message} setMessage={setMessage} setActiveTab={setActiveTab} />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <ChatSection messages={chatMessages} sendMessage={sendMessage} message={message} setMessage={setMessage} setActiveTab={setActiveTab} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <LibrarySection setActiveTab={setActiveTab} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <QuickActions setActiveTab={setActiveTab} />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <FuturePlanningSection setActiveTab={setActiveTab} futureProjects={futureProjects} setFutureProjects={setFutureProjects} />
          </motion.div>
        </div>);
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
        return (<div className="space-y-6">
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
        </div>);
      case 'members':
        return (<div className="space-y-6">
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
        </div>);
      case 'knime':
        return <KnimeOutput />;
      case 'colab':
        return <GoogleColab />;
      case 'vscode':
        return (<div className="flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden" style={{ padding: 0, margin: 0 }}>
          {/* Top Tab Bar */}
          <div className="flex items-center h-12 bg-[#181a20] border-b border-[#23272e] px-2 gap-1 select-none">
            <button onClick={() => setVsTab('advanced')} className={`px-6 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none ${vsTab === 'advanced'
              ? 'bg-[#181a20] text-white border-[#2563eb]'
              : 'bg-transparent text-gray-400 border-transparent hover:text-white'}`}>
              Online VS Code
            </button>
            <button onClick={() => setVsTab('monaco')} className={`px-6 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none ${vsTab === 'monaco'
              ? 'bg-[#181a20] text-white border-[#2563eb]'
              : 'bg-transparent text-gray-400 border-transparent hover:text-white'}`}>
              Monaco Editor
            </button>
          </div>
          {/* Editor Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <VSCodeSelector selectedOption={vsTab} />
          </div>
        </div>);
      case 'activity':
        return <ActivityFeed />;
      default:
        return null;
    }
  };
  if (!user) {
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500" placeholder="Enter your email" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500" placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (<div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300 text-gray-900 placeholder-gray-500" placeholder="Confirm your password" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>)}

          {authError && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {authError}
          </div>)}

          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => {
            setIsSignUp(!isSignUp);
            setAuthError('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>


      </motion.div>
    </div>);
  }
  return (<div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Sidebar */}
    <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`} style={{ minWidth: sidebarOpen ? 256 : 0 }}>
      <Sidebar onSelect={setActiveTab} activeTab={activeTab} />
    </div>
    {/* Main Content Area */}
    <div className="flex-1 flex flex-col">
      {/* Toggle Sidebar Button */}
      <button className="absolute top-4 left-4 z-50 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition-all" onClick={() => setSidebarOpen(open => !open)} style={{ left: sidebarOpen ? 272 : 16, transition: 'left 0.3s' }} title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}>
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
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
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
            <NotificationBell notifications={notifications} onClear={clearNotifications} onAddNotification={(message) => {
              if (isOwner(user)) {
                addNotification(message);
              }
            }} user={user} />
            <button className="text-gray-500 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            {user && (<UserMenu user={user} onLogout={handleLogout} onSwitchAccount={handleSwitchAccount} />)}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className={activeTab === 'vscode'
        ? 'flex-1 overflow-hidden p-0'
        : 'flex-1 overflow-auto p-8'}>
        {activeTab === 'vscode' ? (renderTabContent()) : (<div className="glass-card shadow-xl p-8 mb-8">
          {activeTab === 'dashboard' && (<div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user.email?.split('@')[0]}! 👋
              </h2>
              <p className="text-blue-100 text-lg">
                Your smart collaboration hub for IIT batch projects and learning
              </p>
            </div>
          </div>)}
          {renderTabContent()}
        </div>)}
      </main>
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (<motion.div key={index} initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
              {notification.userEmail && (<p className="text-xs text-gray-500">From: {notification.userEmail}</p>)}
            </div>
            <button onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>))}
      </div>
    </div>
  </div>);
}

