/**
 * =====================================================
 * PAGE DE GESTION DES ADMISSIONS
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Users,
  FileText
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
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';

// Import des types
import { Admission, AdmissionStatus, AdmissionType } from '../../../types/admission';

// Import du store
import { useAdmissionStore } from '../../../stores/admissionStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';
import { AddAdmissionModal } from '../../forms/AddAdmissionModal';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES ADMISSIONS
// =====================================================
export const RegistrationsManagement: React.FC = () => {
  
  // État local
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Store
  const {
    admissions,
    meta,
    loading,
    error,
    fetchAdmissions,
    clearError
  } = useAdmissionStore();
  
  // Chargement initial
  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrage local simple pour l'instant
  const filteredAdmissions = React.useMemo(() => {
    if (!debouncedSearchTerm) return admissions;
    const lower = debouncedSearchTerm.toLowerCase();
    return admissions.filter(a => 
      a.firstName.toLowerCase().includes(lower) || 
      a.lastName.toLowerCase().includes(lower) ||
      (a.numeroDossier && a.numeroDossier.toLowerCase().includes(lower))
    );
  }, [admissions, debouncedSearchTerm]);

  // Configuration des colonnes
  const columns: Column<Admission>[] = [
    {
      key: 'numeroDossier',
      label: 'Dossier',
      sortable: true,
      width: '150px',
      render: (value: string) => <span className="font-mono font-medium">{value || '-'}</span>
    },
    {
      key: 'firstName',
      label: 'Candidat',
      sortable: true,
      width: '250px',
      render: (firstName: string, admission: Admission) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              {admission.firstName?.charAt(0)}{admission.lastName?.charAt(0)}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">{admission.firstName} {admission.lastName}</p>
            <p className="text-xs text-gray-500">{admission.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      width: '100px',
      render: (type: AdmissionType) => (
        <Badge variant={type === AdmissionType.ON_SITE ? 'default' : 'outline'}>
          {type === AdmissionType.ON_SITE ? 'Sur Place' : 'En Ligne'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (status: AdmissionStatus) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        switch (status) {
          case AdmissionStatus.ACCEPTED: variant = "default"; break; // Utiliser default (souvent vert ou primaire)
          case AdmissionStatus.REJECTED: variant = "destructive"; break;
          case AdmissionStatus.PENDING: variant = "secondary"; break;
          case AdmissionStatus.DRAFT: variant = "outline"; break;
        }
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      width: '120px',
      render: (date: string) => <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
    }
  ];
  
  // Actions de ligne
  const rowActions: RowAction<Admission>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (admission) => { setSelectedAdmission(admission); setShowViewDialog(true); }
    }
  ];
  
  const handleSearch = (val: string) => setSearchTerm(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Admissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les demandes d'admission</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />Nouvelle Admission
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}<Button variant="link" size="sm" onClick={clearError} className="ml-2 h-auto p-0">Fermer</Button></AlertDescription>
        </Alert>
      )}
      
      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{admissions.length}</p></div><Users className="h-4 w-4 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Acceptées</p><p className="text-xl font-bold text-green-600">{admissions.filter(a => a.status === AdmissionStatus.ACCEPTED).length}</p></div><CheckCircle className="h-4 w-4 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">En attente</p><p className="text-xl font-bold text-orange-600">{admissions.filter(a => a.status === AdmissionStatus.PENDING).length}</p></div><FileText className="h-4 w-4 text-orange-500" /></div></CardContent></Card>
      </div>
      
      <DataTable
        data={filteredAdmissions}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={{
          page: meta?.page || 1,
          limit: meta?.limit || 50,
          total: meta?.total || filteredAdmissions.length,
          totalPages: meta?.pageCount || 1
        }}
        onPageChange={() => {}}
        onSort={() => {}} // Tri local par défaut de DataTable si non géré par le parent
        onSearch={handleSearch}
        searchPlaceholder="Rechercher un candidat..."
        emptyStateMessage="Aucune admission trouvée"
        title="Liste des demandes"
        description={`${filteredAdmissions.length} demandes`}
      />
      
      <AddAdmissionModal open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Détails du dossier</DialogTitle></DialogHeader>
          {selectedAdmission && (
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedAdmission.firstName} {selectedAdmission.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAdmission.numeroDossier}</p>
                </div>
                <Badge>{selectedAdmission.status}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Contact</h4>
                  <p>{selectedAdmission.email}</p>
                  <p>{selectedAdmission.phone || '-'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Informations</h4>
                  <p>Sexe: {selectedAdmission.sexe || '-'}</p>
                  <p>Né(e) le: {selectedAdmission.dateOfBirth ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              {selectedAdmission.documentsFournis && selectedAdmission.documentsFournis.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Documents</h4>
                  <ul className="list-disc pl-5">
                    {selectedAdmission.documentsFournis.map((doc, idx) => (
                      <li key={idx}><a href={doc.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{doc.type}</a></li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => { setShowViewDialog(false); setSelectedAdmission(null); }}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};