import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => {
              const isApproved = n.message.includes('Approved');
              const isRejected = n.message.includes('Rejected');
              
              return (
                <div
                  key={n._id}
                  className={`p-4 hover:bg-slate-50 transition flex gap-3 ${!n.read ? 'bg-brand-50/30' : ''}`}
                >
                  <div className="mt-0.5">
                    {isApproved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isRejected && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {!isApproved && !isRejected && <Clock className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
