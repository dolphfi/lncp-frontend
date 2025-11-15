/**
 * =====================================================
 * TYPES POUR LES BULLETINS (REPORT CARDS)
 * =====================================================
 * Types pour la génération et consultation des bulletins scolaires
 */

/**
 * Informations de l'étudiant dans le bulletin
 */
export interface StudentInfo {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classRoom: string;
  room: string;
}

/**
 * Note d'un cours dans un trimestre
 */
export interface CourseGrade {
  courseCode: string;
  courseTitre: string;
  ponderation: number;
  note: number | null;
}

/**
 * Notes par trimestre
 */
export interface Grades {
  trimestre1: CourseGrade[];
  trimestre2: CourseGrade[];
  trimestre3: CourseGrade[];
  moyenneTrimestre1: number;
  moyenneTrimestre2: number;
  moyenneTrimestre3: number;
  sumOfNotes1: number;
  sumOfNotes2: number;
  sumOfNotes3: number;
  ponderationTrimestre1: number;
  ponderationTrimestre2: number;
  ponderationTrimestre3: number;
}

/**
 * Bulletin complet d'un étudiant
 */
export interface ReportCard {
  studentInfo: StudentInfo;
  grades: Grades;
  moyenneGenerale: number;
  decision: string;
}

/**
 * Réponse paginée d'un bulletin individuel
 */
export interface IndividualReportCardResponse {
  data: ReportCard;
  total: number;
  page: number;
  limit: number;
}

/**
 * Paramètres pour récupérer un bulletin individuel
 */
export interface GetReportCardParams {
  studentId: string;
  page?: number;
  limit?: number;
}

/**
 * Paramètres pour générer des bulletins par classe
 */
export interface GetReportCardsByClassroomParams {
  classroomId: string;
}

/**
 * Paramètres pour générer des bulletins par salle
 */
export interface GetReportCardsByRoomParams {
  roomId: string;
}

/**
 * Paramètres pour récupérer les bulletins générés
 */
export interface GetGeneratedReportCardsParams {
  batchId?: string;
}

/**
 * Réponse de la génération en masse
 */
export interface GenerateAllReportCardsResponse {
  message: string;
  batchId?: string;
  status: 'accepted' | 'processing' | 'completed' | 'failed';
}
