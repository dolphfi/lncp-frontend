/**
 * =====================================================
 * PAGE DE MONITORING SYSTÈME
 * =====================================================
 * Dashboard de surveillance en temps réel
 * Complète AdminPanel avec métriques de performance et alertes
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wifi,
  XCircle,
  Eye,
  Play,
  Square,
  RotateCcw,
  Download,
  Bell,
  BellOff
} from 'lucide-react';

import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import {
  Alert,
  AlertDescription
} from '../../ui/alert';

import { useMonitoringStore } from '../../../stores/monitoringStore';
import type { Alert as MonitoringAlert, ServiceHealth, AlertSeverity } from '../../../types/monitoring';

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const Monitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState<MonitoringAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Store Zustand
  const {
    systemMetrics,
    applicationMetrics,
    alerts,
    services,
    systemEvents,
    stats,
    loading,
    error,
    isRealTimeEnabled,
    fetchSystemMetrics,
    fetchApplicationMetrics,
    fetchAlerts,
    fetchServices,
    fetchSystemEvents,
    fetchStats,
    acknowledgeAlert,
    resolveAlert,
    restartService,
    stopService,
    startService,
    setRealTimeEnabled,
    refreshAllData,
    clearError
  } = useMonitoringStore();

  // Effet pour charger les données initiales
  useEffect(() => {
    refreshAllData();
    
    // Demander la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [refreshAllData]);

  // Effet pour le rafraîchissement automatique
  useEffect(() => {
    if (!autoRefresh || !isRealTimeEnabled) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [autoRefresh, isRealTimeEnabled, refreshAllData]);

  // Effet pour détecter les nouvelles alertes critiques
  useEffect(() => {
    const criticalAlerts = alerts.filter(alert => 
      alert.severity === 'critical' && alert.status === 'active'
    );
    
    // Vérifier s'il y a de nouvelles alertes critiques
    const newCriticalAlerts = criticalAlerts.filter(alert => 
      !notifications.some(notif => notif.id === alert.id)
    );
    
    if (newCriticalAlerts.length > 0) {
      setNotifications(prev => [...prev, ...newCriticalAlerts]);
      
      // Notification browser si supportée
      if ('Notification' in window && Notification.permission === 'granted') {
        newCriticalAlerts.forEach(alert => {
          new Notification('Alerte Critique - Monitoring', {
            body: alert.message,
            icon: '/favicon.ico',
            tag: alert.id
          });
        });
      }
    }
  }, [alerts, notifications]);

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAlertSeverityBadge = (severity: AlertSeverity) => {
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return <Badge className={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getServiceStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-green-100 text-green-800',
      stopped: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      running: 'En marche',
      stopped: 'Arrêté',
      error: 'Erreur',
      maintenance: 'Maintenance'
    };
    
    return <Badge className={variants[status as keyof typeof variants]}>
      {labels[status as keyof typeof labels]}
    </Badge>;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // =====================================================
  // RENDU DU COMPOSANT
  // =====================================================
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Surveillance Système
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitoring en temps réel des performances et de la santé du système
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isRealTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <span className="text-sm">Temps réel</span>
          </div>
          
          {/* Bouton de notifications */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {notifications.length}
                </Badge>
              )}
            </Button>
            
            {/* Dropdown des notifications */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Alertes Critiques</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications([])}
                    >
                      Effacer tout
                    </Button>
                  </div>
                </div>
                
                {notifications.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notif.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(notif.timestamp).toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune alerte critique</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              // Générer un rapport de monitoring
              const report = {
                timestamp: new Date().toISOString(),
                systemMetrics,
                applicationMetrics,
                alerts: alerts.filter(a => a.status === 'active'),
                services,
                stats
              };
              
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={refreshAllData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alerte d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fermer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques globales */}
          {stats && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temps de fonctionnement</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatUptime(stats.systemUptime)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Système stable
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.activeAlerts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.criticalAlerts} critiques
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.servicesUp}/{stats.servicesUp + stats.servicesDown}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Services opérationnels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.averageResponseTime}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Moyenne sur 24h
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Métriques système rapides */}
          {systemMetrics && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilisation</span>
                      <span>{systemMetrics.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={systemMetrics.cpu.usage} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Mémoire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilisée</span>
                      <span>{systemMetrics.memory.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={systemMetrics.memory.percentage} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Disque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilisé</span>
                      <span>{systemMetrics.disk.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={systemMetrics.disk.percentage} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Réseau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Entrant</span>
                      <span>{formatBytes(systemMetrics.network.bytesIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sortant</span>
                      <span>{formatBytes(systemMetrics.network.bytesOut)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Alertes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getAlertSeverityBadge(alert.severity)}
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-gray-600">{alert.message}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune alerte récente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métriques détaillées */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Santé réseau */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Santé Réseau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12ms</div>
                  <div className="text-sm text-green-800">Latence moyenne</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-blue-800">Disponibilité</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1.2GB/s</div>
                  <div className="text-sm text-purple-800">Bande passante</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ping vers Google DNS (8.8.8.8)</span>
                  <Badge className="bg-green-100 text-green-800">8ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ping vers Cloudflare (1.1.1.1)</span>
                  <Badge className="bg-green-100 text-green-800">12ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Connexion base de données</span>
                  <Badge className="bg-green-100 text-green-800">2ms</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {systemMetrics && applicationMetrics && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Métriques système */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Métriques Système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CPU ({systemMetrics.cpu.cores} cœurs)</span>
                      <span className="text-sm">{systemMetrics.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemMetrics.cpu.usage} className="h-3" />
                    {systemMetrics.cpu.temperature && (
                      <div className="text-xs text-gray-500 mt-1">
                        Température: {systemMetrics.cpu.temperature}°C
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Mémoire</span>
                      <span className="text-sm">
                        {formatBytes(systemMetrics.memory.used * 1024 * 1024)} / {formatBytes(systemMetrics.memory.total * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress value={systemMetrics.memory.percentage} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Disque</span>
                      <span className="text-sm">
                        {systemMetrics.disk.used} GB / {systemMetrics.disk.total} GB
                      </span>
                    </div>
                    <Progress value={systemMetrics.disk.percentage} className="h-3" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">Réseau</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Trafic entrant</div>
                        <div>{formatBytes(systemMetrics.network.bytesIn)}</div>
                        <div className="text-xs text-gray-500">{systemMetrics.network.packetsIn} paquets</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Trafic sortant</div>
                        <div>{formatBytes(systemMetrics.network.bytesOut)}</div>
                        <div className="text-xs text-gray-500">{systemMetrics.network.packetsOut} paquets</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métriques application */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métriques Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{applicationMetrics.activeUsers}</div>
                      <div className="text-sm text-blue-800">Utilisateurs actifs</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{applicationMetrics.totalSessions}</div>
                      <div className="text-sm text-green-800">Sessions totales</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Temps de réponse moyen</span>
                      <span className="font-medium">{applicationMetrics.averageResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Requêtes par minute</span>
                      <span className="font-medium">{applicationMetrics.requestsPerMinute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Taux d'erreur</span>
                      <span className="font-medium text-red-600">{applicationMetrics.errorRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Connexions DB</span>
                      <span className="font-medium">{applicationMetrics.databaseConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Taux de succès cache</span>
                      <span className="font-medium text-green-600">{applicationMetrics.cacheHitRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Alertes */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Gestion des Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{getAlertSeverityBadge(alert.severity)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-gray-600">{alert.message}</div>
                          </div>
                        </TableCell>
                        <TableCell>{alert.source}</TableCell>
                        <TableCell>
                          <Badge variant={alert.status === 'active' ? 'destructive' : 'outline'}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(alert.timestamp).toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {alert.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  Accuser réception
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  Résoudre
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune alerte à afficher</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                État des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Temps de fonctionnement</TableHead>
                      <TableHead>Temps de réponse</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{getServiceStatusBadge(service.status)}</TableCell>
                        <TableCell>{formatUptime(service.uptime)}</TableCell>
                        <TableCell>
                          {service.responseTime ? `${service.responseTime}ms` : '-'}
                        </TableCell>
                        <TableCell>{service.version || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {service.status === 'stopped' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startService(service.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {service.status === 'running' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => restartService(service.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => stopService(service.id)}
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {service.status === 'error' && (
                              <Button
                                size="sm"
                                onClick={() => restartService(service.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun service à afficher</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Événements système */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Événements Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemEvents.length > 0 ? (
                <div className="space-y-4">
                  {/* Timeline des événements */}
                  <div className="relative">
                    {systemEvents.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4 pb-6 relative">
                        {/* Ligne de timeline */}
                        {index < systemEvents.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                        )}
                        
                        {/* Icône de l'événement */}
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10
                          ${event.type === 'error' ? 'bg-red-500' : 
                            event.type === 'warning' ? 'bg-yellow-500' : 
                            event.type === 'security' ? 'bg-purple-500' : 'bg-blue-500'}
                        `}>
                          {event.type === 'error' ? '!' : 
                           event.type === 'warning' ? '⚠' : 
                           event.type === 'security' ? '🔒' : 'ℹ'}
                        </div>
                        
                        {/* Contenu de l'événement */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center gap-2">
                              {getAlertSeverityBadge(event.severity)}
                              <span className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Source: {event.source}</span>
                            {event.userId && <span>Utilisateur: {event.userId}</span>}
                            {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                          </div>
                          
                          {event.metadata && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination ou Load More */}
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => fetchSystemEvents()}>
                      Charger plus d'événements
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun événement système à afficher</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};