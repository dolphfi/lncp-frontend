/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES NOTES ACADÉMIQUES
 * =====================================================
 * Types backend-compatible pour la gestion des notes
 * Compatible avec les autres modules (student, course, employee)
 */

// =====================================================
// TYPES POUR LES NOTES ACADÉMIQUES
// =====================================================

// Type principal pour une note académique
export interface Note {
  id: string;                    // Identifiant unique de la note
  
  // Format backend API (une ligne par étudiant/cours avec 3 trimestres)
  trimestre_1?: number | null;   // Note du trimestre 1 (null si pas encore saisie)
  trimestre_2?: number | null;   // Note du trimestre 2 (null si pas encore saisie)
  trimestre_3?: number | null;   // Note du trimestre 3 (null si pas encore saisie)
  
  // Format ancien (rétrocompatibilité - une ligne par trimestre)
  studentId?: string;            // ID de l'étudiant
  courseId?: string;             // ID du cours
  trimestre?: 'T1' | 'T2' | 'T3'; // Trimestre (T1, T2, T3)
  note?: number;                 // Note obtenue
  
  // Métadonnées
  createdAt: string;             // Date de création (ISO string)
  updatedAt: string;             // Date de dernière mise à jour (ISO string)
  createdBy?: string;            // ID de l'utilisateur qui a créé la note
  updatedBy?: string;            // ID de l'utilisateur qui a modifié la note

  // Relations (pour affichage)
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    matricule?: string;
    studentId?: string;
    grade?: string;
    roomName?: string;
  };
  course?: {
    id: string;
    titre: string;
    code?: string;
    categorie?: string;
    ponderation: number;
    niveau?: string;
    description?: string;
  };
  user?: any; // Utilisateur qui a créé/modifié la note
}

// Type pour créer une nouvelle note
export interface CreateNoteDto {
  studentId: string;
  courseId: string;
  trimestre: 'T1' | 'T2' | 'T3';
  note: number;
}

// Type pour mettre à jour une note
export interface UpdateNoteDto {
  id: string;
  note: number;
}

// Type pour supprimer une note
export interface DeleteNoteDto {
  id: string;
}

// =====================================================
// TYPES POUR LES BULLETINS
// =====================================================

// Bulletin individuel d'un étudiant
export interface StudentBulletin {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    grade: string;
    roomName?: string;
  };
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  notes: {
    course: {
      id: string;
      titre: string;
      categorie: string;
      ponderation: number;
    };
    note: number;
    coefficient: number;
  }[];
  moyenneGenerale: number;
  totalPonderation: number;
  rang?: number;
  decision?: 'ADMIS' | 'REDOUBLE' | 'EN_ATTENTE';
  observations?: string;
}

// Bulletin collectif d'une classe
export interface ClassBulletin {
  classe: string;
  niveau: string;
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  students: StudentBulletin[];
  statistiques: {
    totalEtudiants: number;
    admis: number;
    redoublants: number;
    tauxReussite: number;
    moyenneClasse: number;
  };
}

// =====================================================
// TYPES POUR LES STATISTIQUES
// =====================================================

// Statistiques globales
export interface GlobalStatistics {
  totalStudents: number;
  totalAdmis: number;
  totalRedoublants: number;
  successRate: number;
  averageGrade: number;
  excellentCount: number;
  repartitionParNiveau: {
    niveau: string;
    total: number;
    admis: number;
    tauxReussite: number;
  }[];
  repartitionParClasse: ClassStatistics[];
}

// Statistiques par classe
export interface ClassStatistics {
  classe: string;
  niveau: string;
  totalEtudiants: number;
  admis: number;
  redoublants: number;
  tauxReussite: number;
  moyenneClasse: number;
  moyenneMin: number;
  moyenneMax: number;
}

// Top lauréats
export interface TopLaureate {
  id: string;
  name: string;
  studentId: string;
  average: number;
  mention: string;
  rang: number;
  classe: string;
  niveau: string;
}

// =====================================================
// TYPES POUR LES FILTRES ET RECHERCHE
// =====================================================

// Filtres pour la recherche de notes
export interface NoteFilters {
  search?: string;               // Recherche générale
  studentId?: string;            // Filtrer par matricule étudiant
  studentName?: string;          // Filtrer par nom étudiant
  courseId?: string;             // Filtrer par cours
  courseName?: string;           // Filtrer par nom du cours
  trimestre?: 'T1' | 'T2' | 'T3'; // Filtrer par trimestre
  niveau?: string;               // Filtrer par niveau
  classe?: string;               // Filtrer par classe
  dateFrom?: string;             // Date de début (format ISO)
  dateTo?: string;               // Date de fin (format ISO)
  minNote?: number;              // Note minimale
  maxNote?: number;              // Note maximale
}

// Filtres pour les bulletins individuels
export interface BulletinIndividualFilters {
  studentId: string;             // Matricule étudiant (requis)
  trimestre?: 'T1' | 'T2' | 'T3' | 'ANNUEL'; // Trimestre (optionnel)
}

// Filtres pour les bulletins collectifs
export interface BulletinCollectifFilters {
  niveau?: string;               // Niveau (optionnel)
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL'; // Trimestre (requis)
  classe: string;                // Classe (requis)
}

// =====================================================
// TYPES POUR LA PAGINATION ET TRI
// =====================================================

// Options de pagination
export interface PaginationOptions {
  page: number;                  // Page actuelle (commence à 1)
  limit: number;                 // Nombre d'éléments par page
  total: number;                 // Nombre total d'éléments
  totalPages: number;            // Nombre total de pages
}

// Options de tri
export interface SortOptions {
  field: string;                 // Champ à utiliser pour le tri
  order: 'asc' | 'desc';         // Ordre croissant ou décroissant
}

// =====================================================
// TYPES POUR LES RÉPONSES API
// =====================================================

// Réponse paginée générique
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Réponse pour les notes
export interface NotesResponse {
  data: Note[];
  pagination: PaginationOptions;
}

// Réponse pour les statistiques
export interface StatisticsResponse {
  statistics: GlobalStatistics;
  topLaureates: TopLaureate[];
}
// =====================================================
// TYPES POUR LES FORMULAIRES
// =====================================================

// Formulaire de création de note
export interface NoteCreateFormData {
  studentId: string;
  courseId: string;
  trimestre: 'T1' | 'T2' | 'T3';
  note: number;
}

// Formulaire de recherche de notes
export interface NoteFiltersFormData {
  search?: string;
  studentId?: string;
  studentName?: string;
  courseId?: string;
  courseName?: string;
  trimestre?: 'T1' | 'T2' | 'T3';
  niveau?: string;
  classe?: string;
  dateFrom?: string;
  dateTo?: string;
  minNote?: number;
  maxNote?: number;
}

// Formulaire de modification de note
export interface NoteUpdateFormData {
  note: number;
}
// Formulaire de recherche d'étudiant
export interface StudentSearchFormData {
  search: string;                // Recherche par nom, prénom, matricule
}

// Formulaire de recherche de cours
export interface CourseSearchFormData {
  search: string;                // Recherche par titre, code
  niveau?: string;               // Filtrer par niveau
}

// Formulaire de génération de bulletin individuel
export interface BulletinIndividualFormData {
  studentId: string;
  trimestre?: 'T1' | 'T2' | 'T3' | 'ANNUEL';
}

// Formulaire de génération de bulletin collectif
export interface BulletinCollectifFormData {
  niveau?: string;
  trimestre: 'T1' | 'T2' | 'T3' | 'ANNUEL';
  classe: string;
}

// =====================================================
// TYPES POUR LES STATISTIQUES ET RAPPORTS
// =====================================================

// Paramètres pour les statistiques
export interface StatisticsParams {
  niveau?: string;               // Niveau spécifique (optionnel)
  classe?: string;               // Classe spécifique (optionnel)
  trimestre?: 'T1' | 'T2' | 'T3' | 'ANNUEL'; // Trimestre spécifique (optionnel)
  limit?: number;                // Limite pour les top lauréats
}

// Paramètres pour l'export
export interface ExportParams {
  format: 'PDF' | 'EXCEL' | 'CSV';
  type: 'NOTES' | 'BULLETIN_INDIVIDUEL' | 'BULLETIN_COLLECTIF' | 'STATISTIQUES';
  filters?: NoteFilters | BulletinIndividualFilters | BulletinCollectifFilters;
  includeDetails?: boolean;
  includeStatistics?: boolean;
}

// =====================================================
// TYPES POUR LES ERREURS
// =====================================================

// Erreur de validation
export interface ValidationError {
  field: string;                 // Champ qui contient l'erreur
  message: string;               // Message d'erreur
}

// Erreur de l'API
export interface ApiError {
  message: string;               // Message d'erreur principal
  code: string;                  // Code d'erreur
  details?: ValidationError[];   // Détails des erreurs de validation
}

// =====================================================
// TYPES POUR LES DONNÉES MOCKÉES (COMPATIBLES BACKEND)
// =====================================================

// Données mockées pour les tests (format backend-compatible)
export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    trimestre: 'T1',
    note: 15.5,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    student: {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      studentId: '23N2001',
      grade: 'NSII',
      roomName: 'Salle A'
    },
    course: {
      id: '1',
      titre: 'Mathématiques',
      categorie: 'Mathematiques',
      ponderation: 4,
      niveau: 'NSII'
    }
  },
  {
    id: '2',
    studentId: '1',
    courseId: '2',
    trimestre: 'T1',
    note: 14.0,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    student: {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      studentId: '23N2001',
      grade: 'NSII',
      roomName: 'Salle A'
    },
    course: {
      id: '2',
      titre: 'Français',
      categorie: 'Francais',
      ponderation: 4,
      niveau: 'NSII'
    }
  }
];

// Fonctions utilitaires pour les données mockées
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateNoteId = (): string => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Recherche dans les notes mockées
export const searchNotes = (
  notes: Note[],
  filters: NoteFilters
): Note[] => {
  let filteredNotes = [...notes];

  if (filters.studentId) {
    filteredNotes = filteredNotes.filter(note =>
      note.student?.studentId?.includes(filters.studentId!) || 
      note.student?.matricule?.includes(filters.studentId!)
    );
  }

  if (filters.studentName) {
    filteredNotes = filteredNotes.filter(note =>
      note.student &&
      `${note.student.firstName} ${note.student.lastName}`
        .toLowerCase()
        .includes(filters.studentName!.toLowerCase())
    );
  }

  if (filters.courseName) {
    filteredNotes = filteredNotes.filter(note =>
      note.course?.titre.toLowerCase().includes(filters.courseName!.toLowerCase())
    );
  }

  if (filters.trimestre) {
    filteredNotes = filteredNotes.filter(note => note.trimestre === filters.trimestre);
  }

  if (filters.niveau) {
    filteredNotes = filteredNotes.filter(note =>
      note.course?.niveau === filters.niveau
    );
  }

  if (filters.classe) {
    filteredNotes = filteredNotes.filter(note =>
      note.student?.grade === filters.classe
    );
  }

  if (filters.minNote !== undefined) {
    filteredNotes = filteredNotes.filter(note => 
      note.note !== undefined && note.note >= filters.minNote!
    );
  }

  if (filters.maxNote !== undefined) {
    filteredNotes = filteredNotes.filter(note => 
      note.note !== undefined && note.note <= filters.maxNote!
    );
  }

  return filteredNotes;
};

// Tri des notes mockées
export const sortNotes = (
  notes: Note[],
  field: string,
  order: 'asc' | 'desc'
): Note[] => {
  return [...notes].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (field) {
      case 'student':
        aValue = a.student ? `${a.student.firstName} ${a.student.lastName}` : '';
        bValue = b.student ? `${b.student.firstName} ${b.student.lastName}` : '';
        break;
      case 'course':
        aValue = a.course?.titre || '';
        bValue = b.course?.titre || '';
        break;
      case 'note':
        aValue = a.note;
        bValue = b.note;
        break;
      case 'trimestre':
        aValue = a.trimestre;
        bValue = b.trimestre;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return order === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

// Pagination des notes mockées
export const paginateNotes = (
  notes: Note[],
  page: number,
  limit: number
): {
  data: Note[];
  pagination: PaginationOptions;
} => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = notes.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      limit,
      total: notes.length,
      totalPages: Math.ceil(notes.length / limit)
    }
  };
};

// Calcul des statistiques mockées
export const calculateNoteStats = (notes: Note[]) => {
  const total = notes.length;

  // Statistiques par trimestre
  const byTrimestre = notes.reduce((acc, note) => {
    if (note.trimestre) {
      acc[note.trimestre] = (acc[note.trimestre] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Moyenne générale (uniquement pour les notes avec valeur définie)
  const notesWithValue = notes.filter(n => n.note !== undefined && n.note !== null);
  const averageNote = notesWithValue.length > 0
    ? notesWithValue.reduce((sum, note) => sum + note.note!, 0) / notesWithValue.length
    : 0;

  return {
    total,
    byTrimestre,
    averageNote,
    excellentCount: notes.filter(n => n.note !== undefined && n.note >= 16).length,
    goodCount: notes.filter(n => n.note !== undefined && n.note >= 12 && n.note < 16).length,
    averageCount: notes.filter(n => n.note !== undefined && n.note >= 10 && n.note < 12).length,
    failingCount: notes.filter(n => n.note !== undefined && n.note < 10).length
  };
};
