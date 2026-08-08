import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatRating } from '../../components/WorkerCard';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER } from '../../lib/mapbox';
import {
  Star, MapPin, Wrench, Phone, MessageCircle, BadgeCheck, Shield,
  Clock, Award, ChevronLeft, Calendar, Loader2, CheckCircle2, Heart, Camera, Users,
} from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function WorkerDetailPage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/workers/${id}`);
        setWorker(res.data);
        if (isAuthenticated) {
          try {
            const fav = await api.get(`/favorites/check/${id}`);
            setIsFav(fav.data?.isFavorite);
          } catch {
            /* not authenticated or error */
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Worker not found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  const loadReviews = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/workers/${id}/reviews`, { params: { page: pageNum, limit: 10 } });
      const data = res.data;
      setReviewsTotal(data?.total || 0);
      setReviewsPage(pageNum);
      setReviews(pageNum === 1 ? (data?.reviews || []) : (prev) => [...prev, ...(data?.reviews || [])]);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (worker) loadReviews(1);
  }, [worker, loadReviews]);

  useEffect(() => {
    if (!worker || !mapContainer.current) return;
    const area = worker.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
    const lat = area ? Number(area.latitude) : DEFAULT_CENTER.lat;
    const lng = area ? Number(area.longitude) : DEFAULT_CENTER.lng;

    if (mapRef.current) {
      mapRef.current.setCenter([lng, lat]);
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: [lng, lat],
      zoom: 11,
      interactive: false,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      new mapboxgl.Marker({ color: '#006837' }).setLngLat([lng, lat]).addTo(map);
    });
  }, [worker]);

  const toggleFav = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    try {
      if (isFav) {
        await api.delete(`/favorites/${id}`);
        setIsFav(false);
      } else {
        await api.post('/favorites', { workerId: id });
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    navigate(`/dashboard/chat/${worker.user?.id}`);
  };

  const bookNow = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    navigate(`/book?worker=${id}`);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={32} />
        <p className="text-gray-500 text-sm">Loading worker profile...</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 font-medium">{error || 'Worker not found'}</p>
        <Link to="/" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-700 hover:underline">
          <ChevronLeft size={15} /> Back to home
        </Link>
      </div>
    );
  }

  const name = worker.user?.fullName || 'Worker';
  const photo = worker.user?.profilePhoto;
  const services = worker.workerServices || [];
  const areas = worker.serviceAreas || [];
  const portfolio = worker.portfolio || [];
  const paymentMethods = worker.paymentMethods || [];
  const workingHours = worker.workingHoursJson || {};
  const languages = worker.languages || [];

  return (
    <div className="py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden mb-7">
        <div className="h-40 relative">
          {worker.coverPhoto ? (
            <img src={worker.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="h-full gradient-brand relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_20%,white,transparent_55%)]" />
              <div className="absolute inset-0 opacity-20 bg-dots" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="px-6 pb-6 -mt-14 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl shadow-brand-900/10">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full rounded-[20px] object-cover" />
              ) : (
                <div className="w-full h-full rounded-[20px] gradient-brand-soft flex items-center justify-center text-brand-700 text-4xl font-extrabold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 md:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900">{name}</h1>
                {worker.isOnline && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-500 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    Online
                  </span>
                )}
                {worker.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-sm font-bold text-amber-700">
                  <Star size={15} className="fill-amber-400 text-amber-400" /> {formatRating(worker.avgRating)}
                </span>
                <span className="text-sm text-gray-400">({worker.totalReviews || 0} reviews)</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{worker.completedJobs || 0} jobs done</span>
              </div>
              <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-500 flex-wrap">
                {worker.experienceYears > 0 && (
                  <span className="inline-flex items-center gap-1"><Award size={13} className="text-brand-500" /> {worker.experienceYears} yrs experience</span>
                )}
                {worker.responseTimeMinutes > 0 && (
                  <span className="inline-flex items-center gap-1"><Clock size={13} className="text-brand-500" /> ~{worker.responseTimeMinutes} min response</span>
                )}
                {languages.length > 0 && (
                  <span className="inline-flex items-center gap-1"><Users size={13} className="text-brand-500" /> {languages.join(', ')}</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:pb-1">
              <button
                onClick={toggleFav}
                className={`p-3 rounded-xl border transition-colors ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'}`}
                title="Add to favorites"
              >
                <Heart size={18} className={isFav ? 'fill-red-500' : ''} />
              </button>
              <a
                href={`tel:${worker.user?.phone || ''}`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Phone size={16} /> Call
              </a>
              <button
                onClick={startChat}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle size={16} /> Message
              </button>
              <button
                onClick={bookNow}
                className="btn-gold inline-flex items-center gap-2 px-5 py-3 text-white text-sm font-bold rounded-xl"
              >
                <Calendar size={16} /> Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="font-display font-bold text-lg text-ink-900 mb-3">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {worker.description || 'This professional has not added a description yet.'}
            </p>
          </section>

          {/* Services */}
          {services.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Services Offered</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((ws) => (
                  <div key={ws.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50/60 transition-colors">
                    {ws.service?.iconUrl ? (
                      <img src={ws.service.iconUrl} alt="" className="w-9 h-9 object-contain" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                        <Wrench className="text-brand-600" size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{ws.service?.nameEn}</p>
                      <p className="text-xs text-gray-400">{ws.service?.category?.nameEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square hover:opacity-90 transition-opacity">
                    {p.mediaType === 'IMAGE' || p.mediaUrl?.includes('res.cloudinary.com') ? (
                      <img src={p.mediaUrl} alt={p.caption || 'portfolio'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera size={24} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-ink-900">
                Reviews
                <span className="ml-2 text-sm font-medium text-gray-400">({reviewsTotal})</span>
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-sm font-bold text-amber-700">
                <Star size={15} className="fill-amber-400 text-amber-400" /> {formatRating(worker.avgRating)}
              </span>
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-3 p-4 rounded-xl bg-gray-50">
                    {r.customer?.profilePhoto ? (
                      <img src={r.customer.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-sm">
                        {(r.customer?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">{r.customer?.fullName}</p>
                        <span className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                          ))}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reviews.length < reviewsTotal && (
              <button
                onClick={() => loadReviews(reviewsPage + 1)}
                className="w-full mt-4 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                Load more reviews
              </button>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location map */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-4 pb-2">
              <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-1.5"><MapPin size={17} className="text-brand-600" /> Service Areas</h2>
            </div>
            <div ref={mapContainer} className="w-full" style={{ height: 220 }} />
            {areas.length > 0 && (
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {areas.map((a) => (
                    <span key={a.id} className="px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 rounded-full">
                      {a.city}{a.area ? ` · ${a.area}` : ''}{a.radiusKm ? ` (${a.radiusKm}km)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Working hours */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-1.5 mb-3"><Clock size={17} className="text-brand-600" /> Working Hours</h2>
            {Object.keys(workingHours).length > 0 ? (
              <div className="space-y-1.5">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 capitalize">{day}</span>
                    <span className={`font-medium ${hours?.enabled ? 'text-gray-800' : 'text-gray-300'}`}>
                      {hours?.enabled ? `${hours.open || '--'} - ${hours.close || '--'}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not specified.</p>
            )}
          </section>

          {/* Trust badges */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h2 className="font-display font-bold text-lg text-ink-900 mb-3">Trust & Safety</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={15} className="text-brand-600" />
                {worker.verificationStatus === 'VERIFIED' ? 'Identity verified' : 'Verification pending'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={15} className="text-brand-600" />
                {worker.completedJobs || 0} completed jobs
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star size={15} className="text-brand-600" />
                {formatRating(worker.avgRating)} average rating
              </div>
            </div>
          </section>

          {/* Payment methods */}
          {paymentMethods.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-display font-bold text-lg text-ink-900 mb-3">Payment Methods</h2>
              <div className="space-y-2">
                {paymentMethods.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="font-medium text-gray-800">{p.methodType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">{p.accountTitle}</p>
                    </div>
                    {p.isDefault && <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Book CTA */}
          <button
            onClick={bookNow}
            className="w-full py-4 rounded-2xl btn-gold text-white font-bold shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Book This Worker
          </button>
        </div>
      </div>
    </div>
  );
}
