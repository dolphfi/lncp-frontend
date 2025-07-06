/**
 * =====================================================
 * DONNÉES SIMULÉES POUR LES TESTS
 * =====================================================
 * Ce fichier contient des données factices pour tester
 * le système de gestion des élèves sans backend
 */

import { Student, StudentStats } from '../types/student';

// =====================================================
// DONNÉES SIMULÉES DES ÉLÈVES
// =====================================================
export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+509 1234-5678',
    dateOfBirth: '2005-03-15T00:00:00Z',
    gender: 'male',
    address: '123 Rue de la Paix, Port-au-Prince, Haïti',
    grade: 'NSII',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N2001',
    parentContact: {
      name: 'Marie Dupont',
      phone: '+509 1234-5679',
      email: 'marie.dupont@email.com',
      relationship: 'mère'
    },
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Pierre',
    email: 'marie.pierre@email.com',
    phone: '+509 2345-6789',
    dateOfBirth: '2006-07-22T00:00:00Z',
    gender: 'female',
    address: '456 Avenue des Fleurs, Pétion-Ville, Haïti',
    grade: 'NSI',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N1002',
    parentContact: {
      name: 'Paul Pierre',
      phone: '+509 2345-6790',
      email: 'paul.pierre@email.com',
      relationship: 'père'
    },
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e2bb?w=150&h=150&fit=crop&crop=face',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Louis',
    email: 'pierre.louis@email.com',
    phone: '+509 3456-7890',
    dateOfBirth: '2007-11-08T00:00:00Z',
    gender: 'male',
    address: '789 Boulevard des Martyrs, Carrefour, Haïti',
    grade: 'NSIV',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N4003',
    parentContact: {
      name: 'Rose Louis',
      phone: '+509 3456-7891',
      email: 'rose.louis@email.com',
      relationship: 'mère'
    },
    status: 'active',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    firstName: 'Anne',
    lastName: 'Joseph',
    email: 'anne.joseph@email.com',
    phone: '+509 4567-8901',
    dateOfBirth: '2008-01-30T00:00:00Z',
    gender: 'female',
    address: '321 Rue de la Liberté, Delmas, Haïti',
    grade: 'NSIII',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N3004',
    parentContact: {
      name: 'Marc Joseph',
      phone: '+509 4567-8902',
      email: 'marc.joseph@email.com',
      relationship: 'père'
    },
    status: 'active',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    firstName: 'Claude',
    lastName: 'Michel',
    email: 'claude.michel@email.com',
    phone: '+509 5678-9012',
    dateOfBirth: '2004-05-12T00:00:00Z',
    gender: 'male',
    address: '654 Rue de la Fraternité, Croix-des-Bouquets, Haïti',
    grade: 'NSI',
    enrollmentDate: '2022-09-01T00:00:00Z',
    studentId: '22N1005',
    parentContact: {
      name: 'Lucie Michel',
      phone: '+509 5678-9013',
      email: 'lucie.michel@email.com',
      relationship: 'mère'
    },
    status: 'inactive',
    createdAt: '2022-09-01T00:00:00Z',
    updatedAt: '2024-06-15T00:00:00Z'
  },
  {
    id: '6',
    firstName: 'Sophia',
    lastName: 'Barthélémy',
    email: 'sophia.barthelemy@email.com',
    phone: '+509 6789-0123',
    dateOfBirth: '2005-09-18T00:00:00Z',
    gender: 'female',
    address: '987 Avenue Jean-Jacques Dessalines, Port-au-Prince, Haïti',
    grade: 'NSII',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N2006',
    parentContact: {
      name: 'Robert Barthélémy',
      phone: '+509 6789-0124',
      email: 'robert.barthelemy@email.com',
      relationship: 'père'
    },
    status: 'active',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    firstName: 'James',
    lastName: 'Toussaint',
    email: 'james.toussaint@email.com',
    phone: '+509 7890-1234',
    dateOfBirth: '2006-12-03T00:00:00Z',
    gender: 'male',
    address: '555 Rue Capois, Port-au-Prince, Haïti',
    grade: 'NSIII',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N3007',
    parentContact: {
      name: 'Micheline Toussaint',
      phone: '+509 7890-1235',
      email: 'micheline.toussaint@email.com',
      relationship: 'mère'
    },
    status: 'active',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '8',
    firstName: 'Roseline',
    lastName: 'Moïse',
    email: 'roseline.moise@email.com',
    phone: '+509 8901-2345',
    dateOfBirth: '2007-04-25T00:00:00Z',
    gender: 'female',
    address: '777 Boulevard Harry Truman, Pétion-Ville, Haïti',
    grade: 'NSIV',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N4008',
    parentContact: {
      name: 'Jean Moïse',
      phone: '+509 8901-2346',
      email: 'jean.moise@email.com',
      relationship: 'père'
    },
    status: 'suspended',
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// =====================================================
// STATISTIQUES SIMULÉES
// =====================================================
export const mockStats: StudentStats = {
  total: 8,
  active: 6,
  inactive: 1,
  suspended: 1,
  totalClasses: 4, // Seulement NSI, NSII, NSIII, NSIV
  byGender: {
    male: 4,
    female: 4
  },
  byGrade: {
    'NSI': 2,
    'NSII': 2,
    'NSIII': 2,
    'NSIV': 2
  }
};

// =====================================================
// FONCTIONS UTILITAIRES POUR LA SIMULATION
// =====================================================

// Simuler un délai d'API
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Générer un ID unique
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Simuler une recherche/filtrage
export const searchStudents = (
  students: Student[],
  searchTerm: string,
  filters: {
    grade?: string;
    status?: string;
    gender?: string;
  } = {}
): Student[] => {
  let filtered = [...students];

  // Filtrage par terme de recherche
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(student =>
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.studentId.toLowerCase().includes(term)
    );
  }

  // Filtrage par classe
  if (filters.grade) {
    filtered = filtered.filter(student => student.grade === filters.grade);
  }

  // Filtrage par statut
  if (filters.status) {
    filtered = filtered.filter(student => student.status === filters.status);
  }

  // Filtrage par sexe
  if (filters.gender) {
    filtered = filtered.filter(student => student.gender === filters.gender);
  }

  return filtered;
};

// Simuler un tri
export const sortStudents = (
  students: Student[],
  field: keyof Student,
  order: 'asc' | 'desc'
): Student[] => {
  return [...students].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Gérer les valeurs undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return order === 'asc' ? -1 : 1;
    if (bValue == null) return order === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Simuler la pagination
export const paginateStudents = (
  students: Student[],
  page: number,
  limit: number
): {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = students.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      limit,
      total: students.length,
      totalPages: Math.ceil(students.length / limit)
    }
  };
}; 