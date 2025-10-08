/**
 * =====================================================
 * TYPES POUR LE PROFIL ÉTUDIANT/PARENT
 * =====================================================
 * Types basés sur la structure de données backend
 */

// Type pour les informations du parent
export interface ParentInfo {
  id: string;
  firstName: string;
  lastName: string;
  childrenCount: number;
}

// Type pour les informations de base d'un étudiant
export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  classroom: string;
  room: string;
  dateOfBirth: string;
  age: number;
  lieuDeNaissance: string;
  communeDeNaissance: string;
  sexe: string;
  handicap: string;
  handicapDetails?: string | null;
  avatarUrl?: string | null;
  vacation: string;
  badge?: string | null;
  adresse?: {
    ligne1: string | null;
    departement: string | null;
    commune: string | null;
    sectionCommunale: string | null;
  };
}

// Type pour une note académique
export interface AcademicNote {
  id: string;
  course: {
    id: string;
    code: string;
    titre: string;
    categorie: string;
  };
  trimestre_1: string | null;
  trimestre_2: string | null;
  trimestre_3: string | null;
  anneeAcademique: {
    id: string;
    label: string;
  };
}

// Type pour un paiement
export interface Payment {
  id: string;
  amount: number;
  transactionType: string;
  status: string;
  academicYear: string;
  reference: string;
  createdAt: string;
}

// Type pour une présence/absence
export interface Attendance {
  id: string;
  timestamp: string;
  type: string;
  status: string;
  reason: string;
  isJustified: boolean;
  readerId?: string;
  justification?: string | null;
}

// Type pour un employé (professeur)
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

// Type pour une salle
export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

// Type pour une classe
export interface Classroom {
  id: string;
  name: string;
  description: string | null;
}

// Type pour un cours
export interface Course {
  id: string;
  code: string;
  titre: string;
  description: string;
  categorie: string;
  ponderation: number;
  statut: string;
  classroom: Classroom;
  employees: Employee[];
}

// Type pour un créneau horaire
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: 'COURSE' | 'BREAK';
  course?: Course;
}

// Type pour un horaire
export interface Schedule {
  id: string;
  name: string;
  dayOfWeek: 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';
  vacation: 'Matin (AM)' | 'Après-midi (PM)';
  room: Room;
  timeSlots: TimeSlot[];
}

// Type pour les données d'un enfant
export interface ChildData {
  studentInfo: StudentInfo;
  notes: AcademicNote[];
  paymentRequired: boolean;
  paymentMessage?: string;
  payments: Payment[];
  attendances: Attendance[];
  schedule: Schedule[];
}

// Type pour les données complètes du profil parent
export interface ParentProfileData {
  parentInfo: ParentInfo;
  children: ChildData[];
}

// Type pour les données d'un étudiant connecté (même structure qu'un enfant)
export interface StudentProfileData extends ChildData {}
