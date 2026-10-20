import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useBookStore = create((set, get) => ({
  books: [],
  activeBookId: null,
  isLoading: false,
  error: null,

  fetchBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await apiClient.get('/books');
      set({
        books,
        activeBookId: get().activeBookId || (books.length > 0 ? books[0].id : null),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch books from backend:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  setActiveBook: (id) => set({ activeBookId: id }),

  addCustomBook: async (newBookData) => {
    set({ isLoading: true, error: null });
    try {
      const createdBook = await apiClient.post('/books', newBookData);
      
      const formattedBook = {
        ...createdBook,
        pages: Array.isArray(createdBook.pages) && typeof createdBook.pages[0] === 'object'
          ? createdBook.pages.map((p) => p.content)
          : createdBook.pages,
      };

      set((state) => ({
        books: [formattedBook, ...state.books],
        activeBookId: formattedBook.id,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to save book to backend:', err);
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteBook: async (id) => {
    try {
      await apiClient.delete(`/books/${id}`);
      set((state) => {
        const remaining = state.books.filter((b) => b.id !== id);
        return {
          books: remaining,
          activeBookId: state.activeBookId === id ? (remaining[0]?.id || null) : state.activeBookId,
        };
      });
    } catch (err) {
      console.error('Failed to delete book:', err);
    }
  },
}));
