import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatRating } from '../../components/WorkerCard';
import { MapPin, Star, ArrowRight, Sparkles, Shield, Clock, BadgeCheck, Search, Wrench, Home, Zap, PhoneCall, Wallet, Map } from 'lucide-react';

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
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_80%,white,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-emerald-100 mb-6">
                <BadgeCheck size={14} />
                Trusted home services marketplace in Pakistan
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Expert Professionals at your <span className="text-emerald-300">Doorstep</span>
              </h1>
              <p className="mt-5 text-lg text-emerald-100/70 leading-relaxed max-w-lg">
                Find verified, top-rated workers for every job — plumbing, electrical, cleaning,
                repairs and more. Book in seconds with transparent pricing.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/workers/nearby"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-400 text-brand-900 font-bold rounded-2xl hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  <Search size={18} /> Find a Worker
                </Link>
                <Link
                  to="/ai-search"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-semibold text-white transition-colors"
                >
                  <Sparkles size={18} /> Ask AI Assistant
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-emerald-100/60">
                <div className="flex items-center gap-2"><Shield size={16} className="text-emerald-300" /> Verified pros</div>
                <div className="flex items-center gap-2"><Star size={16} className="text-amber-300" /> 4.5+ avg rating</div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-emerald-300" /> 24/7 booking</div>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 flex items-center justify-center mb-3">
                    <Wrench className="text-emerald-300" size={20} />
                  </div>
                  <p className="text-2xl font-bold">{workers.length || '100'}+</p>
                  <p className="text-xs text-emerald-100/50 mt-1">Verified Workers</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/20 flex items-center justify-center mb-3">
                    <Zap className="text-amber-300" size={20} />
                  </div>
                  <p className="text-2xl font-bold">{categories.length || '20'}+</p>
                  <p className="text-xs text-emerald-100/50 mt-1">Service Categories</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
                    <MapPin className="text-emerald-300" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Coverage</p>
                    <p className="text-xs text-emerald-100/50">Lahore & surrounding areas</p>
                  </div>
                </div>
                <div className="relative h-24 rounded-2xl overflow-hidden border border-white/10">
                  <Map className="absolute inset-0 w-full h-full text-emerald-300/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link to="/workers/nearby" className="text-xs font-semibold text-emerald-200 hover:text-white underline underline-offset-4">Explore on map →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNERS */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {banners.map((b) => (
              <Link
                key={b.id}
                to={b.redirectTo || '/search'}
                className="shrink-0 w-72 h-40 rounded-2xl overflow-hidden shadow-lg relative group"
              >
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Browse Services</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Popular Categories</h2>
          </div>
          <Link to="/search" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt={cat.nameEn} className="w-12 h-12 object-contain mb-3" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                    <Home className="text-brand-600" size={22} />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{cat.nameEn}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.services?.length || 0} services</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TOP WORKERS */}
      <section className="py-16 bg-gradient-to-b from-white to-brand-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Top Rated</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Verified Professionals</h2>
            </div>
            <Link to="/workers/nearby" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              See all workers <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                ))
              : workers.map((w) => <WorkerTeaser key={w.id} worker={w} />)}
            {!loading && workers.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-10">Workers coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Simple Process</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">How it Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <Search size={22} />, title: 'Search & Browse', desc: 'Find verified workers near you by category, rating or AI.' },
            { icon: <PhoneCall size={22} />, title: 'Book Instantly', desc: 'Choose a time, describe your job and confirm your booking.' },
            { icon: <Wrench size={22} />, title: 'Job Gets Done', desc: 'Professional arrives on time and completes the work.' },
            { icon: <Wallet size={22} />, title: 'Pay & Review', desc: 'Pay securely and rate your experience.' },
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-3xl bg-white border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-4 shadow-md shadow-brand-600/20">
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-3xl p-10 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,white,transparent_50%)]" />
          <h2 className="text-2xl md:text-4xl font-extrabold relative">Ready to get your work done?</h2>
          <p className="mt-3 text-emerald-100/70 max-w-xl mx-auto relative">
            Join thousands of happy customers. Book a verified professional today — or start earning as a worker.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link to="/workers/nearby" className="px-8 py-3.5 bg-emerald-400 text-brand-900 font-bold rounded-2xl hover:bg-emerald-300 transition-colors">
              Hire a Professional
            </Link>
            <Link to="/auth/register" className="px-8 py-3.5 bg-white/10 border border-white/20 rounded-2xl font-semibold hover:bg-white/20 transition-colors">
              Become a Worker
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkerTeaser({ worker }) {
  const name = worker?.user?.fullName || 'Worker';
  const photo = worker?.user?.profilePhoto;
  const services = (worker?.workerServices || []).map((ws) => ws.service?.nameEn).filter(Boolean).slice(0, 2);
  return (
    <Link to={`/workers/${worker.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="h-32 bg-gradient-to-br from-brand-600 to-brand-800 relative">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        {worker?.isOnline && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold text-white bg-emerald-500 rounded-full shadow">Online</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star size={12} className="fill-amber-400 text-amber-400" /> {formatRating(worker?.avgRating)}
          </span>
        </div>
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {services.map((s) => (
              <span key={s} className="px-2 py-0.5 text-[10px] font-medium text-brand-700 bg-brand-50 rounded-full">{s}</span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{worker?.completedJobs || 0} jobs done</p>
      </div>
    </Link>
  );
}
