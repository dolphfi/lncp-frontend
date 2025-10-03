/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES HORAIRES
 * =====================================================
 * Types backend-compatible pour la gestion des emplois du temps
 * Compatible avec les endpoints /schedules/*
 */

// =====================================================
// ENUMS ET TYPES DE BASE
// =====================================================

/**
 * Jours de la semaine (format backend)
 */
export type DayOfWeek = 
  | 'LUNDI' 
  | 'MARDI' 
  | 'MERCREDI' 
  | 'JEUDI' 
  | 'VENDREDI' 
  | 'SAMEDI' 
  | 'DIMANCHE';

/**
 * Périodes de la journée (vacation)
 */
export type VacationType = 'Matin (AM)' | 'Après-midi (PM)';

/**
 * Options pour les jours de la semaine
 */
export const DAY_OF_WEEK_OPTIONS = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' }
] as const;

/**
 * Options pour les périodes
 */
export const VACATION_OPTIONS = [
  { value: 'Matin (AM)', label: 'Matin (AM)' },
  { value: 'Après-midi (PM)', label: 'Après-midi (PM)' }
] as const;

// =====================================================
// TYPES POUR LES CRÉNEAUX HORAIRES (TIME SLOTS)
// =====================================================

/**
 * Créneau horaire dans un emploi du temps
 */
export interface TimeSlot {
  id?: string;
  startTime: string;        // Format: "HH:mm" (ex: "08:00")
  endTime: string;          // Format: "HH:mm" (ex: "09:00")
  courseId: string;         // ID du cours
  teacherId?: string;       // ID du professeur (optionnel)
  courseName?: string;      // Nom du cours (pour affichage)
  teacherName?: string;     // Nom du professeur (pour affichage)
}

// =====================================================
// TYPES POUR LES HORAIRES (SCHEDULES)
// =====================================================

/**
 * Horaire complet (emploi du temps)
 */
export interface Schedule {
  id: string;
  name: string;                   // Ex: "Monday Schedule for Grade 5"
  dayOfWeek: DayOfWeek;          // Jour de la semaine
  vacation: VacationType;        // Matin ou Après-midi
  classroomId: string;           // ID de la classe
  roomId: string;                // ID de la salle
  timeSlots: TimeSlot[];         // Créneaux horaires
  
  // Informations relationnelles (pour affichage)
  classroom?: {
    id: string;
    name: string;
    niveau: string;
  };
  room?: {
    id: string;
    name: string;
    capacity?: number;
  };
  
  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * DTO pour créer un horaire
 */
export interface CreateScheduleDto {
  name: string;
  dayOfWeek: DayOfWeek;
  vacation: VacationType;
  classroomId: string;
  roomId: string;
  timeSlots: TimeSlot[];
}

/**
 * DTO pour mettre à jour un horaire
 */
export interface UpdateScheduleDto {
  name?: string;
  dayOfWeek?: DayOfWeek;
  vacation?: VacationType;
  classroomId?: string;
  roomId?: string;
  timeSlots?: TimeSlot[];
}

/**
 * Réponse API pour un horaire
 */
export interface ScheduleApiResponse {
  id: string;
  name: string;
  dayOfWeek: DayOfWeek;
  vacation: VacationType;
  classroomId: string;
  roomId: string;
  timeSlots: TimeSlot[];
  classroom?: any;
  room?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Réponse API paginée pour les horaires
 */
export interface ScheduleListApiResponse {
  data: ScheduleApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// TYPES POUR LES FILTRES
// =====================================================

/**
 * Filtres pour la recherche d'horaires
 */
export interface ScheduleFilters {
  search?: string;              // Recherche par nom
  day?: DayOfWeek;             // Filtre par jour
  vacation?: VacationType;      // Filtre par période
  classroomId?: string;        // Filtre par classe
  roomId?: string;             // Filtre par salle
  teacherId?: string;          // Filtre par professeur
}

/**
 * Options de pagination pour les horaires
 */
export interface SchedulePaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================================================
// TYPES POUR LES STATISTIQUES
// =====================================================

/**
 * Statistiques sur les horaires
 */
export interface ScheduleStats {
  total: number;
  byDay: Record<DayOfWeek, number>;
  byVacation: Record<VacationType, number>;
  byClassroom: Record<string, number>;
  averageTimeSlotsPerSchedule: number;
}

// =====================================================
// TYPES POUR LES ERREURS API
// =====================================================

/**
 * Erreur API pour les horaires
 */
export interface ScheduleApiError {
  message: string;
  code: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

/**
 * Convertir un horaire de l'API vers le format frontend
 */
export const convertScheduleFromApi = (apiSchedule: ScheduleApiResponse): Schedule => {
  return {
    id: apiSchedule.id,
    name: apiSchedule.name,
    dayOfWeek: apiSchedule.dayOfWeek,
    vacation: apiSchedule.vacation,
    classroomId: apiSchedule.classroomId,
    roomId: apiSchedule.roomId,
    timeSlots: apiSchedule.timeSlots || [],
    classroom: apiSchedule.classroom,
    room: apiSchedule.room,
    createdAt: apiSchedule.createdAt,
    updatedAt: apiSchedule.updatedAt
  };
};

/**
 * Convertir un horaire du frontend vers le format API
 */
export const convertScheduleToApi = (schedule: CreateScheduleDto): CreateScheduleDto => {
  return {
    name: schedule.name,
    dayOfWeek: schedule.dayOfWeek,
    vacation: schedule.vacation,
    classroomId: schedule.classroomId,
    roomId: schedule.roomId,
    timeSlots: schedule.timeSlots
  };
};

/**
 * Obtenir le label d'un jour de la semaine
 */
export const getDayLabel = (day: DayOfWeek): string => {
  const option = DAY_OF_WEEK_OPTIONS.find(opt => opt.value === day);
  return option?.label || day;
};

/**
 * Obtenir le label d'une période
 */
export const getVacationLabel = (vacation: VacationType): string => {
  const option = VACATION_OPTIONS.find(opt => opt.value === vacation);
  return option?.label || vacation;
};

/**
 * Vérifier si un horaire est pour un jour spécifique
 */
export const isScheduleForDay = (schedule: Schedule, day: DayOfWeek): boolean => {
  return schedule.dayOfWeek === day;
};

/**
 * Vérifier si un horaire est pour une période spécifique
 */
export const isScheduleForVacation = (schedule: Schedule, vacation: VacationType): boolean => {
  return schedule.vacation === vacation;
};

/**
 * Trier les créneaux horaires par heure de début
 */
export const sortTimeSlotsByStartTime = (slots: TimeSlot[]): TimeSlot[] => {
  return [...slots].sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    
    // Comparer les heures
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }
    
    // Si les heures sont égales, comparer les minutes
    return timeA[1] - timeB[1];
  });
};
