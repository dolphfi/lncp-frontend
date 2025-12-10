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
import monitoringService from '../services/monitoring/monitoringService';
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
  ServiceStatus,
  NetworkHealth,
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
  networkHealth: NetworkHealth | null;
  config: MonitoringConfig;
  eventsPage: number;
  hasMoreEvents: boolean;

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
  loadMoreEvents: () => Promise<void>;
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

const mapSystemMetricsFromApi = (metrics: any): SystemMetrics => {
  const cpuUsage = metrics?.system?.cpu?.usagePercent ?? 0;
  const cores = metrics?.system?.cpu?.cores ?? 1;
  const temperature = metrics?.system?.cpu?.temperatureC;

  const usedGb = metrics?.system?.memory?.usedGb ?? 0;
  const totalGb = metrics?.system?.memory?.totalGb ?? 1;
  const usedMb = usedGb * 1024;
  const totalMb = totalGb * 1024;
  const memoryPercent = totalMb > 0 ? (usedMb / totalMb) * 100 : 0;

  const diskUsed = metrics?.system?.disk?.usedGb ?? 0;
  const diskTotal = metrics?.system?.disk?.totalGb ?? 1;
  const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

  const net = metrics?.system?.network ?? {};

  return {
    id: 'system',
    timestamp: metrics?.timestamp ?? new Date().toISOString(),
    cpu: {
      usage: Number(cpuUsage.toFixed(1)),
      cores,
      temperature,
    },
    memory: {
      used: Math.round(usedMb),
      total: Math.round(totalMb),
      percentage: Number(memoryPercent.toFixed(1)),
    },
    disk: {
      used: diskUsed,
      total: diskTotal,
      percentage: Number(diskPercent.toFixed(1)),
    },
    network: {
      bytesIn: (net.incomingKb ?? 0) * 1024,
      bytesOut: (net.outgoingKb ?? 0) * 1024,
      packetsIn: net.incomingPackets ?? 0,
      packetsOut: net.outgoingPackets ?? 0,
    },
  };
};

const mapNetworkHealthFromApi = (metrics: any): NetworkHealth | null => {
  const net = metrics?.network;
  if (!net) return null;

  const checks = Array.isArray(net.checks)
    ? net.checks.map((c: any) => ({
      target: c.target,
      host: c.host,
      latencyMs: typeof c.latencyMs === 'number' ? c.latencyMs : 0,
      status: (c.status === 'UP' || c.status === 'DOWN' ? c.status : 'DOWN') as 'UP' | 'DOWN',
    }))
    : [];

  return {
    averageLatencyMs: net.averageLatencyMs ?? 0,
    availabilityPercent: net.availabilityPercent ?? 0,
    bandwidthGbps: net.bandwidthGbps ?? 0,
    checks,
  };
};

const mapApplicationMetricsFromApi = (metrics: any): ApplicationMetrics => {
  const app = metrics?.application ?? {};

  return {
    id: 'application',
    timestamp: metrics?.timestamp ?? new Date().toISOString(),
    activeUsers: app.activeUsers ?? 0,
    totalSessions: app.totalSessions ?? 0,
    averageResponseTime: app.averageResponseTimeMs ?? 0,
    requestsPerMinute: app.requestsPerMinute ?? 0,
    errorRate: app.errorRatePercent ?? 0,
    databaseConnections: app.dbConnections ?? 0,
    cacheHitRate: app.cacheHitRatePercent ?? 0,
  };
};

const mapAlertsFromApi = (data: any): Alert[] => {
  if (!data?.items) return [];

  return data.items.map((a: any) => ({
    id: a.id,
    title: a.title,
    message: a.description,
    severity: (String(a.severity || '').toLowerCase() || 'low') as AlertSeverity,
    status: (a.status ?? 'active') as AlertStatus,
    category: 'system',
    timestamp: a.createdAt,
    resolvedAt: a.resolvedAt ?? undefined,
    acknowledgedBy: undefined,
    source: a.source,
    threshold: undefined,
    currentValue: undefined,
    metadata: {},
  }));
};

const mapServicesFromApi = (data: any): ServiceHealth[] => {
  if (!data?.items) return [];

  const statusMap: Record<string, ServiceStatus> = {
    UP: 'running',
    ERROR: 'error',
    MAINTENANCE: 'maintenance',
    DOWN: 'stopped',
  };

  return data.items.map((s: any) => ({
    id: s.id,
    name: s.name,
    status: statusMap[s.status] ?? 'stopped',
    uptime: s.uptime?.seconds ?? 0,
    lastCheck: s.lastCheckAt,
    responseTime: s.responseTimeMs ?? undefined,
    version: s.version,
    endpoint: undefined,
    dependencies: undefined,
    metadata: {},
  }));
};

const mapEventsFromApi = (data: any): SystemEvent[] => {
  if (!data?.items) return [];

  const typeMap: Record<string, string> = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
  };

  return data.items.map((e: any) => ({
    id: e.id,
    type: (typeMap[e.type] as any) ?? 'info',
    title: e.title,
    description: e.description,
    timestamp: e.createdAt,
    source: e.source,
    userId: undefined,
    ipAddress: e.metadata?.ip,
    userAgent: undefined,
    severity: (String(e.severity || '').toLowerCase() || 'low') as AlertSeverity,
    metadata: e.metadata ?? {},
  }));
};

const buildStatsFromApi = (
  overview: any,
  alerts: any,
  services: any,
  events: any,
): MonitoringStats => {
  const totalAlerts = alerts?.summary?.total ?? 0;
  const activeAlerts = alerts?.summary?.active ?? 0;
  const criticalAlerts = alerts?.summary?.critical ?? 0;
  const systemUptime = overview?.uptime?.seconds ?? 0;
  const averageResponseTime = overview?.responseTime?.avgMs24h ?? 0;
  const minResponseTime = overview?.responseTime?.minMs24h ?? averageResponseTime;
  const maxResponseTime = overview?.responseTime?.maxMs24h ?? averageResponseTime;
  const serverErrorsToday = overview?.errorsToday?.count ?? 0;
  const totalEvents = events?.summary?.total ?? 0;
  const servicesUp = services?.summary?.up ?? 0;
  const servicesDown = (services?.summary?.error ?? 0) + (services?.summary?.maintenance ?? 0);

  return {
    totalAlerts,
    activeAlerts,
    criticalAlerts,
    systemUptime,
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    serverErrorsToday,
    totalEvents,
    servicesUp,
    servicesDown,
    lastUpdate: new Date().toISOString(),
  };
};

const REALTIME_STORAGE_KEY = 'lncp_monitoring_realtime_enabled';

const getInitialRealTimeEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;

  try {
    const stored = window.localStorage.getItem(REALTIME_STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // ignore localStorage errors and fall back to default
  }

  return true;
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
      networkHealth: null,
      config: defaultConfig,
      eventsPage: 1,
      hasMoreEvents: true,
      loading: false,
      error: null,
      isRealTimeEnabled: getInitialRealTimeEnabled(),
      filters: {},

      // Actions de récupération des données
      fetchSystemMetrics: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const metrics = await monitoringService.getMetrics();

          set((state) => {
            state.systemMetrics = mapSystemMetricsFromApi(metrics);
            state.networkHealth = mapNetworkHealthFromApi(metrics);
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des métriques système';
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
          const metrics = await monitoringService.getMetrics();

          set((state) => {
            state.applicationMetrics = mapApplicationMetricsFromApi(metrics);
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des métriques application';
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
          const alerts = await monitoringService.getAlerts();

          set((state) => {
            state.alerts = mapAlertsFromApi(alerts);
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des alertes';
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
          const services = await monitoringService.getServices();

          set((state) => {
            state.services = mapServicesFromApi(services);
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des services';
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

      loadMoreEvents: async () => {
        const { eventsPage, hasMoreEvents, systemEvents } = get();
        if (!hasMoreEvents) {
          return;
        }

        const nextPage = eventsPage + 1;

        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const data = await monitoringService.getEventsHistory(nextPage, 20);
          const newEvents = mapEventsFromApi(data);

          set((state) => {
            state.systemEvents = [...systemEvents, ...newEvents];
            state.eventsPage = nextPage;

            const total = data?.pagination?.total ?? data?.total;
            if (typeof total === 'number') {
              state.hasMoreEvents = state.systemEvents.length < total;
            } else {
              state.hasMoreEvents = newEvents.length > 0;
            }

            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors du chargement des événements supplémentaires';
            state.loading = false;
          });
        }
      },

      fetchSystemEvents: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const events = await monitoringService.getEvents();

          set((state) => {
            state.systemEvents = mapEventsFromApi(events);
            state.eventsPage = 1;
            state.hasMoreEvents = true;
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des événements';
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
          const [overview, alerts, services, events] = await Promise.all([
            monitoringService.getOverview(),
            monitoringService.getAlerts(),
            monitoringService.getServices(),
            monitoringService.getEvents(),
          ]);

          const stats = buildStatsFromApi(overview, alerts, services, events);

          set((state) => {
            state.stats = stats;
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.error = error?.message || 'Erreur lors de la récupération des statistiques';
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

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(REALTIME_STORAGE_KEY, String(enabled));
          } catch {
            // ignore localStorage errors
          }
        }
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