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
    clearFilters,
    getTeacherCourses
  } = useNoteStore();

  const [showFilters, setShowFilters] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Toutes les classes' }
  ]);
  const [localFilters, setLocalFilters] = useState<NoteFiltersFormData>({
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
  });

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

  // Charger les notes et les classes au montage
  useEffect(() => {
    fetchNotes();
    loadAvailableClasses();
  }, [fetchNotes]);

  // Charger les classes depuis les cours du professeur
  const loadAvailableClasses = async () => {
    try {
      const courses = await getTeacherCourses();
      console.log('🏫 Cours du professeur:', courses);
      
      // Extraire les classes uniques depuis les cours
      const classesSet = new Set<string>();
      courses.forEach((course: any) => {
        const className = course.classroom?.name || course.classroomName;
        if (className) {
          classesSet.add(className);
        }
      });
      
      const classOptions = [
        { value: '', label: 'Toutes les classes' },
        ...Array.from(classesSet).sort().map(className => ({
          value: className,
          label: className
        }))
      ];
      
      console.log('🏫 Classes disponibles:', classOptions);
      setAvailableClasses(classOptions);
    } catch (error) {
      console.error('❌ Erreur chargement classes:', error);
    }
  };

  // Surveiller les changements du formulaire et appliquer automatiquement les filtres
  const formValues = watch();
  useEffect(() => {
    // Appliquer les filtres automatiquement avec un petit délai pour les champs texte
    const timeoutId = setTimeout(() => {
      const cleanedData: NoteFiltersFormData = {
        ...formValues,
        trimestre: formValues.trimestre === '' as any ? undefined : formValues.trimestre,
        niveau: formValues.niveau === '' as any ? undefined : formValues.niveau,
        classe: formValues.classe === '' as any ? undefined : formValues.classe,
      };
      setLocalFilters(cleanedData);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [formValues]);

  // Filtrer les notes côté client
  const filteredNotes = React.useMemo(() => {
    let filtered = [...notes];

    // Filtre par matricule étudiant
    if (localFilters.studentId) {
      const searchTerm = localFilters.studentId.toLowerCase();
      filtered = filtered.filter(note => 
        note.student?.matricule?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre par nom étudiant
    if (localFilters.studentName) {
      const searchTerm = localFilters.studentName.toLowerCase();
      filtered = filtered.filter(note => {
        const fullName = `${note.student?.firstName || ''} ${note.student?.lastName || ''}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
    }

    // Filtre par nom de cours
    if (localFilters.courseName) {
      const searchTerm = localFilters.courseName.toLowerCase();
      filtered = filtered.filter(note =>
        note.course?.titre?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre par trimestre (vérifie si au moins un des 3 trimestres correspond)
    if (localFilters.trimestre) {
      filtered = filtered.filter(note => {
        const trimestre = localFilters.trimestre;
        if (trimestre === 'T1') return note.trimestre_1 !== null && note.trimestre_1 !== undefined;
        if (trimestre === 'T2') return note.trimestre_2 !== null && note.trimestre_2 !== undefined;
        if (trimestre === 'T3') return note.trimestre_3 !== null && note.trimestre_3 !== undefined;
        return true;
      });
    }

    // Filtre par classe
    if (localFilters.classe) {
      filtered = filtered.filter(note =>
        note.student?.grade === localFilters.classe
      );
    }

    // Filtre par niveau (pour compatibilité si utilisé)
    if (localFilters.niveau) {
      filtered = filtered.filter(note =>
        note.student?.grade?.includes(localFilters.niveau || '')
      );
    }

    console.log(`🔍 Filtrage: ${notes.length} notes → ${filtered.length} après filtres`);
    return filtered;
  }, [notes, localFilters]);

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
              {student?.matricule} {student?.grade ? `• ${student?.grade}` : ''}
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

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Statut',
      cell: ({ getValue }) => {
        const status = getValue();
        
        if (!status) return <span className="text-gray-400">—</span>;
        
        const statusConfig: Record<string, { label: string; color: string }> = {
          PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
          APPROVED: { label: 'Validée', color: 'bg-green-100 text-green-800' },
          VALIDATED: { label: 'Validée', color: 'bg-green-100 text-green-800' },
          REJECTED: { label: 'Rejetée', color: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <Badge className={`${config.color} text-xs`}>
            {config.label}
          </Badge>
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

  // Configuration du tableau avec notes filtrées
  const table = useReactTable({
    data: filteredNotes,
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

  // Gestion des filtres (conservé pour la soumission manuelle si nécessaire)
  const onFiltersSubmit = (data: NoteFiltersFormData) => {
    console.log('📝 Application manuelle des filtres:', data);
    
    // Nettoyer les valeurs vides (convertir '' en undefined)
    const cleanedData: NoteFiltersFormData = {
      ...data,
      trimestre: data.trimestre === '' as any ? undefined : data.trimestre,
      niveau: data.niveau === '' as any ? undefined : data.niveau,
    };
    
    setLocalFilters(cleanedData);
    setFilters(cleanedData);
    // Ne pas fermer automatiquement pour permettre d'ajuster les filtres
  };

  const handleClearFilters = () => {
    console.log('🗑️ Effacement des filtres');
    const emptyFilters: NoteFiltersFormData = {
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
    };
    setLocalFilters(emptyFilters);
    clearFilters();
    reset();
    setShowFilters(false);
  };

  // Export des données
  const handleExport = () => {
    toast.info('Fonctionnalité d\'export en cours de développement');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Consultation des Notes</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Visualisez et modifiez les notes des étudiants
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => fetchNotes(filters)}
            disabled={loading.notes}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${loading.notes ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Recherche et Filtres</CardTitle>
              {(localFilters.studentId || localFilters.studentName || localFilters.courseName || 
                localFilters.trimestre || localFilters.classe || localFilters.niveau) && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  Filtres actifs
                </Badge>
              )}
            </div>
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
            <div className="space-y-4">
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
                  <Label>Classe</Label>
                  <Controller
                    name="classe"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={availableClasses}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une classe..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Salle</Label>
                  <Input
                    {...register('niveau')}
                    placeholder="Ex: Salle A"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <p className="text-sm text-gray-600">
                  {filteredNotes.length} résultat{filteredNotes.length > 1 ? 's' : ''} {filteredNotes.length !== notes.length && `sur ${notes.length}`}
                </p>
                <Button type="button" variant="outline" onClick={handleClearFilters} size="sm">
                  Effacer tous les filtres
                </Button>
              </div>
            </div>
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
                {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''} trouvée{filteredNotes.length > 1 ? 's' : ''}
                {filteredNotes.length !== notes.length && ` (sur ${notes.length} au total)`}
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
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune note trouvée</p>
            </div>
          ) : (
            <>
              {/* Vue Desktop - Tableau */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Vue Mobile - Cartes */}
              <div className="md:hidden space-y-3">
                {table.getRowModel().rows.map(row => {
                  const note = row.original;
                  const t1 = note.trimestre_1;
                  const t2 = note.trimestre_2;
                  const t3 = note.trimestre_3;
                  const notes = [t1, t2, t3].filter((n): n is number => n !== null && n !== undefined);
                  const moyenne = notes.length > 0 ? notes.reduce((sum, n) => sum + n, 0) / notes.length : null;
                  const ponderation = note.course?.ponderation || 100;
                  
                  return (
                    <div key={row.id} className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                      {/* Étudiant */}
                      <div className="mb-2">
                        <div className="font-semibold text-gray-900 text-sm">
                          {note.student?.firstName} {note.student?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {note.student?.matricule} {note.student?.grade ? `• ${note.student?.grade}` : ''}
                        </div>
                      </div>
                      
                      {/* Cours */}
                      <div className="mb-2 pb-2 border-b">
                        <div className="text-sm font-medium text-gray-900">{note.course?.titre}</div>
                        <div className="text-xs text-gray-500">Pond. {note.course?.ponderation}</div>
                      </div>
                      
                      {/* Notes par trimestre */}
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">T1</div>
                          {t1 !== null && t1 !== undefined ? (
                            <div className="text-sm font-bold text-gray-900">
                              {t1.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">—</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">T2</div>
                          {t2 !== null && t2 !== undefined ? (
                            <div className="text-sm font-bold text-gray-900">
                              {t2.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">—</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">T3</div>
                          {t3 !== null && t3 !== undefined ? (
                            <div className="text-sm font-bold text-gray-900">
                              {t3.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">—</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Moyenne et statut */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <div className="text-xs text-gray-600">Moyenne</div>
                          {moyenne !== null ? (
                            <div className="text-sm font-bold text-indigo-600">
                              {moyenne.toFixed(2)} ({((moyenne / ponderation) * 100).toFixed(0)}%)
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">—</div>
                          )}
                        </div>
                        {note.status && (
                          <Badge className={
                            note.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            (note.status === 'APPROVED' || note.status === 'VALIDATED') ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {note.status === 'PENDING' ? 'En attente' : 
                             (note.status === 'APPROVED' || note.status === 'VALIDATED') ? 'Validée' : 
                             'Rejetée'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div className="text-sm text-gray-700">
                  Page {table.getState().pagination.pageIndex + 1} sur{' '}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
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
