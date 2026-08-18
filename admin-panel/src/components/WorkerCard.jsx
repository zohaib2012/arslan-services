import { Link } from 'react-router-dom';
import { Star, MapPin, Wrench, Phone, ShieldCheck, BadgeCheck } from 'lucide-react';

export function formatRating(v) {
  return v ? Number(v).toFixed(1) : '0.0';
}

export function workerServiceNames(worker) {
  if (!worker?.workerServices?.length) return [];
  return worker.workerServices.map((ws) => ws.service?.nameEn || ws.service?.nameUr).filter(Boolean);
}

const CATEGORY_THUMBNAILS = {
  Plumbing: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
  Electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
  'AC Repair': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80',
  Cleaning: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&q=80',
  Painting: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
  Carpentry: 'https://images.unsplash.com/photo-1540821924489-7690c70c4eac?w=600&q=80',
  'Bike Mechanic': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80',
};

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80';

export function workerThumbnail(worker) {
  if (worker?.coverPhoto) return worker.coverPhoto;
  const categoryName = worker?.workerServices?.[0]?.service?.category?.nameEn;
  return CATEGORY_THUMBNAILS[categoryName] || DEFAULT_THUMBNAIL;
}

function WorkerAvatar({ worker, name, className }) {
  const photo = worker?.user?.profilePhoto || worker?.profilePhoto || null;
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${className} object-cover`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${className} flex items-center justify-center font-display font-bold bg-gradient-to-br from-brand-600 to-brand-900 text-white`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function WorkerCard({ worker, showDistance, distanceKm, tag }) {
  const name = worker?.user?.fullName || worker?.fullName || 'Worker';
  const services = workerServiceNames(worker).slice(0, 3);
  const areas = worker?.serviceAreas || [];
  const verified = worker?.verificationStatus === 'VERIFIED';
  const thumbnail = workerThumbnail(worker);
  const minRate = worker?.minRate;
  const maxRate = worker?.maxRate;
  const priceRange = minRate && maxRate ? `Rs. ${Number(minRate).toLocaleString()} - ${Number(maxRate).toLocaleString()}` : 'Rs. 800 - 1,200';

  return (
    <Link
      to={`/workers/${worker.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all animate-fade-in overflow-hidden"
    >
      {/* Mobile horizontal layout */}
      <div className="md:hidden flex gap-3 p-3">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
            <WorkerAvatar worker={worker} name={name} className="w-full h-full" />
          </div>
          {worker?.isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-display font-bold text-sm text-ink-900 truncate">{name}</h3>
              {verified && <BadgeCheck size={14} className="text-brand-600 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-800">{formatRating(worker?.avgRating)}</span>
              <span className="text-[10px] text-gray-400">({worker?.totalReviews || 0} reviews)</span>
              {showDistance && distanceKm != null && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[10px] text-gray-500">{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${Number(distanceKm).toFixed(1)}km`} away</span>
                </>
              )}
            </div>
            <p className="text-xs font-bold text-ink-900 mt-1.5">{priceRange} <span className="text-[10px] font-normal text-gray-400">/ visit</span></p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {tag && (
              <span className="px-2 py-0.5 rounded-md bg-brand-50 text-[9px] font-bold text-brand-700 uppercase tracking-wide">
                {tag}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-700">
              <ShieldCheck size={10} /> Verified
            </span>
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] font-bold text-gray-600">
              {worker?.isOnline ? 'Available Now' : 'Available'}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col justify-end">
          <button
            onClick={(e) => { e.preventDefault(); window.location.href = `/book?worker=${worker.id}`; }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm hover:bg-brand-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Desktop vertical card */}
      <div className="hidden md:flex flex-col">
        <div className="relative h-40 overflow-hidden">
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = DEFAULT_THUMBNAIL; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white shadow-lg shrink-0">
              <WorkerAvatar worker={worker} name={name} className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-white truncate group-hover:text-brand-100 transition-colors drop-shadow">{name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/95">
                  <Star className="text-white fill-white" size={11} />
                  <span className="text-[11px] font-bold text-gray-900">{formatRating(worker?.avgRating)}</span>
                </span>
                <span className="text-[11px] text-white/85">({worker?.totalReviews || 0})</span>
              </div>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {worker?.isOnline && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white bg-emerald-500 rounded-full shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-brand-800 bg-white/95 rounded-full shadow-md">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {services.map((s) => (
                <span key={s} className="px-2.5 py-1 text-[10px] font-semibold text-brand-700 bg-brand-50 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-1.5 text-xs text-gray-500 flex-1">
            <div className="flex items-center gap-1.5">
              <Wrench size={13} className="text-brand-500" />
              <span>{worker?.completedJobs || 0} jobs done</span>
              <span className="text-gray-300 mx-0.5">•</span>
              <span>{worker?.experienceYears || 0} yrs exp</span>
            </div>
            {showDistance && distanceKm != null ? (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-brand-500" />
                <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`} away</span>
              </div>
            ) : areas.length > 0 ? (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin size={13} className="text-brand-500" />
                <span className="truncate">{areas.map((a) => a.city || a.area).filter(Boolean).join(', ')}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <a
              href={`tel:${worker?.user?.phone || worker?.phone || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-colors"
            >
              <Phone size={13} /> Call
            </a>
            <span className="flex-1 text-center py-2.5 rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white text-xs font-bold transition-colors">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
