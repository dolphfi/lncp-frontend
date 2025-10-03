/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NoteFiltersFormData } from '../../../types/note';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  BookOpen
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

import { useNoteStore } from '../../../stores/noteStore';
import { noteFiltersSchema } from '../../../schemas/noteSchema';
import { Note } from '../../../types/note';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

const columnHelper = createColumnHelper<Note>();

const NotesList: React.FC = () => {
  const {
    notes,
    loading,
    filters,
    pagination,
    fetchNotes,
    setFilters,
    clearFilters
  } = useNoteStore();

  const [showFilters, setShowFilters] = useState(false);

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
      search: undefined,
      studentId: undefined,
      studentName: undefined,
      courseId: undefined,
      courseName: undefined,
      trimestre: undefined,
      niveau: undefined,
      classe: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minNote: undefined,
      maxNote: undefined
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
              {student?.firstName} {student?.lastName}
            </span>
            <span className="text-sm text-gray-500">
              {student?.studentId} • {student?.grade}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = `${rowA.original.student?.firstName} ${rowA.original.student?.lastName}`;
        const nameB = `${rowB.original.student?.firstName} ${rowB.original.student?.lastName}`;
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
            <span className="font-medium text-gray-900">{course?.titre}</span>
            <span className="text-sm text-gray-500">
              Pond. {course?.ponderation}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const titreA = rowA.original.course?.titre || '';
        const titreB = rowB.original.course?.titre || '';
        return titreA.localeCompare(titreB);
      }
    }),

    // Trimestre 1
    columnHelper.accessor((row) => row.trimestre_1, {
      id: 'trimestre_1',
      header: () => (
        <div className="text-center">
          <div className="font-bold">Trimestre 1</div>
        </div>
      ),
      cell: ({ getValue, row }) => {
        const note = getValue();
        const ponderation = row.original.course?.ponderation || 100;
        
        if (note === null || note === undefined) {
          return <span className="text-gray-400 text-center block">—</span>;
        }
        
        const percentage = ponderation > 0 ? (note / ponderation) * 100 : 0;
        let colorClass = 'text-gray-900';
        if (percentage >= 80) colorClass = 'text-green-600';
        else if (percentage >= 60) colorClass = 'text-yellow-600';
        else if (percentage < 50) colorClass = 'text-red-600';

        return (
          <div className="flex flex-col text-center">
            <span className={`font-bold ${colorClass}`}>
              {note.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      }
    }),

    // Trimestre 2
    columnHelper.accessor((row) => row.trimestre_2, {
      id: 'trimestre_2',
      header: () => (
        <div className="text-center">
          <div className="font-bold">Trimestre 2</div>
        </div>
      ),
      cell: ({ getValue, row }) => {
        const note = getValue();
        const ponderation = row.original.course?.ponderation || 100;
        
        if (note === null || note === undefined) {
          return <span className="text-gray-400 text-center block">—</span>;
        }
        
        const percentage = ponderation > 0 ? (note / ponderation) * 100 : 0;
        let colorClass = 'text-gray-900';
        if (percentage >= 80) colorClass = 'text-green-600';
        else if (percentage >= 60) colorClass = 'text-yellow-600';
        else if (percentage < 50) colorClass = 'text-red-600';

        return (
          <div className="flex flex-col text-center">
            <span className={`font-bold ${colorClass}`}>
              {note.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      }
    }),

    // Trimestre 3
    columnHelper.accessor((row) => row.trimestre_3, {
      id: 'trimestre_3',
      header: () => (
        <div className="text-center">
          <div className="font-bold">Trimestre 3</div>
        </div>
      ),
      cell: ({ getValue, row }) => {
        const note = getValue();
        const ponderation = row.original.course?.ponderation || 100;
        
        if (note === null || note === undefined) {
          return <span className="text-gray-400 text-center block">—</span>;
        }
        
        const percentage = ponderation > 0 ? (note / ponderation) * 100 : 0;
        let colorClass = 'text-gray-900';
        if (percentage >= 80) colorClass = 'text-green-600';
        else if (percentage >= 60) colorClass = 'text-yellow-600';
        else if (percentage < 50) colorClass = 'text-red-600';

        return (
          <div className="flex flex-col text-center">
            <span className={`font-bold ${colorClass}`}>
              {note.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      }
    }),

    columnHelper.accessor('createdAt', {
      id: 'createdAt',
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

    // Moyenne générale (optionnelle)
    columnHelper.display({
      id: 'moyenne',
      header: () => (
        <div className="text-center">
          <div className="font-bold">Moyenne</div>
        </div>
      ),
      cell: ({ row }) => {
        const t1 = row.original.trimestre_1;
        const t2 = row.original.trimestre_2;
        const t3 = row.original.trimestre_3;
        
        // Calculer la moyenne des trimestres saisis
        const notes = [t1, t2, t3].filter((n): n is number => n !== null && n !== undefined);
        if (notes.length === 0) {
          return <span className="text-gray-400 text-center block">—</span>;
        }
        
        const moyenne = notes.reduce((sum, n) => sum + n, 0) / notes.length;
        const ponderation = row.original.course?.ponderation || 100;
        const percentage = ponderation > 0 ? (moyenne / ponderation) * 100 : 0;
        
        let colorClass = 'text-gray-900';
        if (percentage >= 80) colorClass = 'text-green-600';
        else if (percentage >= 60) colorClass = 'text-yellow-600';
        else if (percentage < 50) colorClass = 'text-red-600';

        return (
          <div className="flex flex-col text-center">
            <span className={`font-bold ${colorClass}`}>
              {moyenne.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
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
    setFilters(data);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    reset();
    setShowFilters(false);
  };

  // Export des données
  const handleExport = () => {
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
                  <Input
                    {...register('studentId')}
                    placeholder="Ex: 23N2001"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nom étudiant</Label>
                  <Input
                    {...register('studentName')}
                    placeholder="Nom ou prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nom du cours</Label>
                  <Input
                    {...register('courseName')}
                    placeholder="Ex: Mathématiques"
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
                          { value: 'NSI', label: 'NS I' },
                          { value: 'NSII', label: 'NS II' },
                          { value: 'NSIII', label: 'NS III' },
                          { value: 'NSIV', label: 'NS IV' }
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
                  <Input
                    {...register('classe')}
                    placeholder="Ex: NSII A"
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
    </div>
  );
};

export default NotesList;
