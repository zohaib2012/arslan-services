import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Loader2, Plus, X, Camera, Film } from 'lucide-react';

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('IMAGE');
  const [caption, setCaption] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get('/workers/me');
      setItems(res.data?.portfolio || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'portfolio');
      const res = await api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const type = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
      await api.post('/workers/me/portfolio', { mediaUrl: res.data.url, mediaType: type });
      toast.success('Portfolio item added.');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setAdding(false);
    }
  };

  const addFromUrl = async () => {
    if (!mediaUrl.trim()) return toast.error('Enter a media URL.');
    setAdding(true);
    try {
      await api.post('/workers/me/portfolio', {
        mediaUrl: mediaUrl.trim(),
        mediaType,
        caption: caption.trim() || undefined,
      });
      toast.success('Portfolio item added.');
      setMediaUrl('');
      setCaption('');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/workers/me/portfolio/${id}`);
      toast.success('Item removed.');
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item.');
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Camera size={22} className="text-brand-600" /> Portfolio
      </h1>
      <p className="text-sm text-gray-500 mb-6">Showcase your best work to attract customers.</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={adding}
          className="w-full py-10 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center transition-colors disabled:opacity-50"
        >
          {adding ? <Loader2 className="animate-spin text-brand-600 mb-2" size={22} /> : <Plus size={22} className="text-gray-400 mb-2" />}
          <span className="text-sm text-gray-500">Upload an image or video</span>
          <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, MP4 · up to 10MB</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Or paste media URL"
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 sm:col-span-1"
          />
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
          <button onClick={addFromUrl} disabled={adding} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
            Add
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Camera className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-gray-700">No portfolio items yet</h3>
          <p className="text-sm text-gray-400 mt-1">Add photos of your completed work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.id} className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-square">
              {p.mediaType === 'VIDEO' || p.mediaUrl?.endsWith('.mp4') ? (
                <video src={p.mediaUrl} className="w-full h-full object-cover" muted loop />
              ) : (
                <img src={p.mediaUrl} alt={p.caption || 'portfolio'} className="w-full h-full object-cover" />
              )}
              {p.mediaType === 'VIDEO' && (
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                  <Film size={13} className="text-white" />
                </div>
              )}
              {p.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{p.caption}</p>
                </div>
              )}
              <button
                onClick={() => remove(p.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={13} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
