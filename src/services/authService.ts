/**
 * =====================================================
 * SERVICE D'AUTHENTIFICATION
 * =====================================================
 * Service pour gérer l'authentification avec l'API backend
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/environment';
import { toast } from 'react-toastify';

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

// =============================================
// UTILITAIRES JWT
// =============================================
function base64UrlDecode(input: string): string {
  // Remplacer les caractères URL-safe
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Ajouter du padding si nécessaire
  const pad = base64.length % 4 === 2 ? '==' : base64.length % 4 === 3 ? '=' : '';
  const str = atob(base64 + pad);
  try {
    // Convertir de bytes en UTF-8 string
    return decodeURIComponent(
      str
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return str;
  }
}

function decodeJwtPayload<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email?: string; // optionnel côté front, non utilisé côté API
  password: string; // sera envoyé en tant que newPassword au backend
  password_confirmation?: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
  twoFactorRequired?: boolean;
  twoFactorUserId?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  permissions: string[];
  avatar?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TrustedDevice {
  id: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
  trustedAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

// Configuration de l'instance axios pour l'authentification
const authApi = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur requête (no-op ici, l'ajout du header se fait dans le constructeur)
authApi.interceptors.request.use((config: any) => config);

class AuthService {
  private refreshTimer: number | null = null;
  private refreshingPromise: Promise<string> | null = null;

  // Attacher header Authorization de manière sûre
  private attachAuth(config: any): any {
    const token = this.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  }

  constructor() {
    // Intercepteur requête pour ajouter l'Authorization
    authApi.interceptors.request.use((config) => this.attachAuth(config));

    // Intercepteur réponse pour gérer 401 et tenter un refresh
    authApi.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const url = originalRequest?.url || '';

        // Ne pas tenter de refresh pour les erreurs 401 sur les endpoints d'auth initiaux
        const isAuthInitialEndpoint =
          url.includes('/auth/login') ||
          url.includes('/auth/2fa/login') ||
          url.includes('/auth/register') ||
          url.includes('/auth/forgot-password') ||
          url.includes('/auth/reset-password');

        if (status === 401 && !originalRequest._retry && !isAuthInitialEndpoint) {
          originalRequest._retry = true;
          try {
            await this.refreshToken();
            // Réattacher le nouveau token et rejouer la requête
            this.attachAuth(originalRequest);
            return authApi.request(originalRequest);
          } catch (refreshErr) {
            // Échec du refresh -> nettoyage et propagation
            toast.error('Votre session a expiré, veuillez vous reconnecter.');
            this.clearAuth();
          }
        }

        if ((error as any).response?.data) {
          const apiError: ApiError = {
            message: (error as any).response.data.message || 'Une erreur est survenue',
            errors: (error as any).response.data.errors,
            status_code: (error as any).response.status,
          };
          return Promise.reject(apiError);
        }
        return Promise.reject({ message: 'Erreur de connexion au serveur', status_code: 0 } as ApiError);
      }
    );
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<any> = await authApi.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      console.log('AuthService - Réponse login:', response.data);

      if (response.data && response.data.message === 'TWO_FACTOR_AUTHENTICATION_REQUIRED') {
        const twoFactorResponse: AuthResponse = {
          twoFactorRequired: true,
          twoFactorUserId: response.data.userId,
        };
        return twoFactorResponse;
      }

      const data: AuthResponse = response.data;

      // Stocker les tokens
      this.setTokens(data.access_token!, data.refresh_token!);

      // Déduire le user depuis le token si non fourni par l'API
      if (!data.user) {
        const payload = decodeJwtPayload<{ sub?: string; email?: string; role?: string }>(data.access_token);
        if (payload) {
          data.user = {
            id: payload.sub || '',
            email: payload.email || credentials.email,
            first_name: '',
            last_name: '',
            role: payload.role || 'USER',
            is_active: true,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
        } else {
          // Fallback minimal
          data.user = {
            id: '',
            email: credentials.email,
            first_name: '',
            last_name: '',
            role: 'USER',
            is_active: true,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
        }
      }

      // Persister le user déduit ou retourné par l'API
      if (data.user) {
        this.setUser(data.user);
      }

      // Programmer auto-refresh
      this.ensureAutoRefresh();

      return data;
    } catch (error) {
      throw error;
    }
  }

  async setup2FA(): Promise<{ qrCodeDataUrl: string; backupCodes: string[] }> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response: AxiosResponse<{ qrCodeDataUrl: string; backupCodes: string[] }> = await authApi.get('/auth/2fa/setup');
    return response.data;
  }

  async enable2FA(twoFactorCode: string): Promise<{ message: string }> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response: AxiosResponse<{ message: string }> = await authApi.post('/auth/2fa/enable', {
      twoFactorCode,
    });
    return response.data;
  }

  async disable2FA(): Promise<{ message: string }> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response: AxiosResponse<{ message: string }> = await authApi.post('/auth/2fa/disable');
    return response.data;
  }

  async twoFactorLogin(params: { userId: string; twoFactorCode: string }): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/auth/2fa/login', {
        userId: params.userId,
        twoFactorCode: params.twoFactorCode,
      });

      const data: AuthResponse = response.data;

      this.setTokens(data.access_token!, data.refresh_token!);

      if (!data.user) {
        const payload = decodeJwtPayload<{ sub?: string; email?: string; role?: string }>(data.access_token);
        if (payload) {
          data.user = {
            id: payload.sub || '',
            email: payload.email || '',
            first_name: '',
            last_name: '',
            role: payload.role || 'USER',
            is_active: true,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User;
        }
      }

      if (data.user) {
        this.setUser(data.user);
      }

      this.ensureAutoRefresh();

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/auth/register', userData);
      const data = response.data;

      if (data.access_token && data.refresh_token) {
        this.setTokens(data.access_token, data.refresh_token);
        this.ensureAutoRefresh();
      }

      if (data.user) {
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await authApi.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      // Même si la déconnexion côté serveur échoue, on nettoie le local storage
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response: AxiosResponse<RefreshTokenResponse> = await authApi.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Mettre à jour le token d'accès
      this.setAccessToken(response.data.access_token);
      // Reprogrammer le refresh
      this.scheduleRefreshFromAccessToken(response.data.access_token);

      return response.data.access_token;
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      toast.error('Votre session a expiré, veuillez vous reconnecter.');
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Mot de passe oublié
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(data: ResetPasswordData | { token: string; newPassword: string }): Promise<{ message: string }> {
    try {
      const payload = (data as any).newPassword !== undefined
        ? { token: (data as any).token, newPassword: (data as any).newPassword }
        : { token: (data as ResetPasswordData).token, newPassword: (data as ResetPasswordData).password };

      const response = await authApi.post('/auth/reset-password', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtenir le profil utilisateur actuel
   */
  async getProfile(): Promise<User> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('Aucun token d\'accès disponible');
      }

      const response: AxiosResponse<User> = await authApi.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour les informations utilisateur
      this.setUser(response.data);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtenir les informations du profil de l'utilisateur connecté (/users/me)
   */
  async getMe(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response = await authApi.get('/users/me');
    return response.data;
  }

  /**
   * Appareils de confiance de l'utilisateur connecté
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response: AxiosResponse<TrustedDevice[]> = await authApi.get('/users/me/trusted-devices');
    return response.data;
  }

  async removeTrustedDevice(deviceId: string): Promise<TrustedDevice[]> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const response: AxiosResponse<TrustedDevice[]> = await authApi.delete(`/users/me/trusted-devices/${deviceId}`);
    return response.data;
  }

  async clearTrustedDevices(): Promise<void> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    await authApi.delete('/users/me/trusted-devices');
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté (/users/me)
   */
  async updateMe(data: Partial<{ firstName: string; lastName: string; phone?: string; bio?: string; avatar?: File }>): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }
    const form = new FormData();
    if (data.firstName !== undefined) form.append('firstName', data.firstName);
    if (data.lastName !== undefined) form.append('lastName', data.lastName);
    if (data.phone !== undefined) form.append('phone', data.phone);
    if (data.bio !== undefined) form.append('bio', data.bio);
    if (data.avatar) form.append('avatar', data.avatar);

    const response = await authApi.patch('/users/me', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Changer le mot de passe de l'utilisateur connecté
   */
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Aucun token d\'accès disponible');
    }

    const response = await authApi.patch('/users/me/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmPassword,
    });
    return response.data;
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('Aucun token d\'accès disponible');
      }

      const response: AxiosResponse<User> = await authApi.put('/auth/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour les informations utilisateur
      this.setUser(response.data);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * ----- AUTO REFRESH MANAGEMENT -----
   */
  private getTokenExpiry(accessToken?: string): number | null {
    const token = accessToken || this.getAccessToken();
    const payload = decodeJwtPayload<{ exp?: number }>(token || undefined);
    return payload?.exp ? payload.exp * 1000 : null; // ms
  }

  private scheduleRefreshFromAccessToken(accessToken?: string) {
    const expMs = this.getTokenExpiry(accessToken);
    if (!expMs) return;

    const now = Date.now();
    // rafraîchir 60s avant expiration, minimum 5s
    const skewMs = 60 * 1000;
    let delay = expMs - now - skewMs;
    // Si déjà expiré (ou quasi), déclencher un logout immédiat
    if (expMs <= now) {
      toast.error('Votre session a expiré, veuillez vous reconnecter.');
      this.clearAuth();
      return;
    }
    if (delay < 5000) delay = 5000;

    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.refreshTimer = window.setTimeout(async () => {
      try {
        if (!this.refreshingPromise) {
          this.refreshingPromise = this.refreshToken();
        }
        await this.refreshingPromise;
      } catch {
        // ignore, handled in refreshToken
      } finally {
        this.refreshingPromise = null;
      }
    }, delay);
  }

  ensureAutoRefresh() {
    const token = this.getAccessToken();
    if (token) {
      this.scheduleRefreshFromAccessToken(token);
    }
  }

  isAccessTokenExpired(): boolean {
    const expMs = this.getTokenExpiry();
    return expMs !== null ? Date.now() >= expMs : true;
  }

  handleResumeFromBackground() {
    // Appelé lors d'un retour d'activité (focus/visibilitychange)
    const token = this.getAccessToken();
    if (!token) return;
    if (this.isAccessTokenExpired()) {
      // Token expiré pendant l'inactivité -> logout technique
      toast.error('Votre session a expiré, veuillez vous reconnecter.');
      this.clearAuth();
      return;
    }
    // Sinon, reprogrammer un refresh si nécessaire
    this.scheduleRefreshFromAccessToken(token);
  }

  /**
   * Obtenir le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem(config.AUTH_TOKEN_KEY);
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(config.AUTH_REFRESH_TOKEN_KEY);
  }

  /**
   * Obtenir les informations utilisateur
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Stocker les tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(config.AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(config.AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Stocker le token d'accès
   */
  private setAccessToken(accessToken: string): void {
    localStorage.setItem(config.AUTH_TOKEN_KEY, accessToken);
  }

  /**
   * Stocker les informations utilisateur
   */
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  private clearAuth(): void {
    localStorage.removeItem(config.AUTH_TOKEN_KEY);
    localStorage.removeItem(config.AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated'); // Pour la compatibilité avec l'ancien système
    try {
      document.dispatchEvent(new CustomEvent('auth:cleared'));
    } catch { }
  }
}

export const authService = new AuthService();
export default authService;
