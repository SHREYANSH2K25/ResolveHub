import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, MapPin, User, LogOut, Shield, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    const baseClasses = "px-3 py-2 text-sm font-medium transition-colors duration-200";
    const activeClasses = isActive(to) 
      ? "text-primary-600 bg-primary-50" 
      : "text-gray-700 hover:text-primary-600 hover:bg-gray-100";
    
    if (external) {
      return (
        <button
          onClick={onClick}
          className={`${baseClasses} ${activeClasses} rounded-md`}
        >
          {children}
        </button>
      );
    }
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`${baseClasses} ${activeClasses} rounded-md`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ResolveHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/submit-complaint">Submit Complaint</NavLink>
                <NavLink to="/complaint-history">My Complaints</NavLink>
                
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
          </div>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {!isAuthenticated ? (
              <>
                <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>Register</NavLink>
              </>
            ) : (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
                
                <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/submit-complaint" onClick={() => setIsMenuOpen(false)}>Submit Complaint</NavLink>
                <NavLink to="/complaint-history" onClick={() => setIsMenuOpen(false)}>My Complaints</NavLink>
                
                {isStaff && (
                  <>
                    <NavLink to="/staff" onClick={() => setIsMenuOpen(false)}>Staff Panel</NavLink>
                    <NavLink to="/heatmap" onClick={() => setIsMenuOpen(false)}>Heatmap</NavLink>
                  </>
                )}
                
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</NavLink>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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