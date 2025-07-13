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

import { 
  mockRooms, 
  mockRoomStats, 
  delay, 
  generateRoomId, 
  searchRooms, 
  sortRooms, 
  paginateRooms,
  getRoomsByClassLevel,
  getRoomById
} from '../data/mockRooms';

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
          // Simuler un délai d'API
          await delay(1000);
          
          const { filters, sortOptions, pagination } = get();
          
          // Appliquer les filtres
          let filteredRooms = searchRooms(mockRooms, filters.search || '', {
            classLevel: filters.classLevel || undefined,
            isActive: filters.isActive
          });
          
          // Appliquer le tri
          filteredRooms = sortRooms(filteredRooms, sortOptions.field, sortOptions.order);
          
          // Appliquer la pagination
          const paginatedResult = paginateRooms(filteredRooms, pagination.page, pagination.limit);
          
          set(state => {
            state.rooms = paginatedResult.data;
            state.pagination = paginatedResult.pagination;
            state.loading = false;
          });
          
        } catch (error) {
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
          // Simuler un délai d'API
          await delay(1500);
          
          // Créer la nouvelle salle
          const newRoom: Room = {
            id: generateRoomId(),
            name: data.name,
            classLevel: data.classLevel,
            capacity: data.capacity,
            description: data.description,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Ajouter à la liste des salles mock
          mockRooms.push(newRoom);
          
          // Mettre à jour l'état
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchRooms();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la création de la salle',
              code: 'CREATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      updateRoom: async (data: UpdateRoomDto) => {
        set(state => {
          state.loadingAction = 'update';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1500);
          
          // Trouver la salle à mettre à jour
          const existingRoomIndex = mockRooms.findIndex(r => r.id === data.id);
          if (existingRoomIndex === -1) {
            throw new Error('Salle non trouvée');
          }
          
          const existingRoom = mockRooms[existingRoomIndex];
          
          // Mettre à jour la salle
          mockRooms[existingRoomIndex] = {
            ...existingRoom,
            name: data.name !== undefined ? data.name : existingRoom.name,
            classLevel: data.classLevel !== undefined ? data.classLevel : existingRoom.classLevel,
            capacity: data.capacity !== undefined ? data.capacity : existingRoom.capacity,
            description: data.description !== undefined ? data.description : existingRoom.description,
            isActive: data.isActive !== undefined ? data.isActive : existingRoom.isActive,
            updatedAt: new Date().toISOString()
          };
          
          // Mettre à jour l'état
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchRooms();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la mise à jour de la salle',
              code: 'UPDATE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
        }
      },
      
      deleteRoom: async (id: string) => {
        set(state => {
          state.loadingAction = 'delete';
          state.error = null;
        });
        
        try {
          // Simuler un délai d'API
          await delay(1000);
          
          // Supprimer la salle
          const roomIndex = mockRooms.findIndex(r => r.id === id);
          if (roomIndex === -1) {
            throw new Error('Salle non trouvée');
          }
          
          mockRooms.splice(roomIndex, 1);
          
          // Mettre à jour l'état
          set(state => {
            state.loadingAction = null;
          });
          
          // Recharger les données
          await get().fetchRooms();
          
        } catch (error) {
          set(state => {
            state.loadingAction = null;
            state.error = {
              message: 'Erreur lors de la suppression de la salle',
              code: 'DELETE_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
          throw error;
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
        try {
          // Simuler un délai d'API
          await delay(500);
          
          set(state => {
            state.stats = mockRoomStats;
          });
          
        } catch (error) {
          set(state => {
            state.error = {
              message: 'Erreur lors du chargement des statistiques',
              code: 'STATS_ERROR',
              details: error instanceof Error ? [{ field: 'general', message: error.message }] : []
            };
          });
        }
      },
      
      getRoomsByClassLevel: (classLevel: ClassLevel) => {
        return getRoomsByClassLevel(classLevel);
      },
      
      getRoomById: (id: string) => {
        return getRoomById(id);
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