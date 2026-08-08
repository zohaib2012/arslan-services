import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Info, Settings2, Globe, Phone, Mail, Percent, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../../components';

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('adminSettings');
    return stored ? JSON.parse(stored) : {
      platformName: 'Arslan Services',
      supportEmail: '',
      supportPhone: '',
      commissionRate: 0,
      maxBookingRadius: 0,
      autoApproveWorkers: false,
      maintenanceMode: false,
    };
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Platform Settings"
        subtitle="Configure your platform preferences"
      >
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium ${
            saved
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'btn-primary'
          }`}
        >
          <Save size={18} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </PageHeader>

      <div className="max-w-2xl space-y-6">
        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 rounded-xl gradient-brand shadow-glow">
              <Settings2 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-900">General Settings</h3>
              <p className="text-xs text-ink-600">Basic platform configuration</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink-800 mb-1.5">
                <Globe size={16} className="text-ink-600/40" /> Platform Name
              </label>
              <input
                value={settings.platformName}
                onChange={e => setSettings({...settings, platformName: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-800 mb-1.5">
                  <Mail size={16} className="text-ink-600/40" /> Support Email
                </label>
              <input
                value={settings.supportEmail}
                onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
              />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-800 mb-1.5">
                  <Phone size={16} className="text-ink-600/40" /> Support Phone
                </label>
              <input
                value={settings.supportPhone}
                onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
              />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-800 mb-1.5">
                  <Percent size={16} className="text-ink-600/40" /> Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-800 mb-1.5">
                  <MapPin size={16} className="text-ink-600/40" /> Max Booking Radius (km)
                </label>
                <input
                  type="number"
                  value={settings.maxBookingRadius}
                  onChange={e => setSettings({...settings, maxBookingRadius: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl ring-focus outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-lg shadow-amber-500/20">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-900">Operational Settings</h3>
              <p className="text-xs text-ink-600">Worker and maintenance controls</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <UserCheck size={18} className="text-ink-600/40" />
                <div>
                  <p className="text-sm font-medium text-ink-800">Auto-approve new workers</p>
                  <p className="text-xs text-ink-600">Skip manual verification for new registrations</p>
                </div>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${settings.autoApproveWorkers ? 'bg-brand-600' : 'bg-gray-200'}`}>
                <input
                  type="checkbox"
                  checked={settings.autoApproveWorkers}
                  onChange={e => setSettings({...settings, autoApproveWorkers: e.target.checked})}
                  className="sr-only"
                />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.autoApproveWorkers ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-ink-600/40" />
                <div>
                  <p className="text-sm font-medium text-ink-800">Enable maintenance mode</p>
                  <p className="text-xs text-ink-600">Block user access during maintenance</p>
                </div>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only"
                />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 shadow-lg shadow-blue-500/20">
              <Info className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-900">App Information</h3>
              <p className="text-xs text-ink-600">Platform version details</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Platform', value: 'Arslan Services Admin Panel' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Environment', value: 'Production' },
              { label: 'Theme', value: 'Premium Green' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                <span className="text-sm text-ink-600">{item.label}</span>
                <span className="text-sm font-medium text-ink-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
