import axios from "axios";
import "dotenv/config"

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// City name normalization mapping
const CITY_NORMALIZATION = {
    "Delhi Division": "Delhi",
    "New Delhi": "Delhi", 
    "Delhi": "Delhi",
    "Mumbai Suburban": "Mumbai",
    "Mumbai": "Mumbai",
    "Prayagraj": "Prayagraj",
    "Allahabad": "Prayagraj", // Historical name
    "Chennai": "Chennai",
    "Madras": "Chennai", // Historical name
    "Jaipur": "Jaipur"
};

// Function to normalize city names
const normalizeCityName = (cityName) => {
    if (!cityName) return "Unknown";
    return CITY_NORMALIZATION[cityName] || cityName;
};

export const geocodeLocation = async(rawAddress) => {
    if(!rawAddress){
        throw new Error("Geocoding service requires a raw address input.");
    }

    try {
        // executing location lookup
        const response = await axios.get(GOOGLE_GEOCODE_URL, {
            // authenticating req and specifying address to be searched
            params : {
                address : rawAddress,
                key : process.env.GOOGLE_API_KEY
            }
        });

        // extracting json response
        const data = response.data;

        if(data.status !== 'OK' || data.results.length === 0){
            throw new Error(`Location lookup failed : ${data.status}`);
        }
        const { lat, lng } = data.results[0].geometry.location;

        const components = data.results[0].address_components;
        const cityComponent = 
            components.find((c) => c.types.includes("locality")) ||
            components.find((c) => c.types.includes("administrative_area_level_2")) ||
            components.find((c) => c.types.includes("administrative_area_level_1"))

        const rawCity = cityComponent?.long_name || "Unknown";
        const city = normalizeCityName(rawCity);
        
        return{
            coordinates : [lng, lat],
            city,
        };
    }
    catch(err){
        console.error('Geocoding API Error', err.message)

        throw new Error("Failed to process location data via Google Geocoding.");
    }
}