import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
const NotificationsPopup = ({ notifications, onClose, onClear, onAddNotification, isAdmin = false }) => {
    const popupRef = useRef(null);
    const [newNotification, setNewNotification] = useState('');
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    const handleAddNotification = (e) => {
        e.preventDefault();
        if (newNotification.trim() && onAddNotification) {
            onAddNotification(newNotification);
            setNewNotification('');
        }
    };
    return (<div ref={popupRef} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5"/>
          Notifications
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5"/>
        </button>
      </div>
      
      {/* Add Notification Form (Admin Only) */}
      {isAdmin && onAddNotification && (<form onSubmit={handleAddNotification} className="mb-4">
          <div className="relative">
            <input type="text" value={newNotification} onChange={(e) => setNewNotification(e.target.value)} placeholder="Add a notification..." className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
            <button type="submit" disabled={!newNotification.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </form>)}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {notifications.length > 0 ? (notifications.map((note) => (<div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">{note.message}</p>
              {note.userEmail && (<p className="text-xs text-gray-500 mt-1">
                  From: {note.userEmail.split('@')[0]}
                </p>)}
            </div>))) : (<div className="text-center text-gray-500 py-6">
            You have no new notifications.
          </div>)}
      </div>
      {notifications.length > 0 && (<div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <button onClick={onClear} className="text-sm text-blue-600 hover:underline">
              Clear all notifications
            </button>
          </div>)}
    </div>);
};
export default NotificationsPopup;
