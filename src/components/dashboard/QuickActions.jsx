'use client';
import React, { useState } from 'react';

const QuickActions = ({ setActiveTab }) => {
    const actions = [
        {
            title: 'Join Voice Chat',
            icon: '🎤',
            color: 'blue',
            action: () => setActiveTab('voice'),
            description: 'Start voice communication'
        },
        {
            title: 'Create Note',
            icon: '📝',
            color: 'green',
            action: () => setActiveTab('notes'),
            description: 'Write quick notes'
        },
        {
            title: 'Open Whiteboard',
            icon: '🎨',
            color: 'purple',
            action: () => setActiveTab('whiteboard'),
            description: 'Collaborative drawing'
        },
        {
            title: 'Schedule Meeting',
            icon: '📅',
            color: 'orange',
            action: () => setActiveTab('meetings'),
            description: 'Plan team meetings'
        },
        {
            title: 'Upload File',
            icon: '📁',
            color: 'indigo',
            action: () => setActiveTab('library'),
            description: 'Share documents'
        },
        {
            title: 'VS Code',
            icon: '🖥️',
            color: 'gray',
            action: () => setActiveTab('vscode'),
            description: 'Code together'
        }
    ];
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
            gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        };
        return colors[color] || colors.blue;
    };
    return (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Access tools instantly</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (<button key={index} onClick={action.action} className={`p-4 rounded-xl border transition-all duration-200 ${getColorClasses(action.color)} group`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.icon}</span>
              <div className="text-left">
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs opacity-75">{action.description}</p>
              </div>
            </div>
          </button>))}
      </div>
    </div>);
};

export default QuickActions;