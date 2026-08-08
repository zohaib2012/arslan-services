import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, getBrowserLocation, calculateDistance } from '../../lib/mapbox';
import { MapPin, Locate, Loader2, ChevronDown } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function NearbyWorkersPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState(10);
  const [geoError, setGeoError] = useState('');

  const initMap = useCallback((c) => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [c.lng, c.lat],
      zoom: DEFAULT_ZOOM,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    );
    mapRef.current = map;
  }, []);

  const loadNearby = useCallback(async (c, r) => {
    setLoading(true);
    try {
      const res = await api.get('/workers/nearby', { params: { lat: c.lat, lng: c.lng, radius: r } });
      const data = res.data || [];
      setWorkers(data);
      addMarkers(data, c);
    } catch (err) {
      console.error(err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMarkers = useCallback((list, c) => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    list.forEach((w) => {
      const area = w.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
      if (!area) return;
      const lat = Number(area.latitude);
      const lng = Number(area.longitude);
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white text-[11px] font-bold shadow-lg border-2 border-white cursor-pointer';
      el.textContent = (w.user?.fullName || 'W').charAt(0).toUpperCase();
      el.addEventListener('click', () => {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 13 });
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(
          `<div style="min-width:160px">
             <a href="/workers/${w.id}" style="font-weight:700;color:#004D26;font-size:13px;text-decoration:none">${w.user?.fullName || 'Worker'}</a>
             <div style="font-size:11px;color:#6b7280">${w.workerServices?.length || 0} services</div>
           </div>`,
        );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    if (list.length > 0 && mapRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      list.forEach((w) => {
        const area = w.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
        if (area) bounds.extend([Number(area.longitude), Number(area.latitude)]);
      });
      if (c) bounds.extend([c.lng, c.lat]);
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 13 });
      }
    }
  }, []);

  const locate = useCallback(async () => {
    setLocating(true);
    setGeoError('');
    const pos = await getBrowserLocation();
    if (!pos) {
      setGeoError('Location access denied. Using default area (Lahore).');
      loadNearby(DEFAULT_CENTER, radius);
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat], zoom: DEFAULT_ZOOM });
      }
      setLocating(false);
      return;
    }
    setCenter(pos);
    initMap(pos);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [pos.lng, pos.lat], zoom: DEFAULT_ZOOM });
    }
    await loadNearby(pos, radius);
    setLocating(false);
  }, [initMap, loadNearby, radius]);

  useEffect(() => {
    initMap(DEFAULT_CENTER);
    loadNearby(DEFAULT_CENTER, radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRadiusChange = async (r) => {
    setRadius(r);
    await loadNearby(center, r);
  };

  return (
    <div className="py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Discover Near You</p>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1 flex items-center gap-2">
            <MapPin className="text-brand-600" size={26} /> Nearby Workers
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {loading ? 'Finding professionals near you...' : `${workers.length} verified workers near ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="pl-4 pr-9 py-3 text-sm bg-white border border-gray-200 rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
            >
              <option value={5}>5 km radius</option>
              <option value={10}>10 km radius</option>
              <option value={20}>20 km radius</option>
              <option value={50}>50 km radius</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          </div>
          <button
            onClick={locate}
            disabled={locating}
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {locating ? <Loader2 className="animate-spin" size={16} /> : <Locate size={16} />}
            Use My Location
          </button>
        </div>
      </div>

      {geoError && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">{geoError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-card">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <MapPin className="text-brand-600" size={30} />
              </div>
              <h3 className="font-display font-bold text-gray-700">No workers nearby</h3>
              <p className="text-sm text-gray-400 mt-1">Try increasing the radius or using your current location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {workers.map((w) => {
                const area = w.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
                const dist = area
                  ? calculateDistance(center.lat, center.lng, Number(area.latitude), Number(area.longitude))
                  : null;
                return <WorkerCard key={w.id} worker={w} showDistance distanceKm={dist} />;
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-3xl overflow-hidden border border-gray-100 shadow-card" style={{ height: 480 }}>
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
