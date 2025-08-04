export interface Student {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  niveau: string;
  classe: string;
  date_naissance?: string;
  lieu_naissance?: string;
  sexe?: 'M' | 'F';
  email?: string;
  telephone?: string;
  adresse?: string;
}

export interface Course {
  id: number;
  code: string;
  nom: string;
  ponderation: number;
  niveau: string;
  description?: string;
  enseignant?: string;
}

export interface Note {
  id: number;
  student: Student;
  course: Course;
  trimestre: 'T1' | 'T2' | 'T3';
  note: number;
  date_creation: string;
  date_modification?: string;
  created_by?: string;
  modified_by?: string;
}

export interface NoteCreate {
  student_id: number;
  course_id: number;
  trimestre: 'T1' | 'T2' | 'T3';
  note: number;
}

export interface NoteUpdate {
  note: number;
}

export interface StudentBulletin {
  student: Student;
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  notes: {
    course: Course;
    note: number;
    ponderation: number;
  }[];
  moyenne_generale: number;
  total_ponderation: number;
  rang?: number;
  decision?: 'ADMIS' | 'REDOUBLE' | 'EN_ATTENTE';
  observations?: string;
}

export interface ClassBulletin {
  classe: string;
  niveau: string;
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  students: StudentBulletin[];
  statistiques: {
    total_etudiants: number;
    admis: number;
    redoublants: number;
    taux_reussite: number;
    moyenne_classe: number;
  };
}

export interface TopLaureate {
  id: number;
  name: string;
  matricule: string;
  average: number;
  mention: string;
  rang: number;
  classe: string;
  niveau: string;
}

export interface ClassStatistics {
  classe: string;
  niveau: string;
  total_etudiants: number;
  admis: number;
  redoublants: number;
  taux_reussite: number;
  moyenne_classe: number;
  moyenne_min: number;
  moyenne_max: number;
}

export interface GlobalStatistics {
  totalStudents: number;
  total_admis: number;
  total_redoublants: number;
  successRate: number;
  averageGrade: number;
  excellentCount: number;
  repartition_par_niveau: {
    niveau: string;
    total: number;
    admis: number;
    taux_reussite: number;
  }[];
  repartition_par_classe: ClassStatistics[];
}

export interface SearchFilters {
  student_matricule?: string;
  student_name?: string;
  course_code?: string;
  course_name?: string;
  trimestre?: 'T1' | 'T2' | 'T3';
  niveau?: string;
  classe?: string;
  date_from?: string;
  date_to?: string;
}

// Types pour les formulaires
export interface NoteFiltersFormData {
  student_matricule?: string;
  student_name?: string;
  course_code?: string;
  course_name?: string;
  trimestre?: 'T1' | 'T2' | 'T3';
  niveau?: string;
  classe?: string;
  date_from?: string;
  date_to?: string;
}

export interface BulletinIndividualFormData {
  matricule: string;
  trimestre?: 'T1' | 'T2' | 'T3' | 'ANNUEL';
}

export interface BulletinCollectifFormData {
  niveau?: string;
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  classe: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  ordering?: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

// Données fictives pour les tests
export const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    matricule: "2024001",
    nom: "DUPONT",
    prenom: "Jean",
    niveau: "6eme",
    classe: "6eme A",
    sexe: "M",
    email: "jean.dupont@email.com"
  },
  {
    id: 2,
    matricule: "2024002",
    nom: "MARTIN",
    prenom: "Marie",
    niveau: "6eme",
    classe: "6eme A",
    sexe: "F",
    email: "marie.martin@email.com"
  },
  {
    id: 3,
    matricule: "2024003",
    nom: "BERNARD",
    prenom: "Pierre",
    niveau: "6eme",
    classe: "6eme B",
    sexe: "M",
    email: "pierre.bernard@email.com"
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    code: "MATH6",
    nom: "Mathématiques",
    ponderation: 4,
    niveau: "6eme",
    enseignant: "M. ROBERT"
  },
  {
    id: 2,
    code: "FR6",
    nom: "Français",
    ponderation: 4,
    niveau: "6eme",
    enseignant: "Mme DUBOIS"
  },
  {
    id: 3,
    code: "HIST6",
    nom: "Histoire-Géographie",
    ponderation: 3,
    niveau: "6eme",
    enseignant: "M. LEROY"
  },
  {
    id: 4,
    code: "SCI6",
    nom: "Sciences",
    ponderation: 3,
    niveau: "6eme",
    enseignant: "Mme MOREAU"
  }
];

export const MOCK_NOTES: Note[] = [
  {
    id: 1,
    student: MOCK_STUDENTS[0],
    course: MOCK_COURSES[0],
    trimestre: "T1",
    note: 15,
    date_creation: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    student: MOCK_STUDENTS[0],
    course: MOCK_COURSES[1],
    trimestre: "T1",
    note: 14,
    date_creation: "2024-01-16T10:00:00Z"
  },
  {
    id: 3,
    student: MOCK_STUDENTS[1],
    course: MOCK_COURSES[0],
    trimestre: "T1",
    note: 16,
    date_creation: "2024-01-15T10:00:00Z"
  }
];
