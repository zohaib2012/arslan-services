import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import { PageHeader, Modal } from '../../components';

export default function BannersList() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', redirectTo: '', sortOrder: 0, startDate: '', endDate: '', targetAudience: ['CUSTOMER'], isActive: true });

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try { const res = await api.get('/banners'); setBanners(res.data.banners || res.data); } catch { toast.error('Failed to load'); }
  };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/banners/${editing.id}`, form);
      else await api.post('/banners', form);
      setShowModal(false); setEditing(null); setForm({ title: '', imageUrl: '', redirectTo: '', sortOrder: 0, startDate: '', endDate: '', targetAudience: ['CUSTOMER'], isActive: true }); loadBanners(); toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleToggle = async (id) => {
    const banner = banners.find(b => b.id === id);
    try { await api.put(`/banners/${id}`, { isActive: !banner.isActive }); loadBanners(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); loadBanners(); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const handleEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title, imageUrl: b.imageUrl || '', redirectTo: b.redirectTo || '',
      sortOrder: b.sortOrder || 0, startDate: b.startDate || '', endDate: b.endDate || '',
      targetAudience: b.targetAudience || ['CUSTOMER'], isActive: b.isActive,
    });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Banners"
        subtitle="Manage promotional banners"
      >
        <button
          onClick={() => { setEditing(null); setForm({ title: '', imageUrl: '', redirectTo: '', sortOrder: 0, startDate: '', endDate: '', targetAudience: ['CUSTOMER'], isActive: true }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm font-medium"
        >
          <Plus size={18} /> Add Banner
        </button>
      </PageHeader>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <ImageIcon size={48} className="text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No banners yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group ${!b.isActive ? 'opacity-60' : ''}`}>
              <div className="relative h-44 bg-gray-100">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <ImageIcon size={36} />
                  </div>
                )}
                <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white ${b.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {b.sortOrder !== undefined && (
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    #{b.sortOrder}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{b.title || 'Untitled'}</h4>
                {b.redirectTo && (
                  <p className="text-xs text-blue-500 truncate mb-3">{b.redirectTo}</p>
                )}
                {(b.startDate || b.endDate) && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    {b.startDate && <span>From: {new Date(b.startDate).toLocaleDateString()}</span>}
                    {b.endDate && <span>To: {new Date(b.endDate).toLocaleDateString()}</span>}
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button onClick={() => handleEdit(b)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleToggle(b.id)} className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
                    b.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}>
                    {b.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Banner' : 'Add Banner'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input placeholder="Banner title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input placeholder="https://example.com/banner.jpg" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-full h-36 object-cover rounded-xl mt-2 border border-gray-200 shadow-sm" onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL (optional)</label>
            <input placeholder="https://example.com/offer" value={form.redirectTo} onChange={e => setForm({...form, redirectTo: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" placeholder="0" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: Number(e.target.value)})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
            </div>
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
