import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const OAuthFailure = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Login Failed
        </h1>
        
        <p className="text-gray-400 mb-6">
          We couldn't sign you in with your social account. This might be due to:
        </p>
        
        <ul className="text-left text-gray-400 mb-8 space-y-2">
          <li>• Account permissions were denied</li>
          <li>• Network connection issues</li>
          <li>• Temporary service problems</li>
        </ul>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Try Again
          </Link>
          
          <Link
            to="/register"
            className="block w-full px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-all"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OAuthFailure;