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
  { value: 'secondaire', label: 'Secondaire' },
  { value: '3e_cycle', label: '3e Cycle' },
  { value: 'fondamentale', label: 'Fondamentale' }
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

export const VACATION_OPTIONS = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' }
];

export const TEACHING_LEVEL_OPTIONS = [
  { value: 'Fondamentale', label: 'Fondamentale' },
  { value: 'Secondaire', label: 'Secondaire' }
];

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
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .regex(/^[+]?[0-9\s\-()]+$/, "Format de téléphone invalide"),
  
  email: z.string()
    .email("Format d'email invalide")
    .min(1, "L'email est requis"),
  
  // Adresse des parents
  address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),
  
  postalCode: z.string()
    .min(5, "Le code postal doit contenir 5 chiffres")
    .regex(/^[0-9]{5}$/, "Format de code postal invalide"),
  
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
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom ne peut contenir que des lettres'),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres'),
  
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Veuillez sélectionner le sexe' })
  }),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      return birthDate <= new Date();
    }, 'La date de naissance ne peut pas être dans le futur')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      // Calcul précis de l'âge en tenant compte du mois et du jour
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 5;
    }, 'L\'étudiant doit avoir au moins 5 ans'),
  
  placeOfBirth: z.string().trim()
    .min(2, 'Le lieu de naissance doit contenir au moins 2 caractères')
    .max(100, 'Le lieu de naissance ne peut pas dépasser 100 caractères'),

  // Champs backend supplémentaires
  communeDeNaissance: z.string().trim()
    .min(2, 'La commune de naissance doit contenir au moins 2 caractères')
    .max(100, 'La commune de naissance ne peut pas dépasser 100 caractères'),
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),
  
  // N° d'ordre 9ème AF
  ninthGradeOrderNumber: z.string()
    .min(1, 'Le N° d\'ordre 9ème AF est requis')
    .max(20, 'Le N° d\'ordre ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9\-/]+$/, 'Format de N° d\'ordre invalide'),
  
  // Informations scolaires actuelles
  level: z.enum(['secondaire', 'nouveauSecondaire'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un niveau valide' })
  }),
  
  grade: z.enum([
    'secondaire', '3e_cycle', 'fondamentale'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner un niveau d\'étude valide' })
  }),

  // Id de la classe backend choisie (pilotera la liste des salles)
  selectedClassroomId: z.string().min(1, 'Veuillez sélectionner une classe (backend)'),
  
  // Salle assignée
  roomId: z.string()
    .min(1, 'Veuillez sélectionner une salle')
    .optional(),

  // Informations administratives requises par l'API
  vacation: z.enum(['AM', 'PM'], {
    errorMap: () => ({ message: 'Veuillez sélectionner la vacation (AM/PM)' })
  }),
  niveauEnseignement: z.enum(['Fondamentale', 'Secondaire'], {
    errorMap: () => ({ message: "Veuillez sélectionner le niveau d'enseignement" })
  }),
  hasHandicap: z.boolean().default(false),
  handicapDetails: z.string().optional(),
  adresse: z.string().trim().min(1, "L'adresse de l'élève est requise"),
  
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
    .regex(/^[A-Z0-9]+$/, 'Le matricule ne peut contenir que des lettres majuscules et des chiffres')
    .optional(),
  
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un statut valide' })
  }),

  // Champs parentaux détaillés (backend)
  nomMere: z.string().trim().min(1, 'Le nom de la mère est requis'),
  prenomMere: z.string().trim().min(1, 'Le prénom de la mère est requis'),
  statutMere: z.string().trim().min(1, 'Le statut de la mère est requis'),
  occupationMere: z.string().optional(),
  nomPere: z.string().trim().min(1, 'Le nom du père est requis'),
  prenomPere: z.string().trim().min(1, 'Le prénom du père est requis'),
  statutPere: z.string().trim().min(1, 'Le statut du père est requis'),
  occupationPere: z.string().optional(),

  // Gestion de la personne responsable: sélectionner ou créer
  responsableMode: z.enum(['select', 'create']).default('create'),
  personneResponsableId: z.string().optional(),
  responsable: z.object({
    firstName: z.string().min(1, 'Le prénom du responsable est requis'),
    lastName: z.string().min(1, 'Le nom du responsable est requis'),
    email: z.string().email('Email du responsable invalide').optional(),
    phone: z.string().optional(),
    lienParente: z.string().min(1, 'Le lien de parenté est requis'),
    nif: z.string().optional(),
    ninu: z.string().optional()
  }).optional(),
  
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
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom ne peut contenir que des lettres')
    .optional(),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres')
    .optional(),
  
  email: z.string()
    .email('Format email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),
  
  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Format de téléphone invalide')
    .optional(),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      return birthDate <= new Date();
    }, 'La date de naissance ne peut pas être dans le futur')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      // Calcul précis de l'âge en tenant compte du mois et du jour
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 5;
    }, 'L\'étudiant doit avoir au moins 5 ans')
    .optional(),
  
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Veuillez sélectionner le sexe' })
  }).optional(),
  
  address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),
  
  grade: z.enum([
    'secondaire', '3e_cycle', 'fondamentale'
  ], {
    errorMap: () => ({ message: 'Veuillez sélectionner un niveau d\'étude valide' })
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