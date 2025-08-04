import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Note,
  Student,
  Course,
  StudentBulletin,
  ClassBulletin,
  TopLaureate,
  GlobalStatistics,
  ClassStatistics,
  SearchFilters,
  NoteCreate,
  NoteUpdate
} from '../types/academic';
import academicService from '../services/academicService';
import { toast } from 'react-toastify';

interface AcademicState {
  // État des données
  notes: Note[];
  students: Student[];
  courses: Course[];
  studentBulletin: StudentBulletin | null;
  classBulletin: ClassBulletin | null;
  topLaureates: TopLaureate[];
  globalStatistics: GlobalStatistics | null;
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
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  // Actions pour les notes
  fetchNotes: (filters?: SearchFilters) => Promise<void>;
  createNote: (noteData: NoteCreate) => Promise<boolean>;
  updateNote: (id: number, noteData: NoteUpdate) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  
  // Actions pour les étudiants et cours
  fetchStudents: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  searchStudents: (query: string) => Promise<Student[]>;
  searchCourses: (query: string, niveau?: string) => Promise<Course[]>;
  getStudentByMatricule: (matricule: string) => Promise<Student | null>;
  getCourseByCode: (code: string) => Promise<Course | null>;
  
  // Actions pour les bulletins
  fetchStudentBulletin: (matricule: string, trimestre?: string) => Promise<void>;
  fetchClassBulletin: (classe: string, trimestre: string) => Promise<void>;
  
  // Actions pour les statistiques
  fetchTopLaureates: (limit?: number) => Promise<void>;
  fetchGlobalStatistics: () => Promise<void>;
  fetchClassStatistics: (classe: string) => Promise<void>;
  
  // Actions utilitaires
  setFilters: (filters: Partial<SearchFilters>) => void;
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
  topLaureates: [],
  globalStatistics: null,
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
  },
};

export const useAcademicStore = create<AcademicState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ========== ACTIONS POUR LES NOTES ==========
      
      fetchNotes: async (filters?: SearchFilters) => {
        set((state) => ({
          loading: { ...state.loading, notes: true },
          error: null,
        }));

        try {
          const { pagination } = get();
          const response = await academicService.getNotes(filters, {
            page: pagination.page,
            limit: pagination.limit,
          });

          set((state) => ({
            notes: response.results,
            pagination: {
              ...state.pagination,
              total: response.count,
            },
            loading: { ...state.loading, notes: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des notes';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, notes: false },
          }));
          toast.error(errorMessage);
        }
      },

      createNote: async (noteData: NoteCreate) => {
        set((state) => ({
          loading: { ...state.loading, creating: true },
          error: null,
        }));

        try {
          const newNote = await academicService.createNote(noteData);
          
          set((state) => ({
            notes: [newNote, ...state.notes],
            loading: { ...state.loading, creating: false },
          }));

          toast.success('Note créée avec succès');
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la note';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, creating: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      updateNote: async (id: number, noteData: NoteUpdate) => {
        set((state) => ({
          loading: { ...state.loading, updating: true },
          error: null,
        }));

        try {
          const updatedNote = await academicService.updateNote(id, noteData);
          
          set((state) => ({
            notes: state.notes.map(note => 
              note.id === id ? updatedNote : note
            ),
            loading: { ...state.loading, updating: false },
          }));

          toast.success('Note modifiée avec succès');
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la modification de la note';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, updating: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      deleteNote: async (id: number) => {
        set((state) => ({
          loading: { ...state.loading, deleting: true },
          error: null,
        }));

        try {
          await academicService.deleteNote(id);
          
          set((state) => ({
            notes: state.notes.filter(note => note.id !== id),
            loading: { ...state.loading, deleting: false },
          }));

          toast.success('Note supprimée avec succès');
          return true;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de la note';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, deleting: false },
          }));
          toast.error(errorMessage);
          return false;
        }
      },

      // ========== ACTIONS POUR LES ÉTUDIANTS ET COURS ==========

      fetchStudents: async () => {
        set((state) => ({
          loading: { ...state.loading, students: true },
          error: null,
        }));

        try {
          const students = await academicService.getAllStudents();
          set((state) => ({
            students,
            loading: { ...state.loading, students: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des étudiants';
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
          const courses = await academicService.getAllCourses();
          set((state) => ({
            courses,
            loading: { ...state.loading, courses: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des cours';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, courses: false },
          }));
          toast.error(errorMessage);
        }
      },

      searchStudents: async (query: string) => {
        try {
          return await academicService.searchStudents(query);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la recherche d\'étudiants';
          toast.error(errorMessage);
          return [];
        }
      },

      searchCourses: async (query: string, niveau?: string) => {
        try {
          return await academicService.searchCourses(query, niveau);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la recherche de cours';
          toast.error(errorMessage);
          return [];
        }
      },

      getStudentByMatricule: async (matricule: string) => {
        try {
          return await academicService.getStudentByMatricule(matricule);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Étudiant non trouvé';
          toast.error(errorMessage);
          return null;
        }
      },

      getCourseByCode: async (code: string) => {
        try {
          return await academicService.getCourseByCode(code);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Cours non trouvé';
          toast.error(errorMessage);
          return null;
        }
      },

      // ========== ACTIONS POUR LES BULLETINS ==========

      fetchStudentBulletin: async (matricule: string, trimestre?: string) => {
        set((state) => ({
          loading: { ...state.loading, bulletin: true },
          error: null,
        }));

        try {
          const bulletin = await academicService.getStudentBulletin(matricule, trimestre);
          set((state) => ({
            studentBulletin: bulletin,
            loading: { ...state.loading, bulletin: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement du bulletin';
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
          const bulletin = await academicService.getClassBulletin(classe, trimestre);
          set((state) => ({
            classBulletin: bulletin,
            loading: { ...state.loading, bulletin: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement du bulletin de classe';
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
          const laureates = await academicService.getTopLaureates(limit);
          set((state) => ({
            topLaureates: laureates,
            loading: { ...state.loading, topLaureates: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des lauréats';
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
          const statistics = await academicService.getGlobalStatistics();
          set((state) => ({
            globalStatistics: statistics,
            loading: { ...state.loading, globalStatistics: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des statistiques';
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
          const statistics = await academicService.getClassStatistics(classe);
          set((state) => ({
            classStatistics: statistics,
            loading: { ...state.loading, classStatistics: false },
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des statistiques de classe';
          set((state) => ({
            error: errorMessage,
            loading: { ...state.loading, classStatistics: false },
          }));
          toast.error(errorMessage);
        }
      },

      // ========== ACTIONS UTILITAIRES ==========

      setFilters: (newFilters: Partial<SearchFilters>) => {
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
    }),
    {
      name: 'academic-store',
    }
  )
);
