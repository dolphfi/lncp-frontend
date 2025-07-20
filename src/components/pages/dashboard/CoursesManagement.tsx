/**
 * =====================================================
 * PAGE DE GESTION DES COURS
 * =====================================================
 * Interface complète pour la gestion des cours avec
 * tableau, filtres, statistiques et actions CRUD
 * Adapté pour une école classique
 */

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileDown, 
  FileSpreadsheet, 
  FileText,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Weight,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Target,
  Package
} from 'lucide-react';

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
import { CourseForm } from '../../forms/CourseForm';
import { useCourseStore } from '../../../stores/courseStore';
import { Course, CreateCourseDto } from '../../../types/course';

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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
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
    setFilters,
    setSortOptions,
    changePage,
    fetchStats
  } = useCourseStore();
  
  // =====================================================
  // CHARGEMENT INITIAL DES DONNÉES
  // =====================================================
  useEffect(() => {
    // Charger les cours et les statistiques au montage du composant
    fetchCourses();
    fetchStats();
  }, [fetchCourses, fetchStats]);
  
  // =====================================================
  // CONFIGURATION DES COLONNES DE LA TABLE
  // =====================================================
  const columns: Column<Course>[] = [
    {
      key: 'code',
      label: 'Cours',
      sortable: true,
      searchable: true,
      width: '250px',
      render: (code: string, course: Course) => {
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
                {course.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {code} • {course.category}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'weight',
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
      key: 'grade',
      label: 'Classe',
      sortable: true,
      width: '100px',
      render: (grade: string) => {
        return (
          <Badge variant="outline" className="text-xs">
            {grade}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (status: string) => {
        const statusConfig = {
          actif: { label: 'Actif', variant: 'default' as const },
          inactif: { label: 'Inactif', variant: 'secondary' as const },
          en_attente: { label: 'En attente', variant: 'outline' as const }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return <Badge variant="outline">{status}</Badge>;
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
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
              onClick={() => handleDeleteCourseClick(course)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // =====================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // =====================================================
  
  const handleCreateCourse = async (data: CreateCourseDto) => {
    try {
      await createCourse(data);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
    }
  };

  const handleUpdateCourse = async (data: CreateCourseDto, courseId?: string) => {
    if (!courseId) return;
    
    try {
      await updateCourse({ id: courseId, ...data });
      setShowEditDialog(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await deleteCourse(selectedCourse.id);
      setShowDeleteDialog(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditDialog(true);
  };

  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ search: searchTerm });
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
        course.title,
        course.category,
        course.weight,
        course.grade,
        course.status
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
                <p className="text-sm font-medium text-gray-600">Pondération Moy.</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageWeight.toFixed(1)}</p>
              </div>
              <Weight className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pondération</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalWeight}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-orange-500" />
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
                  value={filters.search || ''}
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
                  category: value as 'mathématiques' | 'sciences' | 'langues' | 'histoire' | 'géographie' | 'arts' | 'sport' | 'informatique' | undefined 
                })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="mathématiques">Mathématiques</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="langues">Langues</SelectItem>
                  <SelectItem value="histoire">Histoire</SelectItem>
                  <SelectItem value="géographie">Géographie</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="sport">Sport</SelectItem>
                  <SelectItem value="informatique">Informatique</SelectItem>
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
          <CourseForm
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
            <CourseForm
              course={selectedCourse}
              onSubmit={handleUpdateCourse}
              onCancel={() => setShowEditDialog(false)}
              loading={loadingAction === 'update'}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le cours "{selectedCourse?.title}" ? 
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteCourse}
              disabled={loadingAction === 'delete'}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
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
                      {selectedCourse.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCourse.code} • {selectedCourse.category}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={selectedCourse.status === 'actif' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {selectedCourse.status === 'actif' ? 'Actif' : 
                       selectedCourse.status === 'inactif' ? 'Inactif' : 'En attente'}
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
                        <span className="text-sm text-gray-500 dark:text-gray-400">Code</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedCourse.code}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Classe</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCourse.grade}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Catégorie</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCourse.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pondération</span>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-gray-400" />
                          <Badge className={`text-xs ${
                            selectedCourse.weight === 100 ? 'bg-gray-100 text-gray-800' :
                            selectedCourse.weight === 200 ? 'bg-blue-100 text-blue-800' :
                            selectedCourse.weight === 300 ? 'bg-yellow-100 text-yellow-800' :
                            selectedCourse.weight === 400 ? 'bg-orange-100 text-orange-800' :
                            selectedCourse.weight === 500 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCourse.weight}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Planning */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Planning
                    </h4>
                    <div className="space-y-2">
                      {selectedCourse.schedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.day}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  {/* Description */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Objectifs */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-600" />
                      Objectifs d'apprentissage
                    </h4>
                    <div className="space-y-2">
                      {selectedCourse.objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {objective}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matériels */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-600" />
                      Matériels nécessaires
                    </h4>
                    <div className="space-y-2">
                      {selectedCourse.materials.map((material, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {material}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Programme détaillé */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-600" />
                  Programme détaillé
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedCourse.syllabus}
                </p>
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
    </div>
  );
}; 