import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader, Modal } from '../../components';

const allPermissions = [
  'manage_users', 'manage_workers', 'manage_bookings', 'manage_services',
  'manage_disputes', 'manage_banners', 'send_notifications', 'view_reports',
  'manage_roles', 'view_analytics',
];

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', permissions: {} });

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try { const res = await api.get('/roles'); setRoles(res.data.roles || res.data); } catch { setRoles([]); }
  };

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [perm]: !prev.permissions[perm] },
    }));
  };

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/roles/${editing.id}`, form);
      else await api.post('/roles', form);
      setShowModal(false); setEditing(null); setForm({ name: '', permissions: {} }); loadRoles(); toast.success('Saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try { await api.delete(`/roles/${id}`); loadRoles(); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const getEnabledPermissions = (perms) => {
    if (!perms) return [];
    if (typeof perms === 'object') return Object.entries(perms).filter(([, v]) => v).map(([k]) => k);
    if (Array.isArray(perms)) return perms;
    return [];
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Roles & Permissions"
        subtitle={`${roles.length} roles configured`}
      >
        <button
          onClick={() => { setEditing(null); setForm({ name: '', permissions: {} }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm font-medium"
        >
          <Plus size={18} /> Add Role
        </button>
      </PageHeader>

      {roles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <Shield size={48} className="text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No roles defined yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(r => {
            const enabledPerms = getEnabledPermissions(r.permissions);
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50">
                    <Shield className="text-brand-600" size={22} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{r.name}</h3>
                </div>

                {enabledPerms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {enabledPerms.map(perm => (
                      <span key={perm} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                        <CheckCircle2 size={10} />
                        {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-5 italic">No permissions assigned</p>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => { setEditing(r); setForm({ name: r.name, permissions: typeof r.permissions === 'object' ? { ...r.permissions } : {} }); setShowModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Role' : 'Add Role'} size="lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name</label>
            <input placeholder="e.g. Manager" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {allPermissions.map(perm => (
                <label key={perm} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.permissions[perm] ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!form.permissions[perm]}
                    onChange={() => togglePermission(perm)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </label>
              ))}
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
