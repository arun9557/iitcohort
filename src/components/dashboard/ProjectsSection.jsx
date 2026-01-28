'use client';
import React, { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';

const ProjectsSection = ({ futureProjects, setActiveTab }) => {
    const [projects, setProjects] = useState([
        { id: '1', title: 'Web Development Project', description: 'Team meeting tomorrow at 10 AM', status: 'In Progress', color: 'blue' },
        { id: '2', title: 'Machine Learning Assignment', description: 'Deadline: Friday, 3 PM', status: 'Pending', color: 'green' },
        { id: '3', title: 'Database Design', description: 'Review session scheduled', status: 'Completed', color: 'purple' }
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', status: 'In Progress', color: 'blue' });
    const addProject = () => {
        if (newProject.title.trim() && newProject.description.trim()) {
            const project = {
                id: Date.now().toString(),
                ...newProject
            };
            setProjects([...projects, project]);
            setNewProject({ title: '', description: '', status: 'In Progress', color: 'blue' });
            setShowAddModal(false);
        }
    };
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-500',
            green: 'bg-green-50 border-green-500',
            purple: 'bg-purple-50 border-purple-500',
            red: 'bg-red-50 border-red-500',
            yellow: 'bg-yellow-50 border-yellow-500'
        };
        return colors[color] || colors.blue;
    };
    return (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600"/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Projects Discussion</h3>
            <p className="text-sm text-gray-500">Manage your team projects</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4"/>
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm" onClick={() => setActiveTab('projects')}>
            View All
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {/* Current Projects */}
        {projects.map((project) => (<div key={project.id} className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
            <p className="text-sm text-gray-600">{project.description}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          </div>))}
        
        {/* Future Projects */}
        {futureProjects.map((project) => (<div key={`future-${project.id}`} className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  {project.tags.map((tag, index) => (<span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                      {tag}
                    </span>))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Future</span>
                  <span className="text-xs text-gray-500">👥 {project.members} members</span>
              </div>
              </div>
            </div>
          </div>))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTab('projects')} className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200">
            📁 All Projects
          </button>
          <button className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200">
            📋 Kanban Board
          </button>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="Enter project title"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Enter project description" rows={3}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newProject.color} onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition" onClick={addProject}>
                  Add Project
                </button>
                <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};

export default ProjectsSection;