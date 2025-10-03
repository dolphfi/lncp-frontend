/**
 * =====================================================
 * STORE ZUSTAND POUR LA GESTION DES SALLES
 * =====================================================
 * Ce store centralise toute la logique de gestion d'état
 * pour les salles avec Zustand
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  Room, 
  CreateRoomDto, 
  UpdateRoomDto, 
  RoomFilters, 
  PaginationOptions,
  RoomStats,
  ClassLevel,
  ApiError 
} from '../types/student';

import { studentsService } from '../services/students/studentsService';

// Fonction utilitaire pour simuler un délai (remplace l'import manquant)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: déduire le niveau de classe (ClassLevel) depuis le nom/level backend
const toClassLevel = (nameOrLevel?: string): ClassLevel => {
  const raw = (nameOrLevel || '').toLowerCase().replace(/\s+/g, '');
  if (raw.includes('secondaire')) return 'secondaire';
  if (raw.includes('3ecycle') || raw.includes('3e_cycle')) return '3e_cycle';
  if (raw.includes('fondamentale')) return 'fondamentale';
  // Fallback par défaut
  return 'secondaire';
};

// =====================================================
// INTERFACE DU STORE
// =====================================================
interface RoomStore {
  // État
  rooms: Room[];
  loading: boolean;
  error: ApiError | null;
  loadingAction: 'create' | 'update' | 'delete' | null;
  
  // Filtres et pagination
  filters: RoomFilters;
  pagination: PaginationOptions;
  sortOptions: {
    field: keyof Room;
    order: 'asc' | 'desc';
  };
  
  // Statistiques
  stats: RoomStats | null;
  
  // Actions principales
  fetchRooms: () => Promise<void>;
  createRoom: (data: CreateRoomDto) => Promise<void>;
  updateRoom: (data: UpdateRoomDto) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  
  // Actions de filtrage et tri
  setFilters: (filters: Partial<RoomFilters>) => void;
  setSortOptions: (sort: { field: keyof Room; order: 'asc' | 'desc' }) => void;
  changePage: (page: number) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetFilters: () => void;
  fetchStats: () => Promise<void>;
  getRoomsByClassLevel: (classLevel: ClassLevel) => Room[];
  getRoomById: (id: string) => Room | undefined;
}

// =====================================================
// CRÉATION DU STORE ZUSTAND
// =====================================================
export const useRoomStore = create<RoomStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // =====================================================
      // ÉTAT INITIAL
      // =====================================================
      rooms: [],
      loading: false,
      error: null,
      loadingAction: null,
      
      // Filtres et pagination
      filters: {
        search: '',
        classLevel: undefined,
        isActive: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      sortOptions: {
        field: 'name',
        order: 'asc'
      },
      
      // Statistiques
      stats: null,
      
      // =====================================================
      // ACTIONS PRINCIPALES
      // =====================================================
      
      fetchRooms: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Récupérer les salles depuis l'API backend
          const roomsData = await studentsService.getAllRooms();
          
          // Convertir les données API au format Room attendu
          const convertedRooms: Room[] = roomsData.map((room: any) => ({
            id: room.id,
            name: room.name,
            classLevel: toClassLevel(room.classroom?.name || room.classroom?.level),
            capacity: room.capacity,
            description: `Salle ${room.name} - Classe ${room.classroom?.name || 'N/A'}`,
            isActive: room.status === 'Disponible',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          set(state => {
            state.rooms = convertedRooms;
            state.pagination = {
              ...state.pagination,
              total: convertedRooms.length,
              totalPages: Math.ceil(convertedRooms.length / state.pagination.limit)
            };
            state.loading = false;
          });
          
        } catch (error) {
          console.error('Erreur lors du chargement des salles:', error);
          set(state => {
            state.loading = false;
            state.error = {
              message: 'Erreur lors du chargement des salles',
              code: 'FETCH_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      createRoom: async (data: CreateRoomDto) => {
        set(state => {
          state.loadingAction = 'create';
          state.error = null;
        });
        
        try {
          // TODO: Implémenter l'appel API pour créer une salle
          console.log('Création de salle non implémentée:', data);
          
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Création de salle non implémentée',
              code: 'NOT_IMPLEMENTED',
              details: [{ field: 'general', message: 'Cette fonctionnalité nécessite une API backend' }]
            };
          });
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création de la salle',
              code: 'CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      updateRoom: async (data: UpdateRoomDto) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // TODO: Implémenter l'appel API pour mettre à jour une salle
          console.log('Mise à jour de salle non implémentée:', data);
          
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Mise à jour de salle non implémentée',
              code: 'NOT_IMPLEMENTED',
              details: [{ field: 'general', message: 'Cette fonctionnalité nécessite une API backend' }]
            };
          });
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de la salle',
              code: 'UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      deleteRoom: async (id: string) => {
        set(state => {
          state.loadingAction = 'delete';
          state.error = null;
        });
        
        try {
          // TODO: Implémenter l'appel API pour supprimer une salle
          console.log('Suppression de salle non implémentée:', id);
          
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Suppression de salle non implémentée',
              code: 'NOT_IMPLEMENTED',
              details: [{ field: 'general', message: 'Cette fonctionnalité nécessite une API backend' }]
            };
          });
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la suppression de la salle',
              code: 'DELETE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      // =====================================================
      // ACTIONS DE FILTRAGE ET TRI
      // =====================================================
      
      setFilters: (filters: Partial<RoomFilters>) => {
        set(state => {
          state.filters = { ...state.filters, ...filters };
          state.pagination.page = 1; // Reset à la première page
        });
        
        // Recharger les données avec les nouveaux filtres
        get().fetchRooms();
      },
      
      setSortOptions: (sort: { field: keyof Room; order: 'asc' | 'desc' }) => {
        set(state => {
          state.sortOptions = sort;
        });
        
        // Recharger les données avec le nouveau tri
        get().fetchRooms();
      },
      
      changePage: (page: number) => {
        set(state => {
          state.pagination.page = page;
        });
        
        // Recharger les données avec la nouvelle page
        get().fetchRooms();
      },
      
      // =====================================================
      // ACTIONS UTILITAIRES
      // =====================================================
      
      clearError: () => {
        set(state => {
          state.error = null;
        });
      },
      
      resetFilters: () => {
        set(state => {
          state.filters = {
            search: '',
            classLevel: undefined,
            isActive: undefined
          };
          state.pagination.page = 1;
        });
        
        // Recharger les données
        get().fetchRooms();
      },
      
      fetchStats: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });
        
        try {
          // Calculer les statistiques à partir des salles actuelles
          const { rooms } = get();
          const stats: RoomStats = {
            total: rooms.length,
            active: rooms.filter(room => room.isActive).length,
            inactive: rooms.filter(room => !room.isActive).length,
            byClassLevel: {
              secondaire: rooms.filter(room => room.classLevel === 'secondaire').length,
              '3e_cycle': rooms.filter(room => room.classLevel === '3e_cycle').length,
              fondamentale: rooms.filter(room => room.classLevel === 'fondamentale').length
            },
            totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
            averageCapacity: rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + room.capacity, 0) / rooms.length) : 0
          };
          
          set(state => {
            state.stats = stats;
            state.loading = false;
          });
          
        } catch (error) {
          set(state => {
            state.loading = false;
            state.error = {
              message: 'Erreur lors du chargement des statistiques',
              code: 'FETCH_STATS_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      getRoomsByClassLevel: (classLevel: ClassLevel) => {
        const { rooms } = get();
        return rooms.filter(room => room.classLevel === classLevel);
      },
      
      getRoomById: (id: string) => {
        const { rooms } = get();
        return rooms.find(room => room.id === id);
      }
    }))
  )
);

// =====================================================
// HOOKS UTILITAIRES
// =====================================================

export const useRooms = () => {
  return useRoomStore(state => state.rooms);
};

export const useRoomLoading = () => {
  return useRoomStore(state => state.loading);
};

export const useRoomError = () => {
  return useRoomStore(state => state.error);
};

export const useRoomStats = () => {
  return useRoomStore(state => state.stats);
};

export const useRoomFilters = () => {
  return useRoomStore(state => state.filters);
};

export const useRoomPagination = () => {
  return useRoomStore(state => state.pagination);
}; 