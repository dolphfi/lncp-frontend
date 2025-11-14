/**
 * =====================================================
 * COMPOSANT ADMIN - GESTION DES NOTES
 * =====================================================
 * Interface de gestion des notes pour les administrateurs
 * avec onglets pour notes validées et notes en attente
 * Permet la validation/rejet des notes soumises par les professeurs
 */

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Search,
  FileText,
  User,
  BookOpen,
  Calendar,
  Activity,
  MoreVertical,
  CheckSquare,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

import noteService from '../../../services/notes/noteService';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

/**
 * Interface pour une note validée
 */
interface ValidatedNote {
  id: string;
  student: {
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
  };
  course: {
    id: string;
    titre: string;
    code: string;
    ponderation?: number;
  };
  trimestre_1: string | null;
  trimestre_2: string | null;
  trimestre_3: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une note en attente
 */
interface PendingNote {
  id: string;
  student: {
    id: string;
    matricule: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  course: {
    id: string;
    titre: string;
    code: string;
  };
  trimestre: string;
  note: number;
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  status: string;
}

const columnHelperValidated = createColumnHelper<ValidatedNote>();
const columnHelperPending = createColumnHelper<PendingNote>();

/**
 * Fonction utilitaire pour formater une note de trimestre
 */
const formatTrimestreNote = (noteValue: string | null, ponderation?: number): React.ReactElement => {
  if (noteValue === null) {
    return <span className="text-gray-400">-</span>;
  }
  
  const value = parseFloat(noteValue);
  const pond = ponderation || 100;
  const percentage = (value / pond) * 100;
  const color = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-blue-600' : 'text-red-600';
  
  return <span className={`font-bold ${color}`}>{value.toFixed(2)}</span>;
};

/**
 * Composant principal - Interface admin des notes
 */
const AdminNotesList: React.FC = () => {
  // ========== ÉTATS ==========
  const [activeTab, setActiveTab] = useState<'validated' | 'pending'>('validated');
  const [validatedNotes, setValidatedNotes] = useState<ValidatedNote[]>([]);
  const [pendingNotes, setPendingNotes] = useState<PendingNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination pour les notes validées
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Dialog de validation/rejet
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkValidateDialog, setShowBulkValidateDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PendingNote | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Recherche et filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('all');

  // ========== CHARGEMENT DES DONNÉES ==========

  /**
   * Charger les notes validées depuis l'API
   */
  const loadValidatedNotes = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const data = await noteService.getAllNotes(page, pageSize);
      
      // L'API retourne directement les données (pas d'enveloppe response)
      // La structure peut être : data directement OU { data: [...], pagination: {...} }
      const notes = (data && typeof data === 'object' && 'data' in data) ? data.data : data;
      const pagination = (data && typeof data === 'object' && 'pagination' in data) ? data.pagination : null;
      
      setValidatedNotes(Array.isArray(notes) ? notes : []);
      
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.page || 1);
      }
    } catch (error: any) {
      console.error('Erreur chargement notes validées:', error);
      toast.error(error.message || 'Erreur lors du chargement des notes validées');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charger les notes en attente depuis l'API
   */
  const loadPendingNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getPendingNotes();
      
      // L'API retourne directement les données (pas d'enveloppe response)
      // La structure peut être : data directement OU { data: [...] }
      const notes = (data && typeof data === 'object' && 'data' in data) ? data.data : data;
      setPendingNotes(Array.isArray(notes) ? notes : []);
    } catch (error: any) {
      console.error('Erreur chargement notes en attente:', error);
      toast.error(error.message || 'Erreur lors du chargement des notes en attente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rafraîchir les données
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'validated') {
      await loadValidatedNotes();
    } else {
      await loadPendingNotes();
    }
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  // ========== FILTRAGE DES DONNÉES ==========

  /**
   * Extraire la liste unique des professeurs
   */
  const uniqueTeachers = React.useMemo(() => {
    const teachers = new Map<string, string>();
    pendingNotes.forEach(note => {
      if (note.submittedBy) {
        const id = note.submittedBy.id;
        const name = `${note.submittedBy.firstName} ${note.submittedBy.lastName}`;
        teachers.set(id, name);
      }
    });
    return Array.from(teachers.entries()).map(([id, name]) => ({ id, name }));
  }, [pendingNotes]);

  /**
   * Extraire la liste unique des cours
   */
  const uniqueCourses = React.useMemo(() => {
    const courses = new Map<string, string>();
    [...validatedNotes, ...pendingNotes].forEach(note => {
      if (note.course) {
        courses.set(note.course.id, note.course.titre);
      }
    });
    return Array.from(courses.entries()).map(([id, titre]) => ({ id, titre }));
  }, [validatedNotes, pendingNotes]);

  /**
   * Filtrer les notes en attente
   */
  const filteredPendingNotes = React.useMemo(() => {
    return pendingNotes.filter(note => {
      // Filtre par recherche (nom étudiant, cours, professeur)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const studentName = `${note.student.user?.firstName} ${note.student.user?.lastName}`.toLowerCase();
        const courseName = note.course.titre.toLowerCase();
        const teacherName = note.submittedBy ? `${note.submittedBy.firstName} ${note.submittedBy.lastName}`.toLowerCase() : '';
        
        if (!studentName.includes(query) && !courseName.includes(query) && !teacherName.includes(query)) {
          return false;
        }
      }

      // Filtre par professeur
      if (selectedTeacher !== 'all' && note.submittedBy?.id !== selectedTeacher) {
        return false;
      }

      // Filtre par cours
      if (selectedCourse !== 'all' && note.course.id !== selectedCourse) {
        return false;
      }

      // Filtre par trimestre
      if (selectedTrimestre !== 'all' && note.trimestre !== selectedTrimestre) {
        return false;
      }

      return true;
    });
  }, [pendingNotes, searchQuery, selectedTeacher, selectedCourse, selectedTrimestre]);

  /**
   * Filtrer les notes validées
   */
  const filteredValidatedNotes = React.useMemo(() => {
    return validatedNotes.filter(note => {
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const studentName = `${note.student.firstName} ${note.student.lastName}`.toLowerCase();
        const courseName = note.course.titre.toLowerCase();
        
        if (!studentName.includes(query) && !courseName.includes(query)) {
          return false;
        }
      }

      // Filtre par cours
      if (selectedCourse !== 'all' && note.course.id !== selectedCourse) {
        return false;
      }

      return true;
    });
  }, [validatedNotes, searchQuery, selectedCourse]);

  // ========== ACTIONS DE VALIDATION/REJET ==========

  /**
   * Ouvrir le dialog de validation
   */
  const handleOpenValidateDialog = (note: PendingNote) => {
    setSelectedNote(note);
    setShowValidateDialog(true);
  };

  /**
   * Ouvrir le dialog de rejet
   */
  const handleOpenRejectDialog = (note: PendingNote) => {
    setSelectedNote(note);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  /**
   * Valider une note en attente
   */
  const handleValidateNote = async () => {
    if (!selectedNote) return;

    try {
      setActionLoading(true);
      await noteService.validateNote(selectedNote.id);
      
      toast.success('Note validée avec succès');
      setShowValidateDialog(false);
      setSelectedNote(null);
      
      // Recharger les notes en attente
      await loadPendingNotes();
    } catch (error: any) {
      console.error('Erreur validation note:', error);
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Ouvrir le dialog de détails
   */
  const handleOpenDetailsDialog = (note: PendingNote) => {
    setSelectedNote(note);
    setShowDetailsDialog(true);
  };

  /**
   * Valider toutes les notes d'un professeur
   */
  const handleBulkValidateByTeacher = async () => {
    if (selectedTeacher === 'all') {
      toast.error('Veuillez sélectionner un professeur');
      return;
    }

    const notesToValidate = filteredPendingNotes.filter(note => note.submittedBy?.id === selectedTeacher);
    
    if (notesToValidate.length === 0) {
      toast.error('Aucune note à valider pour ce professeur');
      return;
    }

    setShowBulkValidateDialog(true);
  };

  /**
   * Confirmer la validation en masse
   */
  const handleConfirmBulkValidate = async () => {
    if (selectedTeacher === 'all') return;

    const notesToValidate = filteredPendingNotes.filter(note => note.submittedBy?.id === selectedTeacher);

    try {
      setActionLoading(true);
      
      // Valider toutes les notes en parallèle
      await Promise.all(
        notesToValidate.map(note => noteService.validateNote(note.id))
      );
      
      toast.success(`${notesToValidate.length} note(s) validée(s) avec succès`);
      setShowBulkValidateDialog(false);
      
      // Recharger les notes en attente
      await loadPendingNotes();
    } catch (error: any) {
      console.error('Erreur validation en masse:', error);
      toast.error(error.message || 'Erreur lors de la validation en masse');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Rejeter une note en attente
   */
  const handleRejectNote = async () => {
    if (!selectedNote || !rejectReason.trim()) {
      toast.error('Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      setActionLoading(true);
      await noteService.rejectNote(selectedNote.id, rejectReason);
      
      toast.success('Note rejetée. Le professeur a été notifié par email.');
      setShowRejectDialog(false);
      setSelectedNote(null);
      setRejectReason('');
      
      // Recharger les notes en attente
      await loadPendingNotes();
    } catch (error: any) {
      console.error('Erreur rejet note:', error);
      toast.error(error.message || 'Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  // ========== COLONNES DES TABLEAUX ==========

  /**
   * Colonnes pour les notes validées
   */
  const validatedColumns = [
    columnHelperValidated.accessor('student', {
      header: 'Étudiant',
      cell: (info) => {
        const student = info.getValue();
        return (
          <div>
            <div className="font-medium">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-xs text-gray-500">{student.matricule}</div>
          </div>
        );
      },
    }),
    columnHelperValidated.accessor('course', {
      header: 'Cours',
      cell: (info) => {
        const course = info.getValue();
        return (
          <div>
            <div className="font-medium">{course.titre}</div>
            <div className="text-xs text-gray-500">{course.code}</div>
          </div>
        );
      },
    }),
    columnHelperValidated.accessor('trimestre_1', {
      header: 'Trimestre 1',
      cell: (info) => {
        const note = info.row.original;
        return formatTrimestreNote(info.getValue(), note.course.ponderation);
      },
    }),
    columnHelperValidated.accessor('trimestre_2', {
      header: 'Trimestre 2',
      cell: (info) => {
        const note = info.row.original;
        return formatTrimestreNote(info.getValue(), note.course.ponderation);
      },
    }),
    columnHelperValidated.accessor('trimestre_3', {
      header: 'Trimestre 3',
      cell: (info) => {
        const note = info.row.original;
        return formatTrimestreNote(info.getValue(), note.course.ponderation);
      },
    }),
    columnHelperValidated.accessor('createdAt', {
      header: 'Créée le',
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
      },
    }),
  ];

  /**
   * Colonnes pour les notes en attente
   */
  const pendingColumns = [
    columnHelperPending.accessor('student', {
      header: 'Étudiant',
      cell: (info) => {
        const student = info.getValue();
        return (
          <div>
            <div className="font-medium">
              {student.user?.firstName} {student.user?.lastName}
            </div>
            <div className="text-xs text-gray-500">{student.matricule}</div>
          </div>
        );
      },
    }),
    columnHelperPending.accessor('course', {
      header: 'Cours',
      cell: (info) => {
        const course = info.getValue();
        return (
          <div>
            <div className="font-medium">{course.titre}</div>
            <div className="text-xs text-gray-500">{course.code}</div>
          </div>
        );
      },
    }),
    columnHelperPending.accessor('trimestre', {
      header: 'Trimestre',
      cell: (info) => (
        <Badge variant="outline">{info.getValue()}</Badge>
      ),
    }),
    columnHelperPending.accessor('note', {
      header: 'Note',
      cell: (info) => {
        const note = info.getValue();
        const color = note >= 14 ? 'text-green-600' : note >= 10 ? 'text-blue-600' : 'text-red-600';
        return <span className={`font-bold ${color}`}>{note}/20</span>;
      },
    }),
    columnHelperPending.accessor('submittedBy', {
      header: 'Professeur',
      cell: (info) => {
        const teacher = info.getValue();
        return `${teacher?.firstName} ${teacher?.lastName}`;
      },
    }),
    columnHelperPending.accessor('createdAt', {
      header: 'Soumise le',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('fr-FR'),
    }),
    columnHelperPending.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const note = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenDetailsDialog(note)}>
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenValidateDialog(note)}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenRejectDialog(note)}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  // ========== TABLES ==========

  const validatedTable = useReactTable({
    data: filteredValidatedNotes,
    columns: validatedColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pendingTable = useReactTable({
    data: filteredPendingNotes,
    columns: pendingColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ========== EFFETS ==========

  /**
   * Chargement initial des données au montage du composant
   * On charge les deux types de notes pour avoir les statistiques complètes
   */
  useEffect(() => {
    const loadInitialData = async () => {
      // Charger les deux en parallèle pour optimiser le temps de chargement
      await Promise.all([
        loadValidatedNotes(),
        loadPendingNotes()
      ]);
    };
    
    loadInitialData();
  }, []); // Exécuté une seule fois au montage

  // ========== RENDER ==========

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* En-tête compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Notes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validation et suivi des notes académiques
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides - Design compact avec bordures colorées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Notes Validées</p>
                <p className="text-xl font-bold text-green-600">{validatedNotes.length}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">En Attente</p>
                <p className="text-xl font-bold text-orange-600">{pendingNotes.length}</p>
              </div>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Notes</p>
                <p className="text-xl font-bold text-blue-600">
                  {validatedNotes.length + pendingNotes.length}
                </p>
              </div>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taux Validation</p>
                <p className="text-xl font-bold text-purple-600">
                  {validatedNotes.length + pendingNotes.length > 0
                    ? Math.round((validatedNotes.length / (validatedNotes.length + pendingNotes.length)) * 100)
                    : 0}%
                </p>
              </div>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs et contenu */}
      <Card>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="border-b">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger
                value="validated"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Notes Validées ({validatedNotes.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                <Clock className="h-4 w-4 mr-2" />
                En Attente ({pendingNotes.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenu - Notes Validées */}
          <TabsContent value="validated" className="space-y-4 mt-6">
            <div className="flex justify-between items-center px-6">
              <div>
                <h3 className="text-lg font-semibold">Notes validées</h3>
                <p className="text-sm text-gray-500">{filteredValidatedNotes.length} notes validées</p>
              </div>
            </div>

            {/* Filtres */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par étudiant ou cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : validatedNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune note validée pour le moment</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      {validatedTable.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validatedTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadValidatedNotes(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadValidatedNotes(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Contenu - Notes en Attente */}
          <TabsContent value="pending" className="space-y-4 mt-6">
            <div className="flex justify-between items-center px-6">
              <div>
                <h3 className="text-lg font-semibold">Notes en attente</h3>
                <p className="text-sm text-gray-500">{filteredPendingNotes.length} notes à valider</p>
              </div>
              {selectedTeacher !== 'all' && filteredPendingNotes.length > 0 && (
                <Button
                  onClick={handleBulkValidateByTeacher}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Valider toutes les notes de ce professeur
                </Button>
              )}
            </div>

            {/* Filtres */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par étudiant, cours ou professeur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les professeurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les professeurs</SelectItem>
                  {uniqueTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTrimestre} onValueChange={setSelectedTrimestre}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les trimestres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les trimestres</SelectItem>
                  <SelectItem value="T1">Trimestre 1</SelectItem>
                  <SelectItem value="T2">Trimestre 2</SelectItem>
                  <SelectItem value="T3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : pendingNotes.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune note en attente de validation</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    {pendingTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingTable.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dialog de validation */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la note</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider cette note ?
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Étudiant:</span>
                <span className="font-medium">
                  {selectedNote.student.user?.firstName} {selectedNote.student.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cours:</span>
                <span className="font-medium">{selectedNote.course.titre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Trimestre:</span>
                <span className="font-medium">{selectedNote.trimestre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Note:</span>
                <span className="font-bold text-lg">{selectedNote.note}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Professeur:</span>
                <span className="font-medium">
                  {selectedNote.submittedBy?.firstName} {selectedNote.submittedBy?.lastName}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidateDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateNote}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la note</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. Le professeur sera notifié par email.
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Étudiant:</span>
                  <span className="font-medium">
                    {selectedNote.student.user?.firstName} {selectedNote.student.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Cours:</span>
                  <span className="font-medium">{selectedNote.course.titre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Note:</span>
                  <span className="font-bold text-lg">{selectedNote.note}/20</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison du rejet *</Label>
                <Textarea
                  id="reason"
                  placeholder="Ex: Note trop élevée par rapport aux évaluations précédentes"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRejectNote}
              disabled={actionLoading || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejet...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails d'une note */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la note</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette note en attente
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Étudiant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {selectedNote.student.user?.firstName} {selectedNote.student.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedNote.student.matricule}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{selectedNote.course.titre}</p>
                    <p className="text-sm text-gray-500">{selectedNote.course.code}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Trimestre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-base">{selectedNote.trimestre}</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{selectedNote.note}/20</p>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Professeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {selectedNote.submittedBy?.firstName} {selectedNote.submittedBy?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Soumise le {new Date(selectedNote.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
            {selectedNote && (
              <>
                <Button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleOpenValidateDialog(selectedNote);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleOpenRejectDialog(selectedNote);
                  }}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Validation en masse */}
      <Dialog open={showBulkValidateDialog} onOpenChange={setShowBulkValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation en masse</DialogTitle>
            <DialogDescription>
              Confirmer la validation de toutes les notes du professeur sélectionné
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Vous êtes sur le point de valider <span className="font-bold">
                {filteredPendingNotes.filter(note => note.submittedBy?.id === selectedTeacher).length}
              </span> note(s) du professeur <span className="font-bold">
                {uniqueTeachers.find(t => t.id === selectedTeacher)?.name}
              </span>.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkValidateDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmBulkValidate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Confirmer la validation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotesList;
