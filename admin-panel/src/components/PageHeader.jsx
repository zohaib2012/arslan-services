export default function PageHeader({ title, subtitle, label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {label && (
          <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em] mb-1">{label}</p>
        )}
        <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
