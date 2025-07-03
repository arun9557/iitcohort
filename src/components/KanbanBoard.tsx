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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  projectId?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanBoardProps {
  projectId?: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design User Interface',
    description: 'Create wireframes and mockups for the new feature',
    priority: 'high',
    assignee: 'Alice',
    dueDate: '2024-01-15',
    status: 'todo',
    projectId: ''
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Set up Firebase authentication with email and Google sign-in',
    priority: 'high',
    assignee: 'Bob',
    dueDate: '2024-01-20',
    status: 'in-progress',
    projectId: ''
  },
  {
    id: '3',
    title: 'Write Unit Tests',
    description: 'Add comprehensive test coverage for core functionality',
    priority: 'medium',
    assignee: 'Charlie',
    dueDate: '2024-01-25',
    status: 'review',
    projectId: ''
  },
  {
    id: '4',
    title: 'Deploy to Production',
    description: 'Configure CI/CD pipeline and deploy the application',
    priority: 'high',
    assignee: 'David',
    dueDate: '2024-01-30',
    status: 'done',
    projectId: ''
  }
];

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'medium':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'low':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Sortable Task Component
function SortableTask({ task }: { task: Task }) {
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
      className={`${isDragging ? 'opacity-50' : ''} bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 cursor-move`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <div className="flex items-center gap-1">
          {getPriorityIcon(task.priority)}
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-gray-500" />
          <span className="text-gray-600">{task.assignee}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="text-gray-600">{task.dueDate}</span>
        </div>
      </div>
      <div className="mt-2">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: initialTasks.filter(task => task.status === 'todo'),
      color: 'bg-gray-100'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: initialTasks.filter(task => task.status === 'in-progress'),
      color: 'bg-blue-100'
    },
    {
      id: 'review',
      title: 'Review',
      tasks: initialTasks.filter(task => task.status === 'review'),
      color: 'bg-yellow-100'
    },
    {
      id: 'done',
      title: 'Done',
      tasks: initialTasks.filter(task => task.status === 'done'),
      color: 'bg-green-100'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    // Update columns when tasks change
    setColumns([
      {
        id: 'todo',
        title: 'To Do',
        tasks: tasks.filter(t => t.status === 'todo'),
        color: 'bg-gray-100',
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: tasks.filter(t => t.status === 'in-progress'),
        color: 'bg-blue-100',
      },
      {
        id: 'review',
        title: 'Review',
        tasks: tasks.filter(t => t.status === 'review'),
        color: 'bg-yellow-100',
      },
      {
        id: 'done',
        title: 'Done',
        tasks: tasks.filter(t => t.status === 'done'),
        color: 'bg-green-100',
      },
    ]);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumns((columns) => {
        const oldIndex = columns.findIndex(col => 
          col.tasks.some(task => task.id === active.id)
        );
        const newIndex = columns.findIndex(col => 
          col.tasks.some(task => task.id === over?.id)
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newColumns = [...columns];
          const sourceColumn = newColumns[oldIndex];
          const destColumn = newColumns[newIndex];
          
          const taskIndex = sourceColumn.tasks.findIndex(task => task.id === active.id);
          const task = sourceColumn.tasks[taskIndex];
          
          // Remove from source column
          sourceColumn.tasks.splice(taskIndex, 1);
          
          // Add to destination column
          destColumn.tasks.push(task);
          
          return newColumns;
        }
        
        return columns;
      });
    }
  };

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      description: 'Add description here',
      priority: 'medium',
      assignee: 'Unassigned',
      dueDate: new Date().toISOString().split('T')[0],
      status: columnId as 'todo' | 'in-progress' | 'review' | 'done',
      projectId: projectId || ''
    };

    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));
  };

  if (!projectId) return <div className="p-4 text-gray-500">No project selected.</div>;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{column.title}</h4>
                  <span className="text-sm text-gray-500">{column.tasks.length}</span>
                </div>

                <SortableContext
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {column.tasks.map((task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
                </SortableContext>

                <button
                  onClick={() => addTask(column.id)}
                  className="w-full mt-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </motion.div>
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
            <div className="text-2xl font-bold text-yellow-600">
              {columns.find(col => col.id === 'review')?.tasks.length || 0}
            </div>
            <div className="text-sm text-gray-600">In Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {columns.find(col => col.id === 'done')?.tasks.length || 0}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
} 