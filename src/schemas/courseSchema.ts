/**
 * =====================================================
 * SCHÉMAS DE VALIDATION ZOD POUR LES COURS
 * =====================================================
 * Ce fichier contient tous les schémas de validation
 * pour les formulaires de cours avec Zod (École classique)
 */

import { z } from 'zod';

// =====================================================
// CONSTANTES POUR LES OPTIONS DE SÉLECTION
// =====================================================
export const COURSE_CATEGORY_OPTIONS = [
  { value: 'mathématiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'langues', label: 'Langues' },
  { value: 'histoire', label: 'Histoire' },
  { value: 'géographie', label: 'Géographie' },
  { value: 'arts', label: 'Arts' },
  { value: 'sport', label: 'Sport' },
  { value: 'informatique', label: 'Informatique' }
] as const;

export const COURSE_STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'en_attente', label: 'En attente' }
] as const;

export const GRADE_OPTIONS = [
  { value: 'NSI', label: 'NSI' },
  { value: 'NSII', label: 'NSII' },
  { value: 'NSIII', label: 'NSIII' },
  { value: 'NSIV', label: 'NSIV' }
] as const;

export const DAY_OPTIONS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' }
] as const;

// =====================================================
// SCHÉMA POUR LE PLANNING
// =====================================================
export const scheduleSchema = z.object({
  day: z.enum(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un jour valide' })
  }),
  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)')
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, 'Heure invalide'),
  endTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)')
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, 'Heure invalide')
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}:00`);
  const end = new Date(`2000-01-01T${data.endTime}:00`);
  return end > start;
}, {
  message: 'L\'heure de fin doit être après l\'heure de début',
  path: ['endTime']
});

// =====================================================
// SCHÉMA PRINCIPAL POUR LA CRÉATION DE COURS
// =====================================================
export const createCourseSchema = z.object({
  // Informations de base
  code: z.string()
    .min(3, 'Le code du cours doit contenir au moins 3 caractères')
    .max(20, 'Le code du cours ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne peut contenir que des lettres majuscules et des chiffres'),
  
  title: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
  
  // Catégorisation
  category: z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une catégorie valide' })
  }),
  
  // Pondération (coefficient du cours)
  weight: z.number()
    .min(100, 'La pondération doit être au moins 100')
    .max(1000, 'La pondération ne peut pas dépasser 1000')
    .refine((value) => value % 100 === 0, {
      message: 'La pondération doit être un multiple de 100 (100, 200, 300, etc.)'
    }),
  
  grade: z.enum(['NSI', 'NSII', 'NSIII', 'NSIV'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une classe valide' })
  }),
  

  
  // Planning
  schedule: z.array(scheduleSchema)
    .min(1, 'Au moins un créneau horaire est requis')
    .max(6, 'Maximum 6 créneaux horaires autorisés'),
  
  // Prérequis et objectifs
  prerequisites: z.array(z.string())
    .max(10, 'Maximum 10 prérequis autorisés'),
  
  objectives: z.array(z.string())
    .min(1, 'Au moins un objectif est requis')
    .max(15, 'Maximum 15 objectifs autorisés')
    .refine((objectives) => objectives.every(obj => obj.length >= 10), {
      message: 'Chaque objectif doit contenir au moins 10 caractères'
    }),
  
  // Matériels et programme
  materials: z.array(z.string())
    .max(20, 'Maximum 20 matériels autorisés'),
  
  syllabus: z.string()
    .min(50, 'Le programme doit contenir au moins 50 caractères')
    .max(2000, 'Le programme ne peut pas dépasser 2000 caractères'),
  
  // Statut
  status: z.enum(['actif', 'inactif', 'en_attente'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }),
  
  // Dates
  enrollmentStartDate: z.string()
    .refine((date) => {
      const enrollmentStart = new Date(date);
      return enrollmentStart >= new Date();
    }, 'La date de début des inscriptions ne peut pas être dans le passé'),
  
  enrollmentEndDate: z.string()
    .refine((date) => {
      const enrollmentEnd = new Date(date);
      return enrollmentEnd > new Date();
    }, 'La date de fin des inscriptions doit être dans le futur'),
  
  startDate: z.string()
    .refine((date) => {
      const start = new Date(date);
      return start > new Date();
    }, 'La date de début du cours doit être dans le futur'),
  
  endDate: z.string()
    .refine((date) => {
      const end = new Date(date);
      return end > new Date();
    }, 'La date de fin du cours doit être dans le futur')
}).refine((data) => {
  const enrollmentStart = new Date(data.enrollmentStartDate);
  const enrollmentEnd = new Date(data.enrollmentEndDate);
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  
  return enrollmentStart < enrollmentEnd && 
         enrollmentEnd <= start && 
         start < end;
}, {
  message: 'Les dates doivent être dans l\'ordre: début inscriptions < fin inscriptions ≤ début cours < fin cours',
  path: ['endDate']
});

// =====================================================
// SCHÉMA POUR LA MISE À JOUR DE COURS
// =====================================================
export const updateCourseSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  code: z.string()
    .min(3, 'Le code du cours doit contenir au moins 3 caractères')
    .max(20, 'Le code du cours ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne peut contenir que des lettres majuscules et des chiffres')
    .optional(),
  
  title: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .optional(),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  
  category: z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une catégorie valide' })
  }).optional(),
  
  weight: z.number()
    .min(100, 'La pondération doit être au moins 100')
    .max(1000, 'La pondération ne peut pas dépasser 1000')
    .refine((value) => value % 100 === 0, {
      message: 'La pondération doit être un multiple de 100 (100, 200, 300, etc.)'
    })
    .optional(),
  
  grade: z.enum(['NSI', 'NSII', 'NSIII', 'NSIV'], {
    errorMap: () => ({ message: 'Veuillez sélectionner une classe valide' })
  }).optional(),
  
  schedule: z.array(scheduleSchema)
    .min(1, 'Au moins un créneau horaire est requis')
    .max(6, 'Maximum 6 créneaux horaires autorisés')
    .optional(),
  
  prerequisites: z.array(z.string())
    .max(10, 'Maximum 10 prérequis autorisés')
    .optional(),
  
  objectives: z.array(z.string())
    .min(1, 'Au moins un objectif est requis')
    .max(15, 'Maximum 15 objectifs autorisés')
    .optional(),
  
  materials: z.array(z.string())
    .max(20, 'Maximum 20 matériels autorisés')
    .optional(),
  
  syllabus: z.string()
    .min(50, 'Le programme doit contenir au moins 50 caractères')
    .max(2000, 'Le programme ne peut pas dépasser 2000 caractères')
    .optional(),
  
  status: z.enum(['actif', 'inactif', 'en_attente'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }).optional(),
  
  enrollmentStartDate: z.string().optional(),
  enrollmentEndDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// =====================================================
// SCHÉMA POUR LES FILTRES
// =====================================================
export const courseFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['mathématiques', 'sciences', 'langues', 'histoire', 'géographie', 'arts', 'sport', 'informatique']).optional(),
  grade: z.string().optional(),
  status: z.enum(['actif', 'inactif', 'en_attente']).optional(),
  isActive: z.boolean().optional(),
  enrollmentYear: z.number().optional()
});

// =====================================================
// SCHÉMA POUR LA PAGINATION
// =====================================================
export const paginationSchema = z.object({
  page: z.number().min(1, 'La page doit être au moins 1'),
  limit: z.number().min(1, 'La limite doit être au moins 1').max(100, 'La limite ne peut pas dépasser 100')
});

// =====================================================
// TYPES EXPORTÉS
// =====================================================
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
export type ScheduleFormData = z.infer<typeof scheduleSchema>;
export type CourseFilters = z.infer<typeof courseFiltersSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>; 