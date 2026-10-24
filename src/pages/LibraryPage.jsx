import React, { useMemo, useEffect, useState, useRef, forwardRef } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Search, Maximize, Minimize, BookOpen, Filter, Volume2, VolumeX } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import HTMLFlipBook from 'react-pageflip';
import { CommentsPanel } from '../components/CommentsPanel';

// Synthesize a realistic paper rustle sound using Web Audio API
const playPageTurnSound = (audioCtxRef) => {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const bufferSize = ctx.sampleRate * 0.12; // 120ms paper swish
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (err) {
    // Audio context fallback
  }
};

// Tactile Hardware-Accelerated Page
const Page = forwardRef(({ children, isCover }, ref) => {
  return (
    <div 
      ref={ref} 
      data-density={isCover ? "hard" : "soft"} 
      className="bg-[#fdfbf7] h-full w-full overflow-hidden select-none cursor-grab active:cursor-grabbing group shadow-md"
      style={{
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <div className="h-full w-full relative flex items-center justify-center overflow-hidden">
        {/* Visual Grab Corner Peel Cues */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-bl from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-tl from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-30" />

        {/* Realistic Spine Light Shadow */}
        {!isCover && (
          <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-20" />
        )}
        <div className="w-full h-full flex items-center justify-center p-0 m-0 z-10">
          {typeof children === 'string' && (children.startsWith('http') || children.startsWith('data:image')) ? (
            <img 
              src={children} 
              alt="PDF Page" 
              className="w-full h-full object-fill pointer-events-none mx-auto my-auto" 
            />
          ) : (
            <div className="w-full h-full p-3 md:p-5 prose max-w-none text-gray-800 font-serif leading-relaxed text-xs md:text-sm overflow-y-auto">
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const readerRef = useRef(null);
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const [bookDimensions, setBookDimensions] = useState({
    width: 350,
    height: 500,
    isMobile: false
  });
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Responsive Max-Fit Dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const { clientWidth, clientHeight } = containerRef.current;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 768;

      const padX = isMobile ? 8 : 16;
      const padY = isMobile ? 8 : 16;
      const maxAvailableWidth = Math.max(clientWidth - padX, 200);
      const maxAvailableHeight = Math.max(clientHeight - padY, 250);

      const pageAspectRatio = 1.414;
      let singlePageWidth, singlePageHeight;

      if (isMobile) {
        singlePageHeight = maxAvailableHeight;
        singlePageWidth = singlePageHeight / pageAspectRatio;

        if (singlePageWidth > maxAvailableWidth) {
          singlePageWidth = maxAvailableWidth;
          singlePageHeight = singlePageWidth * pageAspectRatio;
        }
      } else {
        singlePageHeight = maxAvailableHeight;
        singlePageWidth = singlePageHeight / pageAspectRatio;

        if (singlePageWidth * 2 > maxAvailableWidth) {
          singlePageWidth = maxAvailableWidth / 2;
          singlePageHeight = singlePageWidth * pageAspectRatio;
        }
      }

      setBookDimensions({
        width: Math.max(Math.floor(singlePageWidth), 150),
        height: Math.max(Math.floor(singlePageHeight), 210),
        isMobile
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isFullscreen, activeBookId]);

  const toggleFullscreen = async () => {
    try {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFull) {
        if (readerRef.current?.requestFullscreen) {
          await readerRef.current.requestFullscreen();
        } else if (readerRef.current?.webkitRequestFullscreen) {
          await readerRef.current.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  };

  const handlePageFlip = () => {
    if (soundEnabled) {
      playPageTurnSound(audioCtxRef);
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
    ...selectedBook.pages.map((content, idx) => (
      <Page key={`page-${idx}`} isCover={idx === 0 || idx === selectedBook.pages.length - 1}>
        {content}
      </Page>
    )),
    ...(selectedBook.pages.length % 2 !== 0 ? [<Page key="blank" />] : [])
  ] : [];

  return (
    <div className="w-full h-full flex flex-col flex-1 animate-in fade-in duration-500 min-h-0">
      
      {!isFullscreen && (
        <div className="mb-3 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
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
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-sm cursor-pointer"
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
                className="w-full pl-10 pr-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className={`gap-4 overflow-hidden ${!isFullscreen ? 'flex flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_320px] flex-1 min-h-0' : 'flex-1 min-h-0'}`}>
        
        {!isFullscreen && (
          <aside className="bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden z-10 shadow-sm h-auto lg:h-full min-h-0">
            <div className="p-3 pb-2 shrink-0 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Bookshelf</h2>
              <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full">{filteredBooks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredBooks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No books match this category.</p>
              ) : (
                <ul className="flex overflow-x-auto lg:flex-col gap-2 snap-x pb-1 lg:pb-0">
                  {filteredBooks.map((book) => (
                    <li key={book.id} className="min-w-[150px] lg:min-w-0 snap-start">
                      <button
                        onClick={() => setActiveBook(book.id)}
                        className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 ${
                          book.id === selectedBook?.id 
                            ? 'bg-gray-50 shadow-sm border border-brand-accent/30 ring-1 ring-brand-accent/10' 
                            : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
                        }`}
                      >
                        <div className="w-7 h-10 rounded shadow-sm shrink-0 flex items-center justify-center border border-black/10 relative overflow-hidden" style={{ backgroundColor: book.cover || '#1e293b' }}>
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <span className="block text-xs font-bold text-brand-dark truncate">{book.title}</span>
                          <span className="block text-[10px] text-gray-500 truncate mt-0.5">{book.author}</span>
                          <span className="inline-block text-[8px] text-brand-accentDark bg-brand-accent/10 px-1.5 py-0.5 rounded mt-0.5 font-medium">{book.subCategory}</span>
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
            className={`flex flex-col relative min-h-[350px] md:min-h-0 rounded-xl overflow-hidden shadow-sm border transition-all
              ${isFullscreen ? 'bg-zinc-950 h-screen w-screen z-50 fixed inset-0 border-zinc-800' : 'bg-[#eaeadf] border-gray-200 w-full h-full'}`}
          >
            {isFullscreen && (
              <div className="absolute top-0 left-0 right-0 h-14 z-[55] peer" />
            )}

            {/* Top Bar with Audio Control */}
            <div className={`flex justify-between items-center w-full px-4 py-2 shrink-0 transition-all duration-300 ease-in-out ${
              isFullscreen 
                ? 'absolute top-0 left-0 right-0 z-[60] bg-zinc-900/95 border-b border-zinc-800 text-white shadow-xl -translate-y-full opacity-0 pointer-events-none peer-hover:translate-y-0 peer-hover:opacity-100 peer-hover:pointer-events-auto hover:translate-y-0 hover:opacity-100 hover:pointer-events-auto' 
                : 'relative bg-[#f4f4f0] border-b border-gray-300 text-gray-800 translate-y-0 opacity-100'
            }`}>
              <div className="min-w-0 pr-2">
                <span className={`text-[8px] md:text-[9px] font-bold tracking-widest block mb-0.5 ${isFullscreen ? 'text-zinc-400' : 'text-gray-500'}`}>
                  NOW READING ({selectedBook.category})
                </span>
                <strong className={`font-serif text-xs md:text-sm truncate block ${isFullscreen ? 'text-zinc-100' : 'text-brand-primary'}`}>
                  {selectedBook.title}
                </strong>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs ${
                    soundEnabled 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-white text-gray-400 border-gray-200'
                  }`}
                  title={soundEnabled ? 'Mute Page Sound' : 'Enable Page Sound'}
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>

                <button 
                  onClick={toggleFullscreen}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium shrink-0 shadow-sm ${
                    isFullscreen 
                      ? 'hover:bg-zinc-700 text-zinc-200 bg-zinc-800 border border-zinc-700' 
                      : 'hover:bg-white text-gray-700 bg-white border border-gray-200'
                  }`}
                >
                  {isFullscreen ? (
                    <><Minimize size={13} /> <span className="hidden sm:inline">Exit Fullscreen</span></>
                  ) : (
                    <><Maximize size={13} /> <span className="hidden sm:inline">Fullscreen</span></>
                  )}
                </button>
              </div>
            </div>

            {/* REALISTIC 3D HAND-FLIP CANVAS */}
            <div 
              ref={containerRef} 
              className="flex-1 relative w-full h-full min-h-0 flex items-center justify-center p-1 md:p-2 overflow-hidden"
              style={{ perspective: '2500px' }}
            >
              <HTMLFlipBook 
                key={`${selectedBook.id}-${isFullscreen}-${bookDimensions.isMobile}-${bookDimensions.width}-${bookDimensions.height}`} 
                width={bookDimensions.width} 
                height={bookDimensions.height} 
                size="fixed"
                minWidth={100} 
                maxWidth={2500} 
                minHeight={150} 
                maxHeight={2500} 
                maxShadowOpacity={0.65} 
                drawShadow={true}
                usePortrait={bookDimensions.isMobile}
                flippingTime={700} 
                showCover={true} 
                useMouseEvents={true}
                clickEventForward={true}
                swipeDistance={15}
                showPageCorners={true}
                mobileScrollSupport={true} 
                onFlip={handlePageFlip}
                className="shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] mx-auto my-auto"
                style={{ margin: 'auto' }}
              >
                {flipbookChildren}
              </HTMLFlipBook>
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
