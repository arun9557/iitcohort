'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationsPopup from './NotificationsPopup';
import { isOwner } from '../utils/auth';

interface Notification {
  id: string;
  message: string;
  timestamp: any;
  userEmail?: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onClear: () => void;
  onAddNotification?: (message: string) => void;
  user?: any;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notifications, 
  onClear, 
  onAddNotification, 
  user 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="relative text-gray-500 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      {isOpen && (
        <NotificationsPopup 
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onClear={() => {
            onClear();
            setIsOpen(false);
          }}
          onAddNotification={onAddNotification}
          isAdmin={user && isOwner(user)}
        />
      )}
    </div>
  );
};

export default NotificationBell; 