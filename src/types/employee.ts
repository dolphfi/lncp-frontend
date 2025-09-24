/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LES EMPLOYÉS
 * =====================================================
 * Définition de tous les types liés aux employés
 * incluant les professeurs et autres types d'employés
 */

// =====================================================
// TYPES DE BASE
// =====================================================

// Types backend (basés sur UserRole enum)
export type BackendUserRole = 
  | 'SUPER_ADMIN' | 'ADMIN' | 'DIRECTOR' | 'CENSORED' 
  | 'COMPTABLE' | 'SUPPLEANT' | 'TEACHER' | 'SECRETARY' 
  | 'STUDENT' | 'PARENT' | 'USER';

// Types frontend (pour l'interface utilisateur)
export type EmployeeType = 'professeur' | 'administratif' | 'technique' | 'direction' | 'maintenance';

// Mapping backend vers frontend
export const ROLE_MAPPING: Record<BackendUserRole, EmployeeType> = {
  'TEACHER': 'professeur',
  'DIRECTOR': 'direction',
  'CENSORED': 'direction',
  'COMPTABLE': 'administratif',
  'SUPPLEANT': 'administratif',
  'SECRETARY': 'administratif',
  'SUPER_ADMIN': 'administratif',
  'ADMIN': 'administratif',
  'STUDENT': 'administratif', // Fallback
  'PARENT': 'administratif', // Fallback
  'USER': 'administratif' // Fallback
};

// Mapping frontend vers backend
export const FRONTEND_TO_BACKEND_ROLE: Record<EmployeeType, BackendUserRole[]> = {
  'professeur': ['TEACHER'],
  'direction': ['DIRECTOR', 'CENSORED'],
  'administratif': ['COMPTABLE', 'SUPPLEANT', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN'],
  'technique': ['USER'], // Fallback pour les techniques
  'maintenance': ['USER'] // Fallback pour la maintenance
};

export type ProfessorSpecialty = 
  | 'mathématiques' 
  | 'sciences' 
  | 'langues' 
  | 'histoire' 
  | 'géographie' 
  | 'arts' 
  | 'sport' 
  | 'informatique';

export type EmployeeStatus = 'actif' | 'inactif' | 'en_congé' | 'retraité' | 'démission';

export type EmployeeDegree = 'licence' | 'master' | 'doctorat' | 'agrégation' | 'certification' | 'bac' | 'bts' | 'dut';

export type Gender = 'homme' | 'femme' | 'autre';

export type DayOfWeek = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';

// =====================================================
// INTERFACES
// =====================================================

// Adresse frontend (interface utilisateur)
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Adresse backend (format API)
export interface BackendAddress {
  adresseLigne1: string;
  departement: string;
  commune: string;
  sectioncommunale: string;
}

// Fonctions de conversion adresse
export const convertAddressToBackend = (address: Address): BackendAddress => ({
  adresseLigne1: address.street,
  departement: address.country, // Adaptation selon les besoins
  commune: address.city,
  sectioncommunale: address.postalCode
});

export const convertAddressFromBackend = (backendAddress: BackendAddress): Address => ({
  street: backendAddress.adresseLigne1,
  city: backendAddress.commune,
  postalCode: backendAddress.sectioncommunale,
  country: backendAddress.departement
});

export interface Availability {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  available: boolean;
}

// Interface pour les professeurs spécifiquement
export interface ProfessorInfo {
  specialty: ProfessorSpecialty;
  secondarySpecialties: ProfessorSpecialty[];
  degree: EmployeeDegree;
  institution: string;
  graduationYear: number;
  assignedCourses: CourseAssignment[]; // Assignations cours/classes/salles
  maxCourses: number;
  availability: Availability[];
}

// Interface pour les employés administratifs
export interface AdministrativeInfo {
  department: string;
  position: string;
  supervisor?: string;
}

// Interface pour les employés techniques
export interface TechnicalInfo {
  skills: string[];
  certifications: string[];
  equipment: string[];
}

// Interface principale pour tous les employés
export interface Employee {
  id: string;
  employeeId: string;
  type: EmployeeType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: Address;
  
  // Informations communes
  hireDate: string;
  status: EmployeeStatus;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  
  // Informations spécifiques selon le type
  professorInfo?: ProfessorInfo;
  administrativeInfo?: AdministrativeInfo;
  technicalInfo?: TechnicalInfo;
}

// =====================================================
// TYPES POUR LES DTOs
// =====================================================

export interface CreateEmployeeDto {
  employeeId: string;
  type: EmployeeType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: Address;
  hireDate: string;
  status: EmployeeStatus;
  notes?: string;
  
  // Champs spécifiques aux professeurs
  specialty?: ProfessorSpecialty;
  secondarySpecialties?: ProfessorSpecialty[];
  degree?: EmployeeDegree;
  institution?: string;
  graduationYear?: number;
  assignedCourses?: CourseAssignment[];
  maxCourses?: number;
  availability?: Availability[];
  
  // Champs spécifiques aux administratifs
  department?: string;
  position?: string;
  supervisor?: string;
  
  // Champs spécifiques aux techniques
  skills?: string[];
  certifications?: string[];
  equipment?: string[];
}

// Nouveau type pour l'assignation des cours
export interface CourseAssignment {
  courseId: string;
  courseName: string;
  classes: string[]; // IDs des classes
  rooms: string[]; // IDs des salles
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

// =====================================================
// TYPES POUR LES FILTRES ET PAGINATION
// =====================================================

export interface EmployeeFilters {
  search?: string;
  type?: EmployeeType;
  status?: EmployeeStatus;
  isActive?: boolean;
  department?: string;
  specialty?: ProfessorSpecialty;
  hireYear?: number;
}

export interface EmployeePaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================================================
// TYPES POUR LES STATISTIQUES
// =====================================================

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  retired: number;
  byType: Record<EmployeeType, number>;
  byStatus: Record<EmployeeStatus, number>;
  byDepartment: Record<string, number>;
  averageExperience: number;
  topProfessors: Array<{
    employeeId: string;
    employeeName: string;
    courseCount: number;
  }>;
}

// =====================================================
// TYPES POUR LES ACTIONS
// =====================================================

export interface AssignCoursesDto {
  employeeId: string;
  courseIds: string[];
  action: 'assign' | 'unassign';
}

// =====================================================
// TYPES POUR LES ERREURS API
// =====================================================

export interface EmployeeApiError {
  message: string;
  code: string;
  details: Array<{
    field: string;
    message: string;
  }>;
}

// =====================================================
// TYPES POUR LES RÉPONSES API
// =====================================================

export interface EmployeeApiResponseWrapper<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: EmployeePaginationOptions;
  stats: EmployeeStats;
}

// =====================================================
// TYPES POUR LES FORMULAIRES
// =====================================================

export interface EmployeeFormData {
  employeeId: string;
  type: EmployeeType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: Address;
  hireDate: string;
  status: EmployeeStatus;
  notes?: string;
  
  // Champs spécifiques aux professeurs
  specialty?: ProfessorSpecialty;
  secondarySpecialties?: ProfessorSpecialty[];
  degree?: EmployeeDegree;
  institution?: string;
  graduationYear?: number;
  assignedCourses?: CourseAssignment[];
  maxCourses?: number;
  availability?: Availability[];
  
  // Champs spécifiques aux administratifs
  department?: string;
  position?: string;
  supervisor?: string;
  
  // Champs spécifiques aux techniques
  skills?: string[];
  certifications?: string[];
  equipment?: string[];
}

// =====================================================
// TYPES POUR LES OPTIONS DE SÉLECTION
// =====================================================

export interface SelectOption {
  value: string;
  label: string;
}

export type EmployeeTypeOption = SelectOption & {
  value: EmployeeType;
};

export type ProfessorSpecialtyOption = SelectOption & {
  value: ProfessorSpecialty;
};

export type EmployeeStatusOption = SelectOption & {
  value: EmployeeStatus;
};

export type EmployeeDegreeOption = SelectOption & {
  value: EmployeeDegree;
};

export type GenderOption = SelectOption & {
  value: Gender;
};

export type DayOption = SelectOption & {
  value: DayOfWeek;
};

// =====================================================
// TYPES POUR L'API BACKEND
// =====================================================

// Payload pour créer un employé (format backend)
export interface CreateEmployeeApiPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sexe: string; // Backend utilise 'sexe' au lieu de 'gender'
  avatar?: string;
  handicap?: boolean;
  hireDate: string;
  dateOfBirth: string;
  placeOfBirth: string;
  communeOfBirth: string;
  adresse: BackendAddress;
  role: BackendUserRole;
  courseIds?: string[]; // Optionnel pour les TEACHER
}

// Réponse API pour un employé
export interface EmployeeApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sexe: string;
  avatar?: string;
  handicap?: boolean;
  hireDate: string;
  dateOfBirth: string;
  placeOfBirth: string;
  communeOfBirth: string;
  adresse: BackendAddress;
  role: BackendUserRole;
  courses?: Array<{
    id: string;
    titre: string;
    code: string;
    categorie: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Fonctions de conversion employé
export const convertEmployeeFromApi = (apiEmployee: any): Employee => {
  console.log('🔄 Conversion employé API:', apiEmployee);
  
  return {
    id: apiEmployee.id,
    employeeId: apiEmployee.code || apiEmployee.id, // Utiliser le code ou l'ID
    type: ROLE_MAPPING[apiEmployee.user?.role as BackendUserRole] || 'administratif',
    firstName: apiEmployee.user?.firstName || '',
    lastName: apiEmployee.user?.lastName || '',
    email: apiEmployee.user?.email || '',
    phone: apiEmployee.user?.phone || '',
    dateOfBirth: apiEmployee.dateOfBirth || '',
    gender: apiEmployee.sexe === 'Homme' ? 'homme' : apiEmployee.sexe === 'Femme' ? 'femme' : 'autre',
    address: {
      street: apiEmployee.adresse?.adresseLigne1 || '',
      city: apiEmployee.adresse?.commune || '',
      postalCode: apiEmployee.adresse?.sectionCommunale || '',
      country: apiEmployee.adresse?.departement || 'France'
    },
    hireDate: apiEmployee.hireDate || '',
    status: 'actif', // Par défaut
    isActive: apiEmployee.user?.isActive || true,
    notes: '',
    createdAt: apiEmployee.createdAt || '',
    updatedAt: apiEmployee.updatedAt || '',
    
    // Informations spécifiques selon le type
    professorInfo: apiEmployee.user?.role === 'TEACHER' ? {
      specialty: 'mathématiques', // Par défaut, à adapter
      secondarySpecialties: [],
      degree: 'licence',
      institution: '',
      graduationYear: new Date().getFullYear(),
      assignedCourses: apiEmployee.courses?.map((course: any) => ({
        courseId: course.id,
        courseName: course.titre,
        classes: [],
        rooms: []
      })) || [],
      maxCourses: 3,
      availability: []
    } : undefined
  };
};

export const convertEmployeeToApi = (employee: Employee): CreateEmployeeApiPayload => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  phone: employee.phone,
  sexe: employee.gender === 'homme' ? 'M' : employee.gender === 'femme' ? 'F' : 'O',
  hireDate: employee.hireDate,
  dateOfBirth: employee.dateOfBirth,
  placeOfBirth: '', // À adapter selon les besoins
  communeOfBirth: '', // À adapter selon les besoins
  adresse: convertAddressToBackend(employee.address),
  role: FRONTEND_TO_BACKEND_ROLE[employee.type]?.[0] || 'USER',
  courseIds: employee.professorInfo?.assignedCourses?.map(c => c.courseId)
}); 