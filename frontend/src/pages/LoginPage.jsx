// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, User, Users, Shield, Globe } from 'lucide-react';
import {FaGithub} from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'staff') navigate('/staff');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(formData);
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'citizen', label: 'Citizen', icon: User },
    { value: 'staff', label: 'Staff', icon: Users },
    { value: 'admin', label: 'Admin', icon: Shield },
  ];

  const socialLoginUrl = (provider) => `${API_BASE}/api/auth/${provider}`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center px-4 py-0">
      {/* Background / styling same as before */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-20 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-float">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Sign in to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">
              ResolveHub
            </span>
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center gap-3 mb-6 animate-slide-up">
          {roleOptions.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  role === r.value ? 'bg-white/20 text-white shadow-lg shadow-purple-700/40' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                } backdrop-blur-md border border-white/10`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{r.label}</span>
                {role === r.value && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"></div>}
              </button>
            );
          })}
        </div>

        {/* Glass Login Card */}
        <div className="relative group animate-slide-up-delay">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-gray-900/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-900/40 border border-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-gray-900/50 transition-all duration-300 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="relative w-full group mt-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-pink-700 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02]">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                </div>
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <p className="text-center text-sm text-gray-400 mb-3">Or sign in with</p>
              <div className="flex gap-3 justify-center">
                <a href={socialLoginUrl('google')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm text-white">Google</span>
                </a>
                <a href={socialLoginUrl('github')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8">
                  <FaGithub className="w-4 h-4" />
                  <span className="text-sm text-white">GitHub</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-medium hover:from-purple-300 hover:to-pink-300 transition-all">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-50px) scale(1.1);} 66%{transform:translate(-20px,20px) scale(0.9);} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        @keyframes slide-up { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay:2s; }
        .animation-delay-4000 { animation-delay:4s; }
        .animation-delay-3000 { animation-delay:3s; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delay { animation: slide-up 0.6s ease-out 0.2s backwards; }
      `}</style>
    </div>
  );
};

export default LoginPage;
