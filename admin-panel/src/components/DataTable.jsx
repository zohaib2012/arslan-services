import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  loading,
  search,
  onSearchChange,
  onSearch,
  page,
  totalPages,
  onPageChange,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      {(search !== undefined || onSearchChange) && (
        <div className="p-5 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                placeholder="Search..."
                value={search}
                onChange={e => { onSearchChange(e.target.value); if (onSearch) onPageChange(1); }}
                onKeyDown={e => e.key === 'Enter' && onSearch?.()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
              />
            </div>
            {onSearch && (
              <button onClick={onSearch} className="btn-primary px-5 py-2.5 text-white rounded-xl text-sm font-semibold">
                Search
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
          <p className="text-sm text-gray-400">Loading data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          {EmptyIcon && <EmptyIcon size={48} className="text-gray-300 mb-3" />}
          <p className="text-sm text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-50/70 border-b border-brand-100">
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-brand-50/30 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-5 py-4 text-sm text-ink-600">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-brand-50/30">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? 'gradient-brand text-white shadow-glow'
                    : 'border border-gray-200 hover:bg-white text-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
