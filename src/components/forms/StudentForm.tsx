/**
 * =====================================================
 * FORMULAIRE MODERNE D'ENREGISTREMENT DES ÉLÈVES
 * =====================================================
 * Formulaire fluide et moderne avec shadcn/ui et Tailwind CSS
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CalendarDays, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Users, 
  School,
  FileText,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

import { 
  createStudentSchema,
  CreateStudentFormData,
  GRADE_OPTIONS,
  LEVEL_OPTIONS,
  STATUS_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS
} from '../../schemas/studentSchema';
import { Student } from '../../types/student';
import { useRoomStore } from '../../stores/roomStore';

// =====================================================
// TYPES ET INTERFACES
// =====================================================
type StudentFormData = CreateStudentFormData;

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: StudentFormData, studentId?: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
  mode = student ? 'edit' : 'create'
}) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Récupération des salles pour le formulaire
  const { rooms, fetchRooms } = useRoomStore();

  // =====================================================
  // CONFIGURATION DU FORMULAIRE
  // =====================================================
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<StudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'male',
      dateOfBirth: '',
      placeOfBirth: '',
      email: '',
      ninthGradeOrderNumber: '',
      level: 'nouveauSecondaire',
      grade: 'NSI',
      roomId: 'none',
      ninthGradeSchool: '',
      ninthGradeGraduationYear: '',
      lastSchool: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      avatar: '',
      parentContact: {
        fatherName: '',
        motherName: '',
        responsiblePerson: '',
        phone: '',
        email: '',
        address: '',
        relationship: 'père'
      },
      status: 'active'
    }
  });

  // Surveiller la classe sélectionnée pour filtrer les salles
  const selectedGrade = watch('grade');

  // =====================================================
  // CHARGEMENT DES SALLES
  // =====================================================
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filtrer les salles par classe
  const filteredRooms = rooms.filter(room => room.classLevel === selectedGrade);

  // =====================================================
  // EFFET POUR PRÉREMPLIR LE FORMULAIRE EN MODE ÉDITION
  // =====================================================
  useEffect(() => {
    if (mode === 'edit' && student) {
      const studentData = {
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.split('T')[0],
        placeOfBirth: student.placeOfBirth || '',
        email: student.email || '',
        ninthGradeOrderNumber: student.ninthGradeOrderNumber || '',
        level: student.level || 'nouveauSecondaire',
        grade: student.grade,
        roomId: student.roomId || 'none',
        ninthGradeSchool: student.ninthGradeSchool || '',
        ninthGradeGraduationYear: student.ninthGradeGraduationYear || '',
        lastSchool: student.lastSchool || '',
        enrollmentDate: student.enrollmentDate.split('T')[0],
        avatar: student.avatar || '',
        parentContact: {
          fatherName: student.parentContact.fatherName || '',
          motherName: student.parentContact.motherName || '',
          responsiblePerson: student.parentContact.responsiblePerson,
          phone: student.parentContact.phone,
          email: student.parentContact.email || '',
          address: student.parentContact.address || '',
          relationship: student.parentContact.relationship
        },
        status: student.status
      } as StudentFormData;
      
      reset(studentData);
      setImagePreview(student.avatar || '');
    }
  }, [mode, student, reset]);

  // =====================================================
  // GESTION DE LA SOUMISSION
  // =====================================================
  const onFormSubmit = (data: StudentFormData) => {
    // Convertir "none" en undefined pour roomId
    const formData = {
      ...data,
      roomId: data.roomId === 'none' ? undefined : data.roomId
    };

    if (mode === 'edit' && student) {
      onSubmit(formData, student.id);
    } else {
      onSubmit(formData);
    }
  };

  // =====================================================
  // GESTION DE L'UPLOAD D'IMAGE
  // =====================================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setValue('avatar', '');
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
            SECTION 1: INFORMATIONS PERSONNELLES + PHOTO
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Informations de l'Élève
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Nom, Prénom, Sexe */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nom" required error={errors.lastName?.message}>
                <Input
                  {...register('lastName')}
                  placeholder="Nom de famille"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Prénom" required error={errors.firstName?.message}>
                <Input
                  {...register('firstName')}
                  placeholder="Prénom de l'élève"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Sexe" required error={errors.gender?.message}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
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

            {/* Ligne 2: Date naissance, Lieu naissance, Email */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Date de naissance" required error={errors.dateOfBirth?.message}>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('dateOfBirth')}
                    type="date"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <FormField label="Lieu de naissance" required error={errors.placeOfBirth?.message}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('placeOfBirth')}
                    placeholder="Ville, Département"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="email@exemple.com"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>
            </div>

            {/* Ligne 3: N° ordre 9e, Photo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField label="N° d'ordre 9ème AF" required error={errors.ninthGradeOrderNumber?.message}>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      {...register('ninthGradeOrderNumber')}
                      placeholder="Ex: 2023/001234"
                      className="h-9 pl-9"
                      disabled={loading}
                    />
                  </div>
                </FormField>
              </div>

              {/* Photo compacte */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Photo de profil
                </Label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-12 h-12 object-cover rounded-full border-2 border-blue-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {student?.firstName?.charAt(0) || ''}{student?.lastName?.charAt(0) || ''}
                    </div>
                  )}
                  
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded text-xs border border-blue-200 dark:border-blue-700 transition-colors">
                      <Upload className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-600 font-medium">Choisir</span>
                    </div>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={loading}
                    aria-label="Télécharger une photo de profil"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            SECTION 2: INFORMATIONS SCOLAIRES
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <School className="h-4 w-4" />
              Informations Scolaires
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Niveau, Classe */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Niveau" required error={errors.level?.message}>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Classe" required error={errors.grade?.message}>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Salle" error={errors.roomId?.message}>
                <Controller
                  name="roomId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner une salle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune salle assignée</SelectItem>
                        {filteredRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.classLevel} - {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            {/* Ligne 2: École 9e, Année réussite, Dernier établissement */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="École 9e" error={errors.ninthGradeSchool?.message}>
                <Input
                  {...register('ninthGradeSchool')}
                  placeholder="École de 9e année"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Année réussite 9e" error={errors.ninthGradeGraduationYear?.message}>
                <Input
                  {...register('ninthGradeGraduationYear')}
                  placeholder="Ex: 2023"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Dernier établissement" error={errors.lastSchool?.message}>
                <Input
                  {...register('lastSchool')}
                  placeholder="Dernier établissement"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            SECTION 3: INFORMATIONS DES PARENTS
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Informations des Parents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Père, Mère, Responsable */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nom du père" error={errors.parentContact?.fatherName?.message}>
                <Input
                  {...register('parentContact.fatherName')}
                  placeholder="Nom du père"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Nom de la mère" error={errors.parentContact?.motherName?.message}>
                <Input
                  {...register('parentContact.motherName')}
                  placeholder="Nom de la mère"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Personne responsable" required error={errors.parentContact?.responsiblePerson?.message}>
                <Input
                  {...register('parentContact.responsiblePerson')}
                  placeholder="Personne responsable"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>
            </div>

            {/* Ligne 2: Téléphone, Email, Relation */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Téléphone" required error={errors.parentContact?.phone?.message}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('parentContact.phone')}
                    placeholder="+509 XXXX XXXX"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <FormField label="Email" error={errors.parentContact?.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('parentContact.email')}
                    type="email"
                    placeholder="email@exemple.com"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <FormField label="Relation" required error={errors.parentContact?.relationship?.message}>
                <Controller
                  name="parentContact.relationship"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((option) => (
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

            {/* Adresse */}
            <FormField label="Adresse" error={errors.parentContact?.address?.message}>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Textarea
                  {...register('parentContact.address')}
                  placeholder="Adresse complète des parents..."
                  className="pl-9 min-h-[60px] w-full"
                  disabled={loading}
                />
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* =====================================================
            BOUTONS D'ACTION
        ===================================================== */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 w-full">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading || isSubmitting}
              className="sm:w-auto w-full h-9"
            >
              Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={loading || isSubmitting}
            className="sm:w-auto w-full h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {loading || isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'create' ? 'Enregistrement...' : 'Modification...'}
              </div>
            ) : (
              mode === 'create' ? 'Enregistrer l\'élève' : 'Modifier l\'élève'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}; 