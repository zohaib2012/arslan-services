export const MAPBOX_TOKEN = 'pk.eyJ1IjoiOWFsaSIsImEiOiJjbXMyN21nMWIxYmhhMnhwbXRsMm83NGxlIn0.PyXLHqISTTz99DlYVbrfRg';
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

export async function geocode(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${MAPBOX_TOKEN}&country=pk&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.features || []).map((f) => ({
    id: f.id,
    placeName: f.place_name,
    center: f.center, // [lng, lat]
    text: f.text,
  }));
}

export async function reverseGeocode(lat, lng) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=pk&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  const f = data.features?.[0];
  return f ? { placeName: f.place_name, center: f.center } : null;
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 }; // Lahore
export const DEFAULT_ZOOM = 12;

export function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
