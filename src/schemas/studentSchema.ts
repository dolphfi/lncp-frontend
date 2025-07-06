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
  name: z.string()
    .min(2, 'Le nom du parent doit contenir au moins 2 caractères')
    .max(100, 'Le nom du parent ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format de téléphone invalide'),
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
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
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format de téléphone invalide'),
  
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
  
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Veuillez sélectionner le sexe' })
  }),
  
  address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  
  // Informations scolaires
  grade: z.enum([
    'NSI', 'NSII', 'NSIII', 'NSIV'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner une classe valide' })
  }),
  
  enrollmentDate: z.string()
    .refine((date) => {
      const enrollmentDate = new Date(date);
      return enrollmentDate <= new Date();
    }, 'La date d\'inscription ne peut pas être dans le futur'),
  
  studentId: z.string()
    .min(5, 'Le matricule doit contenir au moins 5 caractères')
    .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le matricule ne peut contenir que des lettres majuscules et des chiffres'),
  
  parentContact: parentContactSchema,
  
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }),
  
  // Informations optionnelles
  avatar: z.string().url('Format d\'URL invalide').optional().or(z.literal(''))
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