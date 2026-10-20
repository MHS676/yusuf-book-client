import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-8 my-auto animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6">
        <BookOpen size={32} />
      </div>
      <h1 className="text-4xl font-serif text-brand-primary mb-3">404 - Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primaryHover transition-all shadow-md"
      >
        <ArrowLeft size={16} /> Return Home
      </Link>
    </div>
  );
}
