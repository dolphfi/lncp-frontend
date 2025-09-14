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
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Target, 
  BookOpen, 
  Plus,
  X
} from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

import { 
  createStudentSchema,
  CreateStudentFormData,
  GRADE_OPTIONS,
  LEVEL_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  VACATION_OPTIONS,
  TEACHING_LEVEL_OPTIONS
} from '../../schemas/studentSchema';
import { Student } from '../../types/student';
import { useRoomStore } from '../../stores/roomStore';
import useClassroomStore from '../../stores/classroomStore';
import type { Room } from '../../services/classroomService';
import { useStudentStore } from '../../stores/studentStore';

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
  const { items: classrooms, fetchAll: fetchClassrooms, getDetails } = useClassroomStore();
  const [classRooms, setClassRooms] = useState<Room[]>([]);
  const { responsables, fetchResponsables } = useStudentStore();

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
    watch,
    setFocus
  } = useForm<any>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'male',
      dateOfBirth: '',
      placeOfBirth: '',
      communeDeNaissance: '' as any,
      email: '',
      ninthGradeOrderNumber: '',
      level: 'nouveauSecondaire',
      grade: 'NSI',
      selectedClassroomId: '' as any,
      roomId: 'none',
      ninthGradeSchool: '',
      ninthGradeGraduationYear: '',
      lastSchool: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      avatar: '',
      vacation: '' as any,
      niveauEnseignement: '' as any,
      hasHandicap: false as any,
      handicapDetails: '' as any,
      adresse: '' as any,
      // Parents (backend)
      nomMere: '' as any,
      prenomMere: '' as any,
      statutMere: '' as any,
      occupationMere: '' as any,
      nomPere: '' as any,
      prenomPere: '' as any,
      statutPere: '' as any,
      occupationPere: '' as any,
      // Responsable
      responsableMode: 'create' as any,
      personneResponsableId: '' as any,
      responsable: {
        firstName: '' as any,
        lastName: '' as any,
        email: '' as any,
        phone: '' as any,
        lienParente: '' as any,
        nif: '' as any,
        ninu: '' as any
      } as any,
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

  // Surveiller la classe sélectionnée (backend) pour charger ses salles
  const selectedClassroomId = watch('selectedClassroomId' as any);

  // =====================================================
  // CHARGEMENT DES SALLES
  // =====================================================
  useEffect(() => {
    fetchRooms();
    // Charger les classes pour piloter le grade
    try { fetchClassrooms(1, 50); } catch {}
    // Charger la liste des personnes responsables
    try { fetchResponsables(); } catch {}
  }, [fetchRooms]);

  // Salles proposées = salles de la classe backend sélectionnée (si présentes)
  const filteredRooms = classRooms?.length ? classRooms : [];

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
  const [formError, setFormError] = useState<string | null>(null);

  const extractFirstErrorMessage = (e: any): string | null => {
    if (!e) return null;
    if (typeof e.message === 'string') return e.message;
    // Explorer récursivement le premier sous-champ en erreur
    for (const key of Object.keys(e)) {
      const val = (e as any)[key];
      const msg = extractFirstErrorMessage(val);
      if (msg) return msg;
    }
    return null;
  };

  const onInvalid = (errs: any) => {
    // Tenter de se focaliser sur le premier champ en erreur connu
    const keys = Object.keys(errs || {});
    if (keys.length) {
      try { setFocus(keys[0] as any); } catch {}
    }
    const msg = extractFirstErrorMessage(errs) || 'Veuillez corriger les champs en erreur.';
    setFormError(msg);
  };

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
    error?: React.ReactNode; 
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
      <form onSubmit={handleSubmit(onFormSubmit as any, onInvalid)} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
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
              <FormField label="Nom" required error={(errors as any).lastName?.message}>
                <Input
                  {...register('lastName')}
                  placeholder="Nom de famille"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Prénom" required error={(errors as any).firstName?.message}>
                <Input
                  {...register('firstName')}
                  placeholder="Prénom de l'élève"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Sexe" required error={(errors as any).gender?.message}>
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
              <FormField label="Date de naissance" required error={(errors as any).dateOfBirth?.message}>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...register('dateOfBirth')}
                    type="date"
                    className="h-9 pl-9"
                    disabled={loading}
                  />
                </div>
              </FormField>

              <FormField label="Lieu de naissance" required error={(errors as any).placeOfBirth?.message}>
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

              <FormField label="Email" error={(errors as any).email?.message}>
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
                <FormField label="N° d'ordre 9ème AF" required error={(errors as any).ninthGradeOrderNumber?.message}>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
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
                      <Plus className="h-3 w-3 text-blue-600" />
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
              <Target className="h-4 w-4" />
              Informations Scolaires
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Classe (backend), Niveau, Classe */}
            <div className="grid grid-cols-3 gap-4">
              {/* Classe (backend) pilote le grade et charge ses salles */}
              <FormField label="Classe" required error={(errors as any).selectedClassroomId?.message}>
                <Controller
                  name={"selectedClassroomId" as any}
                  control={control as any}
                  render={({ field }) => (
                    <Select
                      onValueChange={async (val) => {
                        field.onChange(val);
                        const cls = classrooms.find(c => c.id === val);
                        if (cls) {
                          setValue('grade', cls.name as any, { shouldValidate: true, shouldDirty: true });
                        }
                        try {
                          await getDetails(val);
                          // Lire directement depuis le store (current)
                          const st = (useClassroomStore as any).getState?.();
                          const current = st?.current;
                          setClassRooms(current?.rooms || []);
                          // réinitialiser la salle sélectionnée
                          setValue('roomId', 'none' as any, { shouldDirty: true });
                        } catch {}
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner une classe " />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Niveau" required error={(errors as any).level?.message}>
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

            
              <FormField label="Salle" error={(errors as any).roomId?.message}>
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
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField></div>

            {/* Ligne 2: École 9e, Année réussite, Dernier établissement */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="École 9e" error={(errors as any).ninthGradeSchool?.message}>
                <Input
                  {...register('ninthGradeSchool')}
                  placeholder="École de 9e année"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Année réussite 9e" error={(errors as any).ninthGradeGraduationYear?.message}>
                <Input
                  {...register('ninthGradeGraduationYear')}
                  placeholder="Ex: 2023"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>

              <FormField label="Dernier établissement" error={(errors as any).lastSchool?.message}>
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
            SECTION 2B: INFORMATIONS ADMINISTRATIVES (API)
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Informations Administratives (API)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Commune de naissance, Vacation, Niveau d'enseignement */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Commune de naissance" required error={(errors as any).communeDeNaissance?.message}>
                <Input
                  {...register('communeDeNaissance' as any)}
                  placeholder="Commune"
                  className="h-9"
                  disabled={loading}
                />
              </FormField>
              <FormField label="Vacation" required error={(errors as any).vacation?.message}>
                <Controller
                  name={"vacation" as any}
                  control={control as any}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        {VACATION_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Niveau d'enseignement" required error={(errors as any).niveauEnseignement?.message}>
                <Controller
                  name={"niveauEnseignement" as any}
                  control={control as any}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Fondamentale / Secondaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEACHING_LEVEL_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            {/* Ligne 2: Handicap + détails */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <FormField label="Handicap">
                <div className="flex items-center gap-2 h-9">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    {...register('hasHandicap' as any)}
                    aria-label="Élève en situation de handicap"
                    disabled={loading}
                  />
                  <span className="text-sm text-muted-foreground">Élève en situation de handicap</span>
                </div>
              </FormField>
              <FormField label="Détails du handicap" error={(errors as any).handicapDetails?.message}>
                <Input
                  {...register('handicapDetails' as any)}
                  placeholder="Précisions si applicable"
                  className="h-9"
                  disabled={loading || !watch('hasHandicap' as any)}
                />
              </FormField>
            </div>

            {/* Adresse de l'élève (API) */}
            <FormField label="Adresse de l'élève" required error={(errors as any).adresse?.message}>
              <Textarea
                {...register('adresse' as any)}
                placeholder="Adresse complète (sera envoyée telle quelle au backend)"
                className="min-h-[60px] w-full"
                disabled={loading}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* =====================================================
            SECTION 3: INFORMATIONS DES PARENTS
        ===================================================== */}
        <Card className="shadow-sm border-0 w-full">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Informations des Parents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Ligne 1: Père et Mère (API) */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nom du père" required error={(errors as any).nomPere?.message}>
                <Input 
                  {...register('nomPere' as any)} 
                  placeholder="Nom du père" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('nomPere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
              <FormField label="Prénom du père" required error={(errors as any).prenomPere?.message}>
                <Input 
                  {...register('prenomPere' as any)} 
                  placeholder="Prénom du père" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('prenomPere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
              <FormField label="Statut du père" required error={(errors as any).statutPere?.message}>
                <Input 
                  {...register('statutPere' as any)} 
                  placeholder="Ex: Actif" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('statutPere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nom de la mère" required error={(errors as any).nomMere?.message}>
                <Input 
                  {...register('nomMere' as any)} 
                  placeholder="Nom de la mère" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('nomMere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
              <FormField label="Prénom de la mère" required error={(errors as any).prenomMere?.message}>
                <Input 
                  {...register('prenomMere' as any)} 
                  placeholder="Prénom de la mère" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('prenomMere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
              <FormField label="Statut de la mère" required error={(errors as any).statutMere?.message}>
                <Input 
                  {...register('statutMere' as any)} 
                  placeholder="Ex: Active" 
                  className="h-9" 
                  disabled={loading}
                  onBlur={(e) => setValue('statutMere' as any, e.target.value.trim(), { shouldValidate: true })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Occupation du père">
                <Input {...register('occupationPere' as any)} placeholder="Occupation" className="h-9" disabled={loading} />
              </FormField>
              <FormField label="Occupation de la mère">
                <Input {...register('occupationMere' as any)} placeholder="Occupation" className="h-9" disabled={loading} />
              </FormField>
            </div>

            {/* Personne responsable */}
            <div className="space-y-3">
              <FormField label="Mode de responsable" required>
                <Controller
                  name={"responsableMode" as any}
                  control={control as any}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Sélectionner dans la liste</SelectItem>
                        <SelectItem value="create">Créer un nouveau</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {/* Si sélection */}
              { (watch('responsableMode' as any) === 'select') && (
                <FormField label="Personne responsable existante" required>
                  <Controller
                    name={"personneResponsableId" as any}
                    control={control as any}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Sélectionner un responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsables.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.firstName} {r.lastName} - {r.lienParente}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              )}

              {/* Si création */}
              { (watch('responsableMode' as any) !== 'select') && (
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Prénom responsable" required>
                    <Input {...register('responsable.firstName' as any)} placeholder="Prénom" className="h-9" disabled={loading} />
                  </FormField>
                  <FormField label="Nom responsable" required>
                    <Input {...register('responsable.lastName' as any)} placeholder="Nom" className="h-9" disabled={loading} />
                  </FormField>
                  <FormField label="Lien de parenté" required>
                    <Controller
                      name={"responsable.lienParente" as any}
                      control={control as any}
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
                  <FormField label="Téléphone">
                    <Input {...register('responsable.phone' as any)} placeholder="Téléphone" className="h-9" disabled={loading} />
                  </FormField>
                  <FormField label="Email">
                    <Input {...register('responsable.email' as any)} type="email" placeholder="email@exemple.com" className="h-9" disabled={loading} />
                  </FormField>
                  <FormField label="NIF">
                    <Input {...register('responsable.nif' as any)} placeholder="NIF" className="h-9" disabled={loading} />
                  </FormField>
                  <FormField label="NINU">
                    <Input {...register('responsable.ninu' as any)} placeholder="NINU" className="h-9" disabled={loading} />
                  </FormField>
                </div>
              )}
            </div>

            {/* Adresse parents (facultative, gardée) */}
            <FormField label="Adresse (parents)" error={(errors as any).parentContact?.address?.message}>
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