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
  RefreshCw,
  Download,
  UserPlus,
  Archive
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../../ui/button';
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
import { useClassroomStore } from '../../../stores/classroomStore';
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
  const [selectedArchivedStudent, setSelectedArchivedStudent] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [showBulkResultsDialog, setShowBulkResultsDialog] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Store
  const {
    reRegistrations,
    archivedStudents,
    loading,
    error,
    loadingAction,
    pagination,
    stats,
    academicYears,
    fetchReRegistrations,
    fetchArchivedStudents,
    reRegisterStudent,
    reRegisterClassroom,
    deleteReRegistration,
    confirmReRegistration,
    rejectReRegistration,
    fetchAcademicYears,
    fetchGradeFees,
    changePage,
    clearError
  } = useReRegistrationStore();

  // Classroom Store
  const { fetchAll: fetchAllClassrooms, items: classrooms } = useClassroomStore();

  // Filtrer les étudiants archivés
  const filteredArchivedStudents = React.useMemo(() => {
    if (!archivedStudents) return [];
    if (!searchTerm) return archivedStudents;
    
    const lowerTerm = searchTerm.toLowerCase();
    return archivedStudents.filter((student: any) => 
      student.matricule?.toLowerCase().includes(lowerTerm) ||
      student.firstName?.toLowerCase().includes(lowerTerm) ||
      student.lastName?.toLowerCase().includes(lowerTerm) ||
      student.niveauEtude?.toLowerCase().includes(lowerTerm)
    );
  }, [archivedStudents, searchTerm]);

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


  // Handlers pour réinscription
  const handleReRegisterStudent = async (student: any) => {
    try {
      // Le backend attend l'ID original de l'étudiant (student.id) et non l'ID de l'archive
      await reRegisterStudent(student.id);
      const fullName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}` 
        : (student.matricule || 'L\'étudiant');
      toast.success(`${fullName} réinscrit avec succès !`);
      await fetchArchivedStudents(); // Recharger les données
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinscription');
    }
  };

  const handleBulkReRegister = async () => {
    if (!selectedClassroomId) {
      toast.error('Veuillez sélectionner une classe');
      return;
    }

    try {
      const results = await reRegisterClassroom(selectedClassroomId);
      setBulkResults(results);
      setShowBulkDialog(false);
      setShowBulkResultsDialog(true);
      await fetchArchivedStudents(); // Recharger les données
      toast.success(`${results.success} étudiants réinscrits avec succès !`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinscription en masse');
    }
  };

  // Effet pour charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchArchivedStudents();
      } catch (error: any) {
        // Gérer l'erreur de manière silencieuse avec un toast
        if (error.message?.includes('année académique planifiée')) {
          toast.warning('Aucune année académique planifiée trouvée. Veuillez configurer une année académique pour la réinscription.', {
            autoClose: 5000
          });
        } else {
          toast.error('Erreur lors du chargement des données archivées');
        }
        clearError();
      }
      
      // Charger les autres données
      fetchReRegistrations();
      fetchAcademicYears();
      fetchGradeFees();
      fetchAllClassrooms();
    };
    
    loadData();
  }, [fetchArchivedStudents, fetchReRegistrations, fetchAcademicYears, fetchGradeFees, clearError, fetchAllClassrooms]);

  // Calculer les classes disponibles pour la réinscription
  const availableClasses = React.useMemo(() => {
    if (!archivedStudents || archivedStudents.length === 0) return [];

    const classesMap = new Map();

    archivedStudents.forEach((student: any) => {
      if (student.classroomId) {
        if (!classesMap.has(student.classroomId)) {
          // Essayer de trouver le nom de la classe dans le store classrooms
          const classroom = classrooms.find(c => c.id === student.classroomId);
          const className = classroom ? classroom.name : (student.classroomName || student.niveauEtude || 'Classe inconnue');
          
          classesMap.set(student.classroomId, {
            id: student.classroomId,
            name: className,
            total: 0,
            admis: 0,
            repech: 0,
            redouble: 0,
            pending: 0
          });
        }

        const classStats = classesMap.get(student.classroomId);
        classStats.total++;

        // Compter selon la décision
        const decision = student.decision?.toLowerCase() || '';
        if (decision.includes('admis')) classStats.admis++;
        else if (decision.includes('repech')) classStats.repech++;
        else if (decision.includes('redoubl')) classStats.redouble++;
        
        // Compter selon le statut
        if (student.status === 'pending') classStats.pending++;
      }
    });

    return Array.from(classesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [archivedStudents, classrooms]);

  const selectedClassStats = React.useMemo(() => {
    return availableClasses.find(c => c.id === selectedClassroomId);
  }, [availableClasses, selectedClassroomId]);

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

      {error && !error.message?.includes('année académique planifiée') && (
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

      {/* Liste des étudiants archivés */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Étudiants archivés de l'année précédente</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ces étudiants sont prêts à être réinscrits pour la nouvelle année académique
            </p>
          </div>
          <div className="w-72">
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : filteredArchivedStudents && filteredArchivedStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Matricule</th>
                    <th className="text-left p-3">Nom Complet</th>
                    <th className="text-left p-3">Niveau</th>
                    <th className="text-left p-3">Moyenne</th>
                    <th className="text-left p-3">Décision</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArchivedStudents.map((student: any) => (
                    <tr key={student.archiveId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{student.matricule}</td>
                      <td className="p-3">
                        {student.firstName || student.lastName ? (
                          <span>{student.firstName} {student.lastName}</span>
                        ) : (
                          <span className="text-gray-600 font-mono">{student.matricule || 'L\'étudiant'}</span>
                        )}
                      </td>
                      <td className="p-3">{student.niveauEtude}</td>
                      <td className="p-3 font-medium">{student.moyenneGenerale ? Number(student.moyenneGenerale).toFixed(2) : '-'}</td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            student.decision?.toLowerCase().includes('admis') ? 'default' :
                            student.decision?.toLowerCase().includes('repech') ? 'secondary' : 'destructive'
                          } 
                          className={`text-xs ${
                            student.decision?.toLowerCase().includes('admis') ? 'bg-green-600 hover:bg-green-700' :
                            student.decision?.toLowerCase().includes('repech') ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''
                          }`}
                        >
                          {student.decision || 'En attente'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            student.status === 'pending' ? 'secondary' :
                            student.status === 'completed' ? 'default' : 'destructive'
                          }
                        >
                          {student.status === 'pending' && 'En attente'}
                          {student.status === 'completed' && 'Réinscrit'}
                          {student.status === 'failed' && 'Échec'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {student.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleReRegisterStudent(student)}
                              disabled={loadingAction === 'reregister'}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Réinscrire
                            </Button>
                          )}
                          {student.status === 'completed' && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terminé
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Archive className="h-16 w-16 text-gray-300 mb-2" />
              <div>
                <p className="text-gray-500 font-medium mb-1">Aucun étudiant archivé trouvé</p>
                <p className="text-sm text-gray-400 max-w-md">
                  {searchTerm ? (
                    'Aucun résultat ne correspond à votre recherche.'
                  ) : error?.message?.includes('année académique planifiée') ? (
                    <>
                      Aucune année académique n'est planifiée pour la réinscription.
                      <br />
                      Veuillez configurer une année académique dans le module "Années Académiques".
                    </>
                  ) : (
                    'Les étudiants archivés de l\'année précédente apparaîtront ici pour être réinscrits.'
                  )}
                </p>
              </div>
              {error?.message?.includes('année académique planifiée') && (
                <Alert className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Action requise :</strong> Créez ou activez une année académique dans le module de gestion des années académiques pour permettre les réinscriptions.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Réinscrire une classe archivée</DialogTitle>
            <DialogDescription>
              Réinscrivez automatiquement tous les étudiants d'une classe archivée selon leurs décisions académiques
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classroom-select">Classe archivée *</Label>
              <Select
                value={selectedClassroomId}
                onValueChange={setSelectedClassroomId}
              >
                <SelectTrigger id="classroom-select">
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.pending} étudiants en attente / {cls.total} total)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sélectionnez la classe archivée dont les étudiants doivent être réinscrits
              </p>
            </div>

            {selectedClassStats && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-slate-900">Aperçu de la classe {selectedClassStats.name}</h4>
                  <Badge variant="outline">{selectedClassStats.total} étudiants</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 p-2 rounded border border-green-100">
                    <div className="text-lg font-bold text-green-700">{selectedClassStats.admis}</div>
                    <div className="text-xs text-green-600">Admis</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-100">
                    <div className="text-lg font-bold text-orange-700">{selectedClassStats.repech}</div>
                    <div className="text-xs text-orange-600">Repêchés</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded border border-red-100">
                    <div className="text-lg font-bold text-red-700">{selectedClassStats.redouble}</div>
                    <div className="text-xs text-red-600">Redoublants</div>
                  </div>
                </div>

                {selectedClassStats.pending === 0 && (
                  <Alert className="bg-blue-50 border-blue-200 py-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-xs text-blue-700 ml-2">
                      Tous les étudiants de cette classe sont déjà traités (réinscrits ou échoués).
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Fonctionnement intelligent :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Admis(e) → Promotion vers classe supérieure</li>
                  <li>Repêché(e) → Promotion avec salle séparée</li>
                  <li>Redoublé(e) → Même classe avec réassignation</li>
                  <li>En cours/Autres → Marqués comme échecs</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkDialog(false);
                  setSelectedClassroomId('');
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleBulkReRegister}
                disabled={!selectedClassroomId || loadingAction === 'bulk-reregister' || (selectedClassStats?.pending === 0)}
              >
                {loadingAction === 'bulk-reregister' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Réinscription...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Réinscrire la classe
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog résultats réinscription en masse */}
      <Dialog open={showBulkResultsDialog} onOpenChange={setShowBulkResultsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats de la réinscription en masse</DialogTitle>
          </DialogHeader>
          {bulkResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Réussites</p>
                        <p className="text-2xl font-bold text-green-600">{bulkResults.success}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Échecs</p>
                        <p className="text-2xl font-bold text-red-600">{bulkResults.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Matricule</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Décision</th>
                      <th className="text-left p-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.results.map((result: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono text-xs">{result.matricule}</td>
                        <td className="p-2">
                          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                            {result.status}
                          </Badge>
                        </td>
                        <td className="p-2">{result.decision || '-'}</td>
                        <td className="p-2 text-xs">
                          {result.error ? (
                            <span className="text-red-600">{result.error}</span>
                          ) : (
                            <span className="text-green-600">{result.message}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowBulkResultsDialog(false)}>
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