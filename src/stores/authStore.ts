/**
 * =====================================================
 * STORE ZUSTAND POUR L'AUTHENTIFICATION
 * =====================================================
 * Gestion centralisée de l'état d'authentification avec Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import authService, {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  User,
  ApiError
} from '../services/authService';
import { toast } from 'react-toastify';

// Interface pour l'état d'authentification
interface AuthState {
  // État des données
  user: User | null;
  isAuthenticated: boolean;

  // États de chargement
  loading: {
    login: boolean;
    register: boolean;
    logout: boolean;
    forgotPassword: boolean;
    resetPassword: boolean;
    profile: boolean;
    refreshToken: boolean;
  };

  // Erreurs
  error: ApiError | null;

  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;

  // Actions de profil
  getProfile: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;

  // Actions utilitaires
  checkAuth: () => void;
  clearError: () => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: {
    login: false,
    register: false,
    logout: false,
    forgotPassword: false,
    resetPassword: false,
    profile: false,
    refreshToken: false,
  },
  error: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ========== ACTIONS D'AUTHENTIFICATION ==========

        login: async (credentials: LoginCredentials) => {
          set((state) => {
            state.loading.login = true;
            state.error = null;
          });

          try {
            const response = await authService.login(credentials);

            if (!response.user) {
              set((state) => {
                state.loading.login = false;
              });
              toast.error('Connexion incomplète: aucune information utilisateur retournée.');
              return false;
            }

            set((state) => {
              state.user = response.user!;
              state.isAuthenticated = true;
              state.loading.login = false;
            });

            toast.success(`Bienvenue ${response.user.first_name || response.user.email} !`);
            return true;

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.login = false;
            });

            toast.error(error.message || 'Erreur lors de la connexion');
            return false;
          }
        },

        register: async (userData: RegisterData) => {
          set((state) => {
            state.loading.register = true;
            state.error = null;
          });

          try {
            const response = await authService.register(userData);

            if (!response.user) {
              set((state) => {
                state.loading.register = false;
                // On ne marque pas l'utilisateur comme connecté si aucune info user n'est renvoyée
              });
              toast.success('Compte créé avec succès ! Veuillez vérifier votre email pour activer votre compte.');
              return true;
            }

            set((state) => {
              state.user = response.user!;
              state.isAuthenticated = true;
              state.loading.register = false;
            });

            toast.success('Compte créé avec succès !');
            return true;

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.register = false;
            });

            toast.error(error.message || 'Erreur lors de l\'inscription');
            return false;
          }
        },

        logout: async () => {
          set((state) => {
            state.loading.logout = true;
          });

          try {
            await authService.logout();

            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.loading.logout = false;
              state.error = null;
            });

            toast.success('Déconnexion réussie');

          } catch (error: any) {
            set((state) => {
              state.loading.logout = false;
            });

            // Même si la déconnexion côté serveur échoue, on déconnecte côté client
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.error = null;
            });

            toast.warn('Déconnexion effectuée (erreur serveur)');
          }
        },

        forgotPassword: async (data: ForgotPasswordData) => {
          set((state) => {
            state.loading.forgotPassword = true;
            state.error = null;
          });

          try {
            const response = await authService.forgotPassword(data);

            set((state) => {
              state.loading.forgotPassword = false;
            });

            toast.success(response.message || 'Email de réinitialisation envoyé');
            return true;

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.forgotPassword = false;
            });

            toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
            return false;
          }
        },

        resetPassword: async (data: ResetPasswordData) => {
          set((state) => {
            state.loading.resetPassword = true;
            state.error = null;
          });

          try {
            const response = await authService.resetPassword(data);

            set((state) => {
              state.loading.resetPassword = false;
            });

            toast.success(response.message || 'Mot de passe réinitialisé avec succès');
            return true;

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.resetPassword = false;
            });

            toast.error(error.message || 'Erreur lors de la réinitialisation');
            return false;
          }
        },

        // ========== ACTIONS DE PROFIL ==========

        getProfile: async () => {
          set((state) => {
            state.loading.profile = true;
            state.error = null;
          });

          try {
            const user = await authService.getProfile();

            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.loading.profile = false;
            });

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.profile = false;
            });

            // Si l'obtention du profil échoue, déconnecter l'utilisateur
            if (error.status_code === 401) {
              get().clearAuth();
            }
          }
        },

        updateProfile: async (userData: Partial<User>) => {
          set((state) => {
            state.loading.profile = true;
            state.error = null;
          });

          try {
            const updatedUser = await authService.updateProfile(userData);

            set((state) => {
              state.user = updatedUser;
              state.loading.profile = false;
            });

            toast.success('Profil mis à jour avec succès');
            return true;

          } catch (error: any) {
            set((state) => {
              state.error = error;
              state.loading.profile = false;
            });

            toast.error(error.message || 'Erreur lors de la mise à jour du profil');
            return false;
          }
        },

        refreshToken: async () => {
          set((state) => {
            state.loading.refreshToken = true;
          });

          try {
            await authService.refreshToken();

            set((state) => {
              state.loading.refreshToken = false;
            });

            return true;

          } catch (error: any) {
            set((state) => {
              state.loading.refreshToken = false;
            });

            // Si le refresh échoue, déconnecter l'utilisateur
            get().clearAuth();
            return false;
          }
        },

        // ========== ACTIONS UTILITAIRES ==========

        checkAuth: () => {
          const isAuth = authService.isAuthenticated();
          const user = authService.getUser();

          set((state) => {
            state.isAuthenticated = isAuth;
            state.user = user;
          });

          // Si l'utilisateur est authentifié, récupérer son profil à jour
          if (isAuth && user) {
            get().getProfile();
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        clearAuth: () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            // Reset tous les états de loading
            Object.keys(state.loading).forEach(key => {
              state.loading[key as keyof typeof state.loading] = false;
            });
          });
        },

        setUser: (user: User) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        },
      })),
      {
        name: 'auth-store',
        // Persister seulement les données essentielles
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// =====================================================
// HOOKS PERSONNALISÉS POUR FACILITER L'UTILISATION
// =====================================================

// Hook pour récupérer l'utilisateur connecté
export const useUser = () => {
  return useAuthStore(state => state.user);
};

// Hook pour vérifier l'authentification
export const useIsAuthenticated = () => {
  return useAuthStore(state => state.isAuthenticated);
};

// Hook pour récupérer les états de chargement
export const useAuthLoading = () => {
  return useAuthStore(state => state.loading);
};

// Hook pour récupérer les erreurs d'authentification
export const useAuthError = () => {
  return useAuthStore(state => state.error);
};

// Hook pour les actions d'authentification
export const useAuthActions = () => {
  return useAuthStore(state => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    forgotPassword: state.forgotPassword,
    resetPassword: state.resetPassword,
    getProfile: state.getProfile,
    updateProfile: state.updateProfile,
    refreshToken: state.refreshToken,
    checkAuth: state.checkAuth,
    clearError: state.clearError,
    clearAuth: state.clearAuth,
  }));
};
