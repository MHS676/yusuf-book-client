import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('Read Better');

  return (
    <div className="flex flex-col gap-24 pt-8 animate-in fade-in duration-500">
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-accentDark"></span>
            YOUR NEXT CHAPTER STARTS HERE
          </span>
          <h1 className="text-5xl md:text-6xl text-brand-primary leading-tight mb-6">
            A little more reading.<br />
            <em className="text-brand-accentDark font-medium">A lot more becoming.</em>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
            Make room for the ideas that move you forward. Explore your bookshelf and settle into a better way to read.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/library" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary text-[#fffdf7] text-sm font-semibold rounded hover:-translate-y-0.5 hover:bg-brand-primaryHover transition-all">
              Open my library <ArrowUpRight size={18} />
            </Link>
            <Link to="/about" className="text-sm font-semibold text-brand-primaryHover flex items-center gap-2 transition-colors">
              Get to know us <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        
        <div className="bg-[#e9e8d9] rounded-2xl p-8 h-[400px] flex flex-col justify-end relative overflow-hidden shadow-inner">
          <div className="absolute top-8 right-8 w-40 h-40 bg-[#d8c99f] rounded-full opacity-70 blur-2xl"></div>
          <div className="flex gap-4 items-end z-10 rotate-[-4deg] translate-y-4 hover:rotate-0 transition-transform duration-500 ease-out cursor-default">
            <div className="w-32 h-48 bg-[#435e4b] rounded shadow-2xl p-4 flex flex-col justify-center text-[#f7f2df]">
              <span className="font-serif text-2xl leading-none mb-2">THE ART OF FOCUS</span>
            </div>
            <div className="w-28 h-40 bg-[#bd805d] rounded shadow-xl p-4 flex flex-col justify-center text-[#fff6e8]">
              <span className="font-serif text-xl leading-none">little things, big change</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
