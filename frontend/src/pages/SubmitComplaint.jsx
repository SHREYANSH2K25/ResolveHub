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
        files: files.map(f => f.url || f),
        ...(selectedLocation?.lat && selectedLocation?.lng && {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        })
      };
      await apiService.submitComplaint(complaintData);
      toast.success('Complaint submitted successfully!');
      navigate('/complaint-history');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (isInvalid) => `
    w-full border rounded-lg px-4 py-2 text-gray-900 dark:text-white 
    bg-white dark:bg-municipal-700 border-gray-300 dark:border-municipal-600 
    focus:ring-2 focus:outline-none transition-colors duration-200
    ${isInvalid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500 focus:border-primary-500'}
  `;
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorTextClasses = "mt-1 text-sm text-red-600 dark:text-red-400";
  const helpTextClasses = "mt-1 text-xs text-gray-500 dark:text-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-municipal-900 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Submit Complaint"
          subtitle="Report municipal issues with precise location and supporting evidence"
        />

        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          
          {/* Complaint Details */}
          <Card className="shadow-lg dark:shadow-2xl">
            <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100 dark:border-municipal-700">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-full">
                <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Complaint Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Provide clear and detailed information about the issue</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className={labelClasses}>Issue Title *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                  className={inputClasses(errors.title)}
                  placeholder="Brief title describing the issue"
                  maxLength={100}
                />
                {errors.title && <p className={errorTextClasses}>{errors.title}</p>}
                <p className={helpTextClasses}>{formData.title.length}/100 characters</p>
              </div>
              <div>
                <label htmlFor="description" className={labelClasses}>Detailed Description *</label>
                <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange}
                  className={inputClasses(errors.description)}
                  placeholder="Provide detailed information..."
                  maxLength={500}
                />
                {errors.description && <p className={errorTextClasses}>{errors.description}</p>}
                <p className={helpTextClasses}>{formData.description.length}/500 characters (minimum 10 required)</p>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="shadow-lg dark:shadow-2xl">
            <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100 dark:border-municipal-700">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location Information</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pinpoint the exact location of the issue</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="rawAddress" className={labelClasses}>Address *</label>
                <input type="text" id="rawAddress" name="rawAddress" value={formData.rawAddress} onChange={handleChange}
                  className={inputClasses(errors.location)}
                  placeholder="Enter or search for the address..."
                />
                {errors.location && <p className={errorTextClasses}>{errors.location}</p>}
              </div>
              <div className={`
                p-1 border-2 border-gray-200 dark:border-municipal-700 rounded-lg
                ${errors.location ? 'border-red-400 dark:border-red-600' : 'hover:border-primary-400'}
                transition-all duration-300
              `}>
                <MapContainer
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                  height="400px"
                  showPlacesSearch={true}
                  showStreetView={true}
                  libraries={['places', 'visualization']} // consolidated libraries
                />
              </div>
              {selectedLocation && (
                <p className={helpTextClasses}>
                  Selected Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </Card>

          {/* File Upload */}
          <Card className="shadow-lg dark:shadow-2xl">
            <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100 dark:border-municipal-700">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supporting Evidence</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload photos or documents (optional)</p>
              </div>
            </div>
            <FileUpload onFilesChange={handleFilesChange} maxFiles={5} maxSizeInMB={10} />
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary shadow-md" disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center space-x-2 shadow-lg">
              {isSubmitting ? <><LoadingSpinner size="sm"/><span>Submitting...</span></> : <><Send className="w-5 h-5"/><span>Submit Complaint</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
