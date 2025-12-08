/**
 * =====================================================
 * PAGE DE GESTION DES CONCOURS/TESTS
 * =====================================================
 * Cette page centralise toute la gestion des concours :
 * - Liste avec DataTable
 * - Formulaire d'ajout/édition
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
  Trophy,
  TrendingUp,
  Users,
  FileText,
  BookOpen
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
import { Test } from '../../../types/test';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';

// Import du store
import { useTestStore } from '../../../stores/testStore';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES CONCOURS
// =====================================================
export const TestManagement: React.FC = () => {

  // État local
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [showEditTestDialog, setShowEditTestDialog] = useState(false);
  const [showViewTestDialog, setShowViewTestDialog] = useState(false);
  const [showDeleteTestDialog, setShowDeleteTestDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<any>(null);

  // État du formulaire d'ajout
  const [formData, setFormData] = useState({
    postulant: '',
    grade: '',
    testType: 'Concours d\'entrée',
    testDate: new Date().toISOString().split('T')[0],
    notes: [
      { matiere: 'Mathématiques', note: 0 },
      { matiere: 'Français', note: 0 },
      { matiere: 'Sciences', note: 0 }
    ],
    remarks: ''
  });

  // État pour le combobox des postulants
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [postulantSearch, setPostulantSearch] = useState('');

  // État du formulaire d'ajout de matière
  const [testFormData, setTestFormData] = useState({
    nom: '',
    ponderation: '10',
    coefficient: 1,
    sur: '20',
    duree: '',
    type: 'Écrit'
  });

  // Liste des postulants (normalement récupérée depuis une API)
  const postulants = [
    'Jean Dupont',
    'Marie Martin',
    'Pierre Durand',
    'Sophie Leblanc',
    'Antoine Moreau',
    'Camille Bernard',
    'Lucas Petit',
    'Emma Roux',
    'Thomas Girard',
    'Léa Fournier'
  ];

  // Liste des épreuve/évaluations pour l'onglet Test
  const allMatieres = React.useMemo(() => [
    { id: 1, nom: 'Mathématiques', ponderation: '30%', coefficient: 3, sur: 20, duree: '2h', type: 'Écrit' },
    { id: 2, nom: 'Français', ponderation: '25%', coefficient: 2, sur: 20, duree: '1h30', type: 'Écrit' },
    { id: 3, nom: 'Sciences', ponderation: '25%', coefficient: 2, sur: 20, duree: '1h30', type: 'Écrit' },
    { id: 4, nom: 'Anglais', ponderation: '10%', coefficient: 1, sur: 10, duree: '1h', type: 'Oral' },
    { id: 5, nom: 'Histoire-Géographie', ponderation: '10%', coefficient: 1, sur: 100, duree: '1h', type: 'Écrit' }
  ], []);

  // États de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [matiereSearchTerm, setMatiereSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedMatiereSearchTerm = useDebounce(matiereSearchTerm, 300);

  // Filtrage des épreuve basé sur la recherche
  const matieres = React.useMemo(() => {
    if (!debouncedMatiereSearchTerm) {
      return allMatieres;
    }

    return allMatieres.filter(matiere =>
      matiere.nom.toLowerCase().includes(debouncedMatiereSearchTerm.toLowerCase()) ||
      matiere.type.toLowerCase().includes(debouncedMatiereSearchTerm.toLowerCase())
    );
  }, [debouncedMatiereSearchTerm, allMatieres]);

  // Store
  const {
    tests,
    loading,
    error,
    loadingAction,
    pagination,
    stats,
    fetchTests,
    deleteTest,
    createTest,
    setFilters,
    setSortOptions,
    changePage,
    clearError
  } = useTestStore();

  // Chargement initial
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Configuration des colonnes pour les résultats
  const resultColumns: Column<Test>[] = [
    {
      key: 'postulant',
      label: 'Postulant',
      sortable: true,
      searchable: true,
      width: '250px',
      render: (postulant: string, test: Test) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {postulant.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{postulant}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{test.grade || 'Non spécifiée'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'moyenne',
      label: 'Moyenne',
      sortable: true,
      width: '100px',
      render: (moyenne: number) => (
        <div className="text-center">
          <span className={`text-sm font-semibold ${moyenne >= 10 ? 'text-green-600' : 'text-red-600'}`}>
            {moyenne.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '100px',
      render: (status: 'admis' | 'echoue') => {
        const variant = status === 'admis' ? 'default' : 'destructive';
        const label = status === 'admis' ? 'Admis(e)' : 'Échoué(e)';
        return <Badge variant={variant} className="text-xs">{label}</Badge>;
      }
    },
    {
      key: 'testDate',
      label: 'Date',
      sortable: true,
      width: '120px',
      render: (date: string) => <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
    },
    {
      key: 'testType',
      label: 'Type',
      width: '150px',
      render: (testType: string | undefined) => (
        testType ? (
          <Badge variant="secondary" className="text-xs whitespace-nowrap">{testType}</Badge>
        ) : (
          <span className="text-xs text-gray-400">Non spécifié</span>
        )
      )
    }
  ];

  // Configuration des colonnes pour les épreuve
  const subjectColumns: Column<any>[] = [
    {
      key: 'nom',
      label: 'Épreuve',
      sortable: true,
      searchable: true,
      width: '200px',
      render: (nom: string) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
            {nom.charAt(0)}
          </div>
          <span className="font-medium">{nom}</span>
        </div>
      )
    },
    {
      key: 'ponderation',
      label: 'Pondération',
      sortable: true,
      width: '120px',
      render: (ponderation: string) => (
        <Badge variant="secondary" className="text-xs">
          {ponderation}
        </Badge>
      )
    },
    {
      key: 'coefficient',
      label: 'Coefficient',
      sortable: true,
      width: '100px',
      render: (coefficient: number) => (
        <Badge variant="outline" className="text-xs">
          Coef. {coefficient}
        </Badge>
      )
    },
    {
      key: 'sur',
      label: 'Sur',
      sortable: true,
      width: '80px',
      render: (sur: number) => (
        <div className="text-center">
          <span className="text-sm font-semibold text-blue-600">/{sur}</span>
        </div>
      )
    },
    {
      key: 'duree',
      label: 'Durée',
      width: '100px',
      render: (duree: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{duree}</span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '100px',
      render: (type: string) => (
        <Badge variant={type === 'Écrit' ? 'default' : 'secondary'} className="text-xs">
          {type}
        </Badge>
      )
    }
  ];

  // Actions de ligne pour les résultats
  const resultRowActions: RowAction<Test>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (test) => { setSelectedTest(test); setShowViewDialog(true); }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (test) => { setSelectedTest(test); setShowDeleteDialog(true); },
      variant: "destructive"
    }
  ];

  // Actions de ligne pour les épreuve
  const subjectRowActions: RowAction<any>[] = [
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (matiere) => {
        setSelectedMatiere(matiere);
        setTestFormData({
          nom: matiere.nom,
          ponderation: matiere.ponderation.replace('%', ''),
          coefficient: matiere.coefficient,
          sur: matiere.sur.toString(),
          duree: matiere.duree,
          type: matiere.type
        });
        setShowEditTestDialog(true);
      }
    },
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (matiere) => {
        setSelectedMatiere(matiere);
        setShowViewTestDialog(true);
      }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (matiere) => {
        setSelectedMatiere(matiere);
        setShowDeleteTestDialog(true);
      },
      variant: "destructive"
    }
  ];

  // Gestionnaires
  const handleDeleteTest = async () => {
    if (!selectedTest) return;
    try {
      await deleteTest(selectedTest.id);
      setShowDeleteDialog(false);
      setSelectedTest(null);
      toast.success('Épreuve supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);

  const handleSearch = (searchValue: string) => setSearchTerm(searchValue);
  const handleMatiereSearch = (searchValue: string) => setMatiereSearchTerm(searchValue);
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => setSortOptions({ field: sort.field as keyof Test, order: sort.order });

  // Gestionnaires du formulaire d'ajout
  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculer la moyenne
      const totalNotes = formData.notes.reduce((sum, item) => sum + item.note, 0);
      const moyenne = totalNotes / formData.notes.length;

      await createTest({
        ...formData,
        moyenne,
        notes: formData.notes
      });

      // Réinitialiser le formulaire et fermer le dialog
      setFormData({
        postulant: '',
        grade: '',
        testType: 'Concours d\'entrée',
        testDate: new Date().toISOString().split('T')[0],
        notes: [
          { matiere: 'Mathématiques', note: 0 },
          { matiere: 'Français', note: 0 },
          { matiere: 'Sciences', note: 0 }
        ],
        remarks: ''
      });
      setPostulantSearch('');
      setShowSuggestions(false);
      setShowAddDialog(false);
      toast.success('Résultat ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du résultat');
    }
  };

  const handleNoteChange = (index: number, value: number) => {
    const newNotes = [...formData.notes];
    newNotes[index].note = value;
    setFormData({ ...formData, notes: newNotes });
  };

  // Gestionnaires pour le combobox des postulants
  const filteredPostulants = postulants.filter(postulant =>
    postulant.toLowerCase().includes(postulantSearch.toLowerCase())
  );

  const handlePostulantSelect = (postulant: string) => {
    setFormData({ ...formData, postulant });
    setPostulantSearch(postulant);
    setShowSuggestions(false);
  };

  const handlePostulantInputChange = (value: string) => {
    setPostulantSearch(value);
    setFormData({ ...formData, postulant: value });
    setShowSuggestions(true);
  };

  // Gestionnaire pour l'ajout de matière
  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Ajout d\'épreuve:', testFormData);

      // TODO: Ajouter la logique pour sauvegarder l'épreuve
      // Ici on pourrait appeler une API ou mettre à jour un store

      // Réinitialiser le formulaire et fermer le dialog
      setTestFormData({
        nom: '',
        ponderation: '10',
        coefficient: 1,
        sur: '20',
        duree: '',
        type: 'Écrit'
      });
      setShowAddTestDialog(false);
      toast.success('Épreuve ajoutée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'épreuve');
    }
  };

  // Gestionnaire pour la modification de matière
  const handleEditTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Modification d\'épreuve:', { ...selectedMatiere, ...testFormData });

      // TODO: Ajouter la logique pour modifier l'épreuve

      setShowEditTestDialog(false);
      setSelectedMatiere(null);
      toast.success('Épreuve modifiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'épreuve');
    }
  };

  // Gestionnaire pour la suppression d'épreuve
  const handleDeleteMatiere = async () => {
    if (!selectedMatiere) return;
    try {
      console.log('Suppression d\'épreuve:', selectedMatiere);

      // TODO: Ajouter la logique pour supprimer l'épreuve

      setShowDeleteTestDialog(false);
      setSelectedMatiere(null);
      toast.success('Épreuve supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'épreuve');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Concours</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les résultats des concours d'entrée</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}<Button variant="link" size="sm" onClick={clearError} className="ml-2 h-auto p-0">Fermer</Button></AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <Tabs defaultValue="resultats" className="w-full">
          <TabsList className="w-fit h-auto p-0 bg-transparent rounded-none justify-start">
            <TabsTrigger
              value="resultats"
              className="px-4 py-3 rounded-none rounded-tl-lg border-r border-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-600 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="px-4 py-3 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-600 flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Épreuve
            </TabsTrigger>
          </TabsList>

          <CardContent className="p-6 border-t border-gray-200">
            <TabsContent value="resultats" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Liste des résultats</h3>
                  <p className="text-sm text-gray-500">{pagination.total} résultats enregistrés</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} disabled={loading} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter résultat
                </Button>
              </div>

              {/* Statistiques des résultats */}
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
                          <p className="text-xs text-muted-foreground">Admis</p>
                          <p className="text-xl font-bold text-green-600">{stats.admis}</p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Taux de réussite</p>
                          <p className="text-xl font-bold text-orange-600">{stats.tauxReussite}%</p>
                        </div>
                        <Trophy className="h-4 w-4 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Moyenne générale</p>
                          <p className="text-xl font-bold text-purple-600">{stats.moyenneGenerale}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DataTable
                data={tests}
                columns={resultColumns}
                loading={loading}
                rowActions={resultRowActions}
                pagination={pagination}
                onPageChange={changePage}
                onSort={handleSort}
                onSearch={handleSearch}
                searchPlaceholder="Rechercher un postulant..."
                emptyStateMessage="Aucun résultat trouvé"
                title=""
                description=""
              />
            </TabsContent>

            <TabsContent value="test" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Liste des épreuve</h3>
                  <p className="text-sm text-gray-500">{matieres.length} épreuve configurées</p>
                </div>
                <Button onClick={() => setShowAddTestDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Épreuve
                </Button>
              </div>

              {/* Statistiques des épreuve */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-blue-600">{matieres.length}</p>
                      </div>
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Épreuves écrites</p>
                        <p className="text-xl font-bold text-green-600">{matieres.filter(m => m.type === 'Écrit').length}</p>
                      </div>
                      <Edit className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Coefficient moyen</p>
                        <p className="text-xl font-bold text-orange-600">
                          {(matieres.reduce((sum, m) => sum + m.coefficient, 0) / matieres.length).toFixed(1)}
                        </p>
                      </div>
                      <Trophy className="h-4 w-4 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Durée totale</p>
                        <p className="text-xl font-bold text-purple-600">
                          {matieres.reduce((total, m) => {
                            const duree = m.duree.replace('h', '').replace('30', '.5');
                            return total + parseFloat(duree) || 0;
                          }, 0).toFixed(1)}h
                        </p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DataTable
                data={matieres}
                columns={subjectColumns}
                loading={false}
                rowActions={subjectRowActions}
                pagination={{ page: 1, limit: 10, total: matieres.length, totalPages: Math.ceil(matieres.length / 10) }}
                onPageChange={() => { }}
                onSort={() => { }}
                onSearch={handleMatiereSearch}
                searchPlaceholder="Rechercher une matière..."
                emptyStateMessage="Aucune matière trouvée"
                title=""
                description=""
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'épreuve</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette épreuve ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Postulant :</strong> {selectedTest.postulant}</p>
                <p><strong>Moyenne :</strong> {selectedTest.moyenne.toFixed(2)}</p>
                <p><strong>Statut :</strong> {selectedTest.status === 'admis' ? 'Admis(e)' : 'Échoué(e)'}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedTest(null); }} disabled={loadingAction === 'delete'}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteTest} disabled={loadingAction === 'delete'}>
                  {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Détails de l'épreuve</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-4">Informations du postulant</h3>
                      <div className="space-y-2">
                        <p><strong>Nom complet :</strong> {selectedTest.postulant}</p>
                        <p><strong>Classe visée :</strong> {selectedTest.grade || 'Non spécifiée'}</p>
                        <p><strong>Type de concours :</strong> {selectedTest.testType || 'Concours d\'entrée'}</p>
                      </div>
                    </div>

                    {selectedTest.remarks && (
                      <>
                        <div className="w-px bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-4">Remarques</h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {selectedTest.remarks}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedTest.notes && selectedTest.notes.length > 0 && (
                <div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold border-r border-gray-200 dark:border-gray-700">épreuve</TableHead>
                          <TableHead className="font-semibold text-center">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTest.notes.map((noteItem, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium border-r border-gray-200 dark:border-gray-700">{noteItem.matiere}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${noteItem.note >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                {noteItem.note}/20
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout de résultat */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Ajouter un résultat de concours</DialogTitle>
            <DialogDescription>Saisissez les informations du postulant et ses notes</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitResult} className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postulant">Nom complet du postulant</Label>
                <div className="relative">
                  <Input
                    id="postulant"
                    value={postulantSearch}
                    onChange={(e) => handlePostulantInputChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Tapez pour rechercher un postulant..."
                    required
                  />
                  {showSuggestions && filteredPostulants.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredPostulants.map((postulant, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          onClick={() => handlePostulantSelect(postulant)}
                        >
                          {postulant}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Classe visée</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSI">NSI</SelectItem>
                    <SelectItem value="NSII">NSII</SelectItem>
                    <SelectItem value="NSIII">NSIII</SelectItem>
                    <SelectItem value="NSIV">NSIV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testType">Type de concours</Label>
                <Input
                  id="testType"
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  placeholder="Ex: Concours d'entrée"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testDate">Date de l'épreuve</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notes par matière</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold border-r border-gray-200 dark:border-gray-700">épreuve</TableHead>
                      <TableHead className="font-semibold text-center">Notes (/20)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.notes.map((noteItem, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium border-r border-gray-200 dark:border-gray-700">
                          {noteItem.matiere}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={noteItem.note}
                            onChange={(e) => handleNoteChange(index, parseFloat(e.target.value) || 0)}
                            className="w-20 mx-auto text-center"
                            required
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarques (optionnel)</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Commentaires sur le candidat..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loadingAction === 'create'}>
                {loadingAction === 'create' ? 'Ajout en cours...' : 'Ajouter le résultat'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout des épreuves/test */}
      <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle épreuve</DialogTitle>
            <DialogDescription>Configurez les paramètres de la nouvelle épreuve</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de l'épreuve</Label>
                <Input
                  id="nom"
                  value={testFormData.nom}
                  onChange={(e) => setTestFormData({ ...testFormData, nom: e.target.value })}
                  placeholder="Ex: Mathématiques"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ponderation">Pondération (%)</Label>
                <Select value={testFormData.ponderation} onValueChange={(value) => setTestFormData({ ...testFormData, ponderation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la pondération" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="35">35%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coefficient">Coefficient</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="1"
                  max="10"
                  value={testFormData.coefficient}
                  onChange={(e) => setTestFormData({ ...testFormData, coefficient: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sur">Note sur</Label>
                <Input
                  id="sur"
                  type="number"
                  min="1"
                  value={testFormData.sur}
                  onChange={(e) => setTestFormData({ ...testFormData, sur: e.target.value })}
                  placeholder="Ex: 20, 10, 100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duree">Durée</Label>
                <Input
                  id="duree"
                  value={testFormData.duree}
                  onChange={(e) => setTestFormData({ ...testFormData, duree: e.target.value })}
                  placeholder="Ex: 2h, 1h30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'épreuve</Label>
                <Select value={testFormData.type} onValueChange={(value) => setTestFormData({ ...testFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Écrit">Écrit</SelectItem>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="Pratique">Pratique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddTestDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Ajouter l'épreuve
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de matière */}
      <Dialog open={showEditTestDialog} onOpenChange={setShowEditTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'épreuve</DialogTitle>
            <DialogDescription>Modifiez les paramètres de l'épreuve</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom de l'épreuve</Label>
                <Input
                  id="edit-nom"
                  value={testFormData.nom}
                  onChange={(e) => setTestFormData({ ...testFormData, nom: e.target.value })}
                  placeholder="Ex: Mathématiques"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ponderation">Pondération (%)</Label>
                <Select value={testFormData.ponderation} onValueChange={(value) => setTestFormData({ ...testFormData, ponderation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la pondération" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="35">35%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-coefficient">Coefficient</Label>
                <Input
                  id="edit-coefficient"
                  type="number"
                  min="1"
                  max="10"
                  value={testFormData.coefficient}
                  onChange={(e) => setTestFormData({ ...testFormData, coefficient: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sur">Note sur</Label>
                <Input
                  id="edit-sur"
                  type="number"
                  min="1"
                  value={testFormData.sur}
                  onChange={(e) => setTestFormData({ ...testFormData, sur: e.target.value })}
                  placeholder="Ex: 20, 10, 100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duree">Durée</Label>
                <Input
                  id="edit-duree"
                  value={testFormData.duree}
                  onChange={(e) => setTestFormData({ ...testFormData, duree: e.target.value })}
                  placeholder="Ex: 2h, 1h30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Type d'épreuve</Label>
                <Select value={testFormData.type} onValueChange={(value) => setTestFormData({ ...testFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Écrit">Écrit</SelectItem>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="Pratique">Pratique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditTestDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Modifier l'épreuve
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation de l'épreuve */}
      <Dialog open={showViewTestDialog} onOpenChange={setShowViewTestDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {selectedMatiere?.nom?.charAt(0)}
              </div>
              {selectedMatiere?.nom}
            </DialogTitle>
          </DialogHeader>
          {selectedMatiere && (
            <div className="space-y-6">
              {/* En-tête avec badges */}
              <div className="flex flex-wrap gap-3">
                <Badge variant={selectedMatiere.type === 'Écrit' ? 'default' : 'secondary'} className="px-3 py-1">
                  {selectedMatiere.type}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Durée: {selectedMatiere.duree}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedMatiere.ponderation}
                </Badge>
              </div>

              {/* Grille d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pondération */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pondération</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedMatiere.ponderation}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coefficient */}
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Coefficient</p>
                        <p className="text-2xl font-bold text-green-600">{selectedMatiere.coefficient}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Note sur */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Note sur</p>
                        <p className="text-2xl font-bold text-orange-600">/{selectedMatiere.sur}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informations détaillées */}
              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Informations détaillées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Épreuve</span>
                        <span className="font-medium">{selectedMatiere.nom}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Type d'épreuve</span>
                        <span className="font-medium">{selectedMatiere.type}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Durée</span>
                        <span className="font-medium">{selectedMatiere.duree}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Barème</span>
                        <span className="font-medium">Sur {selectedMatiere.sur} points</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowViewTestDialog(false)} className="px-6">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression de matière */}
      <Dialog open={showDeleteTestDialog} onOpenChange={setShowDeleteTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'épreuve</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer cette épreuve ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          {selectedMatiere && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Épreuve :</strong> {selectedMatiere.nom}</p>
                <p><strong>Type :</strong> {selectedMatiere.type}</p>
                <p><strong>Pondération :</strong> {selectedMatiere.ponderation}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteTestDialog(false); setSelectedMatiere(null); }}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteMatiere}>
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};