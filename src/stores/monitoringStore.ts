/**
 * =====================================================
 * STORE ZUSTAND POUR LE MONITORING
 * =====================================================
 * Store de gestion des données de monitoring en temps réel
 * Complète AdminPanel avec surveillance système avancée
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  SystemMetrics,
  ApplicationMetrics,
  Alert,
  ServiceHealth,
  PerformanceMetric,
  SystemEvent,
  MonitoringConfig,
  MonitoringStats,
  HistoricalData,
  MonitoringFilters,
  AlertSeverity,
  AlertStatus,
  AlertCategory,
  ServiceStatus
} from '../types/monitoring';

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface MonitoringStore {
  // États des données
  systemMetrics: SystemMetrics | null;
  applicationMetrics: ApplicationMetrics | null;
  alerts: Alert[];
  services: ServiceHealth[];
  performanceMetrics: PerformanceMetric[];
  systemEvents: SystemEvent[];
  historicalData: HistoricalData[];
  stats: MonitoringStats | null;
  config: MonitoringConfig;
  
  // États de l'interface
  loading: boolean;
  error: string | null;
  isRealTimeEnabled: boolean;
  filters: MonitoringFilters;
  
  // Actions de données
  fetchSystemMetrics: () => Promise<void>;
  fetchApplicationMetrics: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchPerformanceMetrics: () => Promise<void>;
  fetchSystemEvents: () => Promise<void>;
  fetchHistoricalData: (period: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // Actions d'alertes
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  createAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => Promise<void>;
  
  // Actions de services
  restartService: (serviceId: string) => Promise<void>;
  stopService: (serviceId: string) => Promise<void>;
  startService: (serviceId: string) => Promise<void>;
  
  // Actions de configuration
  updateConfig: (config: Partial<MonitoringConfig>) => Promise<void>;
  
  // Actions d'interface
  setFilters: (filters: Partial<MonitoringFilters>) => void;
  clearFilters: () => void;
  setRealTimeEnabled: (enabled: boolean) => void;
  clearError: () => void;
  
  // Actions utilitaires
  refreshAllData: () => Promise<void>;
  exportData: (type: 'alerts' | 'events' | 'metrics') => Promise<void>;
}

// =====================================================
// DONNÉES MOCK POUR LE DÉVELOPPEMENT
// =====================================================
const mockSystemMetrics: SystemMetrics = {
  id: '1',
  timestamp: new Date().toISOString(),
  cpu: {
    usage: 45.2,
    cores: 8,
    temperature: 65
  },
  memory: {
    used: 6144,
    total: 16384,
    percentage: 37.5
  },
  disk: {
    used: 250,
    total: 500,
    percentage: 50.0
  },
  network: {
    bytesIn: 1024000,
    bytesOut: 512000,
    packetsIn: 1500,
    packetsOut: 1200
  }
};

const mockApplicationMetrics: ApplicationMetrics = {
  id: '1',
  timestamp: new Date().toISOString(),
  activeUsers: 127,
  totalSessions: 1543,
  averageResponseTime: 245,
  requestsPerMinute: 850,
  errorRate: 0.8,
  databaseConnections: 12,
  cacheHitRate: 94.2
};

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Utilisation CPU élevée',
    message: 'L\'utilisation du CPU dépasse 80% depuis 5 minutes',
    severity: 'high',
    status: 'active',
    category: 'system',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source: 'CPU Monitor',
    threshold: 80,
    currentValue: 85.3
  },
  {
    id: '2',
    title: 'Temps de réponse lent',
    message: 'Le temps de réponse moyen dépasse 500ms',
    severity: 'medium',
    status: 'acknowledged',
    category: 'performance',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    source: 'Response Time Monitor',
    threshold: 500,
    currentValue: 650,
    acknowledgedBy: 'admin'
  },
  {
    id: '3',
    title: 'Connexion base de données échouée',
    message: 'Impossible de se connecter à la base de données principale',
    severity: 'critical',
    status: 'resolved',
    category: 'system',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    resolvedAt: new Date(Date.now() - 900000).toISOString(),
    source: 'Database Monitor'
  }
];

const mockServices: ServiceHealth[] = [
  {
    id: '1',
    name: 'API Principal',
    status: 'running',
    uptime: 2592000, // 30 jours
    lastCheck: new Date().toISOString(),
    responseTime: 120,
    version: '1.2.3',
    endpoint: '/api/health'
  },
  {
    id: '2',
    name: 'Base de données',
    status: 'running',
    uptime: 5184000, // 60 jours
    lastCheck: new Date().toISOString(),
    responseTime: 45,
    version: '14.2'
  },
  {
    id: '3',
    name: 'Service de cache',
    status: 'error',
    uptime: 0,
    lastCheck: new Date().toISOString(),
    version: '6.2.1'
  },
  {
    id: '4',
    name: 'Service de notifications',
    status: 'maintenance',
    uptime: 86400, // 1 jour
    lastCheck: new Date().toISOString(),
    responseTime: 200,
    version: '2.1.0'
  }
];

const mockSystemEvents: SystemEvent[] = [
  {
    id: '1',
    type: 'info',
    title: 'Démarrage du système',
    description: 'Le système de monitoring a été démarré avec succès',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    source: 'System',
    severity: 'low'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Tentative de connexion suspecte',
    description: 'Plusieurs tentatives de connexion échouées détectées',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: 'Security',
    severity: 'medium',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    type: 'error',
    title: 'Erreur de sauvegarde',
    description: 'La sauvegarde automatique a échoué',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    source: 'Backup Service',
    severity: 'high'
  }
];

const mockStats: MonitoringStats = {
  totalAlerts: 15,
  activeAlerts: 3,
  criticalAlerts: 1,
  systemUptime: 2592000, // 30 jours
  averageResponseTime: 245,
  totalEvents: 127,
  servicesUp: 3,
  servicesDown: 1,
  lastUpdate: new Date().toISOString()
};

const defaultConfig: MonitoringConfig = {
  refreshInterval: 30000, // 30 secondes
  alertThresholds: {
    cpu: 80,
    memory: 85,
    disk: 90,
    responseTime: 500,
    errorRate: 5
  },
  retentionPeriod: 30, // 30 jours
  enableRealTimeAlerts: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false
};

// =====================================================
// CRÉATION DU STORE
// =====================================================
export const useMonitoringStore = create<MonitoringStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // États initiaux
      systemMetrics: null,
      applicationMetrics: null,
      alerts: [],
      services: [],
      performanceMetrics: [],
      systemEvents: [],
      historicalData: [],
      stats: null,
      config: defaultConfig,
      loading: false,
      error: null,
      isRealTimeEnabled: true,
      filters: {},

      // Actions de récupération des données
      fetchSystemMetrics: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Simulation d'appel API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => {
            state.systemMetrics = {
              ...mockSystemMetrics,
              timestamp: new Date().toISOString(),
              cpu: {
                ...mockSystemMetrics.cpu,
                usage: Math.random() * 100
              },
              memory: {
                ...mockSystemMetrics.memory,
                percentage: Math.random() * 100
              }
            };
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des métriques système';
            state.loading = false;
          });
        }
      },

      fetchApplicationMetrics: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set((state) => {
            state.applicationMetrics = {
              ...mockApplicationMetrics,
              timestamp: new Date().toISOString(),
              activeUsers: Math.floor(Math.random() * 200) + 50,
              averageResponseTime: Math.floor(Math.random() * 500) + 100
            };
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des métriques application';
            state.loading = false;
          });
        }
      },

      fetchAlerts: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          set((state) => {
            state.alerts = mockAlerts;
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des alertes';
            state.loading = false;
          });
        }
      },

      fetchServices: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 350));
          
          set((state) => {
            state.services = mockServices.map(service => ({
              ...service,
              lastCheck: new Date().toISOString()
            }));
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des services';
            state.loading = false;
          });
        }
      },

      fetchPerformanceMetrics: async () => {
        // Implementation similaire
        set((state) => {
          state.loading = false;
        });
      },

      fetchSystemEvents: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set((state) => {
            state.systemEvents = mockSystemEvents;
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des événements';
            state.loading = false;
          });
        }
      },

      fetchHistoricalData: async (period: string) => {
        // Implementation pour les données historiques
        set((state) => {
          state.loading = false;
        });
      },

      fetchStats: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set((state) => {
            state.stats = {
              ...mockStats,
              lastUpdate: new Date().toISOString()
            };
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la récupération des statistiques';
            state.loading = false;
          });
        }
      },

      // Actions d'alertes
      acknowledgeAlert: async (alertId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            if (alert) {
              alert.status = 'acknowledged';
              alert.acknowledgedBy = 'admin'; // À remplacer par l'utilisateur connecté
            }
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de l\'accusé de réception de l\'alerte';
          });
        }
      },

      resolveAlert: async (alertId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set((state) => {
            const alert = state.alerts.find(a => a.id === alertId);
            if (alert) {
              alert.status = 'resolved';
              alert.resolvedAt = new Date().toISOString();
            }
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la résolution de l\'alerte';
          });
        }
      },

      createAlert: async (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set((state) => {
            const newAlert: Alert = {
              ...alertData,
              id: Date.now().toString(),
              timestamp: new Date().toISOString()
            };
            state.alerts.unshift(newAlert);
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la création de l\'alerte';
          });
        }
      },

      // Actions de services
      restartService: async (serviceId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set((state) => {
            const service = state.services.find(s => s.id === serviceId);
            if (service) {
              service.status = 'running';
              service.uptime = 0;
              service.lastCheck = new Date().toISOString();
            }
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors du redémarrage du service';
          });
        }
      },

      stopService: async (serviceId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set((state) => {
            const service = state.services.find(s => s.id === serviceId);
            if (service) {
              service.status = 'stopped';
              service.uptime = 0;
              service.lastCheck = new Date().toISOString();
            }
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de l\'arrêt du service';
          });
        }
      },

      startService: async (serviceId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set((state) => {
            const service = state.services.find(s => s.id === serviceId);
            if (service) {
              service.status = 'running';
              service.uptime = 0;
              service.lastCheck = new Date().toISOString();
            }
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors du démarrage du service';
          });
        }
      },

      // Actions de configuration
      updateConfig: async (configUpdate: Partial<MonitoringConfig>) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set((state) => {
            state.config = { ...state.config, ...configUpdate };
          });
        } catch (error) {
          set((state) => {
            state.error = 'Erreur lors de la mise à jour de la configuration';
          });
        }
      },

      // Actions d'interface
      setFilters: (filters: Partial<MonitoringFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },

      setRealTimeEnabled: (enabled: boolean) => {
        set((state) => {
          state.isRealTimeEnabled = enabled;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Actions utilitaires
      refreshAllData: async () => {
        const { 
          fetchSystemMetrics, 
          fetchApplicationMetrics, 
          fetchAlerts, 
          fetchServices, 
          fetchSystemEvents, 
          fetchStats 
        } = get();

        await Promise.all([
          fetchSystemMetrics(),
          fetchApplicationMetrics(),
          fetchAlerts(),
          fetchServices(),
          fetchSystemEvents(),
          fetchStats()
        ]);
      },

      exportData: async (type: 'alerts' | 'events' | 'metrics') => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulation d'export
          console.log(`Export des données ${type} terminé`);
        } catch (error) {
          set((state) => {
            state.error = `Erreur lors de l'export des ${type}`;
          });
        }
      }
    }))
  )
);