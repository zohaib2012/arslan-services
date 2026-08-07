import { ShieldOff, Lock } from 'lucide-react';

export default function BlockedWorkers() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blocked Workers</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <Lock className="text-gray-400" size={26} />
        </div>
        <h3 className="font-semibold text-gray-700">Blocked worker management is coming soon</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
          This feature will be available in the app soon. You can always report issues by raising a dispute for a booking.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 text-brand-700 rounded-xl text-sm font-semibold">
          <ShieldOff size={15} /> Disputes keep you protected
        </div>
      </div>
    </div>
  );
}
