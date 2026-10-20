import { useState } from 'react';
import { useBookStore } from '../store/useBookStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/ui/Button';

export default function ExamPage() {
  const { books } = useBookStore();
  const { addToast } = useToastStore();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!books.length) return <div className="text-center py-20">Loading exam data...</div>;

  const questionBook = books[0]; 
  const options = books.map(b => b.author);
  const isCorrect = selectedAnswer === questionBook.author;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAnswer) return;
    
    setIsSubmitted(true);
    if (isCorrect) {
      addToast('Great job! That is correct.', 'success');
    } else {
      addToast('Not quite right. Try again next time.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <span className="text-xs font-bold tracking-widest text-brand-accentDark mb-4 block">KNOWLEDGE CHECK</span>
      <h1 className="text-4xl text-brand-primary mb-6">Daily Reading Exam</h1>
      <p className="text-gray-600 mb-8">Test your retention of the ideas you've been reading.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-brand-border p-8 rounded-xl shadow-sm">
        <h3 className="text-xl font-serif text-brand-dark mb-6">
          Who is the author of "{questionBook.title}"?
        </h3>
        
        <div className="flex flex-col gap-3 mb-8">
          {options.map((author, idx) => (
            <label 
              key={idx} 
              className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-3
                ${selectedAnswer === author ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-brand-accent'}
                ${isSubmitted && author === questionBook.author ? '!border-green-500 !bg-green-50' : ''}
                ${isSubmitted && selectedAnswer === author && !isCorrect ? '!border-red-500 !bg-red-50' : ''}
              `}
            >
              <input 
                type="radio" 
                name="author" 
                value={author}
                disabled={isSubmitted}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
              />
              <span className="font-medium text-gray-800">{author}</span>
            </label>
          ))}
        </div>

        {!isSubmitted ? (
          <Button type="submit" disabled={!selectedAnswer}>Submit Answer</Button>
        ) : (
          <div className={`p-4 rounded border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setIsSubmitted(false); setSelectedAnswer(null); }}
            >
              Next Question
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
