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

  useEffect(() => { fetchComplaints(); }, []);
  useEffect(() => { filterComplaints(); }, [complaints, filterStatus, searchTerm]);

  const filterComplaints = () => {
    let filtered = complaints;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((c) =>
        [c.title, c.description, c.category]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
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
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const message = error.response?.data?.msg || 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setSubmittingFeedback(false);
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

  const FeedbackModal = () => {
    if (!feedbackModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
        <div className="bg-white dark:bg-municipal-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-municipal-700 animate-fadeIn">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Rate Your Experience
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              How satisfied are you with the resolution of “{feedbackModal.title}”?
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFeedbackForm({ ...feedbackForm, rating: star })
                      }
                      className={`transition-colors ${
                        star <= feedbackForm.rating
                          ? 'text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {feedbackForm.rating}/5 stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackForm.comment}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, comment: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-municipal-600 bg-white dark:bg-municipal-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Share your thoughts about the resolution..."
                />
              </div>

              {/* Buttons */}
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
                  <span>
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </span>
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
      <div className="min-h-screen bg-gray-50 dark:bg-municipal-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your complaints...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-municipal-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="My Complaints"
          subtitle={`You have submitted ${complaints.length} complaint${
            complaints.length !== 1 ? 's' : ''
          } so far`}
        />

        {/* Filters */}
        <div className="mt-8">
          <Card className="p-5 shadow-lg dark:shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm rounded-md px-3 py-2 bg-white dark:bg-municipal-700 text-gray-900 dark:text-white border border-gray-300 dark:border-municipal-600 focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
                  className="w-full text-sm rounded-md pl-9 pr-3 py-2 bg-white dark:bg-municipal-700 border border-gray-300 dark:border-municipal-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Complaints List */}
        <div className="mt-8 space-y-6">
          {filteredComplaints.length === 0 ? (
            <Card className="text-center py-12 shadow-md dark:shadow-lg">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {complaints.length === 0
                  ? 'No complaints submitted yet'
                  : 'No complaints match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {complaints.length === 0
                  ? 'Submit your first complaint to get started.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card
                key={complaint._id}
                className="hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary-300 dark:hover:border-primary-700"
              >
                <div className="flex flex-col space-y-3">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 dark:border-municipal-700">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {complaint.title}
                      </h3>
                      <StatusBadge status={complaint.status} />
                      {complaint.category && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-municipal-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {complaint.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {complaint.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Submitted: {formatDate(complaint.createdAt)}
                    </span>
                    {complaint.resolutionDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Resolved: {formatDate(complaint.resolutionDate)}
                      </span>
                    )}
                    {complaint.mediaUrls?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {complaint.mediaUrls.length} attachment
                        {complaint.mediaUrls.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Media */}
                  {complaint.mediaUrls?.length > 0 && (
                    <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                      {complaint.mediaUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 hover:opacity-90 transition-transform"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  {complaint.status?.toLowerCase() === 'resolved' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-municipal-700">
                      {complaint.feedbackRating ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Your rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= complaint.feedbackRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                          <span>({complaint.feedbackRating}/5)</span>
                          {complaint.feedbackComment && (
                            <span className="italic ml-2 text-gray-500 dark:text-gray-400">
                              “{complaint.feedbackComment}”
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setFeedbackModal(complaint)}
                          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          Rate this resolution
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        <FeedbackModal />
      </div>
    </div>
  );
};

export default ComplaintHistory;
