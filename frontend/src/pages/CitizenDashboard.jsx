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
      
      // Calculate stats
      const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status.toUpperCase() === 'OPEN').length,
        inProgress: complaints.filter(c => c.status.toUpperCase() === 'IN PROGRESS').length,
        resolved: complaints.filter(c => c.status.toUpperCase() === 'RESOLVED').length
      };
      
      setStats(stats);
      setRecentComplaints(complaints.slice(0, 5)); // Show only recent 5
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600', 
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600'
    };
    
    return (
      <Card className="text-center">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color]} mb-4`}>
          {icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`Welcome back, ${user?.name || 'Citizen'}!`}
          subtitle="Track your complaints and submit new issues to improve your community"
        >
          <Link
            to="/submit-complaint"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Submit New Complaint</span>
          </Link>
        </PageHeader>

        {/* Stats Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Open Issues"
              value={stats.open}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={<Clock className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Complaints */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
                <Link
                  to="/complaint-history"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
              
              {recentComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by submitting your first complaint to help improve your community.
                  </p>
                  <Link
                    to="/submit-complaint"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit First Complaint</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {complaint.title}
                            </h3>
                            <StatusBadge status={complaint.status} />
                          </div>
                          <p className="text-gray-600 mt-2 line-clamp-2">
                            {complaint.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Submitted {formatDate(complaint.createdAt)}</span>
                            </span>
                            {complaint.category && (
                              <span className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
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
            </Card>
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/submit-complaint"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Complaint</span>
                </Link>
                <Link
                  to="/complaint-history"
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View History</span>
                </Link>
              </div>
            </Card>

            {/* Tips */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reporting Tips</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Be Specific</p>
                    <p className="text-xs text-gray-600">Provide clear details about the issue and its location</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add Photos</p>
                    <p className="text-xs text-gray-600">Include images to help staff understand the problem</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Track Progress</p>
                    <p className="text-xs text-gray-600">Check back for updates and provide feedback when resolved</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;