import * as yup from 'yup';

// Schéma pour la création d'une note
export const noteCreateSchema = yup.object({
  student_id: yup
    .number()
    .required('L\'étudiant est requis')
    .positive('L\'ID étudiant doit être positif'),
  
  course_id: yup
    .number()
    .required('Le cours est requis')
    .positive('L\'ID cours doit être positif'),
  
  trimestre: yup
    .mixed<'T1' | 'T2' | 'T3'>()
    .required('Le trimestre est requis')
    .oneOf(['T1', 'T2', 'T3'], 'Le trimestre doit être T1, T2 ou T3'),
  
  note: yup
    .number()
    .required('La note est requise')
    .min(0, 'La note ne peut pas être négative')
    .max(20, 'La note ne peut pas dépasser 20')
    .test('note-ponderation', 'La note ne peut pas dépasser la pondération du cours', function(value) {
      const { course_ponderation } = this.parent;
      if (course_ponderation && value && value > course_ponderation) {
        return this.createError({
          message: `La note ne peut pas dépasser ${course_ponderation} (pondération du cours)`,
        });
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
    .max(20, 'La note ne peut pas dépasser 20'),
});

// Schéma pour la recherche d'étudiant par matricule
export const studentSearchSchema = yup.object({
  matricule: yup
    .string()
    .required('Le matricule est requis')
    .min(3, 'Le matricule doit contenir au moins 3 caractères')
    .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
    .matches(/^[A-Za-z0-9]+$/, 'Le matricule ne peut contenir que des lettres et des chiffres'),
});

// Schéma pour la recherche de cours par code
export const courseSearchSchema = yup.object({
  code: yup
    .string()
    .required('Le code du cours est requis')
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(10, 'Le code ne peut pas dépasser 10 caractères')
    .matches(/^[A-Za-z0-9]+$/, 'Le code ne peut contenir que des lettres et des chiffres'),
});

// Schéma pour les filtres de recherche de notes
export const noteFiltersSchema = yup.object({
  student_matricule: yup.string().optional(),
  student_name: yup.string().optional(),
  course_code: yup.string().optional(),
  course_name: yup.string().optional(),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3'>().optional(),
  niveau: yup.string().optional(),
  classe: yup.string().optional(),
  date_from: yup.string().optional(),
  date_to: yup.string().optional(),
});

// Schéma pour la génération de bulletin individuel
export const bulletinIndividualSchema = yup.object({
  matricule: yup.string().required('Le matricule est requis'),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3' | 'ANNUEL'>().optional(),
});

// Schéma pour la génération de bulletin collectif
export const bulletinCollectifSchema = yup.object({
  niveau: yup.string().optional(),
  trimestre: yup.mixed<'T1' | 'T2' | 'T3' | 'ANNUEL'>().required('Le trimestre est requis'),
  classe: yup.string().required('La classe est requise'),
});

// Schéma pour les paramètres de statistiques
export const statisticsParamsSchema = yup.object({
  niveau: yup
    .string()
    .optional()
    .oneOf(['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Tle'], 'Niveau invalide'),
  
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
  
  include_details: yup
    .boolean()
    .optional()
    .default(true),
  
  include_statistics: yup
    .boolean()
    .optional()
    .default(false),
});

// Schéma pour la validation en temps réel des notes
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
  
  validate_data: yup
    .boolean()
    .optional()
    .default(true),
  
  skip_duplicates: yup
    .boolean()
    .optional()
    .default(true),
  
  update_existing: yup
    .boolean()
    .optional()
    .default(false),
});

// Types TypeScript pour les schémas
export type NoteCreateFormData = yup.InferType<typeof noteCreateSchema>;
export type NoteUpdateFormData = yup.InferType<typeof noteUpdateSchema>;
export type StudentSearchFormData = yup.InferType<typeof studentSearchSchema>;
export type CourseSearchFormData = yup.InferType<typeof courseSearchSchema>;
export type NoteFiltersFormData = yup.InferType<typeof noteFiltersSchema>;
export type BulletinIndividualFormData = yup.InferType<typeof bulletinIndividualSchema>;
export type BulletinCollectifFormData = yup.InferType<typeof bulletinCollectifSchema>;
export type StatisticsParamsFormData = yup.InferType<typeof statisticsParamsSchema>;
export type ExportParamsFormData = yup.InferType<typeof exportParamsSchema>;
export type NoteValidationFormData = yup.InferType<typeof noteValidationSchema>;
export type ImportDataFormData = yup.InferType<typeof importDataSchema>;

// Messages d'erreur personnalisés en français
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
