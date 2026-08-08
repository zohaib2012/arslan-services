export function CardSkeleton({ className = '', lines = 3 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-40 bg-gray-200 rounded-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded-lg" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5, rows = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-5 py-4 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`h-4 bg-gray-100 rounded-lg ${c === 0 ? 'flex-1' : 'w-24'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded-lg w-20" />
          <div className="h-3 bg-gray-100 rounded-lg w-32" />
        </div>
      ))}
    </div>
  );
}

export function ListItemSkeleton({ count = 4 }) {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', ...props }) {
  switch (type) {
    case 'card': return <CardSkeleton {...props} />;
    case 'table': return <TableRowSkeleton {...props} />;
    case 'stat': return <StatSkeleton {...props} />;
    case 'list': return <ListItemSkeleton {...props} />;
    default: return <CardSkeleton {...props} />;
  }
}
