/**
 * Types pour l'endpoint GET /dashboard
 * Retourne des données spécifiques au rôle de l'utilisateur authentifié
 */

// Types de base
export interface ParentInfo {
  id: string;
  firstName: string;
  lastName: string;
  childrenCount: number;
}

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
  handicapDetails: string | null;
  badge: string | null;
  avatarUrl: string | null;
  adresse: {
    ligne1: string | null;
    departement: string | null;
    commune: string | null;
    sectionCommunale: string | null;
  };
  vacation: string;
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  code: string;
  titre: string;
  description: string;
  categorie: string;
  ponderation: number;
  statut: string;
  classroom: Classroom;
  employees?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

export interface AcademicYear {
  id: string;
  label: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  course: Course;
  trimestre_1: string | null;
  trimestre_2: string | null;
  trimestre_3: string | null;
  anneeAcademique: AcademicYear;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  transactionType: 'CASH' | 'CHECK' | 'BANK_DEPOSIT' | 'STRIPE' | 'PAYPAL' | 'BOUSANM';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  academicYear: string;
  reference: string;
  receiptUrl: string | null;
  checkNumber: string | null;
  issueDate: string | null;
  student: any;
  employee: any;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  timestamp: string;
  type: string;
  status: string;
  readerId?: string;
  reason?: string;
  isJustified: boolean;
  justification?: string | null;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: string;
  classroom?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: 'COURSE' | 'BREAK' | 'LUNCH' | 'STUDY';
  course?: Course;
}

export interface Schedule {
  id: string;
  name: string;
  dayOfWeek: 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI';
  vacation: string;
  room: Room;
  timeSlots: TimeSlot[];
}

export interface ChildData {
  studentInfo: StudentInfo;
  notes: Note[];
  paymentRequired: boolean;
  paymentMessage?: string;
  payments: Payment[];
  attendances: Attendance[];
  schedule: Schedule[];
}

// Réponse de l'API pour les parents
export interface ParentDashboard {
  parentInfo: ParentInfo;
  children: ChildData[];
}

// Réponse de l'API pour les étudiants
export interface StudentDashboard {
  studentInfo: StudentInfo;
  notes: Note[];
  paymentRequired: boolean;
  paymentMessage?: string;
  payments: Payment[];
  attendances: Attendance[];
  schedule: Schedule[];
}

// Réponse de l'API pour les professeurs
export interface TeacherDashboard {
  teacherInfo: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    coursesCount: number;
  };
  courses: Course[];
  schedule: Schedule[];
  pendingNotes: TeacherNote[];
  approvedNotes: TeacherNote[];
  statistics: {
    totalCourses: number;
    pendingNotesCount: number;
    pendingNotesFiltered: number;
    approvedNotesCount: number;
  };
}

// Note créée/validée par un professeur
export interface TeacherNote {
  id: string;
  student: {
    id: string;
    matricule: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    classroom: {
      id: string;
      name: string;
    };
  };
  course: {
    id: string;
    code: string;
    titre: string;
    ponderation: number;
  };
  trimestre: 'T1' | 'T2' | 'T3';
  note: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  validatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type union pour tous les types de dashboard
export type DashboardData = ParentDashboard | StudentDashboard | TeacherDashboard;

// Helper pour déterminer le type de dashboard
export const isParentDashboard = (data: DashboardData): data is ParentDashboard => {
  return 'parentInfo' in data && 'children' in data;
};

export const isStudentDashboard = (data: DashboardData): data is StudentDashboard => {
  return 'studentInfo' in data && !('parentInfo' in data);
};

export const isTeacherDashboard = (data: DashboardData): data is TeacherDashboard => {
  return 'teacherInfo' in data && 'courses' in data;
};
