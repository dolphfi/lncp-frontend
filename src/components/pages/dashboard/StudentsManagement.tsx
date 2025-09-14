/**
 * =====================================================
 * PAGE DE GESTION DES ÉLÈVES
 * =====================================================
 * Cette page centralise toute la gestion des élèves :
 * - Liste avec DataTable
 * - Formulaire d'ajout/édition
 * - Actions CRUD
 * - Gestion d'état avec Zustand
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet,
  FileDown,
  Users
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
  DialogTitle,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { toast } from 'react-toastify';

// Import des types
import { Student, StudentFilters, StudentStats } from '../../../types/student';

// Import des stores
import { useStudentStore } from '../../../stores/studentStore';
import { useRoomStore } from '../../../stores/roomStore';
import { useClassroomStore } from '../../../stores/classroomStore';

// Import des composants de formulaire
import { StudentForm } from '../../forms/StudentForm';
import AddStudentModal from '../../forms/AddStudentModal';

// Import du hook de debouncing
import { useDebounce } from '../../../hooks/useDebounce';
import { CreateStudentFormData } from '../../../schemas/studentSchema';
import { API_CONFIG } from '../../../config/api';
import { AddStudentApiPayload } from '../../../services/students/studentsService';

// =====================================================
// COMPOSANT PRINCIPAL DE GESTION DES ÉLÈVES
// =====================================================
export const StudentsManagement: React.FC = () => {
  
  // =====================================================
  // ÉTAT LOCAL DU COMPOSANT
  // =====================================================
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // =====================================================
  // RÉCUPÉRATION DE L'ÉTAT DEPUIS LE STORE ZUSTAND
  // =====================================================
  const {
    // Données
    students,
    loading,
    error,
    loadingAction,
    pagination,
    filters,
    stats,
    
    // Actions
    fetchStudents,
    createStudent, // mock path (conservé)
    createStudentApi,
    updateStudent,
    deleteStudent,
    setFilters,
    setSortOptions,
    changePage,
    clearError,
    fetchStats,
    getStudentsByClassroom,
    getStudentsByRoom
  } = useStudentStore();

  // Classes (niveaux) pour récupérer classroomId depuis le grade
  const { items: classrooms, fetchAll: fetchClassrooms } = useClassroomStore();

  // Récupération des salles pour les filtres
  const { rooms, fetchRooms } = useRoomStore();
  
  // =====================================================
  // CHARGEMENT INITIAL DES DONNÉES
  // =====================================================
  useEffect(() => {
    // Charger les élèves (les stats seront calculées automatiquement après)
    fetchStudents();
    fetchRooms();
    // Charger les classes pour mapping grade -> classroomId
    fetchClassrooms(1, 50);
  }, [fetchStudents, fetchRooms, fetchClassrooms]);
  
  // =====================================================
  // CONFIGURATION DES COLONNES DE LA TABLE
  // =====================================================
  const columns: Column<Student>[] = [
    {
      key: 'firstName',
      label: 'Élève',
      sortable: true,
      searchable: true,
      width: '250px',
      render: (firstName: string, student: Student) => {
        return (
          <div className="flex items-center space-x-3">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {student.firstName?.charAt(0) || ''}{student.lastName?.charAt(0) || ''}
                </div>
              )}
            </div>
            
            {/* Informations de l'élève */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {student.studentId}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'gender',
      label: 'Sexe',
      width: '90px',
      render: (gender: 'male' | 'female') => {
        return (
          <Badge variant="outline" className="text-xs">
            {gender === 'male' ? '👨' : '👩'}
          </Badge>
        );
      }
    },
    {
      key: 'roomName',
      label: 'Salle',
      sortable: true,
      width: '200px',
      render: (roomName: string | undefined, student: Student) => {
        if (roomName && student.grade) {
          return (
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {student.grade} - {roomName}
            </Badge>
          );
        } else if (student.grade) {
        return (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {student.grade} - Non assignée
          </Badge>
        );
        } else {
          return (
            <span className="text-xs text-gray-400 whitespace-nowrap">Non assignée</span>
          );
        }
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '100px',
      render: (status: string) => {
        const variant = status === 'active' ? 'default' : 
                      status === 'inactive' ? 'secondary' : 'destructive';
        const label = status === 'active' ? 'Actif' : 
                     status === 'inactive' ? 'Inactif' : 'Suspendu';
        return (
          <Badge variant={variant} className="text-xs">
            {label}
          </Badge>
        );
      }
    },
    {
      key: 'email',
      label: 'Email',
      searchable: true,
      width: '200px',
      render: (email?: string) => {
        return email ? (
          <span className="text-sm">{email}</span>
        ) : (
          <span className="text-xs text-gray-400">Non renseigné</span>
        );
      }
    },
    {
      key: 'enrollmentDate',
      label: 'Inscription',
      sortable: true,
      width: '120px',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('fr-FR');
        return <span className="text-sm">{formattedDate}</span>;
      }
    }
  ];
  
  // =====================================================
  // CONFIGURATION DES ACTIONS DE LIGNE
  // =====================================================
  const rowActions: RowAction<Student>[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (student) => {
        setSelectedStudent(student);
        setShowViewDialog(true);
      }
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (student) => {
        setSelectedStudent(student);
        setShowEditDialog(true);
      }
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (student) => {
        setSelectedStudent(student);
        setShowDeleteDialog(true);
      },
      variant: "destructive"
    }
  ];
  
  // =====================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // =====================================================
  
  // =====================================================
  // GESTION DES FILTRES PAR CLASSE ET SALLE
  // =====================================================
  
  const handleClassroomFilter = async (grade: string, className: string) => {
    try {
      // Les grades des étudiants sont comme "NS I", "NS II", etc.
      // Chercher d'abord par correspondance exacte avec le grade des étudiants
      let classroom = classrooms.find(c => 
        c.name === grade || 
        c.level === grade
      );
      
      // Si pas trouvé, essayer des correspondances partielles
      if (!classroom) {
        classroom = classrooms.find(c => 
          c.name?.includes(grade) ||
          c.level?.includes(grade) ||
          grade.includes(c.name || '') ||
          grade.includes(c.level || '')
        );
      }
      
      // Si toujours pas trouvé, créer un mapping manuel basé sur les données visibles
      if (!classroom && classrooms.length > 0) {
        // Essayer de mapper NS I -> première classe, NS II -> deuxième, etc.
        const gradeToIndex = {
          'NS I': 0,
          'NS II': 1, 
          'NS III': 2,
          'NS IV': 3
        };
        const index = gradeToIndex[grade as keyof typeof gradeToIndex];
        if (index !== undefined && classrooms[index]) {
          classroom = classrooms[index];
          console.log(`Mapping manuel: ${grade} -> ${classroom.name} (${classroom.id})`);
        }
      }
      
      if (!classroom) {
        console.error(`Classe ${grade} non trouvée dans:`, classrooms.map(c => ({ id: c.id, name: c.name, level: c.level })));
        toast.error(`Classe ${grade} non trouvée`);
        return;
      }

      console.log(`Filtrage par classe: ${grade} -> ${classroom.name} (ID: ${classroom.id})`);
      const studentsInClassroom = await getStudentsByClassroom(classroom.id);
      console.log(`Étudiants trouvés pour la classe ${classroom.name}:`, studentsInClassroom);
      
      // Les étudiants filtrés sont maintenant automatiquement mis à jour dans le store
      // Réinitialiser les filtres pour éviter les conflits
      setFilters({ 
        search: `Classe: ${className}`,
        gender: undefined,
        status: undefined,
        roomId: undefined
      });
    } catch (error) {
      console.error('Erreur lors du filtrage par classe:', error);
      toast.error('Erreur lors du chargement des étudiants de la classe');
    }
  };

  const handleRoomFilter = async (roomId: string) => {
    if (!roomId || roomId === 'all') {
      // Réinitialiser le filtre
      setFilters({ ...filters, roomId: undefined });
      return;
    }

    try {
      const studentsInRoom = await getStudentsByRoom(roomId);
      
      // Mettre à jour le filtre de salle
      setFilters({ ...filters, roomId });
    } catch (error) {
      console.error('Erreur lors du filtrage par salle:', error);
      toast.error('Erreur lors du chargement des étudiants de la salle');
    }
  };

  // Gestion de la création d'un nouvel élève
  const handleCreateStudent = async (data: CreateStudentFormData) => {
    try {
      setCreateError(null);
      if (!API_CONFIG.BASE_URL) {
        setCreateError("Configuration API manquante: définissez REACT_APP_API_URL dans l'environnement.");
        return;
      }
      // Utiliser l'ID de la classe backend sélectionnée par le formulaire
      const classroomId = (data as any).selectedClassroomId as string;
      if (!classroomId) {
        setCreateError("Veuillez sélectionner une classe (backend).");
        return;
      }

      // roomId requis par l'API
      const selectedRoomId = data.roomId && data.roomId !== 'none' ? data.roomId : '';
      if (!selectedRoomId) {
        setCreateError("Veuillez sélectionner une salle (room) pour l'élève.");
        return;
      }

      // Construire la partie Responsable selon le mode
      let personneResponsableId: string | undefined = undefined;
      let createPersonneResponsable: AddStudentApiPayload['createPersonneResponsable'] | undefined = undefined;
      const mode = (data as any).responsableMode as ('select'|'create'|undefined);
      if (mode === 'select' && (data as any).personneResponsableId) {
        personneResponsableId = (data as any).personneResponsableId as string;
      } else if ((data as any).responsable) {
        const r = (data as any).responsable as any;
        createPersonneResponsable = {
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email || undefined,
          phone: r.phone || undefined,
          lienParente: r.lienParente,
          nif: r.nif || undefined,
          ninu: r.ninu || undefined
        };
      }

      // Construire l'adresse attendue (objet obligatoire côté API)
      const rawAdresse = (data as any).adresse;
      let adresse: any = undefined;
      if (rawAdresse && typeof rawAdresse === 'string') {
        try {
          const parsed = JSON.parse(rawAdresse);
          adresse = parsed && typeof parsed === 'object' ? parsed : { description: rawAdresse };
        } catch {
          adresse = { description: rawAdresse };
        }
      } else if (rawAdresse && typeof rawAdresse === 'object') {
        adresse = rawAdresse;
      }

      const payload: AddStudentApiPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        // Sexe M/F depuis gender
        sexe: data.gender === 'male' ? 'Homme' : 'Femme',
        // date-time ISO pour l'API ($date-time)
        dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
        // Lieu et commune de naissance
        lieuDeNaissance: data.placeOfBirth,
        communeDeNaissance: (data as any).communeDeNaissance,
        // Handicap et adresse
        hasHandicap: (data as any).hasHandicap ?? false,
        handicapDetails: (data as any).handicapDetails || undefined,
        // Adresse objet obligatoire
        adresse: adresse || { description: '' },
        // Vacation et niveau d'enseignement
        vacation: (data as any).vacation === 'AM' ? 'Matin (AM)' : 'Après-midi (PM)',
        niveauEnseignement: (data as any).niveauEnseignement,
        // Niveau d'étude = grade (NSI..NSIV)
        niveauEtude: data.grade === 'NSI' ? 'NS I' : data.grade === 'NSII' ? 'NS II' : data.grade === 'NSIII' ? 'NS III' : 'NS IV',
        // Infos parents (obligatoires API)
        nomMere: (data as any).nomMere,
        prenomMere: (data as any).prenomMere,
        statutMere: (data as any).statutMere === 'vivant' ? 'Vivant' : 'Mort',
        occupationMere: (data as any).occupationMere || undefined,
        nomPere: (data as any).nomPere,
        prenomPere: (data as any).prenomPere,
        statutPere: (data as any).statutPere === 'vivant' ? 'Vivant' : 'Mort',
        occupationPere: (data as any).occupationPere || undefined,
        // Responsable: id ou création
        personneResponsableId,
        createPersonneResponsable,
        // Classe et salle
        classroomId,
        roomId: selectedRoomId
      };

      await createStudentApi(payload);
      setShowAddDialog(false);
    } catch (error) {
      // Erreur gérée par le store, on ajoute un fallback local
      const message = (error as any)?.message || "Une erreur est survenue lors de la création.";
      setCreateError(message);
    }
  };
  
  // Gestion de la mise à jour d'un élève
  const handleUpdateStudent = async (data: CreateStudentFormData, studentId?: string) => {
    if (!studentId) return;
    
    try {
      // Convertir les données en format de mise à jour
      const updateData = {
        id: studentId,
        ...data
      };
      await updateStudent(updateData);
      setShowEditDialog(false);
      setSelectedStudent(null);
      // Afficher une notification de succès (à implémenter)
    } catch (error) {
      // L'erreur est gérée par le store
    }
  };
  
  // Gestion de la suppression d'un élève
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      await deleteStudent(selectedStudent.id);
      setShowDeleteDialog(false);
      setSelectedStudent(null);
      // Afficher une notification de succès (à implémenter)
    } catch (error) {
      // L'erreur est gérée par le store
    }
  };
  
  // État local pour la recherche avec debouncing
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de délai
  
  // Effet pour appliquer la recherche debouncée
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);
  
  // Gestion de la recherche (mise à jour immédiate de l'état local)
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
  };
  
  // ✨ Gestion des filtres avancés
  const handleStudentFilter = (filterUpdates: Partial<typeof filters>) => {
    setFilters(filterUpdates);
  };
  
  // Gestion du tri
  const handleSort = (sort: { field: string; order: 'asc' | 'desc' }) => {
    setSortOptions({
      field: sort.field as keyof Student,
      order: sort.order
    });
  };

  // =====================================================
  // FONCTIONS D'EXPORTATION
  // =====================================================
  
  const exportToCSV = () => {
    const headers = ['Prénom', 'Nom', 'Sexe', 'Classe', 'Matricule', 'Statut', 'Email', 'Date d\'inscription'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.firstName,
        student.lastName,
        student.gender === 'male' ? 'Homme' : 'Femme',
        student.grade,
        student.studentId,
        student.status === 'active' ? 'Actif' : student.status === 'inactive' ? 'Inactif' : 'Suspendu',
        student.email || '',
        new Date(student.enrollmentDate).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eleves_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simulation d'export PDF - à implémenter avec une librairie comme jsPDF
    alert('Export PDF - Fonctionnalité à implémenter');
  };

  
  // =====================================================
  // RENDU DES STATISTIQUES
  // =====================================================
  const renderStats = () => {
    if (!stats) return null;
    
    return (
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
          {/* Statistique Total avec sous-totaux par sexe */}
          <Card className="h-fit">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs text-muted-foreground">Total Élèves</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">👥</span>
                </div>
              </div>
              <div className="flex justify-between text-xs border-t pt-1">
                <div className="text-center">
                  <p className="text-blue-600 font-medium text-base">{stats.byGender.male}</p>
                  <p className="text-xs text-muted-foreground">Hommes</p>
                </div>
                <div className="text-center">
                  <p className="text-pink-600 font-medium text-base">{stats.byGender.female}</p>
                  <p className="text-xs text-muted-foreground">Femmes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Statistique Actifs avec détails des autres statuts */}
          <Card className="h-fit">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                  <p className="text-xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-xs border-t pt-1">
                <div className="text-center">
                  <p className="text-gray-600 font-medium text-base">{stats.inactive}</p>
                  <p className="text-xs text-muted-foreground">Inactifs</p>
                </div>
                <div className="text-center">
                  <p className="text-red-600 font-medium text-base">{stats.suspended}</p>
                  <p className="text-xs text-muted-foreground">Suspendus</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Statistique Salles avec répartition */}
          <Card className="h-fit">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs text-muted-foreground">Salles</p>
                  <p className="text-xl font-bold text-purple-600">{stats.totalClasses}</p>
                </div>
                <div className="h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xs">🏫</span>
                </div>
              </div>
              <div className="border-t pt-1">
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(stats.byGrade).map(([grade, count], index) => {
                    const colors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                      { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
                      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
                      { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' }
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div 
                        key={grade} 
                        className={`${color.bg} rounded-md p-0.4 px-2 border ${color.border} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => {
                          console.log('Clic sur grade:', grade);
                          console.log('Classrooms disponibles:', classrooms.map(c => ({ id: c.id, name: c.name, level: c.level })));
                          console.log('Students avec ce grade:', students.filter(s => s.grade === grade));
                          handleClassroomFilter(grade, `${grade}`);
                        }}
                        title={`Cliquer pour filtrer les étudiants de ${grade}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">{grade}</span>
                          <span className={`text-xs font-bold ${color.text}`}>{count}</span>
                        </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Lien pour voir plus de détails */}
        <div className="flex justify-end">
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
            onClick={() => navigate('/dashboard')}
          >
            Voir plus de détails →
          </Button>
        </div>
      </div>
    );
  };
  
  // =====================================================
  // RENDU DES ERREURS
  // =====================================================
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message}
          <Button
            variant="link"
            size="sm"
            onClick={clearError}
            className="ml-2 h-auto p-0"
          >
            Fermer
          </Button>
        </AlertDescription>
      </Alert>
    );
  };
  
  // =====================================================
  // RENDU PRINCIPAL DU COMPOSANT
  // =====================================================
  return (
    <div className="space-y-6">
      {/* En-tête avec titre et actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Élèves</h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions, informations et statuts des élèves
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Format d'exportation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={exportToExcel}>
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={exportToPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Élève
          </Button>
        </div>
      </div>
      
      {/* Affichage des erreurs */}
      {renderError()}
      
      {/* Statistiques */}
      {renderStats()}
      
      {/* Table des élèves */}
      <DataTable
        data={students}
        columns={columns}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={changePage}
        onSort={handleSort}
        onSearch={handleSearch}
        onStudentFilter={(filters) => {
          // Gérer le filtre par salle avec l'endpoint
          if (filters.roomId !== undefined) {
            handleRoomFilter(filters.roomId);
          } else {
            // Autres filtres normaux
            handleStudentFilter(filters);
          }
        }}
        currentFilters={filters}
        rooms={rooms}
        searchPlaceholder="Rechercher par nom, prénom, email ou matricule..."
        emptyStateMessage="Aucun élève trouvé"
        title="Liste des Élèves"
        description={`${pagination.total} élèves au total`}
      />
      
      {/* =====================================================
          DIALOGS ET MODALES
          ===================================================== */}
      
      {/* Dialog d'ajout d'élève (nouveau composant dédié) */}
      {showAddDialog && (
        <AddStudentModal 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onSuccess={() => { fetchStudents(); }}
        />
      )}
      
      {/* Dialog de modification d'élève */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'élève</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'élève selon vos besoins.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm
              student={selectedStudent}
              onSubmit={handleUpdateStudent}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedStudent(null);
              }}
              loading={loadingAction === 'update'}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de suppression d'élève */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'élève</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Nom :</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p><strong>Matricule :</strong> {selectedStudent.studentId}</p>
                <p><strong>Classe :</strong> {selectedStudent.grade}</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedStudent(null);
                  }}
                  disabled={loadingAction === 'delete'}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteStudent}
                  disabled={loadingAction === 'delete'}
                >
                  {loadingAction === 'delete' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Suppression...
                    </div>
                  ) : (
                    'Supprimer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de visualisation d'élève */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'élève</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Photo et informations de base */}
              <div className="flex items-center gap-4">
                {selectedStudent.avatar ? (
                  <img 
                    src={selectedStudent.avatar} 
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.studentId}</p>
                  <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>
              
              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations personnelles</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Email :</strong> {selectedStudent.email || 'Non renseigné'}</p>
                    <p><strong>Sexe :</strong> {selectedStudent.gender === 'male' ? 'Homme' : 'Femme'}</p>
                    <p><strong>Date de naissance :</strong> {new Date(selectedStudent.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Lieu de naissance :</strong> {selectedStudent.placeOfBirth}</p>
                    <p><strong>N° d'ordre 9ème AF :</strong> {selectedStudent.ninthGradeOrderNumber}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informations scolaires</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Niveau :</strong> {selectedStudent.level === 'nouveauSecondaire' ? 'Nouveau Secondaire' : 'Secondaire'}</p>
                    <p><strong>Classe :</strong> {selectedStudent.grade}</p>
                    <p><strong>École 9e :</strong> {selectedStudent.ninthGradeSchool || 'Non renseigné'}</p>
                    <p><strong>Année réussite 9e :</strong> {selectedStudent.ninthGradeGraduationYear || 'Non renseigné'}</p>
                    <p><strong>Dernier établissement :</strong> {selectedStudent.lastSchool || 'Non renseigné'}</p>
                    <p><strong>Inscription :</strong> {new Date(selectedStudent.enrollmentDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              {/* Informations du parent */}
              <div>
                <h4 className="font-medium mb-2">Contact parent/tuteur</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Père :</strong> {selectedStudent.parentContact.fatherName || 'Non renseigné'}</p>
                  <p><strong>Mère :</strong> {selectedStudent.parentContact.motherName || 'Non renseigné'}</p>
                  <p><strong>Personne responsable :</strong> {selectedStudent.parentContact.responsiblePerson}</p>
                  <p><strong>Relation :</strong> {selectedStudent.parentContact.relationship}</p>
                  <p><strong>Téléphone :</strong> {selectedStudent.parentContact.phone}</p>
                  <p><strong>Email :</strong> {selectedStudent.parentContact.email || 'Non renseigné'}</p>
                  <p><strong>Adresse :</strong> {selectedStudent.parentContact.address || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    setSelectedStudent(null);
                  }}
                >
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