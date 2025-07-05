'use client';

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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
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

// Sortable Task Component
function SortableTask({ task, onClick }: { task: Task, onClick: (task: Task) => void }) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''} bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 cursor-pointer`}
      onClick={() => onClick(task)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-base">{task.title}</h4>
        <span
          className="cursor-grab"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
        <User className="w-3 h-3 text-gray-500" />
        <span>{task.assignee}</span>
        <Calendar className="w-3 h-3 text-gray-500 ml-2" />
        <span>{task.dueDate}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
      </div>
      <div className="text-xs text-gray-500">Progress: {task.progress}%</div>
    </div>
  );
}

function KanbanColumn({ column, children }: { column: Column, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-lg p-4"
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

export default function KanbanBoard() {
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
    if (!over) return;
    if (active.id === over.id) return;
    // Find the task and update its status
    const allTasks = columns.flatMap(col => col.tasks);
    const movedTask = allTasks.find(t => t.id === active.id);
    if (!movedTask) return;
    const destCol = columns.find(col => col.id === over.id);
    if (!destCol) return;
    const { id, ...fields } = movedTask;
    await updateDoc(doc(db, 'tasks', id), { ...fields, status: destCol.id });
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  if (loading) return <div className="p-4 text-gray-500">Loading tasks...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Project Kanban Board</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{column.title}</h4>
                  <span className="text-sm text-gray-500">{column.tasks.length}</span>
                </div>
                <SortableContext
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {column.tasks.map((task) => (
                    <SortableTask key={task.id} task={task} onClick={handleCardClick} />
                  ))}
                </SortableContext>
                <button
                  onClick={() => addTask(column.id)}
                  className="w-full mt-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  + New project
                </button>
              </KanbanColumn>
            ))}
          </div>
        </div>
      </DndContext>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t">
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