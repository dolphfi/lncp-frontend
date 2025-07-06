/**
 * =====================================================
 * COMPOSANT FORMULAIRE POUR LES ÉLÈVES
 * =====================================================
 * Ce composant gère la création et la modification des élèves
 * avec validation Zod et React Hook Form
 */

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, User, Mail, Phone, MapPin, GraduationCap, Users } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

import { 
  createStudentSchema,
  CreateStudentFormData,
  GRADE_OPTIONS,
  STATUS_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS
} from '../../schemas/studentSchema';
import { Student } from '../../types/student';

// =====================================================
// TYPES POUR LES PROPS DU COMPOSANT
// =====================================================

// Type unifié pour les données du formulaire
type StudentFormData = CreateStudentFormData;

interface StudentFormProps {
  student?: Student;                    // Élève à éditer (undefined pour création)
  onSubmit: (data: StudentFormData, studentId?: string) => void; // Callback avec les données et l'ID optionnel
  onCancel?: () => void;               // Callback pour annuler
  loading?: boolean;                   // État de chargement
  mode?: 'create' | 'edit';           // Mode du formulaire
}

// =====================================================
// COMPOSANT PRINCIPAL DU FORMULAIRE
// =====================================================
export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
  mode = student ? 'edit' : 'create'
}) => {
  
  // =====================================================
  // CONFIGURATION DU FORMULAIRE AVEC REACT HOOK FORM
  // =====================================================
  const {
    register,              // Fonction pour enregistrer les champs
    control,               // Contrôleur pour les champs personnalisés
    handleSubmit,          // Fonction pour gérer la soumission
    formState: { errors, isSubmitting }, // État du formulaire
    reset,                 // Fonction pour réinitialiser
    setValue,              // Fonction pour définir des valeurs
    watch                  // Fonction pour observer les valeurs
  } = useForm<StudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      grade: 'NSI',
      enrollmentDate: new Date().toISOString().split('T')[0],
      studentId: '',
      parentContact: {
        name: '',
        phone: '',
        email: '',
        relationship: 'père'
      },
      status: 'active',
      avatar: ''
    }
  });
  
  // =====================================================
  // EFFET POUR PRÉREMPLIR LE FORMULAIRE EN MODE ÉDITION
  // =====================================================
  useEffect(() => {
    if (mode === 'edit' && student) {
      // Préremplir tous les champs avec les données de l'élève
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth.split('T')[0], // Conversion pour l'input date
        gender: student.gender,
        address: student.address,
        grade: student.grade as any,
        enrollmentDate: student.enrollmentDate.split('T')[0],
        studentId: student.studentId,
        parentContact: {
          name: student.parentContact.name,
          phone: student.parentContact.phone,
          email: student.parentContact.email,
          relationship: student.parentContact.relationship as any
        },
        status: student.status,
        avatar: student.avatar || ''
      });
    }
  }, [mode, student, reset]);
  
  // =====================================================
  // GESTION DE LA SOUMISSION DU FORMULAIRE
  // =====================================================
  const onFormSubmit = (data: StudentFormData) => {
    if (mode === 'edit' && student) {
      // En mode édition, passer l'ID de l'élève avec les données
      onSubmit(data, student.id);
    } else {
      // En mode création, soumettre toutes les données
      onSubmit(data);
    }
  };
  
  // =====================================================
  // FONCTION POUR GÉNÉRER UN MATRICULE AUTOMATIQUEMENT
  // =====================================================
  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const grade = watch('grade');
    const gradeCode = grade ? grade.charAt(0).toUpperCase() : 'X';
    const generatedId = `${year}${gradeCode}${random}`;
    setValue('studentId', generatedId);
  };
  
  // =====================================================
  // RENDU DU COMPOSANT
  // =====================================================
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* En-tête du formulaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === 'create' ? 'Nouvel Élève' : 'Modifier Élève'}
          </CardTitle>
          {mode === 'edit' && student && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{student.studentId}</Badge>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {STATUS_OPTIONS.find(s => s.value === student.status)?.label}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>
      
      {/* Section : Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-4 w-4" />
            Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1 : Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('firstName')}
                placeholder="Prénom de l'élève"
                disabled={loading}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('lastName')}
                placeholder="Nom de famille"
                disabled={loading}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          {/* Ligne 2 : Email et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="email@example.com"
                disabled={loading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Téléphone <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="+509 1234-5678"
                disabled={loading}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
          
          {/* Ligne 3 : Date de naissance */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <CalendarDays className="inline h-4 w-4 mr-1" />
              Date de naissance <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('dateOfBirth')}
              type="date"
              disabled={loading}
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>
          
          {/* Ligne 4 : Sexe */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sexe <span className="text-red-500">*</span>
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={loading}
                  className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? 'border-red-500' : ''}`}
                >
                  {GENDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
            )}
          </div>
          
          {/* Ligne 5 : Adresse */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Adresse <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('address')}
              placeholder="Adresse complète de résidence"
              disabled={loading}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Section : Informations scolaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-4 w-4" />
            Informations Scolaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1 : Classe et Date d'inscription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Classe <span className="text-red-500">*</span>
              </label>
              <Controller
                name="grade"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loading}
                    className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.grade ? 'border-red-500' : ''}`}
                  >
                    {GRADE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.grade && (
                <p className="text-sm text-red-500 mt-1">{errors.grade.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Date d'inscription <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('enrollmentDate')}
                type="date"
                disabled={loading}
                className={errors.enrollmentDate ? 'border-red-500' : ''}
              />
              {errors.enrollmentDate && (
                <p className="text-sm text-red-500 mt-1">{errors.enrollmentDate.message}</p>
              )}
            </div>
          </div>
          
          {/* Ligne 2 : Matricule et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Matricule <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  {...register('studentId')}
                  placeholder="Ex: 24T1234"
                  disabled={loading}
                  className={errors.studentId ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateStudentId}
                  disabled={loading}
                  className="shrink-0"
                >
                  Générer
                </Button>
              </div>
              {errors.studentId && (
                <p className="text-sm text-red-500 mt-1">{errors.studentId.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Statut <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loading}
                    className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.status ? 'border-red-500' : ''}`}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Section : Informations du parent/tuteur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4" />
            Informations du Parent/Tuteur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1 : Nom et Relation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('parentContact.name')}
                placeholder="Nom du parent/tuteur"
                disabled={loading}
                className={errors.parentContact?.name ? 'border-red-500' : ''}
              />
              {errors.parentContact?.name && (
                <p className="text-sm text-red-500 mt-1">{errors.parentContact.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <Controller
                name="parentContact.relationship"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={loading}
                    className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.parentContact?.relationship ? 'border-red-500' : ''}`}
                  >
                    {RELATIONSHIP_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.parentContact?.relationship && (
                <p className="text-sm text-red-500 mt-1">{errors.parentContact.relationship.message}</p>
              )}
            </div>
          </div>
          
          {/* Ligne 2 : Email et Téléphone du parent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('parentContact.email')}
                type="email"
                placeholder="email@example.com"
                disabled={loading}
                className={errors.parentContact?.email ? 'border-red-500' : ''}
              />
              {errors.parentContact?.email && (
                <p className="text-sm text-red-500 mt-1">{errors.parentContact.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Téléphone <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('parentContact.phone')}
                type="tel"
                placeholder="+509 1234-5678"
                disabled={loading}
                className={errors.parentContact?.phone ? 'border-red-500' : ''}
              />
              {errors.parentContact?.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.parentContact.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Section : Photo de profil (optionnel) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-4 w-4" />
            Photo de Profil (Optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium mb-2">
              URL de la photo
            </label>
            <Input
              {...register('avatar')}
              type="url"
              placeholder="https://example.com/photo.jpg"
              disabled={loading}
              className={errors.avatar ? 'border-red-500' : ''}
            />
            {errors.avatar && (
              <p className="text-sm text-red-500 mt-1">{errors.avatar.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || isSubmitting}
          className="min-w-[120px]"
        >
          {loading || isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {mode === 'create' ? 'Création...' : 'Mise à jour...'}
            </div>
          ) : (
            mode === 'create' ? 'Créer l\'élève' : 'Mettre à jour'
          )}
        </Button>
      </div>
    </form>
  );
}; 