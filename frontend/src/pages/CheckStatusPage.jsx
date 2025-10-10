import React, { useState } from "react";
import axios from "axios";
import { Search, FileText, Calendar, User, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const CheckStatusPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setComplaint(null);
    setLoading(true);

    try {
      const res = await axios.get(`/api/complaints/status/${trackingId}`);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Complaint not found");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          
          {/* Header with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Check Complaint Status</h1>
              <p className="text-gray-300 text-lg">Enter your tracking ID to view complaint details and current status</p>
            </div>
          </div>

          {/* Search Form with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Complaint Lookup</h2>
                  <p className="text-sm text-gray-300">Enter your complaint tracking ID</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="trackingId" className="block text-sm font-medium text-gray-300 mb-2">
                    Tracking ID *
                  </label>
                  <input
                    type="text"
                    id="trackingId"
                    placeholder="Enter your complaint tracking ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Check Status</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur opacity-20"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-red-500/30 p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Complaint Details */}
          {complaint && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-700/30 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full border border-green-500/30">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Complaint Details</h2>
                      <p className="text-sm text-gray-300">Tracking ID: {trackingId}</p>
                    </div>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                {/* Complaint Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{complaint.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{complaint.description}</p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Submitted By</span>
                      </div>
                      <p className="text-white">{complaint.submittedBy?.name || "Anonymous"}</p>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Submitted At</span>
                      </div>
                      <p className="text-white">{formatDate(complaint.submittedAt)}</p>
                    </div>

                    {complaint.category && (
                      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-pink-400" />
                          <span className="text-sm font-medium text-gray-300">Category</span>
                        </div>
                        <p className="text-white">{complaint.category}</p>
                      </div>
                    )}

                    {complaint.location && (
                      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-gray-300">Location</span>
                        </div>
                        <p className="text-white">Location marked on map</p>
                      </div>
                    )}

                    {complaint.resolutionDate && (
                      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-gray-300">Resolution Date</span>
                        </div>
                        <p className="text-white">{formatDate(complaint.resolutionDate)}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-300">Status History</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <span className="text-white">Current Status</span>
                        <StatusBadge status={complaint.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckStatusPage;