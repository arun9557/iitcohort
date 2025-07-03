'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
// import dynamic from 'next/dynamic';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  attendees: string[];
  location: string;
  meetingLink: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
  createdAt: Timestamp;
}

const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Web Development Team Sync',
    description: 'Weekly sync meeting for the web development project',
    date: '2024-01-15',
    time: '10:00',
    duration: 60,
    attendees: ['alice@iitcohort.com', 'bob@iitcohort.com', 'charlie@iitcohort.com'],
    location: 'Room 301, Computer Science Building',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    organizer: 'alice@iitcohort.com',
    createdAt: Timestamp.now()
  },
  {
    id: '2',
    title: 'Machine Learning Project Review',
    description: 'Review session for the ML assignment submission',
    date: '2024-01-16',
    time: '14:30',
    duration: 90,
    attendees: ['bob@iitcohort.com', 'diana@iitcohort.com'],
    location: 'Online',
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'scheduled',
    organizer: 'bob@iitcohort.com',
    createdAt: Timestamp.now()
  },
  {
    id: '3',
    title: 'Database Design Discussion',
    description: 'Discussion about the database schema design',
    date: '2024-01-14',
    time: '16:00',
    duration: 45,
    attendees: ['charlie@iitcohort.com', 'alice@iitcohort.com'],
    location: 'Library Study Room 2',
    meetingLink: '',
    status: 'completed',
    organizer: 'charlie@iitcohort.com',
    createdAt: Timestamp.now()
  }
];

// const Excalidraw = dynamic(
//   () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
//   { ssr: false }
// );

export default function MeetingScheduler() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    attendees: [],
    location: '',
    meetingLink: '',
    status: 'scheduled'
  });
  const [newAttendee, setNewAttendee] = useState('');
  const [editAttendee, setEditAttendee] = useState('');
  // const excalidrawRef = useRef<{ getSceneElements: () => unknown } | null>(null);

  useEffect(() => {
    // Load meetings from Firestore
    const unsubscribe = onSnapshot(collection(db, 'meetings'), (snapshot) => {
      const firestoreMeetings = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Meeting[];
      setMeetings(firestoreMeetings.length > 0 ? firestoreMeetings : initialMeetings);
    });

    return () => unsubscribe();
  }, []);

  const createMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) return;

    const meeting: Omit<Meeting, 'id'> = {
      title: newMeeting.title!,
      description: newMeeting.description || '',
      date: newMeeting.date!,
      time: newMeeting.time!,
      duration: newMeeting.duration || 60,
      attendees: newMeeting.attendees || [],
      location: newMeeting.location || '',
      meetingLink: newMeeting.meetingLink || '',
      status: 'scheduled',
      organizer: 'current-user@iitcohort.com',
      createdAt: Timestamp.now()
    };

    try {
      await addDoc(collection(db, 'meetings'), meeting);
      setNewMeeting({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        attendees: [],
        location: '',
        meetingLink: '',
        status: 'scheduled'
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    try {
      await updateDoc(doc(db, 'meetings', id), updates);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'meetings', id));
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const addAttendee = () => {
    if (newAttendee && !newMeeting.attendees?.includes(newAttendee)) {
      setNewMeeting(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), newAttendee]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendee: string) => {
    setNewMeeting(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a !== attendee) || []
    }));
  };

  const addEditAttendee = () => {
    if (editAttendee && editingMeeting && !editingMeeting.attendees.includes(editAttendee)) {
      setEditingMeeting(prev => prev ? {
        ...prev,
        attendees: [...prev.attendees, editAttendee]
      } : null);
      setEditAttendee('');
    }
  };

  const removeEditAttendee = (attendee: string) => {
    if (editingMeeting) {
      setEditingMeeting({
        ...editingMeeting,
        attendees: editingMeeting.attendees.filter(a => a !== attendee)
      });
    }
  };

  const handleEditSave = () => {
    if (editingMeeting) {
      updateMeeting(editingMeeting.id, editingMeeting);
    }
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'ongoing': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Save by projectId
  // const saveToProject = async (projectId: string) => {
  //   if (excalidrawRef.current) {
  //     const data = excalidrawRef.current.getSceneElements();
  //     await addDoc(collection(db, 'whiteboards'), {
  //       projectId,
  //       data,
  //       createdAt: Timestamp.now()
  //     });
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h2>
          <p className="text-gray-600">Schedule and manage team meetings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Meeting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Meeting title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={newMeeting.time}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Room number or online"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={newMeeting.meetingLink}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingLink: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Google Meet, Zoom, etc."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 h-20"
                placeholder="Meeting description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="email@example.com"
                  onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                />
                <button
                  onClick={addAttendee}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newMeeting.attendees?.map((attendee, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {attendee}
                    <button
                      onClick={() => removeAttendee(attendee)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={createMeeting}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Create Meeting
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold mb-4">Edit Meeting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editingMeeting.title}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Meeting title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editingMeeting.date}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, date: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={editingMeeting.time}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, time: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={editingMeeting.duration}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, duration: parseInt(e.target.value) } : null)}
                className="w-full border rounded-lg px-3 py-2"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editingMeeting.location}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, location: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Room number or online"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={editingMeeting.meetingLink}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, meetingLink: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Google Meet, Zoom, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editingMeeting.status}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, status: e.target.value as Meeting['status'] } : null)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingMeeting.description}
                onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="w-full border rounded-lg px-3 py-2 h-20"
                placeholder="Meeting description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={editAttendee}
                  onChange={(e) => setEditAttendee(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="email@example.com"
                  onKeyPress={(e) => e.key === 'Enter' && addEditAttendee()}
                />
                <button
                  onClick={addEditAttendee}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingMeeting.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {attendee}
                    <button
                      onClick={() => removeEditAttendee(attendee)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleEditSave}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingMeeting(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(meeting.date).toLocaleDateString()}
                  <Clock className="w-4 h-4" />
                  {meeting.time}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {getStatusIcon(meeting.status)}
                  {meeting.status}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingMeeting(meeting)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMeeting(meeting.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {meeting.description && (
              <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {meeting.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {meeting.location}
                </div>
              )}
              
              {meeting.meetingLink && (
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{meeting.attendees.length} attendees</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{meeting.duration} minutes</span>
              </div>
            </div>

            {meeting.attendees.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-700 mb-1">Attendees:</p>
                <div className="flex flex-wrap gap-1">
                  {meeting.attendees.slice(0, 3).map((attendee, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {attendee.split('@')[0]}
                    </span>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      +{meeting.attendees.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
          <p className="text-gray-600 mb-4">Create your first meeting to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Schedule Meeting
          </button>
        </div>
      )}
    </div>
  );
}
