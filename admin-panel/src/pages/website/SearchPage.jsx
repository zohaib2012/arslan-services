import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { getStoredLocation, calculateDistance } from '../../lib/location';
import { workerPriceRange } from '../../components/WorkerCard';
import {
  Search, Wrench, Loader2, SlidersHorizontal, ChevronLeft, MapPin,
  Sparkles, ChevronDown,
} from 'lucide-react';

const FILTERS = [
  { key: 'best', label: 'Best Match' },
  { key: 'rated', label: 'Top Rated' },
  { key: 'nearest', label: 'Nearest' },
  { key: 'price', label: 'Price' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialService = searchParams.get('service') || '';
  const userLocation = useMemo(() => getStoredLocation(), []);

  const [q, setQ] = useState(initialQ);
  const [input, setInput] = useState(initialQ);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [minRating, setMinRating] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('best');

  const categoryId = initialCategory;
  const serviceId = initialService;

  useEffect(() => {
    (async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);
        if (categoryId) {
          const cat = (catRes.data || []).find((c) => c.id === categoryId);
          if (cat) setServices(cat.services || []);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [categoryId]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (q) params.search = q;
      if (serviceId) params.serviceId = serviceId;
      else if (categoryId) params.categoryId = categoryId;
      if (minRating) params.rating = minRating;
      if (city) params.city = city;
      if (activeFilter === 'rated') params.sort = 'rating';
      if (activeFilter === 'nearest') params.sort = 'distance';
      if (activeFilter === 'price') params.sort = 'price';
      const res = await api.get('/workers', { params });
      const data = res.data;
      let list = data.workers || [];

      // Sort by stored customer location when nearest filter selected
      if (activeFilter === 'nearest' && userLocation) {
        list = list.map((w) => {
          const area = w.serviceAreas?.find((a) => a.latitude != null && a.longitude != null);
          const dist = area
            ? calculateDistance(userLocation.lat, userLocation.lng, Number(area.latitude), Number(area.longitude))
            : Infinity;
          return { ...w, distanceKm: dist };
        }).sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
      }

      setWorkers(list);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [q, categoryId, serviceId, minRating, city, page, activeFilter, userLocation]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(input.trim());
    setSearchParams((p) => {
      const next = new URLSearchParams(p);
      if (input.trim()) next.set('q', input.trim());
      else next.delete('q');
      return next;
    });
  };

  const selectService = (sid) => {
    setPage(1);
    if (sid === serviceId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({ category: categoryId, service: sid });
    }
  };

  const selectCategory = (cid) => {
    setPage(1);
    if (cid === categoryId) setSearchParams({});
    else setSearchParams({ category: cid });
  };

  const title = q || (services.find((s) => s.id === serviceId)?.nameEn) || (categories.find((c) => c.id === categoryId)?.nameEn) || 'Services';

  return (
    <div className="animate-fade-in pb-24 md:pb-8">
      {/* Mobile header */}
      <div className="md:hidden sticky top-16 z-40 bg-[#F6F9F7] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="font-display font-bold text-ink-900">{title} Near You</h1>
            <button className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> Karachi, Pakistan <ChevronDown size={12} />
            </button>
          </div>
          <button className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <SlidersHorizontal size={22} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setPage(1); setActiveFilter(f.key); }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold snap-start transition-colors ${
                activeFilter === f.key
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-0 md:max-w-7xl md:mx-auto">
        {/* Desktop header */}
        <div className="hidden md:block mb-8">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Find Professionals</p>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1 mb-5">Search Services & Workers</h1>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search by worker, service or area..."
                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-card text-sm"
              />
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto px-7 py-4 text-white font-semibold rounded-2xl inline-flex items-center justify-center gap-2">
              <Search size={16} /> Search
            </button>
          </form>
        </div>

        {/* Mobile search input */}
        <form onSubmit={handleSubmit} className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
        </form>

        {/* Category filter chips desktop */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-3 mb-4">
          <button
            onClick={() => selectCategory('')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              !categoryId ? 'gradient-brand text-white border-transparent shadow-glow' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                categoryId === cat.id ? 'gradient-brand text-white border-transparent shadow-glow' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              {cat.nameEn}
            </button>
          ))}
        </div>

        {/* Service filter chips desktop */}
        {categoryId && services.length > 0 && (
          <div className="hidden md:flex gap-2 overflow-x-auto pb-3 mb-4">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => selectService(svc.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  serviceId === svc.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><Wrench size={13} /> {svc.nameEn}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filters toggle desktop */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-brand-700 mb-4"
        >
          <SlidersHorizontal size={15} /> {showFilters ? 'Hide' : 'Show'} filters
        </button>
        {showFilters && (
          <div className="hidden md:flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-card">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">City / Area</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore"
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
                <option value="3">3.0+</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setPage(1); runSearch(); }}
                className="px-5 py-2.5 gradient-brand text-white text-sm font-bold rounded-xl hover:brightness-105 transition-all shadow-glow"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Mobile map placeholder */}
        <div className="md:hidden rounded-3xl overflow-hidden bg-brand-50 h-56 mb-4 relative border border-gray-100">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #D0EFDF 0%, transparent 50%), radial-gradient(circle at 70% 60%, #A5DFC2 0%, transparent 45%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-700 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Map view</span>
          </div>
          {/* Price markers */}
          {workers.slice(0, 5).map((w, i) => {
            const top = [18, 55, 30, 70, 45][i % 5];
            const left = [15, 45, 75, 25, 65][i % 5];
            const range = workerPriceRange(w);
            const price = range?.min || [800, 750, 900, 650, 700][i % 5];
            return (
              <Link
                key={w.id}
                to={`/workers/${w.id}`}
                className="absolute flex flex-col items-center"
                style={{ top: `${top}%`, left: `${left}%` }}
              >
                <span className="px-2 py-1 rounded-lg bg-white text-brand-700 text-[10px] font-bold shadow-md">Rs. {price}</span>
                <span className="w-3 h-3 rounded-full bg-brand-600 ring-2 ring-white mt-0.5" />
              </Link>
            );
          })}
          <button className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-brand-600">
            <MapPin size={18} />
          </button>
        </div>

        {/* Best value card */}
        <div className="md:hidden rounded-2xl bg-white border border-gray-100 p-4 mb-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="font-display font-bold text-ink-900">Best Value for You</p>
            <p className="text-xs text-gray-500 mt-0.5">We found {total} {title.toLowerCase()} services near you. Showing best rate options.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Sparkles size={20} />
          </div>
        </div>

        {/* Desktop results count */}
        <div className="hidden md:flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {total} {total === 1 ? 'professional' : 'professionals'} found
          </h2>
          {q && (
            <p className="text-sm text-gray-500">
              for "<span className="font-semibold text-gray-700">{q}</span>"
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Search className="text-brand-600" size={26} />
            </div>
            <h3 className="font-display font-bold text-gray-700">No workers found</h3>
            <p className="text-sm text-gray-400 mt-1">Try a different search term or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {workers.map((w, idx) => (
              <WorkerCard
                key={w.id}
                worker={w}
                showDistance
                distanceKm={w.distanceKm}
                tag={['BEST MATCH', 'TOP RATED', 'FAST SERVICE', 'BUDGET FRIENDLY'][idx % 4]}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-bold text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        <button className="md:hidden w-full mt-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-gray-700 flex items-center justify-center gap-1">
          View {Math.max(0, total - workers.length)} More Results <ChevronDown size={16} />
        </button>
      </div>

      {loading && <Loader2 className="hidden" />}
    </div>
  );
}
