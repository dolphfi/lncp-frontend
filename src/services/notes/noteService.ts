/**
 * =====================================================
 * SERVICE API POUR LA GESTION DES NOTES ACADÉMIQUES
 * =====================================================
 * Service dédié aux notes académiques avec données mockées complètes
 * pour le développement et les tests
 */

import axios from 'axios';
import { config } from '../../config/environment';
import authService from '../authService';

// Configuration de base d'axios pour les notes
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mode développement - utiliser les données réelles de l'API
const USE_MOCK_DATA = false; // Utilisation de l'API réelle

class NoteService {
  // ========== DONNÉES DE RÉFÉRENCE ==========

  /**
   * Récupérer les étudiants selon le rôle de l'utilisateur connecté
   */
  async getMyStudents(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([
          {
            id: '1',
            matricule: '23N2001',
            firstName: 'Jean',
            lastName: 'Dupont',
            grade: 'NSII',
            classroom: { id: '1', name: 'NSII A' },
            room: { id: '1', name: 'Salle A', capacity: 30, status: 'Disponible' },
            courses: [
              { id: '1', code: 'MATH', titre: 'Mathématiques' },
              { id: '2', code: 'FR', titre: 'Français' }
            ]
          },
          {
            id: '2',
            matricule: '23N2002',
            firstName: 'Marie',
            lastName: 'Martin',
            grade: 'NSII',
            classroom: { id: '1', name: 'NSII A' },
            room: { id: '1', name: 'Salle A', capacity: 30, status: 'Disponible' },
            courses: [
              { id: '1', code: 'MATH', titre: 'Mathématiques' },
              { id: '2', code: 'FR', titre: 'Français' }
            ]
          },
          {
            id: '3',
            matricule: '23N1001',
            firstName: 'Pierre',
            lastName: 'Durand',
            grade: 'NSI',
            classroom: { id: '2', name: 'NSI A' },
            room: { id: '2', name: 'Salle B', capacity: 25, status: 'Disponible' },
            courses: [
              { id: '3', code: 'INFO', titre: 'Informatique' },
              { id: '4', code: 'PHYS', titre: 'Physique' }
            ]
          }
        ]), 300);
      });
    }

    const response = await api.get<any[]>('/notes/my-students');
    return response.data;
  }

  /**
   * Récupérer les cours d'un professeur depuis le dashboard
   */
  async getTeacherCourses(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([
          {
            id: '1',
            code: 'INFO-101',
            titre: 'Informatique',
            description: 'Cours d\'informatique générale',
            categorie: 'Informatique',
            ponderation: 100,
            statut: 'Actif',
            classroom: { id: '1', name: 'NSIII' }
          },
          {
            id: '2',
            code: 'MATH-201',
            titre: 'Mathématiques Avancées',
            description: 'Mathématiques pour NSII',
            categorie: 'Mathematiques',
            ponderation: 150,
            statut: 'Actif',
            classroom: { id: '1', name: 'NSII' }
          }
        ]), 300);
      });
    }

    const response = await api.get<any>('/dashboard');
    return response.data?.courses || [];
  }

  /**
   * Récupérer tous les cours avec filtre par classe (côté client)
   * Utilisé pour les rôles ADMIN, SUPER_ADMIN, DIRECTOR, CENSEUR
   * Note: L'API /courses/all-courses ne supporte pas le filtre par classe,
   * donc on charge tous les cours et on filtre côté client si nécessaire
   */
  async getAllCoursesWithClassFilter(classroomId?: string): Promise<any[]> {
    if (USE_MOCK_DATA) {
      const allCourses = [
        {
          id: '1',
          titre: 'Mathématiques',
          code: 'MATH',
          categorie: 'Mathematiques',
          ponderation: 4,
          niveau: 'NSII'
        },
        {
          id: '2',
          titre: 'Français',
          code: 'FR',
          categorie: 'Francais',
          ponderation: 4,
          niveau: 'NSII'
        },
        {
          id: '3',
          titre: 'Informatique',
          code: 'INFO',
          categorie: 'Informatique',
          ponderation: 3,
          niveau: 'NSI'
        },
        {
          id: '4',
          titre: 'Physique',
          code: 'PHYS',
          categorie: 'Sciences',
          ponderation: 3,
          niveau: 'NSI'
        }
      ];

      if (classroomId) {
        return allCourses.filter(course => course.niveau === 'NSII');
      }

      return allCourses;
    }

    try {
      // Charger tous les cours avec pagination (limite max de 100 par page)
      let allCourses: any[] = [];
      let currentPage = 1;
      const pageSize = 100;
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await api.get<any>('/courses/all-courses', {
          params: {
            page: currentPage,
            limit: pageSize
          }
        });

        // L'API peut retourner { data: [...], pagination: {...} } ou directement [...]
        const coursesData = response.data?.data || response.data || [];
        const pagination = response.data?.pagination;

        if (Array.isArray(coursesData)) {
          allCourses = [...allCourses, ...coursesData];
        }

        // Vérifier s'il y a plus de pages
        if (pagination) {
          hasMoreData = currentPage < pagination.totalPages;
          currentPage++;
        } else {
          // Si pas de pagination dans la réponse, on suppose qu'il n'y a qu'une page
          hasMoreData = false;
        }

        // Sécurité : arrêter après 10 pages max (1000 cours)
        if (currentPage > 10) {
          hasMoreData = false;
        }
      }
      
      // Filtrer côté client si classroomId est fourni
      if (classroomId && Array.isArray(allCourses)) {
        allCourses = allCourses.filter((course: any) => 
          course.classroom?.id === classroomId || 
          course.classroomId === classroomId
        );
      }
      
      return allCourses;
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      return [];
    }
  }

  /**
   * Récupérer toutes les classes pour le filtre
   */
  async getAllClassrooms(): Promise<any[]> {
    try {
      const response = await api.get<any>('/classroom/all-classroom');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      return [];
    }
  }

  // ========== GESTION DES NOTES ==========

  /**
   * Créer ou mettre à jour une note (upsert)
   * L'API détermine automatiquement si c'est une création ou une mise à jour
   */
  async createNote(noteData: any): Promise<any> {
    if (USE_MOCK_DATA) {
      const newNote = {
        id: `note_${Date.now()}`,
        studentId: noteData.studentId,
        courseId: noteData.courseId,
        trimestre: noteData.trimestre,
        note: noteData.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(newNote), 500);
      });
    }

    try {
      const response = await api.post<any>('/notes/upsert', noteData);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      throw error;
    }
  }

  /**
   * Convertir les données API (trimestre_1, trimestre_2, trimestre_3) 
   * vers le format frontend avec enrichissement des cours
   * Garde une ligne par étudiant/cours avec les 3 trimestres
   */
  private async convertApiNotesToFrontend(apiNotes: any[]): Promise<any[]> {
    const convertedNotes: any[] = [];
    
    // Récupérer tous les cours pour avoir les pondérations
    let coursesMap = new Map<string, any>();
    try {
      const allCourses = await this.getAllCoursesWithClassFilter();
      allCourses.forEach(course => {
        coursesMap.set(course.id, course);
      });
      console.log(`📚 ${coursesMap.size} cours chargés pour enrichissement`);
    } catch (error) {
      console.warn('⚠️ Impossible de charger les cours pour enrichissement:', error);
    }
    
    apiNotes.forEach((apiNote: any) => {
      // Enrichir les informations du cours avec la pondération
      const courseId = apiNote.course?.id;
      const fullCourse = coursesMap.get(courseId);
      
      // Garder UNE SEULE ligne par étudiant/cours avec les 3 trimestres
      convertedNotes.push({
        id: apiNote.id, // ID de la note dans la BD
        // Notes par trimestre (null si pas encore saisie)
        trimestre_1: apiNote.trimestre_1 !== null ? parseFloat(apiNote.trimestre_1) : null,
        trimestre_2: apiNote.trimestre_2 !== null ? parseFloat(apiNote.trimestre_2) : null,
        trimestre_3: apiNote.trimestre_3 !== null ? parseFloat(apiNote.trimestre_3) : null,
        // Informations étudiant
        student: {
          id: apiNote.student?.id || '',
          matricule: apiNote.student?.matricule || '',
          firstName: apiNote.student?.firstName || '',
          lastName: apiNote.student?.lastName || ''
        },
        // Informations cours enrichies
        course: {
          id: apiNote.course?.id || '',
          code: apiNote.course?.code || '',
          titre: apiNote.course?.titre || '',
          ponderation: fullCourse?.ponderation || 100,
          categorie: fullCourse?.categorie || '',
          description: fullCourse?.description || ''
        },
        // Métadonnées
        user: apiNote.user || null,
        createdAt: apiNote.createdAt || '',
        updatedAt: apiNote.updatedAt || ''
      });
    });
    
    return convertedNotes;
  }

  /**
   * Récupérer toutes les notes depuis l'endpoint /notes/all-notes (sans pagination)
   * Utilisé pour ADMIN, SUPER_ADMIN, DIRECTOR, CENSORED, etc.
   * @deprecated Utiliser getAllNotesAdmin avec pagination pour l'interface admin
   */
  async getAllNotesLegacy(): Promise<any[]> {
    try {
      console.log('🌐 Appel API getAllNotesLegacy');
      const response = await api.get<any>('/notes/all-notes');
      
      console.log('📊 Réponse brute getAllNotesLegacy:', response.data);
      
      // L'API retourne directement un tableau ou un objet avec data
      const apiNotesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      console.log(`📝 Reçu ${apiNotesData.length} notes de l'API`);
      
      // Convertir vers le format frontend (avec enrichissement des cours)
      const convertedNotes = await this.convertApiNotesToFrontend(apiNotesData);
      
      console.log(`✅ ${convertedNotes.length} entrées de notes après conversion`);
      return convertedNotes;
    } catch (error) {
      console.error('❌ Erreur getAllNotesLegacy:', error);
      throw error;
    }
  }

  /**
   * Convertir les pendingNotes du dashboard vers le format frontend
   * Format pendingNotes: [{id, student, course, trimestre: "T1", note, status, createdAt}]
   * Format attendu: [{id, student, course, trimestre_1, trimestre_2, trimestre_3, status, createdAt}]
   */
  private convertPendingNotesToFrontend(pendingNotes: any[]): any[] {
    const notesMap = new Map<string, any>();
    
    pendingNotes.forEach((pendingNote: any) => {
      const key = `${pendingNote.student?.id || 'unknown'}_${pendingNote.course?.id || 'unknown'}`;
      
      if (!notesMap.has(key)) {
        // Créer une nouvelle entrée pour cet étudiant/cours
        notesMap.set(key, {
          id: pendingNote.id,
          student: {
            id: pendingNote.student?.id || '',
            matricule: pendingNote.student?.matricule || '',
            firstName: pendingNote.student?.user?.firstName || pendingNote.student?.firstName || '',
            lastName: pendingNote.student?.user?.lastName || pendingNote.student?.lastName || '',
            grade: pendingNote.student?.classroom?.name || ''
          },
          course: {
            id: pendingNote.course?.id || '',
            code: pendingNote.course?.code || '',
            titre: pendingNote.course?.titre || '',
            ponderation: pendingNote.course?.ponderation || 100
          },
          trimestre_1: null,
          trimestre_2: null,
          trimestre_3: null,
          status: pendingNote.status || 'PENDING',
          createdAt: pendingNote.createdAt || '',
          updatedAt: pendingNote.updatedAt || ''
        });
      }
      
      // Ajouter la note dans le bon trimestre
      const entry = notesMap.get(key)!;
      const note = parseFloat(pendingNote.note);
      
      switch (pendingNote.trimestre) {
        case 'T1':
          entry.trimestre_1 = note;
          break;
        case 'T2':
          entry.trimestre_2 = note;
          break;
        case 'T3':
          entry.trimestre_3 = note;
          break;
      }
    });
    
    return Array.from(notesMap.values());
  }

  /**
   * Récupérer les notes en attente depuis le dashboard (TEACHER uniquement)
   * Endpoint: GET /dashboard - champ pendingNotes
   * Utilisé par les professeurs pour voir leurs notes en attente de validation
   */
  async getDashboardPendingNotes(): Promise<any[]> {
    try {
      console.log('🌐 Appel API getDashboardPendingNotes (dashboard)');
      const response = await api.get<any>('/dashboard');
      
      console.log('📊 Réponse dashboard:', response.data);
      
      // Extraire pendingNotes du dashboard
      const apiPendingNotes = response.data?.pendingNotes || [];
      
      console.log(`📝 Reçu ${apiPendingNotes.length} notes en attente de l'API`);
      
      // Convertir vers le format frontend (spécifique pour pendingNotes)
      const convertedNotes = this.convertPendingNotesToFrontend(apiPendingNotes);
      
      console.log(`✅ ${convertedNotes.length} entrées de notes après conversion`);
      return convertedNotes;
    } catch (error) {
      console.error('❌ Erreur getDashboardPendingNotes:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les notes avec filtres et pagination
   */
  async getNotes(filters?: any, pagination?: any): Promise<any> {
    if (USE_MOCK_DATA) {
      const mockNotes = [
        {
          id: '1',
          studentId: '1',
          courseId: '1',
          trimestre: 'T1',
          note: 15.5,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          studentId: '1',
          courseId: '2',
          trimestre: 'T1',
          note: 14.0,
          createdAt: '2024-01-16T10:00:00Z',
          updatedAt: '2024-01-16T10:00:00Z',
        },
        {
          id: '3',
          studentId: '2',
          courseId: '1',
          trimestre: 'T1',
          note: 16.2,
          createdAt: '2024-01-17T10:00:00Z',
          updatedAt: '2024-01-17T10:00:00Z',
        }
      ];

      return new Promise((resolve) => {
        setTimeout(() => resolve({
          data: mockNotes,
          pagination: {
            page: pagination?.page || 1,
            limit: pagination?.limit || 20,
            total: mockNotes.length,
            totalPages: Math.ceil(mockNotes.length / (pagination?.limit || 20))
          }
        }), 500);
      });
    }

    const params = { ...filters, ...pagination };
    const response = await api.get<any>('/notes/', { params });
    return {
      data: response.data.results,
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
        total: response.data.count,
        totalPages: Math.ceil(response.data.count / (pagination?.limit || 20))
      }
    };
  }

  /**
   * Récupérer une note par son ID
   */
  async getNoteById(id: string): Promise<any> {
    if (USE_MOCK_DATA) {
      const mockNote = {
        id: '1',
        studentId: '1',
        courseId: '1',
        trimestre: 'T1',
        note: 15.5,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(mockNote), 300);
      });
    }

    const response = await api.get<any>(`/notes/${id}/`);
    return response.data;
  }

  /**
   * Mettre à jour une note
   */
  async updateNote(id: string, noteData: any): Promise<any> {
    if (USE_MOCK_DATA) {
      const updatedNote = {
        id,
        studentId: noteData.studentId,
        courseId: noteData.courseId,
        trimestre: noteData.trimestre,
        note: noteData.note,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(updatedNote), 500);
      });
    }

    const response = await api.put<any>(`/notes/${id}/`, noteData);
    return response.data;
  }

  /**
   * Supprimer une note
   */
  async deleteNote(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    }

    await api.delete(`/notes/${id}/`);
  }

  // ========== RECHERCHE ==========

  /**
   * Rechercher des étudiants
   */
  async searchStudents(query: string): Promise<any[]> {
    if (USE_MOCK_DATA) {
      const allStudents = await this.getMyStudents();
      const filteredStudents = allStudents.filter(student =>
        student.firstName.toLowerCase().includes(query.toLowerCase()) ||
        student.lastName.toLowerCase().includes(query.toLowerCase()) ||
        student.matricule.toLowerCase().includes(query.toLowerCase())
      );

      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredStudents), 300);
      });
    }

    const response = await api.get<any[]>('/students/search/', {
      params: { q: query }
    });
    return response.data;
  }

  /**
   * Rechercher des cours
   */
  async searchCourses(query: string, niveau?: string): Promise<any[]> {
    if (USE_MOCK_DATA) {
      const allCourses = await this.getAllCoursesWithClassFilter();
      let filteredCourses = allCourses.filter(course =>
        course.titre.toLowerCase().includes(query.toLowerCase()) ||
        (course.code && course.code.toLowerCase().includes(query.toLowerCase()))
      );

      if (niveau) {
        filteredCourses = filteredCourses.filter(course => course.niveau === niveau);
      }

      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredCourses), 300);
      });
    }

    const response = await api.get<any[]>('/courses/search/', {
      params: { q: query, niveau }
    });
    return response.data;
  }

  /**
   * Récupérer tous les étudiants
   */
  async getAllStudents(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([
          {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            studentId: '23N2001',
            grade: 'NSII',
            roomName: 'Salle A'
          },
          {
            id: '2',
            firstName: 'Marie',
            lastName: 'Martin',
            studentId: '23N2002',
            grade: 'NSII',
            roomName: 'Salle A'
          },
          {
            id: '3',
            firstName: 'Pierre',
            lastName: 'Durand',
            studentId: '23N1001',
            grade: 'NSI',
            roomName: 'Salle B'
          }
        ]), 300);
      });
    }

    const response = await api.get<any[]>('/students/');
    return response.data;
  }

  /**
   * Récupérer tous les cours
   */
  async getAllCourses(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([
          {
            id: '1',
            titre: 'Mathématiques',
            code: 'MATH',
            categorie: 'Mathematiques',
            ponderation: 4,
            niveau: 'NSII'
          },
          {
            id: '2',
            titre: 'Français',
            code: 'FR',
            categorie: 'Francais',
            ponderation: 4,
            niveau: 'NSII'
          },
          {
            id: '3',
            titre: 'Informatique',
            code: 'INFO',
            categorie: 'Informatique',
            ponderation: 3,
            niveau: 'NSI'
          }
        ]), 300);
      });
    }

    const response = await api.get<any[]>('/courses/');
    return response.data;
  }

  // ========== BULLETINS ==========

  /**
   * Générer le bulletin individuel d'un étudiant
   */
  async getStudentBulletin(studentId: string, trimestre?: string): Promise<any> {
    if (USE_MOCK_DATA) {
      const bulletin = {
        student: {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          studentId: studentId,
          grade: 'NSII',
          roomName: 'Salle A'
        },
        trimestre: trimestre || 'T1',
        notes: [
          {
            course: {
              id: '1',
              titre: 'Mathématiques',
              categorie: 'Mathematiques',
              ponderation: 4
            },
            note: 15.5,
            coefficient: 4
          },
          {
            course: {
              id: '2',
              titre: 'Français',
              categorie: 'Francais',
              ponderation: 4
            },
            note: 14.0,
            coefficient: 4
          }
        ],
        moyenneGenerale: 14.75,
        totalPonderation: 8,
        rang: 2,
        decision: 'ADMIS'
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(bulletin), 800);
      });
    }

    const response = await api.post<any>('/notes/student-bulletin/', {
      studentId,
      trimestre
    });
    return response.data;
  }

  /**
   * Générer le bulletin collectif d'une classe
   */
  async getClassBulletin(classe: string, trimestre: string): Promise<any> {
    if (USE_MOCK_DATA) {
      const bulletin = {
        classe,
        niveau: 'NSII',
        trimestre: trimestre as any,
        students: [
          {
            student: {
              id: '1',
              firstName: 'Jean',
              lastName: 'Dupont',
              studentId: '23N2001',
              grade: classe,
              roomName: 'Salle A'
            },
            trimestre: trimestre as any,
            notes: [
              {
                course: {
                  id: '1',
                  titre: 'Mathématiques',
                  categorie: 'Mathematiques',
                  ponderation: 4
                },
                note: 15.5,
                coefficient: 4
              }
            ],
            moyenneGenerale: 15.5,
            totalPonderation: 4,
            rang: 1,
            decision: 'ADMIS'
          },
          {
            student: {
              id: '2',
              firstName: 'Marie',
              lastName: 'Martin',
              studentId: '23N2002',
              grade: classe,
              roomName: 'Salle A'
            },
            trimestre: trimestre as any,
            notes: [
              {
                course: {
                  id: '1',
                  titre: 'Mathématiques',
                  categorie: 'Mathematiques',
                  ponderation: 4
                },
                note: 14.2,
                coefficient: 4
              }
            ],
            moyenneGenerale: 14.2,
            totalPonderation: 4,
            rang: 2,
            decision: 'ADMIS'
          }
        ],
        statistiques: {
          totalEtudiants: 2,
          admis: 2,
          redoublants: 0,
          tauxReussite: 100,
          moyenneClasse: 14.85
        }
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(bulletin), 1000);
      });
    }

    const response = await api.post<any>('/notes/class-bulletin/', {
      classe,
      trimestre
    });
    return response.data;
  }

  // ========== STATISTIQUES ==========

  /**
   * Récupérer les statistiques globales
   */
  async getGlobalStatistics(): Promise<any> {
    if (USE_MOCK_DATA) {
      const stats = {
        totalStudents: 150,
        totalAdmis: 135,
        totalRedoublants: 15,
        successRate: 90,
        averageGrade: 14.2,
        excellentCount: 25,
        repartitionParNiveau: [
          { niveau: 'NSI', total: 50, admis: 45, tauxReussite: 90 },
          { niveau: 'NSII', total: 50, admis: 46, tauxReussite: 92 },
          { niveau: 'NSIII', total: 50, admis: 44, tauxReussite: 88 }
        ],
        repartitionParClasse: [
          {
            classe: 'NSII A',
            niveau: 'NSII',
            totalEtudiants: 25,
            admis: 23,
            redoublants: 2,
            tauxReussite: 92,
            moyenneClasse: 14.5,
            moyenneMin: 8.5,
            moyenneMax: 18.2
          }
        ]
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(stats), 800);
      });
    }

    const response = await api.get<any>('/notes/statistics/global/');
    return response.data;
  }

  /**
   * Récupérer les top lauréats
   */
  async getTopLaureates(limit: number = 10): Promise<any[]> {
    if (USE_MOCK_DATA) {
      const laureates = [
        {
          id: '1',
          name: 'Jean Dupont',
          studentId: '23N2001',
          average: 18.5,
          mention: 'Excellent',
          rang: 1,
          classe: 'NSII A',
          niveau: 'NSII'
        },
        {
          id: '2',
          name: 'Marie Martin',
          studentId: '23N2002',
          average: 17.8,
          mention: 'Très Bien',
          rang: 2,
          classe: 'NSII A',
          niveau: 'NSII'
        },
        {
          id: '3',
          name: 'Pierre Durand',
          studentId: '23N1001',
          average: 17.2,
          mention: 'Très Bien',
          rang: 3,
          classe: 'NSI A',
          niveau: 'NSI'
        }
      ];

      return new Promise((resolve) => {
        setTimeout(() => resolve(laureates.slice(0, limit)), 600);
      });
    }

    const response = await api.get<any[]>('/notes/statistics/top-laureates/', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Récupérer les statistiques d'une classe
   */
  async getClassStatistics(classe: string): Promise<any> {
    if (USE_MOCK_DATA) {
      const stats = {
        classe,
        niveau: 'NSII',
        totalEtudiants: 25,
        admis: 23,
        redoublants: 2,
        tauxReussite: 92,
        moyenneClasse: 14.5,
        moyenneMin: 8.5,
        moyenneMax: 18.2
      };

      return new Promise((resolve) => {
        setTimeout(() => resolve(stats), 500);
      });
    }

    const response = await api.get<any>(`/notes/statistics/class/${classe}/`);
    return response.data;
  }

  // ========== ENDPOINTS ADMIN ==========

  /**
   * Récupérer toutes les notes validées (Admin uniquement)
   * GET /notes/all-notes
   * @param page - Numéro de page (default: 1)
   * @param limit - Nombre d'éléments par page (default: 10)
   */
  async getAllNotes(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await api.get<any>('/notes/all-notes', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de toutes les notes:', error);
      throw new Error(error.response?.data?.message || 'Impossible de récupérer les notes validées');
    }
  }

  /**
   * Récupérer toutes les notes en attente de validation (Admin uniquement)
   * GET /notes/pending
   */
  async getPendingNotes(): Promise<any> {
    try {
      const response = await api.get<any>('/notes/pending');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des notes en attente:', error);
      throw new Error(error.response?.data?.message || 'Impossible de récupérer les notes en attente');
    }
  }

  /**
   * Valider une note en attente (Admin/Censeur/Secrétaire uniquement)
   * PATCH /notes/validate/{id}
   * @param id - ID de la note en attente
   */
  async validateNote(id: string): Promise<any> {
    try {
      const response = await api.patch<any>(`/notes/validate/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la validation de la note ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Impossible de valider la note');
    }
  }

  /**
   * Rejeter une note en attente avec une raison (Admin/Censeur/Secrétaire uniquement)
   * PATCH /notes/reject/{id}
   * @param id - ID de la note en attente
   * @param reason - Raison du rejet (le professeur sera notifié par email)
   */
  async rejectNote(id: string, reason: string): Promise<any> {
    try {
      const response = await api.patch<any>(`/notes/reject/${id}`, { reason });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors du rejet de la note ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Impossible de rejeter la note');
    }
  }
}

export const noteService = new NoteService();
export default noteService;
