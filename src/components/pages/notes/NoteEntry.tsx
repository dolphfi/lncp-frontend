/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { useAcademicStore } from '../../../stores/academicStore';
import { noteCreateSchema, NoteCreateFormData } from '../../../schemas/academicSchemas';
import { Student, Course } from '../../../types/academic';
import SearchableSelect, { Option } from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';

const NoteEntry: React.FC = () => {
  const {
    createNote,
    searchStudents,
    searchCourses,
    getStudentByMatricule,
    getCourseByCode,
    loading
  } = useAcademicStore();

  const [studentOptions, setStudentOptions] = useState<Option[]>([]);
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchingCourse, setSearchingCourse] = useState(false);

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
      student_id: 0,
      course_id: 0,
      trimestre: 'T1' as const,
      note: 0
    }
  });

  const watchedNote = watch('note');
  const watchedStudentId = watch('student_id');
  const watchedCourseId = watch('course_id');

  // Validation en temps réel de la note par rapport à la pondération
  useEffect(() => {
    if (selectedCourse && watchedNote && watchedNote > selectedCourse.ponderation) {
      setError('note', {
        type: 'manual',
        message: `La note ne peut pas dépasser ${selectedCourse.ponderation} (pondération du cours)`
      });
    } else if (errors.note?.type === 'manual') {
      clearErrors('note');
    }
  }, [watchedNote, selectedCourse, setError, clearErrors, errors.note]);

  // Recherche d'étudiants
  const handleStudentSearch = async (query: string) => {
    if (query.length < 2) {
      setStudentOptions([]);
      return;
    }

    setSearchingStudent(true);
    try {
      const students = await searchStudents(query);
      const options: Option[] = students.map(student => ({
        value: student.id,
        label: `${student.matricule} - ${student.prenom} ${student.nom}`,
        description: `${student.classe} • ${student.niveau}`
      }));
      setStudentOptions(options);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'étudiants:', error);
    } finally {
      setSearchingStudent(false);
    }
  };

  // Recherche de cours
  const handleCourseSearch = async (query: string) => {
    if (query.length < 2) {
      setCourseOptions([]);
      return;
    }

    setSearchingCourse(true);
    try {
      const niveau = selectedStudent?.niveau;
      const courses = await searchCourses(query, niveau);
      const options: Option[] = courses.map(course => ({
        value: course.id,
        label: `${course.code} - ${course.nom}`,
        description: `Pondération: ${course.ponderation} • ${course.niveau}`
      }));
      setCourseOptions(options);
    } catch (error) {
      console.error('Erreur lors de la recherche de cours:', error);
    } finally {
      setSearchingCourse(false);
    }
  };

  // Sélection d'étudiant
  const handleStudentSelect = async (studentId: string | number | undefined) => {
    if (!studentId) {
      setSelectedStudent(null);
      setValue('student_id', 0);
      return;
    }

    try {
      const student = studentOptions.find(opt => opt.value === studentId);
      if (student) {
        // Récupérer les détails complets de l'étudiant
        const studentData = await getStudentByMatricule(student.label.split(' - ')[0]);
        if (studentData) {
          setSelectedStudent(studentData);
          setValue('student_id', studentData.id);
          
          // Réinitialiser la sélection de cours car le niveau a changé
          setSelectedCourse(null);
          setValue('course_id', 0);
          setCourseOptions([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'étudiant:', error);
    }
  };

  // Sélection de cours
  const handleCourseSelect = async (courseId: string | number | undefined) => {
    if (!courseId) {
      setSelectedCourse(null);
      setValue('course_id', 0);
      return;
    }

    try {
      const course = courseOptions.find(opt => opt.value === courseId);
      if (course) {
        // Récupérer les détails complets du cours
        const courseData = await getCourseByCode(course.label.split(' - ')[0]);
        if (courseData) {
          setSelectedCourse(courseData);
          setValue('course_id', courseData.id);
        }
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
        reset();
        setSelectedStudent(null);
        setSelectedCourse(null);
        setStudentOptions([]);
        setCourseOptions([]);
        toast.success('Note créée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
    }
  };

  // Recherche rapide par matricule
  const handleMatriculeSearch = async (matricule: string) => {
    if (matricule.length < 3) return;

    try {
      const student = await getStudentByMatricule(matricule);
      if (student) {
        setSelectedStudent(student);
        setValue('student_id', student.id);
        setStudentOptions([{
          value: student.id,
          label: `${student.matricule} - ${student.prenom} ${student.nom}`,
          description: `${student.classe} • ${student.niveau}`
        }]);
      }
    } catch (error) {
      // Erreur silencieuse pour la recherche rapide
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saisie de Notes</h1>
          <p className="text-gray-600">Ajouter une nouvelle note pour un étudiant</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection de l'étudiant */}
              <div className="space-y-2">
                <Label htmlFor="student">Étudiant *</Label>
                <Controller
                  name="student_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={studentOptions}
                      value={field.value}
                      onValueChange={handleStudentSelect}
                      onSearch={handleStudentSearch}
                      placeholder="Rechercher un étudiant..."
                      searchPlaceholder="Matricule, nom ou prénom..."
                      loading={searchingStudent}
                      clearable
                      className={errors.student_id ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.student_id && (
                  <p className="text-sm text-red-600">{errors.student_id.message}</p>
                )}
                
                {/* Recherche rapide par matricule */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Search className="h-4 w-4" />
                  <span>Ou tapez directement le matricule:</span>
                  <Input
                    placeholder="Ex: 2024001"
                    className="w-32"
                    onBlur={(e) => handleMatriculeSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Sélection du cours */}
              <div className="space-y-2">
                <Label htmlFor="course">Cours *</Label>
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={courseOptions}
                      value={field.value}
                      onValueChange={handleCourseSelect}
                      onSearch={handleCourseSearch}
                      placeholder="Rechercher un cours..."
                      searchPlaceholder="Code ou nom du cours..."
                      loading={searchingCourse}
                      clearable
                      disabled={!selectedStudent}
                      className={errors.course_id ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.course_id && (
                  <p className="text-sm text-red-600">{errors.course_id.message}</p>
                )}
                {!selectedStudent && (
                  <p className="text-sm text-gray-500">
                    Sélectionnez d'abord un étudiant
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
                        max={selectedCourse?.ponderation || 20}
                        placeholder="Ex: 15.5"
                        className={errors.note ? 'border-red-500' : ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                      {selectedCourse && (
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
                {selectedCourse && (
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
                      <strong>Étudiant:</strong> {selectedStudent.prenom} {selectedStudent.nom} 
                      ({selectedStudent.matricule}) - {selectedStudent.classe}
                    </span>
                  </div>
                )}
                
                {selectedCourse && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>Cours:</strong> {selectedCourse.nom} ({selectedCourse.code}) 
                      - Pondération: {selectedCourse.ponderation}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Validation et erreurs */}
            {selectedStudent && selectedCourse && selectedStudent.niveau !== selectedCourse.niveau && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Attention: Le niveau de l'étudiant ({selectedStudent.niveau}) ne correspond pas 
                  au niveau du cours ({selectedCourse.niveau}).
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
                  setStudentOptions([]);
                  setCourseOptions([]);
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
                    <span>Création...</span>
                  </div>
                ) : (
                  'Créer la Note'
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
