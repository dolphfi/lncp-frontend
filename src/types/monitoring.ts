/**
 * =====================================================
 * TYPES POUR LE SYSTÈME DE MONITORING
 * =====================================================
 * Types TypeScript pour la surveillance système en temps réel
 * Complète AdminPanel en se concentrant sur les métriques de performance
 */

// =====================================================
// MÉTRIQUES SYSTÈME
// =====================================================
export interface SystemMetrics {
  id: string;
  timestamp: string;
  cpu: {
    usage: number;        // Pourcentage d'utilisation CPU
    cores: number;        // Nombre de cœurs
    temperature?: number; // Température en °C
  };
  memory: {
    used: number;         // Mémoire utilisée en MB
    total: number;        // Mémoire totale en MB
    percentage: number;   // Pourcentage d'utilisation
  };
  disk: {
    used: number;         // Espace disque utilisé en GB
    total: number;        // Espace disque total en GB
    percentage: number;   // Pourcentage d'utilisation
  };
  network: {
    bytesIn: number;      // Octets entrants
    bytesOut: number;     // Octets sortants
    packetsIn: number;    // Paquets entrants
    packetsOut: number;   // Paquets sortants
  };
}

// =====================================================
// MÉTRIQUES APPLICATION
// =====================================================
export interface ApplicationMetrics {
  id: string;
  timestamp: string;
  activeUsers: number;           // Utilisateurs connectés
  totalSessions: number;         // Sessions totales
  averageResponseTime: number;   // Temps de réponse moyen en ms
  requestsPerMinute: number;     // Requêtes par minute
  errorRate: number;             // Taux d'erreur en pourcentage
  databaseConnections: number;   // Connexions DB actives
  cacheHitRate: number;         // Taux de succès du cache
}

// =====================================================
// ALERTES ET NOTIFICATIONS
// =====================================================
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertCategory = 'system' | 'application' | 'security' | 'performance';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  timestamp: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  source: string;           // Source de l'alerte (CPU, Memory, etc.)
  threshold?: number;       // Seuil déclenché
  currentValue?: number;    // Valeur actuelle
  metadata?: Record<string, any>; // Données supplémentaires
}

// =====================================================
// SERVICES ET STATUTS
// =====================================================
export type ServiceStatus = 'running' | 'stopped' | 'error' | 'maintenance';

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;           // Temps de fonctionnement en secondes
  lastCheck: string;        // Dernière vérification
  responseTime?: number;    // Temps de réponse en ms
  version?: string;         // Version du service
  endpoint?: string;        // Point de terminaison
  dependencies?: string[];  // Services dépendants
  metadata?: Record<string, any>;
}

// =====================================================
// MÉTRIQUES DE PERFORMANCE
// =====================================================
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'availability';
  target?: number;          // Valeur cible
  threshold?: {             // Seuils d'alerte
    warning: number;
    critical: number;
  };
}

// =====================================================
// ÉVÉNEMENTS SYSTÈME
// =====================================================
export type EventType = 'startup' | 'shutdown' | 'error' | 'warning' | 'info' | 'security';

export interface SystemEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: AlertSeverity;
  metadata?: Record<string, any>;
}

// =====================================================
// CONFIGURATION DU MONITORING
// =====================================================
export interface MonitoringConfig {
  refreshInterval: number;      // Intervalle de rafraîchissement en ms
  alertThresholds: {
    cpu: number;               // Seuil CPU en %
    memory: number;            // Seuil mémoire en %
    disk: number;              // Seuil disque en %
    responseTime: number;      // Seuil temps de réponse en ms
    errorRate: number;         // Seuil taux d'erreur en %
  };
  retentionPeriod: number;     // Période de rétention des données en jours
  enableRealTimeAlerts: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
}

// =====================================================
// STATISTIQUES GLOBALES
// =====================================================
export interface MonitoringStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  systemUptime: number;        // Temps de fonctionnement système en secondes
  averageResponseTime: number; // Temps de réponse moyen
  totalEvents: number;
  servicesUp: number;
  servicesDown: number;
  lastUpdate: string;
}

// =====================================================
// DONNÉES HISTORIQUES
// =====================================================
export interface HistoricalData {
  timestamp: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
    activeUsers: number;
    errorRate: number;
  };
}

// =====================================================
// FILTRES ET RECHERCHE
// =====================================================
export interface MonitoringFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  severity?: AlertSeverity[];
  category?: AlertCategory[];
  status?: AlertStatus[];
  services?: string[];
  search?: string;
}

// =====================================================
// RÉPONSES API
// =====================================================
export interface MonitoringApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedMonitoringResponse<T> extends MonitoringApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}