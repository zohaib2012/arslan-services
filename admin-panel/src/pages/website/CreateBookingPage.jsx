import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, getBrowserLocation, reverseGeocode } from '../../lib/mapbox';
import { ChevronLeft, ChevronRight, MapPin, Wrench, Locate, Calendar, Loader2, ShieldCheck, Check } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

const steps = ['Service & Worker', 'Schedule & Details', 'Confirm'];

export default function CreateBookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedWorker = searchParams.get('worker') || '';
  const preselectedService = searchParams.get('service') || '';

  const [step, setStep] = useState(0);
  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [bookingType, setBookingType] = useState('INSTANT');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [address, setAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [coords, setCoords] = useState(null);
  const [searchingWorkers, setSearchingWorkers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data || []);
        if (preselectedService) setServiceId(preselectedService);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [preselectedService]);

  useEffect(() => {
    if (!workerId) return;
    (async () => {
      try {
        const res = await api.get(`/workers/${workerId}`);
        setWorker(res.data);
      } catch (err) {
        console.error(err);
        setWorker(null);
      }
    })();
  }, [workerId]);

  useEffect(() => {
    if (!preselectedWorker) return;
    setWorkerId(preselectedWorker);
  }, [preselectedWorker]);

  const loadWorkersForService = async (sid) => {
    if (!sid) return;
    setSearchingWorkers(true);
    try {
      const res = await api.get('/workers', { params: { serviceId: sid, page: 1, limit: 20 } });
      setWorkerOptions(res.data?.workers || []);
    } catch (err) {
      console.error(err);
      setWorkerOptions([]);
    } finally {
      setSearchingWorkers(false);
    }
  };

  const handleServiceSelect = (sid) => {
    setServiceId(sid);
    setWorkerId('');
    setWorker(null);
    loadWorkersForService(sid);
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
      mapRef.current = map;
    }
    mapRef.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#006837' }).setLngLat([lng, lat]).addTo(mapRef.current);
      const rev = await reverseGeocode(lat, lng);
      if (rev) setAddress(rev.placeName);
    });
    mapRef.current.flyTo({ center: [c.lng, c.lat], zoom: DEFAULT_ZOOM });
  };

  const useMyLocation = async () => {
    const pos = await getBrowserLocation();
    if (!pos) {
      toast.error('Location access denied. Please click on the map instead.');
      return;
    }
    setCoords(pos);
    initMap(pos);
    if (mapRef.current) {
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker({ color: '#006837' }).setLngLat([pos.lng, pos.lat]).addTo(mapRef.current);
    }
    const rev = await reverseGeocode(pos.lat, pos.lng);
    if (rev) setAddress(rev.placeName);
  };

  useEffect(() => {
    initMap(DEFAULT_CENTER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNext =
    step === 0
      ? !!workerId && !!serviceId
      : step === 1
        ? bookingType && description && (bookingType === 'SCHEDULED' ? scheduledAt : true) && coords && address
        : true;
  const handleNext = () => {
    if (!canNext) {
      toast.error('Please complete all required fields.');
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    if (step === 1 && mapRef.current) {
      setTimeout(() => mapRef.current.resize(), 100);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        workerId,
        serviceId,
        bookingType,
        description,
        scheduledAt: bookingType === 'SCHEDULED' ? scheduledAt : undefined,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        customerNotes: customerNotes || undefined,
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

  const workerName = worker?.user?.fullName || workerOptions.find((w) => w.id === workerId)?.user?.fullName || '';
  const workerPhoto = worker?.user?.profilePhoto || workerOptions.find((w) => w.id === workerId)?.user?.profilePhoto;
  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="py-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a Service</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                i === step ? 'bg-brand-600 text-white' : i < step ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? <Check size={15} /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 0: Select service & worker */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench size={17} className="text-brand-600" /> Choose Service
            </h2>
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading services...</div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s.id)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      serviceId === s.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    {s.iconUrl ? (
                      <img src={s.iconUrl} alt="" className="w-9 h-9 object-contain" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                        <Wrench className="text-brand-600" size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.nameEn}</p>
                      <p className="text-xs text-gray-400">{s.category?.nameEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={17} className="text-brand-600" /> Choose Professional
            </h2>
            {!serviceId ? (
              <p className="text-sm text-gray-400 py-8 text-center">Select a service first to see available professionals.</p>
            ) : searchingWorkers ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="animate-spin text-brand-600 mb-3" size={24} />
                <p className="text-sm text-gray-400">Finding professionals...</p>
              </div>
            ) : workerOptions.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No professionals available for this service yet.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {workerOptions.map((w) => {
                  const servicesList = (w.workerServices || []).map((ws) => ws.service?.nameEn).filter(Boolean);
                  return (
                    <button
                      key={w.id}
                      onClick={() => { setWorkerId(w.id); setWorker(w); }}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        workerId === w.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
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
                        <p className="text-xs text-gray-400 truncate">{servicesList.join(', ')}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-semibold text-amber-600">{w.avgRating || '0.0'} ★</span>
                        <span className="text-[10px] text-gray-400">{w.completedJobs || 0} jobs</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Schedule & details */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={17} className="text-brand-600" /> Schedule & Job Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booking Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBookingType('INSTANT')}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                    bookingType === 'INSTANT' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  As soon as possible
                </button>
                <button
                  onClick={() => setBookingType('SCHEDULED')}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                    bookingType === 'SCHEDULED' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
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
                rows={4}
                placeholder="e.g. My bathroom tap is leaking and needs a new washer..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes for the worker (optional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                placeholder="Anything else the worker should know..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={17} className="text-brand-600" /> Job Location
              </h2>
              <button
                onClick={useMyLocation}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                <Locate size={14} /> Use My Location
              </button>
            </div>
            <div ref={mapContainer} className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 260 }}>
              {!mapRef.current && <div className="w-full h-full bg-gray-100 animate-pulse" />}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <MapPin size={12} /> Click on the map to set the job location
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, city"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            {coords && (
              <p className="text-xs text-gray-400">
                Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Review Your Booking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
              {workerPhoto ? (
                <img src={workerPhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold">
                  {(workerName || 'W').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Professional</p>
                <p className="text-sm font-semibold text-gray-800">{workerName || 'Loading...'}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <Wrench className="text-brand-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Service</p>
                <p className="text-sm font-semibold text-gray-800">{selectedService?.nameEn || serviceId}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50">
              <p className="text-xs text-gray-400">Booking Type</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {bookingType === 'INSTANT' ? 'As soon as possible' : `Scheduled: ${new Date(scheduledAt).toLocaleString()}`}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50">
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2">{address}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 mb-6">
            <p className="text-xs text-gray-400 mb-1">Job Description</p>
            <p className="text-sm text-gray-700">{description}</p>
            {customerNotes && (
              <>
                <p className="text-xs text-gray-400 mt-3 mb-1">Customer Notes</p>
                <p className="text-sm text-gray-700">{customerNotes}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm mb-6">
            <ShieldCheck size={18} className="shrink-0" />
            Your booking will expire if the worker does not respond within the response window. You can chat with the worker after booking.
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {submitting ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">
            Cancel
          </Link>
        )}
      </div>
    </div>
  );
}
