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

export type EmployeeType = 'professeur' | 'administratif' | 'technique' | 'direction' | 'maintenance';

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

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

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

export interface EmployeeApiResponse<T> {
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