import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building,
  Plus,
  X
} from 'lucide-react';
import { 
  EmployeeType, 
  ProfessorSpecialty, 
  EmployeeDegree, 
  EmployeeStatus, 
  Gender, 
  CreateEmployeeDto,
  CourseAssignment,
  BackendUserRole
} from '../../types/employee';
import { 
  employeeFormSchema, 
  EmployeeFormData,
  BACKEND_ROLE_OPTIONS,
  SEXE_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS
} from '../../schemas/employeeSchema';
import { useCourseStore } from '../../stores/courseStore';
import { Badge } from '../ui/badge';

// Interface pour les props du composant

interface EmployeeFormProps {
  employee?: any;
  onSubmit: (data: CreateEmployeeDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmployeeForm({ employee, onSubmit, onCancel, isLoading = false }: EmployeeFormProps) {
  const [selectedType, setSelectedType] = useState<EmployeeType>('professeur');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Récupérer les cours existants depuis le store
  const { fetchCourses } = useCourseStore();
  const courses = useCourseStore(state => state.courses);

  // Charger les cours au montage du composant
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'homme',
      placeOfBirth: '',
      communeOfBirth: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      hireDate: '',
      type: 'professeur',
      role: 'TEACHER' as BackendUserRole,
      status: 'actif',
      avatar: '',
      handicap: false,
      notes: '',
      assignedCourseIds: [],
      // Champs professeurs
      specialty: undefined,
      secondarySpecialties: [],
      degree: undefined,
      institution: '',
      graduationYear: undefined,
      maxCourses: undefined,
      // Champs administratifs
      department: '',
      position: '',
      supervisor: '',
      // Champs techniques
      skills: [],
      certifications: '',
      equipment: ''
    }
  });

  const watchedType = watch('type');

  useEffect(() => {
    setSelectedType(watchedType);
  }, [watchedType]);

  useEffect(() => {
    if (employee) {
      reset({
        employeeId: employee.employeeId,
        type: employee.type,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        dateOfBirth: employee.dateOfBirth,
        gender: employee.gender,
        placeOfBirth: '', // Champ backend, pas dans l'ancien type
        communeOfBirth: '', // Champ backend, pas dans l'ancien type
        address: employee.address,
        hireDate: employee.hireDate,
        status: employee.status,
        role: 'TEACHER' as BackendUserRole, // Par défaut
        avatar: '',
        handicap: false,
        notes: employee.notes,
        assignedCourseIds: employee.professorInfo?.assignedCourses?.map((c: any) => c.courseId) || [],
        
        // Champs spécifiques aux professeurs
        specialty: employee.professorInfo?.specialty,
        secondarySpecialties: employee.professorInfo?.secondarySpecialties || [],
        degree: employee.professorInfo?.degree,
        institution: employee.professorInfo?.institution,
        graduationYear: employee.professorInfo?.graduationYear,
        maxCourses: employee.professorInfo?.maxCourses,
        
        // Champs spécifiques aux administratifs
        department: employee.administrativeInfo?.department,
        position: employee.administrativeInfo?.position,
        supervisor: employee.administrativeInfo?.supervisor,
        
        // Champs spécifiques aux techniques
        skills: employee.technicalInfo?.skills || [],
        certifications: employee.technicalInfo?.certifications || [],
        equipment: employee.technicalInfo?.equipment || []
      });
      
      // Charger l'avatar existant
      if (employee.avatar) {
        setImagePreview(employee.avatar);
      }
    }
  }, [employee, reset]);

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

  // Log validation errors to diagnose why submit might not trigger
  const onSubmitError = (errors: any) => {
    console.error('❌ Erreurs de validation formulaire employé:', errors);
  };

  const onSubmitForm = (data: EmployeeFormData) => {
    console.log('📝 Données du formulaire:', data);
    
    // Convertir les données frontend vers le format API backend
    const apiPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      sexe: data.gender === 'homme' ? 'Homme' : data.gender === 'femme' ? 'Femme' : 'Homme',
      dateOfBirth: data.dateOfBirth, // input type="date" fournit déjà YYYY-MM-DD
      placeOfBirth: data.placeOfBirth,
      communeOfBirth: data.communeOfBirth,
      hireDate: data.hireDate, // input type="date" fournit déjà YYYY-MM-DD
      adresse: {
        adresseLigne1: data.address.street,
        departement: data.address.country,
        commune: data.address.city,
        sectionCommunale: data.address.postalCode
      },
      role: data.role,
      avatar: data.avatar || undefined,
      handicap: data.handicap || false,
      // Pour les enseignants, inclure les cours sélectionnés
      courseIds: data.type === 'professeur' ? (data.assignedCourseIds || []) : undefined
    };
    
    console.log('🚀 Payload envoyé au store:', apiPayload);
    
    onSubmit(apiPayload as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm, onSubmitError)} className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type d'employé *</Label>
              <Select
                value={selectedType}
                onValueChange={(value: EmployeeType) => {
                  setValue('type', value);
                  setSelectedType(value);
                  // Mettre à jour le rôle backend automatiquement
                  const defaultRole = value === 'professeur' ? 'TEACHER' : 
                                     value === 'direction' ? 'DIRECTOR' : 
                                     value === 'administratif' ? 'SECRETARY' : 'USER';
                  setValue('role', defaultRole as BackendUserRole);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professeur">Professeur</SelectItem>
                  <SelectItem value="administratif">Administratif</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Jean"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Dupont"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="jean.dupont@ecole.fr"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0123456789"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date de naissance *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Genre *</Label>
              <Select
                onValueChange={(value: Gender) => setValue('gender', value)}
                defaultValue="homme"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="placeOfBirth">Lieu de naissance *</Label>
              <Input
                id="placeOfBirth"
                {...register('placeOfBirth')}
                placeholder="Paris"
              />
              {errors.placeOfBirth && (
                <p className="text-sm text-red-500 mt-1">{errors.placeOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="communeOfBirth">Commune de naissance *</Label>
              <Input
                id="communeOfBirth"
                {...register('communeOfBirth')}
                placeholder="Paris 15e"
              />
              {errors.communeOfBirth && (
                <p className="text-sm text-red-500 mt-1">{errors.communeOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hireDate">Date d'embauche *</Label>
              <Input
                id="hireDate"
                type="date"
                {...register('hireDate')}
              />
              {errors.hireDate && (
                <p className="text-sm text-red-500 mt-1">{errors.hireDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select
                onValueChange={(value: EmployeeStatus) => setValue('status', value)}
                defaultValue="actif"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="en_congé">En congé</SelectItem>
                  <SelectItem value="retraité">Retraité</SelectItem>
                  <SelectItem value="démission">Démission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Rue *</Label>
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder="123 Rue de la Paix"
                />
                {errors.address?.street && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.street.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="Paris"
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  {...register('address.postalCode')}
                  placeholder="75001"
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.postalCode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  {...register('address.country')}
                  placeholder="France"
                />
                {errors.address?.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations spécifiques aux professeurs */}
      {selectedType === 'professeur' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informations du professeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">Spécialité principale *</Label>
                <Select
                  onValueChange={(value: ProfessorSpecialty) => setValue('specialty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathématiques">Mathématiques</SelectItem>
                    <SelectItem value="sciences">Sciences</SelectItem>
                    <SelectItem value="langues">Langues</SelectItem>
                    <SelectItem value="histoire">Histoire</SelectItem>
                    <SelectItem value="géographie">Géographie</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="informatique">Informatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="degree">Diplôme *</Label>
                <Select
                  onValueChange={(value: EmployeeDegree) => setValue('degree', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un diplôme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licence">Licence</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="doctorat">Doctorat</SelectItem>
                    <SelectItem value="agrégation">Agrégation</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="bac">Bac</SelectItem>
                    <SelectItem value="bts">BTS</SelectItem>
                    <SelectItem value="dut">DUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="institution">Établissement de formation</Label>
                <Input
                  id="institution"
                  {...register('institution')}
                  placeholder="Université de Paris"
                />
              </div>

              <div>
                <Label htmlFor="graduationYear">Année d'obtention</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  {...register('graduationYear', { setValueAs: (v) => (v === '' || v === null || v === undefined) ? undefined : Number(v) })}
                  placeholder="2020"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <Label htmlFor="maxCourses">Nombre maximum de cours</Label>
                <Input
                  id="maxCourses"
                  type="number"
                  {...register('maxCourses', { setValueAs: (v) => (v === '' || v === null || v === undefined) ? undefined : Number(v) })}
                  placeholder="5"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Note: L'assignation des cours se fait via la section simple ci-dessous */}
          </CardContent>
        </Card>
      )}

      {/* Informations spécifiques aux administratifs */}
      {selectedType === 'administratif' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations administratives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Administration"
                />
              </div>

              <div>
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  {...register('position')}
                  placeholder="Secrétaire"
                />
              </div>

              <div>
                <Label htmlFor="supervisor">Superviseur</Label>
                <Input
                  id="supervisor"
                  {...register('supervisor')}
                  placeholder="Directeur administratif"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations spécifiques aux techniques */}
      {selectedType === 'technique' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations techniques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Compétences</Label>
              <div className="space-y-2">
                {['Maintenance', 'Électricité', 'Plomberie', 'Informatique'].map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={watch('skills')?.includes(skill) || false}
                      onCheckedChange={(checked: boolean) => {
                        const currentSkills = watch('skills') || [];
                        if (checked) {
                          setValue('skills', [...currentSkills, skill]);
                        } else {
                          setValue('skills', currentSkills.filter(s => s !== skill));
                        }
                      }}
                    />
                    <Label htmlFor={skill}>{skill}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                {...register('certifications')}
                placeholder="Liste des certifications..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="equipment">Équipements</Label>
              <Textarea
                id="equipment"
                {...register('equipment')}
                placeholder="Liste des équipements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section assignation de cours pour les enseignants */}
      {selectedType === 'professeur' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cours assignés (optionnel)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sélectionner des cours</Label>
              <Select
                onValueChange={(courseId) => {
                  const currentCourses = watch('assignedCourseIds') || [];
                  if (!currentCourses.includes(courseId)) {
                    setValue('assignedCourseIds', [...currentCourses, courseId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titre} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Affichage des cours sélectionnés */}
            <div className="flex flex-wrap gap-2">
              {(watch('assignedCourseIds') || []).map((courseId) => {
                const course = courses.find(c => c.id === courseId);
                return course ? (
                  <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                    {course.titre}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        const currentCourses = watch('assignedCourseIds') || [];
                        setValue('assignedCourseIds', currentCourses.filter(id => id !== courseId));
                      }}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Champs optionnels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations complémentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Photo de profil</Label>
              <div className="flex items-center gap-3 mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {watch('firstName')?.charAt(0) || ''}{watch('lastName')?.charAt(0) || ''}
                  </div>
                )}
                
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm border border-blue-200 transition-colors">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">Choisir une photo</span>
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  aria-label="Télécharger une photo de profil"
                />
              </div>
              {errors.avatar && (
                <p className="text-sm text-red-500 mt-1">{errors.avatar.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="handicap"
                checked={watch('handicap') || false}
                onCheckedChange={(checked: boolean) => setValue('handicap', checked)}
              />
              <Label htmlFor="handicap">Situation de handicap</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : employee ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
} 