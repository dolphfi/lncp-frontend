/**
 * Store Zustand simplifié pour l'authentification
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { LoginCredentials, User, ApiError } from '../services/authService';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
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

          set({ user: res.user, isAuthenticated: true, isLoading: false, error: null });
          toast.success(`Bienvenue ${res.user.first_name || res.user.email}`);
        } catch (err) {
          const apiErr = err as ApiError;
          const msg = apiErr?.message || 'Erreur de connexion';
          set({ isLoading: false, error: msg, isAuthenticated: false, user: null });
          toast.error(msg);
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
