import React, { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const StreetViewModal = ({ location, onClose }) => {
  const streetViewRef = useRef();
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (streetViewRef.current && window.google?.maps?.StreetViewPanorama) {
      try {
        const panorama = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: location,
          pov: { heading: 34, pitch: 10 },
          zoom: 1,
          disableDefaultUI: true,
          linksControl: false,
        });

        panorama.addListener('status_changed', () => {
          if (panorama.getStatus && panorama.getStatus() === 'ZERO_RESULTS') {
            setLoadError("Street View data not available for this exact location. Try nearby.");
          } else {
            setLoadError(null);
          }
        });
      } catch (err) {
        console.error("StreetView init failed:", err);
        setLoadError("Error initializing Street View. Check API key and quota.");
      }
    }
  }, [location]);

  const renderContent = () => {
    if (loadError) {
      return (
        <div className="flex items-center justify-center h-full p-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold mb-1">Error Loading Street View</p>
            <p className="text-sm">{loadError}</p>
            <p className="text-xs mt-2 text-red-500 dark:text-red-300">
              If it persists, check Google Maps API quota/billing.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={streetViewRef}
        className="w-full h-96 rounded-lg border border-gray-300 dark:border-municipal-700 shadow-inner"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-municipal-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-municipal-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Live Street View</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-municipal-700 rounded-full"
            aria-label="Close Street View"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4">
          {renderContent()}

          <div className="mt-4 p-3 bg-gray-50 dark:bg-municipal-700 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Viewing coordinates:
              <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetViewModal;
