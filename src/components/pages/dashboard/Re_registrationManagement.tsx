/**
 * =====================================================
 * COMPOSANT DE GESTION DES RÉINSCRIPTIONS
 * =====================================================
 * Ce composant gère l'affichage et la manipulation des
 * réinscriptions d'élèves suivant le modèle des étudiants
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit,
  Trash2, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Calendar,
  TrendingUp
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
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { 
  Alert, 
  AlertDescription 
} from '../../ui/alert';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';

import { useReRegistrationStore } from '../../../stores/re_registrationStore';
import { ReRegistration, ReRegistrationStatus, ReRegistrationType } from '../../../types/re_registration';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES RÉINSCRIPTIONS
// =====================================================
export const Re_registrationManagement: React.FC = () => {
  
  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedReRegistration, setSelectedReRegistration] = useState<ReRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');

  // État du formulaire d'ajout
  const [formData, setFormData] = useState({
    studentId: '',
    academicYear: '2024-2025',
    newGrade: '',
    newRoomId: '',
    registrationType: 'grade_promotion' as ReRegistrationType,
    notes: '',
    fees: {
      amount: 0,
      currency: 'HTG'
    },
    documents: {
      reportCard: false,
      parentAuthorization: false,
      medicalCertificate: false,
      photos: false
    }
  });

  // Store
  const {
    reRegistrations,
    loading,
    error,
    loadingAction,
    pagination,
    stats,
    academicYears,
    gradeFees,
    fetchReRegistrations,
    createReRegistration,
    deleteReRegistration,
    confirmReRegistration,
    rejectReRegistration,
    fetchAcademicYears,
    fetchGradeFees,
    changePage,
    clearError
  } = useReRegistrationStore();

  // Configuration des colonnes
  const columns: Column<ReRegistration>[] = [
    {
      key: 'student',
      label: 'Élève',
      sortable: true,
      searchable: true,
      width: '200px',
      render: (student: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {student.studentId}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'currentGrade',
      label: 'Classe actuelle',
      sortable: true,
      width: '120px',
      render: (currentGrade: string) => (
        <Badge variant="outline" className="text-xs">
          {currentGrade}
        </Badge>
      )
    },
    {
      key: 'newGrade',
      label: 'Nouvelle classe',
      sortable: true,
      width: '120px',
      render: (newGrade: string) => (
        <Badge variant="secondary" className="text-xs">
          {newGrade}
        </Badge>
      )
    },
    {
      key: 'registrationType',
      label: 'Type',
      sortable: true,
      width: '120px',
      render: (type: ReRegistrationType) => {
        const typeLabels = {
          same_grade: 'Même classe',
          grade_promotion: 'Promotion',
          grade_repeat: 'Redoublement'
        };
        const typeColors = {
          same_grade: 'default',
          grade_promotion: 'secondary',
          grade_repeat: 'outline'
        } as const;
        
        return (
          <Badge variant={typeColors[type]} className="text-xs">
            {typeLabels[type]}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (status: ReRegistrationStatus) => {
        const statusConfig = {
          pending: { label: 'En attente', variant: 'secondary' as const, icon: AlertCircle },
          confirmed: { label: 'Confirmée', variant: 'default' as const, icon: CheckCircle },
          rejected: { label: 'Rejetée', variant: 'destructive' as const, icon: XCircle },
          cancelled: { label: 'Annulée', variant: 'outline' as const, icon: XCircle }
        };
        
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="text-xs flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'fees',
      label: 'Frais',
      sortable: true,
      width: '120px',
      render: (fees: any) => (
        <div className="text-sm">
          <p className="font-medium">{fees.amount.toLocaleString()} {fees.currency}</p>
          <p className={`text-xs ${fees.isPaid ? 'text-green-600' : 'text-red-600'}`}>
            {fees.isPaid ? 'Payé' : 'Impayé'}
          </p>
        </div>
      )
    },
    {
      key: 'registrationDate',
      label: 'Date demande',
      sortable: true,
      width: '120px',
      render: (date: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(date).toLocaleDateString('fr-FR')}
        </span>
      )
    }
  ];

  // Actions de ligne
  const rowActions: RowAction<ReRegistration>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (reRegistration) => { 
        setSelectedReRegistration(reRegistration); 
        setShowViewDialog(true); 
      }
    },
    {
      label: "Confirmer",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (reRegistration: ReRegistration) => { 
        if (reRegistration.status === 'pending') {
          setSelectedReRegistration(reRegistration); 
          setShowConfirmDialog(true); 
        }
      }
    },
    {
      label: "Rejeter",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (reRegistration: ReRegistration) => { 
        if (reRegistration.status === 'pending') {
          setSelectedReRegistration(reRegistration); 
          setShowRejectDialog(true); 
        }
      },
      variant: "destructive"
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (reRegistration) => { 
        setSelectedReRegistration(reRegistration); 
        setShowDeleteDialog(true); 
      },
      variant: "destructive"
    }
  ];

  // Gestionnaires
  const handleDeleteReRegistration = async () => {
    if (!selectedReRegistration) return;
    try {
      await deleteReRegistration(selectedReRegistration.id);
      setShowDeleteDialog(false);
      setSelectedReRegistration(null);
      console.log('Réinscription supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression');
    }
  };

  const handleConfirmReRegistration = async () => {
    if (!selectedReRegistration) return;
    try {
      await confirmReRegistration(selectedReRegistration.id, confirmationNotes);
      setShowConfirmDialog(false);
      setSelectedReRegistration(null);
      setConfirmationNotes('');
      console.log('Réinscription confirmée avec succès');
    } catch (error) {
      console.error('Erreur lors de la confirmation');
    }
  };

  const handleRejectReRegistration = async () => {
    if (!selectedReRegistration || !rejectionReason.trim()) return;
    try {
      await rejectReRegistration(selectedReRegistration.id, rejectionReason);
      setShowRejectDialog(false);
      setSelectedReRegistration(null);
      setRejectionReason('');
      console.log('Réinscription rejetée');
    } catch (error) {
      console.error('Erreur lors du rejet');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReRegistration(formData);
      setShowAddDialog(false);
      // Réinitialiser le formulaire
      setFormData({
        studentId: '',
        academicYear: '2024-2025',
        newGrade: '',
        newRoomId: '',
        registrationType: 'grade_promotion',
        notes: '',
        fees: {
          amount: 0,
          currency: 'HTG'
        },
        documents: {
          reportCard: false,
          parentAuthorization: false,
          medicalCertificate: false,
          photos: false
        }
      });
      console.log('Réinscription créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création');
    }
  };

  // Effet pour charger les données
  useEffect(() => {
    fetchReRegistrations();
    fetchAcademicYears();
    fetchGradeFees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Réinscriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les demandes de réinscription des élèves</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />Nouvelle réinscription
        </Button>
      </div>
      
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
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Confirmées</p>
                  <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Frais impayés</p>
                  <p className="text-xl font-bold text-red-600">{stats.unpaidFees.toLocaleString()}</p>
                </div>
                <CreditCard className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <DataTable
        data={reRegistrations}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={changePage}
        searchPlaceholder="Rechercher un élève..."
        emptyStateMessage="Aucune réinscription trouvée"
        title="Liste des réinscriptions"
        description={`${pagination.total} réinscriptions`}
      />
      
      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la réinscription</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette réinscription ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Élève :</strong> {selectedReRegistration.student.firstName} {selectedReRegistration.student.lastName}</p>
                <p><strong>Classe :</strong> {selectedReRegistration.currentGrade} → {selectedReRegistration.newGrade}</p>
                <p><strong>Statut :</strong> {selectedReRegistration.status}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedReRegistration(null); }}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteReRegistration} disabled={loadingAction === 'delete'}>
                  {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réinscription</DialogTitle>
            <DialogDescription>Confirmez-vous cette demande de réinscription ?</DialogDescription>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p><strong>Élève :</strong> {selectedReRegistration.student.firstName} {selectedReRegistration.student.lastName}</p>
                <p><strong>Classe :</strong> {selectedReRegistration.currentGrade} → {selectedReRegistration.newGrade}</p>
                <p><strong>Frais :</strong> {selectedReRegistration.fees.amount.toLocaleString()} {selectedReRegistration.fees.currency}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmation-notes">Notes (optionnel)</Label>
                <Textarea
                  id="confirmation-notes"
                  value={confirmationNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfirmationNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cette confirmation..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowConfirmDialog(false); setConfirmationNotes(''); }}>
                  Annuler
                </Button>
                <Button onClick={handleConfirmReRegistration} disabled={loadingAction === 'confirm'}>
                  {loadingAction === 'confirm' ? 'Confirmation...' : 'Confirmer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la réinscription</DialogTitle>
            <DialogDescription>Veuillez indiquer la raison du rejet de cette demande.</DialogDescription>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p><strong>Élève :</strong> {selectedReRegistration.student.firstName} {selectedReRegistration.student.lastName}</p>
                <p><strong>Classe :</strong> {selectedReRegistration.currentGrade} → {selectedReRegistration.newGrade}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Raison du rejet *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectReRegistration} 
                  disabled={loadingAction === 'reject' || !rejectionReason.trim()}
                >
                  {loadingAction === 'reject' ? 'Rejet...' : 'Rejeter'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de visualisation */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la réinscription</DialogTitle>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-6">
              {/* En-tête avec informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Informations élève
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Nom :</strong> {selectedReRegistration.student.firstName} {selectedReRegistration.student.lastName}</p>
                    <p><strong>Matricule :</strong> {selectedReRegistration.student.studentId}</p>
                    <p><strong>Classe actuelle :</strong> {selectedReRegistration.currentGrade}</p>
                    <p><strong>Nouvelle classe :</strong> {selectedReRegistration.newGrade}</p>
                    <p><strong>Type :</strong> {selectedReRegistration.registrationType}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Informations financières
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Montant :</strong> {selectedReRegistration.fees.amount.toLocaleString()} {selectedReRegistration.fees.currency}</p>
                    <p><strong>Statut paiement :</strong> 
                      <Badge variant={selectedReRegistration.fees.isPaid ? 'default' : 'destructive'} className="ml-2">
                        {selectedReRegistration.fees.isPaid ? 'Payé' : 'Impayé'}
                      </Badge>
                    </p>
                    {selectedReRegistration.fees.paymentDate && (
                      <p><strong>Date paiement :</strong> {new Date(selectedReRegistration.fees.paymentDate).toLocaleDateString('fr-FR')}</p>
                    )}
                    {selectedReRegistration.fees.paymentMethod && (
                      <p><strong>Méthode :</strong> {selectedReRegistration.fees.paymentMethod}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Documents requis */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents requis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      {selectedReRegistration.documents.reportCard ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Bulletin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedReRegistration.documents.parentAuthorization ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Autorisation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedReRegistration.documents.medicalCertificate ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Certificat médical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedReRegistration.documents.photos ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span className="text-sm">Photos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Notes et dates */}
              {(selectedReRegistration.notes || selectedReRegistration.rejectionReason) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReRegistration.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes :</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReRegistration.notes}</p>
                      </div>
                    )}
                    {selectedReRegistration.rejectionReason && (
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Raison du rejet :</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{selectedReRegistration.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setShowViewDialog(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};