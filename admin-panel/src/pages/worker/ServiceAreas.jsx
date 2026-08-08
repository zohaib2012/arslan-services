import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, getBrowserLocation, reverseGeocode } from '../../lib/mapbox';
import { ChevronLeft, MapPin, Locate, Plus, X, Loader2 } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function ServiceAreas() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [city, setCity] = useState('');
  const [areaName, setAreaName] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [coords, setCoords] = useState(null);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/workers/me');
        setAreas(res.data?.serviceAreas || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!mapContainer.current) return;
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLE,
        center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
        zoom: DEFAULT_ZOOM,
      });
      map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      mapRef.current = map;
      mapRef.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        setCoords({ lat, lng });
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = new mapboxgl.Marker({ color: '#006837' }).setLngLat([lng, lat]).addTo(mapRef.current);
        const rev = await reverseGeocode(lat, lng);
        if (rev?.center) {
          const parts = rev.placeName.split(',').map((p) => p.trim());
          setCity(parts[parts.length - 1] || '');
          setAreaName(parts[0] || '');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const useMyLocation = async () => {
    const pos = await getBrowserLocation();
    if (!pos) {
      toast.error('Location access denied. Please allow location in your browser, or click on the map to pin the area.');
      return;
    }
    setCoords(pos);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [pos.lng, pos.lat], zoom: DEFAULT_ZOOM });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#006837' }).setLngLat([pos.lng, pos.lat]).addTo(mapRef.current);
    }
    const rev = await reverseGeocode(pos.lat, pos.lng);
    if (rev?.center) {
      const parts = rev.placeName.split(',').map((p) => p.trim());
      setCity(parts[parts.length - 1] || '');
      setAreaName(parts[0] || '');
    }
  };

  const addArea = () => {
    if (!city.trim() || !areaName.trim()) {
      toast.error('Please fill in city and area (or click the map).');
      return;
    }
    const existing = areas.find(
      (a) => a.city.toLowerCase() === city.trim().toLowerCase() && a.area.toLowerCase() === areaName.trim().toLowerCase(),
    );
    if (existing) return toast.error('This area is already added.');
    setAreas((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        city: city.trim(),
        area: areaName.trim(),
        latitude: coords?.lat || null,
        longitude: coords?.lng || null,
        radiusKm,
      },
    ]);
    setCity('');
    setAreaName('');
    setCoords(null);
  };

  const removeArea = (id) => setAreas((prev) => prev.filter((a) => a.id !== id));

  const save = async () => {
    setSaving(true);
    try {
      const payload = areas.map((a) => ({
        city: a.city,
        area: a.area,
        latitude: a.latitude ?? undefined,
        longitude: a.longitude ?? undefined,
        radiusKm: a.radiusKm ?? undefined,
      }));
      await api.put('/workers/me/areas', payload);
      toast.success('Service areas updated.');
      navigate('/worker/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save areas.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <MapPin size={22} className="text-brand-600" /> Service Areas
      </h1>
      <p className="text-sm text-gray-500 mb-6">Define the areas where you provide services.</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Pin a location on the map</p>
          <button
            onClick={useMyLocation}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
          >
            <Locate size={14} /> Use My Location
          </button>
        </div>
        <div ref={mapContainer} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
          {!mapRef.current && <div className="w-full h-full bg-gray-100 animate-pulse" />}
        </div>
        <p className="text-xs text-gray-400">Click on the map to auto-fill city and area.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Lahore)"
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="Area (e.g. Gulberg)"
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Radius km"
            />
            <button onClick={addArea} className="shrink-0 px-3 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Added Areas ({areas.length})</h2>
        {areas.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No areas added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                <MapPin size={12} />
                {a.city} · {a.area}
                {a.radiusKm ? ` (${a.radiusKm}km)` : ''}
                <button onClick={() => removeArea(a.id)} className="text-brand-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving || areas.length === 0}
        className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Service Areas'}
      </button>
    </div>
  );
}
