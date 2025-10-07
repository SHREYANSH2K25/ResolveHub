import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Path adjusted one level deeper
import { 
  MapPin, 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Card from '../components/Card'; // Path adjusted one level deeper

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Easy Reporting",
      description: "Submit municipal complaints with photos and precise location data in just a few clicks."
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Location Mapping", 
      description: "Use interactive maps to pinpoint exact locations and view complaint heatmaps across the city."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Real-time Tracking",
      description: "Track complaint status from submission to resolution with automatic notifications."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Staff Management",
      description: "Efficient assignment and management system for municipal staff and departments."
    }
,
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and heatmap visualization for administrative decision-making."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: "Secure Platform",
      description: "Role-based access control ensures data security and appropriate access levels."
    }
  ];

  const stats = [
    { number: "24/7", label: "Service Available" },
    { number: "3", label: "User Roles" },
    { number: "100%", label: "Transparent Process" },
    { number: "Fast", label: "Response Time" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Municipal Issues
                  <span className="block text-primary-200">Resolved Efficiently</span>
                </h1>
                <p className="text-xl text-primary-100 max-w-2xl">
                  ResolveHub streamlines municipal complaint management with smart location mapping, 
                  real-time tracking, and efficient staff coordination for better civic services.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/register"
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg
                                 dark:bg-municipal-700 dark:text-white dark:hover:bg-municipal-600"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link 
                      to="/login"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors
                                 dark:hover:bg-municipal-700 dark:hover:text-white"
                    >
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/dashboard'}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg
                               dark:bg-municipal-700 dark:text-white dark:hover:bg-municipal-600"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-white">{stat.number}</div>
                      <div className="text-primary-200 text-sm mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Municipal Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides all the tools needed for efficient municipal complaint handling, 
              from citizen reporting to administrative resolution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                // Enhanced card styles for features
                className="text-center bg-white border border-gray-200 rounded-xl shadow-lg p-8
                           hover:shadow-xl hover:-translate-y-1 hover:border-primary-400
                           transition-all duration-300 cursor-pointer
                           dark:bg-municipal-800 dark:border-municipal-700 dark:shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6
                            dark:bg-primary-900/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section - also applying card hover style for consistency */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple, transparent, and efficient complaint resolution process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Process Step 1: Report Issue */}
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-md 
                          hover:shadow-xl hover:-translate-y-1 hover:border-red-400 
                          transition-all duration-300 cursor-pointer
                          dark:bg-municipal-800 dark:border-municipal-700">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6
                            dark:bg-red-900/50">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Report Issue</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Citizens submit complaints with photos, descriptions, and precise location using our interactive map interface.
              </p>
            </div>
            
            {/* Process Step 2: Auto Assignment */}
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-md 
                          hover:shadow-xl hover:-translate-y-1 hover:border-yellow-400
                          transition-all duration-300 cursor-pointer
                          dark:bg-municipal-800 dark:border-municipal-700">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6
                            dark:bg-yellow-900/50">
                <Users className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Auto Assignment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our intelligent system automatically categorizes and assigns complaints to the appropriate department staff.
              </p>
            </div>
            
            {/* Process Step 3: Resolution */}
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-md 
                          hover:shadow-xl hover:-translate-y-1 hover:border-green-400
                          transition-all duration-300 cursor-pointer
                          dark:bg-municipal-800 dark:border-municipal-700">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6
                            dark:bg-green-900/50">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Resolution</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Staff members work on resolving issues while citizens can track progress and provide feedback on completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Improve Your Community?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join ResolveHub today and help make your municipality more responsive and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors
                           dark:bg-municipal-700 dark:text-white dark:hover:bg-municipal-600"
              >
                Start Reporting Issues
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors
                           dark:hover:bg-municipal-700 dark:hover:text-white"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ResolveHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making municipalities more responsive and efficient through technology.
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 ResolveHub. Built for better civic engagement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
