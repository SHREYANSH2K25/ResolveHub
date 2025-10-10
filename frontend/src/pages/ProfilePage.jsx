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
  X,
  Phone,
  MapPin,
  Settings,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call - in real implementation, this would call backend
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'staff': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
              <p className="text-gray-300 text-lg">Manage your account information and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8 text-center">
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full border border-purple-500/30 mx-auto mb-4">
                      <User className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user?.role)}`}>
                      <Shield className="w-4 h-4 mr-1" />
                      {user?.role || 'Citizen'}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4 border-t border-gray-700/30 pt-6">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Member Since</span>
                      </div>
                      <p className="text-white font-medium">
                        {user?.createdAt ? formatDate(user.createdAt) : 'Recently joined'}
                      </p>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <Mail className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Email Status</span>
                      </div>
                      <p className="text-white font-medium">
                        {user?.emailVerified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                    
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                  
                  <div className="flex items-center justify-between mb-6 border-b border-gray-700/30 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full border border-green-500/30">
                        <Settings className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">Account Information</h2>
                        <p className="text-sm text-gray-300">Update your personal details</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 transition-all duration-300 ${
                            isEditing 
                              ? 'border-gray-600/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                              : 'border-gray-700/30 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 transition-all duration-300 ${
                            isEditing 
                              ? 'border-gray-600/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                              : 'border-gray-700/30 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                          className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 transition-all duration-300 ${
                            isEditing 
                              ? 'border-gray-600/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                              : 'border-gray-700/30 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      {/* Role (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Shield className="w-4 h-4 inline mr-2" />
                          Account Role
                        </label>
                        <input
                          type="text"
                          value={user?.role || 'Citizen'}
                          disabled
                          className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-lg text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your address"
                        className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 resize-none transition-all duration-300 ${
                          isEditing 
                            ? 'border-gray-600/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                            : 'border-gray-700/30 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700/30">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                        >
                          {isSaving ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;