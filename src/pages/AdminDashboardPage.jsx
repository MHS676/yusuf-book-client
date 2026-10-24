import React, { useState } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BookPlus, FileText, CheckCircle2, Trash2, Plus, Layers, ShieldAlert, UploadCloud } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Control Center');
  const { books, addCustomBook, deleteBook } = useBookStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState('books');

  // Book Upload State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Ordinary Level');
  const [subCategory, setSubCategory] = useState('');
  const [pagesInput, setPagesInput] = useState('');
  const [pdfPages, setPdfPages] = useState([]);
  const [fileName, setFileName] = useState('');

  // Exam Pattern Builder State
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // Handle File Upload & Auto-Parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      let extractedPages;

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        extractedPages = [];
        let totalSize = 0;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not prepare a PDF page for the reader.');

          await page.render({ canvasContext: context, viewport }).promise;
          const pageImage = canvas.toDataURL('image/jpeg', 0.78);
          totalSize += pageImage.length;
          canvas.width = 0;
          canvas.height = 0;

          if (totalSize > 40 * 1024 * 1024) {
            throw new Error('This PDF is too large to save as reader pages. Split it into smaller files and try again.');
          }
          extractedPages.push(pageImage);
        }

        if (extractedPages.length === 0) {
          throw new Error('No pages were found in this PDF.');
        }
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        const text = await file.text();
        extractedPages = text
          .split(/\r?\n\r?\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .reduce((pages, paragraph) => {
            const lastPage = pages.at(-1);
            if (lastPage && lastPage.length + paragraph.length < 800) {
              pages[pages.length - 1] = `${lastPage}\n\n${paragraph}`;
            } else {
              pages.push(paragraph);
            }
            return pages;
          }, []);
      } else {
        throw new Error('Please choose a PDF or plain text (.txt) file.');
      }

      if (!extractedPages.length) throw new Error('No readable text was found in this file.');

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
      setAuthor('Mohammad Ali Yusuf Hossain');
      setFileName(file.name);
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setPdfPages(extractedPages);
        setPagesInput('');
        addToast(`Prepared ${extractedPages.length} PDF pages. Publish the book to save them.`);
      } else {
        setPdfPages([]);
        setPagesInput(extractedPages.join('\n---\n'));
        addToast(`Extracted ${extractedPages.length} pages from "${file.name}". Publish the book to save it.`);
      }
    } catch (error) {
      setFileName('');
      setPdfPages([]);
      addToast(error.message || 'Could not read this file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || (!pagesInput && !pdfPages.length)) {
      addToast('Please fill in all book details.');
      return;
    }

    const pagesArray = pdfPages.length
      ? pdfPages
      : pagesInput.split('\n---\n').map(p => p.trim()).filter(Boolean);
    
    const newBook = {
      title,
      author,
      category,
      subCategory: subCategory.trim() || 'General',
      cover: '#1e3a8a',
      pages: pagesArray.length > 0 ? pagesArray : [pagesInput]
    };

    try {
      await addCustomBook(newBook);
      addToast(`Successfully published "${title}" to the Digital Library!`);
      setTitle('');
      setAuthor('');
      setCategory('Ordinary Level');
      setSubCategory('');
      setPagesInput('');
      setPdfPages([]);
      setFileName('');
    } catch {
      addToast('The book could not be saved. Check the backend connection and try again.', 'error');
    }
  };

  const handleAddQuestionField = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      addToast('Please provide an exam title.');
      return;
    }
    addToast(`Exam pattern "${examTitle}" created successfully with ${questions.length} questions!`);
    setExamTitle('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-[#fbfaf6] p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand-accentDark mb-1 flex items-center gap-2">
            <ShieldAlert size={14} /> SYSTEM CONTROL CENTER
          </span>
          <h1 className="text-2xl md:text-3xl text-brand-primary font-serif">Admin Management Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'books' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BookPlus size={16} /> Book & PDF Uploader
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'exams' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Layers size={16} /> Question Pattern Builder
          </button>
        </div>
      </div>

      {/* TAB 1: BOOK & PDF UPLOADER */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl flex flex-col">
            <h2 className="text-lg font-serif font-bold text-brand-primary mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand-accentDark" /> Upload PDF Document or Book
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Upload your PDF/text files (e.g., *Role of ICT in Accounting*) to automatically parse pages into the 3D book reader.
            </p>

            {/* Drag & Drop File Upload Box */}
            <div className="mb-6 border-2 border-dashed border-gray-300 hover:border-brand-primary rounded-2xl p-6 text-center bg-gray-50 transition-all relative">
              <input 
                type="file" 
                accept=".pdf,.txt,application/pdf,text/plain" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <span className="text-sm font-bold text-brand-dark">
                  {fileName ? `Loaded: ${fileName}` : 'Click to upload PDF or drag & drop files here'}
                </span>
                <span className="text-[11px] text-gray-400">Supports PDF, TXT, and Document exports</span>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Book Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Role of ICT in Accounting" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Author / Publisher</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Mohammad Ali Yusuf Hossain" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    <option value="Ordinary Level">Ordinary Level</option>
                    <option value="Advanced Level">Advanced Level</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subcategory</label>
                <input type="text" placeholder="e.g., Accounting, ICT, General" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              </div>

              <button type="submit" className="w-full py-3 bg-brand-primary text-white font-bold text-sm rounded-xl hover:bg-brand-primaryHover transition-all shadow-md flex items-center justify-center gap-2 mt-4">
                <BookPlus size={18} /> Publish Book to Library
              </button>
            </form>
          </div>

          {/* Existing Books Overview */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl flex flex-col">
            <h2 className="text-lg font-serif font-bold text-brand-primary mb-4 flex items-center gap-2">
              <Layers size={20} className="text-brand-accentDark" /> Active Library Catalog ({books.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[550px]">
              {books.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded shadow-sm shrink-0" style={{ backgroundColor: b.cover }} />
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">{b.title}</h4>
                      <p className="text-xs text-gray-500">{b.author} • {b.pages.length} Pages</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { deleteBook(b.id); addToast(`Removed "${b.title}" from catalog.`); }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete book"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXAM & QUESTION PATTERN BUILDER */}
      {activeTab === 'exams' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl max-w-4xl mx-auto w-full">
          <h2 className="text-xl font-serif font-bold text-brand-primary mb-2 flex items-center gap-2">
            <Layers size={22} className="text-brand-accentDark" /> Create Custom Exam & Question Patterns
          </h2>
          <p className="text-xs text-gray-500 mb-8">
            Build certification exams or chapter tests for your library readers. Set multiple-choice options and identify correct answers.
          </p>

          <form onSubmit={handleExamSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Exam / Assessment Title</label>
              <input 
                type="text" 
                placeholder="e.g., Role of ICT in Accounting - Final Assessment" 
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-primary uppercase">Question {qIdx + 1}</span>
                  </div>
                  
                  <input 
                    type="text"
                    placeholder="Enter question statement..."
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => {
                            const updated = [...questions];
                            updated[qIdx].correctAnswer = oIdx;
                            setQuestions(updated);
                          }}
                          title="Mark as correct answer"
                          className="w-4 h-4 text-brand-primary"
                        />
                        <input 
                          type="text"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button 
                type="button" 
                onClick={handleAddQuestionField}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-dark text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Another Question
              </button>

              <button 
                type="submit" 
                className="px-6 py-3 bg-brand-primary text-white font-bold text-sm rounded-xl hover:bg-brand-primaryHover transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> Save & Deploy Exam Pattern
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
