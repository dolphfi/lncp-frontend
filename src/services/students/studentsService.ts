import axios from 'axios';
import { getApiUrl } from '../../config/api';
import authService from '../authService';

// Types basiques pour les personnes responsables
export interface ResponsableDTO {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  lienParente: string; // ex: "Mère", "Père", "Tuteur"
  nif?: string;
  ninu?: string;
}

export interface Responsable extends ResponsableDTO {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
  };
  lienParente: string;
  nif?: string;
  ninu?: string;
  students?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Adresse (structure exacte à confirmer selon Swagger)
export interface AdresseDTO {
  // A CONFIRMER: placer ici les champs attendus par l'API (rue, ville, commune, etc.)
  [key: string]: any;
}

// Payload minimal pour la création d'un étudiant via multipart/form-data
// L'API attend un FormData avec des champs en français (sexe, lieuDeNaissance, etc.)
export interface AddStudentApiPayload {
  firstName: string;
  lastName: string;
  email?: string;
  sexe: string;
  dateOfBirth: string; // ISO string
  avatar?: File;
  lieuDeNaissance: string;
  communeDeNaissance: string;
  hasHandicap: boolean;
  handicapDetails?: string;
  adresse: AdresseDTO;
  vacation: string;
  niveauEnseignement: string;
  niveauEtude: string;
  nomMere: string;
  prenomMere: string;
  statutMere: string;
  occupationMere?: string;
  nomPere: string;
  prenomPere: string;
  statutPere: string;
  occupationPere?: string;
  personneResponsableId?: string; // utiliser soit ceci, soit createPersonneResponsable
  createPersonneResponsable?: ResponsableDTO;
  classroomId: string;
  roomId: string;
}

// Construit un FormData à partir du payload ci-dessus
export const buildStudentFormData = (payload: AddStudentApiPayload): FormData => {
  const fd = new FormData();
  // Champs simples
  fd.append('firstName', payload.firstName);
  fd.append('lastName', payload.lastName);
  if (payload.email) fd.append('email', payload.email);
  fd.append('sexe', payload.sexe);
  fd.append('dateOfBirth', payload.dateOfBirth);
  if (payload.avatar) fd.append('avatar', payload.avatar);
  fd.append('lieuDeNaissance', payload.lieuDeNaissance);
  fd.append('communeDeNaissance', payload.communeDeNaissance);
  fd.append('hasHandicap', String(payload.hasHandicap));
  if (payload.handicapDetails) fd.append('handicapDetails', payload.handicapDetails);
  fd.append('vacation', payload.vacation);
  fd.append('niveauEnseignement', payload.niveauEnseignement);
  fd.append('niveauEtude', payload.niveauEtude);
  fd.append('nomMere', payload.nomMere);
  fd.append('prenomMere', payload.prenomMere);
  fd.append('statutMere', payload.statutMere);
  if (payload.occupationMere) fd.append('occupationMere', payload.occupationMere);
  fd.append('nomPere', payload.nomPere);
  fd.append('prenomPere', payload.prenomPere);
  fd.append('statutPere', payload.statutPere);
  if (payload.occupationPere) fd.append('occupationPere', payload.occupationPere);
  fd.append('classroomId', payload.classroomId);
  fd.append('roomId', payload.roomId);

  // Adresse (objet): selon l'API, si elle attend un JSON stringifié dans multipart
  fd.append('adresse', JSON.stringify(payload.adresse));

  // Responsable: seulement l'ID (le responsable doit être créé séparément avant)
  if (payload.personneResponsableId) {
    fd.append('personneResponsableId', payload.personneResponsableId);
  }

  return fd;
};

// Service HTTP
const http = axios.create({
  baseURL: getApiUrl(''),
  withCredentials: true
});

// Intercepteur: injecter le token d'auth automatiquement
http.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponse: propager proprement l'erreur (avec message backend si présent)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiMsg = err?.response?.data?.message || err?.message || 'Erreur réseau';
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[studentsService] Error:', apiMsg, err?.response?.data);
    }
    return Promise.reject(new Error(apiMsg));
  }
);

export const studentsService = {
  // POST /students/responsables/add-responsable (application/json)
  async addResponsable(responsable: ResponsableDTO): Promise<Responsable> {
    const url = getApiUrl('/students/responsables/add-responsable');
    const res = await http.post(url, responsable, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  // POST /students/add-student (multipart/form-data)
  async addStudent(payload: AddStudentApiPayload) {
    const formData = buildStudentFormData(payload);
    const url = getApiUrl('/students/add-student');

    // Debug: lister les clés et aperçus de valeurs scalaires (tronquées)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const preview: Record<string, any> = {};
        for (const [k, v] of (formData as any).entries()) {
          const val = typeof v === 'string' ? (v.length > 80 ? v.slice(0, 77) + '...' : v) : (v && (v as any).name) ? `[File:${(v as any).name}]` : typeof v;
          // Ne pas logger des données sensibles éventuelles
          if (!['password', 'token', 'refresh_token'].includes(k)) preview[k] = val;
        }
        // eslint-disable-next-line no-console
        console.groupCollapsed('[studentsService] POST /students/add-student - FormData preview');
        // eslint-disable-next-line no-console
        console.log('URL:', url);
        // eslint-disable-next-line no-console
        console.table(preview);
        // eslint-disable-next-line no-console
        console.groupEnd();
      } catch {}
    }

    const res = await http.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[studentsService] POST /students/add-student - Response status:', res.status);
    }

    return res.data;
  },

  // GET /students/responsables
  async getResponsables(): Promise<Responsable[]> {
    const url = getApiUrl('/students/responsables');
    const res = await http.get(url);
    return res.data;
  },

  // GET /students/all-students - Lister tous les étudiants avec pagination
  async getAllStudents(page: number = 1, limit: number = 10): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
    };
  }> {
    const url = getApiUrl('/students/all-students');
    const res = await http.get(url, {
      params: { page, limit }
    });
    return res.data;
  },

  // GET /students/all-students - Récupérer tous les étudiants sans pagination pour recherche et stats
  async getAllStudentsComplete(): Promise<{
    data: any[];
    meta: {
      total: number;
    };
  }> {
    const url = getApiUrl('/students/all-students');
    const res = await http.get(url, {
      params: { page: 1, limit: 100 } // Limite maximale autorisée par l'API
    });
    return res.data;
  },

  // GET /classroom/all-classroom - Récupérer toutes les salles depuis les classrooms
  async getAllRooms(): Promise<any[]> {
    const url = getApiUrl('/classroom/all-classroom');
    const res = await http.get(url, {
      params: { page: 1, limit: 100 }
    });
    
    // Extraire toutes les salles de tous les classrooms
    const allRooms: any[] = [];
    if (res.data && res.data.data) {
      res.data.data.forEach((classroom: any) => {
        if (classroom.rooms && classroom.rooms.length > 0) {
          classroom.rooms.forEach((room: any) => {
            allRooms.push({
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              status: room.status,
              classroom: {
                id: classroom.id,
                name: classroom.name
              }
            });
          });
        }
      });
    }
    
    return allRooms;
  },

  // GET /students/by-matricule/{matricule} - Trouver un étudiant par son matricule
  async getStudentByMatricule(matricule: string): Promise<any> {
    const url = getApiUrl(`/students/by-matricule/${matricule}`);
    const res = await http.get(url);
    return res.data;
  },

  // GET /students/by-classroom/{classroomId} - Trouver tous les étudiants d'une classe
  async getStudentsByClassroom(classroomId: string): Promise<any[]> {
    const url = getApiUrl(`/students/by-classroom/${classroomId}`);
    const res = await http.get(url);
    return res.data;
  },

  // GET /students/by-room/{roomId} - Trouver tous les étudiants d'une salle
  async getStudentsByRoom(roomId: string): Promise<any[]> {
    const url = getApiUrl(`/students/by-room/${roomId}`);
    const res = await http.get(url);
    return res.data;
  },

  // GET /students/{id} - Trouver un étudiant par son ID
  async getStudentById(id: string): Promise<any> {
    const url = getApiUrl(`/students/${id}`);
    const res = await http.get(url);
    return res.data;
  },

  // PATCH /students/{id} - Mettre à jour un étudiant
  async updateStudent(id: string, updateData: Partial<AddStudentApiPayload>): Promise<any> {
    const url = getApiUrl(`/students/${id}`);
    
    // Si des données de fichier sont présentes, utiliser FormData
    if (updateData.avatar) {
      const formData = new FormData();
      
      // Ajouter tous les champs au FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const res = await http.patch(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } else {
      // Sinon utiliser JSON
      const res = await http.patch(url, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    }
  }
};
