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

import React, { useState, useEffect, useMemo } from 'react';
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
  UserX,
  Settings,
  RefreshCw,
  Search,
  Check
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
  DialogTitle,
  DialogFooter
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { ScrollArea } from '../../ui/scroll-area';
import { toast } from 'react-toastify';

// Import du store
import { useAttendanceStore, Attendance } from '../../../stores/attendancesStore';
import { useClassroomStore } from '../../../stores/classroomStore';
import { useStudentStore } from '../../../stores/studentStore';
import { useEmployeeStore } from '../../../stores/employeeStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES PRÉSENCES
// =====================================================
export const AttendancesManagement: React.FC = () => {
  
  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showJustifyDialog, setShowJustifyDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userSearchId, setUserSearchId] = useState('');
  
  // Formulaire manuel
  const [manualForm, setManualForm] = useState({
    studentId: '',
    reason: '',
    timestamp: new Date().toISOString().slice(0, 16) // Format datetime-local
  });
  
  // Recherche de personne pour pointage manuel
  const [targetType, setTargetType] = useState<'student' | 'employee'>('student');
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Formulaire justification
  const [justifyReason, setJustifyReason] = useState('');

  // Store
  const {
    attendances,
    loading,
    error,
    loadingAction,
    pagination,
    stats,
    fetchLatenessReport,
    fetchUserReport,
    recordManualAttendance,
    justifyAttendance,
    setFilters,
    setSortOptions,
    changePage,
    clearError,
    cleanupInvalidAbsences,
    reprocessAbsences,
    forceAbsenceDetection
  } = useAttendanceStore();

  const { fetchAll: fetchClassrooms } = useClassroomStore();
  const { allStudents, fetchStudents } = useStudentStore();
  const { allEmployees, fetchEmployees } = useEmployeeStore();
  
  // Chargement initial : Retards du jour par défaut
  useEffect(() => {
    if (selectedDate) {
      fetchLatenessReport(selectedDate);
    }
    fetchClassrooms(1, 50);
    // Précharger pour la recherche
    fetchStudents();
    fetchEmployees();
  }, [fetchLatenessReport, fetchClassrooms, fetchStudents, fetchEmployees, selectedDate]);

  // Filtrage des personnes pour la recherche
  const filteredPersons = useMemo(() => {
    const searchLower = personSearch.toLowerCase();
    if (!searchLower && !selectedPerson) return []; // Ne rien afficher si pas de recherche

    const source = (targetType === 'student' ? allStudents : allEmployees) as any[];
    
    return source.filter((p: any) => {
      // Adaptation selon la structure des objets (Student vs Employee)
      const firstName = p.firstName || '';
      const lastName = p.lastName || '';
      const id = targetType === 'student' ? (p.studentId || p.matricule) : (p.employeeId || p.id);
      
      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        (id && id.toLowerCase().includes(searchLower))
      );
    }).slice(0, 10); // Limiter à 10 résultats
  }, [personSearch, targetType, allStudents, allEmployees, selectedPerson]);

  // Gestionnaires
  const handleSearchUser = () => {
    if (userSearchId.trim()) {
      fetchUserReport(userSearchId.trim());
    } else {
      fetchLatenessReport(selectedDate);
    }
  };

  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    // ID à utiliser : studentId/matricule pour étudiant, employeeId/id pour employé
    // IMPORTANT: Le backend attend probablement l'UUID (id) ou le matricule selon la config.
    // Supposons UUID pour être sûr, ou matricule si c'est ce qui est affiché.
    // D'après les props, student.id est l'UUID.
    const id = person.id; 
    setManualForm({ ...manualForm, studentId: id });
    setPersonSearch(`${person.firstName} ${person.lastName}`);
  };

  const handleManualSubmit = async () => {
    if (!manualForm.studentId || !manualForm.timestamp) {
      toast.error('Veuillez sélectionner une personne et une date');
      return;
    }
    try {
      // Adapter le payload selon le type
      const payload: any = {
        timestamp: new Date(manualForm.timestamp).toISOString(),
        reason: manualForm.reason
      };
      
      if (targetType === 'student') {
        payload.studentId = manualForm.studentId;
      } else {
        payload.employeeId = manualForm.studentId; // Le backend utilise employeeId aussi ? Vérifier DTO.
        // Le DTO ManualAttendanceDto a studentId? et employeeId?.
        // Si c'est un employé, on met employeeId.
        // Correction: manualForm.studentId contient l'ID sélectionné.
        payload.employeeId = manualForm.studentId;
        delete payload.studentId;
      }

      await recordManualAttendance(payload);
      toast.success('Pointage manuel enregistré');
      setShowManualDialog(false);
      setManualForm({ ...manualForm, studentId: '', reason: '' });
      setSelectedPerson(null);
      setPersonSearch('');
    } catch (error) {
      // Erreur gérée par le store
    }
  };

  const handleJustifySubmit = async () => {
    if (!selectedAttendance || !justifyReason.trim()) return;
    try {
      await justifyAttendance(selectedAttendance.id, { reason: justifyReason });
      toast.success('Justification enregistrée');
      setShowJustifyDialog(false);
      setJustifyReason('');
      setSelectedAttendance(null);
    } catch (error) {
      // Erreur gérée par le store
    }
  };

  const handleMaintenanceAction = async (action: 'cleanup' | 'reprocess' | 'force') => {
    try {
      if (action === 'cleanup') await cleanupInvalidAbsences();
      if (action === 'reprocess') await reprocessAbsences(selectedDate);
      if (action === 'force') await forceAbsenceDetection();
      toast.success('Action de maintenance effectuée avec succès');
    } catch (error) {
      // Erreur gérée par le store
    }
  };

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
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{studentName || 'Inconnu'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{attendance.studentMatricule || attendance.studentId}</p>
        </div>
      )
    },
    {
      key: 'classroomName',
      label: 'Classe',
      sortable: true,
      width: '150px',
      render: (classroomName: string) => (
        <Badge variant="outline" className="text-xs">{classroomName || 'N/A'}</Badge>
      )
    },
    {
      key: 'timestamp',
      label: 'Date/Heure',
      sortable: true,
      width: '160px',
      render: (timestamp: string, attendance: Attendance) => {
        const date = new Date(timestamp || attendance.date);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{date.toLocaleDateString('fr-FR')}</span>
            <span className="text-xs text-gray-500">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
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
        const config = configs[status] || configs.absent;
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
      key: 'reason',
      label: 'Justification/Note',
      width: '200px',
      render: (reason?: string) => (
        <span className="text-sm text-gray-600 truncate max-w-[200px] block" title={reason}>{reason || '—'}</span>
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
      label: "Justifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (attendance) => { 
        setSelectedAttendance(attendance); 
        setJustifyReason(attendance.reason || '');
        setShowJustifyDialog(true); 
      },
      // Afficher seulement si absent ou retard
      disabled: (attendance) => !['absent', 'late'].includes(attendance.status)
    }
  ];
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);
  
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => setSortOptions({ field: sort.field as keyof Attendance, order: sort.order });
  
  return (
    <div className="space-y-6">
      {/* EN-TÊTE AVEC ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Présences</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivi des présences, retards et justifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowMaintenanceDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />Maintenance
          </Button>
          <Button onClick={() => setShowManualDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Pointage Manuel
          </Button>
        </div>
      </div>
      
      {/* BARRE DE RECHERCHE ET FILTRES */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="user-search">Recherche par ID Étudiant/Employé</Label>
              <div className="flex gap-2 mt-1.5">
                <Input 
                  id="user-search"
                  placeholder="ID UUID..." 
                  value={userSearchId}
                  onChange={(e) => setUserSearchId(e.target.value)}
                />
                <Button onClick={handleSearchUser} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full md:w-auto">
               <Label htmlFor="date-filter">Date (pour retards/maintenance)</Label>
               <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (!userSearchId) fetchLatenessReport(e.target.value);
                }}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}<Button variant="link" size="sm" onClick={clearError} className="ml-2 h-auto p-0">Fermer</Button></AlertDescription>
        </Alert>
      )}
      
      {/* Statistiques (si disponibles) */}
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
                  <p className="text-xs text-muted-foreground">Retards</p>
                  <p className="text-xl font-bold text-orange-600">{stats.late}</p>
                </div>
                <Clock className="h-4 w-4 text-orange-500" />
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
        onSearch={(val) => setSearchTerm(val)}
        searchPlaceholder="Filtrer dans les résultats..."
        emptyStateMessage="Aucune présence trouvée. Utilisez la recherche par ID pour voir l'historique d'un utilisateur ou sélectionnez une date pour voir les retards."
        title={userSearchId ? "Rapport Utilisateur" : "Rapport des Retards / Incidents"}
        description={userSearchId ? `Historique pour ${userSearchId}` : `Incidents du ${new Date(selectedDate).toLocaleDateString('fr-FR')}`}
      />
      
      {/* DIALOGS */}
      
      {/* Dialog Pointage Manuel */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Pointage Manuel</DialogTitle>
            <DialogDescription>Enregistrer une présence manuellement pour un étudiant ou employé.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            {/* Choix du Type */}
            <div className="space-y-2">
              <Label>Type de personne</Label>
              <RadioGroup 
                defaultValue="student" 
                value={targetType} 
                onValueChange={(val: string) => {
                  setTargetType(val as 'student' | 'employee');
                  setSelectedPerson(null);
                  setPersonSearch('');
                  setManualForm({ ...manualForm, studentId: '' });
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="r-student" />
                  <Label htmlFor="r-student">Étudiant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employee" id="r-employee" />
                  <Label htmlFor="r-employee">Employé</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Recherche et Sélection */}
            <div className="space-y-2 relative">
              <Label>Rechercher {targetType === 'student' ? 'un étudiant' : 'un employé'}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={targetType === 'student' ? "Nom, prénom ou matricule..." : "Nom, prénom ou ID..."}
                  value={personSearch}
                  onChange={(e) => {
                    setPersonSearch(e.target.value);
                    if (selectedPerson) {
                      setSelectedPerson(null); // Réinitialiser si on modifie la recherche
                      setManualForm({ ...manualForm, studentId: '' });
                    }
                  }}
                  className="pl-8"
                />
                {selectedPerson && (
                   <div className="absolute right-2 top-2 text-green-600">
                     <Check className="h-5 w-5" />
                   </div>
                )}
              </div>
              
              {/* Liste des suggestions */}
              {!selectedPerson && personSearch && filteredPersons.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-950 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredPersons.map((person: any) => (
                    <div 
                      key={person.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col border-b last:border-0"
                      onClick={() => handleSelectPerson(person)}
                    >
                      <span className="font-medium">{person.firstName} {person.lastName}</span>
                      <span className="text-xs text-muted-foreground">
                        {targetType === 'student' 
                          ? `Mat: ${person.studentId || person.matricule}` 
                          : `ID: ${person.employeeId || 'N/A'}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!selectedPerson && personSearch && filteredPersons.length === 0 && (
                 <div className="absolute z-10 w-full mt-1 bg-white p-2 text-sm text-muted-foreground border rounded-md shadow-lg">
                   Aucun résultat trouvé
                 </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timestamp">Date et Heure *</Label>
              <Input 
                id="timestamp" 
                type="datetime-local"
                value={manualForm.timestamp}
                onChange={(e) => setManualForm({...manualForm, timestamp: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motif (Optionnel)</Label>
              <Input 
                id="reason" 
                value={manualForm.reason}
                onChange={(e) => setManualForm({...manualForm, reason: e.target.value})}
                placeholder="Ex: Oubli de badge"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>Annuler</Button>
            <Button onClick={handleManualSubmit} disabled={loadingAction === 'create' || !manualForm.studentId}>
              {loadingAction === 'create' ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Justification */}
      <Dialog open={showJustifyDialog} onOpenChange={setShowJustifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justifier Absence/Retard</DialogTitle>
            <DialogDescription>Ajouter une justification pour cet enregistrement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justifyReason">Motif de la justification *</Label>
              <Textarea 
                id="justifyReason" 
                value={justifyReason}
                onChange={(e) => setJustifyReason(e.target.value)}
                placeholder="Ex: Certificat médical fourni..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJustifyDialog(false)}>Annuler</Button>
            <Button onClick={handleJustifySubmit} disabled={loadingAction === 'justify' || !justifyReason.trim()}>
              {loadingAction === 'justify' ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Maintenance */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maintenance Admin</DialogTitle>
            <DialogDescription>Actions avancées pour la gestion des présences (Super Admin).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center"><AlertCircle className="h-4 w-4 mr-2"/> Attention</h4>
              <p className="text-sm text-yellow-700">Ces actions peuvent modifier massivement les données. Utilisez avec précaution.</p>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleMaintenanceAction('force')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Forcer la détection d'absences (Aujourd'hui)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleMaintenanceAction('cleanup')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Nettoyer les absences invalides
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleMaintenanceAction('reprocess')}>
                <Settings className="h-4 w-4 mr-2" />
                Re-traiter les absences pour le {new Date(selectedDate).toLocaleDateString()}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMaintenanceDialog(false)}>Fermer</Button>
          </DialogFooter>
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
                  <p className="text-sm text-muted-foreground">Élève / Employé</p>
                  <p className="font-medium">{selectedAttendance.studentName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID / Matricule</p>
                  <p className="font-medium">{selectedAttendance.studentMatricule || selectedAttendance.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classe</p>
                  <p className="font-medium">{selectedAttendance.classroomName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedAttendance.timestamp || selectedAttendance.date).toLocaleString('fr-FR')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">
                    {columns[3].render && columns[3].render(selectedAttendance.status, selectedAttendance)}
                  </div>
                </div>
                {(selectedAttendance.reason) && (
                  <div className="col-span-2 bg-slate-50 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Justification / Notes</p>
                    <p className="font-medium">{selectedAttendance.reason}</p>
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
