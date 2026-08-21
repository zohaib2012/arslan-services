import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Wrench, Loader2, Check, Plus, X } from 'lucide-react';

export default function ServicesSelection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [prices, setPrices] = useState({});
  const [customServices, setCustomServices] = useState([]);
  const [customInput, setCustomInput] = useState('');
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
          const ws = profRes.value.data?.workerServices || [];
          setSelected(ws.filter((w) => w.serviceId).map((w) => w.serviceId));
          setCustomServices(ws.filter((w) => w.customServiceName).map((w) => w.customServiceName));
          const priceMap = {};
          ws.forEach((w) => {
            if (w.serviceId) {
              priceMap[w.serviceId] = {
                min: w.priceMin != null ? Number(w.priceMin) : '',
                max: w.priceMax != null ? Number(w.priceMax) : '',
              };
            }
          });
          setPrices(priceMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (serviceId) => {
    setSelected((prev) => {
      const isOn = prev.includes(serviceId);
      if (isOn) {
        setPrices((p) => {
          const next = { ...p };
          delete next[serviceId];
          return next;
        });
        return prev.filter((s) => s !== serviceId);
      }
      setPrices((p) => ({ ...p, [serviceId]: { min: '', max: '' } }));
      return [...prev, serviceId];
    });
  };

  const setPrice = (serviceId, field, value) => {
    setPrices((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] || {}), [field]: value },
    }));
  };

  const addCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    if (customServices.some((s) => s.toLowerCase() === name.toLowerCase())) {
      toast.error('Service already added.');
      return;
    }
    setCustomServices((prev) => [...prev, name]);
    setCustomInput('');
  };

  const removeCustom = (name) => {
    setCustomServices((prev) => prev.filter((s) => s !== name));
  };

  const serviceName = (id) => {
    for (const cat of categories) {
      const found = (cat.services || []).find((s) => s.id === id);
      if (found) return found.nameEn;
    }
    return '';
  };

  const save = async () => {
    setSaving(true);
    try {
      const cleanPrices = {};
      Object.entries(prices).forEach(([id, p]) => {
        const min = p.min === '' ? null : Number(p.min);
        const max = p.max === '' ? null : Number(p.max);
        if ((min != null && !Number.isNaN(min)) || (max != null && !Number.isNaN(max))) {
          cleanPrices[id] = { min, max };
        }
      });
      await api.put('/workers/me/services', { serviceIds: selected, customServices, prices: cleanPrices });
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

  const totalCount = selected.length + customServices.length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
          <Wrench size={22} className="text-brand-600" /> Your Services
        </h1>
        <span className="text-sm text-gray-500">{totalCount} selected</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">Select the services you offer and set your visit charge (price range) for each.</p>

      {/* Add custom service */}
      <div className="card-premium p-5 mb-6 border-2 border-dashed border-brand-200 bg-brand-50/40">
        <h2 className="font-semibold text-ink-900 mb-1">Add Custom Service</h2>
        <p className="text-xs text-gray-500 mb-3">Can't find your service? Add it here.</p>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="e.g. CCTV Installation"
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {customServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customServices.map((name) => (
              <span key={name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-semibold">
                {name}
                <button type="button" onClick={() => removeCustom(name)} className="hover:text-red-200">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selected services price editor */}
      {selected.length > 0 && (
        <div className="card-premium p-5 mb-6">
          <h2 className="font-semibold text-ink-900 mb-1">Set Prices</h2>
          <p className="text-xs text-gray-500 mb-4">Set your visit charge range (min – max) for each selected service. This will be shown to customers on your public profile.</p>
          <div className="space-y-3">
            {selected.map((id) => (
              <div key={id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{serviceName(id) || id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min Rs."
                    value={prices[id]?.min ?? ''}
                    onChange={(e) => setPrice(id, 'min', e.target.value)}
                    className="w-28 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max Rs."
                    value={prices[id]?.max ?? ''}
                    onChange={(e) => setPrice(id, 'max', e.target.value)}
                    className="w-28 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {saving ? 'Saving...' : `Save ${totalCount} Service${totalCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
