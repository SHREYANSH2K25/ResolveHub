import { useState, useRef } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { Search } from 'lucide-react';

const PlacesAutocomplete = ({ onPlaceSelect, placeholder = "Search for a location..." }) => {
  const [searchBox, setSearchBox] = useState(null);
  const inputRef = useRef();

  const onLoad = (ref) => setSearchBox(ref);

  const onPlacesChanged = () => {
    if (!searchBox) return;
    const places = searchBox.getPlaces();
    if (places?.length > 0) {
      const place = places[0];
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
        placeId: place.place_id,
        name: place.name
      };
      onPlaceSelect(location);

      if (inputRef.current) inputRef.current.value = place.formatted_address;
    }
  };

  return (
    <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="
            w-full border rounded-lg px-4 py-2 pl-10
            text-gray-900 dark:text-white
            bg-white dark:bg-municipal-700
            border-gray-300 dark:border-municipal-600
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-colors duration-200
          "
        />
      </div>
    </StandaloneSearchBox>
  );
};

export default PlacesAutocomplete;
