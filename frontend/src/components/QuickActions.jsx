import { useState } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  BarChart3,
  MapPin,
  FileText,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const QuickActions = ({ className = '' }) => {
  const { user, logout, isAdmin, isStaff, isCitizen } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  // Quick action items based on user role
  const getQuickActions = () => {
    const baseActions = [
      { 
        id: 'search',
        label: 'Quick Search',
        icon: Search,
        action: () => console.log('Quick search'),
        shortcut: 'Ctrl+K',
        color: 'bg-blue-500 hover:bg-blue-600'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        badge: 3,
        action: () => console.log('Show notifications'),
        color: 'bg-purple-500 hover:bg-purple-600'
      }
    ];

    if (isCitizen) {
      return [
        {
          id: 'submit',
          label: 'Submit Complaint',
          icon: Plus,
          action: () => window.location.href = '/submit-complaint',
          shortcut: 'Ctrl+N',
          color: 'bg-green-500 hover:bg-green-600'
        },
        ...baseActions,
        {
          id: 'history',
          label: 'My Complaints',
          icon: FileText,
          action: () => window.location.href = '/complaint-history',
          color: 'bg-indigo-500 hover:bg-indigo-600'
        }
      ];
    }

    if (isStaff || isAdmin) {
      return [
        {
          id: 'assign',
          label: 'Quick Assign',
          icon: Users,
          action: () => setShowQuickCreate(true),
          shortcut: 'Ctrl+A',
          color: 'bg-green-500 hover:bg-green-600'
        },
        ...baseActions,
        {
          id: 'heatmap',
          label: 'View Heatmap',
          icon: MapPin,
          action: () => window.location.href = '/heatmap',
          color: 'bg-red-500 hover:bg-red-600'
        },
        {
          id: 'stats',
          label: 'Statistics',
          icon: BarChart3,
          action: () => console.log('View statistics'),
          color: 'bg-yellow-500 hover:bg-yellow-600'
        }
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const userMenuItems = [
    {
      label: 'Profile',
      icon: User,
      action: () => window.location.href = '/profile'
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => console.log('Settings')
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => window.location.href = '/help'
    },
    { type: 'divider' },
    {
      label: 'Sign Out',
      icon: LogOut,
      action: logout,
      color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  const QuickCreateModal = () => {
    if (!showQuickCreate) return null;

    const createOptions = [
      {
        title: 'Assign Task',
        description: 'Quickly assign a complaint to staff member',
        icon: Users,
        color: 'bg-blue-500',
        action: () => console.log('Assign task')
      },
      {
        title: 'Send Notification',
        description: 'Send update to citizens or staff',
        icon: Bell,
        color: 'bg-purple-500',
        action: () => console.log('Send notification')
      },
      {
        title: 'Generate Report',
        description: 'Create performance or status report',
        icon: FileText,
        color: 'bg-green-500',
        action: () => console.log('Generate report')
      },
      {
        title: 'Schedule Event',
        description: 'Plan maintenance or meeting',
        icon: Calendar,
        color: 'bg-yellow-500',
        action: () => console.log('Schedule event')
      }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-municipal-800 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6 border-b border-gray-200 dark:border-municipal-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Create
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              What would you like to do?
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {createOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.action();
                    setShowQuickCreate(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-municipal-700 hover:bg-gray-50 dark:hover:bg-municipal-700 transition-colors text-left"
                >
                  <div className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 pt-0">
            <button
              onClick={() => setShowQuickCreate(false)}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-municipal-600 rounded-lg hover:bg-gray-50 dark:hover:bg-municipal-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex items-center gap-4 ${className}`}>
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <div key={action.id} className="relative group">
              <button
                onClick={action.action}
                className={`relative p-3 ${action.color} text-white rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
                title={action.label}
              >
                <action.icon className="w-5 h-5" />
                {action.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
                {action.shortcut && (
                  <span className="ml-2 opacity-75">({action.shortcut})</span>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-municipal-700 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {user?.role || 'User'}
              </div>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-municipal-800 rounded-lg shadow-lg border border-gray-200 dark:border-municipal-700 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-municipal-700">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.name || 'User Name'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email || 'user@example.com'}
                </div>
              </div>

              {/* Menu Items */}
              {userMenuItems.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <div key={index} className="my-1 border-t border-gray-200 dark:border-municipal-700" />
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-municipal-700 transition-colors ${
                      item.color || 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateModal />

      {/* Click outside to close */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default QuickActions;