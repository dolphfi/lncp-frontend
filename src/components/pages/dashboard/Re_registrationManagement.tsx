/**
 * =====================================================
 * COMPOSANT DE GESTION DES RÉINSCRIPTIONS
 * =====================================================
 * Ce composant gère l'affichage et la manipulation des
 * réinscriptions d'élèves suivant le modèle des étudiants
 */

import React, { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
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
import { ReRegistration, ReRegistrationDecision, ReRegistrationStatus } from '../../../types/re_registration';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES RÉINSCRIPTIONS
// =====================================================
export const Re_registrationManagement: React.FC = () => {

  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedReRegistration, setSelectedReRegistration] = useState<ReRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');

  // État du formulaire de réinscription en masse
  const [bulkFormData, setBulkFormData] = useState({
    currentGrade: '',
    newGrade: '',
    academicYear: '2024-2025',
    registrationDecision: 'grade_promotion' as ReRegistrationDecision,
    notes: '',
    fees: {
      amount: 0,
      currency: 'HTG'
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
    fetchReRegistrations,
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
      width: '200px',
      render: (currentGrade: string) => (
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {currentGrade}
        </Badge>
      )
    },
    {
      key: 'registrationDecision',
      label: 'Decision',
      sortable: true,
      width: '120px',
      render: (type: ReRegistrationDecision) => {
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
      key: 'registrationDate',
      label: 'Date demande',
      sortable: true,
      width: '200px',
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
      },
      variant: "success"
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


  // Effet pour charger les données
  useEffect(() => {
    fetchReRegistrations();
    fetchAcademicYears();
    fetchGradeFees();
  }, [fetchReRegistrations, fetchAcademicYears, fetchGradeFees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Réinscriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les demandes de réinscription des élèves</p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)} disabled={loading}>
          <GraduationCap className="h-4 w-4 mr-2" />Réinscrire une classe
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la réinscription</DialogTitle>
            <DialogDescription>Confirmez-vous cette demande de réinscription ?</DialogDescription>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-4 pr-2">
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rejeter la réinscription</DialogTitle>
            <DialogDescription>Veuillez indiquer la raison du rejet de cette demande.</DialogDescription>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-4 pr-2">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la réinscription</DialogTitle>
          </DialogHeader>
          {selectedReRegistration && (
            <div className="space-y-6 pr-2">
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
                    <p><strong>Decision :</strong> {selectedReRegistration.registrationDecision}</p>
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

      {/* Dialog de réinscription en masse */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réinscrire une classe</DialogTitle>
            <DialogDescription>
              Créer des demandes de réinscription pour tous les élèves d'une classe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-grade">Classe actuelle *</Label>
                <Select
                  value={bulkFormData.currentGrade}
                  onValueChange={(value) => setBulkFormData(prev => ({ ...prev, currentGrade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la classe actuelle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSI">NSI</SelectItem>
                    <SelectItem value="NSII">NSII</SelectItem>
                    <SelectItem value="NSIII">NSIII</SelectItem>
                    <SelectItem value="NSIV">NSIV</SelectItem>
                    <SelectItem value="Philo">Philo</SelectItem>
                    <SelectItem value="Rhéto">Rhéto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-grade">Nouvelle classe *</Label>
                <Select
                  value={bulkFormData.newGrade}
                  onValueChange={(value) => setBulkFormData(prev => ({ ...prev, newGrade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la nouvelle classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSI">NSI</SelectItem>
                    <SelectItem value="NSII">NSII</SelectItem>
                    <SelectItem value="NSIII">NSIII</SelectItem>
                    <SelectItem value="NSIV">NSIV</SelectItem>
                    <SelectItem value="Philo">Philo</SelectItem>
                    <SelectItem value="Rhéto">Rhéto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-academic-year">Année scolaire</Label>
                <Select
                  value={bulkFormData.academicYear}
                  onValueChange={(value) => setBulkFormData(prev => ({ ...prev, academicYear: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.year}>
                        {year.year} {year.isActive && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-registration-type">Type de réinscription</Label>
                <Select
                  value={bulkFormData.registrationDecision}
                  onValueChange={(value: ReRegistrationDecision) => setBulkFormData(prev => ({ ...prev, registrationDecision: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade_promotion">Promotion</SelectItem>
                    <SelectItem value="grade_repeat">Redoublement</SelectItem>
                    <SelectItem value="same_grade">Même classe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-fees-amount">Montant des frais (HTG)</Label>
                <Input
                  id="bulk-fees-amount"
                  type="number"
                  value={bulkFormData.fees.amount}
                  onChange={(e) => setBulkFormData(prev => ({
                    ...prev,
                    fees: { ...prev.fees, amount: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="Ex: 15000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-fees-currency">Devise</Label>
                <Select
                  value={bulkFormData.fees.currency}
                  onValueChange={(value) => setBulkFormData(prev => ({
                    ...prev,
                    fees: { ...prev.fees, currency: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTG">HTG</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-notes">Notes (optionnel)</Label>
              <Textarea
                id="bulk-notes"
                value={bulkFormData.notes}
                onChange={(e) => setBulkFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes générales pour toutes les réinscriptions..."
                rows={3}
              />
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Information :</p>
                    <p className="text-xs">
                      Cette action créera une demande de réinscription pour chaque élève de la classe sélectionnée.
                      Tous les élèves auront les mêmes paramètres (frais, type, notes).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkDialog(false);
                  setBulkFormData({
                    currentGrade: '',
                    newGrade: '',
                    academicYear: '2024-2025',
                    registrationDecision: 'grade_promotion',
                    notes: '',
                    fees: {
                      amount: 0,
                      currency: 'HTG'
                    }
                  });
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implémenter la logique de réinscription en masse
                  console.log('Réinscription en masse:', bulkFormData);
                  setShowBulkDialog(false);
                }}
                disabled={!bulkFormData.currentGrade || !bulkFormData.newGrade}
              >
                Créer les réinscriptions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};