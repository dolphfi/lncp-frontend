/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NoteFiltersFormData } from '../../../types/academic';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { toast } from 'react-toastify';

import { useAcademicStore } from '../../../stores/academicStore';
import { noteFiltersSchema } from '../../../schemas/academicSchemas';
import { Note } from '../../../types/academic';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'components/ui/alert-dialog';

const columnHelper = createColumnHelper<Note>();

const NotesList: React.FC = () => {
  const {
    notes,
    loading,
    filters,
    pagination,
    fetchNotes,
    updateNote,
    deleteNote,
    setFilters,
    clearFilters
  } = useAcademicStore();

  const [showFilters, setShowFilters] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Formulaire de filtres
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<NoteFiltersFormData>({
    resolver: yupResolver(noteFiltersSchema) as Resolver<NoteFiltersFormData>,
    defaultValues: {
      student_matricule: undefined,
      student_name: undefined,
      course_code: undefined,
      course_name: undefined,
      trimestre: undefined,
      niveau: undefined,
      classe: undefined,
      date_from: undefined,
      date_to: undefined
    }
  });

  // Charger les notes au montage et lors des changements de filtres
  useEffect(() => {
    fetchNotes(filters);
  }, [fetchNotes, filters]);

  // Colonnes du tableau
  const columns = [
    columnHelper.accessor('student', {
      id: 'student',
      header: 'Étudiant',
      cell: ({ getValue }) => {
        const student = getValue();
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {student.prenom} {student.nom}
            </span>
            <span className="text-sm text-gray-500">
              {student.matricule} • {student.classe}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = `${rowA.original.student.prenom} ${rowA.original.student.nom}`;
        const nameB = `${rowB.original.student.prenom} ${rowB.original.student.nom}`;
        return nameA.localeCompare(nameB);
      }
    }),

    columnHelper.accessor('course', {
      id: 'course',
      header: 'Cours',
      cell: ({ getValue }) => {
        const course = getValue();
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{course.nom}</span>
            <span className="text-sm text-gray-500">
              {course.code} • Pond. {course.ponderation}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.course.nom.localeCompare(rowB.original.course.nom);
      }
    }),

    columnHelper.accessor('trimestre', {
      id: 'trimestre',
      header: 'Trimestre',
      cell: ({ getValue }) => {
        const trimestre = getValue();
        const colors = {
          T1: 'bg-blue-100 text-blue-800',
          T2: 'bg-green-100 text-green-800',
          T3: 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge className={colors[trimestre]}>
            {trimestre}
          </Badge>
        );
      }
    }),

    columnHelper.accessor('note', {
      id: 'note',
      header: 'Note',
      cell: ({ getValue, row }) => {
        const note = getValue();
        const ponderation = row.original.course.ponderation;
        const percentage = (note / ponderation) * 100;
        
        let colorClass = 'text-gray-900';
        if (percentage >= 80) colorClass = 'text-green-600';
        else if (percentage >= 60) colorClass = 'text-yellow-600';
        else if (percentage < 50) colorClass = 'text-red-600';

        return (
          <div className="flex flex-col">
            <span className={`font-bold ${colorClass}`}>
              {note.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              /{ponderation} ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.note - rowB.original.note;
      }
    }),

    columnHelper.accessor('date_creation', {
      id: 'date_creation',
      header: 'Date de création',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              {date.toLocaleDateString('fr-FR')}
            </span>
            <span className="text-xs text-gray-500">
              {date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        );
      }
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const note = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditNote(note)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingNote(note)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    })
  ];

  // Configuration du tableau
  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: pagination.limit,
      },
    },
  });

  // Gestion des filtres
  const onFiltersSubmit = (data: NoteFiltersFormData) => {
    // Convertir les données pour correspondre au type SearchFilters
    const filterData = {
      ...data,
      trimestre: data.trimestre as 'T1' | 'T2' | 'T3' | undefined
    };
    setFilters(filterData);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    reset();
    setShowFilters(false);
  };

  // Gestion de l'édition
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditValue(note.note);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;

    const success = await updateNote(editingNote.id, { note: editValue });
    if (success) {
      setEditingNote(null);
      fetchNotes(filters);
    }
  };

  // Gestion de la suppression
  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    const success = await deleteNote(deletingNote.id);
    if (success) {
      setDeletingNote(null);
      fetchNotes(filters);
    }
  };

  // Export des données
  const handleExport = () => {
    // TODO: Implémenter l'export
    toast.info('Fonctionnalité d\'export en cours de développement');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation des Notes</h1>
          <p className="text-gray-600">
            Visualisez et modifiez les notes des étudiants
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => fetchNotes(filters)}
            disabled={loading.notes}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.notes ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recherche et Filtres</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Masquer' : 'Afficher'} les filtres
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <form onSubmit={handleSubmit(onFiltersSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Matricule étudiant</Label>
                  <Controller
                    name="student_matricule"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Ex: 2024001"
                        value={field.value || ''}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nom étudiant</Label>
                  <Controller
                    name="student_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Nom ou prénom"
                        value={field.value || ''}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Code cours</Label>
                  <Controller
                    name="course_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Ex: MATH6"
                        value={field.value || ''}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trimestre</Label>
                  <Controller
                    name="trimestre"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={[
                          { value: '', label: 'Tous les trimestres' },
                          { value: 'T1', label: 'Premier Trimestre' },
                          { value: 'T2', label: 'Deuxième Trimestre' },
                          { value: 'T3', label: 'Troisième Trimestre' }
                        ]}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Controller
                    name="niveau"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={[
                          { value: '', label: 'Tous les niveaux' },
                          { value: '6eme', label: '6ème' },
                          { value: '5eme', label: '5ème' },
                          { value: '4eme', label: '4ème' },
                          { value: '3eme', label: '3ème' },
                          { value: '2nde', label: '2nde' },
                          { value: '1ere', label: '1ère' },
                          { value: 'Tle', label: 'Terminale' }
                        ]}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Controller
                    name="classe"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Ex: 6eme A"
                        value={field.value || ''}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Effacer
                </Button>
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Tableau des notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des Notes</CardTitle>
              <CardDescription>
                {pagination.total} notes trouvées
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading.notes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Chargement des notes...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className="border-b border-gray-200">
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                            onClick={header.column.getToggleSortingHandler()}
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
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-4 whitespace-nowrap">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Page {table.getState().pagination.pageIndex + 1} sur{' '}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Note</DialogTitle>
            <DialogDescription>
              Modifiez la note de {editingNote?.student.prenom} {editingNote?.student.nom} 
              pour le cours {editingNote?.course.nom}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note (sur {editingNote?.course.ponderation})</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={editingNote?.course.ponderation || 20}
                value={editValue}
                onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading.updating}>
              {loading.updating ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={!!deletingNote} onOpenChange={() => setDeletingNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la note de {deletingNote?.student.prenom} {deletingNote?.student.nom} 
              pour le cours {deletingNote?.course.nom} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNote}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading.deleting}
            >
              {loading.deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesList;
