import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log('Fetching staff complaints...');
      const response = await apiService.getStaffComplaints();
      console.log('Staff complaints response:', response.data);
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error(`Failed to load complaints: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      filterStatus === 'all' || complaint.status.toLowerCase() === filterStatus;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdating(id);
      await apiService.updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Complaint ${newStatus.toLowerCase()}`);
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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

  const ComplaintModal = () => {
    if (!selectedComplaint) return null;

    const isDummyEmail =
      selectedComplaint.submittedBy.email?.endsWith('example.com') ||
      selectedComplaint.submittedBy.email?.endsWith('test.com');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="relative group max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/40 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
              <h3 className="text-xl font-semibold text-white">
                Complaint Details
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-300 hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Title
                  </h4>
                  <p className="text-lg font-semibold text-white">
                    {selectedComplaint.title}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Description
                  </h4>
                  <p className="text-gray-300">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Status
                  </h4>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                {selectedComplaint.category && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Category
                    </h4>
                    <p className="text-gray-300">
                      {selectedComplaint.category}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Submitted By
                  </h4>
                  <p className="text-gray-300">
                    {selectedComplaint.submittedBy.name} (
                    {selectedComplaint.submittedBy.email})
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Submitted Date
                  </h4>
                  <p className="text-gray-300">
                    {formatDate(selectedComplaint.createdAt)}
                  </p>
                </div>
                {selectedComplaint.resolutionDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Resolution Date
                    </h4>
                    <p className="text-gray-300">
                      {formatDate(selectedComplaint.resolutionDate)}
                    </p>
                  </div>
                )}
                {isDummyEmail && (
                  <div className="border-l-4 border-yellow-400 bg-yellow-500/20 border-yellow-500/30 p-4 rounded">
                    <p className="text-yellow-200 font-medium">
                      Warning: The citizen's email may be invalid. Notifications
                      might fail.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedComplaint.mediaUrls?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
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
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Update Status
                  </h4>
                  <div className="flex space-x-2">
                    {selectedComplaint.status === 'OPEN' && (
                      <button
                        onClick={() =>
                          updateStatus(selectedComplaint._id, 'IN PROGRESS')
                        }
                        disabled={updating === selectedComplaint._id}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
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
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-pink-600 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-300">
            Loading staff dashboard...
          </p>
        </div>
      </div>
    );
  }

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
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Staff Dashboard
                </h1>
                <p className="text-gray-300 text-lg">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">{user?.name || 'Staff Member'}</span>
                </p>
                <p className="text-gray-400 mt-2">
                  Manage and resolve municipal complaints efficiently
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards with Glass Morphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                    <div className="text-sm font-medium text-gray-300">Total Complaints</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
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

          {/* Filters with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-purple-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-gray-600/50 rounded-lg px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-600/50 rounded-lg text-sm bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Complaints List with Glass Morphism */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {complaints.length === 0
                      ? 'No complaints to review'
                      : 'No complaints match your filters'}
                  </h3>
                  <p className="text-gray-300">
                    {complaints.length === 0
                      ? 'Great job! All complaints are up to date.'
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div key={c._id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {c.title}
                          </h3>
                          <StatusBadge status={c.status} />
                          {c.category && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                              {c.category}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-3 line-clamp-2">
                          {c.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
                          className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border border-gray-600/50 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {c.status === 'OPEN' && (
                          <button
                            onClick={() => updateStatus(c._id, 'IN PROGRESS')}
                            disabled={updating === c._id}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
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
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2"
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <ComplaintModal />
      </div>
    </div>
  );
};

export default StaffDashboard;