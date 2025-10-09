// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Users, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    department: '',
    registrationKey: ''
  });
  const [role, setRole] = useState('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const roleOptions = [
    { value: 'citizen', label: 'Citizen', icon: User },
    { value: 'staff', label: 'Staff', icon: Users }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (role === 'staff') {
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.registrationKey.trim()) newErrors.registrationKey = 'Registration Key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { confirmPassword, ...registrationData } = formData;
    registrationData.role = role;
    const success = await register(registrationData);
    if (success) navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center px-4 py-12">
      {/* background and content same as previous RegisterPage - unchanged */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-float">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Join ResolveHub</h2>
          <p className="text-gray-400 text-sm">Create your account to start reporting issues</p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center gap-3 mb-6 animate-slide-up">
          {roleOptions.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  role === r.value ? 'bg-white/20 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                } backdrop-blur-md border border-white/10`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{r.label}</span>
                {role === r.value && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"></div>}
              </button>
            );
          })}
        </div>

        <div className="relative group animate-slide-up-delay">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Many fields same as before (Name, Email, Password, Confirm, staff-only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-400" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.name ? 'border-red-400' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.email ? 'border-red-400' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.password ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300" />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {role === 'staff' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">City</label>
                    <input
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`w-full pl-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.city ? 'border-red-400' : ''}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Department</label>
                    <input
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className={`w-full pl-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.department ? 'border-red-400' : ''}`}
                    />
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Registration Key</label>
                    <input
                      name="registrationKey"
                      type="text"
                      value={formData.registrationKey}
                      onChange={handleChange}
                      placeholder="Enter registration key"
                      className={`w-full pl-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${errors.registrationKey ? 'border-red-400' : ''}`}
                    />
                    {errors.registrationKey && <p className="text-red-500 text-xs mt-1">{errors.registrationKey}</p>}
                  </div>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="relative w-full group mt-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-xl  group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02]">
                  {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                </div>
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-medium hover:from-purple-300 hover:to-pink-300 transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-50px) scale(1.1);}66%{transform:translate(-20px,20px) scale(0.9);} }
        .animate-blob{animation:blob 7s infinite;}
        .animation-delay-2000{animation-delay:2s;}
        .animation-delay-4000{animation-delay:4s;}
        .animate-float{animation:float 3s ease-in-out infinite;}
        @keyframes float{0%,100%{transform:translateY(0px);}50%{transform:translateY(-20px);} }
        @keyframes slide-up{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0)}}
        .animate-slide-up{animation:slide-up 0.6s ease-out;}
        .animate-slide-up-delay{animation:slide-up 0.6s ease-out 0.2s backwards;}
      `}</style>
    </div>
  );
};

export default RegisterPage;
