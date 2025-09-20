/**
 * =====================================================
 * PAGE DE GESTION DES COURS
 * =====================================================
 * Interface complète pour la gestion des cours avec
 * tableau, filtres, statistiques et actions CRUD
 * Adapté pour une école classique
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Target,
  BookOpen,
  Users,
  Clock,
  GraduationCap,
  Weight,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  FileDown
} from 'lucide-react';

import { useDebounce } from '../../../hooks/useDebounce';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../../ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { 
  Alert, 
  AlertDescription 
} from '../../ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';

import { DataTable, Column } from '../../ui/data-table';
import { CourseFormSimple } from '../../forms/CourseFormSimple';
import { CourseAvailabilityForm } from '../../forms/CourseAvailabilityForm';
import type { CreateCourseApiFormData } from '../../../schemas/courseSchema';
import { useCourseStore } from '../../../stores/courseStore';
import { Course, CreateCourseDto } from '../../../types/course';
import { toast } from 'react-toastify';

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const CoursesManagement: React.FC = () => {
  // =====================================================
  // ÉTAT LOCAL DU COMPOSANT
  // =====================================================
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // État local pour la recherche avec debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // =====================================================
  // RÉCUPÉRATION DE L'ÉTAT DEPUIS LE STORE ZUSTAND
  // =====================================================
  const {
    // Données
    courses,
    loading,
    error,
    loadingAction,
    pagination,
    filters,
    stats,
    
    // Actions
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    setAvailability,
    setFilters,
    setSortOptions,
    changePage,
    fetchStats
  } = useCourseStore();
  

  // =====================================================
  // CHARGEMENT INITIAL DES DONNÉES
  // =====================================================
  useEffect(() => {
    // Chargement initial des données
    fetchCourses();
  }, [fetchCourses]);
  
  // Synchronisation de la recherche avec debounce
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);

  // =====================================================
  // CONFIGURATION DES COLONNES DE LA TABLE
  // =====================================================
  const columns: Column<Course>[] = [
    {
      key: 'titre',
      label: 'Cours',
      sortable: true,
      searchable: true,
      width: '250px',
      render: (titre: string, course: Course) => {
        return (
          <div className="flex items-center space-x-3">
            {/* Icône du cours */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            
            {/* Informations du cours */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {course.titre}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {course.code} • {course.categorie}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'classroom',
      label: 'Classe',
      sortable: true,
      width: '180px',
      render: (classroom: any, course: Course) => {
        if (!classroom) {
          return (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500">Aucune classe</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              {classroom.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {classroom.name}
              </p>
              {classroom.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {classroom.description}
                </p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'ponderation',
      label: 'Pondération',
      sortable: true,
      width: '120px',
      render: (weight: number) => {
        const weightColors = {
          100: 'bg-gray-100 text-gray-800',
          200: 'bg-blue-100 text-blue-800',
          300: 'bg-yellow-100 text-yellow-800',
          400: 'bg-orange-100 text-orange-800',
          500: 'bg-red-100 text-red-800'
        };
        
        return (
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-gray-400" />
            <Badge className={`text-xs ${weightColors[weight as keyof typeof weightColors] || 'bg-gray-100 text-gray-800'}`}>
              {weight}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (isActive: boolean) => {
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        );
      }
    },
    {
      key: 'id',
      label: 'Actions',
      width: '120px',
      render: (_, course: Course) => {
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewCourse(course)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditCourse(course)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAvailabilityCourse(course)}
              className="text-purple-500 hover:text-purple-700"
              title="Gérer la disponibilité"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // =====================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // =====================================================
  // Gestionnaire pour créer un cours
  const handleCreateCourse = async (data: CreateCourseApiFormData) => {
    try {
      await createCourse(data);
      setShowAddDialog(false);
      toast.success('Cours créé avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur création cours:', error);
      toast.error('Erreur lors de la création du cours', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Gestionnaire pour modifier un cours
  const handleUpdateCourse = async (data: CreateCourseApiFormData) => {
    if (!selectedCourse) return;
    
    try {
      await updateCourse({ ...data, id: selectedCourse.id });
      setShowEditDialog(false);
      setSelectedCourse(null);
      toast.success('Cours modifié avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur modification cours:', error);
      toast.error('Erreur lors de la modification du cours', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Gestionnaire pour la disponibilité
  const handleSetAvailability = async (data: {
    courseId: string;
    roomId: string;
    trimestre: string;
    statut: string;
  }) => {
    try {
      await setAvailability(data);
      setShowAvailabilityDialog(false);
      setSelectedCourse(null);
      toast.success('Disponibilité mise à jour avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur disponibilité cours:', error);
      toast.error('Erreur lors de la mise à jour de la disponibilité', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await deleteCourse(selectedCourse.id);
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      toast.success('Cours supprimé avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      toast.error('Erreur lors de la suppression du cours', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Gestionnaires pour les actions du tableau
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditDialog(true);
  };

  const handleAvailabilityCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowAvailabilityDialog(true);
  };

  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };


  // Gestion de la recherche (mise à jour immédiate de l'état local)
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  const handleCourseFilter = (filterUpdates: Partial<typeof filters>) => {
    // Convertir les valeurs "all" en undefined pour désactiver le filtre
    const processedUpdates = Object.entries(filterUpdates).reduce((acc, [key, value]) => {
      if (value === 'all') {
        acc[key as keyof typeof filters] = undefined;
      } else {
        acc[key as keyof typeof filters] = value as any;
      }
      return acc;
    }, {} as Partial<typeof filters>);
    
    setFilters(processedUpdates);
  };

  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => {
    setSortOptions({ field: sort.field as keyof Course, order: sort.order });
  };

  // =====================================================
  // FONCTIONS D'EXPORT
  // =====================================================
  
  const exportToCSV = () => {
    const headers = ['Code', 'Titre', 'Catégorie', 'Pondération', 'Classe', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...courses.map(course => [
        course.code,
        course.titre,
        course.categorie,
        course.ponderation,
        course.classroom?.name || 'Aucune classe',
        course.isActive ? 'Actif' : 'Inactif'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cours.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Implémentation de l'export PDF
    console.log('Export PDF des cours');
  };

  // =====================================================
  // RENDU DES STATISTIQUES
  // =====================================================
  
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Catégories</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byCategory || {}).length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes Assignées</p>
                <p className="text-2xl font-bold text-orange-600">{Object.keys(stats.byGrade || {}).length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

      </div>
    );
  };

  // =====================================================
  // RENDU DES FILTRES
  // =====================================================
  
  const renderFilters = () => {
    return (
      <Card className="shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par code, titre, description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleCourseFilter({ 
                  category: value === 'all' ? undefined : value as any
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Mathematiques">Mathématiques</SelectItem>
                  <SelectItem value="Sciences">Sciences</SelectItem>
                  <SelectItem value="Physique">Physique</SelectItem>
                  <SelectItem value="Chimie">Chimie</SelectItem>
                  <SelectItem value="Biologie">Biologie</SelectItem>
                  <SelectItem value="Francais">Français</SelectItem>
                  <SelectItem value="Anglais">Anglais</SelectItem>
                  <SelectItem value="Histoire">Histoire</SelectItem>
                  <SelectItem value="Geographie">Géographie</SelectItem>
                  <SelectItem value="Philosophie">Philosophie</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Informatique">Informatique</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleCourseFilter({ 
                  status: value as 'actif' | 'inactif' | 'en_attente' | undefined 
                })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // =====================================================
  // RENDU DES ERREURS
  // =====================================================
  
  const renderError = () => {
    if (!error) return null;

    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error.message}
        </AlertDescription>
      </Alert>
    );
  };

  // =====================================================
  // RENDU PRINCIPAL
  // =====================================================
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Cours
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les cours et les programmes de l'école
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Cours
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Exporter les données</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistiques */}
      {renderStats()}

      {/* Filtres */}
      {renderFilters()}

      {/* Erreurs */}
      {renderError()}

      {/* Table des cours */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <DataTable
            data={courses}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={changePage}
            onSort={handleSort}
            searchable
            onSearch={handleSearch}
            searchPlaceholder="Rechercher des cours..."
          />
        </CardContent>
      </Card>

      {/* =====================================================
          DIALOGUES
      ===================================================== */}
      
      {/* Dialogue d'ajout */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Cours</DialogTitle>
            <DialogDescription>
              Créez un nouveau cours en remplissant les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <CourseFormSimple
            onSubmit={handleCreateCourse}
            onCancel={() => setShowAddDialog(false)}
            loading={loadingAction === 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Cours</DialogTitle>
            <DialogDescription>
              Modifiez les informations du cours sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <CourseFormSimple
              course={selectedCourse || undefined}
              onSubmit={handleUpdateCourse}
              onCancel={() => setShowEditDialog(false)}
              loading={loadingAction === 'update'}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de visualisation */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Détails du Cours
            </DialogTitle>
            <DialogDescription>
              Informations détaillées sur le cours sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              {/* En-tête du cours */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedCourse.titre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCourse.id} • {selectedCourse.categorie}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={selectedCourse.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {selectedCourse.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne gauche */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      Informations Générales
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">ID</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedCourse.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Code</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCourse.code}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Classe</span>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {selectedCourse.classroom?.name || 'Aucune classe'}
                          </Badge>
                          {selectedCourse.classroom?.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {selectedCourse.classroom.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Catégorie</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCourse.categorie}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pondération</span>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-gray-400" />
                          <Badge className={`text-xs ${
                            selectedCourse.ponderation === 100 ? 'bg-gray-100 text-gray-800' :
                            selectedCourse.ponderation === 200 ? 'bg-blue-100 text-blue-800' :
                            selectedCourse.ponderation === 300 ? 'bg-yellow-100 text-yellow-800' :
                            selectedCourse.ponderation === 400 ? 'bg-orange-100 text-orange-800' :
                            selectedCourse.ponderation === 500 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCourse.ponderation}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  {/* Description */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <FileText className="h-4 w-4 text-purple-600" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-600" />
                      Informations
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Créé le</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedCourse.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Modifié le</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedCourse.updatedAt ? new Date(selectedCourse.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditCourse(selectedCourse);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion de disponibilité */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion de Disponibilité</DialogTitle>
            <DialogDescription>
              Définir la disponibilité du cours par trimestre et salle
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <CourseAvailabilityForm
              course={selectedCourse}
              onSubmit={handleSetAvailability}
              onCancel={() => {
                setShowAvailabilityDialog(false);
                setSelectedCourse(null);
              }}
              loading={loadingAction === 'update'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 