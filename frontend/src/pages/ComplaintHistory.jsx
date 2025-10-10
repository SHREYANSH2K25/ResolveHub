import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  Star,
  MessageSquare,
  Filter,
  Search,
  FileText,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComplaintHistory();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaint history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);
  useEffect(() => { filterComplaints(); }, [complaints, filterStatus, searchTerm]);

  const filterComplaints = () => {
    let filtered = complaints;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredComplaints(filtered);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await apiService.submitFeedback(feedbackModal._id, feedbackForm);
      toast.success('Feedback submitted successfully!');
      setFeedbackModal(null);
      setFeedbackForm({ rating: 5, comment: '' });
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">My Complaints</h1>
              <p className="text-gray-300 text-lg">
                You have submitted {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} so far
              </p>
            </div>
          </div>

          {/* Filters with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Status Filter */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <Filter className="w-4 h-4 text-blue-400" />
                  </div>
                  <label className="text-sm font-medium text-gray-300">Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm rounded-lg px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full text-sm rounded-lg pl-9 pr-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl blur opacity-10"></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {complaints.length === 0 ? 'No complaints submitted yet' : 'No complaints match your filters'}
                  </h3>
                  <p className="text-gray-400">
                    {complaints.length === 0 
                      ? 'Submit your first complaint to get started.' 
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 hover:bg-gray-900/40 transition-all duration-300">
                    
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-gray-700/30 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full border border-purple-500/30">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                          {complaint.category && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full mt-1">
                              {complaint.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-4 leading-relaxed">{complaint.description}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {formatDate(complaint.createdAt)}
                      </span>
                      {complaint.resolutionDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Resolved: {formatDate(complaint.resolutionDate)}
                        </span>
                      )}
                      {complaint.mediaUrls?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {complaint.mediaUrls.length} attachment{complaint.mediaUrls.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {complaint.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Location marked
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {complaint.status === 'resolved' && !complaint.feedbackGiven && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setFeedbackModal(complaint)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                        >
                          <Star className="w-4 h-4" />
                          <span>Give Feedback</span>
                        </button>
                      </div>
                    )}

                    {complaint.feedbackGiven && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-300 text-sm">✓ Feedback submitted - Thank you!</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Rate Your Experience</h3>
            <p className="text-gray-300 mb-6">
              How satisfied are you with the resolution of "{feedbackModal.title}"?
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className={`transition-colors ${
                        star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">
                    {feedbackForm.rating}/5 stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  className="w-full rounded-lg border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm text-white px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-400"
                  placeholder="Share your thoughts about the resolution..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={submittingFeedback}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  {submittingFeedback ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;