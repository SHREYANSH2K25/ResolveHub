import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // FIX: Adjusted path to '../'
// import { useTheme } from '../../contexts/ThemeContext'; // REMOVED: Causing crash until Provider is wrapped
// import ThemeToggle from './ThemeToggle'; // REMOVED: Relies on useTheme
import { Menu, X, MapPin, User, LogOut, Sun, Moon } from 'lucide-react'; // ADDED: Sun/Moon icons back

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // REVERTED: Local state management for theme until provider is implemented
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for persisted theme on mount
    return localStorage.getItem('theme') === 'dark';
  });
  
  // REVERTED: Local effect to apply 'dark' class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Use isDark state for styling logic
  // const { isDarkMode } = useTheme(); // Crash fixed by removing this
  
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, onClick, external = false }) => {
    const baseClasses = "block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md";
    const activeClasses = isActive(to) 
      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-municipal-800" 
      : "text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-municipal-800";
    
    if (external) {
      return (
        <button
          onClick={onClick}
          className={`${baseClasses} ${activeClasses}`}
        >
          {children}
        </button>
      );
    }
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-municipal-900 shadow-md border-b border-gray-200 dark:border-municipal-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ResolveHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <NavLink to="/">Home</NavLink>
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
                
                {isAdmin && (
                  <NavLink to="/admin">Admin Panel</NavLink>
                )}
              </>
            )}
            
            {/* Dark Mode Toggle (Desktop) - REVERTED TO LOCAL LOGIC */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="toggle-button p-2 rounded-full bg-gray-100 dark:bg-municipal-800 text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-municipal-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* User Menu (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                  <div className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div> 
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-municipal-800 rounded-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button + Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle is now part of this mobile control group - REVERTED TO LOCAL LOGIC */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="toggle-button p-2 rounded-full bg-gray-100 dark:bg-municipal-800 text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-municipal-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-municipal-800 rounded-md transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-municipal-900 border-t border-gray-200 dark:border-municipal-700">
          <div className="px-4 py-3 space-y-2">
            
            {/* Mobile Nav Links */}
            {!isAuthenticated ? (
              <>
                <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>Register</NavLink>
              </>
            ) : (
              <>
                {/* User Info (Mobile) */}
                <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100 dark:border-municipal-800 mb-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                    <div className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
                  </div>
                </div>
                
                {/* Authenticated Links (Mobile) */}
                <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                {!isAdmin && !isStaff && (
                  <>
                    <NavLink to="/submit-complaint" onClick={() => setIsMenuOpen(false)}>Submit Complaint</NavLink>
                    <NavLink to="/complaint-history" onClick={() => setIsMenuOpen(false)}>My Complaints</NavLink>
                  </>
                )}
                
                {isStaff && (
                  <>
                    <NavLink to="/staff" onClick={() => setIsMenuOpen(false)}>Staff Panel</NavLink>
                    <NavLink to="/heatmap" onClick={() => setIsMenuOpen(false)}>Heatmap</NavLink>
                  </>
                )}
                
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</NavLink>
                )}
                
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-all duration-200 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
            
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
