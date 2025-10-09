import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle } from 'lucide-react';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Give the AuthContext time to process the token from URL
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'staff') {
          navigate('/staff');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If authentication failed, redirect to login
        navigate('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
            <CheckCircle className="w-16 h-16 text-green-500 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Login Successful!
        </h1>
        
        <p className="text-gray-400 mb-6">
          Redirecting you to your dashboard...
        </p>
        
        <LoadingSpinner />
      </div>
    </div>
  );
};

export default OAuthSuccess;