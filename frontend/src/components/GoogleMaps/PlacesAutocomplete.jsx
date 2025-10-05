import { useState, useRef } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { Search } from 'lucide-react';

const PlacesAutocomplete = ({ onPlaceSelect, placeholder = "Search for a location..." }) => {
  const [searchBox, setSearchBox] = useState(null);
  const inputRef = useRef();

  const onLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
          placeId: place.place_id,
          name: place.name
        };
        onPlaceSelect(location);
        
        // Clear the input
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address;
        }
      }
    }
  };

  return (
    <StandaloneSearchBox
      onLoad={onLoad}
      onPlacesChanged={onPlacesChanged}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="input-field pl-10"
          placeholder={placeholder}
        />
      </div>
    </StandaloneSearchBox>
  );
};

export default PlacesAutocomplete;