import axios from "axios";
import "dotenv/config"

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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

        // extracting precise 2d coordinates
        const {lat, lng} = data.results[0].geometry.location;

        return[lng, lat];
    }
    catch(err){
        console.error('Geocoding API Error', err.message)

        throw new Error("Failed to process location data via Google Geocoding.");
    }
}