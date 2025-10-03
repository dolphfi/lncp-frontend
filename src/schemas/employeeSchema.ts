/**
 * =====================================================
 * SCHÉMAS DE VALIDATION ZOD POUR LES EMPLOYÉS
 * =====================================================
 * Validation des formulaires et données employés
 */

import { z } from 'zod';
import { BackendUserRole } from '../types/employee';

// =====================================================
// SCHÉMAS DE BASE
// =====================================================

// Schéma pour l'adresse backend
export const backendAddressSchema = z.object({
  adresseLigne1: z.string().min(1, 'Adresse requise'),
  departement: z.string().min(1, 'Département requis'),
  commune: z.string().min(1, 'Commune requise'),
  sectioncommunale: z.string().min(1, 'Section communale requise')
});

// Schéma pour les rôles backend
export const backendUserRoleSchema = z.enum([
  'SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'CENSORED',
  'COMPTABLE', 'SUPPLEANT', 'TEACHER', 'SECRETARY',
  'STUDENT', 'PARENT', 'USER'
]);

// =====================================================
// SCHÉMA PRINCIPAL POUR CRÉER UN EMPLOYÉ
// =====================================================

export const createEmployeeApiSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
    
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
    
  email: z.string()
    .email('Format email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
    
  phone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[\d\s+()-]+$/, 'Format de téléphone invalide'),
    
  sexe: z.enum(['M', 'F', 'O'], {
    required_error: 'Le sexe est requis',
    invalid_type_error: 'Sexe invalide'
  }),
  
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  
  handicap: z.boolean().optional(),
  
  hireDate: z.string()
    .min(1, 'Date d\'embauche requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    
  dateOfBirth: z.string()
    .min(1, 'Date de naissance requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    
  placeOfBirth: z.string()
    .min(1, 'Lieu de naissance requis')
    .max(100, 'Le lieu de naissance ne peut pas dépasser 100 caractères'),
    
  communeOfBirth: z.string()
    .min(1, 'Commune de naissance requise')
    .max(100, 'La commune de naissance ne peut pas dépasser 100 caractères'),
    
  adresse: backendAddressSchema,
  
  role: backendUserRoleSchema,
  
  courseIds: z.array(z.string().uuid('ID de cours invalide')).optional()
});

// =====================================================
// SCHÉMA POUR MISE À JOUR D'UN EMPLOYÉ
// =====================================================

export const updateEmployeeApiSchema = createEmployeeApiSchema.partial();

// =====================================================
// SCHÉMA POUR L'ASSIGNATION DE COURS
// =====================================================

export const courseAssignmentSchema = z.object({
  courseIds: z.array(z.string().uuid('ID de cours invalide'))
    .min(1, 'Au moins un cours doit être sélectionné')
    .max(10, 'Maximum 10 cours peuvent être assignés à la fois')
});

// =====================================================
// SCHÉMAS POUR LES FORMULAIRES FRONTEND
// =====================================================

// Schéma pour l'adresse frontend (interface utilisateur)
export const frontendAddressSchema = z.object({
  street: z.string().min(1, 'Rue requise'),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(1, 'Code postal requis'),
  country: z.string().min(1, 'Pays requis')
});

// Schéma pour le formulaire employé (interface utilisateur)
export const employeeFormSchema = z.object({
  // Informations personnelles
  employeeId: z.string().optional().or(z.literal('')),
  firstName: z.string().min(2, 'Prénom requis (min. 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone requis (min. 10 chiffres)'),
  
  // Informations démographiques
  dateOfBirth: z.string().min(1, 'Date de naissance requise'),
  gender: z.enum(['homme', 'femme', 'autre']),
  placeOfBirth: z.string().min(1, 'Lieu de naissance requis'),
  communeOfBirth: z.string().min(1, 'Commune de naissance requise'),
  
  // Adresse
  address: frontendAddressSchema,
  
  // Informations professionnelles
  hireDate: z.string().min(1, 'Date d\'embauche requise'),
  type: z.enum(['professeur', 'administratif', 'technique', 'direction', 'maintenance']),
  role: backendUserRoleSchema,
  status: z.enum(['actif', 'inactif', 'en_congé', 'retraité', 'démission']).optional(),
  
  // Optionnels
  avatar: z.string().optional(), // Base64 string ou URL
  handicap: z.boolean().optional(),
  notes: z.string().optional(),
  
  // Cours assignés (pour les professeurs)
  assignedCourseIds: z.array(z.string()).optional(),
  
  // Champs spécifiques aux professeurs
  specialty: z.union([z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique']), z.literal(''), z.undefined()]).optional(),
  secondarySpecialties: z.array(z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique'])).optional(),
  degree: z.union([z.enum(['licence', 'master', 'doctorat', 'agrégation', 'certification', 'bac', 'bts', 'dut']), z.literal(''), z.undefined()]).optional(),
  institution: z.string().optional(),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()).optional(),
  maxCourses: z.number().min(1).max(10).optional(),
  
  // Champs spécifiques aux administratifs
  department: z.string().optional(),
  position: z.string().optional(),
  supervisor: z.string().optional(),
  
  // Champs spécifiques aux techniques
  skills: z.array(z.string()).optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
  equipment: z.union([z.string(), z.array(z.string())]).optional()
});

// =====================================================
// TYPES INFÉRÉS
// =====================================================

export type CreateEmployeeApiFormData = z.infer<typeof createEmployeeApiSchema>;
export type UpdateEmployeeApiFormData = z.infer<typeof updateEmployeeApiSchema>;
export type CourseAssignmentFormData = z.infer<typeof courseAssignmentSchema>;
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// =====================================================
// FONCTIONS DE VALIDATION
// =====================================================

/**
 * Valider les données de création d'employé pour l'API
 */
export const validateCreateEmployeeApi = (data: unknown): CreateEmployeeApiFormData => {
  return createEmployeeApiSchema.parse(data);
};

/**
 * Valider les données de mise à jour d'employé pour l'API
 */
export const validateUpdateEmployeeApi = (data: unknown): UpdateEmployeeApiFormData => {
  return updateEmployeeApiSchema.parse(data);
};

/**
 * Valider les données d'assignation de cours
 */
export const validateCourseAssignment = (data: unknown): CourseAssignmentFormData => {
  return courseAssignmentSchema.parse(data);
};

/**
 * Valider les données du formulaire employé
 */
export const validateEmployeeForm = (data: unknown): EmployeeFormData => {
  return employeeFormSchema.parse(data);
};

// =====================================================
// CONSTANTES POUR LES FORMULAIRES
// =====================================================

// Options pour le sexe
export const SEXE_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
  { value: 'O', label: 'Autre' }
] as const;

// Options pour les rôles backend avec labels français
export const BACKEND_ROLE_OPTIONS = [
  { value: 'TEACHER', label: 'Enseignant', type: 'professeur' },
  { value: 'DIRECTOR', label: 'Directeur', type: 'direction' },
  { value: 'CENSORED', label: 'Censeur', type: 'direction' },
  { value: 'COMPTABLE', label: 'Comptable', type: 'administratif' },
  { value: 'SUPPLEANT', label: 'Suppléant', type: 'administratif' },
  { value: 'SECRETARY', label: 'Secrétaire', type: 'administratif' },
  { value: 'ADMIN', label: 'Administrateur', type: 'administratif' },
  { value: 'SUPER_ADMIN', label: 'Super Administrateur', type: 'administratif' }
] as const;

// Options pour les types d'employés frontend
export const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'professeur', label: 'Professeur' },
  { value: 'direction', label: 'Direction' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'technique', label: 'Technique' },
  { value: 'maintenance', label: 'Maintenance' }
] as const;
