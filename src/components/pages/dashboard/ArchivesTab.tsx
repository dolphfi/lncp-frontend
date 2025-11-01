/**
 * =====================================================
 * COMPOSANT ARCHIVES TAB
 * =====================================================
 * Interface de gestion des archives des années académiques
 * - Affiche la liste des années archivées
 * - Permet de consulter les données archivées
 * - Gestion des exports et téléchargements
 */

import React, { useState, useEffect } from 'react';
import {
  Archive,
  Download,
  Eye,
  Trash2,
  FileText,
  RefreshCw,
  Calendar,
  Database,
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  FileCheck,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  Plus,
  Clock,
  Search,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useArchiveStore } from '../../../stores/archiveStore';
import { useAcademicYearStore } from '../../../stores/academicYearStore';
import type { ArchivedYear, ArchiveDataType } from '../../../types/archive';
import { toast } from 'react-toastify';

/**
 * =====================================================
 * COMPOSANT PRINCIPAL - ARCHIVES TAB
 * =====================================================
 */
const ArchivesTab: React.FC = () => {
  // État local
  const [selectedYear, setSelectedYear] = useState<ArchivedYear | null>(null);
  const [activeDataType, setActiveDataType] = useState<ArchiveDataType>('students');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<ArchivedYear | null>(null);

  // Nouveaux états pour les nouvelles fonctionnalités
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [newArchiveYear, setNewArchiveYear] = useState('');
  const [studentMatricule, setStudentMatricule] = useState('');
  const [archiveStatus, setArchiveStatus] = useState<any>(null);
  const [studentHistory, setStudentHistory] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Store Zustand
  const {
    archivedYears,
    archivedData,
    stats,
    loading,
    loadingData,
    error,
    fetchArchivedYears,
    fetchArchiveStats,
    fetchArchivedData,
    deleteArchive,
    downloadArchive,
    exportData,
    clearError,
    archiveAcademicYear,
    getArchiveStatus,
    getStudentHistory,
  } = useArchiveStore();

  // Store des années académiques
  const {
    academicYears,
    fetchAllAcademicYears,
  } = useAcademicYearStore();

  /**
   * Chargement initial des données
   */
  useEffect(() => {
    fetchArchivedYears();
    fetchArchiveStats();
    fetchAllAcademicYears(); // Charger les années disponibles pour l'archivage
  }, [fetchArchivedYears, fetchArchiveStats, fetchAllAcademicYears]);

  /**
   * Gestion des erreurs
   */
  useEffect(() => {
    if (error) {
      // Gérer les erreurs d'authentification spécifiquement
      if (error.includes('Unauthorized') || error.includes('401')) {
        toast.error('Vous n\'avez pas les permissions pour accéder aux archives. Contactez un administrateur.');
      } else {
        toast.error(error);
      }
      clearError();
    }
  }, [error, clearError]);

  /**
   * Récupère les données archivées quand une année est sélectionnée
   */
  useEffect(() => {
    if (selectedYear && activeDataType) {
      fetchArchivedData(selectedYear.id, activeDataType);
    }
  }, [selectedYear, activeDataType, fetchArchivedData]);

  /**
   * Gère l'ouverture du dialogue de détails
   */
  const handleViewDetails = (year: ArchivedYear) => {
    setSelectedYear(year);
    setShowDetailsDialog(true);
  };

  /**
   * Gère le téléchargement d'une archive
   */
  const handleDownload = async (year: ArchivedYear) => {
    try {
      await downloadArchive(year.id);
      toast.success(`Archive ${year.name} téléchargée avec succès`);
    } catch (error) {
      // L'erreur est déjà gérée par le store et le useEffect
    }
  };

  /**
   * Gère l'export de données archivées
   */
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedYear) return;

    try {
      await exportData(selectedYear.id, activeDataType, format);
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      // L'erreur est déjà gérée par le store et le useEffect
    }
  };

  /**
   * Gère la suppression d'une archive
   */
  const handleDelete = (year: ArchivedYear) => {
    setYearToDelete(year);
    setShowDeleteDialog(true);
  };

  /**
   * Supprime une archive (confirmation)
   */
  const confirmDelete = async () => {
    if (!yearToDelete) return;

    try {
      await deleteArchive(yearToDelete.id);
      toast.success(`Archive ${yearToDelete.name} supprimée`);
      setShowDeleteDialog(false);
      setYearToDelete(null);
      if (selectedYear?.id === yearToDelete.id) {
        setSelectedYear(null);
        setShowDetailsDialog(false);
      }
    } catch (error) {
      // L'erreur est déjà gérée par le store et le useEffect
    }
  };

  /**
   * Crée une nouvelle archive pour une année académique
   */
  const handleCreateArchive = async () => {
    if (!newArchiveYear.trim()) {
      toast.error('Veuillez sélectionner une année académique');
      return;
    }

    // Trouver le label de l'année sélectionnée pour l'affichage
    const selectedYear = academicYears.find(y => y.id === newArchiveYear);
    const yearLabel = selectedYear?.label || newArchiveYear;

    setIsArchiving(true);
    try {
      const result = await archiveAcademicYear(newArchiveYear);
      toast.success(
        `✅ ${result.message}\n` +
        `📊 Total archivé: ${result.totalArchived} éléments\n` +
        `⏱️ Temps: ${result.executionTime}ms`,
        { autoClose: 5000 }
      );
      setShowCreateDialog(false);
      setNewArchiveYear('');
      // Rafraîchir la liste
      await fetchArchivedYears();
      await fetchArchiveStats();
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'archivage';

      // Message spécifique si l'année n'existe pas
      if (errorMessage.includes('not found') || errorMessage.includes('introuvable')) {
        toast.error(
          `❌ Année académique "${yearLabel}" introuvable\n\n` +
          `Cette année n'existe plus dans le système ou a déjà été archivée.`,
          { autoClose: 6000 }
        );
      } else if (errorMessage.includes('already archived') || errorMessage.includes('déjà archivée')) {
        toast.warning(`⚠️ L'année "${yearLabel}" est déjà archivée`);
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
    } finally {
      setIsArchiving(false);
    }
  };

  /**
   * Vérifie le statut du processus d'archivage
   */
  const handleCheckStatus = async () => {
    try {
      const status = await getArchiveStatus();
      setArchiveStatus(status);
      setShowStatusDialog(true);

      if (status.isRunning) {
        toast.info(`Archivage en cours pour ${status.currentYear} - ${status.progress}%`);
      } else {
        toast.info('Aucun archivage en cours');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la récupération du statut');
    }
  };

  /**
   * Recherche l'historique d'un étudiant
   */
  const handleSearchStudentHistory = async () => {
    if (!studentMatricule.trim()) {
      toast.error('Veuillez entrer un matricule');
      return;
    }

    try {
      const history = await getStudentHistory(studentMatricule);
      setStudentHistory(history);
      toast.success(`Historique trouvé pour ${history.studentName}`);
    } catch (error: any) {
      toast.error(error.message || 'Étudiant introuvable dans les archives');
      setStudentHistory(null);
    }
  };

  /**
   * Récupère l'icône selon le type de données
   */
  const getDataTypeIcon = (type: ArchiveDataType) => {
    const icons = {
      students: <Users className="h-4 w-4" />,
      employees: <GraduationCap className="h-4 w-4" />,
      courses: <BookOpen className="h-4 w-4" />,
      payments: <DollarSign className="h-4 w-4" />,
      grades: <FileCheck className="h-4 w-4" />,
      attendance: <ClipboardList className="h-4 w-4" />,
      bulletins: <FileText className="h-4 w-4" />,
    };
    return icons[type];
  };

  /**
   * Récupère le label selon le type de données
   */
  const getDataTypeLabel = (type: ArchiveDataType) => {
    const labels = {
      students: 'Étudiants',
      employees: 'Employés',
      courses: 'Cours',
      payments: 'Paiements',
      grades: 'Notes',
      attendance: 'Présences',
      bulletins: 'Bulletins',
    };
    return labels[type];
  };

  /**
   * Récupère le badge de statut
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'archived':
        return <Badge className="bg-green-100 text-green-800">Archivé</Badge>;
      case 'restoring':
        return <Badge className="bg-blue-100 text-blue-800">Restauration</Badge>;
      case 'restored':
        return <Badge className="bg-purple-100 text-purple-800">Restauré</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Archives totales</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats?.totalYears || archivedYears.length}
            </div>
            <p className="text-xs text-gray-500">années archivées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Taille totale</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats?.totalSize || '0 GB'}
            </div>
            <p className="text-xs text-gray-500">espace utilisé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Dernière archive</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold">
              {stats?.latestArchive?.name || 'Aucune'}
            </div>
            <p className="text-xs text-gray-500">
              {stats?.latestArchive?.archivedAt
                ? new Date(stats.latestArchive.archivedAt).toLocaleDateString('fr-FR')
                : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Archive la plus ancienne</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold">
              {stats?.oldestArchive?.name || 'Aucune'}
            </div>
            <p className="text-xs text-gray-500">
              {stats?.oldestArchive?.archivedAt
                ? new Date(stats.oldestArchive.archivedAt).toLocaleDateString('fr-FR')
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full"
          variant="default"
        >
          <Zap className="h-4 w-4 mr-2" />
          Forcer l'archivage
        </Button>

        <Button
          onClick={handleCheckStatus}
          className="w-full"
          variant="outline"
        >
          <Activity className="h-4 w-4 mr-2" />
          Statut d'archivage
        </Button>

        <Button
          onClick={() => setShowHistoryDialog(true)}
          className="w-full"
          variant="outline"
        >
          <Search className="h-4 w-4 mr-2" />
          Historique étudiant
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            fetchArchivedYears();
            fetchArchiveStats();
          }}
          disabled={loading}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Liste des années archivées */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Archive className="h-5 w-5" />
            Années Académiques Archivées
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : archivedYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Archive className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Aucune archive disponible</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Année</TableHead>
                  <TableHead className="hidden md:table-cell">Période</TableHead>
                  <TableHead className="hidden lg:table-cell">Archivé le</TableHead>
                  <TableHead className="hidden sm:table-cell">Statut</TableHead>
                  <TableHead className="hidden xl:table-cell">Taille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedYears.map((year) => (
                  <TableRow key={year.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">{year.name}</div>
                      <div className="text-xs text-gray-500 md:hidden">
                        {year.startDate && year.endDate ? (
                          <>
                            {new Date(year.startDate).toLocaleDateString('fr-FR')} -{' '}
                            {new Date(year.endDate).toLocaleDateString('fr-FR')}
                          </>
                        ) : (
                          year.name
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {year.startDate && year.endDate ? (
                        <>
                          {new Date(year.startDate).toLocaleDateString('fr-FR')} -{' '}
                          {new Date(year.endDate).toLocaleDateString('fr-FR')}
                        </>
                      ) : (
                        year.name
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(year.archivedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(year.status || 'archived')}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {year.size || '0 MB'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(year)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(year)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(year)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Détails de l'archive */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Archive : {selectedYear?.name}
            </DialogTitle>
            <DialogDescription>
              Consultez les données archivées pour l'année académique {selectedYear?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedYear && (
            <div className="space-y-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Période</p>
                    <p className="text-sm font-medium">
                      {selectedYear.startDate && selectedYear.endDate ? (
                        <>
                          {new Date(selectedYear.startDate).toLocaleDateString('fr-FR')} -{' '}
                          {new Date(selectedYear.endDate).toLocaleDateString('fr-FR')}
                        </>
                      ) : (
                        selectedYear.name
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date d'archivage</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedYear.archivedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Archivé par</p>
                    <p className="text-sm font-medium">{selectedYear.archivedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Taille</p>
                    <p className="text-sm font-medium">{selectedYear.size || '0 MB'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(selectedYear.status || 'archived')}</div>
                  </div>
                  {selectedYear.description && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{selectedYear.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistiques des données */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Données archivées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(selectedYear.recordsCount).map(([key, count]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {getDataTypeIcon(key as ArchiveDataType)}
                        <div>
                          <p className="text-xs text-gray-500">
                            {getDataTypeLabel(key as ArchiveDataType)}
                          </p>
                          <p className="text-lg font-bold">{count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Onglets pour consulter les données */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Consulter les données</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pdf')}
                      disabled={loading || loadingData}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('excel')}
                      disabled={loading || loadingData}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                      disabled={loading || loadingData}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeDataType} onValueChange={(v) => setActiveDataType(v as ArchiveDataType)}>
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-1">
                      {(['students', 'employees', 'courses', 'payments', 'grades', 'attendance', 'bulletins'] as ArchiveDataType[]).map((type) => (
                        <TabsTrigger
                          key={type}
                          value={type}
                          className="text-xs py-2 flex items-center gap-1"
                        >
                          {getDataTypeIcon(type)}
                          <span className="hidden sm:inline">{getDataTypeLabel(type)}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {(['students', 'employees', 'courses', 'payments', 'grades', 'attendance', 'bulletins'] as ArchiveDataType[]).map((type) => (
                      <TabsContent key={type} value={type} className="mt-4">
                        {loadingData ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : archivedData[type] && archivedData[type].length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              {archivedData[type].length} enregistrement(s) trouvé(s)
                            </p>
                            <div className="max-h-96 overflow-auto border rounded-lg">
                              <pre className="p-4 text-xs">
                                {JSON.stringify(archivedData[type], null, 2)}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'archive <strong>{yearToDelete?.name}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Créer une archive */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer une nouvelle archive
            </DialogTitle>
            <DialogDescription>
              Archiver une année académique complète (étudiants, paiements, notes, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="year">Sélectionner l'année académique à archiver</Label>
              <Select
                value={newArchiveYear}
                onValueChange={setNewArchiveYear}
                disabled={isArchiving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez une année académique..." />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Aucune année académique disponible
                    </SelectItem>
                  ) : (
                    academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label} ({year.statut})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Sélectionnez l'année académique que vous souhaitez archiver
              </p>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Attention :</p>
                    <p className="text-xs">
                      L'archivage est une opération <strong>irréversible</strong>.
                      Toutes les données de cette année seront déplacées vers les archives.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Données qui seront archivées :</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Étudiants et leurs informations</li>
                      <li>Paiements et transactions</li>
                      <li>Notes et bulletins</li>
                      <li>Emplois du temps et créneaux</li>
                      <li>Présences et absences</li>
                      <li>Historiques et notes en attente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewArchiveYear('');
              }}
              disabled={isArchiving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateArchive}
              disabled={isArchiving || !newArchiveYear.trim()}
            >
              {isArchiving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Archivage en cours...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Créer l'archive
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Statut d'archivage */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statut du processus d'archivage
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {archiveStatus ? (
              <>
                <Card className={archiveStatus.isRunning ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      {archiveStatus.isRunning ? (
                        <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
                      ) : (
                        <Clock className="h-8 w-8 text-blue-600" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {archiveStatus.isRunning ? 'Archivage en cours' : 'Aucun archivage en cours'}
                        </p>
                        {archiveStatus.currentYear && (
                          <p className="text-sm text-gray-600">
                            {archiveStatus.isRunning ? 'Année en cours' : 'Dernier archivage'}: {archiveStatus.currentYear}
                          </p>
                        )}
                      </div>
                    </div>

                    {archiveStatus.isRunning && (
                      <div className="mt-4 space-y-2">
                        {archiveStatus.progress !== undefined && archiveStatus.progress < 100 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span className="font-semibold">{archiveStatus.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${archiveStatus.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {archiveStatus.startedAt && (
                          <p className="text-xs text-gray-500">
                            Démarré le: {new Date(archiveStatus.startedAt).toLocaleString('fr-FR')}
                          </p>
                        )}

                        {archiveStatus.estimatedTimeRemaining && (
                          <p className="text-xs text-gray-500">
                            Temps restant estimé: {Math.ceil(archiveStatus.estimatedTimeRemaining / 60)}min
                          </p>
                        )}
                      </div>
                    )}

                    {!archiveStatus.isRunning && archiveStatus.currentYear && archiveStatus.progress === 100 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <Database className="h-4 w-4" />
                          <span className="text-sm font-medium">Archivage terminé</span>
                        </div>
                        {archiveStatus.startedAt && (
                          <p className="text-xs text-gray-600">
                            Archivé le: {new Date(archiveStatus.startedAt).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {!archiveStatus.isRunning && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">Système d'archivage disponible</p>
                          <p className="text-xs">
                            Le système est prêt à archiver de nouvelles années académiques.
                            Utilisez le bouton "Créer une archive" pour démarrer un archivage.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCheckStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={() => setShowStatusDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Historique étudiant */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Historique d'un étudiant
            </DialogTitle>
            <DialogDescription>
              Rechercher l'historique complet d'un étudiant à travers toutes les archives
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Entrer le matricule de l'étudiant"
                  value={studentMatricule}
                  onChange={(e) => setStudentMatricule(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchStudentHistory()}
                />
              </div>
              <Button onClick={handleSearchStudentHistory}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            {studentHistory && (
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-lg">{studentHistory.studentName}</p>
                        <p className="text-sm text-gray-600">Matricule: {studentHistory.matricule}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {studentHistory.years.map((year: any, idx: number) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Année {year.year}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="grades" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="grades">
                            Notes ({year.grades?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="payments">
                            Paiements ({year.payments?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="attendance">
                            Présences ({year.attendance?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="reportCards">
                            Bulletins ({year.reportCards?.length || 0})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="grades">
                          {year.grades && year.grades.length > 0 ? (
                            <div className="max-h-60 overflow-auto border rounded-lg p-2">
                              <pre className="text-xs">
                                {JSON.stringify(year.grades, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucune note</p>
                          )}
                        </TabsContent>

                        <TabsContent value="payments">
                          {year.payments && year.payments.length > 0 ? (
                            <div className="max-h-60 overflow-auto border rounded-lg p-2">
                              <pre className="text-xs">
                                {JSON.stringify(year.payments, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucun paiement</p>
                          )}
                        </TabsContent>

                        <TabsContent value="attendance">
                          {year.attendance && year.attendance.length > 0 ? (
                            <div className="max-h-60 overflow-auto border rounded-lg p-2">
                              <pre className="text-xs">
                                {JSON.stringify(year.attendance, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucune présence</p>
                          )}
                        </TabsContent>

                        <TabsContent value="reportCards">
                          {year.reportCards && year.reportCards.length > 0 ? (
                            <div className="max-h-60 overflow-auto border rounded-lg p-2">
                              <pre className="text-xs">
                                {JSON.stringify(year.reportCards, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucun bulletin</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!studentHistory && studentMatricule && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  Aucun résultat. Entrez un matricule et cliquez sur Rechercher.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowHistoryDialog(false);
                setStudentMatricule('');
                setStudentHistory(null);
              }}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArchivesTab;
