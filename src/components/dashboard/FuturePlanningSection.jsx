'use client';
import React, { useState } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';

const FuturePlanningSection = ({ setActiveTab, futureProjects, setFutureProjects }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFutureProject, setNewFutureProject] = useState({
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
            const project = {
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
    const removeTag = (tag) => {
        const updatedTags = newFutureProject.tags.filter(t => t !== tag);
        setNewFutureProject(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };
    const getColorClasses = (color) => {
        const colors = {
            yellow: 'bg-yellow-50 border-yellow-500',
            green: 'bg-green-50 border-green-500',
            blue: 'bg-blue-50 border-blue-500',
            purple: 'bg-purple-50 border-purple-500',
            red: 'bg-red-50 border-red-500'
        };
        return colors[color] || colors.yellow;
    };
    const getTagColorClasses = (color) => {
        const colors = {
            yellow: 'bg-yellow-100 text-yellow-800',
            green: 'bg-green-100 text-green-800',
            blue: 'bg-blue-100 text-blue-800',
            purple: 'bg-purple-100 text-purple-800',
            red: 'bg-red-100 text-red-800'
        };
        return colors[color] || colors.yellow;
    };
    const handleProjectClick = (project) => {
        // Navigate to Projects section
        setActiveTab('projects');
        // You can also add the project to the main projects list here
        console.log('Navigating to Projects section with:', project);
    };
    return (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-yellow-600"/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Future Projects</h3>
            <p className="text-sm text-gray-500">Plan upcoming initiatives</p>
          </div>
        </div>
        <button className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4"/>
        </button>
      </div>
      <div className="space-y-4">
        {futureProjects.map((project) => (<div key={project.id} className={`p-4 rounded-xl border-l-4 ${getColorClasses(project.color)} cursor-pointer hover:shadow-md transition-all duration-200`} onClick={() => handleProjectClick(project)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                <div className="flex items-center gap-3 mb-2">
              {project.tags.map((tag, index) => (<span key={index} className={`${getTagColorClasses(project.color)} text-xs px-2 py-1 rounded-lg font-medium`}>
                  {tag}
                </span>))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>👥 {project.members} members</span>
                  <span>📅 {project.phase}</span>
                </div>
              </div>
            </div>
          </div>))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTab('projects')} className="bg-yellow-50 text-yellow-700 py-3 px-4 rounded-lg hover:bg-yellow-100 transition-all duration-200 text-sm font-medium border border-yellow-200">
            📁 All Projects
          </button>
          <button onClick={() => setActiveTab('kanban')} className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-all duration-200 text-sm font-medium border border-purple-200">
            📋 Kanban Board
          </button>
        </div>
      </div>

      {/* Add Future Project Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Future Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newFutureProject.title} onChange={(e) => setNewFutureProject({ ...newFutureProject, title: e.target.value })} placeholder="Enter project title"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newFutureProject.description} onChange={(e) => setNewFutureProject({ ...newFutureProject, description: e.target.value })} placeholder="Enter project description" rows={3}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newFutureProject.phase} onChange={(e) => setNewFutureProject({ ...newFutureProject, phase: e.target.value })}>
                  <option value="Planning phase">Planning phase</option>
                  <option value="Research phase">Research phase</option>
                  <option value="Development phase">Development phase</option>
                  <option value="Testing phase">Testing phase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                <input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newFutureProject.members} onChange={(e) => setNewFutureProject({ ...newFutureProject, members: parseInt(e.target.value) || 1 })}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newFutureProject.color} onChange={(e) => setNewFutureProject({ ...newFutureProject, color: e.target.value })}>
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
                  <input type="text" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" onKeyPress={(e) => e.key === 'Enter' && addTag()}/>
                  <button onClick={addTag} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newFutureProject.tags.map((tag, index) => (<span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-yellow-600 hover:text-yellow-800">
                        ×
                      </button>
                    </span>))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition" onClick={addFutureProject}>
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

export default FuturePlanningSection;