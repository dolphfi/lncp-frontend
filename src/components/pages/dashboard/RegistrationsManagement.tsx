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
  FileText,
  FileEdit,
  Trash2,
  Send
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';

// Import des types
import { Admission, AdmissionStatus, AdmissionType, AdmissionDraft } from '../../../types/admission';

// Import du store
import { useAdmissionStore } from '../../../stores/admissionStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';
import { AddAdmissionModal } from '../../forms/AddAdmissionModal';
import { toast } from 'react-toastify';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES ADMISSIONS
// =====================================================
export const RegistrationsManagement: React.FC = () => {
  
  // État local
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<AdmissionDraft | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la confirmation (AlertDialog)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'finalize' | 'delete' | null>(null);
  const [targetDraft, setTargetDraft] = useState<AdmissionDraft | null>(null);
  
  // Store
  const {
    admissions,
    meta,
    drafts,
    draftsMeta,
    loading,
    error,
    fetchAdmissions,
    fetchDrafts,
    deleteDraft,
    finalizeDraft,
    clearError
  } = useAdmissionStore();
  
  // Handler pour la confirmation
  const handleConfirmAction = async () => {
    if (!targetDraft || !confirmAction) return;
    
    try {
      if (confirmAction === 'finalize') {
        await finalizeDraft(targetDraft.id);
        toast.success('Brouillon finalisé avec succès');
      } else if (confirmAction === 'delete') {
        await deleteDraft(targetDraft.id);
        toast.success('Brouillon supprimé');
      }
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.message || e.message;
      
      if (confirmAction === 'finalize') {
         if (typeof msg === 'object' && msg.message) {
             toast.error(msg.message);
         } else if (Array.isArray(msg)) {
             toast.error("Brouillon incomplet. Veuillez le modifier pour corriger les erreurs.");
         } else {
             toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la finalisation');
         }
      } else {
         toast.error('Erreur lors de l\'opération');
      }
    } finally {
      setConfirmOpen(false);
      setTargetDraft(null);
      setConfirmAction(null);
    }
  };
  
  // Chargement initial
  useEffect(() => {
    fetchAdmissions();
    fetchDrafts();
  }, [fetchAdmissions, fetchDrafts]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrage local simple pour l'instant (Admissions)
  const filteredAdmissions = React.useMemo(() => {
    if (!debouncedSearchTerm) return admissions;
    const lower = debouncedSearchTerm.toLowerCase();
    return admissions.filter(a => 
      a.firstName.toLowerCase().includes(lower) || 
      a.lastName.toLowerCase().includes(lower) ||
      (a.numeroDossier && a.numeroDossier.toLowerCase().includes(lower))
    );
  }, [admissions, debouncedSearchTerm]);

  // Filtrage local simple pour l'instant (Brouillons)
  const filteredDrafts = React.useMemo(() => {
    if (!debouncedSearchTerm) return drafts;
    const lower = debouncedSearchTerm.toLowerCase();
    return drafts.filter(d => 
      (d.firstName && d.firstName.toLowerCase().includes(lower)) || 
      (d.lastName && d.lastName.toLowerCase().includes(lower))
    );
  }, [drafts, debouncedSearchTerm]);

  // --- COLONNES ADMISSIONS ---
  const admissionColumns: Column<Admission>[] = [
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
          case AdmissionStatus.ACCEPTED: variant = "default"; break; 
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
  
  // --- COLONNES BROUILLONS ---
  const draftColumns: Column<AdmissionDraft>[] = [
    {
      key: 'firstName',
      label: 'Candidat',
      sortable: true,
      width: '250px',
      render: (firstName: string, draft: AdmissionDraft) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
              {draft.firstName?.charAt(0) || '?'}{draft.lastName?.charAt(0) || '?'}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">{draft.firstName || 'Sans nom'} {draft.lastName || ''}</p>
            <p className="text-xs text-gray-500">{draft.email || 'Sans email'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'completionPercentage',
      label: 'Complétion',
      sortable: true,
      width: '150px',
      render: (val: number) => (
        <div className="flex items-center gap-2 w-full">
          <Progress value={val} className="h-2 w-[60px]" />
          <span className="text-xs text-muted-foreground">{val}%</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (status: string) => (
        <Badge variant="outline" className={status === 'READY_TO_SUBMIT' ? 'border-green-500 text-green-600' : ''}>
          {status === 'READY_TO_SUBMIT' ? 'Prêt' : 'En cours'}
        </Badge>
      )
    },
    {
      key: 'expiresAt',
      label: 'Expire le',
      sortable: true,
      width: '120px',
      render: (date: string) => <span className="text-sm text-gray-500">{new Date(date).toLocaleDateString('fr-FR')}</span>
    }
  ];

  // Actions Admissions
  const admissionActions: RowAction<Admission>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (admission) => { setSelectedAdmission(admission); setShowViewDialog(true); }
    }
  ];

  // Actions Brouillons
  const draftActions: RowAction<AdmissionDraft>[] = [
    {
      label: "Finaliser",
      icon: <Send className="h-4 w-4 text-green-600" />,
      onClick: (draft) => {
        setTargetDraft(draft);
        setConfirmAction('finalize');
        setConfirmOpen(true);
      }
    },
    {
      label: "Modifier",
      icon: <FileEdit className="h-4 w-4 text-blue-600" />,
      onClick: (draft) => {
        setSelectedDraft(draft);
        setShowAddDialog(true);
      }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      onClick: (draft) => {
        setTargetDraft(draft);
        setConfirmAction('delete');
        setConfirmOpen(true);
      }
    }
  ];
  
  const handleSearch = (val: string) => setSearchTerm(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Admissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les demandes d'admission et les brouillons</p>
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
      
      <Tabs defaultValue="admissions" className="w-full">
        <TabsList>
          <TabsTrigger value="admissions">Demandes ({admissions.length})</TabsTrigger>
          <TabsTrigger value="drafts">Brouillons ({drafts.length})</TabsTrigger>
        </TabsList>

        {/* ONGLET ADMISSIONS */}
        <TabsContent value="admissions" className="space-y-4">
          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{admissions.length}</p></div><Users className="h-4 w-4 text-muted-foreground" /></div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Acceptées</p><p className="text-xl font-bold text-green-600">{admissions.filter(a => a.status === AdmissionStatus.ACCEPTED).length}</p></div><CheckCircle className="h-4 w-4 text-green-500" /></div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">En attente</p><p className="text-xl font-bold text-orange-600">{admissions.filter(a => a.status === AdmissionStatus.PENDING).length}</p></div><FileText className="h-4 w-4 text-orange-500" /></div></CardContent></Card>
          </div>

          <DataTable
            data={filteredAdmissions}
            columns={admissionColumns}
            loading={loading}
            rowActions={admissionActions}
            pagination={{
              page: meta?.page || 1,
              limit: meta?.limit || 50,
              total: meta?.total || filteredAdmissions.length,
              totalPages: meta?.pageCount || 1
            }}
            onPageChange={() => {}}
            onSort={() => {}} 
            onSearch={handleSearch}
            searchPlaceholder="Rechercher une admission..."
            emptyStateMessage="Aucune admission trouvée"
            title="Liste des demandes"
            description={`${filteredAdmissions.length} demandes`}
          />
        </TabsContent>

        {/* ONGLET BROUILLONS */}
        <TabsContent value="drafts" className="space-y-4">
          <div className="mt-4">
            <DataTable
              data={filteredDrafts}
              columns={draftColumns}
              loading={loading}
              rowActions={draftActions}
              pagination={{
                page: draftsMeta?.page || 1,
                limit: draftsMeta?.limit || 50,
                total: draftsMeta?.total || filteredDrafts.length,
                totalPages: draftsMeta?.pageCount || 1
              }}
              onPageChange={() => {}}
              onSort={() => {}} 
              onSearch={handleSearch}
              searchPlaceholder="Rechercher un brouillon..."
              emptyStateMessage="Aucun brouillon trouvé"
              title="Brouillons en cours"
              description={`${filteredDrafts.length} brouillons`}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <AddAdmissionModal 
        open={showAddDialog} 
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setSelectedDraft(null);
        }}
        draft={selectedDraft || undefined}
      />
      
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
      
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'finalize' ? 'Confirmer la finalisation' : 'Confirmer la suppression'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'finalize' 
                ? "Voulez-vous vraiment finaliser ce brouillon ? Une admission officielle sera créée et ne pourra plus être modifiée en tant que brouillon."
                : "Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action est irréversible."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {confirmAction === 'finalize' ? 'Finaliser' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};