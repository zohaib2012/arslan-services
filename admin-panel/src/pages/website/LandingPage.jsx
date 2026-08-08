import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard, { formatRating } from '../../components/WorkerCard';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { MapPin, Star, ArrowRight, Sparkles, Shield, Clock, Search, Wrench, Zap, PhoneCall, Wallet, Home, BadgeCheck, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="animate-fade-in">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-emerald-50 mb-6 animate-slide-up">
                <BadgeCheck size={14} className="text-gold-400" />
                Pakistan's Trusted Home Services Marketplace
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white">
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

        {/* bottom curve */}
        <svg className="absolute bottom-0 left-0 w-full text-[#F6F9F7]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0 60h1440V20c-120 20-260 30-400 25S800 10 700 10 400 20 300 15 100 0 0 20v40z" />
        </svg>
      </section>

      {/* ===== BANNERS ===== */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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

      {/* ===== CATEGORIES ===== */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-9">
          <div>
            <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Browse Services</p>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">Popular Categories</h2>
          </div>
          <Link to="/search" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 group">
            View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-40 h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x sm:grid sm:grid-cols-3 md:grid-cols-4 sm:overflow-visible">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="shrink-0 w-40 sm:w-auto group card-premium p-5 flex flex-col items-start snap-start"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:gradient-brand group-hover:shadow-glow transition-all duration-300">
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt={cat.nameEn} className="w-8 h-8 object-contain" />
                  ) : (
                    <Home size={24} className="text-brand-600 group-hover:text-white transition-colors" />
                  )}
                </div>
                <h3 className="font-display font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{cat.nameEn}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.services?.length || 0} services</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== TOP WORKERS ===== */}
      <section className="py-16 bg-white border-y border-gray-100">
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
              ? Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} lines={2} />
                ))
              : workers.map((w) => <WorkerCard key={w.id} worker={w} />)}
            {!loading && workers.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-10">Workers coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Simple Process</p>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1.5">How it Works</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">From booking to completion — get your work done in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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

      {/* ===== CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden gradient-brand rounded-[2rem] p-10 md:p-16 text-white text-center">
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
