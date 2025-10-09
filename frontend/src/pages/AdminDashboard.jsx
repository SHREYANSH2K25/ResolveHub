import { useState } from 'react';
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
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters';
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
      const message = error.response?.data?.msg || 'Failed to create staff user';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <PageHeader
          title={`Admin Dashboard - ${user?.name || 'Administrator'}`}
          subtitle="Manage staff users and oversee system operations"
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>{showCreateForm ? 'Close Form' : 'Create Staff User'}</span>
          </button>
        </PageHeader>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, color: 'blue', title: 'System', subtitle: 'User Management' },
            { icon: Shield, color: 'green', title: 'Active', subtitle: 'Security Status' },
            { icon: UserPlus, color: 'primary', title: 'Ready', subtitle: 'Staff Creation' }
          ].map(({ icon: Icon, color, title, subtitle }, i) => (
            <Card
              key={i}
              className="text-center hover:shadow-lg transition-transform hover:-translate-y-1 dark:bg-gray-800"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-50 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400 mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {subtitle}
              </div>
            </Card>
          ))}
        </div>

        {/* Create Staff Form */}
        {showCreateForm && (
          <div className="mt-10">
            <Card className="dark:bg-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Create New Staff User
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add a new staff member to the system with appropriate permissions
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="form-label dark:text-gray-300">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input-field pl-10 dark:bg-gray-700 dark:text-gray-100 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Enter staff member's full name"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label dark:text-gray-300">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field pl-10 dark:bg-gray-700 dark:text-gray-100 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="form-label dark:text-gray-300">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 pr-10 dark:bg-gray-700 dark:text-gray-100 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                {/* Permissions Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Staff User Permissions
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Manage all active complaints</li>
                    <li>• Update complaint status</li>
                    <li>• Access heatmap & analytics</li>
                    <li>• Receive assignment alerts</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: '', email: '', password: '' });
                      setErrors({});
                    }}
                    className="btn-secondary dark:bg-gray-700 dark:text-gray-200"
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

      </div>
    </div>
  );
};

export default AdminDashboard;
