import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Seo from '../../components/Seo';

export default function NotFoundPage() {
  return (
    <div className="animate-fade-in min-h-[70vh] flex items-center justify-center px-4">
      <Seo title="Page Not Found" description="The page you are looking for could not be found. Explore Easyservice home services instead." canonicalPath="/404" noindex />
      <div className="text-center max-w-md">
        <p className="text-6xl md:text-7xl font-display font-extrabold gradient-text mb-3">404</p>
        <h1 className="font-display font-bold text-xl md:text-2xl text-gray-900 mb-2">Oops! Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The page you are looking for might have been moved or deleted. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 btn-primary px-5 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all">
            <Home size={16} /> Go Home
          </Link>
          <Link to="/search" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all">
            <Search size={16} /> Browse Services
          </Link>
        </div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-700 mt-6 font-semibold">
          <ArrowLeft size={14} /> Back to homepage
        </Link>
      </div>
    </div>
  );
}
