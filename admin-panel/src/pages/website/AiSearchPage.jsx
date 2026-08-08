import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import { Sparkles, Send, Loader2, MessageSquare, Wand2, MapPin, AlertTriangle, Wrench, ChevronRight } from 'lucide-react';

const examples = [
  'I need a plumber to fix a leaking tap in Gulberg',
  'Find an electrician near DHA Lahore',
  'AC technician for servicing before summer',
  'Painter to repaint my living room this weekend',
];

export default function AiSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setWorkers([]);
    setParsed(null);
    try {
      const res = await api.post('/ai/search', { query: query.trim() });
      const data = res.data;
      setParsed(data);
      setSearchedQuery(query.trim());

      const searchTerm = [data.service, query.trim()].filter(Boolean).join(' ');
      const workerRes = await api.get('/workers/search', { params: { q: searchTerm } });
      setWorkers(workerRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'AI search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand text-white mb-4 shadow-glow">
          <Sparkles size={24} />
        </div>
        <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Powered by AI</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900 mt-1">AI Service Assistant</h1>
        <p className="text-gray-500 mt-2">Describe what you need — our AI understands it and finds the perfect match.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I need an AC technician to service my split AC..."
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary inline-flex items-center gap-2 px-6 py-4 text-white font-bold rounded-2xl disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          Search
        </button>
      </form>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setQuery(ex)}
            className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-500 shadow-card hover:border-brand-300 hover:text-brand-700 hover:shadow-card-hover transition-all"
          >
            <span className="inline-flex items-center gap-1.5"><Wand2 size={13} className="text-brand-500" /> {ex}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {parsed && !loading && (
        <div className="mt-8">
          <div className="mb-6 p-5 rounded-2xl gradient-brand-soft border border-brand-100 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-brand-600" />
              <p className="text-sm font-bold text-brand-800">AI Understanding</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {parsed.service && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-200 text-xs font-semibold text-brand-700">
                  <Wrench size={12} /> {parsed.service}
                </span>
              )}
              {parsed.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-200 text-xs font-semibold text-brand-700">
                  <MapPin size={12} /> {parsed.location}
                </span>
              )}
              {parsed.urgency && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-xs font-semibold text-amber-700">
                  <AlertTriangle size={12} /> {parsed.urgency}
                </span>
              )}
            </div>
          </div>

          <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
            Matched Professionals
            <span className="text-sm font-medium text-gray-400">for "{searchedQuery}"</span>
          </h2>
          {workers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {workers.map((w) => (
                <WorkerCard key={w.id} worker={w} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-card">
              <p className="text-gray-400 text-sm">
                No exact matches found.{' '}
                <button onClick={() => navigate('/search')} className="inline-flex items-center gap-0.5 text-brand-700 font-medium hover:underline">
                  Browse all workers <ChevronRight size={13} />
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
