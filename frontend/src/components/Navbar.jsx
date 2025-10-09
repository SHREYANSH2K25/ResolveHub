import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`text-sm font-outfit font-medium transition-all duration-200 ${
        isActive(to) ? 'text-purple-300' : 'text-white hover:text-purple-300'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="ResolveHub Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold bg-gradient-to-r from-[#C025FF] via-[#8141FF] to-[#2C64FE] bg-clip-text text-transparent font-outfit">
            ResolveHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full bg-white/10 border border-white/15">
          {!isAuthenticated ? (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/check-status">Check Status</NavLink>
              <NavLink to="/help">Help</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {!isAdmin && !isStaff && (
                <>
                  <NavLink to="/submit-complaint">Submit Complaint</NavLink>
                  <NavLink to="/complaint-history">My Complaints</NavLink>
                </>
              )}
              {isStaff && (
                <>
                  <NavLink to="/staff">Staff Panel</NavLink>
                  <NavLink to="/heatmap">Heatmap</NavLink>
                </>
              )}
              {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-1 bg-gradient-to-r from-[#63209F] to-[#222A79] text-white rounded-full text-sm font-medium font-outfit hover:opacity-90 transition-opacity"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1 bg-gradient-to-r from-[#63209F] to-[#222A79] text-white rounded-full text-sm font-medium font-outfit hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="text-white text-sm">
                  <div className="font-medium">{user?.name || 'User'}</div>
                  <div className="text-gray-400 capitalize text-xs">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-sm text-red-400 hover:bg-red-500/20 transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-black/60 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-md">
            {!isAuthenticated ? (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/check-status">Check Status</NavLink>
                <NavLink to="/help">Help</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {!isAdmin && !isStaff && (
                  <>
                    <NavLink to="/submit-complaint">Submit Complaint</NavLink>
                    <NavLink to="/complaint-history">My Complaints</NavLink>
                  </>
                )}
                {isStaff && (
                  <>
                    <NavLink to="/staff">Staff Panel</NavLink>
                    <NavLink to="/heatmap">Heatmap</NavLink>
                  </>
                )}
                {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-sm text-red-400 hover:text-red-300 transition-all duration-200 mt-3"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
