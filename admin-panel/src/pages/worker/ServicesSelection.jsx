import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Wrench, Loader2, Check } from 'lucide-react';

export default function ServicesSelection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, profRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/workers/me'),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
        if (profRes.status === 'fulfilled') {
          setSelected((profRes.value.data?.workerServices || []).map((ws) => ws.serviceId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (serviceId) => {
    setSelected((prev) => (prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/workers/me/services', { serviceIds: selected });
      toast.success('Services updated.');
      navigate('/worker/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save services.');
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
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
          <Wrench size={22} className="text-brand-600" /> Your Services
        </h1>
        <span className="text-sm text-gray-500">{selected.length} selected</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">Select the services you offer. Customers find you by these services.</p>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="card-premium p-5">
            <h2 className="font-semibold text-ink-900 mb-3">{cat.nameEn}</h2>
            {cat.services?.length === 0 ? (
              <p className="text-xs text-gray-400">No services in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.services.map((s) => {
                  const isSel = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        isSel ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
                      }`}
                    >
                      {s.iconUrl ? (
                        <img src={s.iconUrl} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                          <Wrench className="text-brand-600" size={15} />
                        </div>
                      )}
                      <span className="flex-1 text-sm font-medium text-gray-800">{s.nameEn}</span>
                      {isSel && <Check size={16} className="text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full mt-6 py-4 rounded-2xl btn-primary font-bold disabled:opacity-50"
      >
        {saving ? 'Saving...' : `Save ${selected.length} Service${selected.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
