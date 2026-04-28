import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { removeRefreshToken } from '@/utils/storage';
import { authApi } from '@/api/authApi';
import { abortAllRequests } from '@/api/axiosClient';

export type UserRole = 'Staff' | 'Manager' | 'Director' | 'Admin';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  unit?: string;
  primary_unit_id?: number;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null; // In-memory token as requested
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setToken: (token: string) => void;
}

// Token is stored in memory (not persisted)
let inMemoryToken: string | null = null;
let hasFetchedLatestUser: boolean = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // This field in the state will be synced with inMemoryToken
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        inMemoryToken = token;
        hasFetchedLatestUser = true; // Mark as fetched right after login
        set({ user, token, isAuthenticated: true });
      },

      logout: async () => {
        console.log('Initiating non-blocking logout...');
        
        // 1. Immediately abort all pending API requests to free up browser connections
        abortAllRequests();

        // 2. Clear local state IMMEDIATELY (Optimistic)
        inMemoryToken = null;
        removeRefreshToken();
        localStorage.removeItem('accessToken');
        
        // 3. Update state to reflect unauthenticated status immediately
        set({ user: null, token: null, isAuthenticated: false });

        // 4. Fire background API call to invalidate session on server (don't await)
        authApi.logout().catch((error) => {
          console.warn('Background logout API failed (possibly already invalid):', error);
        });

        // 5. Force redirect to login page immediately
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
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
export const getHasFetchedLatestUser = () => hasFetchedLatestUser;
export const setHasFetchedLatestUserFlag = (val: boolean) => { hasFetchedLatestUser = val; };
