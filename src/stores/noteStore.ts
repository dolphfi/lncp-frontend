/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES NOTES ACADÉMIQUES
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les notes avec Zustand et immer
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  Note,
  NoteFilters,
  PaginationOptions,
  NotesResponse,
  StudentBulletin,
  ClassBulletin,
  GlobalStatistics,
  TopLaureate,
  ClassStatistics,
  ApiError,
  CreateNoteDto,
  UpdateNoteDto
} from '../types/note';

import noteService from '../services/notes/noteService';
import authService from '../services/authService';
import { toast } from 'react-toastify';

interface NoteState {
  // État des données
  notes: Note[];
  students: any[];
  courses: any[];
  studentBulletin: StudentBulletin | null;
  classBulletin: ClassBulletin | null;
  globalStatistics: GlobalStatistics | null;
  topLaureates: TopLaureate[];
  classStatistics: ClassStatistics | null;

  // État de chargement
  loading: {
    notes: boolean;
    students: boolean;
    courses: boolean;
    bulletin: boolean;
    topLaureates: boolean;
    globalStatistics: boolean;
    classStatistics: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // Erreurs
  error: string | null;

  // Filtres et pagination
  filters: NoteFilters;
  pagination: PaginationOptions;

  // Actions pour les notes
  fetchNotes: (filters?: NoteFilters) => Promise<void>;
  createNote: (noteData: CreateNoteDto) => Promise<boolean>;
  updateNote: (id: string, noteData: UpdateNoteDto) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  getNoteById: (id: string) => Promise<Note | null>;

  // Actions pour les données de référence
  getMyStudents: () => Promise<any[]>;
  getTeacherCourses: () => Promise<any[]>;
  getAllCoursesWithClassFilter: (classroomId?: string) => Promise<any[]>;
  getAllClassrooms: () => Promise<any[]>;

  // Actions pour les bulletins
  fetchStudentBulletin: (studentId: string, trimestre?: string) => Promise<void>;
  fetchClassBulletin: (classe: string, trimestre: string) => Promise<void>;

  // Actions pour les statistiques
  fetchTopLaureates: (limit?: number) => Promise<void>;
  fetchGlobalStatistics: () => Promise<void>;
  fetchClassStatistics: (classe: string) => Promise<void>;

  // Actions utilitaires
  setFilters: (filters: Partial<NoteFilters>) => void;
  clearFilters: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  notes: [],
  students: [],
  courses: [],
  studentBulletin: null,
  classBulletin: null,
  globalStatistics: null,
  topLaureates: [],
  classStatistics: null,
  loading: {
    notes: false,
    students: false,
    courses: false,
    bulletin: false,
    topLaureates: false,
    globalStatistics: false,
    classStatistics: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

export const useNoteStore = create<NoteState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ========== ACTIONS POUR LES NOTES ==========

      fetchNotes: async (filters?: NoteFilters) => {
        set((state) => ({
          loading: { ...state.loading, notes: true },
          error: null,
        }));

        try {
          // Récupérer le rôle de l'utilisateur connecté
          const user = authService.getUser();
          const userRole = user?.role;
          
          console.log('👤 Rôle utilisateur:', userRole);
          
          let notesData: any[] = [];
          
          // Utiliser l'endpoint approprié selon le rôle
          if (userRole === 'TEACHER') {
            // Pour les professeurs: utiliser toutes les notes du dashboard (pending + approved)
            console.log('📚 Chargement toutes les notes du professeur (TEACHER)');
            notesData = await noteService.getDashboardAllTeacherNotes();
          } else {
            // Pour les autres rôles: utiliser /notes/all-notes
            console.log('📚 Chargement toutes les notes (ADMIN/DIRECTOR/etc)');
            notesData = await noteService.getAllNotesLegacy();
          }
          
          console.log(`✅ ${notesData.length} notes chargées`);
          
          // Pagination côté client
          const limit = 20;
          const total = notesData.length;
          const totalPages = Math.ceil(total / limit);
          
          set((state) => ({
            notes: notesData,
            pagination: {
              page: 1,
              limit: limit,
              total: total,
              totalPages: totalPages
            },
            loading: { ...state.loading, notes: false },
          }));
        } catch (error: any) {
          console.error('❌ Erreur fetchNotes:', error);
          const errorMessage = error.message || 'Erreur lors du chargement des notes';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, notes: false },
          }));
          toast.error(errorMessage);
        }
      },

      createNote: async (noteData: CreateNoteDto) => {
        set((state) => ({
          loading: { ...state.loading, creating: true },
          error: null,
        }));

        try {
          const newNote = await noteService.createNote(noteData);

          set((state) => ({
            notes: [newNote, ...state.notes],
            loading: { ...state.loading, creating: false },
          }));

          toast.success('Note enregistrée avec succès');
          return true;
        } catch (error: any) {
          // Extraire le message d'erreur de l'API
          let errorMessage = 'Erreur lors de l\'enregistrement de la note';
          
          if (error.response?.data) {
            const apiError = error.response.data;
            if (typeof apiError.message === 'string') {
              errorMessage = apiError.message;
            } else if (Array.isArray(apiError.message)) {
              errorMessage = apiError.message.join(', ');
            } else if (apiError.error) {
              errorMessage = apiError.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, creating: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      updateNote: async (id: string, noteData: UpdateNoteDto) => {
        set((state) => ({
          loading: { ...state.loading, updating: true },
          error: null,
        }));

        try {
          const updatedNote = await noteService.updateNote(id, noteData);

          set((state) => ({
            notes: state.notes.map(note =>
              note.id === id ? updatedNote : note
            ),
            loading: { ...state.loading, updating: false },
          }));

          toast.success('Note modifiée avec succès');
          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors de la modification de la note';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, updating: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      deleteNote: async (id: string) => {
        set((state) => ({
          loading: { ...state.loading, deleting: true },
          error: null,
        }));

        try {
          await noteService.deleteNote(id);

          set((state) => ({
            notes: state.notes.filter(note => note.id !== id),
            loading: { ...state.loading, deleting: false },
          }));

          toast.success('Note supprimée avec succès');
          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors de la suppression de la note';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, deleting: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      getNoteById: async (id: string) => {
        try {
          return await noteService.getNoteById(id);
        } catch (error: any) {
          const errorMessage = error.message || 'Note non trouvée';
          toast.error(errorMessage);
          return null;
        }
      },

      // ========== ACTIONS POUR LES DONNÉES DE RÉFÉRENCE ==========

      getMyStudents: async () => {
        try {
          return await noteService.getMyStudents();
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des étudiants';
          toast.error(errorMessage);
          return [];
        }
      },

      getTeacherCourses: async () => {
        try {
          return await noteService.getTeacherCourses();
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des cours';
          toast.error(errorMessage);
          return [];
        }
      },

      getAllCoursesWithClassFilter: async (classroomId?: string) => {
        try {
          return await noteService.getAllCoursesWithClassFilter(classroomId);
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des cours';
          toast.error(errorMessage);
          return [];
        }
      },

      getAllClassrooms: async () => {
        try {
          return await noteService.getAllClassrooms();
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des classes';
          toast.error(errorMessage);
          return [];
        }
      },

      fetchStudents: async () => {
        set((state) => ({
          loading: { ...state.loading, students: true },
          error: null,
        }));

        try {
          const students = await noteService.getAllStudents();
          set((state) => ({
            students,
            loading: { ...state.loading, students: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des étudiants';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, students: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchCourses: async () => {
        set((state) => ({
          loading: { ...state.loading, courses: true },
          error: null,
        }));

        try {
          const courses = await noteService.getAllCourses();
          set((state) => ({
            courses,
            loading: { ...state.loading, courses: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des cours';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, courses: false },
          }));
          toast.error(errorMessage);
        }
      },

      // ========== ACTIONS POUR LES BULLETINS ==========

      fetchStudentBulletin: async (studentId: string, trimestre?: string) => {
        set((state) => ({
          loading: { ...state.loading, bulletin: true },
          error: null,
        }));

        try {
          const bulletin = await noteService.getStudentBulletin(studentId, trimestre);
          set((state) => ({
            studentBulletin: bulletin,
            loading: { ...state.loading, bulletin: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement du bulletin';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, bulletin: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchClassBulletin: async (classe: string, trimestre: string) => {
        set((state) => ({
          loading: { ...state.loading, bulletin: true },
          error: null,
        }));

        try {
          const bulletin = await noteService.getClassBulletin(classe, trimestre);
          set((state) => ({
            classBulletin: bulletin,
            loading: { ...state.loading, bulletin: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement du bulletin de classe';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, bulletin: false },
          }));
          toast.error(errorMessage);
        }
      },

      // ========== ACTIONS POUR LES STATISTIQUES ==========

      fetchTopLaureates: async (limit = 10) => {
        set((state) => ({
          loading: { ...state.loading, topLaureates: true },
          error: null,
        }));

        try {
          const laureates = await noteService.getTopLaureates(limit);
          set((state) => ({
            topLaureates: laureates,
            loading: { ...state.loading, topLaureates: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des lauréats';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, topLaureates: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchGlobalStatistics: async () => {
        set((state) => ({
          loading: { ...state.loading, globalStatistics: true },
          error: null,
        }));

        try {
          const statistics = await noteService.getGlobalStatistics();
          set((state) => ({
            globalStatistics: statistics,
            loading: { ...state.loading, globalStatistics: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des statistiques';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, globalStatistics: false },
          }));
          toast.error(errorMessage);
        }
      },

      fetchClassStatistics: async (classe: string) => {
        set((state) => ({
          loading: { ...state.loading, classStatistics: true },
          error: null,
        }));

        try {
          const statistics = await noteService.getClassStatistics(classe);
          set((state) => ({
            classStatistics: statistics,
            loading: { ...state.loading, classStatistics: false },
          }));
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors du chargement des statistiques de classe';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, classStatistics: false },
          }));
          toast.error(errorMessage);
        }
      },

      // ========== ACTIONS UTILITAIRES ==========

      setFilters: (newFilters: Partial<NoteFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset page when filters change
        }));
      },

      clearFilters: () => {
        set((state) => ({
          filters: {},
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }))
  )
);

// =====================================================
// HOOKS PERSONNALISÉS POUR FACILITER L'UTILISATION
// =====================================================

export const useNotes = () => {
  return useNoteStore(state => state.notes);
};

export const useStudents = () => {
  return useNoteStore(state => state.students);
};

export const useCourses = () => {
  return useNoteStore(state => state.courses);
};

export const useNoteLoading = () => {
  return useNoteStore(state => state.loading);
};

export const useNoteError = () => {
  return useNoteStore(state => state.error);
};

export const useNoteFilters = () => {
  return useNoteStore(state => state.filters);
};

export const useNotePagination = () => {
  return useNoteStore(state => state.pagination);
};

export const useStudentBulletin = () => {
  return useNoteStore(state => state.studentBulletin);
};

export const useClassBulletin = () => {
  return useNoteStore(state => state.classBulletin);
};

export const useGlobalStatistics = () => {
  return useNoteStore(state => state.globalStatistics);
};

export const useTopLaureates = () => {
  return useNoteStore(state => state.topLaureates);
};

export const useClassStatistics = () => {
  return useNoteStore(state => state.classStatistics);
};
