import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl animate-in fade-in duration-500">
      <span className="text-xs font-bold tracking-widest text-brand-accentDark mb-4 block">A PLACE FOR GOOD IDEAS</span>
      <h1 className="text-5xl text-brand-primary mb-6">
        We believe every<br /><em className="text-brand-accentDark">page can open a door.</em>
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed mb-12">
        PageTurn makes it easier to slow down, stay curious, and spend time with the books that make you think.
      </p>
      <div className="grid md:grid-cols-3 gap-8 py-12 border-y border-brand-border mb-12">
        {['Make space', 'Stay curious', 'Keep growing'].map((title, i) => (
          <article key={title}>
            <span className="text-brand-accentDark font-bold text-xs">0{i+1}</span>
            <h2 className="text-2xl mt-2 mb-3 text-brand-dark">{title}</h2>
            <p className="text-sm text-gray-600">A calm, focused home for your reading. No noise, no rush—just you and the next page.</p>
          </article>
        ))}
      </div>
      <Link to="/library" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary text-[#fffdf7] text-sm font-semibold rounded hover:-translate-y-0.5 hover:bg-brand-primaryHover transition-all">
        Explore the library <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
