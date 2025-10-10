import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Leaderboard from '../components/Leaderboard';
import GamificationStats from '../components/GamificationStats';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Building2,
  Trophy,
  Key,
  Copy,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';


const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  // Verification code state
  const [verificationCode, setVerificationCode] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);

  // Gamification state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState('management');

  useEffect(() => {
    console.log('🔐 Current user:', user);
    console.log('🔑 Auth token:', localStorage.getItem('token'));
    
    if (activeTab === 'gamification') {
      fetchGamificationData();
    }
  }, [activeTab]);

  const fetchGamificationData = async () => {
    try {
      console.log('🎮 Fetching gamification data...');
      setLoadingLeaderboard(true);
      setLoadingStats(true);
      
      const [leaderboardResponse, statsResponse] = await Promise.all([
        apiService.getLeaderboard(10),
        apiService.getGamificationStats()
      ]);
      
      console.log('📊 Leaderboard response:', leaderboardResponse);
      console.log('📈 Stats response:', statsResponse);
      
      setLeaderboardData(leaderboardResponse.data.data);
      setGamificationStats(statsResponse.data.data);
    } catch (error) {
      console.error('❌ Error fetching gamification data:', error);
      console.error('❌ Error response:', error.response);
      toast.error('Failed to load gamification data');
    } finally {
      setLoadingLeaderboard(false);
      setLoadingStats(false);
    }
  };

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
    if (!formData.department) newErrors.department = 'Department is required';
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
        password: formData.password,
        department: formData.department
      });
      toast.success('Staff user created successfully!');
      setFormData({ name: '', email: '', password: '', department: '' });
      setShowCreateForm(false);
    } catch (error) {
      // The error.response?.data?.msg field is expected from your backend admin.js error handler
      const message = error.response?.data?.msg || 'Failed to create staff user (Check server logs)';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateVerificationCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await apiService.getVerificationCode();
      setVerificationCode(response.data.code);
      setCodeExpiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours from now
      toast.success('Staff registration code generated successfully!');
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to generate verification code';
      toast.error(message);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      toast.success('Code copied to clipboard!');
    }
  };

  const formatTimeRemaining = () => {
    if (!codeExpiresAt) return '';
    const now = new Date();
    const remaining = codeExpiresAt - now;
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects (Keeping your original styling) */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-5000 { animation-delay: 5s; }
      `}</style>

      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">{user?.name || 'Administrator'}</span>
                  </p>
                  <p className="text-gray-400 mt-2">
                    Manage staff users and oversee system operations
                  </p>
                </div>
                {activeTab === 'management' && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>{showCreateForm ? 'Close Form' : 'Create Staff User'}</span>
                    </button>
                    
                    <button
                      onClick={handleGenerateVerificationCode}
                      disabled={isGeneratingCode}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Key className="w-5 h-5" />
                      <span>{isGeneratingCode ? 'Generating...' : 'Generate Staff Key'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-900/30 backdrop-blur-lg rounded-xl p-1 border border-gray-700/30">
            <button
              onClick={() => setActiveTab('management')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'management'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Users className="w-5 h-5" />
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'gamification'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Gamification
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'management' && (
            <>
              {/* Quick Stats with Glass Morphism */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">System</div>
                    <div className="text-sm font-medium text-gray-300">User Management</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-green-500/50 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">Active</div>
                    <div className="text-sm font-medium text-gray-300">Security Status</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">Ready</div>
                    <div className="text-sm font-medium text-gray-300">Staff Creation</div>
                  </div>
                </div>
              </div>

              {/* Verification Code Display */}
              {verificationCode && (
                <div className="relative group mb-8">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full border border-blue-500/30">
                          <Key className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Staff Registration Key</h3>
                          <p className="text-sm text-gray-300">Share this key with staff members for registration</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeRemaining()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-mono font-bold text-white tracking-wider">
                          {verificationCode}
                        </span>
                      </div>
                      <button
                        onClick={copyCodeToClipboard}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 flex items-center space-x-2 border border-blue-500/30"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-400">
                      💡 This key expires in 24 hours and can only be used once per staff registration.
                    </div>
                  </div>
                </div>
              )}

              {/* Create Staff Form with Glass Morphism */}
              {showCreateForm && (
                <div className="relative group mb-8">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Create New Staff User
                        </h2>
                        <p className="text-sm text-gray-300">
                          Add a new staff member to the system with appropriate permissions
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateStaff} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
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
                              className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                              }`}
                              placeholder="Enter staff member's full name"
                            />
                          </div>
                          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                              className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                              }`}
                              placeholder="Enter email address"
                            />
                          </div>
                          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
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
                            className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                              errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                            }`}
                            placeholder="Create a secure password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                      </div>

                      {/* Department */}
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                          Department *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                              errors.department ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                            }`}
                          >
                            <option value="">Select Department</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Structural">Structural</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                          </select>
                        </div>
                        {errors.department && <p className="mt-1 text-sm text-red-400">{errors.department}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end space-x-4 col-span-full">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setFormData({ name: '', email: '', password: '', department: '' });
                            setErrors({});
                          }}
                          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border border-gray-600/50 rounded-lg backdrop-blur-sm transition-all duration-300"
                          disabled={isCreating}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreating}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
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
                  </div>
                </div>
              )}
            </>
          )}

          {/* Gamification Tab Content */}
          {activeTab === 'gamification' && (
            <div className="space-y-8">
              <GamificationStats stats={gamificationStats} loading={loadingStats} />
              <Leaderboard leaderboardData={leaderboardData} loading={loadingLeaderboard} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
