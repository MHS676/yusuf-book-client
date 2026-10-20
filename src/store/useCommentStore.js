import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

export const useCommentStore = create(
  persist(
    (set) => ({
      comments: [],
      
      addComment: (bookId, text) => set((state) => {
        // Fallback to a Guest user if not logged in
        const user = useAuthStore.getState().user || { name: 'Guest Reader', email: 'guest@example.com' };
        const newComment = {
          id: Date.now().toString(),
          bookId,
          author: user,
          text,
          date: new Date().toISOString(),
          replies: []
        };
        return { comments: [...state.comments, newComment] };
      }),

      addReply: (commentId, text) => set((state) => {
        const user = useAuthStore.getState().user || { name: 'Guest Reader', email: 'guest@example.com' };
        const newReply = {
          id: Date.now().toString(),
          author: user,
          text,
          date: new Date().toISOString()
        };
        
        return {
          comments: state.comments.map(c => 
            c.id === commentId 
              ? { ...c, replies: [...c.replies, newReply] }
              : c
          )
        };
      })
    }),
    {
      name: 'pageturn-comments',
    }
  )
);
