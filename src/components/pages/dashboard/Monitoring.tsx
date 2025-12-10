/**
 * =====================================================
 * PAGE DE MONITORING SYSTÈME
 * =====================================================
 * Dashboard de surveillance en temps réel
 * Complète AdminPanel avec métriques de performance et alertes
 */

import React, { useState, useEffect, useRef } from 'react';
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
    BellOff,
    Upload,
    Trash2,
    Key
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
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../../ui/dialog';

import { useMonitoringStore } from '../../../stores/monitoringStore';
import { useSettingStore } from '../../../stores/settingStore';
import { config } from '../../../config/environment';
import monitoringService from '../../../services/monitoring/monitoringService';
import { settingService } from '../../../services/settings/settingService';
import { SettingKey } from '../../../types/setting';
import { io } from 'socket.io-client';
import type { Alert as MonitoringAlert, ServiceHealth, AlertSeverity } from '../../../types/monitoring';
import { toast } from 'react-toastify';

interface SystemLog {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    user?: string;
    timestamp: string;
    module: string;
}

interface BackupInfo {
    id: string;
    filename: string;
    size: string;
    type: 'full' | 'incremental';
    status: 'completed' | 'failed' | 'in_progress';
    createdAt: string;
    duration: string;
    downloadUrl?: string | null;
}

interface SystemConfig {
    schoolName: string;
    schoolAddress: string;
    schoolPhone: string;
    schoolEmail: string;
    academicYear: string;
    maxStudentsPerClass: number;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maintenanceMode: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    autoBackup: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const Monitoring: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [notifications, setNotifications] = useState<MonitoringAlert[]>([]);
    const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
    const [showNotifications, setShowNotifications] = useState(false);
    const [networkRates, setNetworkRates] = useState<{
        inBytesPerSec: number;
        outBytesPerSec: number;
        inPacketsPerSec: number;
        outPacketsPerSec: number;
    } | null>(null);

    const lastNetworkSnapshotRef = useRef<{
        timestampMs: number;
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
    } | null>(null);

    // Store Zustand
    const {
        systemMetrics,
        applicationMetrics,
        alerts,
        services,
        systemEvents,
        stats,
        networkHealth,
        loading,
        error,
        isRealTimeEnabled,
        hasMoreEvents,
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
        clearError,
        loadMoreEvents,
    } = useMonitoringStore();

    const {
        maintenanceMode,
        maintenanceLoading,
        enableMaintenance,
        disableMaintenance,
        fetchMaintenanceStatus
    } = useSettingStore();

    const [logsData, setLogsData] = useState<SystemLog[]>([]);
    const [backupList, setBackupList] = useState<BackupInfo[]>([]);
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
    const [showBackupDetails, setShowBackupDetails] = useState(false);
    const [securityConfig, setSecurityConfig] = useState<SystemConfig>({
        schoolName: 'Lycée National Charlemagne Péralte',
        schoolAddress: "123 Rue de l'Éducation, Port-au-Prince, Haïti",
        schoolPhone: '+509 1234-5678',
        schoolEmail: 'contact@lncp.edu.ht',
        academicYear: '2024-2025',
        maxStudentsPerClass: 35,
        backupFrequency: 'daily',
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
        autoBackup: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5
    });

    const mapBackupsResponseToList = (data: any): BackupInfo[] => {
        const items = Array.isArray(data?.items) ? data.items : [];

        return items.map((backup: any) => {
            const created = backup.createdAt ? new Date(backup.createdAt) : null;
            const completed = backup.completedAt ? new Date(backup.completedAt) : null;

            let duration = '-';
            if (created && completed) {
                const diffMs = completed.getTime() - created.getTime();
                const minutes = Math.max(1, Math.round(diffMs / 60000));
                duration = `${minutes} min`;
            }

            let size = backup.size ?? '-';
            if (typeof backup.sizeGb === 'number') {
                const sizeGb = backup.sizeGb;
                const sizeMb = sizeGb * 1024;
                const sizeKb = sizeMb * 1024;

                if (sizeGb >= 1) {
                    size = `${sizeGb.toFixed(1)} GB`;
                } else if (sizeMb >= 1) {
                    size = `${sizeMb.toFixed(1)} MB`;
                } else if (sizeKb > 0) {
                    size = `${sizeKb.toFixed(1)} KB`;
                } else {
                    size = '0 KB';
                }
            }

            const rawType = String(backup.type || 'FULL').toUpperCase();
            const type: BackupInfo['type'] = rawType === 'INCREMENTAL' ? 'incremental' : 'full';

            const rawStatus = String(backup.status || '').toUpperCase();
            let status: BackupInfo['status'] = 'in_progress';
            if (rawStatus === 'COMPLETED') status = 'completed';
            else if (rawStatus === 'FAILED') status = 'failed';

            return {
                id: String(backup.id ?? ''),
                filename: backup.fileName ?? backup.filename ?? '',
                size,
                type,
                status,
                createdAt: created ? created.toLocaleString('fr-FR') : '',
                duration,
                downloadUrl: backup.path ?? backup.cloudinaryUrl ?? null,
            };
        });
    };

    // Effet pour charger les données initiales
    useEffect(() => {
        refreshAllData();

        // Demander la permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [refreshAllData]);

    useEffect(() => {
        fetchMaintenanceStatus();
    }, [fetchMaintenanceStatus]);

    // Charger la configuration de sécurité réelle (backup auto + fréquence)
    useEffect(() => {
        const fetchSecurity = async () => {
            try {
                const data = await monitoringService.getSecurity();
                const security = (data as any)?.security ?? {};
                const auth = (data as any)?.authentication ?? {};

                const rawFreq = String(auth.backupFrequency || 'DAILY').toUpperCase();
                let backupFrequency: SystemConfig['backupFrequency'] = 'daily';
                if (rawFreq === 'WEEKLY') backupFrequency = 'weekly';
                else if (rawFreq === 'MONTHLY') backupFrequency = 'monthly';

                const autoBackup = Boolean(security.automaticBackup ?? true);

                setSecurityConfig((prev) => ({
                    ...prev,
                    autoBackup,
                    backupFrequency,
                }));
            } catch {
                // En cas d'erreur, on garde la configuration par défaut côté frontend
            }
        };

        fetchSecurity();
    }, []);

    useEffect(() => {
        const fetchBackups = async () => {
            try {
                const data = await monitoringService.getBackups();
                const mapped = mapBackupsResponseToList(data as any);
                setBackupList(mapped);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Erreur lors du chargement des sauvegardes', error);
            }
        };

        fetchBackups();
    }, []);

    useEffect(() => {
        if (activeTab !== 'logs') return;

        const fetchLogs = async () => {
            try {
                const levelParam = logLevelFilter === 'all' ? undefined : logLevelFilter;
                const data = await monitoringService.getLogs(levelParam);
                const items = Array.isArray((data as any)?.items) ? (data as any).items : [];

                const mapped: SystemLog[] = items.map((log: any) => {
                    const created = log.createdAt || log.timestamp;
                    const ts = created ? new Date(created).toLocaleString('fr-FR') : '';
                    const rawLevel = String(log.level || 'info').toLowerCase();
                    const normalizedLevel: SystemLog['level'] =
                        rawLevel === 'warning' || rawLevel === 'error' || rawLevel === 'critical'
                            ? rawLevel
                            : 'info';

                    return {
                        id: String(log.id ?? ''),
                        level: normalizedLevel,
                        message: log.message ?? '',
                        user: log.user,
                        timestamp: ts,
                        module: log.module ?? 'system'
                    };
                });

                setLogsData(mapped);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Erreur lors du chargement des logs système', error);
            }
        };

        fetchLogs();
    }, [activeTab, logLevelFilter]);

    // Effet pour le rafraîchissement automatique (mode non temps réel)
    useEffect(() => {
        // Pas de rafraîchissement auto si désactivé
        if (!autoRefresh) return;

        // Quand le mode temps réel est activé, on laisse uniquement Socket.IO mettre à jour les données
        if (isRealTimeEnabled) return;

        const interval = setInterval(() => {
            refreshAllData();
        }, 30000); // 30 secondes

        return () => clearInterval(interval);
    }, [autoRefresh, isRealTimeEnabled, refreshAllData]);

    // Connexion Socket.IO pour le temps réel
    useEffect(() => {
        if (!isRealTimeEnabled) return;

        const socket = io(`${config.API_BASE_URL}/monitoring`, {
            transports: ['websocket'],
            withCredentials: true,
        });

        socket.on('monitoring:snapshot', (payload: any) => {
            useMonitoringStore.setState((state) => ({
                ...state,
                systemMetrics: payload.systemMetrics ?? state.systemMetrics,
                applicationMetrics: payload.applicationMetrics ?? state.applicationMetrics,
                alerts: payload.alerts ?? state.alerts,
                services: payload.services ?? state.services,
                systemEvents: payload.systemEvents ?? state.systemEvents,
                stats: payload.stats ?? state.stats,
            }));

            const currentNetworkSnapshot = {
                timestampMs: Date.now(),
                bytesIn: payload.systemMetrics.network.bytesIn,
                bytesOut: payload.systemMetrics.network.bytesOut,
                packetsIn: payload.systemMetrics.network.packetsIn,
                packetsOut: payload.systemMetrics.network.packetsOut,
            };

            if (lastNetworkSnapshotRef.current) {
                const timeDiffMs = currentNetworkSnapshot.timestampMs - lastNetworkSnapshotRef.current.timestampMs;
                const inBytesDiff = currentNetworkSnapshot.bytesIn - lastNetworkSnapshotRef.current.bytesIn;
                const outBytesDiff = currentNetworkSnapshot.bytesOut - lastNetworkSnapshotRef.current.bytesOut;
                const inPacketsDiff = currentNetworkSnapshot.packetsIn - lastNetworkSnapshotRef.current.packetsIn;
                const outPacketsDiff = currentNetworkSnapshot.packetsOut - lastNetworkSnapshotRef.current.packetsOut;

                setNetworkRates({
                    inBytesPerSec: inBytesDiff / (timeDiffMs / 1000),
                    outBytesPerSec: outBytesDiff / (timeDiffMs / 1000),
                    inPacketsPerSec: inPacketsDiff / (timeDiffMs / 1000),
                    outPacketsPerSec: outPacketsDiff / (timeDiffMs / 1000),
                });
            }

            lastNetworkSnapshotRef.current = currentNetworkSnapshot;
        });

        return () => {
            socket.disconnect();
        };
    }, [isRealTimeEnabled]);

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

    const getLogLevelBadge = (level: string) => {
        switch (level) {
            case 'info':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 transition-colors">
                        Info
                    </Badge>
                );
            case 'warning':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 transition-colors">
                        Avertissement
                    </Badge>
                );
            case 'error':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 transition-colors">
                        Erreur
                    </Badge>
                );
            case 'critical':
                return (
                    <Badge className="bg-red-600 text-white hover:bg-red-700 transition-colors">
                        Critique
                    </Badge>
                );
            default:
                return <Badge variant="outline">{level}</Badge>;
        }
    };

    // =====================================================
    // RENDU DU COMPOSANT
    // =====================================================
    const securityScore =
        (securityConfig.emailNotifications ? 1 : 0) +
        (securityConfig.autoBackup ? 1 : 0) +
        (securityConfig.sessionTimeout <= 20 ? 1 : 0) +
        (securityConfig.maxLoginAttempts <= 5 ? 1 : 0);

    let securityLevel: 'Faible' | 'Moyen' | 'Élevé' = 'Moyen';
    let securityBadgeClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200';

    if (securityScore >= 3) {
        securityLevel = 'Élevé';
        securityBadgeClasses = 'bg-green-50 text-green-700 border-green-200';
    } else if (securityScore <= 1) {
        securityLevel = 'Faible';
        securityBadgeClasses = 'bg-red-50 text-red-700 border-red-200';
    }
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Surveillance Système
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monitoring en temps réel des performances et de la santé du système
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mr-2">
                        <Switch
                            checked={isRealTimeEnabled}
                            onCheckedChange={(checked) => {
                                setRealTimeEnabled(checked);
                                toast.success(
                                    checked
                                        ? 'Mode temps réel activé'
                                        : 'Mode temps réel désactivé'
                                );
                            }}
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
                {/* Menu mobile - Select dropdown */}
                <div className="lg:hidden">
                    <Select value={activeTab} onValueChange={setActiveTab}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="overview">Vue d'ensemble</SelectItem>
                            <SelectItem value="metrics">Métriques</SelectItem>
                            <SelectItem value="alerts">Alertes</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="events">Événements</SelectItem>
                            <SelectItem value="logs">Logs</SelectItem>
                            <SelectItem value="backup">Sauvegardes</SelectItem>
                            <SelectItem value="security">Sécurité</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Menu desktop - Tabs */}
                <TabsList className="hidden lg:grid w-full grid-cols-8 h-auto">
                    <TabsTrigger value="overview" className="text-xs xl:text-sm py-2">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="metrics" className="text-xs xl:text-sm py-2">Métriques</TabsTrigger>
                    <TabsTrigger value="alerts" className="text-xs xl:text-sm py-2">Alertes</TabsTrigger>
                    <TabsTrigger value="services" className="text-xs xl:text-sm py-2">Services</TabsTrigger>
                    <TabsTrigger value="events" className="text-xs xl:text-sm py-2">Événements</TabsTrigger>
                    <TabsTrigger value="logs" className="text-xs xl:text-sm py-2">Logs</TabsTrigger>
                    <TabsTrigger value="backup" className="text-xs xl:text-sm py-2">Sauvegardes</TabsTrigger>
                    <TabsTrigger value="security" className="text-xs xl:text-sm py-2">Sécurité</TabsTrigger>
                    {/* // ici */}
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
                                        {typeof stats.minResponseTime === 'number' && typeof stats.maxResponseTime === 'number' && (
                                            <> — Min {stats.minResponseTime}ms / Max {stats.maxResponseTime}ms</>
                                        )}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Logs et sauvegardes rapides */}
                    {stats && (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Erreurs Aujourd'hui</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.serverErrorsToday ?? 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Erreurs serveur (5xx) aujourd'hui</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Dernière Sauvegarde</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {backupList.length > 0 ? 'OK' : 'Aucune'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {backupList.length > 0 ? backupList[0].createdAt : 'Sauvegarde requise'}
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
                                        {systemMetrics.cpu.temperature && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Température: {systemMetrics.cpu.temperature}°C
                                            </div>
                                        )}
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
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <div className="flex justify-between items-baseline">
                                                <span>Entrant</span>
                                                <span>{formatBytes(systemMetrics.network.bytesIn)}</span>
                                            </div>
                                            {networkRates && (
                                                <div className="flex justify-end text-xs text-muted-foreground mt-0.5">
                                                    ~{formatBytes(networkRates.inBytesPerSec)}/s • {Math.round(networkRates.inPacketsPerSec)} paq/s
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-baseline">
                                                <span>Sortant</span>
                                                <span>{formatBytes(systemMetrics.network.bytesOut)}</span>
                                            </div>
                                            {networkRates && (
                                                <div className="flex justify-end text-xs text-muted-foreground mt-0.5">
                                                    ~{formatBytes(networkRates.outBytesPerSec)}/s • {Math.round(networkRates.outPacketsPerSec)} paq/s
                                                </div>
                                            )}
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
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-blue-800 mb-1">Débit entrant</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {networkRates
                                            ? `${formatBytes(networkRates.inBytesPerSec)}/s`
                                            : systemMetrics
                                                ? formatBytes(systemMetrics.network.bytesIn)
                                                : 'N/A'}
                                    </div>
                                    {systemMetrics && (
                                        <div className="text-xs text-blue-700 mt-1">
                                            Total: {formatBytes(systemMetrics.network.bytesIn)}
                                        </div>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-xs text-green-800 mb-1">Débit sortant</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {networkRates
                                            ? `${formatBytes(networkRates.outBytesPerSec)}/s`
                                            : systemMetrics
                                                ? formatBytes(systemMetrics.network.bytesOut)
                                                : 'N/A'}
                                    </div>
                                    {systemMetrics && (
                                        <div className="text-xs text-green-700 mt-1">
                                            Total: {formatBytes(systemMetrics.network.bytesOut)}
                                        </div>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-xs text-purple-800 mb-1">Paquets</div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {networkRates
                                            ? `${Math.round(networkRates.inPacketsPerSec)} / ${Math.round(networkRates.outPacketsPerSec)} paq/s`
                                            : systemMetrics
                                                ? `${systemMetrics.network.packetsIn} / ${systemMetrics.network.packetsOut} paquets`
                                                : 'N/A'}
                                    </div>
                                    {systemMetrics && (
                                        <div className="text-xs text-purple-700 mt-1">
                                            In / Out cumulés
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Résumé global des sondes réseau */}
                            {networkHealth && (
                                <div className="mt-4 text-xs text-gray-600 flex flex-wrap gap-4">
                                    <div>
                                        <span className="font-medium">Latence moyenne globale :</span>{' '}
                                        {Math.round(networkHealth.averageLatencyMs)}ms
                                    </div>
                                    <div>
                                        <span className="font-medium">Disponibilité :</span>{' '}
                                        {networkHealth.availabilityPercent.toFixed(1)}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Cibles UP :</span>{' '}
                                        {networkHealth.checks.filter(c => c.status === 'UP').length}/{networkHealth.checks.length}
                                    </div>
                                </div>
                            )}

                            {/* Détail des pings par cible */}
                            <div className="mt-3 space-y-2">
                                {(networkHealth?.checks && networkHealth.checks.length > 0) ? (
                                    networkHealth.checks.map((check) => {
                                        const isUp = check.status === 'UP' && check.latencyMs > 0;
                                        let label: string;
                                        if (check.target === 'Base de données') {
                                            label = 'Connexion base de données';
                                        } else if (check.target === 'Redis') {
                                            label = 'Connexion cache Redis';
                                        } else {
                                            label = `Ping vers ${check.target} (${check.host})`;
                                        }

                                        let description: string | null = null;
                                        if (check.target === 'Google DNS' || check.target === 'Cloudflare') {
                                            description = 'Vérifie la connectivité Internet / DNS vers l\'extérieur.';
                                        } else if (check.target === 'Base de données') {
                                            description = 'Vérifie la latence entre l\'API et la base de données.';
                                        } else if (check.target === 'Redis') {
                                            description = 'Vérifie la latence entre l\'API et le cache Redis.';
                                        }

                                        return (
                                            <div
                                                key={`${check.target}-${check.host}`}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{label}</div>
                                                    {description && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {description}
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge className={isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {isUp
                                                        ? `UP · ${Math.round(check.latencyMs)}ms`
                                                        : 'DOWN'}
                                                </Badge>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-sm text-gray-500">Aucune donnée de latence réseau disponible</div>
                                )}
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

                                    {/* Pagination / Load More */}
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            variant="outline"
                                            disabled={!hasMoreEvents || loading}
                                            onClick={() => loadMoreEvents()}
                                        >
                                            {hasMoreEvents
                                                ? "Charger plus d'événements"
                                                : "Tous les événements sont chargés"}
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

                {/* Logs système */}
                <TabsContent value="logs" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-semibold">Logs Système</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Select value={logLevelFilter} onValueChange={setLogLevelFilter}>
                                <SelectTrigger className="w-32 text-xs sm:text-sm">
                                    <SelectValue placeholder="Niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Avertissement</SelectItem>
                                    <SelectItem value="error">Erreur</SelectItem>
                                    <SelectItem value="critical">Critique</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Exporter</span>
                                <span className="sm:hidden">Export</span>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Niveau</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logsData.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{getLogLevelBadge(log.level)}</TableCell>
                                            <TableCell className="max-w-md truncate">{log.message}</TableCell>
                                            <TableCell>{log.module}</TableCell>
                                            <TableCell>{log.user || 'Système'}</TableCell>
                                            <TableCell>{log.timestamp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sauvegardes */}
                <TabsContent value="backup" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-semibold">Gestion des Sauvegardes</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={() => setShowBackupDialog(true)}
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Nouvelle Sauvegarde</span>
                                <span className="sm:hidden">Nouvelle</span>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fichier</TableHead>
                                        <TableHead>Taille</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {backupList.map((backup) => (
                                        <TableRow key={backup.id}>
                                            <TableCell className="font-mono text-sm">
                                                {backup.filename}
                                            </TableCell>
                                            <TableCell>{backup.size}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        backup.type === 'full' ? 'default' : 'secondary'
                                                    }
                                                >
                                                    {backup.type === 'full' ? 'Complète' : 'Incrémentale'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {backup.status === 'completed' ? (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Terminée
                                                    </Badge>
                                                ) : backup.status === 'failed' ? (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        Échouée
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-800">
                                                        En cours
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{backup.createdAt}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!backup.downloadUrl) {
                                                                toast.error('Aucune URL de téléchargement disponible pour cette sauvegarde');
                                                                return;
                                                            }
                                                            try {
                                                                window.open(backup.downloadUrl, '_blank', 'noopener,noreferrer');
                                                            } catch {
                                                                toast.error('Impossible d\'ouvrir le lien de téléchargement');
                                                            }
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBackup(backup);
                                                            setShowBackupDetails(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            const confirmed = window.confirm(
                                                                `Supprimer définitivement la sauvegarde "${backup.filename}" ?`,
                                                            );
                                                            if (!confirmed) return;

                                                            try {
                                                                await monitoringService.deleteBackup(backup.id);
                                                                toast.success('Sauvegarde supprimée');
                                                                const data = await monitoringService.getBackups();
                                                                const mapped = mapBackupsResponseToList(data as any);
                                                                setBackupList(mapped);
                                                            } catch (error: any) {
                                                                toast.error(error?.message || 'Erreur lors de la suppression de la sauvegarde');
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Dialog open={showBackupDetails} onOpenChange={(open) => {
                        setShowBackupDetails(open);
                        if (!open) {
                            setSelectedBackup(null);
                        }
                    }}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Détails de la sauvegarde</DialogTitle>
                                <DialogDescription>
                                    Informations détaillées sur la sauvegarde sélectionnée.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedBackup ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-medium">Fichier :</span>{' '}
                                        <span className="font-mono">{selectedBackup.filename}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Taille :</span>{' '}
                                        {selectedBackup.size}
                                    </div>
                                    <div>
                                        <span className="font-medium">Type :</span>{' '}
                                        {selectedBackup.type === 'full' ? 'Complète' : 'Incrémentale'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Statut :</span>{' '}
                                        {selectedBackup.status === 'completed'
                                            ? 'Terminée'
                                            : selectedBackup.status === 'failed'
                                                ? 'Échouée'
                                                : 'En cours'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Date de création :</span>{' '}
                                        {selectedBackup.createdAt}
                                    </div>
                                    {selectedBackup.duration && (
                                        <div>
                                            <span className="font-medium">Durée estimée :</span>{' '}
                                            {selectedBackup.duration}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t mt-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium">Lien de téléchargement :</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedBackup.downloadUrl}
                                                    onClick={() => {
                                                        if (!selectedBackup.downloadUrl) return;
                                                        window.open(selectedBackup.downloadUrl, '_blank', 'noopener,noreferrer');
                                                    }}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Ouvrir
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!selectedBackup.downloadUrl || !navigator.clipboard}
                                                    onClick={async () => {
                                                        if (!selectedBackup.downloadUrl || !navigator.clipboard) return;
                                                        try {
                                                            await navigator.clipboard.writeText(selectedBackup.downloadUrl);
                                                            toast.success('Lien de sauvegarde copié dans le presse-papiers');
                                                        } catch {
                                                            toast.error('Impossible de copier le lien');
                                                        }
                                                    }}
                                                >
                                                    Copier le lien
                                                </Button>
                                            </div>
                                        </div>
                                        {!selectedBackup.downloadUrl && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Aucun lien Cloudinary n'est disponible pour cette sauvegarde.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Aucune sauvegarde sélectionnée.
                                </p>
                            )}
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Nouvelle sauvegarde</DialogTitle>
                                <DialogDescription>
                                    Cette action va lancer une nouvelle sauvegarde réelle de la
                                    base de données et l'envoyer sur le stockage Cloudinary.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Cette opération peut prendre plusieurs secondes en fonction
                                    de la taille de la base de données. Vous pouvez continuer à
                                    utiliser le tableau de bord pendant le traitement.
                                </p>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowBackupDialog(false)}
                                        disabled={backupLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        disabled={backupLoading}
                                        onClick={async () => {
                                            try {
                                                setBackupLoading(true);
                                                await monitoringService.createBackup();
                                                toast.success('Sauvegarde lancée avec succès');
                                                // Recharger la liste des sauvegardes
                                                const data = await monitoringService.getBackups();
                                                const mapped = mapBackupsResponseToList(data as any);
                                                setBackupList(mapped);
                                                setShowBackupDialog(false);
                                            } catch (error: any) {
                                                toast.error(error?.message || 'Erreur lors du lancement de la sauvegarde');
                                            } finally {
                                                setBackupLoading(false);
                                            }
                                        }}
                                    >
                                        {backupLoading ? 'Lancement…' : 'Valider'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Sécurité */}
                <TabsContent value="security" className="space-y-4 sm:space-y-6">
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Paramètres de Sécurité
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Niveau de Sécurité</Label>
                                        <p className="text-xs text-gray-500">
                                            Basé sur les notifications, sauvegardes automatiques,
                                            timeout de session et tentatives max de connexion.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={securityBadgeClasses}>
                                        {securityLevel}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Notifications Email</Label>
                                        <p className="text-xs text-gray-500">
                                            Alertes de sécurité par email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={securityConfig.emailNotifications}
                                        onCheckedChange={(checked: boolean) =>
                                            setSecurityConfig({
                                                ...securityConfig,
                                                emailNotifications: checked
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Sauvegarde Automatique</Label>
                                        <p className="text-xs text-gray-500">
                                            {securityConfig.backupFrequency === 'weekly'
                                                ? 'Sauvegarde hebdomadaire'
                                                : securityConfig.backupFrequency === 'monthly'
                                                    ? 'Sauvegarde mensuelle'
                                                    : 'Sauvegarde quotidienne'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={securityConfig.autoBackup}
                                        onCheckedChange={async (checked: boolean) => {
                                            setSecurityConfig({
                                                ...securityConfig,
                                                autoBackup: checked,
                                            });
                                            try {
                                                await settingService.updateSettingByKey(SettingKey.BACKUP_AUTO_ENABLED, {
                                                    value: checked ? 'true' : 'false',
                                                });
                                                toast.success('Sauvegarde automatique mise à jour');
                                            } catch (error: any) {
                                                toast.error(error?.message || 'Erreur lors de la mise à jour de la sauvegarde automatique');
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Authentification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Timeout de Session (minutes)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={securityConfig.sessionTimeout}
                                        onChange={(e) =>
                                            setSecurityConfig({
                                                ...securityConfig,
                                                sessionTimeout: parseInt(e.target.value)
                                            })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        Tentatives de Connexion Max
                                    </Label>
                                    <Input
                                        type="number"
                                        value={securityConfig.maxLoginAttempts}
                                        onChange={(e) =>
                                            setSecurityConfig({
                                                ...securityConfig,
                                                maxLoginAttempts: parseInt(e.target.value)
                                            })
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Fréquence de Sauvegarde
                                    </Label>
                                    <Select
                                        value={securityConfig.backupFrequency}
                                        onValueChange={(
                                            value: 'daily' | 'weekly' | 'monthly'
                                        ) =>
                                            setSecurityConfig({
                                                ...securityConfig,
                                                backupFrequency: value
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Quotidienne</SelectItem>
                                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                            <SelectItem value="monthly">Mensuelle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
};