import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import FileUpload from '../components/FileUpload';
import MapContainer from '../components/GoogleMaps/MapContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Send, AlertTriangle, MapPin, Link as LinkIcon } from 'lucide-react';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rawAddress: '',
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location.address) setFormData(prev => ({ ...prev, rawAddress: location.address }));
    if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
  };

  const handleFilesChange = (newFiles) => setFiles(newFiles);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.rawAddress.trim() && !selectedLocation) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Please fix the errors before submitting');

    setIsSubmitting(true);
    try {
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        rawAddress: formData.rawAddress.trim(),
        files: files,
        ...(selectedLocation?.lat && selectedLocation?.lng && {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        })
      };

      await apiService.submitComplaint(complaintData);
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Submit Complaint</h1>
              <p className="text-gray-300 text-lg">Report municipal issues with precise location and supporting evidence</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Complaint Details with Glass Morphism */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full border border-purple-500/30">
                    <AlertTriangle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Complaint Details</h2>
                    <p className="text-sm text-gray-300">Provide clear and detailed information about the issue</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Issue Title *</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                      }`}
                      placeholder="Brief title describing the issue"
                      maxLength={100}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formData.title.length}/100 characters</p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Detailed Description *</label>
                    <textarea 
                      id="description" 
                      name="description" 
                      rows={4} 
                      value={formData.description} 
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none ${
                        errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                      }`}
                      placeholder="Provide detailed information about the issue, including when it occurred and its impact..."
                      maxLength={500}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formData.description.length}/500 characters</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location with Glass Morphism */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Location Information</h2>
                    <p className="text-sm text-gray-300">Pin the exact location or provide address details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="rawAddress" className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                    <input 
                      type="text" 
                      id="rawAddress" 
                      name="rawAddress" 
                      value={formData.rawAddress} 
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${
                        errors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-600/50'
                      }`}
                      placeholder="Enter the address or area where the issue is located"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location}</p>}
                  </div>

                  <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden">
                    <MapContainer 
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      height="400px"
                      showPlacesSearch={true}
                      showStreetView={false}
                    />
                  </div>
                  
                  {selectedLocation && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-300 text-sm font-medium">
                        📍 Location Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload with Glass Morphism */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-8">
                <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full border border-green-500/30">
                    <LinkIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Supporting Evidence</h2>
                    <p className="text-sm text-gray-300">Upload photos or documents to support your complaint</p>
                  </div>
                </div>

                <FileUpload 
                  onFilesChange={handleFilesChange} 
                  maxFiles={5}
                  className="bg-gray-800/30 border-gray-600/50 text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold backdrop-blur-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;