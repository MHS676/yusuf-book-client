import { useState } from 'react';
import { useCommentStore } from '../store/useCommentStore';
import { Send, MessageSquare, CornerDownRight, BookOpen } from 'lucide-react';

export function CommentsPanel({ bookId }) {
  const { comments, addComment, addReply } = useCommentStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const bookComments = comments.filter(c => c.bookId === bookId);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(bookId, newComment);
    setNewComment('');
  };

  const handleAddReply = (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReply(commentId, replyText);
    setReplyingTo(null);
    setReplyText('');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-brand-border/60">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center gap-3 shrink-0 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] z-10">
        <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accentDark">
          <MessageSquare size={16} />
        </div>
        <h3 className="font-bold text-sm text-brand-dark tracking-wide">Reader Discussions</h3>
        <span className="ml-auto text-xs font-bold bg-brand-primary text-white px-2.5 py-1 rounded-full">
          {bookComments.length}
        </span>
      </div>

      {/* Scrollable Comment Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#faf9f5]">
        {bookComments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <BookOpen size={32} className="text-gray-400 mb-3" />
            <h4 className="text-sm font-bold text-brand-dark mb-1">No comments yet</h4>
            <p className="text-xs text-gray-500 max-w-[200px]">Be the first to share your thoughts on this chapter.</p>
          </div>
        ) : (
          bookComments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
              {/* Main Comment */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm">
                    <span className="font-bold text-brand-dark mr-2">{comment.author.name}</span>
                    <span className="text-gray-700 leading-relaxed">{comment.text}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 ml-2">
                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(comment.date)}</span>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-[11px] font-bold text-brand-accent hover:text-brand-accentDark transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="flex flex-col gap-4 ml-12 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5 relative">
                      <CornerDownRight size={16} className="absolute -left-6 top-2 text-gray-300" />
                      <div className="w-7 h-7 rounded-full bg-brand-accentDark text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {reply.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
                          <span className="font-bold text-brand-dark mr-2">{reply.author.name}</span>
                          <span className="text-gray-600 leading-relaxed">{reply.text}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1.5 ml-2 font-medium">{formatDate(reply.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Box */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleAddReply(e, comment.id)} className="ml-12 mt-3 flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-sm"
                  />
                  <button type="submit" disabled={!replyText.trim()} className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-primaryHover transition-colors shadow-sm">
                    <Send size={14} className="ml-0.5" />
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>

      {/* Main Comment Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 z-10 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleAddComment} className="relative flex items-center">
          <input
            type="text"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner"
          />
          <button type="submit" disabled={!newComment.trim()} className="absolute right-1.5 w-10 h-10 rounded-full bg-brand-accentDark text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-accent transition-colors shadow-sm">
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
