/**
 * =====================================================
 * PAGE DE GESTION DES INSCRIPTIONS
 * =====================================================
 * Cette page centralise toute la gestion des inscriptions :
 * - Liste avec DataTable
 * - Formulaire d'ajout/édition
 * - Actions CRUD
 * - Gestion d'état avec Zustand
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Users
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

// Import des types
import { Student } from '../../../types/student';

// Import du store
import { useRegistrationStore } from '../../../stores/registrationStore';
import { useRoomStore } from '../../../stores/roomStore';
import { useClassroomStore } from '../../../stores/classroomStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES INSCRIPTIONS
// =====================================================
export const RegistrationsManagement: React.FC = () => {
  
  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Student | null>(null);
  
  // Store
  const {
    registrations,
    loading,
    error,
    loadingAction,
    pagination,
    filters,
    stats,
    fetchRegistrations,
    deleteRegistration,
    setFilters,
    setSortOptions,
    changePage,
    clearError
  } = useRegistrationStore();

  const { fetchAll: fetchClassrooms } = useClassroomStore();
  const { rooms, fetchRooms } = useRoomStore();
  
  // Chargement initial
  useEffect(() => {
    fetchRegistrations();
    fetchRooms();
    fetchClassrooms(1, 50);
  }, [fetchRegistrations, fetchRooms, fetchClassrooms]);

  // Configuration des colonnes
  const columns: Column<Student>[] = [
    {
      key: 'firstName',
      label: 'Élève',
      sortable: true,
      searchable: true,
      width: '250px',
      render: (firstName: string, registration: Student) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {registration.avatar ? (
              <img src={registration.avatar} alt={`${registration.firstName} ${registration.lastName}`} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                {registration.firstName?.charAt(0)}{registration.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{registration.firstName} {registration.lastName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{registration.studentId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'gender',
      label: 'Sexe',
      width: '90px',
      render: (gender: 'male' | 'female') => <Badge variant="outline" className="text-xs">{gender === 'male' ? '👨' : '👩'}</Badge>
    },
    {
      key: 'roomName',
      label: 'Salle',
      sortable: true,
      width: '200px',
      render: (roomName: string | undefined, registration: Student) => {
        if (roomName && registration.grade) return <Badge variant="outline" className="text-xs whitespace-nowrap">{registration.grade} - {roomName}</Badge>;
        if (registration.grade) return <Badge variant="secondary" className="text-xs whitespace-nowrap">{registration.grade} - Non assignée</Badge>;
        return <span className="text-xs text-gray-400 whitespace-nowrap">Non assignée</span>;
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '100px',
      render: (status: string) => {
        const variant = status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'destructive';
        const label = status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu';
        return <Badge variant={variant} className="text-xs">{label}</Badge>;
      }
    },
    {
      key: 'enrollmentDate',
      label: 'Inscription',
      sortable: true,
      width: '120px',
      render: (date: string) => <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
    }
  ];
  
  // Actions de ligne
  const rowActions: RowAction<Student>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (registration) => { setSelectedRegistration(registration); setShowViewDialog(true); }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (registration) => { setSelectedRegistration(registration); setShowDeleteDialog(true); },
      variant: "destructive"
    }
  ];
  
  // Gestionnaires
  const handleDeleteRegistration = async () => {
    if (!selectedRegistration) return;
    try {
      await deleteRegistration(selectedRegistration.id);
      setShowDeleteDialog(false);
      setSelectedRegistration(null);
      toast.success('Inscription supprimée avec succès');
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
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => setSortOptions({ field: sort.field as keyof Student, order: sort.order });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Inscriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les inscriptions des élèves</p>
        </div>
        <Button onClick={() => toast.info('Fonctionnalité en développement')} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />Nouvelle Inscription
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}<Button variant="link" size="sm" onClick={clearError} className="ml-2 h-auto p-0">Fermer</Button></AlertDescription>
        </Alert>
      )}
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div><Users className="h-4 w-4 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Actifs</p><p className="text-xl font-bold text-green-600">{stats.active}</p></div><CheckCircle className="h-4 w-4 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Classes</p><p className="text-xl font-bold text-purple-600">{Object.keys(stats.byGrade).length}</p></div></div></CardContent></Card>
        </div>
      )}
      
      <DataTable
        data={registrations}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={changePage}
        onSort={handleSort}
        onSearch={handleSearch}
        currentFilters={filters}
        rooms={rooms}
        searchPlaceholder="Rechercher..."
        emptyStateMessage="Aucune inscription trouvée"
        title="Liste des Inscriptions"
        description={`${pagination.total} inscriptions`}
      />
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer l'inscription</DialogTitle><DialogDescription>Êtes-vous sûr ?</DialogDescription></DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Nom :</strong> {selectedRegistration.firstName} {selectedRegistration.lastName}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedRegistration(null); }} disabled={loadingAction === 'delete'}>Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteRegistration} disabled={loadingAction === 'delete'}>
                  {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Détails de l'inscription</DialogTitle></DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div><h3 className="text-xl font-semibold">{selectedRegistration.firstName} {selectedRegistration.lastName}</h3><p className="text-sm text-muted-foreground">{selectedRegistration.studentId}</p></div>
              <Button onClick={() => { setShowViewDialog(false); setSelectedRegistration(null); }}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};