import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import { Heart, Loader2 } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setFavorites((res.data || []).map((f) => f.worker).filter(Boolean));
    } catch (err) {
      console.error(err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <BackButton to="/dashboard" className="mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorite Workers</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Heart className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-gray-700">No favorites yet</h3>
          <p className="text-sm text-gray-400 mt-1">Tap the heart on a worker profile to save them here.</p>
          <Link to="/workers/nearby" className="inline-block mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Find Workers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {favorites.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      )}
    </div>
  );
}
