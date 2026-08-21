import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ to, label = 'Back', className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-brand-700 transition-colors ${className}`}
    >
      <ChevronLeft size={18} />
      {label}
    </button>
  );
}
