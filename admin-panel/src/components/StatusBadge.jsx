const variants = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  SUSPENDED: 'bg-gray-100 text-gray-600 border-gray-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
  DISPUTED: 'bg-orange-50 text-orange-700 border-orange-200',
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
  RESOLVED_CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOLVED_WORKER: 'bg-blue-50 text-blue-700 border-blue-200',
  DISMISSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const s = (status || '').toUpperCase();
  const variant = variants[s] || 'bg-gray-50 text-gray-600 border-gray-200';
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variant} ${sizeClasses}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
}
