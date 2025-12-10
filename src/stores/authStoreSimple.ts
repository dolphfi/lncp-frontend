/**
 * Store Zustand simplifié pour l'authentification
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { LoginCredentials, User, ApiError, AuthResponse } from '../services/authService';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse | null>;
  twoFactorLogin: (params: { userId: string; twoFactorCode: string }) => Promise<User | null>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (res?.twoFactorRequired) {
            set({ isLoading: false, isAuthenticated: false, user: null });
            return res;
          }

          if (res?.user) {
            set({ user: res.user, isAuthenticated: true, isLoading: false, error: null });
            toast.success(`Bienvenue ${res.user.first_name || res.user.email}`);
          } else {
            set({ isLoading: false });
          }

          return res;
        } catch (err) {
          const apiErr = err as ApiError;
          const msg = apiErr?.message || 'Erreur de connexion';
          set({ isLoading: false, error: msg, isAuthenticated: false, user: null });
          toast.error(msg);
          throw err;
        }
      },

      twoFactorLogin: async ({ userId, twoFactorCode }: { userId: string; twoFactorCode: string }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.twoFactorLogin({ userId, twoFactorCode });

          if (res.user) {
            set({ user: res.user, isAuthenticated: true, isLoading: false, error: null });
            return res.user;
          }

          set({ isLoading: false });
          return null;
        } catch (err) {
          const apiErr = err as ApiError;
          const msg = apiErr?.message || 'Erreur de connexion 2FA';
          set({ isLoading: false, error: msg, isAuthenticated: false, user: null });
          throw err;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, error: null });
        toast.success('Déconnexion réussie');
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const token = authService.getAccessToken();
        const user = authService.getUser();
        if (token && user) {
          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'lncp-auth-storage-simple',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
