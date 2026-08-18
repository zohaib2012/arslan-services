import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { CardSkeleton } from '../../components/SkeletonLoader';
import {
  MapPin, Star, ArrowRight, Sparkles, Shield, Clock, Search,
  Wrench, Zap, PhoneCall, Wallet, Home, BadgeCheck, ChevronRight,
  Droplets, Hammer, Paintbrush, Car, Grid3X3, Gift, BadgePercent,
  Lock,
} from 'lucide-react';

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

const TRUST_BADGES = [
  { icon: Shield, label: 'Verified', sub: 'Professionals' },
  { icon: BadgePercent, label: 'Best Price', sub: 'Guarantee' },
  { icon: Clock, label: 'On-time', sub: 'Service' },
  { icon: Lock, label: 'Secure', sub: 'Payments' },
];

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [catRes, bannerRes, workerRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/banners'),
          api.get('/workers', { params: { page: 1, limit: 8 } }),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
        if (bannerRes.status === 'fulfilled') setBanners(bannerRes.value.data?.banners || []);
        if (workerRes.status === 'fulfilled') setWorkers(workerRes.value.data?.workers || []);
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

      {/* ===== HERO (mobile app style) ===== */}
      <section className="md:relative md:overflow-hidden">
        <div className="hidden md:absolute md:inset-0 md:gradient-brand">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl" />
        </div>

        <div className="md:relative md:max-w-7xl md:mx-auto md:px-4 sm:md:px-6 md:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* AI Assistant card */}
            <div className="lg:col-span-7 px-4 md:px-0">
              <div className="md:hidden rounded-3xl gradient-brand p-5 text-white shadow-glow overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-brand-400/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-gold-400" />
                    <span className="text-sm font-bold">Gemini AI Assistant</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">Beta</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug mb-1">
                    Aap jo poochain, best service recommend karain.
                  </h2>
                  <p className="text-xs text-emerald-50/80 mb-4">
                    AI aapko best options dhoond kar deta hai.
                  </p>
                  <form onSubmit={handleAiSubmit} className="relative">
                    <input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Mujhe AC repair chahiye"
                      className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Desktop hero content */}
              <div className="hidden md:block">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-emerald-50 mb-6 animate-slide-up">
                  <BadgeCheck size={14} className="text-gold-400" />
                  Pakistan's Trusted Home Services Marketplace
                </div>
                <h1 className="font-display text-3xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
                  Expert Professionals at your{' '}
                  <span className="relative inline-block">
                    <span className="text-gradient-gold">Doorstep</span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                      <path d="M2 9C60 3 140 3 198 9" stroke="#F5A623" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                    </svg>
                  </span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-emerald-50/80 leading-relaxed max-w-xl">
                  Find verified, top-rated workers for every job — plumbing, electrical, cleaning,
                  repairs and more. Book in seconds with transparent pricing.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
                  <Link
                    to="/workers/nearby"
                    className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-white text-base"
                  >
                    <Search size={19} /> Find a Worker
                  </Link>
                  <Link
                    to="/ai-search"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl glass font-semibold text-white hover:bg-white/15 transition-colors"
                  >
                    <Sparkles size={19} className="text-gold-400" /> Ask AI Assistant
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-emerald-50/70">
                  <div className="flex items-center gap-2"><Shield size={17} className="text-gold-400" /> Verified professionals</div>
                  <div className="flex items-center gap-2"><Star size={17} className="text-gold-400 fill-gold-400" /> 4.5+ average rating</div>
                  <div className="flex items-center gap-2"><Clock size={17} className="text-gold-400" /> 24/7 booking</div>
                </div>
              </div>
            </div>

            {/* Searching hint */}
            <div className="md:hidden px-4 -mt-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                Searching best AC repair services near you...
              </div>
            </div>

            {/* Desktop floating stats */}
            <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-3xl p-6 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="w-12 h-12 rounded-2xl bg-gold-400/20 flex items-center justify-center mb-3">
                    <Wrench className="text-gold-400" size={22} />
                  </div>
                  <p className="font-display text-3xl font-extrabold text-white">{workers.length || '100'}+</p>
                  <p className="text-xs text-emerald-100/60 mt-1">Verified Workers</p>
                </div>
                <div className="glass rounded-3xl p-6 animate-float" style={{ animationDelay: '0.6s' }}>
                  <div className="w-12 h-12 rounded-2xl bg-brand-300/20 flex items-center justify-center mb-3">
                    <Zap className="text-emerald-300" size={22} />
                  </div>
                  <p className="font-display text-3xl font-extrabold text-white">{categories.length || '20'}+</p>
                  <p className="text-xs text-emerald-100/60 mt-1">Service Categories</p>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-300/15 flex items-center justify-center">
                    <MapPin className="text-emerald-300" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">City-wide Coverage</p>
                    <p className="text-xs text-emerald-100/60">Serving Lahore & across Pakistan</p>
                  </div>
                </div>
                <Link to="/workers/nearby" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-500 transition-colors">
                  Explore on interactive map <ChevronRight size={16} />
                </Link>
              </div>
              <div className="glass rounded-3xl p-4 flex items-center gap-3 animate-float" style={{ animationDelay: '1.8s' }}>
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <BadgeCheck size={18} className="text-emerald-300" />
                </div>
                <p className="text-xs text-emerald-50/80 leading-snug">
                  <span className="font-bold text-white">15-day warranty</span> on every booking. Your safety and peace of mind come first.
                </p>
              </div>
            </div>
          </div>
        </div>

        <svg className="hidden md:block absolute bottom-0 left-0 w-full text-[#F6F9F7]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 60h1440V20c-120 20-260 30-400 25S800 10 700 10 400 20 300 15 100 0 0 20v40z" />
        </svg>
      </section>

      {/* ===== POPULAR SEARCHES ===== */}
      <section className="px-4 md:px-0 pt-5 md:pt-0 md:max-w-7xl md:mx-auto">
        <h2 className="text-base font-bold text-ink-900 mb-3 md:hidden">Try Popular Searches</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x md:hidden">
          {POPULAR_SEARCHES.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.query}
                onClick={() => navigate(`/search?q=${encodeURIComponent(s.query)}`)}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs font-semibold text-gray-700 snap-start"
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
        <div className="flex items-center justify-between mb-4 md:mb-9">
          <div>
            <p className="hidden md:block text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Browse Services</p>
            <h2 className="font-display text-lg md:text-3xl font-extrabold text-ink-900 md:mt-1.5">Popular Services</h2>
          </div>
          <Link to="/search" className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-brand-700 hover:text-brand-800">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 md:h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4">
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
        <div className="grid grid-cols-4 gap-2 md:gap-5">
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
        <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {banners.map((b) => (
              <Link
                key={b.id}
                to={b.redirectTo || '/search'}
                className="shrink-0 w-80 h-44 rounded-3xl overflow-hidden shadow-card group relative snap-start"
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

      {/* ===== TOP WORKERS ===== */}
      <section className="hidden md:block py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-9">
            <div>
              <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Top Rated</p>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">Verified Professionals</h2>
            </div>
            <Link to="/workers/nearby" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 group">
              See all workers <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} lines={2} />)
              : workers.map((w) => <WorkerCardPlaceholder key={w.id} worker={w} />)}
            {!loading && workers.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-10">Workers coming soon.</p>
            )}
          </div>
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

      {/* ===== HOW IT WORKS (desktop only) ===== */}
      <section className="hidden md:block py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Simple Process</p>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">How it Works</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">From booking to completion — get your work done in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: <Search size={22} />, title: 'Search & Browse', desc: 'Find verified workers near you by category, rating or AI.' },
            { icon: <PhoneCall size={22} />, title: 'Book Instantly', desc: 'Choose a time, describe your job and confirm your booking.' },
            { icon: <Wrench size={22} />, title: 'Job Gets Done', desc: 'Professional arrives on time and completes the work.' },
            { icon: <Wallet size={22} />, title: 'Pay & Review', desc: 'Pay securely and rate your experience.' },
          ].map((s, i) => (
            <div key={i} className="relative card-premium p-7">
              <div className="absolute -top-3 left-6 w-7 h-7 rounded-full bg-gold-400 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <div className="w-14 h-14 rounded-2xl gradient-brand text-white flex items-center justify-center mb-4 shadow-glow">
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA (desktop only) ===== */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        <div className="relative overflow-hidden gradient-brand rounded-[2rem] px-6 sm:px-10 py-10 sm:py-16 md:py-24 text-white text-center">
          <div className="absolute inset-0 bg-dots opacity-25" />
          <div className="absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-6">
              <Sparkles size={28} className="text-gold-400" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold">Ready to get your work done?</h2>
            <p className="mt-4 text-emerald-50/80 max-w-xl mx-auto text-lg">
              Join thousands of happy customers. Book a verified professional today — or start earning as a worker.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link to="/workers/nearby" className="btn-gold px-8 py-4 rounded-2xl font-bold">
                Hire a Professional
              </Link>
              <Link to="/auth/register" className="px-8 py-4 rounded-2xl glass font-semibold hover:bg-white/15 transition-colors">
                Become a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkerCardPlaceholder({ worker }) {
  const name = worker?.user?.fullName || 'Worker';
  const photo = worker?.user?.profilePhoto;
  return (
    <Link to={`/workers/${worker.id}`} className="group card-premium overflow-hidden flex flex-col animate-fade-in">
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 gradient-brand-soft" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white shadow-lg shrink-0">
            {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold">{name.charAt(0)}</div>}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-white truncate drop-shadow">{name}</h3>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-800">{worker.workerServices?.[0]?.service?.nameEn || 'Service'}</p>
        <p className="text-xs text-gray-400 mt-1">{worker.completedJobs || 0} jobs done</p>
      </div>
    </Link>
  );
}
