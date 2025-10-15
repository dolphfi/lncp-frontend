/**
 * =====================================================
 * PAGE DE GESTION DES PRÉSENCES
 * =====================================================
 * Cette page centralise toute la gestion des présences :
 * - Liste avec DataTable
 * - Formulaire de marquage
 * - Actions CRUD
 * - Gestion d'état avec Zustand
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Users,
  X,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

import { Button } from '../../ui/button';
import { 
  DataTable, 
  Column, 
  RowAction 
} from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import { 
  Card, 
  CardContent
} from '../../ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'react-toastify';

// Import du store
import { useAttendanceStore, Attendance } from '../../../stores/attendancesStore';
import { useRoomStore } from '../../../stores/roomStore';
import { useClassroomStore } from '../../../stores/classroomStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES PRÉSENCES
// =====================================================
export const AttendancesManagement: React.FC = () => {
  
  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Store
  const {
    attendances,
    loading,
    error,
    loadingAction,
    pagination,
    filters,
    stats,
    fetchAttendances,
    deleteAttendance,
    setFilters,
    setSortOptions,
    changePage,
    clearError
  } = useAttendanceStore();

  const { fetchAll: fetchClassrooms } = useClassroomStore();
  const { rooms, fetchRooms } = useRoomStore();
  
  // Chargement initial
  useEffect(() => {
    fetchAttendances();
    fetchRooms();
    fetchClassrooms(1, 50);
  }, [fetchAttendances, fetchRooms, fetchClassrooms]);

  // Configuration des colonnes
  const columns: Column<Attendance>[] = [
    {
      key: 'studentName',
      label: 'Élève',
      sortable: true,
      searchable: true,
      width: '200px',
      render: (studentName: string, attendance: Attendance) => (
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{studentName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{attendance.studentMatricule}</p>
        </div>
      )
    },
    {
      key: 'classroomName',
      label: 'Classe',
      sortable: true,
      width: '150px',
      render: (classroomName: string) => (
        <Badge variant="outline" className="text-xs">{classroomName}</Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      width: '120px',
      render: (date: string) => (
        <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (status: Attendance['status']) => {
        const configs = {
          present: { variant: 'default' as const, label: 'Présent', icon: CheckCircle, color: 'text-green-600' },
          absent: { variant: 'destructive' as const, label: 'Absent', icon: X, color: 'text-red-600' },
          late: { variant: 'secondary' as const, label: 'Retard', icon: Clock, color: 'text-orange-600' },
          excused: { variant: 'outline' as const, label: 'Excusé', icon: UserCheck, color: 'text-blue-600' }
        };
        const config = configs[status];
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="text-xs flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'notes',
      label: 'Notes',
      width: '200px',
      render: (notes?: string) => (
        <span className="text-sm text-gray-600 truncate">{notes || '—'}</span>
      )
    }
  ];
  
  // Actions de ligne
  const rowActions: RowAction<Attendance>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (attendance) => { setSelectedAttendance(attendance); setShowViewDialog(true); }
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (attendance) => { setSelectedAttendance(attendance); toast.info('Modification en développement'); }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (attendance) => { setSelectedAttendance(attendance); setShowDeleteDialog(true); },
      variant: "destructive"
    }
  ];
  
  // Gestionnaires
  const handleDeleteAttendance = async () => {
    if (!selectedAttendance) return;
    try {
      await deleteAttendance(selectedAttendance.id);
      setShowDeleteDialog(false);
      setSelectedAttendance(null);
      toast.success('Présence supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);
  
  const handleSearch = (searchValue: string) => setSearchTerm(searchValue);
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => setSortOptions({ field: sort.field as keyof Attendance, order: sort.order });
  
  return (
    <div className="space-y-6">
      {/* EN-TÊTE AVEC ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Présences</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les présences des élèves</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
          <Button onClick={() => toast.info('Marquage en développement')} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />Marquer Présence
          </Button>
        </div>
      </div>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}<Button variant="link" size="sm" onClick={clearError} className="ml-2 h-auto p-0">Fermer</Button></AlertDescription>
        </Alert>
      )}
      
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Présents</p>
                  <p className="text-xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Absents</p>
                  <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <UserX className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taux</p>
                  <p className="text-xl font-bold text-blue-600">{stats.attendanceRate.toFixed(1)}%</p>
                </div>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Table des présences */}
      <DataTable
        data={attendances}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={changePage}
        onSort={handleSort}
        onSearch={handleSearch}
        rooms={rooms}
        searchPlaceholder="Rechercher..."
        emptyStateMessage="Aucune présence trouvée"
        title="Liste des Présences"
        description={`${pagination.total} enregistrements`}
      />
      
      {/* DIALOGS */}
      
      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la présence</DialogTitle>
            <DialogDescription>Êtes-vous sûr ?</DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Élève :</strong> {selectedAttendance.studentName}</p>
                <p><strong>Date :</strong> {new Date(selectedAttendance.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedAttendance(null); }} disabled={loadingAction === 'delete'}>Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteAttendance} disabled={loadingAction === 'delete'}>
                  {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de visualisation */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la présence</DialogTitle>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Élève</p>
                  <p className="font-medium">{selectedAttendance.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-medium">{selectedAttendance.studentMatricule}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classe</p>
                  <p className="font-medium">{selectedAttendance.classroomName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedAttendance.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">
                    {columns[3].render && columns[3].render(selectedAttendance.status, selectedAttendance)}
                  </div>
                </div>
                {selectedAttendance.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{selectedAttendance.notes}</p>
                  </div>
                )}
              </div>
              <Button onClick={() => { setShowViewDialog(false); setSelectedAttendance(null); }}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
