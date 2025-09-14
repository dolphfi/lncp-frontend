/*eslint-disable*/
/**
 * =====================================================
 * PAGE PANEL ADMIN
 * =====================================================
 * Interface d'administration complète pour :
 * - Gestion des utilisateurs et permissions
 * - Configuration système
 * - Sauvegarde et maintenance
 * - Logs et audit
 * - Paramètres avancés
 */

import React, {useState, useEffect} from 'react';
import {
    Users,
    Shield,
    Settings,
    Database,
    Activity,
    AlertTriangle,
    Download,
    Upload,
    Trash2,
    Eye,
    Edit,
    Plus,
    RefreshCw,
    Save,
    Lock,
    Key,
    CheckCircle,
    X
} from 'lucide-react';

import {Button} from '../../ui/button';
import {Input} from '../../ui/input';
import {Label} from '../../ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '../../ui/card';
import {Badge} from '../../ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../ui/select';
// AlertDialog not used; we implement a controlled Dialog for reliability
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../../ui/tabs';
import {Switch} from '../../ui/switch';
import {Textarea} from '../../ui/textarea';
import {useClassroomStore} from '../../../stores/classroomStore';
import {useAcademicYearStore} from '../../../stores/academicYearStore';
import {toast} from 'react-toastify';

// Types pour les données d'administration
interface SystemUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'user' | 'viewer';
    status: 'active' | 'inactive' | 'suspended';
    lastLogin: string;
    permissions: string[];
    createdAt: string;
}

interface SystemLog {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    user?: string;
    timestamp: string;
    module: string;
    details?: string;
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

interface BackupInfo {
    id: string;
    filename: string;
    size: string;
    type: 'full' | 'incremental';
    status: 'completed' | 'failed' | 'in_progress';
    createdAt: string;
    duration: string;
}

// Nouveaux types pour les années académiques et classes
interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'inactive' | 'planned' | 'completed';
    isCurrent: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface SchoolClass {
    id: string;
    level: 'NSI' | 'NSII' | 'NSIII' | 'NSIV';
    roomName: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

const AdminPanel: React.FC = () => { // États locaux
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState < SystemUser[] > ([]);
    const [logs, setLogs] = useState < SystemLog[] > ([]);
    const [config, setConfig] = useState < SystemConfig > ({
        schoolName: 'Lycée National Charlemagne Péralte',
        schoolAddress: '123 Rue de l\'Éducation, Port-au-Prince, Haïti',
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
    const [backups, setBackups] = useState < BackupInfo[] > ([]);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    // const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

    // Store Zustand pour les années académiques
    const {
        academicYears,
        currentAcademicYear,
        loading: academicYearLoading,
        error: academicYearError,
        fetchAllAcademicYears,
        fetchCurrentAcademicYear,
        createAcademicYear,
        setCurrentAcademicYear,
        clearError
    } = useAcademicYearStore();
    const [showAcademicYearDialog, setShowAcademicYearDialog] = useState(false);
    // const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
    // const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

    // Charger les données
    useEffect(() => {
        loadAdminData();
        fetchAllAcademicYears();
        fetchCurrentAcademicYear();
    }, [fetchAllAcademicYears, fetchCurrentAcademicYear]);

    const loadAdminData = () => { // Simuler le chargement des données
        setUsers([
            {
                id: '1',
                username: 'admin',
                email: 'admin@lncp.edu.ht',
                role: 'admin',
                status: 'active',
                lastLogin: '2024-06-28 10:30:00',
                permissions: ['all'],
                createdAt: '2024-01-01'
            }, {
                id: '2',
                username: 'directeur',
                email: 'directeur@lncp.edu.ht',
                role: 'manager',
                status: 'active',
                lastLogin: '2024-06-27 15:45:00',
                permissions: [
                    'students', 'employees', 'courses', 'reports'
                ],
                createdAt: '2024-01-15'
            }, {
                id: '3',
                username: 'secretaire',
                email: 'secretaire@lncp.edu.ht',
                role: 'user',
                status: 'active',
                lastLogin: '2024-06-28 09:15:00',
                permissions: [
                    'students', 'courses'
                ],
                createdAt: '2024-02-01'
            }
        ]);

        setLogs([
            {
                id: '1',
                level: 'info',
                message: 'Sauvegarde automatique terminée avec succès',
                user: 'system',
                timestamp: '2024-06-28 02:00:00',
                module: 'backup'
            }, {
                id: '2',
                level: 'warning',
                message: 'Tentative de connexion échouée pour l\'utilisateur test',
                user: 'test',
                timestamp: '2024-06-28 10:15:00',
                module: 'auth'
            }, {
                id: '3',
                level: 'error',
                message: 'Erreur lors de la génération du rapport mensuel',
                user: 'directeur',
                timestamp: '2024-06-27 16:30:00',
                module: 'reports'
            }
        ]);

        setBackups([
            {
                id: '1',
                filename: 'backup_2024_06_28_020000.sql',
                size: '2.5 GB',
                type: 'full',
                status: 'completed',
                createdAt: '2024-06-28 02:00:00',
                duration: '15 min'
            }, {
                id: '2',
                filename: 'backup_2024_06_27_020000.sql',
                size: '2.3 GB',
                type: 'full',
                status: 'completed',
                createdAt: '2024-06-27 02:00:00',
                duration: '12 min'
            }
        ]);

        // Les années académiques sont maintenant chargées via le store Zustand

        // Supprimé: chargement de classes fictives (désormais géré par l'onglet Classes via API)
    };

    const getLogLevelBadge = (level : string) => {
        switch (level) {
            case 'info':
                return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
            case 'critical':
                return <Badge className="bg-red-600 text-white">Critique</Badge>;
            default:
                return <Badge variant="outline"> {level}</Badge>;
        }
    };

    

    const getRoleBadge = (role : string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-red-100 text-red-800">Administrateur</Badge>;
            case 'manager':
                return <Badge className="bg-blue-100 text-blue-800">Gestionnaire</Badge>;
            case 'user':
                return <Badge className="bg-green-100 text-green-800">Utilisateur</Badge>;
            case 'viewer':
                return <Badge className="bg-gray-100 text-gray-800">Lecteur</Badge>;
            default:
                return <Badge variant="outline"> {role}</Badge>;
        }
    };

    const getStatusBadge = (status : string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
            case 'suspended':
                return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
            default:
                return <Badge variant="outline"> {status}</Badge>;
        }
    };

    const getAcademicYearStatusBadge = (status : string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">En cours</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            case 'planned':
                return <Badge className="bg-blue-100 text-blue-800">Planifiée</Badge>;
            case 'completed':
                return <Badge className="bg-purple-100 text-purple-800">Terminée</Badge>;
            default:
                return <Badge variant="outline"> {status}</Badge>;
        }
    };

    const getClassStatusBadge = (status : string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            default:
                return <Badge variant="outline"> {status}</Badge>;
        }
    };

    return (<div className="container mx-auto px-4 py-6"> {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Panel d'Administration
                </h1>
                <p className="text-gray-600">
                    Gestion complète du système et des utilisateurs
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline"
                    onClick={loadAdminData}>
                    <RefreshCw className="h-4 w-4 mr-2"/>
                    Actualiser
                </Button>
                <Button onClick={
                    () => setShowConfigDialog(true)
                }>
                    <Settings className="h-4 w-4 mr-2"/>
                    Configuration
                </Button>
            </div>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="academic-years">Années Académiques</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="logs">Logs système</TabsTrigger>
                <TabsTrigger value="backup">Sauvegardes</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6"> {/* Statistiques système */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold"> {
                                users.filter(u => u.status === 'active').length
                            }</div>
                            <p className="text-xs text-muted-foreground">sur {
                                users.length
                            }
                                total</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Erreurs Aujourd'hui</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600"> {
                                logs.filter(l => l.level === 'error' || l.level === 'critical').length
                            } </div>
                            <p className="text-xs text-muted-foreground">Erreurs critiques</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dernière Sauvegarde</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600"> {
                                backups.length > 0 ? 'OK' : 'Aucune'
                            } </div>
                            <p className="text-xs text-muted-foreground"> {
                                backups.length > 0 ? backups[0].createdAt : 'Sauvegarde requise'
                            } </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mode Maintenance</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch checked={
                                        config.maintenanceMode
                                    }
                                    onCheckedChange={
                                        (checked : boolean) => setConfig({
                                            ...config,
                                            maintenanceMode: checked
                                        })
                                    }/>
                                <span className="text-sm"> {
                                    config.maintenanceMode ? 'Activé' : 'Désactivé'
                                }</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Configuration rapide */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"> {/* Building icon removed as per edit hint */}
                                Informations de l'École
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium">Nom de l'école</Label>
                                <p className="text-sm text-gray-600"> {
                                    config.schoolName
                                }</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Adresse</Label>
                                <p className="text-sm text-gray-600"> {
                                    config.schoolAddress
                                }</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Téléphone</Label>
                                <p className="text-sm text-gray-600"> {
                                    config.schoolPhone
                                }</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm text-gray-600"> {
                                    config.schoolEmail
                                }</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5"/>
                                Activité Récente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3"> {
                                logs.slice(0, 5).map((log) => (<div key={
                                        log.id
                                    }
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <div className="p-1 rounded"> {
                                        getLogLevelBadge(log.level)
                                    } </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium"> {
                                            log.message
                                        }</div>
                                        <div className="text-xs text-gray-500"> {
                                            log.timestamp
                                        }</div>
                                    </div>
                                </div>))
                            } </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* Gestion des classes (branché sur l'API) */}
            <TabsContent value="classes" className="space-y-6">
                <ClassroomsTab/>
            </TabsContent>

            {/* Gestion des utilisateurs */}
            <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
                    <Button onClick={
                        () => setShowUserDialog(true)
                    }>
                        <Plus className="h-4 w-4 mr-2"/>
                        Nouvel Utilisateur
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Dernière Connexion</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody> {
                                users.map((user) => (<TableRow key={
                                    user.id
                                }>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium"> {
                                                user.username
                                            }</div>
                                            <div className="text-sm text-gray-500"> {
                                                user.email
                                            }</div>
                                        </div>
                                    </TableCell>
                                    <TableCell> {
                                        getRoleBadge(user.role)
                                    }</TableCell>
                                    <TableCell> {
                                        getStatusBadge(user.status)
                                    }</TableCell>
                                    <TableCell> {
                                        user.lastLogin
                                    }</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Lock className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>))
                            } </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Gestion des années académiques */}
            <TabsContent value="academic-years" className="space-y-6">
                <AcademicYearTab />
            </TabsContent>


            {/* Logs système */}
            <TabsContent value="logs" className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Logs Système</h2>
                    <div className="flex gap-2">
                        <Select>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Niveau"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Avertissement</SelectItem>
                                <SelectItem value="error">Erreur</SelectItem>
                                <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2"/>
                            Exporter
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
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
                            <TableBody> {
                                logs.map((log) => (<TableRow key={
                                    log.id
                                }>
                                    <TableCell> {
                                        getLogLevelBadge(log.level)
                                    }</TableCell>
                                    <TableCell className="max-w-md truncate"> {
                                        log.message
                                    }</TableCell>
                                    <TableCell> {
                                        log.module
                                    }</TableCell>
                                    <TableCell> {
                                        log.user || 'Système'
                                    }</TableCell>
                                    <TableCell> {
                                        log.timestamp
                                    }</TableCell>
                                </TableRow>))
                            } </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Sauvegardes */}
            <TabsContent value="backup" className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestion des Sauvegardes</h2>
                    <div className="flex gap-2">
                        <Button onClick={
                            () => setShowBackupDialog(true)
                        }>
                            <Database className="h-4 w-4 mr-2"/>
                            Nouvelle Sauvegarde
                        </Button>
                        <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2"/>
                            Restaurer
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
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
                            <TableBody> {
                                backups.map((backup) => (<TableRow key={
                                    backup.id
                                }>
                                    <TableCell className="font-mono text-sm"> {
                                        backup.filename
                                    }</TableCell>
                                    <TableCell> {
                                        backup.size
                                    }</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            backup.type === 'full' ? 'default' : 'secondary'
                                        }> {
                                            backup.type === 'full' ? 'Complète' : 'Incrémentale'
                                        } </Badge>
                                    </TableCell>
                                    <TableCell> {
                                        backup.status === 'completed' ? (<Badge className="bg-green-100 text-green-800">Terminée</Badge>) : backup.status === 'failed' ? (<Badge className="bg-red-100 text-red-800">Échouée</Badge>) : (<Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>)
                                    } </TableCell>
                                    <TableCell> {
                                        backup.createdAt
                                    }</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>))
                            } </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5"/>
                                Paramètres de Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">Mode Maintenance</Label>
                                    <p className="text-xs text-gray-500">Bloquer l'accès aux utilisateurs</p>
                                </div>
                                <Switch checked={
                                        config.maintenanceMode
                                    }
                                    onCheckedChange={
                                        (checked : boolean) => setConfig({
                                            ...config,
                                            maintenanceMode: checked
                                        })
                                    }/>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">Notifications Email</Label>
                                    <p className="text-xs text-gray-500">Alertes de sécurité par email</p>
                                </div>
                                <Switch checked={
                                        config.emailNotifications
                                    }
                                    onCheckedChange={
                                        (checked : boolean) => setConfig({
                                            ...config,
                                            emailNotifications: checked
                                        })
                                    }/>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">Sauvegarde Automatique</Label>
                                    <p className="text-xs text-gray-500">Sauvegarde quotidienne</p>
                                </div>
                                <Switch checked={
                                        config.autoBackup
                                    }
                                    onCheckedChange={
                                        (checked : boolean) => setConfig({
                                            ...config,
                                            autoBackup: checked
                                        })
                                    }/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5"/>
                                Authentification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Timeout de Session (minutes)</Label>
                                <Input type="number"
                                    value={
                                        config.sessionTimeout
                                    }
                                    onChange={
                                        (e) => setConfig({
                                            ...config,
                                            sessionTimeout: parseInt(e.target.value)
                                        })
                                    }
                                    className="mt-1"/>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Tentatives de Connexion Max</Label>
                                <Input type="number"
                                    value={
                                        config.maxLoginAttempts
                                    }
                                    onChange={
                                        (e) => setConfig({
                                            ...config,
                                            maxLoginAttempts: parseInt(e.target.value)
                                        })
                                    }
                                    className="mt-1"/>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Fréquence de Sauvegarde</Label>
                                <Select value={
                                        config.backupFrequency
                                    }
                                    onValueChange={
                                        (value : 'daily' | 'weekly' | 'monthly') => setConfig({
                                            ...config,
                                            backupFrequency: value
                                        })
                                }>
                                    <SelectTrigger>
                                        <SelectValue/>
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

        {/* Dialogues */}

        {/* Dialogue de configuration */}
        <Dialog open={showConfigDialog}
            onOpenChange={setShowConfigDialog}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Configuration Système</DialogTitle>
                    <DialogDescription>
                        Modifiez les paramètres généraux du système
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nom de l'école</Label>
                            <Input value={
                                    config.schoolName
                                }
                                onChange={
                                    (e) => setConfig({
                                        ...config,
                                        schoolName: e.target.value
                                    })
                                }/>
                        </div>
                        <div>
                            <Label>Année Académique</Label>
                            <Input value={
                                    config.academicYear
                                }
                                onChange={
                                    (e) => setConfig({
                                        ...config,
                                        academicYear: e.target.value
                                    })
                                }/>
                        </div>
                    </div>
                    <div>
                        <Label>Adresse</Label>
                        <Input value={
                                config.schoolAddress
                            }
                            onChange={
                                (e) => setConfig({
                                    ...config,
                                    schoolAddress: e.target.value
                                })
                            }/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Téléphone</Label>
                            <Input value={
                                    config.schoolPhone
                                }
                                onChange={
                                    (e) => setConfig({
                                        ...config,
                                        schoolPhone: e.target.value
                                    })
                                }/>
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input value={
                                    config.schoolEmail
                                }
                                onChange={
                                    (e) => setConfig({
                                        ...config,
                                        schoolEmail: e.target.value
                                    })
                                }/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline"
                            onClick={
                                () => setShowConfigDialog(false)
                        }>
                            Annuler
                        </Button>
                        <Button onClick={
                            () => setShowConfigDialog(false)
                        }>
                            <Save className="h-4 w-4 mr-2"/>
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        


        {/* Section de création de classe fictive retirée: gérée par l'onglet Classes */} </div>);
};

// ---- Tab component: Academic Years ----
const AcademicYearTab: React.FC = () => {
    const {
        academicYears,
        currentAcademicYear,
        loading,
        error,
        fetchAllAcademicYears,
        fetchCurrentAcademicYear,
        createAcademicYear,
        updateAcademicYear,
        getAcademicYearById,
        setAcademicYearAsCurrent,
        clearError
    } = useAcademicYearStore();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        label: '',
        dateDebut: '',
        dateFin: ''
    });

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        label: '',
        dateDebut: '',
        dateFin: '',
        statut: ''
    });

    // Charger les données au montage
    useEffect(() => {
        fetchAllAcademicYears();
        fetchCurrentAcademicYear();
    }, [fetchAllAcademicYears, fetchCurrentAcademicYear]);

    // Gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validation
        if (!formData.label || !formData.dateDebut || !formData.dateFin) {
            setSubmitError("Tous les champs sont requis");
            return;
        }

        const debut = new Date(formData.dateDebut);
        const fin = new Date(formData.dateFin);
        if (debut >= fin) {
            setSubmitError("La date de fin doit être postérieure à la date de début");
            return;
        }

        try {
            await createAcademicYear(formData);
            setShowAddDialog(false);
            setFormData({ label: '', dateDebut: '', dateFin: '' });
            toast.success('Année académique créée avec succès');
        } catch (error: any) {
            setSubmitError(error.message || "Une erreur s'est produite lors de la création");
        }
    };

    // Ouvrir le modal de visualisation
    const handleView = async (academicYear: any) => {
        try {
            const yearDetails = await getAcademicYearById(academicYear.id);
            setSelectedYear(yearDetails);
            setShowViewDialog(true);
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors du chargement des détails');
        }
    };

    // Ouvrir le modal d'édition
    const handleEdit = async (academicYear: any) => {
        try {
            const yearDetails = await getAcademicYearById(academicYear.id);
            setSelectedYear(yearDetails);
            setEditFormData({
                label: yearDetails.label,
                dateDebut: yearDetails.dateDebut.split('T')[0], // Format YYYY-MM-DD
                dateFin: yearDetails.dateFin.split('T')[0],
                statut: yearDetails.statut
            });
            setShowEditDialog(true);
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors du chargement des détails');
        }
    };

    // Gérer la soumission du formulaire d'édition
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);

        // Validation
        if (!editFormData.label || !editFormData.dateDebut || !editFormData.dateFin) {
            setEditError("Tous les champs sont requis");
            return;
        }

        const debut = new Date(editFormData.dateDebut);
        const fin = new Date(editFormData.dateFin);
        if (debut >= fin) {
            setEditError("La date de fin doit être postérieure à la date de début");
            return;
        }

        try {
            await updateAcademicYear(selectedYear.id, {
                label: editFormData.label,
                dateDebut: editFormData.dateDebut,
                dateFin: editFormData.dateFin,
                statut: editFormData.statut as any
            });
            setShowEditDialog(false);
            setSelectedYear(null);
            setEditFormData({ label: '', dateDebut: '', dateFin: '', statut: '' });
            toast.success('Année académique mise à jour avec succès');
        } catch (error: any) {
            setEditError(error.message || "Une erreur s'est produite lors de la mise à jour");
        }
    };

    // Définir une année comme courante
    const handleSetCurrent = async (academicYear: any) => {
        try {
            await setAcademicYearAsCurrent(academicYear.id);
            toast.success(`Année ${academicYear.label} définie comme courante`);
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la mise à jour');
        }
    };

    const getAcademicYearStatusBadge = (statut: string) => {
        switch (statut) {
            case 'En cours':
                return <Badge className="bg-green-100 text-green-800">En cours</Badge>;
            case 'Planifiée':
                return <Badge className="bg-blue-100 text-blue-800">Planifiée</Badge>;
            case 'Terminée':
                return <Badge className="bg-purple-100 text-purple-800">Terminée</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion des Années Académiques</h2>
                <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Année
                </Button>
            </div>

            {/* Affichage des erreurs */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Année académique courante */}
            {currentAcademicYear && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Année Académique Courante
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                    {currentAcademicYear.label}
                                </h3>
                                <p className="text-green-700 dark:text-green-300">
                                    Du {new Date(currentAcademicYear.dateDebut).toLocaleDateString()} 
                                    au {new Date(currentAcademicYear.dateFin).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                                Actuelle
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Table des années académiques */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
                        </div>
                    ) : academicYears.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">Aucune année académique trouvée</p>
                            <Button 
                                onClick={() => setShowAddDialog(true)} 
                                className="mt-4"
                                variant="outline"
                            >
                                Créer la première année
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Année</TableHead>
                                    <TableHead>Période</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {academicYears.map((year) => (
                                    <TableRow key={year.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{year.label}</div>
                                                {currentAcademicYear?.id === year.id && (
                                                    <Badge className="bg-blue-100 text-blue-800 text-xs">Année courante</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>Du {new Date(year.dateDebut).toLocaleDateString()}</div>
                                                <div>Au {new Date(year.dateFin).toLocaleDateString()}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getAcademicYearStatusBadge(year.statut)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleView(year)}
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleEdit(year)}
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {currentAcademicYear?.id !== year.id && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-green-600"
                                                        onClick={() => handleSetCurrent(year)}
                                                        title="Définir comme courante"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog d'ajout d'année académique */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle Année Académique</DialogTitle>
                    </DialogHeader>

                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">
                                Libellé <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={formData.label}
                                onChange={(e) => setFormData({...formData, label: e.target.value})}
                                placeholder="Ex: 2025-2026"
                                className="h-9"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Date de début <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                                className="h-9"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Date de fin <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={formData.dateFin}
                                onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                                className="h-9"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddDialog(false);
                                    setFormData({ label: '', dateDebut: '', dateFin: '' });
                                    setSubmitError(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Création...' : 'Créer'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog de visualisation */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails de l'Année Académique</DialogTitle>
                    </DialogHeader>

                    {selectedYear && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Libellé</Label>
                                <p className="text-sm bg-gray-50 p-2 rounded border">{selectedYear.label}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Date de début</Label>
                                    <p className="text-sm bg-gray-50 p-2 rounded border">
                                        {new Date(selectedYear.dateDebut).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Date de fin</Label>
                                    <p className="text-sm bg-gray-50 p-2 rounded border">
                                        {new Date(selectedYear.dateFin).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Statut</Label>
                                <div className="mt-1">
                                    {getAcademicYearStatusBadge(selectedYear.statut)}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Année courante</Label>
                                <p className="text-sm bg-gray-50 p-2 rounded border">
                                    {selectedYear.isCurrent ? 'Oui' : 'Non'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Créée le</Label>
                                    <p className="text-sm bg-gray-50 p-2 rounded border">
                                        {new Date(selectedYear.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Modifiée le</Label>
                                    <p className="text-sm bg-gray-50 p-2 rounded border">
                                        {new Date(selectedYear.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowViewDialog(false);
                                        setSelectedYear(null);
                                    }}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog d'édition */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier l'Année Académique</DialogTitle>
                    </DialogHeader>

                    {editError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {editError}
                        </div>
                    )}

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">
                                Libellé <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={editFormData.label}
                                onChange={(e) => setEditFormData({...editFormData, label: e.target.value})}
                                placeholder="Ex: 2025-2026"
                                className="h-9"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Date de début <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={editFormData.dateDebut}
                                onChange={(e) => setEditFormData({...editFormData, dateDebut: e.target.value})}
                                className="h-9"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Date de fin <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={editFormData.dateFin}
                                onChange={(e) => setEditFormData({...editFormData, dateFin: e.target.value})}
                                className="h-9"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Statut</Label>
                            <Select 
                                value={editFormData.statut} 
                                onValueChange={(value) => setEditFormData({...editFormData, statut: value})}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planifiée">Planifiée</SelectItem>
                                    <SelectItem value="En cours">En cours</SelectItem>
                                    <SelectItem value="Terminée">Terminée</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowEditDialog(false);
                                    setSelectedYear(null);
                                    setEditFormData({ label: '', dateDebut: '', dateFin: '', statut: '' });
                                    setEditError(null);
                                }}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Mise à jour...' : 'Mettre à jour'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ---- Tab component: Classes ----
const ClassroomsTab: React.FC = () => {
    const {
        items,
        loading,
        error,
        fetchAll,
        create,
        update,
        getDetails,
        remove,
        addRoom,
        updateRoom,
        deleteRoom,
        page,
        limit,
        total
    } = useClassroomStore();
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const toggleExpanded = (id : string) => setExpanded(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
    // Section 1: création de niveau/classe
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [initialRooms, setInitialRooms] = React.useState<Array<{ id: string; name: string; capacity: number | '' }>>([]);
    const [showInitialRooms, setShowInitialRooms] = React.useState(true);
    const [showCreate, setShowCreate] = React.useState(false);
    // Section 2: ajout de salle
    const [selectedClassId, setSelectedClassId] = React.useState<string>('');
    const [roomName, setRoomName] = React.useState('');
    const [roomCapacity, setRoomCapacity] = React.useState<number | ''>('');
    const [showAddRoom, setShowAddRoom] = React.useState(false);

    // Edition d'une salle
    const [showEditRoom, setShowEditRoom] = React.useState(false);
    const [editClassId, setEditClassId] = React.useState('');
    const [editRoomId, setEditRoomId] = React.useState('');
    const [editRoomName, setEditRoomName] = React.useState('');
    const [editRoomCapacity, setEditRoomCapacity] = React.useState<number | ''>('');
    const [editRoomStatus, setEditRoomStatus] = React.useState<string>('Disponible');

    // --- Etats et handlers de gestion de classe ---
    const [showEditClass, setShowEditClass] = React.useState(false);
    const [editClassName, setEditClassName] = React.useState('');
    const [editClassDescription, setEditClassDescription] = React.useState('');

    const handleOpenEditClass = (cls: any) => {
        setEditClassId(cls.id);
        setEditClassName(cls.name || '');
        setEditClassDescription(cls.description || '');
        setShowEditClass(true);
    };

    const handleUpdateClass = async () => {
        if (!editClassId) { toast.error('Classe invalide'); return; }
        if (!editClassName.trim()) { toast.error('Le nom est requis'); return; }
        try {
            await update(editClassId, { name: editClassName.trim(), description: editClassDescription || undefined });
            toast.success('Classe mise à jour');
            setShowEditClass(false);
        } catch (e: any) {
            toast.error(e?.message || 'Erreur lors de la mise à jour de la classe');
        }
    };

    const [showClassDetails, setShowClassDetails] = React.useState(false);
    const [detailsLoading, setDetailsLoading] = React.useState(false);
    const [detailsData, setDetailsData] = React.useState<any>(null);

    const handleOpenDetails = async (id: string) => {
        setDetailsLoading(true);
        setShowClassDetails(true);
        try {
            await getDetails(id);
            const current = useClassroomStore.getState().current;
            setDetailsData(current || null);
        } catch (e) {
            setDetailsData(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const [showDeleteClass, setShowDeleteClass] = React.useState(false);
    const [deleteTargetClassId, setDeleteTargetClassId] = React.useState('');
    const [deleteTargetClassName, setDeleteTargetClassName] = React.useState('');

    const openDeleteClass = (cls: any) => {
        setDeleteTargetClassId(cls.id);
        setDeleteTargetClassName(cls.name || '');
        setShowDeleteClass(true);
    };

    const handleDeleteClass = async () => {
        try {
            await remove(deleteTargetClassId);
            toast.success('Classe supprimée');
            setShowDeleteClass(false);
        } catch (e: any) {
            toast.error(e?.message || 'Erreur lors de la suppression de la classe');
        }
    };

    // Delete room dialog states
    const [showDeleteRoom, setShowDeleteRoom] = React.useState(false);
    const [deleteClassId, setDeleteClassId] = React.useState('');
    const [deleteRoomId, setDeleteRoomId] = React.useState('');
    const [deleteRoomName, setDeleteRoomName] = React.useState('');


    const handleOpenEditRoom = (classId: string, room: any) => {
        setEditClassId(classId);
        setEditRoomId(room.id);
        setEditRoomName(room.name || '');
        setEditRoomCapacity(typeof room.capacity === 'number' ? room.capacity : '');
        setEditRoomStatus((room as any).status || 'Disponible');
        setShowEditRoom(true);
    };

    const handleUpdateRoom = async () => {
        if (!editClassId || !editRoomId) {
            toast.error('Classe ou salle invalide');
            return;
        }
        if (!editRoomName.trim()) {
            toast.error('Le nom de la salle est requis');
            return;
        }
        if (editRoomCapacity === '' || Number(editRoomCapacity) < 0) {
            toast.error('Capacité invalide');
            return;
        }
        try {
            await updateRoom(editClassId, editRoomId, {
                name: editRoomName.trim(),
                capacity: Number(editRoomCapacity),
                status: editRoomStatus,
            });
            toast.success('Salle mise à jour');
            setShowEditRoom(false);
        } catch (e: any) {
            toast.error(e?.message || 'Erreur lors de la mise à jour de la salle');
        }
    };

    const handleAddRoom = async () => {
        if (!selectedClassId) {
            toast.error('Sélectionnez une classe');
            return;
        }
        if (!roomName.trim()) {
            toast.error('Le nom de la salle est requis');
            return;
        }
        if (roomCapacity === '' || Number(roomCapacity) <= 0) {
            toast.error('La capacité doit être > 0');
            return;
        }
        try {
            await addRoom(selectedClassId, {
                name: roomName.trim(),
                capacity: Number(roomCapacity)
            });
            setRoomName('');
            setRoomCapacity('');
            toast.success('Salle ajoutée');
        } catch (e : any) {
            toast.error(e ?. message || "Erreur lors de l'ajout de la salle");
        }
    };

    React.useEffect(() => {
        fetchAll(page || 1, limit || 10);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Le nom est requis');
            return;
        }
        try {
            const rooms = initialRooms.filter(r => r.name.trim() && Number(r.capacity) >= 0).map(r => ({
                name: r.name.trim(),
                capacity: Number(r.capacity)
            }));
            await create({
                name: name.trim(),
                description: description || undefined,
                rooms: rooms.length ? rooms : undefined
            });
            setName('');
            setDescription('');
            setInitialRooms([]);
            toast.success('Classe créée');
        } catch (e : any) {
            toast.error(e ?. message || 'Erreur lors de la création');
        }
    };

    return (<div className="space-y-4"> {/* Section 1: Gestion des classes (Niveaux) */}
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gestion des Classes</h2>
            <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2"/>
                    Nouveau Classe
                </Button>
                <Button onClick={() => setShowAddRoom(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2"/>
                    Ajouter une salle
                </Button>
            </div>
        </div>

        {
        error && <div className="text-red-600 text-sm"> {error}</div>
    }

        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Classes</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Salles</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody> {
                        items.map((c) => (<React.Fragment key={
                            c.id
                        }>
                            <TableRow>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm"
                                            onClick={
                                                () => toggleExpanded(c.id)
                                            }
                                            className="px-2"> {
                                            expanded[c.id] ? '▾' : '▸'
                                        } </Button>
                                        <span> {
                                            c.name
                                        }</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[320px] truncate text-muted-foreground"> {
                                    c.description || '—'
                                }</TableCell>
                                <TableCell> {
                                    c.rooms ?. length ?? 0
                                }</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" title="Éditer la classe" onClick={() => handleOpenEditClass(c)}>
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="outline" size="sm" title="Détails" onClick={() => handleOpenDetails(c.id)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        {(c.rooms?.length ?? 0) === 0 && (
                                            <Button variant="destructive" size="sm" title="Supprimer la classe" onClick={() => openDeleteClass(c)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            {
                            expanded[c.id] && (<TableRow>
                                <TableCell colSpan={4}
                                    className="bg-muted/40">
                                    <div className="py-3">
                                        <div className="text-sm font-medium mb-2">Salles</div>
                                        {
                                        (!c.rooms || c.rooms.length === 0) ? (<div className="text-sm text-muted-foreground">Aucune salle pour ce niveau.</div>) : (<div className="grid gap-2"> {
                                            c.rooms.map(r => (<div key={
                                                    r.id
                                                }
                                                className="flex items-center justify-between rounded-md border p-2 bg-white">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium"> {
                                                        r.name
                                                    }</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">Capacité: {
                                                        r.capacity ?? '—'
                                                    }</span>
                                                    {
                                                    ('status' in (r as any)) && (<span className={
                                                        `text-xs px-2 py-0.5 rounded ${
                                                            ((r as any).status === 'Disponible') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                                        }`
                                                    }> {
                                                        (r as any).status
                                                    } </span>)
                                                } </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" title="Éditer" onClick={() => handleOpenEditRoom(c.id, r)}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => { setDeleteClassId(c.id); setDeleteRoomId(r.id); setDeleteRoomName(r.name || ''); setShowDeleteRoom(true); }}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>))
                                        } </div>)
                                    } </div>
                                </TableCell>
                            </TableRow>)
                        } </React.Fragment>))
                    }
                        {
                        items.length === 0 && (<TableRow>
                            <TableCell colSpan={4}
                                className="text-center text-sm text-muted-foreground py-6">
                                Aucune classe pour le moment
                            </TableCell>
                        </TableRow>)
                    } </TableBody>
                </Table>
            </CardContent>
        </Card>
        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground"> {
                total > 0 ? (<span> {
                    Math.min((page - 1) * limit + 1, total)
                }–{
                    Math.min(page * limit, total)
                }
                    sur {total} </span>) : (<span>Aucune donnée</span>)
            } </div>
            <div className="flex items-center gap-2">
                <Label className="text-sm">Par page</Label>
                <Select value={
                        String(limit)
                    }
                    onValueChange={
                        (v) => fetchAll(1, Number(v))
                }>
                    <SelectTrigger className="w-[88px]"><SelectValue/></SelectTrigger>
                    <SelectContent> {
                        [5, 10, 20, 50].map(sz => <SelectItem key={sz}
                            value={
                                String(sz)
                        }> {sz}</SelectItem>)
                    } </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm"
                        disabled={
                            page <= 1 || loading
                        }
                        onClick={
                            () => fetchAll(page - 1, limit)
                    }>Précédent</Button>
                    <Button variant="outline" size="sm"
                        disabled={
                            page * limit >= total || loading
                        }
                        onClick={
                            () => fetchAll(page + 1, limit)
                    }>Suivant</Button>
                </div>
            </div>
        </div>
        <Dialog open={showCreate}
            onOpenChange={setShowCreate}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nouveau Niveau</DialogTitle>
                    <DialogDescription>Créer un niveau (ex: NSI). Vous pouvez optionnellement ajouter une description et une liste de salles initiales.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nom</Label>
                        <Input placeholder="Ex: NSI"
                            value={name}
                            onChange={
                                e => setName(e.target.value)
                            }/>
                    </div>
                    <div>
                        <Label>Description (optionnel)</Label>
                        <Input placeholder="Première année du cycle secondaire"
                            value={description}
                            onChange={
                                e => setDescription(e.target.value)
                            }/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label
                                    className="cursor-pointer select-none"
                                    onClick={() => setShowInitialRooms(prev => !prev)}
                                >
                                    Salles initiales
                                </Label>
                                {showInitialRooms && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        title="Masquer la section"
                                        onClick={() => setShowInitialRooms(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowInitialRooms(true);
                                    setInitialRooms(prev => ([
                                        ...prev,
                                        { id: crypto.randomUUID(), name: '', capacity: 0 }
                                    ]));
                                }}
                            >
                                <Plus className="w-4 h-4 mr-1"/>Ajouter une salle
                            </Button>
                        </div>
                        {showInitialRooms && (
                            <>
                                {initialRooms.length === 0 && (
                                    <p className="text-xs text-muted-foreground">Aucune salle. Cliquez sur "Ajouter une salle" pour commencer.</p>
                                )}
                                <div className="space-y-2 max-h-60 overflow-auto pr-1">
                                    {initialRooms.map((r, idx) => (
                                        <div key={r.id} className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-7">
                                                <Label className="text-xs">Nom</Label>
                                                <Input
                                                    value={r.name}
                                                    onChange={(e) => setInitialRooms(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))}
                                                    placeholder={`Ex: Salle ${String.fromCharCode(65 + idx)}`}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Label className="text-xs">Capacité</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={r.capacity}
                                                    onChange={(e) => setInitialRooms(prev => prev.map(x => x.id === r.id ? { ...x, capacity: e.target.value === '' ? '' : Number(e.target.value) } : x))}
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Supprimer la salle"
                                                    onClick={() => setInitialRooms(prev => prev.filter(x => x.id !== r.id))}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline"
                            onClick={
                                () => setShowCreate(false)
                        }>Annuler</Button>
                        <Button onClick={
                            async () => {
                                await handleCreate();
                                setShowCreate(false);
                            }
                        }>Créer</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog open={showAddRoom}
            onOpenChange={setShowAddRoom}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajouter une salle</DialogTitle>
                    <DialogDescription>Associez une salle à un niveau existant.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Choisir un niveau</Label>
                        <Select value={selectedClassId}
                            onValueChange={setSelectedClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un niveau"/>
                            </SelectTrigger>
                            <SelectContent> {
                                items.map(c => (<SelectItem key={
                                        c.id
                                    }
                                    value={
                                        c.id
                                }> {
                                    c.name
                                }</SelectItem>))
                            } </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Nom de la salle</Label>
                        <Input placeholder="Ex: Salle de TP 1"
                            value={roomName}
                            onChange={
                                e => setRoomName(e.target.value)
                            }/>
                    </div>
                    <div>
                        <Label>Capacité</Label>
                        <Input type="number"
                            min={1}
                            placeholder="ex: 30"
                            value={roomCapacity}
                            onChange={
                                e => setRoomCapacity(e.target.value === '' ? '' : Number(e.target.value))
                            }/>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline"
                            onClick={
                                () => setShowAddRoom(false)
                        }>Annuler</Button>
                        <Button onClick={
                            async () => {
                                await handleAddRoom();
                                setShowAddRoom(false);
                            }
                        }>Ajouter</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={showEditRoom} onOpenChange={setShowEditRoom}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Modifier la salle</DialogTitle>
                    <DialogDescription>Mettez à jour les informations de la salle.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nom de la salle</Label>
                        <Input value={editRoomName} onChange={(e)=> setEditRoomName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Capacité</Label>
                        <Input type="number" min={0} value={editRoomCapacity} onChange={(e)=> setEditRoomCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                    <div>
                        <Label>Statut</Label>
                        <Select value={editRoomStatus} onValueChange={setEditRoomStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Disponible">Disponible</SelectItem>
                                <SelectItem value="Indisponible">Indisponible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={()=> setShowEditRoom(false)}>Annuler</Button>
                        <Button onClick={handleUpdateRoom}>Mettre à jour</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Delete Room Dialog */}
        <Dialog open={showDeleteRoom} onOpenChange={setShowDeleteRoom}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Supprimer la salle</DialogTitle>
                    <DialogDescription>
                        Voulez-vous vraiment supprimer la salle {deleteRoomName ? `"${deleteRoomName}"` : ''} ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteRoom(false)}>Annuler</Button>
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            try {
                                await deleteRoom(deleteClassId, deleteRoomId);
                                toast.success('Salle supprimée');
                                setShowDeleteRoom(false);
                            } catch (e: any) {
                                toast.error(e?.message || 'Erreur lors de la suppression de la salle');
                            }
                        }}
                    >
                        Supprimer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={showEditClass} onOpenChange={setShowEditClass}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Modifier la classe</DialogTitle>
                    <DialogDescription>Mettez à jour les informations de la classe.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nom</Label>
                        <Input value={editClassName} onChange={(e)=> setEditClassName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input value={editClassDescription} onChange={(e)=> setEditClassDescription(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={()=> setShowEditClass(false)}>Annuler</Button>
                        <Button onClick={handleUpdateClass}>Mettre à jour</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Class Details Dialog */}
        <Dialog open={showClassDetails} onOpenChange={setShowClassDetails}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Détails de la classe</DialogTitle>
                    <DialogDescription>Retrouvez les informations et les salles liées à cette classe.</DialogDescription>
                </DialogHeader>

                {detailsLoading ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Chargement des informations…</div>
                ) : detailsData ? (
                    <div className="space-y-6">
                        {/* Header infos */}
                        <div className="rounded-md border p-4 bg-white">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-lg font-semibold">{detailsData.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {detailsData.description || 'Aucune description fournie.'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{(detailsData.rooms?.length ?? 0)} salle(s)</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Rooms list */}
                        <div className="space-y-3">
                            <div className="text-sm font-medium">Salles</div>
                            {(!detailsData.rooms || detailsData.rooms.length === 0) ? (
                                <div className="text-sm text-muted-foreground">Aucune salle associée à cette classe.</div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto pr-1 grid gap-2">
                                    {detailsData.rooms.map((r: any) => (
                                        <div key={r.id} className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="truncate font-medium">{r.name}</div>
                                                <Badge variant="outline">Capacité: {r.capacity ?? '—'}</Badge>
                                                {'status' in (r as any) && (
                                                    <Badge className={(r as any).status === 'Disponible' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                        {(r as any).status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={()=> setShowClassDetails(false)}>Fermer</Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-red-600">Impossible de charger les détails.</div>
                )}
            </DialogContent>
        </Dialog>

        {/* Delete Class Dialog */}
        <Dialog open={showDeleteClass} onOpenChange={setShowDeleteClass}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Supprimer la classe</DialogTitle>
                    <DialogDescription>
                        Voulez-vous vraiment supprimer la classe {deleteTargetClassName ? `"${deleteTargetClassName}"` : ''} ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={()=> setShowDeleteClass(false)}>Annuler</Button>
                    <Button variant="destructive" onClick={handleDeleteClass}>Supprimer</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>);
};

export default AdminPanel;
