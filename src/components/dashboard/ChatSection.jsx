import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { isOwner } from '../../utils/auth';

const ChatSection = ({ messages, sendMessage, message, setMessage, setActiveTab }) => (<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 min-h-[500px] lg:min-h-[650px] h-full flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600"/>
        </div>
              <div>
          <h3 className="text-xl font-bold text-gray-900">Quick Chat</h3>
          <p className="text-sm text-gray-500">Real-time communication</p>
              </div>
              </div>
      <div className="flex gap-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-sm" onClick={() => setActiveTab('members')}>
          View All
        </button>
      </div>
    </div>
    <div className="space-y-4 mb-6 max-h-[400px] lg:max-h-[600px] overflow-y-auto flex-1">
      {messages.slice(-20).map((msg, index) => (<div key={index} className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {msg.user.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{msg.user}
  {isOwner(msg.user) && (<span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">ADMIN</span>)}
    </span>
              <span className="text-xs text-gray-500">
                {msg.timestamp?.toDate().toLocaleTimeString() || 'Now'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-800">{msg.text}</p>
            </div>
          </div>
        </div>))}
    </div>
    <div className="border-t border-gray-200 pt-4">
      <div className="flex gap-3">
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message..." className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"/>
      <button onClick={sendMessage} disabled={!message.trim()} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">
        Send
        </button>
      </div>
    </div>
  </div>);

export default ChatSection;