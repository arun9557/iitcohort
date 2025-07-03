'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle
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

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceTasks = Array.from(sourceColumn.tasks);
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : Array.from(destColumn.tasks);

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    setColumns(prev => prev.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks };
      }
      return col;
    }));
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

      <DragDropContext onDragEnd={onDragEnd}>
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

                <Droppable droppableId={column.id} isDropDisabled={false}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 p-3 bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm text-gray-900 line-clamp-2">
                                  {task.title}
                                </h5>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>

                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{task.assignee}</span>
                                </div>
                                {getPriorityIcon(task.priority)}
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{task.dueDate}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

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
      </DragDropContext>

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