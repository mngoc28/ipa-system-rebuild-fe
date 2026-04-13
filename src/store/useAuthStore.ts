import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'Staff' | 'Manager' | 'Director' | 'Admin';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  unit?: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null; // In-memory token as requested
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setToken: (token: string) => void;
}

// Token is stored in memory (not persisted)
let inMemoryToken: string | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // This field in the state will be synced with inMemoryToken
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        inMemoryToken = token;
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        inMemoryToken = null;
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setToken: (token) => {
        inMemoryToken = token;
        set({ token });
      },
    }),
    {
      name: 'ipa-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the user info, NOT the token as per "token lưu trong memory"
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Helper to get token outside of hooks
export const getAuthToken = () => inMemoryToken;
