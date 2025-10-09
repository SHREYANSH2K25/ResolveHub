import { useState } from 'react';
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Settings,
  Trash2,
  MarkAsRead,
  Filter,
  Search,
  X
} from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy notification data
  const notifications = [
    {
      id: 1,
      type: 'status_update',
      title: 'Complaint Status Updated',
      message: 'Your complaint #12345 about "Broken streetlight" has been marked as resolved.',
      timestamp: '2 minutes ago',
      isRead: false,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 2,
      type: 'assignment',
      title: 'New Task Assigned',
      message: 'You have been assigned to handle complaint #12346 in Downtown area.',
      timestamp: '15 minutes ago',
      isRead: false,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Deadline Reminder',
      message: 'Complaint #12340 deadline is approaching (2 hours remaining).',
      timestamp: '1 hour ago',
      isRead: true,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      id: 4,
      type: 'urgent',
      title: 'Urgent Complaint Filed',
      message: 'High-priority complaint about water main break requires immediate attention.',
      timestamp: '2 hours ago',
      isRead: false,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 11 PM to 2 AM.',
      timestamp: '4 hours ago',
      isRead: true,
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    },
    {
      id: 6,
      type: 'status_update',
      title: 'Complaint Acknowledged',
      message: 'Your complaint #12344 has been received and assigned to the maintenance team.',
      timestamp: '6 hours ago',
      isRead: true,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { id: 'status_update', label: 'Updates', count: notifications.filter(n => n.type === 'status_update').length },
    { id: 'assignment', label: 'Tasks', count: notifications.filter(n => n.type === 'assignment').length },
    { id: 'urgent', label: 'Urgent', count: notifications.filter(n => n.type === 'urgent').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'unread' && !notification.isRead) ||
                     notification.type === activeTab;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const markAsRead = (id) => {
    // Implement mark as read functionality
    console.log('Marking notification as read:', id);
  };

  const deleteNotification = (id) => {
    // Implement delete functionality
    console.log('Deleting notification:', id);
  };

  const markAllAsRead = () => {
    // Implement mark all as read functionality
    console.log('Marking all as read');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-municipal-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-municipal-700">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-municipal-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-municipal-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-municipal-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-municipal-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-municipal-700 bg-gray-50 dark:bg-municipal-900">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <MarkAsRead className="w-4 h-4" />
            Mark all as read
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredNotifications.filter(n => !n.isRead).length} unread
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-municipal-700">
              {filteredNotifications.map(notification => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-municipal-700 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.bgColor}`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-municipal-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-municipal-600 rounded text-gray-500 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-municipal-700 bg-gray-50 dark:bg-municipal-900">
          <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;