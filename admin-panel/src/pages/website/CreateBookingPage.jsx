import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import { getStoredLocation } from '../../lib/location';
import {
  MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM,
  getBrowserLocation, reverseGeocode, geocode,
} from '../../lib/mapbox';
import {
  Wrench, MapPin, Loader2, ShieldCheck, X, UserPlus, Calendar, Locate, Check, User, Star,
} from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function CreateBookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedWorker = searchParams.get('worker') || '';
  const serviceFilter = searchParams.get('service') || '';

  const [worker, setWorker] = useState(null);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [bookingType, setBookingType] = useState('INSTANT');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [address, setAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [coords, setCoords] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const { isAuthenticated, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const pickWorkerService = (w) => {
    const list = w?.workerServices || [];
    const primary = list.find((ws) => ws.serviceId) || list[0];
    return primary?.serviceId || '';
  };

  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const params = { page: 1, limit: 20 };
      if (serviceFilter) params.serviceId = serviceFilter;
      const res = await api.get('/workers', { params });
      setWorkerOptions(res.data?.workers || []);
    } catch (err) {
      console.error(err);
      setWorkerOptions([]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (preselectedWorker) {
      setWorkerId(preselectedWorker);
      (async () => {
        try {
          const res = await api.get(`/workers/${preselectedWorker}`);
          setWorker(res.data);
          const sid = pickWorkerService(res.data);
          if (sid) setServiceId(sid);
        } catch (err) {
          console.error(err);
          toast.error('Could not load the selected professional.');
        }
      })();
    } else {
      loadWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedWorker]);

  const selectWorker = (w) => {
    setWorkerId(w.id);
    setWorker(w);
    const sid = pickWorkerService(w);
    if (sid) setServiceId(sid);
  };

  const initMap = (c) => {
    if (!mapContainer.current) return;
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLE,
        center: [c.lng, c.lat],
        zoom: DEFAULT_ZOOM,
      });
      map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        setCoords({ lat, lng });
        placeMarker(lng, lat);
        const rev = await reverseGeocode(lat, lng);
        if (rev) setAddress(rev.placeName);
      });
      mapRef.current = map;
      return;
    }
    mapRef.current.flyTo({ center: [c.lng, c.lat], zoom: DEFAULT_ZOOM });
  };

  const placeMarker = (lng, lat) => {
    if (!mapRef.current) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color: '#006837' }).setLngLat([lng, lat]).addTo(mapRef.current);
  };

  const refreshMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await getBrowserLocation();
      if (!pos) {
        toast.error('Location access denied. Please click on the map instead.');
        return;
      }
      setCoords(pos);
      initMap(pos);
      placeMarker(pos.lng, pos.lat);
      const rev = await reverseGeocode(pos.lat, pos.lng);
      if (rev) setAddress(rev.placeName);
    } finally {
      setLocating(false);
    }
  };

  const applyStoredLocation = async (pos) => {
    setCoords(pos);
    initMap(pos);
    placeMarker(pos.lng, pos.lat);
    const rev = await reverseGeocode(pos.lat, pos.lng);
    if (rev) setAddress(rev.placeName);
  };

  useEffect(() => {
    initMap(DEFAULT_CENTER);
    const stored = getStoredLocation();
    if (stored) {
      applyStoredLocation(stored);
    } else {
      refreshMyLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveLocation = async () => {
    if (coords) return coords;
    if (address.trim()) {
      const results = await geocode(address.trim());
      if (results.length) {
        const c = { lat: results[0].center[1], lng: results[0].center[0] };
        setCoords(c);
        return c;
      }
    }
    return null;
  };

  const validate = async () => {
    if (!workerId) {
      toast.error('Please choose a professional.');
      return false;
    }
    if (!serviceId) {
      toast.error('The selected professional has no service assigned yet. Please pick another professional.');
      return false;
    }
    if (!description.trim()) {
      toast.error('Please describe the job.');
      return false;
    }
    if (bookingType === 'SCHEDULED' && !scheduledAt) {
      toast.error('Please pick a date & time.');
      return false;
    }
    const loc = await resolveLocation();
    if (!loc) {
      toast.error('Please set your location (use current location or click on the map).');
      return false;
    }
    return loc;
  };

  const submitBooking = async () => {
    setSubmitting(true);
    try {
      const loc = await validate();
      if (!loc) return;
      const payload = {
        workerId,
        serviceId,
        bookingType,
        description: description.trim(),
        scheduledAt: bookingType === 'SCHEDULED' ? scheduledAt : undefined,
        address: address.trim() || 'Customer location',
        latitude: loc.lat,
        longitude: loc.lng,
        customerNotes: customerNotes.trim() || undefined,
      };
      await api.post('/bookings', payload);
      toast.success('Booking created! The worker will be notified.');
      navigate('/dashboard/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }
    await submitBooking();
  };

  const handleGuestSubmit = async () => {
    setGuestLoading(true);
    try {
      await guestLogin(guestName.trim() || 'Guest');
      setShowGuestModal(false);
      await submitBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not continue as guest');
    } finally {
      setGuestLoading(false);
    }
  };

  const workerName = worker?.user?.fullName || workerOptions.find((w) => w.id === workerId)?.user?.fullName || '';
  const workerPhoto = worker?.user?.profilePhoto || workerOptions.find((w) => w.id === workerId)?.user?.profilePhoto;
  const selectedWorkerServices = (worker?.workerServices || []).map((ws) => ({
    id: ws.serviceId,
    name: ws.service?.nameEn || ws.customServiceName,
  })).filter((s) => s.id);
  const selectedServiceName = selectedWorkerServices.find((s) => s.id === serviceId)?.name || '';

  const renderWorkerButton = (w) => (
    <button
      key={w.id}
      onClick={() => selectWorker(w)}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        workerId === w.id ? 'border-brand-500 bg-brand-50 shadow-glow' : 'border-gray-100 hover:border-brand-200'
      }`}
    >
      {w.user?.profilePhoto ? (
        <img src={w.user.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-sm">
          {(w.user?.fullName || 'W').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{w.user?.fullName}</p>
        <p className="text-xs text-gray-400 truncate">{(w.workerServices || []).map((ws) => ws.service?.nameEn || ws.customServiceName).filter(Boolean).join(', ')}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5"><Star size={11} className="fill-amber-400" /> {w.avgRating || '0.0'}</span>
        <span className="text-[10px] text-gray-400">{w.completedJobs || 0} jobs</span>
      </div>
    </button>
  );

  return (
    <div className="py-4 md:py-8 max-w-4xl mx-auto animate-fade-in px-4 md:px-0">
      <BackButton to="/" className="mb-4" />
      <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Book a Service</p>
      <h1 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mb-2">Book a Service</h1>
      <p className="text-sm text-gray-500 mb-6">Pick a professional, tell us what you need and share your location. Done in one step.</p>

      <div className="space-y-6">
        {/* Step 1: Choose professional */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
          <h2 className="font-display font-bold text-lg text-ink-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg gradient-brand text-white flex items-center justify-center text-xs font-bold">1</span>
            <User size={17} className="text-brand-600" /> Choose Professional
          </h2>

          {preselectedWorker && worker ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-brand-200 bg-brand-50/50">
                {workerPhoto ? (
                  <img src={workerPhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-base">
                    {(workerName || 'W').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{workerName}</p>
                  <p className="text-xs text-gray-400 truncate">{(worker.workerServices || []).map((ws) => ws.service?.nameEn || ws.customServiceName).filter(Boolean).join(', ')}</p>
                  <p className="text-xs text-amber-600 font-bold mt-0.5">{worker.avgRating || '0.0'} ★ · {worker.completedJobs || 0} jobs</p>
                </div>
                <Link to="/workers/nearby" className="shrink-0 text-xs font-bold text-brand-700 hover:underline">Change</Link>
              </div>

              {selectedWorkerServices.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Service</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkerServices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          serviceId === s.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : loadingWorkers ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="animate-spin text-brand-600 mb-3" size={24} />
              <p className="text-sm text-gray-400">Finding professionals...</p>
            </div>
          ) : workerOptions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No professionals available right now.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {workerOptions.map((w) => renderWorkerButton(w))}
            </div>
          )}
        </section>

        {/* Step 2: Schedule & details */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6 space-y-5">
          <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg gradient-brand text-white flex items-center justify-center text-xs font-bold">2</span>
            <Calendar size={17} className="text-brand-600" /> Schedule & Job Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booking Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBookingType('INSTANT')}
                className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  bookingType === 'INSTANT' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-glow' : 'border-gray-200 text-gray-500'
                }`}
              >
                As soon as possible
              </button>
              <button
                onClick={() => setBookingType('SCHEDULED')}
                className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  bookingType === 'SCHEDULED' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-glow' : 'border-gray-200 text-gray-500'
                }`}
              >
                Schedule a time
              </button>
            </div>
          </div>

          {bookingType === 'SCHEDULED' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Describe the job *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. My bathroom tap is leaking and needs a new washer..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes for the worker (optional)</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
              placeholder="Anything else the worker should know..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
            />
          </div>
        </section>

        {/* Step 3: Location */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg gradient-brand text-white flex items-center justify-center text-xs font-bold">3</span>
              <MapPin size={17} className="text-brand-600" /> Job Location
            </h2>
            <button
              onClick={refreshMyLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <Locate size={14} /> {locating ? 'Locating...' : 'Use My Location'}
            </button>
          </div>

          <div className="rounded-2xl bg-brand-50/60 border border-brand-100 p-3 flex items-start gap-2 text-xs text-brand-800">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            <p>We already saved your current location when you visited. It's pre-filled below — you can keep it or type a different address.</p>
          </div>

          <div ref={mapContainer} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
            {!mapRef.current && <div className="w-full h-full bg-gray-100 animate-pulse" />}
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <MapPin size={12} /> Click on the map to fine-tune the job location
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address (optional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Type a different address, e.g. House #12, Street 4, Lahore"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <p className="text-[11px] text-gray-400 mt-1">Leave empty to use your current location, or enter a different location here.</p>
          </div>
        </section>

        {/* Summary + submit */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-5">
            <div className="p-3 rounded-xl bg-gray-50 flex items-center gap-2.5 min-w-0">
              {workerPhoto ? (
                <img src={workerPhoto} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold shrink-0">
                  <User size={15} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400">Professional</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{workerName || 'Not selected'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Wrench className="text-brand-600" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400">Service</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{selectedServiceName || 'Auto from worker'}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <MapPin className="text-brand-600" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400">Location</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{address ? address : coords ? 'Current location' : 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs md:text-sm mb-5">
            <ShieldCheck size={16} className="shrink-0" />
            Your booking will expire if the worker does not respond within the response window. You can chat with the worker after booking.
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-2xl btn-gold text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {submitting ? 'Creating Booking...' : 'Book Now'}
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">No payment now — settle after the job is done.</p>
        </section>
      </div>

      {/* Guest login modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGuestModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-2xl gradient-brand-soft flex items-center justify-center mb-4">
              <UserPlus className="text-brand-700" size={26} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900">Continue without an account?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Book as a guest to get your job done right away. You can create an account anytime to track bookings, chat and more.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleGuestSubmit(); }} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Ali"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={guestLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl btn-primary text-white font-bold disabled:opacity-60"
              >
                {guestLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                {guestLoading ? 'Placing booking...' : 'Continue as Guest'}
              </button>
              <button
                type="button"
                onClick={() => { setShowGuestModal(false); navigate('/auth/login'); }}
                className="w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Sign in instead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
