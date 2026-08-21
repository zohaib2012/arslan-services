import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import WorkerCard from '../../components/WorkerCard';
import BackButton from '../../components/BackButton';
import { CardSkeleton } from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { Sparkles, Send, Loader2, MessageSquare, Wand2, MapPin, AlertTriangle, Wrench, ChevronRight, Mic } from 'lucide-react';

const examples = [
  'I need a plumber to fix a leaking tap in Gulberg',
  'Find an electrician near DHA Lahore',
  'AC technician for servicing before summer',
  'Painter to repaint my living room this weekend',
];

export default function AiSearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast?.error('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      doSearch(transcript);
    };
    recognition.start();
  };

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setWorkers([]);
    setParsed(null);
    try {
      const res = await api.post('/ai/search', { query: q.trim() });
      const data = res.data;
      setParsed(data);
      setSearchedQuery(q.trim());

      const searchTerm = [data.service, q.trim()].filter(Boolean).join(' ');
      const workerRes = await api.get('/workers/search', { params: { q: searchTerm } });
      setWorkers(workerRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'AI search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, [initialQuery, doSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="py-4 md:py-10 animate-fade-in max-w-4xl mx-auto px-4 md:px-0">
      <BackButton to="/" className="mb-4" />

      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl gradient-brand text-white mb-3 md:mb-4 shadow-glow">
          <Sparkles size={22} className="md:w-6 md:h-6" />
        </div>
        <p className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-[0.15em]">Powered by AI</p>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-ink-900 mt-1">AI Service Assistant</h1>
        <p className="text-sm text-gray-500 mt-2">Describe what you need — our AI understands it and finds the perfect match.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I need an AC technician to service my split AC..."
            className="w-full pl-11 pr-12 py-3.5 md:py-4 bg-white border border-gray-200 rounded-2xl shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={startVoice}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-brand-50 hover:text-brand-600'
              }`}
              title={listening ? 'Listening...' : 'Voice search'}
            >
              <Mic size={18} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 text-white font-bold rounded-2xl disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          Search
        </button>
      </form>

      <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setQuery(ex)}
            className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs md:text-sm text-gray-500 shadow-sm hover:border-brand-300 hover:text-brand-700 hover:shadow-card transition-all"
          >
            <span className="inline-flex items-center gap-1.5"><Wand2 size={13} className="text-brand-500" /> {ex}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5 md:mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {parsed && !loading && (
        <div className="mt-6 md:mt-8">
          <div className="mb-5 md:mb-6 p-4 md:p-5 rounded-2xl gradient-brand-soft border border-brand-100 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-brand-600" />
              <p className="text-sm font-bold text-brand-800">AI Understanding</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
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

          <h2 className="font-display text-base md:text-lg font-bold text-ink-900 mb-3 md:mb-4 flex items-center gap-2">
            Matched Professionals
            <span className="text-xs md:text-sm font-medium text-gray-400">for "{searchedQuery}"</span>
          </h2>
          {workers.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
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
