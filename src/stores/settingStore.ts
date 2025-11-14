/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES PARAMÈTRES
 * =====================================================
 * Store centralisé pour gérer l'état des paramètres
 * système de l'institution
 */

import { create } from 'zustand';
import {
  Setting,
  SettingGroup,
  SettingFilters,
  SettingStats,
  CreateSettingDto,
  UpdateSettingDto,
  MaintenanceResponse,
  MaintenanceStatusResponse,
  MaintenancePublicStatusResponse,
} from '../types/setting';
import { settingService } from '../services/settings/settingService';

// =====================================================
// INTERFACE DU STORE
// =====================================================

interface SettingState {
  // Données
  allSettings: Setting[];                    // Tous les paramètres chargés
  settings: Setting[];                       // Paramètres filtrés pour l'affichage
  currentSetting: Setting | null;            // Paramètre sélectionné pour visualisation/édition
  
  // États UI
  loading: boolean;                          // Chargement en cours
  error: string | null;                      // Message d'erreur
  
  // Filtres
  filters: SettingFilters;                   // Filtres actifs
  
  // Statistiques
  stats: SettingStats;                       // Statistiques calculées
  
  // Mode Maintenance
  maintenanceMode: boolean;                  // État du mode maintenance
  maintenanceLoading: boolean;               // Chargement des actions maintenance
  maintenanceLastUpdated: string | null;     // Dernière mise à jour
  
  // Actions - Chargement des données
  fetchSettings: () => Promise<void>;
  fetchSettingsByGroup: (group: SettingGroup) => Promise<void>;
  fetchSettingById: (id: string) => Promise<Setting | null>;
  fetchSettingByKey: (key: string) => Promise<Setting | null>;
  
  // Actions - CRUD
  createSetting: (data: CreateSettingDto) => Promise<Setting>;
  updateSettingById: (id: string, data: UpdateSettingDto) => Promise<Setting>;
  updateSettingByKey: (key: string, data: UpdateSettingDto) => Promise<Setting>;
  deleteSetting: (id: string) => Promise<void>;
  
  // Actions - Upload de fichiers
  uploadLogo: (file: File, label: string, description?: string) => Promise<Setting>;
  uploadHeader: (file: File, label: string, description?: string) => Promise<Setting>;
  
  // Actions - Mode Maintenance
  enableMaintenance: () => Promise<MaintenanceResponse>;
  disableMaintenance: () => Promise<MaintenanceResponse>;
  fetchMaintenanceStatus: () => Promise<void>;
  fetchMaintenancePublicStatus: () => Promise<MaintenancePublicStatusResponse>;
  
  // Actions - Filtres et recherche
  setFilters: (filters: Partial<SettingFilters>) => void;
  clearFilters: () => void;
  applyFiltersLocally: () => void;
  
  // Actions - Utilitaires
  calculateStats: () => void;
  clearError: () => void;
}

// =====================================================
// CRÉATION DU STORE
// =====================================================

export const useSettingStore = create<SettingState>((set, get) => ({
  // État initial
  allSettings: [],
  settings: [],
  currentSetting: null,
  loading: false,
  error: null,
  filters: {},
  stats: {
    total: 0,
    byGroup: {
      GENERAL: 0,
      FINANCIER: 0,
      COMMUNICATION: 0,
      ACADEMIQUE: 0,
    },
  },
  maintenanceMode: false,
  maintenanceLoading: false,
  maintenanceLastUpdated: null,

  // =====================================================
  // ACTIONS - CHARGEMENT DES DONNÉES
  // =====================================================

  /**
   * Charger tous les paramètres
   */
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await settingService.getAllSettings();
      const settingsData = response.data || [];
      
      set({ 
        allSettings: settingsData, 
        loading: false 
      });
      
      get().calculateStats();
      get().applyFiltersLocally();
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des paramètres', 
        loading: false 
      });
    }
  },

  /**
   * Charger les paramètres d'un groupe spécifique
   */
  fetchSettingsByGroup: async (group: SettingGroup) => {
    set({ loading: true, error: null });
    try {
      const settingsData = await settingService.getSettingsByGroup(group);
      
      set({ 
        settings: settingsData, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des paramètres', 
        loading: false 
      });
    }
  },

  /**
   * Charger un paramètre par son ID
   */
  fetchSettingById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const setting = await settingService.getSettingById(id);
      set({ currentSetting: setting, loading: false });
      return setting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement du paramètre', 
        loading: false 
      });
      return null;
    }
  },

  /**
   * Charger un paramètre par sa clé
   */
  fetchSettingByKey: async (key: string) => {
    set({ loading: true, error: null });
    try {
      const setting = await settingService.getSettingByKey(key);
      set({ currentSetting: setting, loading: false });
      return setting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement du paramètre', 
        loading: false 
      });
      return null;
    }
  },

  // =====================================================
  // ACTIONS - CRUD
  // =====================================================

  /**
   * Créer un nouveau paramètre
   */
  createSetting: async (data: CreateSettingDto) => {
    set({ loading: true, error: null });
    try {
      const newSetting = await settingService.createSetting(data);
      
      set((state) => ({
        allSettings: [newSetting, ...state.allSettings],
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return newSetting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la création du paramètre', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Mettre à jour un paramètre par son ID
   */
  updateSettingById: async (id: string, data: UpdateSettingDto) => {
    set({ loading: true, error: null });
    try {
      const updatedSetting = await settingService.updateSettingById(id, data);
      
      set((state) => ({
        allSettings: state.allSettings.map((s) =>
          s.id === id ? updatedSetting : s
        ),
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return updatedSetting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la mise à jour du paramètre', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Mettre à jour un paramètre par sa clé
   */
  updateSettingByKey: async (key: string, data: UpdateSettingDto) => {
    set({ loading: true, error: null });
    try {
      const updatedSetting = await settingService.updateSettingByKey(key, data);
      
      set((state) => ({
        allSettings: state.allSettings.map((s) =>
          s.key === key ? updatedSetting : s
        ),
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return updatedSetting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la mise à jour du paramètre', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Supprimer un paramètre
   */
  deleteSetting: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await settingService.deleteSetting(id);
      
      set((state) => ({
        allSettings: state.allSettings.filter((s) => s.id !== id),
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de la suppression du paramètre', 
        loading: false 
      });
      throw error;
    }
  },

  // =====================================================
  // ACTIONS - UPLOAD DE FICHIERS
  // =====================================================

  /**
   * Upload du logo de l'école
   */
  uploadLogo: async (file: File, label: string, description?: string) => {
    set({ loading: true, error: null });
    try {
      const newSetting = await settingService.uploadLogo(file, label, description);
      
      set((state) => ({
        allSettings: state.allSettings.some((s) => s.key === 'SCHOOL_LOGO_URL')
          ? state.allSettings.map((s) =>
              s.key === 'SCHOOL_LOGO_URL' ? newSetting : s
            )
          : [newSetting, ...state.allSettings],
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return newSetting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de l\'upload du logo', 
        loading: false 
      });
      throw error;
    }
  },

  /**
   * Upload de l'en-tête de l'école
   */
  uploadHeader: async (file: File, label: string, description?: string) => {
    set({ loading: true, error: null });
    try {
      const newSetting = await settingService.uploadHeader(file, label, description);
      
      set((state) => ({
        allSettings: state.allSettings.some((s) => s.key === 'SCHOOL_ENTETE_URL')
          ? state.allSettings.map((s) =>
              s.key === 'SCHOOL_ENTETE_URL' ? newSetting : s
            )
          : [newSetting, ...state.allSettings],
        loading: false,
      }));
      
      get().calculateStats();
      get().applyFiltersLocally();
      
      return newSetting;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors de l\'upload de l\'en-tête', 
        loading: false 
      });
      throw error;
    }
  },

  // =====================================================
  // ACTIONS - MODE MAINTENANCE
  // =====================================================

  /**
   * Activer le mode maintenance
   */
  enableMaintenance: async () => {
    set({ maintenanceLoading: true, error: null });
    try {
      const response = await settingService.enableMaintenance();
      
      set({
        maintenanceMode: response.maintenanceMode,
        maintenanceLoading: false,
        maintenanceLastUpdated: new Date().toISOString(),
      });
      
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de l\'activation du mode maintenance',
        maintenanceLoading: false,
      });
      throw error;
    }
  },

  /**
   * Désactiver le mode maintenance
   */
  disableMaintenance: async () => {
    set({ maintenanceLoading: true, error: null });
    try {
      const response = await settingService.disableMaintenance();
      
      set({
        maintenanceMode: response.maintenanceMode,
        maintenanceLoading: false,
        maintenanceLastUpdated: new Date().toISOString(),
      });
      
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de la désactivation du mode maintenance',
        maintenanceLoading: false,
      });
      throw error;
    }
  },

  /**
   * Récupérer le statut du mode maintenance
   */
  fetchMaintenanceStatus: async () => {
    set({ maintenanceLoading: true, error: null });
    try {
      const response = await settingService.getMaintenanceStatus();
      
      set({
        maintenanceMode: response.maintenanceMode,
        maintenanceLastUpdated: response.lastUpdated || null,
        maintenanceLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de la récupération du statut',
        maintenanceLoading: false,
      });
    }
  },

  /**
   * Récupérer le statut public du mode maintenance
   */
  fetchMaintenancePublicStatus: async () => {
    try {
      const response = await settingService.getMaintenancePublicStatus();
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // =====================================================
  // ACTIONS - FILTRES ET RECHERCHE
  // =====================================================

  /**
   * Définir les filtres
   */
  setFilters: (newFilters: Partial<SettingFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFiltersLocally();
  },

  /**
   * Réinitialiser les filtres
   */
  clearFilters: () => {
    set({ filters: {} });
    get().applyFiltersLocally();
  },

  /**
   * Appliquer les filtres localement (côté client)
   */
  applyFiltersLocally: () => {
    const { allSettings, filters } = get();
    let filtered = [...allSettings];

    // Filtrer par groupe
    if (filters.group) {
      filtered = filtered.filter((s) => s.group === filters.group);
    }

    // Filtrer par recherche (key, label, description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.key.toLowerCase().includes(searchLower) ||
          s.label.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      );
    }

    set({ settings: filtered });
  },

  // =====================================================
  // ACTIONS - UTILITAIRES
  // =====================================================

  /**
   * Calculer les statistiques
   */
  calculateStats: () => {
    const { allSettings } = get();

    const stats: SettingStats = {
      total: allSettings.length,
      byGroup: {
        GENERAL: allSettings.filter((s) => s.group === 'GENERAL').length,
        FINANCIER: allSettings.filter((s) => s.group === 'FINANCIER').length,
        COMMUNICATION: allSettings.filter((s) => s.group === 'COMMUNICATION').length,
        ACADEMIQUE: allSettings.filter((s) => s.group === 'ACADEMIQUE').length,
      },
    };

    set({ stats });
  },

  /**
   * Effacer l'erreur
   */
  clearError: () => {
    set({ error: null });
  },
}));
