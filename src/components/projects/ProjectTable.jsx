import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, X, Layout, Calendar } from "lucide-react";
import KanbanBoard from "./KanbanBoard";
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
const statusColors = {
    Active: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    "On Hold": "bg-yellow-100 text-yellow-800",
};
export default function ProjectTable() {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [form, setForm] = useState({
        name: "",
        owner: "",
        status: "Active",
        deadline: "",
    });
    const [loading, setLoading] = useState(false);
    const [showBoard, setShowBoard] = useState(null); // projectId for board modal
    const [boardProject, setBoardProject] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    // List of allowed owners (usernames)
    const allowedOwners = [
        'arun2061292007',
        'arunshekhram',
        'meettomar07',
        'ashishkrs1977',
        'shubham229177',
    ];
    // Add this helper at the top (after imports, if not present)
    const ownerUsernames = [
        'arun2061292007',
        'arunshekhram',
        'meettomar07',
        'ashishkrs1977',
        'shubham229177',
    ];
    const isOwner = (user) => {
        if (!user)
            return false;
        if (ownerUsernames.includes(user))
            return true;
        if (user.includes('@')) {
            const uname = user.split('@')[0];
            if (ownerUsernames.includes(uname))
                return true;
        }
        return false;
    };
    // Fetch projects from Firestore
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
            setProjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);
    // Helper to get username from email
    const getUsername = (user) => {
        if (!user)
            return '';
        if (user.displayName)
            return user.displayName;
        if (user.email)
            return user.email.split('@')[0];
        return user.uid;
    };
    const openModal = (project) => {
        if (project) {
            setEditProject(project);
            setForm({
                name: project.name,
                owner: project.owner,
                status: project.status,
                deadline: project.deadline,
            });
        }
        else {
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
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (editProject) {
            // Update
            await updateDoc(doc(db, "projects", editProject.id), form);
        }
        else {
            // Add
            await addDoc(collection(db, "projects"), form);
        }
        setLoading(false);
        closeModal();
    };
    const handleDelete = async (id, projectOwner) => {
        const username = getUsername(currentUser);
        if (!(allowedOwners.includes(username) && username === projectOwner)) {
            alert('Only the project owner can delete this project.');
            return;
        }
        if (confirm('Delete this project?')) {
            await deleteDoc(doc(db, 'projects', id));
        }
    };
    const openBoard = (project) => {
        setShowBoard(project.id);
        setBoardProject(project);
    };
    const closeBoard = () => {
        setShowBoard(null);
        setBoardProject(null);
    };
    return (<div className="bg-white rounded-lg shadow-sm p-6 relative">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        Projects
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
            const username = getUsername(currentUser);
            const canDelete = allowedOwners.includes(username) && username === project.owner;
            const colorDot = project.status === 'Active' ? 'bg-green-500' : project.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-400';
            return (<div key={project.id} className="rounded-2xl shadow-md border border-gray-100 bg-white p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-3 h-3 rounded-full ${colorDot}`}></span>
                <span className="text-lg font-semibold text-gray-900 flex-1">{project.name}</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base">
                  {project.owner.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-800 font-medium">{project.owner}</span>
                {isOwner(project.owner) && (<span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">ADMIN</span>)}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}>{project.status}</span>
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400"/>
                  {project.deadline || 'No deadline'}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" onClick={() => openModal(project)} title="Edit">
                  <Edit className="w-4 h-4"/>
                </button>
                {canDelete && (<button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition" onClick={() => handleDelete(project.id, project.owner)} title="Delete">
                    <Trash2 className="w-4 h-4"/>
                  </button>)}
                <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition" onClick={() => openBoard(project)} title="View Board">
                  <Layout className="w-4 h-4"/>
                </button>
              </div>
            </div>);
        })}
      </div>
      {/* Floating Add Project Button */}
      <button className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-blue-700 transition-all z-50 text-lg font-bold" onClick={() => openModal()} title="Add Project">
        <Plus className="w-6 h-6"/>
      </button>
      {/* Modal for Add/Edit */}
      {showModal && (<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">{editProject ? "Edit Project" : "Add Project"}</h4>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Owner</label>
                <input type="text" name="owner" value={form.owner} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-60">
                  {loading ? 'Saving...' : editProject ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>)}

      {/* Modal for Project Kanban Board */}
      {showBoard && boardProject && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{boardProject.name} - Task Board</h4>
              <button onClick={closeBoard} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <KanbanBoard projectId={showBoard}/>
          </motion.div>
        </div>)}
    </div>);
}
