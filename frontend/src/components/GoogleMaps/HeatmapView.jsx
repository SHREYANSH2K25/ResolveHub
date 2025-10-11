import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const libraries = ['visualization'];

const HeatmapView = ({ 
  height = "600px",
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 11,
  timeRange = 'all',
  category = 'all'
}) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    libraries
  });

  // Check if API key is available
  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-yellow-500 mb-2">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500 mt-1">Please add VITE_GOOGLE_MAPS_API_KEY to environment variables</p>
        </div>
      </div>
    );
  }

  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height
  }), [height]);

  const mapOptions = useMemo(() => ({
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f2027' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] }
    ]
  }), []);

  const fetchHeatmapData = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure Google Maps API is fully loaded
      if (!window.google || !window.google.maps || !window.google.maps.LatLng) {
        const errorMsg = 'Google Maps API not fully loaded';
        console.error(errorMsg);
        setError(errorMsg);
        
        if (retryCount < 3 && !isRetry) {
          console.log(`Retrying heatmap load... (attempt ${retryCount + 1})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchHeatmapData(true), 1000);
          return;
        }
        
        toast.error('Google Maps is still loading, please try again');
        return;
      }
      
      console.log('Fetching heatmap data with filters:', { timeRange, category });
      const response = await apiService.getHeatmapData();
      const data = response.data;
      
      console.log('Heatmap API response:', data);
      
      if (!data || !Array.isArray(data)) {
        console.warn('No heatmap data received or invalid format');
        setHeatmapData([]);
        setError('No complaint data available for heatmap');
        return;
      }
      
      const validData = data.filter(c => c.location && c.location.coordinates && c.location.coordinates.length >= 2);
      console.log(`Processing ${validData.length} valid locations out of ${data.length} total`);
      
      const points = validData.map(c => new window.google.maps.LatLng(c.location.coordinates[1], c.location.coordinates[0]));
      
      setHeatmapData(points);
      setRetryCount(0); // Reset retry count on success
      console.log(`Heatmap loaded successfully with ${points.length} data points`);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to load heatmap data');
      
      if (err.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error('Failed to load heatmap data: ' + (err.response?.data?.msg || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      // Add a small delay to ensure Google Maps API is fully initialized
      const timer = setTimeout(() => {
        fetchHeatmapData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, timeRange, category]); // Re-fetch when filters change

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">Error loading Google Maps</p>
          <p className="text-sm text-gray-500 mt-1">Please check your internet connection and API key</p>
        </div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complaint Heatmap</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing distribution of active complaints across the city
            {error && <span className="text-red-500 ml-2">• {error}</span>}
          </p>
        </div>
        <button 
          onClick={() => fetchHeatmapData()} 
          disabled={loading} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : <span>Refresh</span>}
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading heatmap data...</p>
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 20,
                opacity: 0.6,
                gradient: [
                  'rgba(0, 255, 255, 0)',
                  'rgba(0, 255, 255, 1)',
                  'rgba(0, 127, 255, 1)',
                  'rgba(0, 0, 255, 1)',
                  'rgba(255, 0, 0, 1)'
                ]
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Total Active Complaints: <span className="font-semibold text-gray-900 dark:text-gray-100">{heatmapData.length}</span></span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> <span>Low Density</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> <span>High Density</span></div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
