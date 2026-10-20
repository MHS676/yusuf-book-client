import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email) => set({ 
        isAuthenticated: true, 
        user: { email, name: email.split('@')[0] } 
      }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'pageturn-auth',
    }
  )
);
