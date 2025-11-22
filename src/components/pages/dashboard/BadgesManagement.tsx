/**
 * =====================================================
 * PAGE DE GESTION DES BADGES
 * =====================================================
 * Cette page centralise toute la gestion des badges :
 * - Liste avec DataTable
 * - Impression de badges
 * - Actions CRUD
 * - Gestion d'état avec Zustand
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  X,
  Printer,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Search,
  Check
} from 'lucide-react';

import { Button } from '../../ui/button';
import { 
  DataTable, 
  Column, 
  RowAction 
} from '../../ui/data-table';
import { Badge as BadgeUI } from '../../ui/badge';
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
  DialogFooter,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { toast } from 'react-toastify';

// Import du store
import { useBadgeStore, Badge } from '../../../stores/badgesStore';
import { useRoomStore } from '../../../stores/roomStore';
import { useClassroomStore } from '../../../stores/classroomStore';
import { useStudentStore } from '../../../stores/studentStore';
import { useEmployeeStore } from '../../../stores/employeeStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES BADGES
// =====================================================
export const BadgesManagement: React.FC = () => {
  
  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // État création
  const [nfcId, setNfcId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [targetType, setTargetType] = useState<'student' | 'employee'>('student');
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Store
  const {
    badges,
    loading,
    error,
    loadingAction,
    pagination,
    stats,
    fetchBadges,
    createBadge,
    deleteBadge,
    printBadge,
    reportLost,
    reportDamaged,
    reactivateBadge,
    setFilters,
    setSortOptions,
    changePage,
    clearError
  } = useBadgeStore();

  const { fetchAll: fetchClassrooms } = useClassroomStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { allStudents, fetchStudents } = useStudentStore();
  const { allEmployees, fetchEmployees } = useEmployeeStore();
  
  // Chargement initial
  useEffect(() => {
    fetchBadges();
    fetchRooms();
    fetchClassrooms(1, 50);
    // Précharger pour l'assignation
    fetchStudents();
    fetchEmployees();
  }, [fetchBadges, fetchRooms, fetchClassrooms, fetchStudents, fetchEmployees]);

  // Filtrage des personnes pour la recherche (assignation)
  const filteredPersons = useMemo(() => {
    const searchLower = personSearch.toLowerCase();
    if (!searchLower && !selectedPerson) return []; 

    const source = (targetType === 'student' ? allStudents : allEmployees) as any[];
    
    return source.filter((p: any) => {
      const firstName = p.firstName || '';
      const lastName = p.lastName || '';
      const id = targetType === 'student' ? (p.studentId || p.matricule) : (p.employeeId || p.id);
      
      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        (id && id.toLowerCase().includes(searchLower))
      );
    }).slice(0, 10);
  }, [personSearch, targetType, allStudents, allEmployees, selectedPerson]);

  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    setPersonSearch(`${person.firstName} ${person.lastName}`);
  };

  const handleCreateSubmit = async () => {
    if (!nfcId.trim()) {
      toast.error("L'ID NFC est obligatoire");
      return;
    }

    try {
      const payload: Partial<Badge> = {
        nfcId: nfcId.trim(),
      };

      if (isAssigning) {
        if (!selectedPerson) {
          toast.error("Veuillez sélectionner une personne à assigner");
          return;
        }
        // studentId ou employeeId selon le type
        if (targetType === 'student') {
          payload.studentId = selectedPerson.id;
        } else {
          payload.employeeId = selectedPerson.id;
        }
      }

      await createBadge(payload);
      toast.success("Badge créé avec succès");
      setShowCreateDialog(false);
      // Reset form
      setNfcId('');
      setIsAssigning(false);
      setSelectedPerson(null);
      setPersonSearch('');
    } catch (error) {
      // Erreur gérée par le store
    }
  };

  // Configuration des colonnes
  const columns: Column<Badge>[] = [
    {
      key: 'badgeNumber',
      label: 'N° Badge',
      sortable: true,
      searchable: true,
      width: '120px',
      render: (badgeNumber: string) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="font-mono font-medium">{badgeNumber}</span>
        </div>
      )
    },
    {
      key: 'studentName',
      label: 'Élève',
      sortable: true,
      searchable: true,
      width: '200px',
      render: (studentName: string, badge: Badge) => (
        <div className="flex items-center gap-3">
          {badge.studentPhoto ? (
            <img src={badge.studentPhoto} alt={studentName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              {studentName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{studentName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{badge.studentMatricule}</p>
          </div>
        </div>
      )
    },
    {
      key: 'classroomName',
      label: 'Classe',
      sortable: true,
      width: '150px',
      render: (classroomName: string) => (
        <BadgeUI variant="outline" className="text-xs">{classroomName}</BadgeUI>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (status: Badge['status']) => {
        const configs = {
          active: { variant: 'default' as const, label: 'Actif', icon: CheckCircle, color: 'text-green-600' },
          inactive: { variant: 'secondary' as const, label: 'Inactif', icon: X, color: 'text-gray-600' },
          lost: { variant: 'destructive' as const, label: 'Perdu', icon: AlertTriangle, color: 'text-red-600' },
          damaged: { variant: 'outline' as const, label: 'Endommagé', icon: AlertCircle, color: 'text-orange-600' }
        };
        const config = configs[status];
        const Icon = config.icon;
        return (
          <BadgeUI variant={config.variant} className="text-xs flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {config.label}
          </BadgeUI>
        );
      }
    },
    {
      key: 'issueDate',
      label: 'Émission',
      sortable: true,
      width: '120px',
      render: (date: string) => (
        <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
      )
    },
    {
      key: 'lastUsed',
      label: 'Dernière utilisation',
      width: '150px',
      render: (lastUsed?: string) => (
        <span className="text-sm text-gray-600">
          {lastUsed ? new Date(lastUsed).toLocaleDateString('fr-FR') : '—'}
        </span>
      )
    }
  ];
  
  // Actions de ligne
  const rowActions: RowAction<Badge>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (badge) => { setSelectedBadge(badge); setShowViewDialog(true); }
    },
    {
      label: "Imprimer",
      icon: <Printer className="h-4 w-4" />,
      onClick: async (badge) => {
        try {
          await printBadge(badge.id);
          toast.success('Badge envoyé à l\'impression');
        } catch (error) {
          toast.error('Erreur lors de l\'impression');
        }
      }
    },
    {
      label: "Déclarer perdu",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: async (badge) => {
        try {
          await reportLost(badge.id);
          toast.success('Badge déclaré perdu');
        } catch (error) {
          toast.error('Erreur');
        }
      },
      variant: "destructive"
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (badge) => { setSelectedBadge(badge); setShowDeleteDialog(true); },
      variant: "destructive"
    }
  ];
  
  // Gestionnaires
  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;
    try {
      await deleteBadge(selectedBadge.id);
      setShowDeleteDialog(false);
      setSelectedBadge(null);
      toast.success('Badge supprimé avec succès');
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
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => setSortOptions({ field: sort.field as keyof Badge, order: sort.order });
  
  return (
    <div className="space-y-6">
      {/* EN-TÊTE AVEC ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Badges</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les badges des élèves</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info('Impression en masse en développement')} disabled={loading}>
            <Printer className="h-4 w-4 mr-2" />Imprimer tout
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />Nouveau Badge
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
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                  <p className="text-xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Perdus</p>
                  <p className="text-xl font-bold text-red-600">{stats.lost}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Endommagés</p>
                  <p className="text-xl font-bold text-orange-600">{stats.damaged}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Table des badges */}
      <DataTable
        data={badges}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={changePage}
        onSort={handleSort}
        onSearch={handleSearch}
        rooms={rooms}
        searchPlaceholder="Rechercher..."
        emptyStateMessage="Aucun badge trouvé"
        title="Liste des Badges"
        description={`${pagination.total} badges`}
      />
      
      {/* DIALOGS */}
      
      {/* Dialog Création Badge */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Nouveau Badge</DialogTitle>
            <DialogDescription>Enregistrer un nouveau badge NFC dans le système.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nfcId">ID NFC (Scanner le badge)</Label>
              <div className="relative">
                <Input 
                  id="nfcId" 
                  value={nfcId}
                  onChange={(e) => setNfcId(e.target.value)}
                  placeholder="En attente de scan..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Si on n'assigne pas, on peut soumettre direct
                      if (!isAssigning && nfcId) {
                        handleCreateSubmit();
                      }
                    }
                  }}
                  className="pl-10 font-mono text-lg tracking-wider"
                />
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground">
                Placez le badge sur le lecteur. L'ID s'affichera automatiquement.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="assign-mode" 
                checked={isAssigning}
                onCheckedChange={setIsAssigning}
              />
              <Label htmlFor="assign-mode">Assigner immédiatement à une personne ?</Label>
            </div>

            {isAssigning && (
              <div className="space-y-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1 mt-2">
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
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="rb-student" />
                      <Label htmlFor="rb-student">Étudiant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="employee" id="rb-employee" />
                      <Label htmlFor="rb-employee">Employé</Label>
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
                          setSelectedPerson(null); 
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateSubmit} disabled={loadingAction === 'create'}>
              {loadingAction === 'create' ? 'Création...' : 'Créer le badge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le badge</DialogTitle>
            <DialogDescription>Êtes-vous sûr ?</DialogDescription>
          </DialogHeader>
          {selectedBadge && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Badge :</strong> {selectedBadge.badgeNumber}</p>
                <p><strong>Élève :</strong> {selectedBadge.studentName}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedBadge(null); }} disabled={loadingAction === 'delete'}>Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteBadge} disabled={loadingAction === 'delete'}>
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
            <DialogTitle>Détails du badge</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                {selectedBadge.studentPhoto ? (
                  <img src={selectedBadge.studentPhoto} alt={selectedBadge.studentName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl shadow-md">
                    {selectedBadge.studentName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedBadge.studentName}</h3>
                  <p className="text-sm text-gray-600">{selectedBadge.studentMatricule}</p>
                  <p className="text-xs text-gray-500">{selectedBadge.classroomName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">N° Badge</p>
                  <p className="font-mono font-medium">{selectedBadge.badgeNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">
                    {columns[3].render && columns[3].render(selectedBadge.status, selectedBadge)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'émission</p>
                  <p className="font-medium">{new Date(selectedBadge.issueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                {selectedBadge.expiryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'expiration</p>
                    <p className="font-medium">{new Date(selectedBadge.expiryDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedBadge.lastUsed && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Dernière utilisation</p>
                    <p className="font-medium">{new Date(selectedBadge.lastUsed).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedBadge.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{selectedBadge.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                {selectedBadge.status !== 'active' && (
                  <Button variant="outline" onClick={async () => {
                    try {
                      await reactivateBadge(selectedBadge.id);
                      toast.success('Badge réactivé');
                      setShowViewDialog(false);
                    } catch (error) {
                      toast.error('Erreur');
                    }
                  }}>
                    <RotateCcw className="h-4 w-4 mr-2" />Réactiver
                  </Button>
                )}
                <Button onClick={() => { setShowViewDialog(false); setSelectedBadge(null); }}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
