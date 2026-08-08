import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, FolderTree, Layers } from 'lucide-react';
import { PageHeader, Modal } from '../../components';

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nameEn: '', nameUr: '', iconUrl: '' });

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data.categories || res.data); } catch { toast.error('Failed to load'); }
  };

  const handleSave = async () => {
    try {
      const slug = form.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (editing) await api.put(`/categories/${editing.id}`, { ...form, slug });
      else await api.post('/categories', { ...form, slug });
      setShowModal(false); setEditing(null); setForm({ nameEn: '', nameUr: '', iconUrl: '' }); loadCategories(); toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleToggle = async (id) => {
    try { await api.put(`/categories/${id}/toggle`); loadCategories(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try { await api.delete(`/categories/${id}`); loadCategories(); toast.success('Deleted'); } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ nameEn: c.nameEn, nameUr: c.nameUr, iconUrl: c.iconUrl || '' });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} service categories`}
      >
          <button
          onClick={() => { setEditing(null); setForm({ nameEn: '', nameUr: '', iconUrl: '' }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={18} /> Add Category
        </button>
      </PageHeader>

      {categories.length === 0 ? (
        <div className="card-premium p-16 flex flex-col items-center justify-center">
          <FolderTree size={48} className="text-gray-200 mb-3" />
          <p className="text-sm text-ink-600">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map(c => (
            <div key={c.id} className={`card-premium p-5 group ${!c.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {c.iconUrl ? (
                    <img src={c.iconUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl gradient-brand-soft flex items-center justify-center text-brand-600 font-bold text-lg shadow-sm">
                      {(c.nameEn || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-display font-bold text-ink-900">{c.nameEn}</p>
                    <p className="text-xs text-ink-600">{c.nameUr}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-ink-600/40" />
                <span className="text-xs text-ink-600">{c._count?.services || 0} services</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => handleEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleToggle(c.id)} className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
                  c.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}>
                  {c.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">English Name</label>
            <input placeholder="e.g. Plumbing" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Urdu Name</label>
            <input placeholder="e.g. پلمبنگ" value={form.nameUr} onChange={e => setForm({...form, nameUr: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Icon URL</label>
            <input placeholder="https://example.com/icon.png" value={form.iconUrl} onChange={e => setForm({...form, iconUrl: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all" />
            {form.iconUrl && (
              <img src={form.iconUrl} alt="" className="w-16 h-16 rounded-xl object-cover mt-2 border border-gray-100" onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-ink-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-medium">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
