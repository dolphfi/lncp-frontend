/**
 * =====================================================
 * SCHÉMAS ZOD POUR LA VALIDATION DES HORAIRES
 * =====================================================
 * Validation des formulaires de gestion des emplois du temps
 */

import { z } from 'zod';
import { DayOfWeek, VacationType } from '../types/schedule';

// =====================================================
// SCHÉMAS POUR LES CRÉNEAUX HORAIRES
// =====================================================

/**
 * Schéma de validation pour un créneau horaire
 */
export const timeSlotSchema = z.object({
  startTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm:ss)'),
  endTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Format d\'heure invalide (HH:mm:ss)'),
  courseId: z.string().optional(),
  type: z.enum(['COURSE', 'BREAK'], {
    errorMap: () => ({ message: 'Le type doit être COURSE ou BREAK' })
  })
}).refine(
  (data) => {
    // Si le type est COURSE, le courseId est requis
    if (data.type === 'COURSE') {
      return data.courseId && data.courseId.length > 0;
    }
    // Si le type est BREAK, le courseId n'est pas requis
    return true;
  },
  {
    message: 'Le cours est requis pour les créneaux de type COURS',
    path: ['courseId']
  }
).refine(
  (data) => {
    // Valider que l'heure de fin est après l'heure de début
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);

    const startSeconds = start[0] * 3600 + start[1] * 60 + start[2];
    const endSeconds = end[0] * 3600 + end[1] * 60 + end[2];

    return endSeconds > startSeconds;
  },
  {
    message: 'L\'heure de fin doit être après l\'heure de début',
    path: ['endTime']
  }
);

// =====================================================
// SCHÉMA POUR CRÉER/METTRE À JOUR UN HORAIRE
// =====================================================

/**
 * Schéma de base pour un horaire (sans validation de chevauchement)
 */
const scheduleBaseSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  dayOfWeek: z.enum([
    'LUNDI', 
    'MARDI', 
    'MERCREDI', 
    'JEUDI', 
    'VENDREDI', 
    'SAMEDI', 
    'DIMANCHE'
  ], {
    errorMap: () => ({ message: 'Jour de la semaine invalide' })
  }),
  
  vacation: z.enum(['Matin (AM)', 'Après-midi (PM)'], {
    errorMap: () => ({ message: 'Période invalide' })
  }),
  
  classroomId: z.string()
    .min(1, 'La classe est requise'),
  
  roomId: z.string()
    .min(1, 'La salle est requise'),
  
  timeSlots: z.array(timeSlotSchema)
    .min(1, 'Au moins un créneau horaire est requis')
    .max(20, 'Vous ne pouvez pas ajouter plus de 20 créneaux')
});

/**
 * Schéma de validation pour créer un horaire (avec validation de chevauchement)
 */
export const createScheduleSchema = scheduleBaseSchema.refine(
  (data) => {
    // Valider qu'il n'y a pas de chevauchement entre les créneaux
    const slots = data.timeSlots;

    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];

        const start1 = slot1.startTime.split(':').map(Number);
        const end1 = slot1.endTime.split(':').map(Number);
        const start2 = slot2.startTime.split(':').map(Number);
        const end2 = slot2.endTime.split(':').map(Number);

        const start1Seconds = start1[0] * 3600 + start1[1] * 60 + start1[2];
        const end1Seconds = end1[0] * 3600 + end1[1] * 60 + end1[2];
        const start2Seconds = start2[0] * 3600 + start2[1] * 60 + start2[2];
        const end2Seconds = end2[0] * 3600 + end2[1] * 60 + end2[2];

        // Vérifier le chevauchement
        if (
          (start1Seconds < end2Seconds && end1Seconds > start2Seconds) ||
          (start2Seconds < end1Seconds && end2Seconds > start1Seconds)
        ) {
          return false;
        }
      }
    }

    return true;
  },
  {
    message: 'Les créneaux horaires ne peuvent pas se chevaucher',
    path: ['timeSlots']
  }
);

/**
 * Schéma de validation pour mettre à jour un horaire
 */
export const updateScheduleSchema = scheduleBaseSchema.partial();

// =====================================================
// SCHÉMA POUR LES FILTRES
// =====================================================

/**
 * Schéma de validation pour les filtres d'horaires
 */
export const scheduleFiltersSchema = z.object({
  search: z.string().optional(),
  day: z.enum([
    'LUNDI', 
    'MARDI', 
    'MERCREDI', 
    'JEUDI', 
    'VENDREDI', 
    'SAMEDI', 
    'DIMANCHE'
  ]).optional(),
  vacation: z.enum(['Matin (AM)', 'Après-midi (PM)']).optional(),
  classroomId: z.string().optional(),
  roomId: z.string().optional(),
  teacherId: z.string().optional()
});

// =====================================================
// TYPES INFÉRÉS DES SCHÉMAS
// =====================================================

export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;
export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>;
export type ScheduleFiltersFormData = z.infer<typeof scheduleFiltersSchema>;

// =====================================================
// OPTIONS POUR LES SELECTS
// =====================================================

export const DAY_OF_WEEK_OPTIONS = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' }
];

export const VACATION_OPTIONS = [
  { value: 'Matin (AM)', label: 'Matin (AM)' },
  { value: 'Après-midi (PM)', label: 'Après-midi (PM)' }
];

// Type pour les créneaux prédéfinis
export type PresetTimeSlot = {
  label: string;
  startTime: string;
  endTime: string;
  type: 'COURSE' | 'BREAK';
};

export const PRESET_TIME_SLOTS = {
  morning: [
    { label: '8h00 - 9h00', startTime: '08:00:00', endTime: '09:00:00', type: 'COURSE' as const },
    { label: '9h00 - 10h00', startTime: '09:00:00', endTime: '10:00:00', type: 'COURSE' as const },
    { label: '10h00 - 11h00', startTime: '10:00:00', endTime: '11:00:00', type: 'COURSE' as const },
    { label: '11h00 - 12h00', startTime: '11:00:00', endTime: '12:00:00', type: 'COURSE' as const }
  ] as const satisfies readonly PresetTimeSlot[],
  afternoon: [
    { label: '13h00 - 14h00', startTime: '13:00:00', endTime: '14:00:00', type: 'COURSE' as const },
    { label: '14h00 - 15h00', startTime: '14:00:00', endTime: '15:00:00', type: 'COURSE' as const },
    { label: '15h00 - 16h00', startTime: '15:00:00', endTime: '16:00:00', type: 'COURSE' as const },
    { label: '16h00 - 17h00', startTime: '16:00:00', endTime: '17:00:00', type: 'COURSE' as const }
  ] as const satisfies readonly PresetTimeSlot[]
};
