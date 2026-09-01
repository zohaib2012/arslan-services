import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { getStoredLocation, calculateDistance } from '../../lib/location';
import {
  MapPin, Star, ArrowRight, Shield, Clock, Search,
  Wrench, Zap, PhoneCall, Wallet, Home, BadgeCheck, ChevronRight,
  Droplets, Hammer, Paintbrush, Car, Grid3X3, Gift, BadgePercent,
  Lock, Mic, ArrowUpRight, Sparkles, Lightbulb, ShieldCheck,
  Headphones,
} from 'lucide-react';
import { GeminiIcon, WhatsAppIcon } from '../../components/BrandIcons';

const WHATSAPP_NUMBER = '923001234567';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need a service booked via Easyservice.')}`;

const POPULAR_SEARCHES = [
  { label: 'Plumber near me', icon: Droplets, query: 'plumber' },
  { label: 'Electrician chahiye', icon: Zap, query: 'electrician' },
  { label: 'AC repair chahiye', icon: Wrench, query: 'ac repair' },
  { label: 'Mechanic available?', icon: Car, query: 'mechanic' },
];

const SERVICE_ICONS = {
  Plumber: Droplets,
  Electrician: Zap,
  Carpenter: Hammer,
  'AC Repair': Wrench,
  Painter: Paintbrush,
  'Home Cleaning': Home,
  Mechanic: Car,
};

const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80';

function serviceImage(service) {
  return service?.imageUrl || service?.iconUrl || DEFAULT_SERVICE_IMAGE;
}

const TRUST_BADGES = [
  { icon: Shield, label: 'Verified', sub: 'Professionals' },
  { icon: BadgePercent, label: 'Best Price', sub: 'Guarantee' },
  { icon: Clock, label: 'On-time', sub: 'Service' },
  { icon: Lock, label: 'Secure', sub: 'Payments' },
];

const HOW_STEPS = [
  { icon: <Search size={22} />, title: 'Search & Browse', desc: 'Find verified workers near you by category, rating or AI.' },
  { icon: <PhoneCall size={22} />, title: 'Book Instantly', desc: 'Choose a time, describe your job and confirm your booking.' },
  { icon: <Wrench size={22} />, title: 'Job Gets Done', desc: 'Professional arrives on time and completes the work.' },
  { icon: <Wallet size={22} />, title: 'Pay & Review', desc: 'Pay securely and rate your experience.' },
];

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      navigate('/ai-search');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      navigate(`/ai-search?q=${encodeURIComponent(transcript)}`);
    };
    recognition.start();
  };

  useEffect(() => {
    setUserLocation(getStoredLocation());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, bannerRes, workerRes, svcRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/banners'),
          api.get('/workers', { params: { page: 1, limit: 12 } }),
          api.get('/services'),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
        if (bannerRes.status === 'fulfilled') setBanners(bannerRes.value.data?.banners || []);
        if (svcRes.status === 'fulfilled') setServices(svcRes.value.data || []);
        if (workerRes.status === 'fulfilled') {
          let list = workerRes.value.data?.workers || [];
          const loc = getStoredLocation();
          if (loc) {
            list = list.map((w) => {
              const area = w.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
              const dist = area
                ? calculateDistance(loc.lat, loc.lng, Number(area.latitude), Number(area.longitude))
                : Infinity;
              return { ...w, distanceKm: dist };
            }).sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
          }
          setWorkers(list);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (aiInput.trim()) navigate(`/ai-search?q=${encodeURIComponent(aiInput.trim())}`);
  };

  const renderCategoryIcon = (cat) => {
    const Icon = SERVICE_ICONS[cat.nameEn] || Home;
    return <Icon size={24} className="text-brand-600" />;
  };

  return (
    <div className="animate-fade-in pb-24 md:pb-0">
      {/* Mobile location selector */}
      <div className="md:hidden flex items-center gap-1.5 px-4 pt-2 pb-3 text-sm text-gray-700">
        <MapPin size={16} className="text-brand-600" />
        <span className="font-semibold">Karachi, Pakistan</span>
        <ChevronRight size={14} className="text-gray-400 -rotate-90" />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#004d26] via-[#006837] to-[#0a8f5c]">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F6F9F7] to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 md:pt-10 md:pb-14">
          <div className="rounded-[1.75rem] md:rounded-[2rem] bg-gradient-to-br from-[#0f5c34]/90 to-[#063d22]/90 border border-emerald-400/20 p-5 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 border border-white/20 text-white text-xs font-bold mb-3 md:mb-4 shadow-lg shadow-purple-500/20">
                  <GeminiIcon size={18} />
                  <span>Gemini AI Assistant</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10px] text-[#0f5c34] font-extrabold">Beta</span>
                </div>

                <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2">
                  Aapka smart service partner <span className="text-gold-400">✨</span>
                </h1>

                <p className="text-sm md:text-base text-emerald-50/85 mb-4 md:mb-5">
                  AI aapko best services dhoond kar deta hai — fast, easy & reliable.
                </p>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-5">
                  {[
                    { icon: Lightbulb, label: 'Smart Suggestions' },
                    { icon: ShieldCheck, label: 'Trusted Professionals' },
                    { icon: Star, label: 'Top Rated Services' },
                  ].map((b) => (
                    <div key={b.label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-[10px] md:text-xs font-semibold">
                      <b.icon size={13} className="text-gold-400" /> {b.label}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAiSubmit} className="mb-4">
                  <div className="relative max-w-xl bg-white rounded-2xl shadow-lg flex items-center gap-1 p-1.5 focus-within:ring-2 focus-within:ring-gold-400 transition-all">
                    <Search size={20} className="ml-3 text-gray-400 shrink-0" />
                    <input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Mujhe AC repair chahiye"
                      className="w-full min-w-0 pl-2.5 pr-1 py-3 md:py-3.5 bg-transparent text-gray-900 text-sm md:text-base placeholder:text-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={startVoice}
                      title="Voice search"
                      className={`relative shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                        listening
                          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                          : 'bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white hover:brightness-110 shadow-md shadow-[#25D366]/40 active:scale-95'
                      }`}
                    >
                      <Mic size={20} />
                      {!listening && <span className="absolute inset-0 rounded-xl bg-[#25D366]/25 animate-ping" />}
                    </button>
                    <button
                      type="submit"
                      className="shrink-0 ml-1.5 h-11 md:h-12 px-3.5 md:px-5 rounded-xl bg-gradient-to-br from-[#4285F4] via-[#8B5CF6] to-[#EC4899] text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-purple-500/40 active:scale-95"
                    >
                      <GeminiIcon size={17} />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>
                  </div>
                </form>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-emerald-50/75 font-bold">
                    <Sparkles size={12} className="text-gold-400" /> Try asking Gemini:
                  </span>
                  {[
                    { label: 'AC repair kitna hoga?', q: 'AC repair kitna hoga' },
                    { label: 'Best electrician dhoondo', q: 'best electrician dhoondo' },
                    { label: 'Plumber near me', q: 'plumber near me' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => navigate(`/ai-search?q=${encodeURIComponent(p.q)}`)}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] md:text-xs font-semibold hover:bg-white/20 active:scale-95 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { label: 'AC Repair', icon: Wrench, query: 'ac repair' },
                    { label: 'Plumber', icon: Droplets, query: 'plumber' },
                    { label: 'Electrician', icon: Zap, query: 'electrician' },
                    { label: 'More', icon: Grid3X3, query: '' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => navigate(chip.query ? `/search?q=${encodeURIComponent(chip.query)}` : '/search')}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-gray-700 text-xs font-bold shadow-sm active:scale-95 transition-all"
                    >
                      <chip.icon size={14} className="text-brand-600" /> {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex md:col-span-4 flex-col items-center justify-center">
                <div className="relative w-36 h-36 md:w-48 md:h-48">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-2xl" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#0d3b24] to-[#004d26] border border-emerald-400/30 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.35)]">
                    <GeminiIcon size={100} />
                  </div>
                </div>
                <p className="mt-3 text-white/90 text-base font-bold tracking-wide">Gemini</p>
                <p className="text-white/55 text-xs">by Google</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK SHORTCUTS ===== */}
      <section className="px-4 md:px-0 md:max-w-7xl md:mx-auto -mt-4 mb-2 relative z-10">
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {[
            { icon: Search, label: 'Search Services', to: '/search' },
            { icon: MapPin, label: 'Nearby Services', to: '/workers/nearby' },
            { icon: Star, label: 'Top Rated', to: '/search?sort=rating' },
            { icon: BadgePercent, label: 'Best Offers', to: '/search' },
            { icon: Headphones, label: 'Help Center', to: '/contact' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="flex flex-col items-center gap-1.5 md:gap-2 active:scale-95 transition-transform">
              <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-brand-600 hover:gradient-brand hover:text-white hover:shadow-glow hover:border-transparent transition-all duration-300">
                <item.icon size={20} strokeWidth={2} />
              </div>
              <span className="text-[9px] md:text-xs font-bold text-center text-gray-700 leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== POPULAR SEARCHES ===== */}
      <section className="px-4 md:px-0 pt-5 md:pt-0 md:max-w-7xl md:mx-auto">
        <h2 className="text-base font-bold text-ink-900 mb-3">Try Popular Searches</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x">
          {POPULAR_SEARCHES.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.query}
                onClick={() => navigate(`/search?q=${encodeURIComponent(s.query)}`)}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs font-semibold text-gray-700 snap-start hover:border-brand-200 transition-colors"
              >
                <Icon size={16} className="text-brand-600" />
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== POPULAR SERVICES ===== */}
      <section className="px-4 md:px-0 py-6 md:py-14 md:max-w-7xl md:mx-auto">
        <div className="flex items-end justify-between mb-4 md:mb-9">
          <div>
            <p className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Browse Services</p>
            <h2 className="font-display text-lg md:text-3xl font-extrabold text-ink-900 md:mt-1.5">Popular Services</h2>
            <p className="hidden md:block text-sm text-gray-500 mt-1.5">Book a verified professional for any service near you.</p>
          </div>
          <Link to="/search" className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full gradient-brand text-white text-xs md:text-sm font-bold shadow-glow active:scale-95 transition-all hover:brightness-110 group">
            View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 md:h-56 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {services.slice(0, 8).map((s) => (
              <Link
                key={s.id}
                to={`/search?service=${s.id}`}
                className="group relative rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-28 md:h-40 overflow-hidden">
                  <img
                    src={serviceImage(s)}
                    alt={s.nameEn}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = DEFAULT_SERVICE_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <p className="text-white font-display font-bold text-sm md:text-base drop-shadow truncate">{s.nameEn}</p>
                    {s.category?.nameEn && (
                      <p className="text-[10px] md:text-xs text-white/75 truncate">{s.category.nameEn}</p>
                    )}
                  </div>
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {categories.slice(0, 7).map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 md:gap-3 p-3 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center group-hover:gradient-brand group-hover:shadow-glow transition-all duration-300">
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt={cat.nameEn} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                  ) : (
                    <span className="group-hover:text-white transition-colors">{renderCategoryIcon(cat)}</span>
                  )}
                </div>
                <span className="text-[11px] md:text-sm font-bold text-center text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">{cat.nameEn}</span>
              </Link>
            ))}
            <Link
              to="/search"
              className="group flex flex-col items-center gap-2 md:gap-3 p-3 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center group-hover:gradient-brand group-hover:shadow-glow transition-all duration-300">
                <Grid3X3 size={24} className="text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] md:text-sm font-bold text-center text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">More</span>
            </Link>
          </div>
        )}
      </section>

      {/* ===== BEST RATE BANNER ===== */}
      <section className="px-4 md:px-0 md:max-w-7xl md:mx-auto md:mb-12">
        <div className="rounded-3xl gradient-brand p-5 md:p-8 text-white relative overflow-hidden shadow-glow">
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Shield size={24} className="text-gold-400" />
            </div>
            <div>
              <p className="font-display font-bold text-base md:text-lg">Best Rate · Verified · Near You</p>
              <p className="text-xs md:text-sm text-emerald-50/80">Top rated professionals at affordable prices</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="px-4 md:px-0 pb-6 md:pb-16 md:max-w-7xl md:mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-5">
          {TRUST_BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex flex-col items-center text-center gap-2 p-3 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-900">{b.label}</p>
                  <p className="text-[9px] md:text-[11px] text-gray-500">{b.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== BANNERS ===== */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {banners.map((b) => (
              <Link
                key={b.id}
                to={b.redirectTo || '/search'}
                className="shrink-0 w-72 md:w-80 h-40 md:h-44 rounded-3xl overflow-hidden shadow-card group relative snap-start"
              >
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent flex items-end p-5">
                  <p className="text-white font-display font-bold text-base">{b.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== TOP WORKERS / NEAR YOU ===== */}
      <section className="py-10 md:py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-9">
            <div>
              <p className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">
                {userLocation ? 'Near You' : 'Top Rated'}
              </p>
              <h2 className="font-display text-xl md:text-3xl font-extrabold text-ink-900 mt-1">
                {userLocation ? 'Workers Near You' : 'Verified Professionals'}
              </h2>
              {userLocation && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin size={12} /> Sorted by your current location
                </p>
              )}
            </div>
            <Link to="/workers/nearby" className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs md:text-sm font-bold hover:bg-brand-100 active:scale-95 transition-all group">
              See all <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} lines={2} />)
              : workers.slice(0, 4).map((w) => (
                  <WorkerCard key={w.id} worker={w} showDistance distanceKm={w.distanceKm} />
                ))
            }
            {!loading && workers.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-10">Workers coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Simple Process</p>
          <h2 className="font-display text-xl md:text-3xl font-extrabold text-ink-900 mt-1">How it Works</h2>
          <p className="text-sm text-gray-500 mt-2 md:mt-3 max-w-lg mx-auto">From booking to completion — get your work done in four simple steps.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="relative card-premium p-5 md:p-7">
              <div className="absolute -top-3 left-5 md:left-6 w-7 h-7 rounded-full bg-gold-400 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl gradient-brand text-white flex items-center justify-center mb-4 shadow-glow">
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-sm md:text-base text-gray-900">{s.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== REFER & EARN ===== */}
      <section className="px-4 md:px-0 pb-6 md:pb-16 md:max-w-7xl md:mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-brand-50 to-white border border-brand-100 p-5 md:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-brand-100/50 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={18} className="text-brand-600" />
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Refer & Earn</span>
            </div>
            <p className="font-display font-bold text-base md:text-xl text-ink-900">Invite friends & get exciting rewards</p>
          </div>
          <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center shadow-lg">
            <Gift size={32} className="text-white" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 lg:py-24">
        <div className="relative overflow-hidden gradient-brand rounded-[2rem] px-6 sm:px-10 py-10 md:py-16 lg:py-24 text-white text-center">
          <div className="absolute inset-0 bg-dots opacity-25" />
          <div className="absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl glass mb-5 md:mb-6">
              <Sparkles size={24} className="text-gold-400 md:w-7 md:h-7" />
            </div>
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold">Ready to get your work done?</h2>
            <p className="mt-3 md:mt-4 text-emerald-50/80 max-w-xl mx-auto text-sm md:text-lg">
              Join thousands of happy customers. Book a verified professional today — or start earning as a worker.
            </p>
            <div className="mt-6 md:mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/workers/nearby" className="inline-flex items-center justify-center gap-2 btn-gold px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-sm md:text-base active:scale-95 transition-all">
                <Wrench size={18} /> Hire a Professional
              </Link>
              <Link to="/auth/register" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl bg-white text-brand-700 font-bold shadow-lg shadow-black/10 hover:bg-brand-50 active:scale-95 transition-all text-sm md:text-base">
                <BadgeCheck size={18} /> Become a Worker
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl bg-[#25D366] text-white font-bold shadow-lg shadow-[#25D366]/30 hover:brightness-110 active:scale-95 transition-all text-sm md:text-base"
              >
                <WhatsAppIcon size={18} /> Chat with Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
