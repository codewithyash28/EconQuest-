import React, { useState, useEffect } from 'react';
import { Bell, X, Zap, Trophy, Users, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification, subscribeToNotifications, markAsRead } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [userId]);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'streak': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'quest': return <Trophy className="w-4 h-4 text-blue-400" />;
      case 'squad': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all relative group"
      >
        <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0a0a] animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-[#1a1a1a] border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-sm font-black uppercase tracking-widest italic">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-6 hover:bg-white/5 transition-colors relative group ${!n.read ? 'bg-blue-500/5' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-white/5 rounded-xl">
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-black uppercase tracking-tight ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-gray-600 font-medium">
                                {n.timestamp?.toDate ? formatDistanceToNow(n.timestamp.toDate()) : 'just now'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                        {!n.read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="absolute top-6 right-6 p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <Bell className="w-12 h-12 text-gray-800 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-600 italic">No notifications yet</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                  <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                    View All Activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
