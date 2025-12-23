import axios from "axios";
import '../config/loadEnv.js'

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

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

const geocodeWithNominatim = async (rawAddress) => {
    const baseUrl = (process.env.NOMINATIM_BASE_URL || NOMINATIM_BASE_URL).trim();
    const userAgent = (
        process.env.GEOCODER_USER_AGENT ||
        (process.env.ADMIN_EMAIL ? `ResolveHub (contact: ${process.env.ADMIN_EMAIL})` : 'ResolveHub')
    ).trim();

    const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/search`, {
        params: {
            q: rawAddress,
            format: 'jsonv2',
            addressdetails: 1,
            limit: 1,
        },
        headers: {
            'User-Agent': userAgent,
        },
        timeout: 15_000,
    });

    const results = response.data;
    if (!Array.isArray(results) || results.length === 0) {
        throw new Error('No results returned');
    }

    const hit = results[0];
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error('Invalid coordinates returned');
    }

    const addr = hit.address || {};
    const rawCity =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        'Unknown';

    return {
        coordinates: [lng, lat],
        city: normalizeCityName(rawCity),
    };
};

const geocodeWithGoogle = async (rawAddress, googleKey) => {
    const response = await axios.get(GOOGLE_GEOCODE_URL, {
        params: {
            address: rawAddress,
            key: googleKey,
        },
        timeout: 15_000,
    });

    const data = response.data;

    if (data.status !== 'OK' || data.results.length === 0) {
        const err = new Error(
            `Location lookup failed (status=${data.status}${data.error_message ? ` message=${data.error_message}` : ''})`
        );
        err.geocodeStatus = data.status;
        err.geocodeProvider = 'google';
        err.geocodeErrorMessage = data.error_message;
        throw err;
    }

    const { lat, lng } = data.results[0].geometry.location;

    const components = data.results[0].address_components;
    const cityComponent =
        components.find((c) => c.types.includes("locality")) ||
        components.find((c) => c.types.includes("administrative_area_level_2")) ||
        components.find((c) => c.types.includes("administrative_area_level_1"));

    const rawCity = cityComponent?.long_name || "Unknown";
    const city = normalizeCityName(rawCity);

    return {
        coordinates: [lng, lat],
        city,
    };
};

export const geocodeLocation = async(rawAddress) => {
    if(!rawAddress){
        throw new Error("Geocoding service requires a raw address input.");
    }

    const provider = (process.env.GEOCODER_PROVIDER || '').trim().toLowerCase();
    const googleKey = (
        process.env.GOOGLE_GEOCODING_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        ''
    ).trim();

    const effectiveProvider = provider || (googleKey ? 'google' : 'nominatim');

    if (effectiveProvider === 'nominatim') {
        try {
            return await geocodeWithNominatim(rawAddress);
        } catch (err) {
            console.error('Nominatim Geocoding Error', {
                message: err.message,
                status: err?.response?.status,
                data: err?.response?.data,
            });
            throw new Error('Failed to process location data via OpenStreetMap Nominatim.');
        }
    }

    // Default: Google Geocoding
    if (!googleKey) {
        throw new Error(
            'Google Geocoding is not configured. Set GOOGLE_GEOCODING_API_KEY (or GOOGLE_API_KEY), or set GEOCODER_PROVIDER=nominatim.'
        );
    }

    try {
        return await geocodeWithGoogle(rawAddress, googleKey);
    }
    catch(err){
        const apiErrorMessage = err?.response?.data?.error_message;
        const apiStatus = err?.response?.data?.status;
        const status = err?.geocodeStatus || apiStatus;
        console.error('Geocoding API Error', {
            message: err.message,
            status: apiStatus,
            error_message: apiErrorMessage,
        });

        // If provider wasn't explicitly set, auto-fallback on common billing/quota errors.
        if (!provider) {
            const fallbackStatuses = new Set([
                'REQUEST_DENIED',
                'OVER_DAILY_LIMIT',
                'REQUEST_OVER_QUERY_LIMIT',
                'OVER_QUERY_LIMIT',
            ]);

            if (status && fallbackStatuses.has(status)) {
                console.warn(`Google Geocoding failed (${status}). Falling back to Nominatim.`);
                try {
                    return await geocodeWithNominatim(rawAddress);
                } catch (fallbackErr) {
                    console.error('Nominatim fallback also failed:', fallbackErr.message);
                }
            }
        }

        throw new Error(
            `Failed to process location data via Google Geocoding.${apiStatus ? ` status=${apiStatus}.` : ''}${apiErrorMessage ? ` ${apiErrorMessage}` : ''}`
        );
    }
}