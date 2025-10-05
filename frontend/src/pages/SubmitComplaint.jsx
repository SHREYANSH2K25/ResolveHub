import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import FileUpload from '../components/FileUpload';
import MapContainer from '../components/GoogleMaps/MapContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Send, AlertTriangle } from 'lucide-react';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rawAddress: '',
  });\n  const [selectedLocation, setSelectedLocation] = useState(null);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location.address) {
      setFormData({
        ...formData,
        rawAddress: location.address
      });
    }
    // Clear location error
    if (errors.location) {
      setErrors({
        ...errors,
        location: ''
      });
    }
  };

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.rawAddress.trim() && !selectedLocation) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        rawAddress: formData.rawAddress.trim(),
        files: files
      };

      const response = await apiService.submitComplaint(complaintData);
      
      toast.success('Complaint submitted successfully!');
      navigate('/complaint-history');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      const message = error.response?.data?.msg || 'Failed to submit complaint. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Submit Complaint"
          subtitle="Report municipal issues with precise location and supporting evidence"
        />
        
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
                  <p className="text-sm text-gray-600">Provide clear and detailed information about the issue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="form-label">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input-field ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Brief title describing the issue (e.g., 'Broken street light on Main St')"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`input-field ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Provide detailed information about the issue, including when you noticed it, how it affects you or others, and any other relevant details..."
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/500 characters (minimum 10 required)
                  </p>
                </div>
              </div>
            </Card>

            {/* Location Selection */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Location Information</h2>
                  <p className="text-sm text-gray-600">Pinpoint the exact location of the issue</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="rawAddress" className="form-label">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="rawAddress"
                    name="rawAddress"
                    value={formData.rawAddress}
                    onChange={handleChange}
                    className={`input-field ${errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter or search for the address..."
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
                
                <MapContainer
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                  height="400px"
                  showPlacesSearch={true}
                  showStreetView={true}
                />
              </div>
            </Card>

            {/* File Upload */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Supporting Evidence</h2>
                  <p className="text-sm text-gray-600">Upload photos or documents to help illustrate the issue (optional)</p>
                </div>
              </div>

              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={5}
                maxSizeInMB={10}
              />
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2"
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