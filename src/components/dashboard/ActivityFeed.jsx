import React, { useState } from 'react';

const ActivityFeed = () => {
    const activities = [
        {
            id: '1',
            type: 'project',
            user: 'Arun Kumar',
            action: 'created a new project',
            target: 'Machine Learning Assignment',
            time: '2 minutes ago',
            icon: '📁',
            color: 'blue'
        },
        {
            id: '2',
            type: 'message',
            user: 'Priya Sharma',
            action: 'sent a message in',
            target: 'General Chat',
            time: '5 minutes ago',
            icon: '💬',
            color: 'green'
        },
        {
            id: '3',
            type: 'file',
            user: 'Rahul Patel',
            action: 'uploaded a file',
            target: 'lecture_notes.pdf',
            time: '10 minutes ago',
            icon: '📄',
            color: 'purple'
        },
        {
            id: '4',
            type: 'meeting',
            user: 'Dr. Kumar',
            action: 'scheduled a meeting',
            target: 'Project Review',
            time: '15 minutes ago',
            icon: '📅',
            color: 'orange'
        }
    ];
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            purple: 'bg-purple-100 text-purple-800',
            orange: 'bg-orange-100 text-orange-800'
        };
        return colors[color] || colors.blue;
    };
    return (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
            <p className="text-sm text-gray-500">Recent team activities</p>
          </div>
        </div>
        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:bg-orange-50 px-3 py-1 rounded-lg transition-all duration-200">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (<div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
            <div className={`w-8 h-8 ${getColorClasses(activity.color)} rounded-lg flex items-center justify-center text-sm`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600"> {activity.action} </span>
                <span className="font-medium text-gray-900">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-orange-50 text-orange-700 py-3 px-4 rounded-lg hover:bg-orange-100 transition-all duration-200 text-sm font-medium border border-orange-200">
            📊 All Activities
          </button>
          <button className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200">
            🔔 Notifications
          </button>
        </div>
      </div>
    </div>);
};

export default ActivityFeed;