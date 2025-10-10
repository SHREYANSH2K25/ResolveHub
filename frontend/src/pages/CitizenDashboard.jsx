import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComplaintHistory();
      const complaints = response.data;
      
      // Calculate stats - FIX: Use .toUpperCase() for case-insensitive filtering
      const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status.toUpperCase() === 'OPEN').length,
        inProgress: complaints.filter(c => c.status.toUpperCase() === 'IN PROGRESS').length,
        resolved: complaints.filter(c => c.status.toUpperCase() === 'RESOLVED').length
      };
      
      setStats(stats);
      setRecentComplaints(Array.isArray(complaints) ? complaints.slice(0, 5) : []); 
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Check console for details.');
      setRecentComplaints([]);
      setStats({ total: 0, open: 0, inProgress: 0, resolved: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-pink-600 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const noComplaintsSubmitted = stats.total === 0;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
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
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user?.name || 'Citizen'}</span>!
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Track your complaints and submit new issues to improve your community
                  </p>
                </div>
                <Link
                  to="/submit-complaint"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Submit New Complaint</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards with Glass Morphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                    <div className="text-sm font-medium text-gray-300">Total Complaints</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-red-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.open}</div>
                    <div className="text-sm font-medium text-gray-300">Open Issues</div>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.inProgress}</div>
                    <div className="text-sm font-medium text-gray-300">In Progress</div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-green-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.resolved}</div>
                    <div className="text-sm font-medium text-gray-300">Resolved</div>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Complaints with Glass Morphism */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Complaints</h2>
                    <Link
                      to="/complaint-history"
                      className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  
                  {recentComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        {noComplaintsSubmitted ? "No complaints yet" : "No recent complaints in view"}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {noComplaintsSubmitted ? 
                          "Start by submitting your first complaint to help improve your community." :
                          "Check your full complaint history or filters."
                        }
                      </p>
                      <Link
                        to="/submit-complaint"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Submit First Complaint</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentComplaints.map((complaint) => (
                        <div 
                          key={complaint._id} 
                          className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-medium text-white">
                                  {complaint.title}
                                </h3>
                                <StatusBadge status={complaint.status} />
                              </div>
                              <p className="text-gray-300 mt-2 line-clamp-2">
                                {complaint.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Submitted {formatDate(complaint.createdAt)}</span>
                                </span>
                                {complaint.category && (
                                  <span className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                    <span>{complaint.category}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Tips with Glass Morphism */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      to="/submit-complaint"
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Complaint</span>
                    </Link>
                    <Link
                      to="/complaint-history"
                      className="w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border border-gray-600/50 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View History</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Reporting Tips</h2>
                  <div className="space-y-3">
                    {/* Tip 1 */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 border border-purple-500/30">
                        <span className="text-xs font-semibold text-purple-300">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Be Specific</p>
                        <p className="text-xs text-gray-300">Provide clear details about the issue and its location</p>
                      </div>
                    </div>
                    {/* Tip 2 */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 border border-purple-500/30">
                        <span className="text-xs font-semibold text-purple-300">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Add Photos</p>
                        <p className="text-xs text-gray-300">Include images to help staff understand the problem</p>
                      </div>
                    </div>
                    {/* Tip 3 */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 border border-purple-500/30">
                        <span className="text-xs font-semibold text-purple-300">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Track Progress</p>
                        <p className="text-xs text-gray-300">Check back for updates and provide feedback when resolved</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;