import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  Filter,
  Search,
  Eye,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filterStatus, searchTerm]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStaffComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term) ||
          c.submittedBy.name?.toLowerCase().includes(term)
      );
    }
    setFilteredComplaints(filtered);
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await apiService.updateComplaintStatus(id, status);
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                status,
                resolutionDate:
                  status === 'RESOLVED' ? new Date().toISOString() : null,
              }
            : c
        )
      );
      toast.success(`Complaint updated to ${status}`);
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.msg || 'Failed to update status';
      toast.error(msg);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status.toUpperCase() === 'OPEN').length,
    inProgress: complaints.filter(
      (c) => c.status.toUpperCase() === 'IN PROGRESS'
    ).length,
    resolved: complaints.filter((c) => c.status.toUpperCase() === 'RESOLVED')
      .length,
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      yellow:
        'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      green:
        'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <Card className="text-center hover:scale-[1.02] transition-transform">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color]} mb-4`}
        >
          {icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </div>
      </Card>
    );
  };

  const ComplaintModal = () => {
    if (!selectedComplaint) return null;

    const isDummyEmail =
      selectedComplaint.submittedBy.email?.endsWith('example.com') ||
      selectedComplaint.submittedBy.email?.endsWith('test.com');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Complaint Details
            </h3>
            <button
              onClick={() => setSelectedComplaint(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-300" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Title
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedComplaint.title}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedComplaint.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h4>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              {selectedComplaint.category && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedComplaint.category}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Submitted By
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedComplaint.submittedBy.name} (
                  {selectedComplaint.submittedBy.email})
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Submitted Date
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
              {selectedComplaint.resolutionDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Resolution Date
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatDate(selectedComplaint.resolutionDate)}
                  </p>
                </div>
              )}
              {isDummyEmail && (
                <div className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-500 p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Warning: The citizen's email may be invalid. Notifications
                    might fail.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {selectedComplaint.mediaUrls?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Attachments
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedComplaint.mediaUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Update Status
                </h4>
                <div className="flex space-x-2">
                  {selectedComplaint.status === 'OPEN' && (
                    <button
                      onClick={() =>
                        updateStatus(selectedComplaint._id, 'IN PROGRESS')
                      }
                      disabled={updating === selectedComplaint._id}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {updating === selectedComplaint._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <span>Start Working</span>
                    </button>
                  )}
                  {(selectedComplaint.status === 'OPEN' ||
                    selectedComplaint.status === 'IN PROGRESS') && (
                    <button
                      onClick={() =>
                        updateStatus(selectedComplaint._id, 'RESOLVED')
                      }
                      disabled={updating === selectedComplaint._id}
                      className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                    >
                      {updating === selectedComplaint._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading staff dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`Staff Dashboard - ${user?.name || 'Staff Member'}`}
          subtitle="Manage and resolve municipal complaints efficiently"
        />

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
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

        {/* Filters */}
        <Card className="mt-8 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute inset-y-0 left-0 pl-3 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-10 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </Card>

        {/* Complaints List */}
        <div className="mt-6 space-y-4">
          {filteredComplaints.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {complaints.length === 0
                  ? 'No complaints to review'
                  : 'No complaints match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {complaints.length === 0
                  ? 'Great job! All complaints are up to date.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </Card>
          ) : (
            filteredComplaints.map((c) => (
              <Card
                key={c._id}
                className="hover:shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {c.title}
                      </h3>
                      <StatusBadge status={c.status} />
                      {c.category && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full">
                          {c.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{c.submittedBy.name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(c.createdAt)}</span>
                      </span>
                      {c.mediaUrls?.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <ImageIcon className="w-4 h-4" />
                          <span>
                            {c.mediaUrls.length} file
                            {c.mediaUrls.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    {c.status === 'OPEN' && (
                      <button
                        onClick={() => updateStatus(c._id, 'IN PROGRESS')}
                        disabled={updating === c._id}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {updating === c._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span>Start</span>
                      </button>
                    )}
                    {(c.status === 'OPEN' || c.status === 'IN PROGRESS') && (
                      <button
                        onClick={() => updateStatus(c._id, 'RESOLVED')}
                        disabled={updating === c._id}
                        className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                      >
                        {updating === c._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <ComplaintModal />
      </div>
    </div>
  );
};

export default StaffDashboard;
