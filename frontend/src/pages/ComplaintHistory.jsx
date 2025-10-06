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
  Search
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

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filterStatus, searchTerm]);

  

  const filterComplaints = () => {
    let filtered = complaints;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(complaint => 
        complaint.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredComplaints(filtered);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackModal) return;
    
    try {
      setSubmittingFeedback(true);
      await apiService.submitFeedback(feedbackModal._id, feedbackForm);
      toast.success('Feedback submitted successfully!');
      setFeedbackModal(null);
      setFeedbackForm({ rating: 5, comment: '' });
      // Refresh complaints to show updated feedback
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const message = error.response?.data?.msg || 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setSubmittingFeedback(false);
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

  const FeedbackModal = () => {
    if (!feedbackModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate Your Experience
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              How satisfied are you with the resolution of "{feedbackModal.title}"?
            </p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="form-label">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className={`p-1 ${
                        star <= feedbackForm.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {feedbackForm.rating}/5 stars
                  </span>
                </div>
              </div>
              
              <div>
                <label className="form-label">Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  className="input-field"
                  placeholder="Share your thoughts about the resolution..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="btn-secondary"
                  disabled={submittingFeedback}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="btn-primary flex items-center space-x-2"
                >
                  {submittingFeedback ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  <span>{submittingFeedback ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="My Complaints"
          subtitle={`You have submitted ${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} so far`}
        />

        {/* Filters */}
        <div className="mt-8">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md pl-10 pr-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search complaints..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Complaints List */}
        <div className="mt-6">
          {filteredComplaints.length === 0 ? (
            <Card className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {complaints.length === 0 ? 'No complaints submitted' : 'No complaints match your filters'}
              </h3>
              <p className="text-gray-600">
                {complaints.length === 0
                  ? 'Start by submitting your first complaint to track municipal issues.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint._id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {complaint.title}
                        </h3>
                        <StatusBadge status={complaint.status} />
                        {complaint.category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {complaint.category}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{complaint.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted: {formatDate(complaint.createdAt)}</span>
                        </span>
                        
                        {complaint.resolutionDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Resolved: {formatDate(complaint.resolutionDate)}</span>
                          </span>
                        )}
                        
                        {complaint.mediaUrls && complaint.mediaUrls.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>{complaint.mediaUrls.length} attachment{complaint.mediaUrls.length !== 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Media Preview */}
                      {complaint.mediaUrls && complaint.mediaUrls.length > 0 && (
                        <div className="mt-4">
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {complaint.mediaUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Complaint evidence ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Feedback Section */}
                      {complaint.status === 'RESOLVED' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {complaint.feedbackRating ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Your rating:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= complaint.feedbackRating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">({complaint.feedbackRating}/5)</span>
                              {complaint.feedbackComment && (
                                <span className="text-sm text-gray-500 ml-2">
                                  "{complaint.feedbackComment}"
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setFeedbackModal(complaint)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                              Rate this resolution
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <FeedbackModal />
      </div>
    </div>
  );
};

export default ComplaintHistory;