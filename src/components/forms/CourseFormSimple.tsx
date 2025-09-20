/**
 * =====================================================
 * FORMULAIRE AMÉLIORÉ POUR LES COURS (BACKEND COMPATIBLE)
 * =====================================================
 * Formulaire avec design amélioré et sélection des classes
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BookOpen, Users, Weight, GraduationCap } from 'lucide-react';
import { createCourseApiSchema, CreateCourseApiFormData, COURSE_CATEGORY_OPTIONS } from '../../schemas/courseSchema';
import { Course } from '../../types/course';
import { studentsService } from '../../services/students/studentsService';
import { getApiUrl } from '../../config/api';
import axios from 'axios';
import authService from '../../services/authService';

// =====================================================
// TYPES ET INTERFACES
// =====================================================
interface CourseFormSimpleProps {
  course?: Course;
  onSubmit: (data: CreateCourseApiFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

interface Classroom {
  id: string;
  name: string;
  description?: string;
  rooms?: any[];
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const CourseFormSimple: React.FC<CourseFormSimpleProps> = ({
  course,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  // =====================================================
  // ÉTATS LOCAUX
  // =====================================================
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  // =====================================================
  // CONFIGURATION DU FORMULAIRE
  // =====================================================
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateCourseApiFormData>({
    resolver: zodResolver(createCourseApiSchema),
    defaultValues: {
      titre: course?.titre || '',
      description: course?.description || '',
      categorie: (course?.categorie as any) || 'Mathematiques',
      ponderation: course?.ponderation || 100,
      classroomId: course?.classroomId || ''
    }
  });

  const watchedCategory = watch('categorie');
  const watchedClassroom = watch('classroomId');

  // =====================================================
  // CHARGEMENT DES CLASSES
  // =====================================================
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoadingClassrooms(true);
        
        // Utiliser l'API configurée pour récupérer les classes
        const url = getApiUrl('/classroom/all-classroom');
        const response = await axios.get(url, {
          params: { page: 1, limit: 100 },
          headers: {
            Authorization: `Bearer ${authService.getAccessToken()}`
          }
        });
        const data = response.data;
        
        // Extraire les classes principales (NSI, NSII, etc.) depuis data.data
        const convertedClassrooms: Classroom[] = data.data.map((classroom: any) => ({
          id: classroom.id,
          name: classroom.name, // NSI, NSII, NSIII, NSIV
          description: classroom.description,
          rooms: classroom.rooms
        }));
        
        setClassrooms(convertedClassrooms);
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
      } finally {
        setLoadingClassrooms(false);
      }
    };

    fetchClassrooms();
  }, []);

  // =====================================================
  // GESTION DE LA SOUMISSION
  // =====================================================
  const onFormSubmit = (data: CreateCourseApiFormData) => {
    onSubmit(data);
  };

  // =====================================================
  // RENDU DU COMPOSANT
  // =====================================================
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* En-tête avec icône */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {mode === 'edit' ? 'Modifier le cours' : 'Nouveau cours'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Remplissez les informations du cours
          </p>
        </div>
      </div>

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Titre du cours */}
      <div className="space-y-2">
        <Label htmlFor="titre">Titre du cours *</Label>
        <Input
          id="titre"
          {...register('titre')}
          placeholder="Ex: Algèbre de Bool"
          className={errors.titre ? 'border-red-500' : ''}
        />
        {errors.titre && (
          <p className="text-sm text-red-500">{errors.titre.message}</p>
        )}
      </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description détaillée du cours..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Weight className="h-4 w-4" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select
                value={watchedCategory}
                onValueChange={(value) => setValue('categorie', value as any)}
              >
                <SelectTrigger className={errors.categorie ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent 
                  position="popper"
                  sideOffset={4}
                  className="max-h-[200px] overflow-y-auto z-50"
                >
                  {COURSE_CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie && (
                <p className="text-sm text-red-500">{errors.categorie.message}</p>
              )}
            </div>

            {/* Pondération */}
            <div className="space-y-2">
              <Label htmlFor="ponderation">Pondération *</Label>
              <Input
                id="ponderation"
                type="number"
                min="50"
                max="1000"
                {...register('ponderation', { valueAsNumber: true })}
                placeholder="200"
                className={errors.ponderation ? 'border-red-500' : ''}
              />
              {errors.ponderation && (
                <p className="text-sm text-red-500">{errors.ponderation.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélection de classe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Classe d'affectation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Classe *</Label>
            <Select
              value={watchedClassroom}
              onValueChange={(value) => setValue('classroomId', value)}
            >
              <SelectTrigger className={errors.classroomId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingClassrooms ? "Chargement..." : "Sélectionner une classe"} />
              </SelectTrigger>
              <SelectContent 
                position="popper"
                sideOffset={4}
                className="max-h-[200px] overflow-y-auto z-50"
              >
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classroomId && (
              <p className="text-sm text-red-500">{errors.classroomId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
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
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            mode === 'edit' ? 'Modification...' : 'Création...'
          ) : (
            mode === 'edit' ? 'Modifier' : 'Créer le cours'
          )}
        </Button>
      </div>
    </form>
  );
};
