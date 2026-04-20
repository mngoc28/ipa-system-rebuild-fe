import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { removeRefreshToken } from '@/utils/storage';
import { authApi } from '@/api/authApi';

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
        try {
          if (inMemoryToken) {
            console.log('Logging out from server...');
            await authApi.logout();
          }
        } catch (error) {
          console.error('Logout API error (possibly session already invalid):', error);
        } finally {
          console.log('Clearing local auth state...');
          inMemoryToken = null;
          removeRefreshToken();
          // Also clear access token from storage to be safe
          localStorage.removeItem('accessToken');
          set({ user: null, token: null, isAuthenticated: false });
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
