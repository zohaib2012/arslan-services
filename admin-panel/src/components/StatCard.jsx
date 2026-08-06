export default function StatCard({ icon: Icon, label, value, subtitle, color = 'emerald', trend, trendUp }) {
  const gradients = {
    emerald: 'from-emerald-600 to-emerald-400',
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    orange: 'from-orange-600 to-orange-400',
    red: 'from-red-600 to-red-400',
    teal: 'from-teal-600 to-teal-400',
    green: 'from-green-600 to-green-400',
    amber: 'from-amber-600 to-amber-400',
  };
  const shadows = {
    emerald: 'shadow-emerald-500/20',
    blue: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    orange: 'shadow-orange-500/20',
    red: 'shadow-red-500/20',
    teal: 'shadow-teal-500/20',
    green: 'shadow-green-500/20',
    amber: 'shadow-amber-500/20',
  };
  return (
    <div className={`relative bg-white rounded-2xl p-6 shadow-lg ${shadows[color]} border border-gray-100 hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trendUp ? '↑' : '↓'} {Math.abs(trend)}%</span>
              <span className="text-gray-400">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradients[color]} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}
