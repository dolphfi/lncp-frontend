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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  FileDown,
  FileText,
  RotateCcw,
  AlertCircle,
  Users,
  X,
  User,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Target,
  Phone,
  GraduationCap,
  Home,
  Clock,
  School,
  Accessibility,
  Info
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRoomId, setExportRoomId] = useState<string>('');
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
  // EXPORT PDF PAR SALLE
  // =====================================================
  const loadImageForPdf = async (url: string): Promise<{ dataURL: string; width: number; height: number } | null> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataURL = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      if (!dataURL) return null;
      // Obtenir les dimensions naturelles de l'image
      const imgEl = new Image();
      const meta = await new Promise<{ width: number; height: number }>((resolve) => {
        imgEl.onload = () => resolve({ width: imgEl.naturalWidth || imgEl.width, height: imgEl.naturalHeight || imgEl.height });
        imgEl.src = dataURL;
      });
      return { dataURL, width: meta.width, height: meta.height };
    } catch {
      return null;
    }
  };

  const exportStudentsByRoomToPDF = async () => {
    try {
      if (!exportRoomId) {
        toast.error('Veuillez sélectionner une salle.');
        return;
      }

      const room = rooms.find(r => r.id === exportRoomId);
      const roomLabel = room ? `${room.classLevel} - ${room.name}` : exportRoomId;

      // Récupérer via endpoint store
      const list = await getStudentsByRoom(exportRoomId);
      const rows = (Array.isArray(list) ? list : []).map((s: any) => {
        const matricule = s.matricule || s.studentId || s.user?.matricule || '—';
        const firstName = s.user?.firstName || s.firstName || '';
        const lastName = s.user?.lastName || s.lastName || '';
        const classe = s.classroom?.name || s.grade || s.niveauEtude || '';
        const salle = s.room?.name || s.roomName || room?.name || '';
        return [matricule, lastName, firstName, classe, salle];
      });

      const doc = new jsPDF('p', 'pt');
      const pageWidth = doc.internal.pageSize.getWidth();
      const headerMeta = await loadImageForPdf('/header-2.png');
      let topY = 40;
      if (headerMeta) {
        // Échelle pour occuper toute la largeur, sans marges latérales, en haut de page
        const scale = pageWidth / headerMeta.width;
        const scaledHeight = headerMeta.height * scale;
        try {
          // x=0, y=0, largeur=pageWidth, hauteur=scaledHeight (plein largeur)
          doc.addImage(headerMeta.dataURL, 'PNG', 0, 0, pageWidth, scaledHeight);
        } catch {}
        // Position de départ du contenu: juste après l'image + petit espace
        topY = scaledHeight + 12;
      }
      doc.setFontSize(14);
      doc.text(`Liste des élèves - ${roomLabel}`, 40, topY);
      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 40, topY + 16);

      autoTable(doc, {
        startY: topY + 28,
        head: [[ 'Matricule', 'Nom', 'Prénom', 'Classe', 'Salle' ]],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [25, 118, 210] },
        theme: 'striped',
      });

      const safeRoomName = (roomLabel || 'salle').replace(/[^a-z0-9_-]+/gi, '_');
      doc.save(`eleves_${safeRoomName}_${new Date().toISOString().slice(0,10)}.pdf`);
      setShowExportDialog(false);
      setExportRoomId('');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur export PDF:', e);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  // =====================================================
  // HELPERS D'AFFICHAGE
  // =====================================================
  const getInitials = (first?: string, last?: string) => {
    const a = (first?.trim()?.charAt(0) || '').toUpperCase();
    const b = (last?.trim()?.charAt(0) || '').toUpperCase();
    return `${a}${b}` || 'ST';
  };
  
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
      // Normaliser les libellés pour faire une correspondance robuste
      const normalize = (s?: string) => (s || '')
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/_/g, '')
        .replace(/\./g, '');

      const target = normalize(grade);

      // Chercher par correspondance normalisée sur name ou level
      let classroom = classrooms.find(c => {
        const n1 = normalize(c.name);
        const n2 = normalize((c as any).level);
        return n1 === target || n2 === target;
      });

      // Si pas trouvé, essayer des correspondances partielles (uniquement name/level qui CONTIENNENT le target)
      if (!classroom) {
        classroom = classrooms.find(c => {
          const n1 = normalize(c.name);
          const n2 = normalize((c as any).level);
          // Important: ne pas faire target.includes(n1) pour éviter que NSII corresponde à NSI
          return n1.includes(target) || n2.includes(target);
        });
      }
      
      if (!classroom) {
        console.error(`Classe ${grade} non trouvée dans:`, classrooms.map(c => ({ id: c.id, name: c.name, level: c.level })));
        toast.error(`Classe ${grade} non trouvée`);
        return;
      }

      console.log(`Filtrage par classe: ${grade} -> ${classroom.name} (ID: ${classroom.id})`);
      const studentsInClassroom = await getStudentsByClassroom(classroom.id);
      console.log(`Étudiants trouvés pour la classe ${classroom.name}:`, studentsInClassroom);
      // Marquer le filtre de classe actif pour l'UX (affichage du X)
      setFilters({ ...filters, grade });
      
      // Forcer le recalcul des statistiques après le filtrage
      fetchStats();
    } catch (error) {
      console.error('Erreur lors du filtrage par classe:', error);
      toast.error('Erreur lors du chargement des étudiants de la classe');
    }
  };

  // Effacer le filtre de classe et recharger tous les élèves
  const clearClassroomFilter = async () => {
    try {
      await fetchStudents();
      setFilters({ ...filters, grade: undefined });
    } catch (e) {
      console.error('Erreur lors de la réinitialisation du filtre classe:', e);
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

  // Fonction pour réinitialiser tous les filtres et recharger tous les étudiants
  const handleResetFilters = async () => {
    try {
      // Recharger tous les étudiants
      await fetchStudents();
      
      // Réinitialiser tous les filtres
      setFilters({
        search: '',
        gender: undefined,
        status: undefined,
        roomId: undefined,
        grade: undefined as any
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation des filtres');
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

  // exportToPDF géré via un dialog dédié (showExportDialog)

  
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
                    const isActive = filters?.grade === grade;
                    
                    return (
                      <div 
                        key={grade}
                        className={`${isActive ? 'ring-2 ring-offset-1 ring-orange-400' : ''} ${color.bg} rounded-md p-0.5 px-2 border ${color.border} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => {
                          console.log('Clic sur grade:', grade);
                          console.log('Classrooms disponibles:', classrooms.map(c => ({ id: c.id, name: c.name, level: c.level })));
                          console.log('Students avec ce grade:', students.filter(s => s.grade === grade));
                          handleClassroomFilter(grade, `${grade}`);
                        }}
                        title={`Cliquer pour filtrer les étudiants de ${grade}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-600">{grade}</span>
                          <div className="flex items-center gap-1">
                            <span className={`${color.text} text-xs font-bold`}>{count}</span>
                            {isActive && (
                              <button
                                type="button"
                                aria-label="Effacer le filtre de classe"
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                onClick={(e) => { e.stopPropagation(); clearClassroomFilter(); }}
                                title="Effacer ce filtre"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
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
      {/* =====================================================
          EN-TÊTE AVEC ACTIONS
          ===================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Élèves
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les informations des élèves de votre établissement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bouton Importer */}
          <label className="inline-flex">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                toast.info(`Import en cours: ${file.name}`);
                // TODO: Implémenter l'import via service (CSV/XLSX)
                // reset input
                e.currentTarget.value = '';
              }}
            />
            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </span>
            </Button>
          </label>
          
          {/* Menu d'export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Formats d'export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
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
        onResetAllFilters={handleResetFilters}
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
      {showEditDialog && selectedStudent && (
        <AddStudentModal
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => { fetchStudents(); }}
          studentId={selectedStudent.id} // Passer l'ID pour le mode édition
        />
      )}
      
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

      {/* Dialog d'export PDF par salle */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter en PDF par salle</DialogTitle>
            <DialogDescription>Sélectionnez une salle puis lancez l'export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Salle</label>
            <select
              className="border rounded-md h-9 px-3"
              value={exportRoomId}
              onChange={(e) => setExportRoomId(e.target.value)}
            >
              <option value="">-- Choisir une salle --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.classLevel} - {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Annuler</Button>
            <Button onClick={exportStudentsByRoomToPDF} disabled={!exportRoomId}>Exporter</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de visualisation d'élève */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'élève</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* En-tête élève */}
              <div className="flex items-center gap-4">
                {selectedStudent.avatar ? (
                  <img
                    src={selectedStudent.avatar}
                    alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                    {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold truncate">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedStudent.studentId}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={selectedStudent.status === 'active' ? 'default' : selectedStudent.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {selectedStudent.status === 'active' ? 'Actif' : selectedStudent.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                    </Badge>
                    {selectedStudent.grade && (
                      <Badge variant="outline">{selectedStudent.grade}</Badge>
                    )}
                    {selectedStudent.roomName && (
                      <Badge variant="outline">Salle: {selectedStudent.roomName}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Cartes d'informations (exactement le style AddStudentModal) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Identité */}
                <Card className="shadow-sm border-0 w-full">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
                    <CardTitle className="text-base text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Sexe</div>
                        <span className="font-medium">{selectedStudent.gender === 'male' ? 'Homme' : 'Femme'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Date de naissance</div>
                        <span className="font-medium">{new Date(selectedStudent.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Lieu de naissance</div>
                        <span className="font-medium break-words text-right">{selectedStudent.placeOfBirth}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Email</div>
                        <span className="font-medium truncate text-right">
                          {selectedStudent.email ? (
                            <a href={`mailto:${selectedStudent.email}`} className="text-blue-600 hover:underline">{selectedStudent.email}</a>
                          ) : 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="h-4 w-4" /> N° ordre 9e</div>
                        <span className="font-medium">{selectedStudent.ninthGradeOrderNumber || '—'}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><School className="h-4 w-4" /> Dernier établissement</div>
                        <span className="font-medium break-words text-right">{selectedStudent.lastSchool || 'Non renseigné'}</span>
                      </div>
                      {((selectedStudent as any)?.communeDeNaissance) && (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Commune</div>
                          <span className="font-medium break-words text-right">{(selectedStudent as any).communeDeNaissance}</span>
                        </div>
                      )}
                      {typeof (selectedStudent as any)?.hasHandicap !== 'undefined' && (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><Accessibility className="h-4 w-4" /> Handicap</div>
                          <span className="font-medium">{(selectedStudent as any).hasHandicap ? 'Oui' : 'Non'}</span>
                        </div>
                      )}
                      {((selectedStudent as any)?.handicapDetails) && (
                        <div className="flex items-start justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><Info className="h-4 w-4" /> Détails handicap</div>
                          <span className="font-medium break-words text-right">{(selectedStudent as any).handicapDetails}</span>
                        </div>
                      )}
                      {((selectedStudent as any)?.adresse) && (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground"><Home className="h-4 w-4" /> Adresse</div>
                          <span className="font-medium break-words text-right">{typeof (selectedStudent as any).adresse === 'string' ? (selectedStudent as any).adresse : JSON.stringify((selectedStudent as any).adresse)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Classe et Salle */}
                <Card className="shadow-sm border-0 w-full">
                  <CardHeader className="bg-purple-50 dark:bg-purple-900/20 rounded-t-lg">
                    <CardTitle className="text-base text-purple-800 dark:text-purple-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Classe et Salle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> Niveau</div>
                        <span className="font-medium">{selectedStudent.level === 'nouveauSecondaire' ? 'Nouveau Secondaire' : 'Secondaire'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4" /> Classe</div>
                        <span className="font-medium">{selectedStudent.grade}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Home className="h-4 w-4" /> Salle</div>
                        <span className="font-medium">{selectedStudent.roomName || 'Non assignée'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Inscription</div>
                        <span className="font-medium">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {((selectedStudent as any)?.niveauEnseignement) && (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> Niveau d'enseignement</div>
                          <span className="font-medium">{(selectedStudent as any).niveauEnseignement}</span>
                        </div>
                      )}
                      {((selectedStudent as any)?.vacation) && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Vacation</div>
                          <span className="font-medium">{(selectedStudent as any).vacation}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Parents */}
                <Card className="shadow-sm border-0 w-full md:col-span-2">
                  <CardHeader className="bg-orange-50 dark:bg-orange-900/20 rounded-t-lg">
                    <CardTitle className="text-base text-orange-800 dark:text-orange-200 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Parents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Père</div>
                        <div className="font-medium">{selectedStudent.parentContact.fatherName || 'Non renseigné'}</div>
                      </div>
                      {((selectedStudent as any)?.statutPere) && (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><Info className="h-4 w-4" /> Statut père</div>
                          <div className="font-medium">{(selectedStudent as any).statutPere}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Mère</div>
                        <div className="font-medium">{selectedStudent.parentContact.motherName || 'Non renseigné'}</div>
                      </div>
                      {((selectedStudent as any)?.statutMere) && (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground"><Info className="h-4 w-4" /> Statut mère</div>
                          <div className="font-medium">{(selectedStudent as any).statutMere}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Responsable</div>
                        <div className="font-medium">{selectedStudent.parentContact.responsiblePerson}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Info className="h-4 w-4" /> Relation</div>
                        <div className="font-medium">{selectedStudent.parentContact.relationship}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> Téléphone</div>
                        <div className="font-medium">
                          {selectedStudent.parentContact.phone ? (
                            <a href={`tel:${selectedStudent.parentContact.phone}`} className="text-blue-600 hover:underline">{selectedStudent.parentContact.phone}</a>
                          ) : 'Non renseigné'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Email</div>
                        <div className="font-medium truncate text-right">
                          {selectedStudent.parentContact.email ? (
                            <a href={`mailto:${selectedStudent.parentContact.email}`} className="text-blue-600 hover:underline">{selectedStudent.parentContact.email}</a>
                          ) : 'Non renseigné'}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground"><Home className="h-4 w-4" /> Adresse</div>
                        <div className="font-medium break-words text-right">{selectedStudent.parentContact.address || 'Non renseigné'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
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