import axios from 'axios';
import {
  Note,
  NoteCreate,
  NoteUpdate,
  Student,
  Course,
  StudentBulletin,
  ClassBulletin,
  TopLaureate,
  ClassStatistics,
  GlobalStatistics,
  SearchFilters,
  PaginationParams,
  ApiResponse,
  MOCK_STUDENTS,
  MOCK_COURSES,
  MOCK_NOTES
} from '../types/academic';

// Configuration de base d'axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/token/refresh/', {
            refresh: refreshToken
          });
          localStorage.setItem('access_token', response.data.access);
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Mode développement - utiliser des données fictives
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;

class AcademicService {
  // ========== GESTION DES NOTES ==========

  async createNote(noteData: NoteCreate): Promise<Note> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const student = MOCK_STUDENTS.find(s => s.id === noteData.student_id);
      const course = MOCK_COURSES.find(c => c.id === noteData.course_id);
      
      if (!student || !course) {
        throw new Error('Étudiant ou cours non trouvé');
      }

      const newNote: Note = {
        id: Date.now(),
        student,
        course,
        trimestre: noteData.trimestre,
        note: noteData.note,
        date_creation: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(newNote), 500);
      });
    }

    const response = await api.post<Note>('/courses/notes/', noteData);
    return response.data;
  }

  async getNotes(filters?: SearchFilters, pagination?: PaginationParams): Promise<ApiResponse<Note>> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      let filteredNotes = [...MOCK_NOTES];

      if (filters?.student_matricule) {
        filteredNotes = filteredNotes.filter(note => 
          note.student.matricule.includes(filters.student_matricule!)
        );
      }

      if (filters?.course_code) {
        filteredNotes = filteredNotes.filter(note => 
          note.course.code.includes(filters.course_code!)
        );
      }

      if (filters?.trimestre) {
        filteredNotes = filteredNotes.filter(note => 
          note.trimestre === filters.trimestre
        );
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve({
          count: filteredNotes.length,
          next: null,
          previous: null,
          results: filteredNotes
        }), 500);
      });
    }

    const params = { ...filters, ...pagination };
    const response = await api.get<ApiResponse<Note>>('/courses/notes/', { params });
    return response.data;
  }

  async updateNote(id: number, noteData: NoteUpdate): Promise<Note> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const existingNote = MOCK_NOTES.find(n => n.id === id);
      if (!existingNote) {
        throw new Error('Note non trouvée');
      }

      const updatedNote: Note = {
        ...existingNote,
        note: noteData.note,
        date_modification: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(updatedNote), 500);
      });
    }

    const response = await api.put<Note>(`/courses/note-update/${id}/`, noteData);
    return response.data;
  }

  async deleteNote(id: number): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    }

    await api.delete(`/courses/note-update/${id}/`);
  }

  // ========== RECHERCHE ÉTUDIANTS ET COURS ==========

  async getStudentByMatricule(matricule: string): Promise<Student> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const student = MOCK_STUDENTS.find(s => s.matricule === matricule);
      if (!student) {
        throw new Error('Étudiant non trouvé');
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve(student), 300);
      });
    }

    const response = await api.get<Student>(`/courses/get-student-by-matricule/`, {
      params: { matricule }
    });
    return response.data;
  }

  async getCourseByCode(code: string): Promise<Course> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const course = MOCK_COURSES.find(c => c.code === code);
      if (!course) {
        throw new Error('Cours non trouvé');
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve(course), 300);
      });
    }

    const response = await api.get<Course>(`/courses/get-course-by-code/`, {
      params: { code }
    });
    return response.data;
  }

  async searchStudents(query: string): Promise<Student[]> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const filteredStudents = MOCK_STUDENTS.filter(student => 
        student.matricule.toLowerCase().includes(query.toLowerCase()) ||
        student.nom.toLowerCase().includes(query.toLowerCase()) ||
        student.prenom.toLowerCase().includes(query.toLowerCase())
      );

      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredStudents), 300);
      });
    }

    const response = await api.get<Student[]>('/students/search/', {
      params: { q: query }
    });
    return response.data;
  }

  async searchCourses(query: string, niveau?: string): Promise<Course[]> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      let filteredCourses = MOCK_COURSES.filter(course => 
        course.code.toLowerCase().includes(query.toLowerCase()) ||
        course.nom.toLowerCase().includes(query.toLowerCase())
      );

      if (niveau) {
        filteredCourses = filteredCourses.filter(course => course.niveau === niveau);
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredCourses), 300);
      });
    }

    const response = await api.get<Course[]>('/courses/search/', {
      params: { q: query, niveau }
    });
    return response.data;
  }

  // ========== BULLETINS ==========

  async getStudentBulletin(matricule: string, trimestre?: string): Promise<StudentBulletin> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const student = MOCK_STUDENTS.find(s => s.matricule === matricule);
      if (!student) {
        throw new Error('Étudiant non trouvé');
      }

      const studentNotes = MOCK_NOTES.filter(note => note.student.id === student.id);
      const notes = studentNotes.map(note => ({
        course: note.course,
        note: note.note,
        ponderation: note.course.ponderation
      }));

      const totalPoints = notes.reduce((sum, n) => sum + (n.note * n.ponderation), 0);
      const totalPonderation = notes.reduce((sum, n) => sum + n.ponderation, 0);
      const moyenneGenerale = totalPonderation > 0 ? totalPoints / totalPonderation : 0;

      const bulletin: StudentBulletin = {
        student,
        trimestre: (trimestre as any) || 'T1',
        notes,
        moyenne_generale: moyenneGenerale,
        total_ponderation: totalPonderation,
        rang: 1,
        decision: moyenneGenerale >= 10 ? 'ADMIS' : 'REDOUBLE'
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(bulletin), 800);
      });
    }

    const response = await api.post<StudentBulletin>('/courses/student-bulletin-get/', {
      matricule,
      trimestre
    });
    return response.data;
  }

  async getClassBulletin(classe: string, trimestre: string): Promise<ClassBulletin> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const classStudents = MOCK_STUDENTS.filter(s => s.classe === classe);
      const studentBulletins: StudentBulletin[] = [];

      for (const student of classStudents) {
        const studentNotes = MOCK_NOTES.filter(note => note.student.id === student.id);
        const notes = studentNotes.map(note => ({
          course: note.course,
          note: note.note,
          ponderation: note.course.ponderation
        }));

        const totalPoints = notes.reduce((sum, n) => sum + (n.note * n.ponderation), 0);
        const totalPonderation = notes.reduce((sum, n) => sum + n.ponderation, 0);
        const moyenneGenerale = totalPonderation > 0 ? totalPoints / totalPonderation : 0;

        studentBulletins.push({
          student,
          trimestre: trimestre as any,
          notes,
          moyenne_generale: moyenneGenerale,
          total_ponderation: totalPonderation,
          decision: moyenneGenerale >= 10 ? 'ADMIS' : 'REDOUBLE'
        });
      }

      // Tri par moyenne décroissante et attribution des rangs
      studentBulletins.sort((a, b) => b.moyenne_generale - a.moyenne_generale);
      studentBulletins.forEach((bulletin, index) => {
        bulletin.rang = index + 1;
      });

      const admis = studentBulletins.filter(b => b.decision === 'ADMIS').length;
      const moyenneClasse = studentBulletins.reduce((sum, b) => sum + b.moyenne_generale, 0) / studentBulletins.length;

      const classBulletin: ClassBulletin = {
        classe,
        niveau: classStudents[0]?.niveau || '6eme',
        trimestre: trimestre as any,
        students: studentBulletins,
        statistiques: {
          total_etudiants: studentBulletins.length,
          admis,
          redoublants: studentBulletins.length - admis,
          taux_reussite: (admis / studentBulletins.length) * 100,
          moyenne_classe: moyenneClasse
        }
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(classBulletin), 1000);
      });
    }

    const response = await api.post<ClassBulletin>('/courses/all-student-bulletin/', {
      classe,
      trimestre
    });
    return response.data;
  }

  // ========== STATISTIQUES ==========

  async getTopLaureates(limit: number = 10): Promise<TopLaureate[]> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const laureates: TopLaureate[] = MOCK_STUDENTS.map((student, index) => ({
        id: student.id,
        name: `${student.prenom} ${student.nom}`,
        matricule: student.matricule,
        average: 18 - (index * 0.5),
        mention: index < 3 ? 'Excellent' : (index < 6 ? 'Très bien' : 'Bien'),
        rang: index + 1,
        classe: student.classe,
        niveau: student.niveau
      }));

      return new Promise((resolve) => {
        setTimeout(() => resolve(laureates.slice(0, limit)), 600);
      });
    }

    const response = await api.get<TopLaureate[]>('/academic/statistics/top-laureates/', {
      params: { limit }
    });
    return response.data;
  }

  async getGlobalStatistics(): Promise<GlobalStatistics> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const stats: GlobalStatistics = {
        totalStudents: 150,
        total_admis: 135,
        total_redoublants: 15,
        successRate: 90,
        averageGrade: 14.2,
        excellentCount: 25,
        repartition_par_niveau: [
          { niveau: '6eme', total: 50, admis: 45, taux_reussite: 90 },
          { niveau: '5eme', total: 50, admis: 46, taux_reussite: 92 },
          { niveau: '4eme', total: 50, admis: 44, taux_reussite: 88 }
        ],
        repartition_par_classe: [
          {
            classe: '6eme A',
            niveau: '6eme',
            total_etudiants: 25,
            admis: 23,
            redoublants: 2,
            taux_reussite: 92,
            moyenne_classe: 14.5,
            moyenne_min: 8.5,
            moyenne_max: 18.2
          },
          {
            classe: '6eme B',
            niveau: '6eme',
            total_etudiants: 25,
            admis: 22,
            redoublants: 3,
            taux_reussite: 88,
            moyenne_classe: 13.8,
            moyenne_min: 7.2,
            moyenne_max: 17.8
          }
        ]
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(stats), 800);
      });
    }

    const response = await api.get<GlobalStatistics>('/academic/statistics/global/');
    return response.data;
  }

  async getClassStatistics(classe: string): Promise<ClassStatistics> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const stats: ClassStatistics = {
        classe,
        niveau: '6eme',
        total_etudiants: 25,
        admis: 23,
        redoublants: 2,
        taux_reussite: 92,
        moyenne_classe: 14.5,
        moyenne_min: 8.5,
        moyenne_max: 18.2
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(stats), 500);
      });
    }

    const response = await api.get<ClassStatistics>(`/courses/statistics/class/${classe}/`);
    return response.data;
  }

  async getStudentsWithGeneralAverage(filters?: any): Promise<any[]> {
    if (USE_MOCK_DATA) {
      // Simulation avec données fictives
      const students = MOCK_STUDENTS.map((student, index) => ({
        student,
        moyenne_generale: 15 - (index * 0.3),
        rang: index + 1,
        decision: (15 - (index * 0.3)) >= 10 ? 'ADMIS' : 'REDOUBLE'
      }));

      return new Promise((resolve) => {
        setTimeout(() => resolve(students), 600);
      });
    }

    const response = await api.post('/courses/students-with-general-average/', filters);
    return response.data;
  }

  // ========== UTILITAIRES ==========

  async getAllStudents(): Promise<Student[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_STUDENTS), 300);
      });
    }

    const response = await api.get<Student[]>('/students/');
    return response.data;
  }

  async getAllCourses(): Promise<Course[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_COURSES), 300);
      });
    }

    const response = await api.get<Course[]>('/courses/');
    return response.data;
  }

  async getNiveaux(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Tle']), 200);
      });
    }

    const response = await api.get<string[]>('/academic/niveaux/');
    return response.data;
  }

  async getClasses(niveau?: string): Promise<string[]> {
    if (USE_MOCK_DATA) {
      const classes = niveau ? [`${niveau} A`, `${niveau} B`] : ['6eme A', '6eme B', '5eme A', '5eme B'];
      return new Promise((resolve) => {
        setTimeout(() => resolve(classes), 200);
      });
    }

    const response = await api.get<string[]>('/academic/classes/', {
      params: { niveau }
    });
    return response.data;
  }
}

export const academicService = new AcademicService();
export default academicService;
