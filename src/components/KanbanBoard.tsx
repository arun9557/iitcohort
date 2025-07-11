'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  User, 
  GripVertical,
  X
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'done';
  assignee: string;
  dueDate: string;
  progress: number; // 0-100
  notes?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

// Add owner badge logic (reuse from other files)
const ownerUsernames = [
  'arun2061292007',
  'arunshekhram',
  'meettomar07',
  'ashishkrs1977',
  'shubham229177',
];
const isOwner = (user: string) => {
  if (!user) return false;
  if (ownerUsernames.includes(user)) return true;
  if (user.includes('@')) {
    const uname = user.split('@')[0];
    if (ownerUsernames.includes(uname)) return true;
  }
  return false;
};

// Sortable Task Component
function SortableTask({ task, onClick, columnId }: { task: Task, onClick: (task: Task) => void, columnId?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    boxShadow: isDragging ? '0 8px 32px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.06)',
    border: isDragging ? '2px solid #2563eb' : '1px solid #e5e7eb',
    scale: isDragging ? 1.04 : 1,
  };

  // Progress bar color logic
  let progressBarColor = 'bg-blue-500';
  if (columnId === 'in-progress') progressBarColor = 'bg-yellow-400';
  if (task.progress === 100) progressBarColor = 'bg-green-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl p-5 mb-4 cursor-pointer transition-all duration-200 select-none ${isDragging ? 'opacity-90 scale-105 ring-2 ring-blue-500' : 'hover:shadow-lg'} group border border-gray-100`}
      onClick={() => onClick(task)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <h4 className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors">{task.title}</h4>
        </div>
        <span
          className="cursor-grab p-1 rounded hover:bg-blue-50 active:bg-blue-100 border border-gray-200 group-hover:border-blue-400 transition"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-800">
        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
          {task.assignee?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
        </span>
        <span className="font-medium text-gray-900">{task.assignee || 'Unassigned'}</span>
        {isOwner(task.assignee) && (
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">Owner</span>
        )}
        <Calendar className="w-3 h-3 text-gray-400 ml-3" />
        <span className="text-gray-500">{task.dueDate}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div className={`h-2.5 rounded-full transition-all duration-200 ${progressBarColor}`} style={{ width: `${task.progress}%` }}></div>
      </div>
      <div className="text-xs text-gray-700 font-semibold flex justify-between items-center">
        <span>Progress: {task.progress}%</span>
        {task.progress === 100 && <span className="text-green-600 font-bold">Done</span>}
      </div>
    </div>
  );
}

function KanbanColumn({ column, children }: { column: Column, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl p-5 shadow-lg min-h-[350px] transition-all duration-200 border border-gray-100 ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      {children}
    </motion.div>
  );
}

// Add Modal component
function ProjectModal({ open, onClose, project, onSave }: { open: boolean, onClose: () => void, project: Task | null, onSave: (task: Task) => void }) {
  const [edit, setEdit] = useState<Task | null>(project);
  useEffect(() => { setEdit(project); }, [project]);
  if (!open || !edit) return null;
  return (
    <div className="fixed inset-0 z-50 w-full h-full flex items-start justify-center bg-transparent">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="bg-neutral-50 border border-gray-100 w-full h-full max-w-none max-h-none rounded-none shadow-2xl p-0 relative overflow-auto">
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 z-10" onClick={onClose}><X className="w-7 h-7" /></button>
        <div className="px-12 pt-10 pb-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗂️</span>
            <input className="bg-transparent text-3xl font-extrabold outline-none w-full" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} />
          </div>
          <div className="text-gray-400 text-sm mb-6 border-b pb-4">Project Details</div>
          <div className="space-y-7">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</div>
              <textarea className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none" rows={4} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} placeholder="Describe this project..." />
            </div>
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</div>
                <select className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none" value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as Task['status'] })}>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assignee</div>
                <input className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none" value={edit.assignee} onChange={e => setEdit({ ...edit, assignee: e.target.value })} placeholder="Who is responsible?" />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Progress</div>
              <input type="range" min={0} max={100} value={edit.progress} onChange={e => setEdit({ ...edit, progress: Number(e.target.value) })} className="w-full accent-blue-500" />
              <div className="text-sm text-gray-500 mt-1">{edit.progress}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</div>
              <textarea className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-400 outline-none" rows={3} value={edit.notes || ''} onChange={e => setEdit({ ...edit, notes: e.target.value })} placeholder="Add any notes or comments..." />
            </div>
          </div>
          <div className="flex justify-end mt-10 mb-2">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition" onClick={() => { onSave(edit); onClose(); }}>Save</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type KanbanBoardProps = {
  projectId?: string;
  // aur bhi props ho toh yahan likhein
};

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  // Use projectId to avoid lint error
  void projectId;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'not-started',
      title: 'Not Started',
      tasks: [],
      color: 'bg-gray-100',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [],
      color: 'bg-blue-100',
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [],
      color: 'bg-green-100',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Real-time Firestore sync
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setColumns([
      {
          id: 'not-started',
          title: 'Not Started',
          tasks: fetched.filter(t => t.status === 'not-started'),
        color: 'bg-gray-100',
      },
      {
        id: 'in-progress',
        title: 'In Progress',
          tasks: fetched.filter(t => t.status === 'in-progress'),
        color: 'bg-blue-100',
      },
      {
        id: 'done',
        title: 'Done',
          tasks: fetched.filter(t => t.status === 'done'),
        color: 'bg-green-100',
      },
    ]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Add new task to Firestore
  const addTask = async (columnId: string) => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New project',
      description: '',
      assignee: 'Unassigned',
      dueDate: new Date().toISOString().split('T')[0],
      status: columnId as Task['status'],
      progress: 0,
    };
    await addDoc(collection(db, 'tasks'), newTask);
  };

  // Update task in Firestore
  const handleSaveTask = async (updated: Task) => {
    const { id, ...fields } = updated;
    await updateDoc(doc(db, 'tasks', id), fields);
  };

  // Drag-and-drop: update status in Firestore
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    if (active.id === over.id) return;
    // Find the task and update its status
    const allTasks = columns.flatMap(col => col.tasks);
    const movedTask = allTasks.find(t => t.id === active.id);
    if (!movedTask) return;
    // Find the column droppable id
    let destColId = null;
    for (const col of columns) {
      if (col.tasks.some(t => t.id === over.id)) {
        destColId = col.id;
        break;
      }
    }
    // If dropped on empty column area
    if (!destColId && columns.some(col => col.id === over.id)) {
      destColId = over.id;
    }
    if (!destColId) return;
    const { id, ...fields } = movedTask;
    await updateDoc(doc(db, 'tasks', id), { ...fields, status: destColId });
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  if (loading) return <div className="p-4 text-gray-500">Loading tasks...</div>;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg shadow-sm">
      <div className="p-8 border-b bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
            Project Kanban Board
          </h3>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow font-semibold">
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={({active}) => {
          const allTasks = columns.flatMap(col => col.tasks);
          setActiveTask(allTasks.find(t => t.id === active.id) || null);
        }}
      >
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SortableContext
              items={columns.map(col => col.id)}
              strategy={rectSortingStrategy}
            >
            {columns.map((column, idx) => (
                <KanbanColumn key={column.id} column={column}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {idx === 0 && <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>}
                      {idx === 1 && <span className="w-2.5 h-2.5 bg-blue-400 rounded-full"></span>}
                      {idx === 2 && <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>}
                      {column.title}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold border border-gray-200">{column.tasks.length}</span>
                  </div>
                  <SortableContext
                    items={column.tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {column.tasks.map((task) => (
                      <SortableTask key={task.id} task={task} onClick={handleCardClick} columnId={column.id} />
                    ))}
                  </SortableContext>
                  <button
                    onClick={() => addTask(column.id)}
                    className="w-full mt-4 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center justify-center gap-2 font-semibold shadow-sm border border-blue-100"
                  >
                    <Plus className="w-4 h-4" />
                    + New project
                  </button>
                </KanbanColumn>
            ))}
            </SortableContext>
          </div>
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="bg-white rounded-2xl p-5 mb-4 cursor-pointer transition-all duration-200 select-none opacity-95 scale-105 ring-2 ring-blue-500 shadow-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h4 className="font-bold text-base text-gray-900">{activeTask.title}</h4>
                </div>
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-800">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {activeTask.assignee?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </span>
                <span className="font-medium text-gray-900">{activeTask.assignee || 'Unassigned'}</span>
                {isOwner(activeTask.assignee) && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">Owner</span>
                )}
                <Calendar className="w-3 h-3 text-gray-400 ml-3" />
                <span className="text-gray-500">{activeTask.dueDate}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className={`h-2.5 rounded-full transition-all duration-200 ${activeTask.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${activeTask.progress}%` }}></div>
              </div>
              <div className="text-xs text-gray-700 font-semibold flex justify-between items-center">
                <span>Progress: {activeTask.progress}%</span>
                {activeTask.progress === 100 && <span className="text-green-600 font-bold">Done</span>}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
      {/* Stats */}
      <div className="px-8 py-6 bg-white border-t rounded-b-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {columns.reduce((total, col) => total + col.tasks.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {columns.find(col => col.id === 'in-progress')?.tasks.length || 0}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {columns.find(col => col.id === 'done')?.tasks.length || 0}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} project={selectedTask} onSave={handleSaveTask} />
      </AnimatePresence>
    </div>
  );
} 