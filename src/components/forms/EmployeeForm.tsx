import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  CourseAssignment
} from '../../types/employee';
import { useCourseStore } from '../../stores/courseStore';
import { Badge } from '../ui/badge';

// Schéma de validation
const employeeSchema = z.object({
  employeeId: z.string().min(1, "L'identifiant employé est requis"),
  type: z.enum(['professeur', 'administratif', 'technique', 'direction', 'maintenance']),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  gender: z.enum(['homme', 'femme', 'autre']),
  address: z.object({
    street: z.string().min(1, "Rue requise"),
    city: z.string().min(1, "Ville requise"),
    postalCode: z.string().min(1, "Code postal requis"),
    country: z.string().min(1, "Pays requis")
  }),
  hireDate: z.string().min(1, "Date d'embauche requise"),
  status: z.enum(['actif', 'inactif', 'en_congé', 'retraité', 'démission']),
  notes: z.string().optional(),
  
  // Champs spécifiques aux professeurs
  specialty: z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique']).optional(),
  secondarySpecialties: z.array(z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique'])).optional(),
  degree: z.enum(['licence', 'master', 'doctorat', 'agrégation', 'certification', 'bac', 'bts', 'dut']).optional(),
  institution: z.string().optional(),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()).optional(),
  maxCourses: z.number().min(1).max(10).optional(),
  
  // Champs spécifiques aux administratifs
  department: z.string().optional(),
  position: z.string().optional(),
  supervisor: z.string().optional(),
  
  // Champs spécifiques aux techniques
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: any;
  onSubmit: (data: CreateEmployeeDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmployeeForm({ employee, onSubmit, onCancel, isLoading = false }: EmployeeFormProps) {
  const [selectedType, setSelectedType] = useState<EmployeeType>('professeur');
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [newAssignment, setNewAssignment] = useState<Partial<CourseAssignment>>({});

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
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      type: 'professeur',
      status: 'actif',
      gender: 'homme',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      notes: '',
      secondarySpecialties: [],
      skills: [],
      certifications: [],
      equipment: [],
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
        address: employee.address,
        hireDate: employee.hireDate,
        status: employee.status,
        notes: employee.notes,
        
        // Champs spécifiques aux professeurs
        specialty: employee.professorInfo?.specialty,
        secondarySpecialties: employee.professorInfo?.secondarySpecialties,
        degree: employee.professorInfo?.degree,
        institution: employee.professorInfo?.institution,
        graduationYear: employee.professorInfo?.graduationYear,
        maxCourses: employee.professorInfo?.maxCourses,
        
        // Champs spécifiques aux administratifs
        department: employee.administrativeInfo?.department,
        position: employee.administrativeInfo?.position,
        supervisor: employee.administrativeInfo?.supervisor,
        
        // Champs spécifiques aux techniques
        skills: employee.technicalInfo?.skills,
        certifications: employee.technicalInfo?.certifications,
        equipment: employee.technicalInfo?.equipment,
      });
      
      if (employee.professorInfo?.assignedCourses) {
        setCourseAssignments(employee.professorInfo.assignedCourses);
      }
    }
  }, [employee, reset]);

  const addCourseAssignment = () => {
    if (newAssignment.courseId && newAssignment.courseName) {
      setCourseAssignments([...courseAssignments, {
        courseId: newAssignment.courseId!,
        courseName: newAssignment.courseName!,
        classes: newAssignment.classes || [],
        rooms: newAssignment.rooms || []
      }]);
      setNewAssignment({});
    }
  };

  const removeCourseAssignment = (index: number) => {
    setCourseAssignments(courseAssignments.filter((_, i) => i !== index));
  };

  const onSubmitForm = (data: EmployeeFormData) => {
    const employeeData: CreateEmployeeDto = {
      ...data,
      assignedCourses: selectedType === 'professeur' ? courseAssignments : undefined,
    };
    onSubmit(employeeData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
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
              <Label htmlFor="employeeId">Identifiant employé *</Label>
              <Input
                id="employeeId"
                {...register('employeeId')}
                placeholder="EMP001"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-500 mt-1">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Type d'employé *</Label>
              <Select
                value={selectedType}
                onValueChange={(value: EmployeeType) => {
                  setValue('type', value);
                  setSelectedType(value);
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
                  {...register('graduationYear', { valueAsNumber: true })}
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
                  {...register('maxCourses', { valueAsNumber: true })}
                  placeholder="5"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Assignation des cours */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assignation des cours
              </h4>
              
              {/* Nouvelle assignation */}
              <div className="border rounded-lg p-4 space-y-4">
                <h5 className="font-medium">Ajouter une assignation</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cours</Label>
                    <Select
                      value={newAssignment.courseId || ''}
                      onValueChange={(value: string) => {
                        const course = courses.find(c => c.id === value);
                        setNewAssignment({
                          ...newAssignment,
                          courseId: value,
                          courseName: course ? `${course.title} (${course.code})` : ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Classes</Label>
                    <Select
                      onValueChange={(value) => {
                        const currentClasses = newAssignment.classes || [];
                        if (!currentClasses.includes(value)) {
                          setNewAssignment({
                            ...newAssignment,
                            classes: [...currentClasses, value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ajouter des classes" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* mockClasses.map(cls => ( */}
                          <SelectItem key="1" value="1">
                            6ème A
                          </SelectItem>
                          <SelectItem key="2" value="2">
                            6ème B
                          </SelectItem>
                          <SelectItem key="3" value="3">
                            5ème A
                          </SelectItem>
                          <SelectItem key="4" value="4">
                            5ème B
                          </SelectItem>
                          <SelectItem key="5" value="5">
                            4ème A
                          </SelectItem>
                          <SelectItem key="6" value="6">
                            4ème B
                          </SelectItem>
                          <SelectItem key="7" value="7">
                            3ème A
                          </SelectItem>
                          <SelectItem key="8" value="8">
                            3ème B
                          </SelectItem>
                        {/* ))} */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Salles</Label>
                    <Select
                      onValueChange={(value: string) => {
                        const currentRooms = newAssignment.rooms || [];
                        if (!currentRooms.includes(value)) {
                          setNewAssignment({
                            ...newAssignment,
                            rooms: [...currentRooms, value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ajouter des salles" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* mockRooms.map(room => ( */}
                          <SelectItem key="1" value="1">
                            Salle 101
                          </SelectItem>
                          <SelectItem key="2" value="2">
                            Salle 102
                          </SelectItem>
                          <SelectItem key="3" value="3">
                            Salle 103
                          </SelectItem>
                          <SelectItem key="4" value="4">
                            Salle 201
                          </SelectItem>
                          <SelectItem key="5" value="5">
                            Salle 202
                          </SelectItem>
                          <SelectItem key="6" value="6">
                            Salle 203
                          </SelectItem>
                          <SelectItem key="7" value="7">
                            Laboratoire Sciences
                          </SelectItem>
                          <SelectItem key="8" value="8">
                            Salle Informatique
                          </SelectItem>
                        {/* ))} */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addCourseAssignment}
                      disabled={!newAssignment.courseId}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Assignations existantes */}
              {courseAssignments.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium">Assignations actuelles</h5>
                  {courseAssignments.map((assignment, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h6 className="font-semibold text-gray-900">{assignment.courseName}</h6>
                          <p className="text-sm text-gray-600">Code: {assignment.courseId}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCourseAssignment(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Classes assignées:</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {assignment.classes.length > 0 ? (
                              assignment.classes.map((classId, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {classId === '1' ? '6ème A' : 
                                   classId === '2' ? '6ème B' :
                                   classId === '3' ? '5ème A' :
                                   classId === '4' ? '5ème B' :
                                   classId === '5' ? '4ème A' :
                                   classId === '6' ? '4ème B' :
                                   classId === '7' ? '3ème A' :
                                   classId === '8' ? '3ème B' : classId}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Aucune classe assignée</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Salles assignées:</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {assignment.rooms.length > 0 ? (
                              assignment.rooms.map((roomId, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {roomId === '1' ? 'Salle 101' : 
                                   roomId === '2' ? 'Salle 102' :
                                   roomId === '3' ? 'Salle 103' :
                                   roomId === '4' ? 'Salle 201' :
                                   roomId === '5' ? 'Salle 202' :
                                   roomId === '6' ? 'Salle 203' :
                                   roomId === '7' ? 'Laboratoire Sciences' :
                                   roomId === '8' ? 'Salle Informatique' : roomId}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Aucune salle assignée</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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