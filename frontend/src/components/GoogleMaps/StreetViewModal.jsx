import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const StreetViewModal = ({ location, onClose }) => {
  const streetViewRef = useRef();

  useEffect(() => {
    if (streetViewRef.current && window.google) {
      const panorama = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: location,
          pov: { heading: 34, pitch: 10 },
          zoom: 1,
        }
      );
    }
  }, [location]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Street View</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <div 
            ref={streetViewRef}
            className="w-full h-96 rounded-lg"
          />
          <p className="text-sm text-gray-600 mt-3">
            Street View for: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreetViewModal;