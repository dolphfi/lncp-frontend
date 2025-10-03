/**
 * =====================================================
 * SCHÉMAS DE VALIDATION POUR LES NOTES ACADÉMIQUES
 * =====================================================
 * Validation des formulaires avec Yup
 * Même pattern que les autres schémas du projet
 */

import * as yup from 'yup';

// =====================================================
// SCHÉMAS POUR LES NOTES
// =====================================================

// Schéma pour la création d'une note (compatible backend)
// Note: La validation max est basée sur la pondération du cours (validation dynamique dans le composant)
export const noteCreateSchema = yup.object({
  studentId: yup
    .string()
    .required('L\'étudiant est requis')
    .min(1, 'L\'ID étudiant ne peut pas être vide'),

  courseId: yup
    .string()
    .required('Le cours est requis')
    .min(1, 'L\'ID cours ne peut pas être vide'),

  trimestre: yup
    .mixed<'T1' | 'T2' | 'T3'>()
    .required('Le trimestre est requis')
    .oneOf(['T1', 'T2', 'T3'], 'Le trimestre doit être T1, T2 ou T3'),

  note: yup
    .number()
    .required('La note est requise')
    .min(0, 'La note ne peut pas être négative')
    .max(1000, 'La note ne peut pas dépasser 1000')
    .test('decimal-places', 'La note ne peut avoir plus de 2 décimales', function(value) {
      if (value !== undefined && value !== null) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      }
      return true;
    }),
});

// Schéma pour la modification d'une note
export const noteUpdateSchema = yup.object({
  note: yup
    .number()
    .required('La note est requise')
    .min(0, 'La note ne peut pas être négative')
    .max(20, 'La note ne peut pas dépasser 20')
    .test('decimal-places', 'La note ne peut avoir plus de 2 décimales', function(value) {
      if (value !== undefined && value !== null) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      }
      return true;
    }),
});

// =====================================================
// SCHÉMAS POUR LES FILTRES ET RECHERCHE
// =====================================================

// Schéma pour les filtres de recherche de notes
export const noteFiltersSchema = yup.object({
  search: yup.string().optional(),
  studentId: yup.string().optional(),
  studentName: yup.string().optional(),
  courseId: yup.string().optional(),
  courseName: yup.string().optional(),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3'>().optional(),
  niveau: yup.string().optional(),
  classe: yup.string().optional(),
  dateFrom: yup.string().optional(),
  dateTo: yup.string().optional(),
  minNote: yup.number().optional().min(0).max(20),
  maxNote: yup.number().optional().min(0).max(20),
});

// Schéma pour la recherche d'étudiant par matricule
export const studentSearchSchema = yup.object({
  search: yup
    .string()
    .required('La recherche est requise')
    .min(2, 'La recherche doit contenir au moins 2 caractères')
    .max(50, 'La recherche ne peut pas dépasser 50 caractères'),
});

// Schéma pour la recherche de cours par code/titre
export const courseSearchSchema = yup.object({
  search: yup
    .string()
    .required('La recherche est requise')
    .min(2, 'La recherche doit contenir au moins 2 caractères')
    .max(50, 'La recherche ne peut pas dépasser 50 caractères'),
  niveau: yup.string().optional(),
});

// =====================================================
// SCHÉMAS POUR LES BULLETINS
// =====================================================

// Schéma pour la génération de bulletin individuel
export const bulletinIndividualSchema = yup.object({
  studentId: yup.string().required('Le matricule étudiant est requis'),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3' | 'ANNUEL'>().optional(),
});

// Schéma pour la génération de bulletin collectif
export const bulletinCollectifSchema = yup.object({
  niveau: yup.string().optional(),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3' | 'ANNUEL'>().required('Le trimestre est requis'),
  classe: yup.string().required('La classe est requise'),
});

// =====================================================
// SCHÉMAS POUR LES STATISTIQUES
// =====================================================

// Schéma pour les paramètres de statistiques
export const statisticsParamsSchema = yup.object({
  niveau: yup
    .string()
    .optional()
    .oneOf(['NSI', 'NSII', 'NSIII', 'NSIV'], 'Niveau invalide'),

  classe: yup
    .string()
    .optional()
    .min(2, 'La classe doit contenir au moins 2 caractères'),

  trimestre: yup
    .string()
    .optional()
    .oneOf(['T1', 'T2', 'T3', 'ANNUEL'], 'Le trimestre doit être T1, T2, T3 ou ANNUEL'),

  limit: yup
    .number()
    .optional()
    .positive('La limite doit être positive')
    .max(100, 'La limite ne peut pas dépasser 100'),
});

// =====================================================
// SCHÉMAS POUR L'EXPORT
// =====================================================

// Schéma pour l'export de données
export const exportParamsSchema = yup.object({
  format: yup
    .string()
    .required('Le format d\'export est requis')
    .oneOf(['PDF', 'EXCEL', 'CSV'], 'Format d\'export invalide'),

  type: yup
    .string()
    .required('Le type d\'export est requis')
    .oneOf(['NOTES', 'BULLETIN_INDIVIDUEL', 'BULLETIN_COLLECTIF', 'STATISTIQUES'], 'Type d\'export invalide'),

  filters: yup
    .object()
    .optional(),

  includeDetails: yup
    .boolean()
    .optional()
    .default(true),

  includeStatistics: yup
    .boolean()
    .optional()
    .default(false),
});

// =====================================================
// SCHÉMAS POUR L'IMPORT
// =====================================================

// Schéma pour la validation des données d'import
export const importDataSchema = yup.object({
  file: yup
    .mixed()
    .required('Le fichier est requis')
    .test('fileType', 'Le fichier doit être au format Excel (.xlsx) ou CSV (.csv)', function(value: any) {
      if (!value) return false;
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      return allowedTypes.includes(value.type);
    })
    .test('fileSize', 'Le fichier ne peut pas dépasser 5 MB', function(value: any) {
      if (!value) return false;
      return value.size <= 5 * 1024 * 1024; // 5 MB
    }),

  validateData: yup
    .boolean()
    .optional()
    .default(true),

  skipDuplicates: yup
    .boolean()
    .optional()
    .default(true),

  updateExisting: yup
    .boolean()
    .optional()
    .default(false),
});

// =====================================================
// SCHÉMAS POUR LA VALIDATION EN TEMPS RÉEL
// =====================================================

// Schéma pour la validation rapide des notes (sans cours)
export const noteValidationSchema = yup.object({
  note: yup
    .number()
    .required('La note est requise')
    .min(0, 'La note ne peut pas être négative')
    .max(20, 'La note ne peut pas dépasser 20')
    .test('decimal-places', 'La note ne peut avoir plus de 2 décimales', function(value) {
      if (value !== undefined && value !== null) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      }
      return true;
    }),
});

// Schéma pour la validation avec pondération du cours
export const noteWithPonderationSchema = yup.object({
  note: yup
    .number()
    .required('La note est requise')
    .min(0, 'La note ne peut pas être négative')
    .test('note-ponderation', 'La note ne peut pas dépasser la pondération du cours', function(value) {
      const { coursePonderation } = this.parent;
      if (coursePonderation && value && value > coursePonderation) {
        return this.createError({
          message: `La note ne peut pas dépasser ${coursePonderation} (pondération du cours)`,
        });
      }
      return true;
    })
    .test('decimal-places', 'La note ne peut avoir plus de 2 décimales', function(value) {
      if (value !== undefined && value !== null) {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        return decimalPlaces <= 2;
      }
      return true;
    }),
});

// =====================================================
// TYPES TYPESCRIPT INFÉRÉS
// =====================================================

// Types inférés des schémas pour TypeScript
export type NoteCreateFormData = yup.InferType<typeof noteCreateSchema>;
export type NoteUpdateFormData = yup.InferType<typeof noteUpdateSchema>;
export type NoteFiltersFormData = yup.InferType<typeof noteFiltersSchema>;
export type StudentSearchFormData = yup.InferType<typeof studentSearchSchema>;
export type CourseSearchFormData = yup.InferType<typeof courseSearchSchema>;
export type BulletinIndividualFormData = yup.InferType<typeof bulletinIndividualSchema>;
export type BulletinCollectifFormData = yup.InferType<typeof bulletinCollectifSchema>;
export type StatisticsParamsFormData = yup.InferType<typeof statisticsParamsSchema>;
export type ExportParamsFormData = yup.InferType<typeof exportParamsSchema>;
export type ImportDataFormData = yup.InferType<typeof importDataSchema>;
export type NoteValidationFormData = yup.InferType<typeof noteValidationSchema>;
export type NoteWithPonderationFormData = yup.InferType<typeof noteWithPonderationSchema>;

// =====================================================
// MESSAGES D'ERREUR PERSONNALISÉS
// =====================================================

// Configuration des messages d'erreur en français
yup.setLocale({
  mixed: {
    default: 'Valeur invalide',
    required: 'Ce champ est requis',
    notType: 'Type de données invalide',
  },
  string: {
    min: ({ min }) => `Doit contenir au moins ${min} caractères`,
    max: ({ max }) => `Ne peut pas dépasser ${max} caractères`,
    matches: 'Format invalide',
    email: 'Adresse email invalide',
  },
  number: {
    min: ({ min }) => `Doit être supérieur ou égal à ${min}`,
    max: ({ max }) => `Doit être inférieur ou égal à ${max}`,
    positive: 'Doit être un nombre positif',
    integer: 'Doit être un nombre entier',
  },
  date: {
    min: ({ min }) => `Doit être après le ${min}`,
    max: ({ max }) => `Doit être avant le ${max}`,
  },
  array: {
    min: ({ min }) => `Doit contenir au moins ${min} éléments`,
    max: ({ max }) => `Ne peut pas contenir plus de ${max} éléments`,
  },
});

// =====================================================
// CONSTANTES POUR LES OPTIONS DE FORMULAIRE
// =====================================================

// Options pour les trimestres
export const TRIMESTRE_OPTIONS = [
  { value: 'T1', label: 'Premier Trimestre', description: 'T1' },
  { value: 'T2', label: 'Deuxième Trimestre', description: 'T2' },
  { value: 'T3', label: 'Troisième Trimestre', description: 'T3' }
];

// Options pour les niveaux
export const NIVEAU_OPTIONS = [
  { value: 'NSI', label: 'NS I' },
  { value: 'NSII', label: 'NS II' },
  { value: 'NSIII', label: 'NS III' },
  { value: 'NSIV', label: 'NS IV' }
];

// Options pour les formats d'export
export const EXPORT_FORMAT_OPTIONS = [
  { value: 'PDF', label: 'PDF' },
  { value: 'EXCEL', label: 'Excel' },
  { value: 'CSV', label: 'CSV' }
];

// Options pour les types d'export
export const EXPORT_TYPE_OPTIONS = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'BULLETIN_INDIVIDUEL', label: 'Bulletin Individuel' },
  { value: 'BULLETIN_COLLECTIF', label: 'Bulletin Collectif' },
  { value: 'STATISTIQUES', label: 'Statistiques' }
];

// =====================================================
// FONCTIONS DE VALIDATION PERSONNALISÉES
// =====================================================

// Valider qu'une note est compatible avec la pondération du cours
export const validateNoteWithPonderation = (note: number, ponderation: number): boolean => {
  return note >= 0 && note <= ponderation;
};

// Valider qu'une note a au maximum 2 décimales
export const validateNoteDecimals = (note: number): boolean => {
  const decimalPlaces = (note.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

// Valider un trimestre
export const validateTrimestre = (trimestre: string): trimestre is 'T1' | 'T2' | 'T3' => {
  return ['T1', 'T2', 'T3'].includes(trimestre);
};

// Valider un niveau
export const validateNiveau = (niveau: string): boolean => {
  return ['NSI', 'NSII', 'NSIII', 'NSIV'].includes(niveau);
};

// =====================================================
// SCHÉMAS POUR LES VALIDATIONS ASYNCHRONES
// =====================================================

// Schéma pour vérifier l'existence d'un étudiant
export const studentExistsSchema = yup.object({
  studentId: yup
    .string()
    .required('Le matricule étudiant est requis')
    .test('student-exists', 'Étudiant non trouvé', async function(value) {
      if (!value) return false;

      try {
        // TODO: Remplacer par un appel API réel
        // const response = await api.get(`/students/verify/${value}`);
        // return response.data.exists;

        // Simulation temporaire
        return value.length >= 3;
      } catch (error) {
        return this.createError({
          message: 'Erreur lors de la vérification de l\'étudiant'
        });
      }
    }),
});

// Schéma pour vérifier l'existence d'un cours
export const courseExistsSchema = yup.object({
  courseId: yup
    .string()
    .required('Le cours est requis')
    .test('course-exists', 'Cours non trouvé', async function(value) {
      if (!value) return false;

      try {
        // TODO: Remplacer par un appel API réel
        // const response = await api.get(`/courses/verify/${value}`);
        // return response.data.exists;

        // Simulation temporaire
        return value.length >= 1;
      } catch (error) {
        return this.createError({
          message: 'Erreur lors de la vérification du cours'
        });
      }
    }),
});

export default {
  noteCreateSchema,
  noteUpdateSchema,
  noteFiltersSchema,
  studentSearchSchema,
  courseSearchSchema,
  bulletinIndividualSchema,
  bulletinCollectifSchema,
  statisticsParamsSchema,
  exportParamsSchema,
  importDataSchema,
  noteValidationSchema,
  noteWithPonderationSchema,
  studentExistsSchema,
  courseExistsSchema
};
