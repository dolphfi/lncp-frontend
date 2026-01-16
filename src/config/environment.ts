/**
 * =====================================================
 * CONFIGURATION DE L'ENVIRONNEMENT
 * =====================================================
 * Gestion centralisée des variables d'environnement
 */

// =====================================================
// TYPES POUR L'ENVIRONNEMENT
// =====================================================
export interface EnvironmentConfig {
  // API
  API_BASE_URL: string;
  API_TIMEOUT: number;

  // Application
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: 'development' | 'production' | 'test';

  // Authentification
  AUTH_TOKEN_KEY: string;
  AUTH_REFRESH_TOKEN_KEY: string;

  // Upload
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];

  // Pagination
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
}

// =====================================================
// CONFIGURATION PAR ENVIRONNEMENT
// =====================================================
const developmentConfig: EnvironmentConfig = {
  // API
  API_BASE_URL: process.env.REACT_APP_API_URL || '',


  API_TIMEOUT: 10000,

  // Application
  APP_NAME: 'LNCP Frontend',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  NODE_ENV: 'development',

  // Authentification
  AUTH_TOKEN_KEY: 'lncp_auth_token',
  AUTH_REFRESH_TOKEN_KEY: 'lncp_refresh_token',

  // Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

const productionConfig: EnvironmentConfig = {
  // API
  API_BASE_URL: process.env.REACT_APP_API_URL || '',

  API_TIMEOUT: 15000,

  // Application
  APP_NAME: 'LNCP Frontend',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  NODE_ENV: 'production',

  // Authentification
  AUTH_TOKEN_KEY: 'lncp_auth_token',
  AUTH_REFRESH_TOKEN_KEY: 'lncp_refresh_token',

  // Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

const testConfig: EnvironmentConfig = {
  // API
  API_BASE_URL: 'http://localhost:3001/api',
  API_TIMEOUT: 5000,

  // Application
  APP_NAME: 'LNCP Frontend (Test)',
  APP_VERSION: '1.0.0',
  NODE_ENV: 'test',

  // Authentification
  AUTH_TOKEN_KEY: 'lncp_auth_token_test',
  AUTH_REFRESH_TOKEN_KEY: 'lncp_refresh_token_test',

  // Upload
  MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png'],

  // Pagination
  DEFAULT_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 50
};

// =====================================================
// FONCTION POUR OBTENIR LA CONFIGURATION
// =====================================================
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  switch (nodeEnv) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// =====================================================
// CONFIGURATION EXPORTÉE
// =====================================================
export const config = getEnvironmentConfig();

// =====================================================
// UTILITAIRES
// =====================================================
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

export const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(config.AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(config.AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(config.AUTH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(config.AUTH_REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(config.AUTH_REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(config.AUTH_REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = (): void => {
  removeAuthToken();
  removeRefreshToken();
}; 