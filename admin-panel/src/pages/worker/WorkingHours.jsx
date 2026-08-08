import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Clock, Loader2 } from 'lucide-react';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkingHours() {
  const navigate = useNavigate();
  const [hours, setHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/workers/me');
        const json = res.data?.workingHoursJson || {};
        const normalized = {};
        days.forEach((d) => {
          const existing = json[d] || {};
          normalized[d] = {
            enabled: !!existing.enabled,
            open: existing.open || '09:00',
            close: existing.close || '18:00',
          };
        });
        setHours(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (day, field, value) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = days.map((d) => ({
        day: d,
        enabled: hours[d].enabled,
        startTime: hours[d].open,
        endTime: hours[d].close,
      }));
      await api.put('/workers/me/hours', { workingHours: payload });
      toast.success('Working hours saved.');
      navigate('/worker/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save hours.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
        <Clock size={22} className="text-brand-600" /> Working Hours
      </h1>
      <p className="text-sm text-gray-500 mb-6">Set your weekly availability.</p>

      <div className="card-premium p-5 space-y-3 mb-6">
        {days.map((day) => (
          <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-gray-50">
            <label className="flex items-center gap-2 sm:w-28 shrink-0">
              <input
                type="checkbox"
                checked={hours[day]?.enabled}
                onChange={(e) => update(day, 'enabled', e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
            </label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={hours[day]?.open || '09:00'}
                disabled={!hours[day]?.enabled}
                onChange={(e) => update(day, 'open', e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="time"
                value={hours[day]?.close || '18:00'}
                disabled={!hours[day]?.enabled}
                onChange={(e) => update(day, 'close', e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-4 rounded-2xl btn-primary font-bold disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Working Hours'}
      </button>
    </div>
  );
}
