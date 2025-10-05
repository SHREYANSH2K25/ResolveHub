import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const libraries = ['visualization'];

const HeatmapView = ({ 
  height = "600px",
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 11
}) => {
  const [map, setMap] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatmapLayer, setHeatmapLayer] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: height
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHeatmapData();
      const data = response.data;
      
      // Convert the location data to Google Maps LatLng objects
      const heatmapPoints = data.map(complaint => {
        return new window.google.maps.LatLng(
          complaint.location.coordinates[1], // lat
          complaint.location.coordinates[0]  // lng
        );
      });
      
      setHeatmapData(heatmapPoints);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      toast.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      fetchHeatmapData();
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={<div className="h-full flex items-center justify-center">Loading Heatmap...</div>}
      onLoad={fetchHeatmapData}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Complaint Heatmap</h3>
            <p className="text-sm text-gray-600">
              Showing distribution of active complaints across the city
            </p>
          </div>
          <button
            onClick={fetchHeatmapData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>Refresh</span>
            )}
          </button>
        </div>
        
        <div className="relative rounded-lg overflow-hidden border border-gray-300">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Loading heatmap data...</p>
              </div>
            </div>
          )}
          
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
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
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)'
                  ]
                }}
              />
            )}
          </GoogleMap>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Active Complaints: <span className="font-semibold text-gray-900">{heatmapData.length}</span></span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Low Density</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Density</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default HeatmapView;