import { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import PlacesAutocomplete from './PlacesAutocomplete';
import StreetViewModal from './StreetViewModal';
import { MapPin, Eye } from 'lucide-react';

const libraries = ['places'];

const MapContainer = ({ 
  onLocationSelect, 
  selectedLocation,
  height = "400px",
  showPlacesSearch = true,
  showStreetView = true,
  markers = [],
  center = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
  zoom = 12
}) => {
  const [map, setMap] = useState(null);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const mapRef = useRef();

  const mapContainerStyle = {
    width: '100%',
    height: height
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    if (onLocationSelect) {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      onLocationSelect(location);
    }
  };

  const handlePlaceSelect = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    if (map) {
      map.panTo({ lat: location.lat, lng: location.lng });
      map.setZoom(16);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={<div className="h-full flex items-center justify-center">Loading Map...</div>}
    >
      <div className="space-y-4">
        {showPlacesSearch && (
          <div className="space-y-2">
            <label className="form-label">Search Location</label>
            <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
            <p className="text-sm text-gray-500">
              Search for an address or click on the map to select a location
            </p>
          </div>
        )}
        
        <div className="relative rounded-lg overflow-hidden border border-gray-300">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedLocation || center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Selected location marker */}
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                }}
              />
            )}
            
            {/* Additional markers */}
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                title={marker.title}
                icon={marker.icon}
              />
            ))}
          </GoogleMap>
          
          {/* Street View Button */}
          {showStreetView && selectedLocation && (
            <button
              onClick={() => setStreetViewOpen(true)}
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 shadow-md transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Street View</span>
            </button>
          )}
        </div>
        
        {selectedLocation && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-primary-800">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Selected Location:</span>
            </div>
            <p className="text-sm text-primary-700 mt-1">
              Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
        
        {/* Street View Modal */}
        {streetViewOpen && selectedLocation && (
          <StreetViewModal
            location={selectedLocation}
            onClose={() => setStreetViewOpen(false)}
          />
        )}
      </div>
    </LoadScript>
  );
};

export default MapContainer;