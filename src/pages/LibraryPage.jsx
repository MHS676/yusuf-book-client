import React, { useMemo, useEffect, useState, useRef, forwardRef } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Search, Maximize, Minimize, BookOpen, MousePointerClick, Filter } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import HTMLFlipBook from 'react-pageflip';
import { CommentsPanel } from '../components/CommentsPanel';

const BookCover = forwardRef(({ book, children, isBack }, ref) => {
  return (
    <div ref={ref} data-density="hard" className="shadow-[0_0_20px_rgba(0,0,0,0.4)] h-full w-full bg-white">
      <div 
        className="w-full h-full flex flex-col items-center justify-center text-white text-center relative overflow-hidden"
        style={{ backgroundColor: book.cover }}
      >
        <div className={`absolute top-0 bottom-0 w-16 pointer-events-none z-0 bg-gradient-to-r ${isBack ? 'from-transparent via-black/20 to-black/50 right-0' : 'from-black/50 via-black/20 to-transparent left-0'}`} />
        <div className={`absolute top-0 bottom-0.5 w-3 pointer-events-none z-0 bg-black/20 shadow-inner ${isBack ? 'right-12' : 'left-12'}`} />
        
        <div className="absolute inset-4 border border-white/10 p-4 flex flex-col items-center justify-center z-10">
           {children}
        </div>

        {!isBack && (
          <div className="absolute bottom-6 flex items-center gap-1.5 text-white/70 text-[10px] font-sans tracking-widest animate-pulse">
            <MousePointerClick size={12} /> CLICK TO OPEN
          </div>
        )}
      </div>
    </div>
  );
});
BookCover.displayName = 'BookCover';

const InnerCover = forwardRef(({ book, isBack }, ref) => {
  return (
    <div ref={ref} data-density="hard" className="h-full w-full bg-white">
      <div 
        className="w-full h-full relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
        style={{ backgroundColor: book.cover }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className={`absolute top-0 bottom-0 w-16 pointer-events-none bg-gradient-to-r ${isBack ? 'from-black/80 to-transparent left-0' : 'from-transparent to-black/80 right-0'}`} />
      </div>
    </div>
  );
});
InnerCover.displayName = 'InnerCover';

/* 
  OPTIMIZED PAGE COMPONENT:
  - Removed inner padding so PDF pages stretch edge-to-edge
  - Removed double border/margin gaps at the spine
*/
const Page = forwardRef(({ children }, ref) => {
  return (
    <div ref={ref} data-density="soft" className="bg-white h-full w-full overflow-hidden">
      <div className="h-full w-full relative flex items-center justify-center overflow-hidden">
        {/* Shadow gradient along the center spine */}
        <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-20" />
        <div className="w-full h-full flex items-center justify-center p-0 m-0 z-10">
          {typeof children === 'string' && (children.startsWith('http') || children.startsWith('data:image')) ? (
            <img src={children} alt="PDF Page" className="w-full h-full object-fill pointer-events-none" />
          ) : (
            <div className="w-full h-full p-4 prose max-w-none text-gray-800 font-serif leading-relaxed text-xs md:text-sm lg:text-base overflow-y-auto">
              {children}
            </div>
          )}
        </div>
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
      if (!document.fullscreenElement) {
        await readerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
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

  const flipbookChildren = selectedBook ? [
    <BookCover key="cover-front" book={selectedBook} isBack={false}>
      <h2 className="text-xl md:text-2xl lg:text-3xl mb-2 leading-tight font-serif drop-shadow-lg px-2">{selectedBook.title}</h2>
      <p className="text-xs md:text-sm opacity-90 drop-shadow-md italic tracking-wide">{selectedBook.author}</p>
      <span className="mt-3 text-[8px] md:text-[9px] uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">{selectedBook.category} • {selectedBook.subCategory}</span>
    </BookCover>,
    <InnerCover key="inner-front" book={selectedBook} isBack={false} />,
    ...selectedBook.pages.map((content, idx) => (
      <Page key={`page-${idx}`}>{content}</Page>
    )),
    ...(selectedBook.pages.length % 2 !== 0 ? [<Page key="blank" />] : []),
    <InnerCover key="inner-back" book={selectedBook} isBack={true} />,
    <BookCover key="cover-back" book={selectedBook} isBack={true}>
      <h3 className="text-lg md:text-xl mb-2 font-serif">The End</h3>
      <p className="text-[10px] md:text-xs opacity-80">Close the book to return to shelf.</p>
    </BookCover>
  ] : [];

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

      <div className={`gap-4 overflow-hidden ${!isFullscreen ? 'flex flex-col lg:grid lg:grid-cols-[250px_minmax(0,1fr)_300px] xl:grid-cols-[270px_minmax(0,1fr)_340px] flex-1 min-h-0' : 'flex-1 min-h-0'}`}>
        
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

        {selectedBook ? (
          <section 
            ref={readerRef}
            className={`flex flex-col relative min-h-0 rounded-xl overflow-hidden shadow-sm border
              ${isFullscreen ? 'bg-zinc-900 h-screen w-screen z-50 fixed inset-0 border-zinc-800' : 'bg-[#e5e5e0] border-gray-200 w-full h-full'}`}
          >
            {isFullscreen && <div className="absolute top-0 left-0 right-0 h-16 z-[60] peer" />}

            <div className={`flex justify-between items-center w-full px-5 py-3 shrink-0 border-b z-50 transition-all duration-300 ease-in-out ${
              isFullscreen 
                ? 'absolute top-0 left-0 right-0 bg-zinc-900/95 border-zinc-800 -translate-y-full opacity-0 peer-hover:translate-y-0 peer-hover:opacity-100 hover:translate-y-0 hover:opacity-100' 
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

            {/* EXPANDED FLIPBOOK CANVAS AREA */}
            <div className="flex-1 relative w-full h-full min-h-0">
              <div className={`absolute flex items-center justify-center ${isFullscreen ? 'inset-4 md:inset-8' : 'inset-2 md:inset-4'}`}>
                <HTMLFlipBook 
                  key={`${selectedBook.id}-${isFullscreen}`} 
                  width={isFullscreen ? 520 : 420} 
                  height={isFullscreen ? 720 : 580} 
                  size="stretch" 
                  minWidth={200} 
                  maxWidth={2400} 
                  minHeight={250} 
                  maxHeight={2400} 
                  maxShadowOpacity={0.4} 
                  drawShadow={true}
                  usePortrait={false}
                  flippingTime={800}
                  showCover={true} 
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

        {!isFullscreen && selectedBook && (
          <aside className="bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden z-10 shadow-sm h-full min-h-0">
            <CommentsPanel bookId={selectedBook.id} />
          </aside>
        )}

      </div>
    </div>
  );
}
