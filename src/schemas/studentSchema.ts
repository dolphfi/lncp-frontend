/**
 * =====================================================
 * SCHÉMAS DE VALIDATION ZOD POUR LES ÉLÈVES
 * =====================================================
 * Ce fichier contient tous les schémas de validation
 * pour les formulaires d'élèves avec Zod
 */

import { z } from 'zod';

// =====================================================
// CONSTANTES POUR LES OPTIONS DE SÉLECTION
// =====================================================
export const GRADE_OPTIONS = [
  { value: 'NSI', label: 'NSI' },
  { value: 'NSII', label: 'NSII' },
  { value: 'NSIII', label: 'NSIII' },
  { value: 'NSIV', label: 'NSIV' }
] as const;

export const LEVEL_OPTIONS = [
  { value: 'secondaire', label: 'Secondaire' },
  { value: 'nouveauSecondaire', label: 'Nouveau Secondaire' }
] as const;

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' }
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' }
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: 'père', label: 'Père' },
  { value: 'mère', label: 'Mère' },
  { value: 'tuteur', label: 'Tuteur' },
  { value: 'tutrice', label: 'Tutrice' },
  { value: 'grand-parent', label: 'Grand-parent' },
  { value: 'autre', label: 'Autre' }
] as const;

// =====================================================
// SCHÉMA POUR LES INFORMATIONS DU PARENT/TUTEUR
// =====================================================
export const parentContactSchema = z.object({
  // Noms des parents
  fatherName: z.string()
    .min(1, 'Le nom du père est requis')
    .max(100, 'Le nom du père ne peut pas dépasser 100 caractères')
    .optional(),
  
  motherName: z.string()
    .min(1, 'Le nom de la mère est requis')
    .max(100, 'Le nom de la mère ne peut pas dépasser 100 caractères')
    .optional(),
  
  // Personne responsable
  responsiblePerson: z.string()
    .min(2, 'Le nom de la personne responsable doit contenir au moins 2 caractères')
    .max(100, 'Le nom de la personne responsable ne peut pas dépasser 100 caractères'),
  
  // Contact
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format de téléphone invalide'),
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),
  
  // Adresse des parents
  address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),
  
  relationship: z.enum(['père', 'mère', 'tuteur', 'tutrice', 'grand-parent', 'autre'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une relation valide' })
  })
});

// =====================================================
// SCHÉMA PRINCIPAL POUR LA CRÉATION D'ÉLÈVE
// =====================================================
export const createStudentSchema = z.object({
  // Informations personnelles
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, 'Le prénom ne peut contenir que des lettres'),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, 'Le nom ne peut contenir que des lettres'),
  
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Veuillez sélectionner le sexe' })
  }),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 5 && age <= 25;
    }, 'L\'âge doit être compris entre 5 et 25 ans')
    .refine((date) => {
      const birthDate = new Date(date);
      return birthDate <= new Date();
    }, 'La date de naissance ne peut pas être dans le futur'),
  
  placeOfBirth: z.string()
    .min(2, 'Le lieu de naissance doit contenir au moins 2 caractères')
    .max(100, 'Le lieu de naissance ne peut pas dépasser 100 caractères'),
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),
  
  // N° d'ordre 9ème AF
  ninthGradeOrderNumber: z.string()
    .min(1, 'Le N° d\'ordre 9ème AF est requis')
    .max(20, 'Le N° d\'ordre ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9\-\/]+$/, 'Format de N° d\'ordre invalide'),
  
  // Informations scolaires actuelles
  level: z.enum(['secondaire', 'nouveauSecondaire'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un niveau valide' })
  }),
  
  grade: z.enum([
    'NSI', 'NSII', 'NSIII', 'NSIV'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner une classe valide' })
  }),
  
  // Salle assignée
  roomId: z.string()
    .min(1, 'Veuillez sélectionner une salle')
    .optional(),
  
  // Informations scolaires précédentes
  ninthGradeSchool: z.string()
    .min(1, 'L\'école où l\'élève a fait la 9e est requise')
    .max(150, 'Le nom de l\'école ne peut pas dépasser 150 caractères')
    .optional(),
  
  ninthGradeGraduationYear: z.string()
    .regex(/^\d{4}$/, 'L\'année doit être au format YYYY')
    .refine((year) => {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      return yearNum >= 1990 && yearNum <= currentYear;
    }, 'L\'année doit être comprise entre 1990 et l\'année actuelle')
    .optional(),
  
  lastSchool: z.string()
    .min(1, 'Le dernier établissement est requis')
    .max(150, 'Le nom de l\'établissement ne peut pas dépasser 150 caractères')
    .optional(),
  
  // Informations administratives
  enrollmentDate: z.string()
    .refine((date) => {
      const enrollmentDate = new Date(date);
      return enrollmentDate <= new Date();
    }, 'La date d\'inscription ne peut pas être dans le futur'),
  
  studentId: z.string()
    .min(5, 'Le matricule doit contenir au moins 5 caractères')
    .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le matricule ne peut contenir que des lettres majuscules et des chiffres'),
  
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }),
  
  // Image de profil
  avatar: z.string().url('Format d\'URL invalide').optional().or(z.literal('')),
  
  // Informations des parents/tuteurs
  parentContact: parentContactSchema
});

// =====================================================
// SCHÉMA POUR LA MISE À JOUR D'ÉLÈVE
// =====================================================
export const updateStudentSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, 'Le prénom ne peut contenir que des lettres')
    .optional(),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, 'Le nom ne peut contenir que des lettres')
    .optional(),
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),
  
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format de téléphone invalide')
    .optional(),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 5 && age <= 25;
    }, 'L\'âge doit être compris entre 5 et 25 ans')
    .refine((date) => {
      const birthDate = new Date(date);
      return birthDate <= new Date();
    }, 'La date de naissance ne peut pas être dans le futur')
    .optional(),
  
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Veuillez sélectionner le sexe' })
  }).optional(),
  
  address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),
  
  grade: z.enum([
    'NSI', 'NSII', 'NSIII', 'NSIV'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner une classe valide' })
  }).optional(),
  
  // Salle assignée
  roomId: z.string()
    .min(1, 'Veuillez sélectionner une salle')
    .optional(),
  
  enrollmentDate: z.string()
    .refine((date) => {
      const enrollmentDate = new Date(date);
      return enrollmentDate <= new Date();
    }, 'La date d\'inscription ne peut pas être dans le futur')
    .optional(),
  
  studentId: z.string()
    .min(5, 'Le matricule doit contenir au moins 5 caractères')
    .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le matricule ne peut contenir que des lettres majuscules et des chiffres')
    .optional(),
  
  parentContact: parentContactSchema.optional(),
  
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }).optional(),
  
  avatar: z.string().url('Format d\'URL invalide').optional().or(z.literal(''))
});

// =====================================================
// TYPES TYPESCRIPT INFÉRÉS
// =====================================================
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;
export type ParentContactFormData = z.infer<typeof parentContactSchema>;

// =====================================================
// SCHÉMAS POUR LES FILTRES DE RECHERCHE
// =====================================================
export const studentFiltersSchema = z.object({
  search: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  gender: z.enum(['male', 'female']).optional(),
  enrollmentYear: z.string().optional()
});

export type StudentFilters = z.infer<typeof studentFiltersSchema>;

// =====================================================
// SCHÉMA POUR LES PARAMÈTRES DE PAGINATION
// =====================================================
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export type PaginationParams = z.infer<typeof paginationSchema>; 