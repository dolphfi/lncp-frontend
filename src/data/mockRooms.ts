/**
 * =====================================================
 * DONNÉES SIMULÉES POUR LES SALLES
 * =====================================================
 * Ce fichier contient des données factices pour tester
 * le système de gestion des salles sans backend
 */

import { Room, RoomStats, ClassLevel } from '../types/student';

// =====================================================
// DONNÉES SIMULÉES DES SALLES
// =====================================================
export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Salle A',
    classLevel: 'NSI',
    capacity: 30,
    description: 'Salle principale pour les élèves de NSI',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Salle B',
    classLevel: 'NSI',
    capacity: 25,
    description: 'Salle secondaire pour les élèves de NSI',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Salle C',
    classLevel: 'NSII',
    capacity: 28,
    description: 'Salle principale pour les élèves de NSII',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Salle D',
    classLevel: 'NSII',
    capacity: 32,
    description: 'Salle secondaire pour les élèves de NSII',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    name: 'Salle E',
    classLevel: 'NSIII',
    capacity: 30,
    description: 'Salle principale pour les élèves de NSIII',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    name: 'Salle F',
    classLevel: 'NSIII',
    capacity: 27,
    description: 'Salle secondaire pour les élèves de NSIII',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    name: 'Salle G',
    classLevel: 'NSIV',
    capacity: 35,
    description: 'Salle principale pour les élèves de NSIV',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '8',
    name: 'Salle H',
    classLevel: 'NSIV',
    capacity: 30,
    description: 'Salle secondaire pour les élèves de NSIV',
    isActive: true,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '9',
    name: 'Salle I',
    classLevel: 'NSI',
    capacity: 20,
    description: 'Petite salle pour groupes réduits NSI',
    isActive: false,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '10',
    name: 'Salle J',
    classLevel: 'NSII',
    capacity: 22,
    description: 'Petite salle pour groupes réduits NSII',
    isActive: false,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// =====================================================
// STATISTIQUES SIMULÉES DES SALLES
// =====================================================
export const mockRoomStats: RoomStats = {
  total: 10,
  active: 8,
  inactive: 2,
  byClassLevel: {
    NSI: 3,
    NSII: 3,
    NSIII: 2,
    NSIV: 2
  },
  totalCapacity: 279,
  averageCapacity: 27.9
};

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Simuler un délai d'API
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Générer un ID unique
export const generateRoomId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Rechercher des salles avec filtres
export const searchRooms = (
  rooms: Room[],
  searchTerm: string,
  filters: {
    classLevel?: ClassLevel;
    isActive?: boolean;
  } = {}
): Room[] => {
  return rooms.filter(room => {
    // Recherche par nom
    const matchesSearch = !searchTerm || 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par niveau de classe
    const matchesClassLevel = !filters.classLevel || room.classLevel === filters.classLevel;

    // Filtre par statut actif
    const matchesActive = filters.isActive === undefined || room.isActive === filters.isActive;

    return matchesSearch && matchesClassLevel && matchesActive;
  });
};

// Trier les salles
export const sortRooms = (
  rooms: Room[],
  field: keyof Room,
  order: 'asc' | 'desc'
): Room[] => {
  return [...rooms].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Gérer les valeurs undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return order === 'asc' ? -1 : 1;
    if (bValue == null) return order === 'asc' ? 1 : -1;

    // Gérer les valeurs string
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Gérer les comparaisons numériques
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    }

    // Gérer les autres types
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Paginer les salles
export const paginateRooms = (
  rooms: Room[],
  page: number,
  limit: number
): {
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const total = rooms.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = rooms.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

// Obtenir les salles par niveau de classe
export const getRoomsByClassLevel = (classLevel: ClassLevel): Room[] => {
  return mockRooms.filter(room => room.classLevel === classLevel && room.isActive);
};

// Obtenir une salle par ID
export const getRoomById = (id: string): Room | undefined => {
  return mockRooms.find(room => room.id === id);
};

// Obtenir le nom de la salle par ID
export const getRoomNameById = (id: string): string => {
  const room = getRoomById(id);
  return room ? room.name : '';
};

// Obtenir la classe et salle combinées pour affichage
export const getClassRoomDisplay = (classLevel: ClassLevel, roomName: string): string => {
  return `${classLevel} - ${roomName}`;
}; 