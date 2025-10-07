import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, HeatmapLayer, useJsApiLoader } from '@react-google-maps/api';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const libraries = ['visualization'];

const HeatmapView = ({ 
  height = "600px",
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 11
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHeatmapData();
      const data = response.data;
      const points = data.map(c => new window.google.maps.LatLng(c.location.coordinates[1], c.location.coordinates[0]));
      setHeatmapData(points);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchHeatmapData();
  }, [isLoaded]);

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complaint Heatmap</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Showing distribution of active complaints across the city</p>
        </div>
        <button onClick={fetchHeatmapData} disabled={loading} className="btn-secondary flex items-center space-x-2">
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
