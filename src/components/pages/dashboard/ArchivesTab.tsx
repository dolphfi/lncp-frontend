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
import { useArchiveStore } from '../../../stores/archiveStore';
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
  } = useArchiveStore();

  /**
   * Chargement initial des données
   */
  useEffect(() => {
    fetchArchivedYears();
    fetchArchiveStats();
  }, [fetchArchivedYears, fetchArchiveStats]);

  /**
   * Gestion des erreurs
   */
  useEffect(() => {
    if (error) {
      toast.error(error);
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
   * Confirme la suppression
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

      {/* Liste des années archivées */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Archive className="h-5 w-5" />
            Années Académiques Archivées
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              fetchArchivedYears();
              fetchArchiveStats();
            }}
            disabled={loading}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
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
                        {new Date(year.startDate).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(year.endDate).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {new Date(year.startDate).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(year.endDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(year.archivedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(year.status)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {year.size}
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
                      {new Date(selectedYear.startDate).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(selectedYear.endDate).toLocaleDateString('fr-FR')}
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
                    <p className="text-sm font-medium">{selectedYear.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <div className="mt-1">{getStatusBadge(selectedYear.status)}</div>
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
    </div>
  );
};

export default ArchivesTab;
