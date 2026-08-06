import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Wrench } from 'lucide-react';
import { PageHeader, Modal, StatusBadge } from '../../components';

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nameEn: '', nameUr: '', descriptionEn: '', descriptionUr: '', categoryId: '', iconUrl: '' });

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [svcRes, catRes] = await Promise.all([api.get('/services'), api.get('/categories')]);
      setServices(svcRes.data.services || svcRes.data);
      setCategories(catRes.data.categories || catRes.data);
    } catch { toast.error('Failed to load'); }
  };

  const handleSave = async () => {
    try {
      const slug = form.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (editing) await api.put(`/services/${editing.id}`, { ...form, slug });
      else await api.post('/services', { ...form, slug });
      setShowModal(false); setEditing(null); setForm({ nameEn: '', nameUr: '', descriptionEn: '', descriptionUr: '', categoryId: '', iconUrl: '' }); loadData(); toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleToggle = async (id) => {
    try { await api.put(`/services/${id}/toggle`); loadData(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try { await api.delete(`/services/${id}`); loadData(); toast.success('Deleted'); } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      nameEn: s.nameEn, nameUr: s.nameUr, descriptionEn: s.descriptionEn || '',
      descriptionUr: s.descriptionUr || '', categoryId: s.categoryId || '', iconUrl: s.iconUrl || '',
    });
    setShowModal(true);
  };

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.nameEn || 'Unknown';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Services"
        subtitle={`${services.length} available services`}
      >
        <button
          onClick={() => { setEditing(null); setForm({ nameEn: '', nameUr: '', descriptionEn: '', descriptionUr: '', categoryId: '', iconUrl: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm font-medium"
        >
          <Plus size={18} /> Add Service
        </button>
      </PageHeader>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <Wrench size={48} className="text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No services yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group ${!s.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                {s.iconUrl ? (
                  <img src={s.iconUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm shrink-0">
                    {(s.nameEn || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{s.nameEn}</p>
                  <p className="text-xs text-gray-400 truncate">{s.nameUr}</p>
                  {s.categoryId && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {getCategoryName(s.categoryId)}
                    </span>
                  )}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </div>

              {(s.descriptionEn || s.descriptionUr) && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{s.descriptionEn || s.descriptionUr}</p>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => handleEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleToggle(s.id)} className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
                  s.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}>
                  {s.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Service' : 'Add Service'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
              <input placeholder="e.g. Pipe Repair" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urdu Name</label>
              <input placeholder="e.g. پائپ کی مرمت" value={form.nameUr} onChange={e => setForm({...form, nameUr: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English Description</label>
              <textarea placeholder="Describe the service..." value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urdu Description</label>
              <textarea placeholder="خدمت کی تفصیل..." value={form.descriptionUr} onChange={e => setForm({...form, descriptionUr: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm resize-none" rows={3} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm bg-white">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
            <input placeholder="https://example.com/icon.png" value={form.iconUrl} onChange={e => setForm({...form, iconUrl: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            {form.iconUrl && (
              <img src={form.iconUrl} alt="" className="w-16 h-16 rounded-xl object-cover mt-2 border border-gray-100" onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all text-sm font-medium shadow-md shadow-brand-600/20">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
