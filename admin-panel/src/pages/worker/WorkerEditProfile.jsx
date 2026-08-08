import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Loader2, Camera, ImagePlus } from 'lucide-react';

const languages = ['ENGLISH', 'URDU', 'PUNJABI', 'SINDHI', 'PASHTO', 'OTHER'];

export default function WorkerEditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [experienceYears, setExperienceYears] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [photo, setPhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [uploading, setUploading] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const photoRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/workers/me');
        setProfile(res.data);
        setExperienceYears(res.data.experienceYears != null ? String(res.data.experienceYears) : '');
        setDescription(res.data.description || '');
        setSelectedLanguages(res.data.languages || []);
        setPhoto(res.data.user?.profilePhoto || '');
        setCoverPhoto(res.data.coverPhoto || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', field === 'profilePhoto' ? 'profile' : 'cover');
      const res = await api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (field === 'profilePhoto') setPhoto(res.data.url);
      else setCoverPhoto(res.data.url);
      toast.success('Photo uploaded. Save changes to update your profile.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading('');
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (experienceYears !== '') payload.experienceYears = Number(experienceYears);
      if (description !== profile?.description) payload.description = description;
      payload.languages = selectedLanguages;
      if (photo && photo !== profile?.user?.profilePhoto) payload.profilePhoto = photo;
      if (coverPhoto !== profile?.coverPhoto) payload.coverPhoto = coverPhoto;
      await api.put('/workers/me', payload);
      toast.success('Profile updated.');
      navigate('/worker/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
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
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Profile Thumbnail (card cover image)</label>
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={uploading === 'coverPhoto'}
            className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-brand-300 transition-colors disabled:opacity-50 group"
          >
            {coverPhoto ? (
              <img src={coverPhoto} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 gradient-brand-soft flex flex-col items-center justify-center">
                <ImagePlus size={26} className="text-brand-600 mb-1.5" />
                <p className="text-sm font-semibold text-brand-700">Add card thumbnail</p>
                <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, WebP · up to 10MB</p>
              </div>
            )}
            {uploading === 'coverPhoto' && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={26} />
              </div>
            )}
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'coverPhoto')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Profile Photo</label>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={uploading === 'profilePhoto'}
            className="flex items-center gap-4 p-4 w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 transition-colors disabled:opacity-50"
          >
            {photo ? (
              <img src={photo} alt="Profile" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 text-2xl font-bold">
                {(profile?.user?.fullName || 'W').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              {uploading === 'profilePhoto' ? (
                <p className="inline-flex items-center gap-2 text-sm text-brand-700 font-medium"><Loader2 className="animate-spin" size={16} /> Uploading...</p>
              ) : (
                <>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Camera size={15} className="text-brand-600" /> Upload photo</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · up to 10MB</p>
                </>
              )}
            </div>
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'profilePhoto')} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Experience (years)</label>
          <input
            type="number"
            min="0"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe your experience and what you specialize in..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Languages</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedLanguages.includes(lang) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
}
