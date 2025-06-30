"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, CheckCircle, Clock, X, Layout } from "lucide-react";
import KanbanBoard from "./KanbanBoard";

interface Project {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Completed" | "On Hold";
  deadline: string;
}

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
};

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    status: "Active" as "Active" | "Completed" | "On Hold",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [showBoard, setShowBoard] = useState<string | null>(null); // projectId for board modal
  const [boardProject, setBoardProject] = useState<Project | null>(null);

  // Fetch projects from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project))
      );
    });
    return () => unsub();
  }, []);

  const openModal = (project?: Project) => {
    if (project) {
      setEditProject(project);
      setForm({
        name: project.name,
        owner: project.owner,
        status: project.status,
        deadline: project.deadline,
      });
    } else {
      setEditProject(null);
      setForm({ name: "", owner: "", status: "Active", deadline: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProject(null);
    setForm({ name: "", owner: "", status: "Active", deadline: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editProject) {
      // Update
      await updateDoc(doc(db, "projects", editProject.id), form);
    } else {
      // Add
      await addDoc(collection(db, "projects"), form);
    }
    setLoading(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this project?")) {
      await deleteDoc(doc(db, "projects", id));
    }
  };

  const openBoard = (project: Project) => {
    setShowBoard(project.id);
    setBoardProject(project);
  };

  const closeBoard = () => {
    setShowBoard(null);
    setBoardProject(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          onClick={() => openModal()}
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-medium text-gray-900">{project.name}</td>
                <td className="px-4 py-2 text-gray-700">{project.owner}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[project.status]}`}>{project.status}</span>
                </td>
                <td className="px-4 py-2 text-gray-700">{project.deadline}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="p-2 text-blue-500 hover:text-blue-700"
                    onClick={() => openModal(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-green-500 hover:text-green-700"
                    onClick={() => openBoard(project)}
                  >
                    <Layout className="w-4 h-4" /> View Board
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{editProject ? "Edit Project" : "Add Project"}</h4>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Owner</label>
                <input
                  type="text"
                  name="owner"
                  value={form.owner}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? "Saving..." : <><CheckCircle className="w-4 h-4" /> {editProject ? "Update" : "Add"}</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal for Project Kanban Board */}
      {showBoard && boardProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{boardProject.name} - Task Board</h4>
              <button onClick={closeBoard} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <KanbanBoard projectId={showBoard} />
          </motion.div>
        </div>
      )}
    </div>
  );
} 