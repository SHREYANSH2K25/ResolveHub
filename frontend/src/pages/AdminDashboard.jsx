import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsCreating(true);

    try {
      await apiService.createStaffUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      toast.success('Staff user created successfully!');
      setFormData({ name: '', email: '', password: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating staff user:', error);
      const message = error.response?.data?.msg || 'Failed to create staff user';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`Admin Dashboard - ${user?.name || 'Administrator'}`}
          subtitle="Manage staff users and oversee system operations"
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Staff User</span>
          </button>
        </PageHeader>

        {/* Quick Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">System</div>
              <div className="text-sm font-medium text-gray-600">User Management</div>
            </Card>
            
            <Card className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Active</div>
              <div className="text-sm font-medium text-gray-600">Security Status</div>
            </Card>
            
            <Card className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Ready</div>
              <div className="text-sm font-medium text-gray-600">Staff Creation</div>
            </Card>
          </div>
        </div>

        {/* Create Staff Form */}
        {showCreateForm && (
          <div className="mt-8">
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                  <UserPlus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New Staff User</h2>
                  <p className="text-sm text-gray-600">Add a new staff member to the system with appropriate permissions</p>
                </div>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input-field pl-10 ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter staff member's full name"
                        maxLength={100}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
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
                        className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long. Staff can change this after first login.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Staff User Permissions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• View and manage all active complaints</li>
                    <li>• Update complaint status (Open → In Progress → Resolved)</li>
                    <li>• Access heatmap and analytics dashboard</li>
                    <li>• Receive notifications about new assignments</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: '', email: '', password: '' });
                      setErrors({});
                    }}
                    className="btn-secondary"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Staff User</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Admin Tools */}
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Administrative Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">System Security</h3>
                    <p className="text-sm text-gray-600">Monitor security status</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">All systems operational and secure.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-600">Manage staff access</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Create and manage staff user accounts.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">System insights</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">View comprehensive system analytics and reports.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Staff User</span>
              </button>
              
              <a 
                href="/staff"
                className="btn-secondary flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>View Staff Dashboard</span>
              </a>
              
              <a 
                href="/heatmap"
                className="btn-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>View Heatmap</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;