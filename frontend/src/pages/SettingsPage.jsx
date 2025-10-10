import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { 
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  User,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    statusUpdates: true,
    assignments: true,
    reminders: false
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+1 (555) 123-4567',
    department: user?.department || 'Public Works',
    bio: 'Municipal services professional dedicated to improving community infrastructure.'
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: isDarkMode ? Sun : Moon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye }
  ];

  const handleSaveProfile = () => {
    // Simulate API call
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            value={profileData.department}
            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option>Public Works</option>
            <option>Water & Utilities</option>
            <option>Parks & Recreation</option>
            <option>Transportation</option>
            <option>Environmental Services</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          rows={4}
          value={profileData.bio}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tell us about yourself..."
        />
      </div>
      <button onClick={handleSaveProfile} className="btn-primary">
        <Save className="w-4 h-4 mr-2" />
        Save Profile
      </button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notification Preferences
        </h3>
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-municipal-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {key === 'email' && 'Receive updates via email'}
                {key === 'sms' && 'Receive SMS notifications'}
                {key === 'push' && 'Browser push notifications'}
                {key === 'statusUpdates' && 'Get notified when complaint status changes'}
                {key === 'assignments' && 'New task assignments'}
                {key === 'reminders' && 'Deadline and follow-up reminders'}
              </div>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, [key]: !value })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-municipal-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleSaveNotifications} className="btn-primary">
        <Save className="w-4 h-4 mr-2" />
        Save Preferences
      </button>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light', icon: Sun, preview: 'bg-white border-gray-200' },
            { id: 'dark', name: 'Dark', icon: Moon, preview: 'bg-gray-900 border-gray-700' },
            { id: 'system', name: 'System', icon: Globe, preview: 'bg-gradient-to-r from-white to-gray-900' }
          ].map(({ id, name, icon: Icon, preview }) => (
            <button
              key={id}
              className={`p-4 rounded-lg border-2 transition-all ${
                id === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-municipal-600'
              }`}
            >
              <div className={`w-full h-20 rounded-lg mb-3 ${preview}`}></div>
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          {Object.entries(passwordData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                {key === 'current' ? 'Current Password' : key === 'new' ? 'New Password' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords[key] ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handlePasswordChange} className="btn-primary">
          <Shield className="w-4 h-4 mr-2" />
          Update Password
        </button>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Privacy Settings
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Profile Visibility', description: 'Allow other users to see your profile', enabled: true },
            { name: 'Activity Status', description: 'Show when you are online', enabled: false },
            { name: 'Data Analytics', description: 'Help improve the platform with usage data', enabled: true },
            { name: 'Contact Visibility', description: 'Allow staff to see your contact information', enabled: true }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-municipal-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  item.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-municipal-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-municipal-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Settings"
          subtitle="Manage your account preferences and privacy settings"
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-0">
              <nav className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-municipal-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'privacy' && renderPrivacyTab()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;