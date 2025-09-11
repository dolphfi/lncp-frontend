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

import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';
import { useClassroomStore } from '../../../stores/classroomStore';
import { toast } from 'react-toastify';

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

const AdminPanel: React.FC = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
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
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Nouveaux états pour les années académiques et classes
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [showAcademicYearDialog, setShowAcademicYearDialog] = useState(false);
//   const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
//   const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

  // Charger les données
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    // Simuler le chargement des données
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
      },
      {
        id: '2',
        username: 'directeur',
        email: 'directeur@lncp.edu.ht',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-06-27 15:45:00',
        permissions: ['students', 'employees', 'courses', 'reports'],
        createdAt: '2024-01-15'
      },
      {
        id: '3',
        username: 'secretaire',
        email: 'secretaire@lncp.edu.ht',
        role: 'user',
        status: 'active',
        lastLogin: '2024-06-28 09:15:00',
        permissions: ['students', 'courses'],
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
      },
      {
        id: '2',
        level: 'warning',
        message: 'Tentative de connexion échouée pour l\'utilisateur test',
        user: 'test',
        timestamp: '2024-06-28 10:15:00',
        module: 'auth'
      },
      {
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
      },
      {
        id: '2',
        filename: 'backup_2024_06_27_020000.sql',
        size: '2.3 GB',
        type: 'full',
        status: 'completed',
        createdAt: '2024-06-27 02:00:00',
        duration: '12 min'
      }
    ]);

    // Charger les années académiques
    setAcademicYears([
      {
        id: '1',
        name: '2024-2025',
        startDate: '2024-09-01',
        endDate: '2025-06-30',
        status: 'active',
        isCurrent: true,
        description: 'Année académique en cours',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-28'
      },
      {
        id: '2',
        name: '2023-2024',
        startDate: '2023-09-01',
        endDate: '2024-06-30',
        status: 'completed',
        isCurrent: false,
        description: 'Année académique terminée',
        createdAt: '2023-01-01',
        updatedAt: '2024-06-30'
      },
      {
        id: '3',
        name: '2025-2026',
        startDate: '2025-09-01',
        endDate: '2026-06-30',
        status: 'planned',
        isCurrent: false,
        description: 'Année académique planifiée',
        createdAt: '2024-06-01',
        updatedAt: '2024-06-01'
      }
    ]);

    // Supprimé: chargement de classes fictives (désormais géré par l'onglet Classes via API)
  };

  const getLogLevelBadge = (level: string) => {
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
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
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
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAcademicYearStatusBadge = (status: string) => {
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getClassStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête */}
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
          <Button variant="outline" onClick={loadAdminData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowConfigDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques système */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">sur {users.length} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erreurs Aujourd'hui</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.level === 'error' || l.level === 'critical').length}
                </div>
                <p className="text-xs text-muted-foreground">Erreurs critiques</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dernière Sauvegarde</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {backups.length > 0 ? 'OK' : 'Aucune'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backups.length > 0 ? backups[0].createdAt : 'Sauvegarde requise'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mode Maintenance</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.maintenanceMode} 
                    onCheckedChange={(checked: boolean) => setConfig({...config, maintenanceMode: checked})}
                  />
                  <span className="text-sm">{config.maintenanceMode ? 'Activé' : 'Désactivé'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration rapide */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {/* Building icon removed as per edit hint */}
                  Informations de l'École
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nom de l'école</Label>
                  <p className="text-sm text-gray-600">{config.schoolName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  <p className="text-sm text-gray-600">{config.schoolAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-600">{config.schoolPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{config.schoolEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="p-1 rounded">
                        {getLogLevelBadge(log.level)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{log.message}</div>
                        <div className="text-xs text-gray-500">{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestion des classes (branché sur l'API) */}
        <TabsContent value="classes" className="space-y-6">
          <ClassroomsTab />
        </TabsContent>

        {/* Gestion des utilisateurs */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
            <Button onClick={() => setShowUserDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
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
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des années académiques */}
        <TabsContent value="academic-years" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Années Académiques</h2>
            <Button onClick={() => setShowAcademicYearDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Année
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Année</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Élèves</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{year.name}</div>
                          {year.isCurrent && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Année courante</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Du {new Date(year.startDate).toLocaleDateString()}</div>
                          <div>Au {new Date(year.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getAcademicYearStatusBadge(year.status)}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {year.status === 'active' && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        

        {/* Logs système */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Logs Système</h2>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
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
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
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
                <TableBody>
                  {logs.map((log) => (
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
        <TabsContent value="backup" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Sauvegardes</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowBackupDialog(true)}>
                <Database className="h-4 w-4 mr-2" />
                Nouvelle Sauvegarde
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
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
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <Badge variant={backup.type === 'full' ? 'default' : 'secondary'}>
                          {backup.type === 'full' ? 'Complète' : 'Incrémentale'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {backup.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800">Terminée</Badge>
                        ) : backup.status === 'failed' ? (
                          <Badge className="bg-red-100 text-red-800">Échouée</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
                        )}
                      </TableCell>
                      <TableCell>{backup.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
                    <Label className="text-sm font-medium">Mode Maintenance</Label>
                    <p className="text-xs text-gray-500">Bloquer l'accès aux utilisateurs</p>
                  </div>
                  <Switch 
                    checked={config.maintenanceMode} 
                    onCheckedChange={(checked: boolean) => setConfig({...config, maintenanceMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Notifications Email</Label>
                    <p className="text-xs text-gray-500">Alertes de sécurité par email</p>
                  </div>
                  <Switch 
                    checked={config.emailNotifications} 
                    onCheckedChange={(checked: boolean) => setConfig({...config, emailNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Sauvegarde Automatique</Label>
                    <p className="text-xs text-gray-500">Sauvegarde quotidienne</p>
                  </div>
                  <Switch 
                    checked={config.autoBackup} 
                    onCheckedChange={(checked: boolean) => setConfig({...config, autoBackup: checked})}
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
                  <Label className="text-sm font-medium">Timeout de Session (minutes)</Label>
                  <Input 
                    type="number" 
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({...config, sessionTimeout: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tentatives de Connexion Max</Label>
                  <Input 
                    type="number" 
                    value={config.maxLoginAttempts}
                    onChange={(e) => setConfig({...config, maxLoginAttempts: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Fréquence de Sauvegarde</Label>
                  <Select 
                    value={config.backupFrequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setConfig({...config, backupFrequency: value})
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

      {/* Dialogues */}
      
      {/* Dialogue de configuration */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
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
                <Input 
                  value={config.schoolName}
                  onChange={(e) => setConfig({...config, schoolName: e.target.value})}
                />
              </div>
              <div>
                <Label>Année Académique</Label>
                <Input 
                  value={config.academicYear}
                  onChange={(e) => setConfig({...config, academicYear: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Adresse</Label>
              <Input 
                value={config.schoolAddress}
                onChange={(e) => setConfig({...config, schoolAddress: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Téléphone</Label>
                <Input 
                  value={config.schoolPhone}
                  onChange={(e) => setConfig({...config, schoolPhone: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={config.schoolEmail}
                  onChange={(e) => setConfig({...config, schoolEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowConfigDialog(false)}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour nouvelle année académique */}
      <Dialog open={showAcademicYearDialog} onOpenChange={setShowAcademicYearDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Année Académique</DialogTitle>
            <DialogDescription>
              Créez une nouvelle année académique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de l'année</Label>
                <Input placeholder="2025-2026" />
              </div>
              <div>
                <Label>Statut</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planifiée</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Description de l'année académique..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAcademicYearDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowAcademicYearDialog(false)}>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section de création de classe fictive retirée: gérée par l'onglet Classes */}

    </div>
  );
};

// ---- Tab component: Classes ----
const ClassroomsTab: React.FC = () => {
  const { items, loading, error, fetchAll, create, remove, addRoom, page, limit, total } = useClassroomStore();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const toggleExpanded = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  // Section 1: création de niveau/classe
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [initialRooms, setInitialRooms] = React.useState<Array<{ id: string; name: string; capacity: number | '' }>>([]);
  const [showCreate, setShowCreate] = React.useState(false);
  // Section 2: ajout de salle
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [roomName, setRoomName] = React.useState('');
  const [roomCapacity, setRoomCapacity] = React.useState<number | ''>('');
  const [showAddRoom, setShowAddRoom] = React.useState(false);

  React.useEffect(() => {
    fetchAll(page || 1, limit || 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Le nom est requis'); return; }
    try {
      const rooms = initialRooms
        .filter(r => r.name.trim() && Number(r.capacity) >= 0)
        .map(r => ({ name: r.name.trim(), capacity: Number(r.capacity) }));
      await create({ name: name.trim(), description: description || undefined, rooms: rooms.length ? rooms : undefined });
      setName(''); setDescription(''); setInitialRooms([]);
      toast.success('Classe créée');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la création');
    }
  };

  const handleAddRoom = async () => {
    if (!selectedClassId) { toast.error('Sélectionnez une classe'); return; }
    if (!roomName.trim()) { toast.error('Le nom de la salle est requis'); return; }
    if (roomCapacity === '' || Number(roomCapacity) <= 0) { toast.error('La capacité doit être > 0'); return; }
    try {
      await addRoom(selectedClassId, { name: roomName.trim(), capacity: Number(roomCapacity) });
      setRoomName(''); setRoomCapacity('');
      toast.success('Salle ajoutée');
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'ajout de la salle");
    }
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Gestion des classes (Niveaux) */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Classes (Niveaux)</h2>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2"/>Nouveau Niveau</Button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom (Niveau)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Salles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <React.Fragment key={c.id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={()=>toggleExpanded(c.id)} className="px-2">
                          {expanded[c.id] ? '▾' : '▸'}
                        </Button>
                        <span>{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-muted-foreground">{c.description || '—'}</TableCell>
                    <TableCell>{c.rooms?.length ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" title="Gérer les salles"><Edit className="h-4 w-4"/></Button>
                        <Button variant="outline" size="sm" onClick={async()=>{ try{ await remove(c.id); toast.success('Supprimée'); } catch(e:any){ toast.error(e?.message||'Erreur'); } }}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded[c.id] && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/40">
                        <div className="py-3">
                          <div className="text-sm font-medium mb-2">Salles</div>
                          {(!c.rooms || c.rooms.length === 0) ? (
                            <div className="text-sm text-muted-foreground">Aucune salle pour ce niveau.</div>
                          ) : (
                            <div className="grid gap-2">
                              {c.rooms.map(r => (
                                <div key={r.id} className="flex items-center justify-between rounded-md border p-2 bg-white">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">{r.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">Capacité: {r.capacity ?? '—'}</span>
                                    {('status' in (r as any)) && (
                                      <span className={`text-xs px-2 py-0.5 rounded ${((r as any).status === 'Disponible') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                        {(r as any).status}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" title="Éditer"><Edit className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="sm" title="Supprimer"><Trash2 className="h-4 w-4"/></Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                    Aucune classe pour le moment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? (
            <span>
              {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} sur {total}
            </span>
          ) : (
            <span>Aucune donnée</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Par page</Label>
          <Select value={String(limit)} onValueChange={(v)=> fetchAll(1, Number(v))}>
            <SelectTrigger className="w-[88px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5,10,20,50].map(sz => <SelectItem key={sz} value={String(sz)}>{sz}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={()=> fetchAll(page - 1, limit)}>Précédent</Button>
            <Button variant="outline" size="sm" disabled={page * limit >= total || loading} onClick={()=> fetchAll(page + 1, limit)}>Suivant</Button>
          </div>
        </div>
      </div>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau Niveau</DialogTitle>
            <DialogDescription>Créer un niveau (ex: NSI). Vous pouvez optionnellement ajouter une description et une liste de salles initiales.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input placeholder="Ex: NSI" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input placeholder="Première année du cycle secondaire" value={description} onChange={e=>setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Salles initiales</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setInitialRooms(prev => [...prev, { id: crypto.randomUUID(), name: '', capacity: 0 }])}>
                  <Plus className="w-4 h-4 mr-1"/>Ajouter une salle
                </Button>
              </div>
              {initialRooms.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune salle. Cliquez sur "Ajouter une salle" pour commencer.</p>
              )}
              <div className="space-y-2 max-h-60 overflow-auto pr-1">
                {initialRooms.map((r, idx) => (
                  <div key={r.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-7">
                      <Label className="text-xs">Nom</Label>
                      <Input value={r.name} onChange={e=> setInitialRooms(prev => prev.map(x => x.id===r.id ? { ...x, name: e.target.value } : x))} placeholder={`Ex: Salle ${String.fromCharCode(65+idx)}`} />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Capacité</Label>
                      <Input type="number" min={0} value={r.capacity} onChange={e=> setInitialRooms(prev => prev.map(x => x.id===r.id ? { ...x, capacity: e.target.value === '' ? '' : Number(e.target.value) } : x))} />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => setInitialRooms(prev => prev.filter(x => x.id !== r.id))}>Supprimer</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setShowCreate(false)}>Annuler</Button>
              <Button onClick={async()=>{ await handleCreate(); setShowCreate(false); }}>Créer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section 2: Gestion des Salles */}
      <div className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Gestion des Salles</h3>
          <Button onClick={()=> setShowAddRoom(true)}><Plus className="h-4 w-4 mr-2"/>Ajouter une salle</Button>
        </div>
        <p className="text-sm text-muted-foreground">Ajoutez des salles à un niveau existant via le formulaire.</p>
      </div>
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une salle</DialogTitle>
            <DialogDescription>Associez une salle à un niveau existant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Choisir un niveau</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nom de la salle</Label>
              <Input placeholder="Ex: Salle de TP 1" value={roomName} onChange={e=>setRoomName(e.target.value)} />
            </div>
            <div>
              <Label>Capacité</Label>
              <Input type="number" min={1} placeholder="ex: 30" value={roomCapacity} onChange={e=> setRoomCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=> setShowAddRoom(false)}>Annuler</Button>
              <Button onClick={async()=>{ await handleAddRoom(); setShowAddRoom(false); }}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;