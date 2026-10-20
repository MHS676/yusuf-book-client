import React, { useMemo, useEffect, useState, useRef, forwardRef } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Search, Maximize, Minimize, BookOpen, Filter } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import HTMLFlipBook from 'react-pageflip';
import { CommentsPanel } from '../components/CommentsPanel';

const Page = forwardRef(({ children, number }, ref) => {
  return (
    <div ref={ref} data-density="soft" className="bg-[#fffdf8] h-full w-full">
      <div className="h-full w-full px-6 py-8 md:px-8 md:py-10 lg:px-12 lg:py-14 flex flex-col justify-between relative shadow-[inset_0_0_30px_rgba(0,0,0,0.03)] border-x border-black/5 overflow-y-auto">
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-0" />
        {typeof children === 'string' && children.startsWith('data:image/') ? (
          <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden relative z-10">
            <img src={children} alt={`Page ${number}`} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="prose max-w-none text-gray-800 font-serif leading-relaxed text-xs md:text-sm lg:text-base z-10">
            {children}
          </div>
        )}
        {number && <div className="text-center text-[10px] text-gray-400 mt-auto pt-3 font-sans z-10 border-t border-gray-200 w-1/3 mx-auto shrink-0">- {number} -</div>}
      </div>
    </div>
  );
});
Page.displayName = 'Page';


export default function LibraryPage() {
  useDocumentTitle('My Library');
  
  const { books, activeBookId, isLoading, fetchBooks, setActiveBook } = useBookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === readerRef.current) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement && readerRef.current?.requestFullscreen) {
        await readerRef.current.requestFullscreen();
      } else {
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const matchesSearch = !debouncedSearchQuery.trim() || 
        book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
        book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, debouncedSearchQuery]);

  const selectedBook = useMemo(() => 
    filteredBooks.find((b) => b.id === activeBookId) ?? filteredBooks[0] ?? books[0], 
  [filteredBooks, activeBookId, books]);

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-brand-primary animate-in fade-in">
        <Spinner size="lg" />
        <p className="font-semibold animate-pulse">Dusting off the bookshelves...</p>
      </div>
    );
  }

  if (!books.length) {
    return <div className="text-center py-20 text-gray-500">No books found in the library.</div>;
  }

  const flipbookChildren = selectedBook ? selectedBook.pages.map((content, idx) => (
      <Page key={`page-${idx}`} number={idx + 1}>{content}</Page>
    )) : [];

  return (
    <div className="w-full h-full flex flex-col flex-1 animate-in fade-in duration-500 min-h-0">
      
      {!isFullscreen && (
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold tracking-widest text-brand-accentDark mb-0.5 flex items-center gap-1.5 justify-center md:justify-start">
              <BookOpen size={13} /> YOUR READING SPACE
            </span>
            <h1 className="text-xl md:text-2xl text-brand-primary font-serif">Digital Library</h1>
          </div>
          
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Ordinary Level">Ordinary Level</option>
                <option value="Advanced Level">Advanced Level</option>
                <option value="Blog">Blog & Articles</option>
              </select>
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search titles or authors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 
        WIREFRAME LAYOUT STRUCTURE
        Left Column | Center Column | Right Column 
      */}
      <div className={`gap-4 overflow-hidden ${!isFullscreen ? 'flex flex-col lg:grid lg:grid-cols-[250px_minmax(0,1fr)_300px] xl:grid-cols-[270px_minmax(0,1fr)_340px] flex-1 min-h-0' : 'flex-1 min-h-0'}`}>
        
        {/* LEFT COLUMN: Bookshelf */}
        {!isFullscreen && (
          <aside className="bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden z-10 shadow-sm h-full min-h-0">
            <div className="p-4 pb-3 shrink-0 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Bookshelf</h2>
              <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full">{filteredBooks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filteredBooks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No books match this category.</p>
              ) : (
                <ul className="flex overflow-x-auto lg:flex-col gap-2.5 snap-x">
                  {filteredBooks.map((book) => (
                    <li key={book.id} className="min-w-[170px] lg:min-w-0 snap-start">
                      <button
                        onClick={() => setActiveBook(book.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                          book.id === selectedBook?.id 
                            ? 'bg-gray-50 shadow-sm border border-brand-accent/30 ring-1 ring-brand-accent/10' 
                            : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-12 rounded shadow-sm shrink-0 flex items-center justify-center border border-black/10 relative overflow-hidden" style={{ backgroundColor: book.cover }}>
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <span className="block text-xs font-bold text-brand-dark truncate">{book.title}</span>
                          <span className="block text-[10px] text-gray-500 truncate mt-0.5">{book.author}</span>
                          <span className="inline-block text-[8px] text-brand-accentDark bg-brand-accent/10 px-1.5 py-0.5 rounded mt-1 font-medium">{book.subCategory}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        )}

        {/* CENTER COLUMN: Reading Area */}
        {selectedBook ? (
          <section 
            ref={readerRef}
            className={`flex flex-col relative min-h-0 rounded-xl overflow-hidden shadow-sm border
              ${isFullscreen ? 'bg-zinc-900 h-screen w-screen z-50 fixed inset-0 border-zinc-800' : 'bg-[#e5e5e0] border-gray-200 w-full h-full'}`}
          >
            {/* Invisible trigger area for the hover effect in fullscreen */}
            {/* Center Top Bar */}
            <div className={`flex justify-between items-center w-full px-5 py-3 shrink-0 border-b z-[70] ${
              isFullscreen 
                ? 'absolute top-0 left-0 right-0 bg-zinc-900/95 border-zinc-800' 
                : 'relative bg-[#f4f4f0] border-gray-300'
            }`}>
              <div className="min-w-0 pr-4">
                <span className={`text-[9px] font-bold tracking-widest block mb-0.5 ${isFullscreen ? 'text-zinc-400' : 'text-gray-500'}`}>NOW READING ({selectedBook.category})</span>
                <strong className={`font-serif text-sm md:text-base truncate block ${isFullscreen ? 'text-zinc-100' : 'text-brand-primary'}`}>{selectedBook.title}</strong>
              </div>
              
              <button 
                onClick={toggleFullscreen}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 shadow-sm
                  ${isFullscreen ? 'hover:bg-zinc-700 text-zinc-300 bg-zinc-800 border border-zinc-700' : 'hover:bg-white text-gray-600 bg-white border border-gray-200'}`}
              >
                {isFullscreen ? (
                  <><Minimize size={14} /> <span className="hidden md:inline">Exit</span></>
                ) : (
                  <><Maximize size={14} /> <span className="hidden md:inline">Fullscreen</span></>
                )}
              </button>
            </div>

            {/* 
              STRICT WIREFRAME BOOK CONTAINER:
              Using 'absolute inset-x' bounds the flipbook purely to this exact safe area.
            */}
            <div className="flex-1 relative w-full h-full min-h-0">
              <div className={`absolute flex items-center justify-center ${isFullscreen ? 'inset-8 md:inset-16' : 'inset-4 md:inset-8'}`}>
                <HTMLFlipBook 
                  key={`${selectedBook.id}-${isFullscreen}`} 
                  width={400} 
                  height={580} 
                  size="stretch" 
                  minWidth={200} 
                  maxWidth={2000} /* Letting the absolute bounds enforce the real limits */
                  minHeight={250} 
                  maxHeight={2000} 
                  maxShadowOpacity={0.5} 
                  drawShadow={true}
                  usePortrait={false}
                  flippingTime={800}
                  showCover={false} 
                  mobileScrollSupport={true} 
                  className="shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]"
                  style={{ margin: '0 auto' }}
                >
                  {flipbookChildren}
                </HTMLFlipBook>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex items-center justify-center p-10 bg-white border border-gray-200 rounded-xl text-gray-500">Select a book to start reading.</div>
        )}

        {/* RIGHT COLUMN: Comments */}
        {!isFullscreen && selectedBook && (
          <aside className="bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden z-10 shadow-sm h-full min-h-0">
            <CommentsPanel bookId={selectedBook.id} />
          </aside>
        )}

      </div>
    </div>
  );
}
