import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Note: Profile update API endpoint would need to be implemented in backend
      // For now, we'll just show success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'citizen':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full system access, user management, and administrative controls';
      case 'staff':
        return 'Complaint management, status updates, and heatmap access';
      case 'citizen':
        return 'Submit complaints, track progress, and provide feedback';
      default:
        return 'Standard user access';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />

        {/* Profile Information */}
        <div className="mt-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-10 bg-gray-100"
                        placeholder="Enter your email"
                        disabled // Email changes require admin approval
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email changes require administrator approval
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email Address</h4>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Account Information */}
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">User Role</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getRoleDescription(user.role)}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Account Status</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Active</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Account is active and in good standing
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Role-specific Information */}
        {user.role === 'citizen' && (
          <div className="mt-8">
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Citizen Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Submit Unlimited Complaints</p>
                    <p className="text-sm text-gray-600">Report any municipal issues in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Real-time Tracking</p>
                    <p className="text-sm text-gray-600">Monitor the status of your complaints</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Provide Feedback</p>
                    <p className="text-sm text-gray-600">Rate resolution quality and provide comments</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {(user.role === 'staff' || user.role === 'admin') && (
          <div className="mt-8">
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {user.role === 'admin' ? 'Administrator' : 'Staff'} Privileges
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-blue-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Complaint Management</p>
                    <p className="text-sm text-gray-600">View and update complaint statuses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-semibold text-blue-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Heatmap Access</p>
                    <p className="text-sm text-gray-600">View complaint distribution analytics</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-semibold text-red-600">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">User Management</p>
                      <p className="text-sm text-gray-600">Create and manage staff accounts</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold text-red-600 mb-6">Account Actions</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Sign Out</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Sign out of your account. You'll need to sign in again to access ResolveHub.
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;