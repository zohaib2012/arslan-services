import { Link } from 'react-router-dom';
import { Star, MapPin, Wrench, Phone } from 'lucide-react';

export function formatRating(v) {
  return v ? Number(v).toFixed(1) : '0.0';
}

export function workerServiceNames(worker) {
  if (!worker?.workerServices?.length) return [];
  return worker.workerServices.map((ws) => ws.service?.nameEn || ws.service?.nameUr).filter(Boolean);
}

export default function WorkerCard({ worker, showDistance, distanceKm }) {
  const name = worker?.user?.fullName || worker?.fullName || 'Worker';
  const photo = worker?.user?.profilePhoto || worker?.profilePhoto || null;
  const services = workerServiceNames(worker).slice(0, 3);
  const areas = worker?.serviceAreas || [];

  return (
    <Link
      to={`/workers/${worker.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
    >
      <div className="h-32 bg-gradient-to-br from-brand-600 to-brand-800 relative flex items-center justify-center">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-white text-2xl font-bold backdrop-blur">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {worker?.isOnline && (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-white bg-emerald-500 rounded-full shadow">
              Online
            </span>
          )}
          {worker?.verificationStatus === 'VERIFIED' && (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-white rounded-full shadow">
              ✅ Verified
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="text-amber-400 fill-amber-400" size={13} />
              <span className="text-xs font-medium text-gray-600">{formatRating(worker?.avgRating)}</span>
              <span className="text-xs text-gray-400">({worker?.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {services.map((s) => (
              <span key={s} className="px-2 py-0.5 text-[10px] font-medium text-brand-700 bg-brand-50 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-1 text-xs text-gray-500 flex-1">
          <div className="flex items-center gap-1.5">
            <Wrench size={12} className="text-gray-400" />
            <span>{worker?.completedJobs || 0} jobs done</span>
            <span className="text-gray-300 mx-1">•</span>
            <span>{worker?.experienceYears || 0} yrs exp</span>
          </div>
          {showDistance && distanceKm != null && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-gray-400" />
              <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`} away</span>
            </div>
          )}
          {areas.length > 0 && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={12} className="text-gray-400" />
              <span className="truncate">{areas.map((a) => a.city || a.area).filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
          <a
            href={`tel:${worker?.user?.phone || worker?.phone || ''}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors"
          >
            <Phone size={13} /> Call
          </a>
          <span className="flex-1 text-center py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition-colors">
            View Profile
          </span>
        </div>
      </div>
    </Link>
  );
}
