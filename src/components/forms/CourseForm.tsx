/**
 * =====================================================
 * FORMULAIRE DE CRÉATION/MODIFICATION DE COURS
 * =====================================================
 * Formulaire simplifié pour la gestion des cours
 * avec seulement les informations de base
 */

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { 
  BookOpen
} from 'lucide-react';

import { 
  createCourseSchema, 
  CreateCourseFormData,
  COURSE_CATEGORY_OPTIONS,
  GRADE_OPTIONS,
  COURSE_STATUS_OPTIONS
} from '../../schemas/courseSchema';

import { Course } from '../../types/course';

// =====================================================
// TYPES ET INTERFACES
// =====================================================
type CourseFormData = CreateCourseFormData;

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormData, courseId?: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const CourseForm: React.FC<CourseFormProps> = ({
  course,
  onSubmit,
  onCancel,
  loading = false,
  mode = course ? 'edit' : 'create'
}) => {
  // =====================================================
  // HOOKS ET ÉTAT
  // =====================================================
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      category: 'mathématiques',
      weight: 200,
      grade: 'NSI',
      schedule: [],
      prerequisites: [],
      objectives: [''],
      materials: [''],
      syllabus: '',
      status: 'actif',
      enrollmentStartDate: new Date().toISOString().split('T')[0],
      enrollmentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  // =====================================================
  // EFFET POUR PRÉREMPLIR LE FORMULAIRE EN MODE ÉDITION
  // =====================================================
  useEffect(() => {
    if (mode === 'edit' && course) {
      const courseData = {
        code: course.code,
        title: course.title,
        description: course.description,
        category: course.category,
        weight: course.weight,
        grade: course.grade,
        schedule: course.schedule,
        prerequisites: course.prerequisites,
        objectives: course.objectives,
        materials: course.materials,
        syllabus: course.syllabus,
        status: course.status,
        enrollmentStartDate: course.enrollmentStartDate.split('T')[0],
        enrollmentEndDate: course.enrollmentEndDate.split('T')[0],
        startDate: course.startDate.split('T')[0],
        endDate: course.endDate.split('T')[0]
      } as CourseFormData;
      
      reset(courseData);
    }
  }, [mode, course, reset]);

  // =====================================================
  // GESTION DE LA SOUMISSION
  // =====================================================
  const onFormSubmit = (data: CourseFormData) => {
    // Utiliser des valeurs par défaut pour les champs non présents dans le formulaire simplifié
    const formData = {
      ...data,
      schedule: [{ day: 'lundi' as const, startTime: '08:00', endTime: '10:00' }],
      prerequisites: [],
      objectives: ['Objectif principal du cours'],
      materials: ['Matériel de base'],
      syllabus: 'Programme détaillé du cours',
      enrollmentStartDate: new Date().toISOString().split('T')[0],
      enrollmentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    if (mode === 'edit' && course) {
      onSubmit(formData, course.id);
    } else {
      onSubmit(formData);
    }
  };

  // =====================================================
  // COMPOSANT DE CHAMP AVEC LABEL
  // =====================================================
  const FormField = ({ 
    label, 
    required = false, 
    error, 
    children 
  }: { 
    label: string; 
    required?: boolean; 
    error?: string; 
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );

  // =====================================================
  // RENDU DU FORMULAIRE
  // =====================================================
  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* =====================================================
            SECTION: INFORMATIONS DU COURS
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Informations du Cours
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Code, Titre */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Code du cours" required error={errors.code?.message as string}>
                <Input
                  {...register('code')}
                  placeholder="Ex: MATH101"
                  className="w-full"
                />
              </FormField>
              
              <FormField label="Titre du cours" required error={errors.title?.message as string}>
                <Input
                  {...register('title')}
                  placeholder="Ex: Algèbre Fondamentale"
                  className="w-full"
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Description" required error={errors.description?.message as string}>
              <Textarea
                {...register('description')}
                placeholder="Description détaillée du cours..."
                rows={3}
                className="w-full"
              />
            </FormField>

            {/* Ligne 2: Catégorie, Pondération, Classe */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Catégorie" required error={errors.category?.message as string}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_CATEGORY_OPTIONS
                          .filter((option: any) => option.value && option.value.trim() !== '')
                          .map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Pondération" required error={errors.weight?.message as string}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une pondération" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Coefficient du cours (100, 200, 300, 400, 500)
                </p>
              </FormField>

              <FormField label="Classe" required error={errors.grade?.message as string}>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS
                          .filter((option: any) => option.value && option.value.trim() !== '')
                          .map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            {/* Statut */}
            <FormField label="Statut" required error={errors.status?.message as string}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_STATUS_OPTIONS
                        .filter((option: any) => option.value && option.value.trim() !== '')
                        .map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* =====================================================
            ACTIONS DU FORMULAIRE
        ===================================================== */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={loading || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading || isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'edit' ? 'Modification...' : 'Création...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {mode === 'edit' ? 'Modifier le cours' : 'Créer le cours'}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}; 