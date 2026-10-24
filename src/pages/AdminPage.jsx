import React, { useState } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Upload, Trash2, BookOpen, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function AdminPage() {
  useDocumentTitle('Admin - Book Management');

  const { books, addCustomBook, deleteBook, isLoading } = useBookStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Ordinary Level');
  const [subCategory, setSubCategory] = useState('');
  const [parsedPages, setParsedPages] = useState([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Parse uploaded PDF or TXT files
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setStatusMessage(null);

    try {
      if (!title) {
        // Auto-fill title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pagesList = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          pagesList.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        setParsedPages(pagesList);
        setStatusMessage({ type: 'success', text: `Successfully processed ${pagesList.length} pages from PDF!` });
      } else {
        // Fallback for TXT files
        const text = await file.text();
        const pagesList = text.split('---').map(p => p.trim()).filter(Boolean);
        setParsedPages(pagesList.length ? pagesList : [text]);
        setStatusMessage({ type: 'success', text: `Parsed ${pagesList.length || 1} pages from text document.` });
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setStatusMessage({ type: 'error', text: 'Failed to process file. Please try another PDF or text document.' });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || parsedPages.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please fill out all required fields and upload a valid document.' });
      return;
    }

    try {
      await addCustomBook({
        title,
        author,
        category,
        subCategory: subCategory.trim() || 'General',
        cover: '#1e293b',
        pages: parsedPages,
      });

      // Reset Form
      setTitle('');
      setAuthor('');
      setCategory('Ordinary Level');
      setSubCategory('');
      setParsedPages([]);
      setStatusMessage({ type: 'success', text: 'Book uploaded and published successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to save book to server.' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-brand-primary">Library Administration</h1>
        <p className="text-xs text-gray-500 mt-1">Upload PDF books, manage categories, and curate your active digital library catalog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Upload size={18} className="text-brand-primary" />
            <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider">Upload PDF Document or Book</h2>
          </div>

          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* PDF Dropzone */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Book Document (PDF)</label>
            <div className="relative border-2 border-dashed border-gray-200 hover:border-brand-accent rounded-2xl p-6 text-center transition-all bg-gray-50/50 hover:bg-gray-50 group cursor-pointer">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand-primary/5 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isProcessingFile ? <Spinner size="sm" /> : <FileText size={22} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">
                    {isProcessingFile ? 'Processing document pages...' : 'Click to upload PDF or drag & drop files here'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Supports PDF and TXT document exports</p>
                </div>
                {parsedPages.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-1">
                    <CheckCircle size={12} /> {parsedPages.length} Pages Loaded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Book Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Book Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Accounting Concepts V1" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
            />
          </div>

          {/* Author / Publisher */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Author / Publisher *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Mohammad Ali Yusuf Hossain" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category *</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all cursor-pointer"
              >
                <option value="Ordinary Level">Ordinary Level</option>
                <option value="Advanced Level">Advanced Level</option>
                <option value="Blog">Blog & Articles</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Subcategory</label>
              <input 
                type="text" 
                placeholder="e.g. Accounting, ICT, General" 
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || isProcessingFile}
            className="w-full py-3 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner size="sm" /> : <Upload size={14} />}
            <span>Publish Book to Library</span>
          </button>
        </form>

        {/* Active Catalog List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-brand-primary" />
              <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider">Active Library Catalog ({books.length})</h2>
            </div>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {books.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No books currently uploaded.</p>
            ) : (
              books.map((book) => (
                <div key={book.id} className="p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition-all flex items-center justify-between gap-3 bg-gray-50/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-11 rounded bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-brand-dark truncate">{book.title}</h3>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{book.author} • {book.pages?.length || 0} Pages</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] font-bold text-brand-accentDark bg-brand-accent/10 px-1.5 py-0.5 rounded">{book.category}</span>
                        {book.subCategory && <span className="text-[8px] text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">{book.subCategory}</span>}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteBook(book.id)}
                    title="Delete book"
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
