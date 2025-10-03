import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { useNoteStore } from '../../../stores/noteStore';
import { noteCreateSchema, NoteCreateFormData } from '../../../schemas/noteSchema';
import authService from '../../../services/authService';
import SearchableSelect, { Option } from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';

const NoteEntry: React.FC = () => {
  const {
    createNote,
    getMyStudents,
    getTeacherCourses,
    getAllCoursesWithClassFilter,
    getAllClassrooms,
    loading
  } = useNoteStore();

  const [allStudents, setAllStudents] = useState<any[]>([]); // Tous les élèves chargés
  const [studentOptions, setStudentOptions] = useState<Option[]>([]);
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [classroomOptions, setClassroomOptions] = useState<Option[]>([]);
  const [loadedCourses, setLoadedCourses] = useState<any[]>([]); // Stocker les cours avec toutes leurs infos
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string | undefined>(undefined);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    setError,
    clearErrors
  } = useForm<NoteCreateFormData>({
    resolver: yupResolver(noteCreateSchema),
    mode: 'onChange',
    defaultValues: {
      studentId: '',
      courseId: '',
      trimestre: 'T1' as const,
      note: undefined as any
    }
  });

  const watchedNote = watch('note');

  // Validation en temps réel de la note
  useEffect(() => {
    // Si pas de note saisie, ne rien faire (la validation Yup "required" s'en charge)
    if (watchedNote === undefined || watchedNote === null) {
      return;
    }

    const noteValue = typeof watchedNote === 'string' ? parseFloat(watchedNote) : watchedNote;

    // Vérifier si c'est un nombre valide
    if (isNaN(noteValue)) {
      setError('note', {
        type: 'manual',
        message: 'La note doit être un nombre valide'
      });
      return;
    }

    // Vérifier si la note est négative
    if (noteValue < 0) {
      setError('note', {
        type: 'manual',
        message: 'La note ne peut pas être négative'
      });
      return;
    }

    // Vérifier le nombre de décimales
    const decimalPlaces = (noteValue.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      setError('note', {
        type: 'manual',
        message: 'La note ne peut avoir plus de 2 décimales'
      });
      return;
    }

    // Vérifier si la note dépasse la pondération du cours
    if (selectedCourse && noteValue > selectedCourse.ponderation) {
      setError('note', {
        type: 'manual',
        message: `La note ne peut pas dépasser ${selectedCourse.ponderation} (pondération du cours)`
      });
      return;
    }

    // Si toutes les validations passent, effacer les erreurs manuelles
    if (errors.note?.type === 'manual') {
      clearErrors('note');
    }
  }, [watchedNote, selectedCourse, setError, clearErrors, errors.note]);

  // Charger les élèves au montage du composant
  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const students = await getMyStudents();
        setAllStudents(students); // Stocker tous les élèves
        
        // Créer les options (filtrées ou non selon selectedClassroom)
        const filteredStudents = selectedClassroom
          ? students.filter((s: any) => s.classroom?.id === selectedClassroom)
          : students;
        
        const options: Option[] = filteredStudents.map((student: any) => ({
          value: student.id,
          label: `${student.matricule} - ${student.firstName} ${student.lastName}`,
          description: `${student.classroom?.name || 'N/A'} • ${student.room?.name || 'N/A'}`
        }));
        setStudentOptions(options);
      } catch (error) {
        console.error('Erreur lors du chargement des élèves:', error);
        toast.error('Erreur lors du chargement des élèves');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [getMyStudents]);

  // Récupérer le rôle de l'utilisateur depuis authService
  useEffect(() => {
    const user = authService.getUser();
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, []);

  // Charger les classes pour le filtre (uniquement pour les non-TEACHER)
  useEffect(() => {
    const loadClassrooms = async () => {
      if (userRole && userRole !== 'TEACHER') {
        setLoadingClassrooms(true);
        try {
          const classrooms = await getAllClassrooms();
          const options: Option[] = classrooms.map((classroom: any) => ({
            value: classroom.id,
            label: classroom.name,
            description: classroom.description || `Classe ${classroom.name}`
          }));
          setClassroomOptions(options);
        } catch (error) {
          console.error('Erreur lors du chargement des classes:', error);
        } finally {
          setLoadingClassrooms(false);
        }
      }
    };

    loadClassrooms();
  }, [userRole, getAllClassrooms]);

  // Sélection d'élève
  const handleStudentSelect = async (studentId: string | number | undefined) => {
    if (!studentId) {
      setSelectedStudent(null);
      setValue('studentId', '');
      return;
    }

    try {
      // Récupérer l'élève depuis allStudents (qui contient tous les détails)
      const fullStudent = allStudents.find((s: any) => s.id === studentId);
      
      if (fullStudent) {
        setSelectedStudent(fullStudent);
        setValue('studentId', fullStudent.id);

        // Charger les cours seulement si nécessaire
        // - Pour TEACHER : toujours charger depuis dashboard
        // - Pour autres : seulement si les cours ne sont pas déjà chargés via le filtre de classe
        const needsLoadCourses = 
          userRole === 'TEACHER' || 
          (!selectedClassroom && loadedCourses.length === 0);
        
        if (needsLoadCourses) {
          await loadCoursesForStudent(fullStudent);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'élève:', error);
    }
  };

  // Charger les cours selon le rôle de l'utilisateur
  const loadCoursesForStudent = async (student: any) => {
    setLoadingCourses(true);
    try {
      let courses: any[] = [];

      if (userRole === 'TEACHER') {
        // Pour les TEACHER : utiliser /dashboard pour leurs cours uniquement
        courses = await getTeacherCourses();
      } else {
        // Pour les autres rôles : utiliser /courses/all-courses avec filtre par classe
        const classroomId = selectedClassroom || student.classroom?.id;
        if (classroomId) {
          courses = await getAllCoursesWithClassFilter(classroomId);
        } else {
          courses = await getAllCoursesWithClassFilter();
        }
      }

      // Stocker les cours avec toutes leurs informations
      setLoadedCourses(courses);

      const options: Option[] = courses.map((course: any) => ({
        value: course.id,
        label: `${course.code || ''} - ${course.titre}`,
        description: course.categorie || course.code || 'N/A'
      }));
      setCourseOptions(options);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoadingCourses(false);
    }
  };

  // Filtrer les élèves et charger les cours quand la classe sélectionnée change
  useEffect(() => {
    if (userRole !== 'TEACHER' && selectedClassroom) {
      // Filtrer les élèves par classe
      const filteredStudents = allStudents.filter(
        (s: any) => s.classroom?.id === selectedClassroom
      );
      
      const options: Option[] = filteredStudents.map((student: any) => ({
        value: student.id,
        label: `${student.matricule} - ${student.firstName} ${student.lastName}`,
        description: `${student.classroom?.name || 'N/A'} • ${student.room?.name || 'N/A'}`
      }));
      setStudentOptions(options);
      
      // Charger les cours filtrés par cette classe
      const loadFilteredCourses = async () => {
        setLoadingCourses(true);
        try {
          const courses = await getAllCoursesWithClassFilter(selectedClassroom);
          setLoadedCourses(courses);
          
          const courseOpts: Option[] = courses.map((course: any) => ({
            value: course.id,
            label: `${course.code || ''} - ${course.titre}`,
            description: course.categorie || course.code || 'N/A'
          }));
          setCourseOptions(courseOpts);
        } catch (error) {
          console.error('Erreur lors du chargement des cours:', error);
          toast.error('Erreur lors du chargement des cours');
        } finally {
          setLoadingCourses(false);
        }
      };
      
      loadFilteredCourses();
    } else if (userRole !== 'TEACHER' && !selectedClassroom) {
      // Réafficher tous les élèves si le filtre est effacé
      const options: Option[] = allStudents.map((student: any) => ({
        value: student.id,
        label: `${student.matricule} - ${student.firstName} ${student.lastName}`,
        description: `${student.classroom?.name || 'N/A'} • ${student.room?.name || 'N/A'}`
      }));
      setStudentOptions(options);
      
      // Réinitialiser les cours
      setCourseOptions([]);
      setLoadedCourses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassroom, allStudents, userRole]);

  // Sélection de cours
  const handleCourseSelect = async (courseId: string | number | undefined) => {
    if (!courseId) {
      setSelectedCourse(null);
      setValue('courseId', '');
      return;
    }

    try {
      // Chercher dans les cours déjà chargés (qui ont toutes les infos avec pondération)
      const fullCourse = loadedCourses.find((c: any) => c.id === courseId);

      if (fullCourse) {
        setSelectedCourse(fullCourse);
        setValue('courseId', fullCourse.id);
      } else {
        toast.error('Erreur lors de la sélection du cours');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du cours:', error);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: NoteCreateFormData) => {
    try {
      const success = await createNote(data);
      if (success) {
        // Réinitialiser le formulaire et les états
        reset();
        setSelectedStudent(null);
        setSelectedCourse(null);
        setCourseOptions([]);
        setLoadedCourses([]);
        // Le toast de succès est géré par le store
      }
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      // Le toast d'erreur est géré par le store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saisie de Notes</h1>
          <p className="text-gray-600">Ajouter une nouvelle note pour un élève</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Nouvelle Note</span>
          </CardTitle>
          <CardDescription>
            Saisissez les informations de la note. La validation se fait en temps réel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Filtre par classe (uniquement pour les non-TEACHER) */}
            {userRole && userRole !== 'TEACHER' && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="classroomFilter">Filtrer les cours par classe (optionnel)</Label>
                <SearchableSelect
                  options={classroomOptions}
                  value={selectedClassroom}
                  onValueChange={(value) => setSelectedClassroom(value as string | undefined)}
                  placeholder="Toutes les classes..."
                  searchPlaceholder="Rechercher une classe..."
                  loading={loadingClassrooms}
                  clearable
                />
                <p className="text-sm text-gray-500">
                  Sélectionnez une classe pour filtrer les cours disponibles
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection de l'élève */}
              <div className="space-y-2">
                <Label htmlFor="student">Élève *</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={studentOptions}
                      value={field.value}
                      onValueChange={handleStudentSelect}
                      placeholder="Sélectionner un élève..."
                      searchPlaceholder="Rechercher par matricule, nom ou prénom..."
                      loading={loadingStudents}
                      clearable
                      className={errors.studentId ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.studentId && (
                  <p className="text-sm text-red-600">{errors.studentId.message}</p>
                )}
              </div>

              {/* Sélection du cours */}
              <div className="space-y-2">
                <Label htmlFor="course">Cours *</Label>
                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={courseOptions}
                      value={field.value}
                      onValueChange={handleCourseSelect}
                      placeholder="Sélectionner un cours..."
                      searchPlaceholder="Titre du cours..."
                      loading={loadingCourses}
                      clearable
                      disabled={!selectedStudent}
                      className={errors.courseId ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.courseId && (
                  <p className="text-sm text-red-600">{errors.courseId.message}</p>
                )}
                {!selectedStudent && (
                  <p className="text-sm text-gray-500">
                    Sélectionnez d'abord un élève
                  </p>
                )}
              </div>

              {/* Sélection du trimestre */}
              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre *</Label>
                <Controller
                  name="trimestre"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={[
                        { value: 'T1', label: 'Premier Trimestre', description: 'T1' },
                        { value: 'T2', label: 'Deuxième Trimestre', description: 'T2' },
                        { value: 'T3', label: 'Troisième Trimestre', description: 'T3' }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner le trimestre..."
                      className={errors.trimestre ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.trimestre && (
                  <p className="text-sm text-red-600">{errors.trimestre.message}</p>
                )}
              </div>

              {/* Saisie de la note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note *</Label>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedCourse?.ponderation || 1000}
                        placeholder="Ex: 15.5"
                        value={field.value || ''}
                        className={errors.note ? 'border-red-500' : ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                      {selectedCourse && !errors.note && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          /{selectedCourse.ponderation}
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.note && (
                  <p className="text-sm text-red-600">{errors.note.message}</p>
                )}
                {selectedCourse && !errors.note && (
                  <p className="text-sm text-gray-500">
                    Note sur {selectedCourse.ponderation} (pondération du cours)
                  </p>
                )}
              </div>
            </div>

            {/* Informations sélectionnées */}
            {(selectedStudent || selectedCourse) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Informations sélectionnées</h3>

                {selectedStudent && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>Élève:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
                      ({selectedStudent.matricule}) - {selectedStudent.classroom?.name || 'N/A'}
                    </span>
                  </div>
                )}

                {selectedCourse && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>Cours:</strong> {selectedCourse.titre}
                      - Pondération: {selectedCourse.ponderation}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Validation et erreurs */}
            {selectedStudent && selectedCourse && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Rôle utilisateur: <strong>{userRole}</strong> -
                  {userRole === 'TEACHER'
                    ? ' Cours récupérés depuis votre dashboard personnel'
                    : ' Cours récupérés avec filtre par classe de l\'élève'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedStudent(null);
                  setSelectedCourse(null);
                  setCourseOptions([]);
                  setLoadedCourses([]);
                }}
              >
                Réinitialiser
              </Button>

              <Button
                type="submit"
                disabled={!isValid || loading.creating}
                className="min-w-[120px]"
              >
                {loading.creating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>En cours...</span>
                  </div>
                ) : (
                  'Ajouter'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteEntry;
