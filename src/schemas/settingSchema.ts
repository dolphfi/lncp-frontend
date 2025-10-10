/**
 * =====================================================
 * SCHÉMAS DE VALIDATION ZOD POUR LES PARAMÈTRES
 * =====================================================
 * Validation des formulaires de paramètres système
 */

import { z } from 'zod';

// =====================================================
// SCHÉMA POUR CRÉER/MODIFIER UN PARAMÈTRE
// =====================================================

export const settingSchema = z.object({
  key: z.string()
    .min(1, 'La clé est requise')
    .regex(/^[A-Z_]+$/, 'La clé doit être en majuscules et underscores uniquement'),
  value: z.string().min(1, 'La valeur est requise'),
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
  group: z.enum(['GENERAL', 'FINANCIER', 'COMMUNICATION', 'ACADEMIQUE'], {
    required_error: 'Le groupe est requis',
  }),
});

// =====================================================
// SCHÉMA POUR MODIFIER UN PARAMÈTRE (tous les champs optionnels sauf validation)
// =====================================================

export const updateSettingSchema = z.object({
  value: z.string().min(1, 'La valeur est requise').optional(),
  label: z.string().min(1, 'Le libellé est requis').optional(),
  description: z.string().optional(),
  group: z.enum(['GENERAL', 'FINANCIER', 'COMMUNICATION', 'ACADEMIQUE']).optional(),
});

// =====================================================
// SCHÉMA POUR L'UPLOAD DE FICHIERS
// =====================================================

export const uploadFileSchema = z.object({
  file: z.instanceof(File, { message: 'Le fichier est requis' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Le fichier ne doit pas dépasser 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type),
      'Seuls les formats JPG, PNG et GIF sont acceptés'
    ),
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
});

// =====================================================
// TYPES INFÉRÉS
// =====================================================

export type SettingFormData = z.infer<typeof settingSchema>;
export type UpdateSettingFormData = z.infer<typeof updateSettingSchema>;
export type UploadFileFormData = z.infer<typeof uploadFileSchema>;
