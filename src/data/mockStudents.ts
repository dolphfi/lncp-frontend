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
    gender: 'male',
    dateOfBirth: '2005-03-15T00:00:00Z',
    placeOfBirth: 'Port-au-Prince, Ouest',
    email: 'jean.dupont@email.com',
    ninthGradeOrderNumber: '2020/001234',
    level: 'nouveauSecondaire',
    grade: 'NSII',
    ninthGradeSchool: 'École Nationale de Port-au-Prince',
    ninthGradeGraduationYear: '2020',
    lastSchool: 'Lycée Alexandre Pétion',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N2001',
    parentContact: {
      fatherName: 'Paul Dupont',
      motherName: 'Marie Dupont',
      responsiblePerson: 'Marie Dupont',
      phone: '+509 1234-5679',
      email: 'marie.dupont@email.com',
      address: '123 Rue de la Paix, Port-au-Prince, Haïti',
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
    gender: 'female',
    dateOfBirth: '2006-07-22T00:00:00Z',
    placeOfBirth: 'Pétion-Ville, Ouest',
    email: 'marie.pierre@email.com',
    ninthGradeOrderNumber: '2021/005678',
    level: 'nouveauSecondaire',
    grade: 'NSI',
    ninthGradeSchool: 'Collège Saint-Pierre',
    ninthGradeGraduationYear: '2021',
    lastSchool: 'Institution Mixte Clarisse',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N1002',
    parentContact: {
      fatherName: 'Paul Pierre',
      motherName: 'Lucie Pierre',
      responsiblePerson: 'Paul Pierre',
      phone: '+509 2345-6790',
      email: 'paul.pierre@email.com',
      address: '456 Avenue des Fleurs, Pétion-Ville, Haïti',
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
    gender: 'male',
    dateOfBirth: '2007-11-08T00:00:00Z',
    placeOfBirth: 'Carrefour, Ouest',
    email: 'pierre.louis@email.com',
    ninthGradeOrderNumber: '2022/009876',
    level: 'nouveauSecondaire',
    grade: 'NSIV',
    ninthGradeSchool: 'École Nationale de Carrefour',
    ninthGradeGraduationYear: '2022',
    lastSchool: 'Lycée des Jeunes Filles',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N4003',
    parentContact: {
      fatherName: 'Jean Louis',
      motherName: 'Rose Louis',
      responsiblePerson: 'Rose Louis',
      phone: '+509 3456-7891',
      email: 'rose.louis@email.com',
      address: '789 Boulevard des Martyrs, Carrefour, Haïti',
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
    gender: 'female',
    dateOfBirth: '2008-01-30T00:00:00Z',
    placeOfBirth: 'Delmas, Ouest',
    email: 'anne.joseph@email.com',
    ninthGradeOrderNumber: '2023/001122',
    level: 'nouveauSecondaire',
    grade: 'NSIII',
    ninthGradeSchool: 'Collège Canado-Haïtien',
    ninthGradeGraduationYear: '2023',
    lastSchool: 'Lycée Philippe Guerrier',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N3004',
    parentContact: {
      fatherName: 'Marc Joseph',
      motherName: 'Carla Joseph',
      responsiblePerson: 'Marc Joseph',
      phone: '+509 4567-8902',
      email: 'marc.joseph@email.com',
      address: '321 Rue de la Liberté, Delmas, Haïti',
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
    gender: 'male',
    dateOfBirth: '2004-05-12T00:00:00Z',
    placeOfBirth: 'Croix-des-Bouquets, Ouest',
    email: 'claude.michel@email.com',
    ninthGradeOrderNumber: '2019/003344',
    level: 'nouveauSecondaire',
    grade: 'NSI',
    ninthGradeSchool: 'École Baptiste de Croix-des-Bouquets',
    ninthGradeGraduationYear: '2019',
    lastSchool: 'Lycée de Pétion-Ville',
    enrollmentDate: '2022-09-01T00:00:00Z',
    studentId: '22N1005',
    parentContact: {
      fatherName: 'Robert Michel',
      motherName: 'Lucie Michel',
      responsiblePerson: 'Lucie Michel',
      phone: '+509 5678-9013',
      email: 'lucie.michel@email.com',
      address: '654 Rue de la Fraternité, Croix-des-Bouquets, Haïti',
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
    gender: 'female',
    dateOfBirth: '2005-09-18T00:00:00Z',
    placeOfBirth: 'Port-au-Prince, Ouest',
    email: 'sophia.barthelemy@email.com',
    ninthGradeOrderNumber: '2020/005566',
    level: 'nouveauSecondaire',
    grade: 'NSII',
    ninthGradeSchool: 'Institution Sainte-Rose de Lima',
    ninthGradeGraduationYear: '2020',
    lastSchool: 'Lycée Toussaint Louverture',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N2006',
    parentContact: {
      fatherName: 'Robert Barthélémy',
      motherName: 'Ketlie Barthélémy',
      responsiblePerson: 'Robert Barthélémy',
      phone: '+509 6789-0124',
      email: 'robert.barthelemy@email.com',
      address: '987 Avenue Jean-Jacques Dessalines, Port-au-Prince, Haïti',
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
    gender: 'male',
    dateOfBirth: '2006-12-03T00:00:00Z',
    placeOfBirth: 'Port-au-Prince, Ouest',
    ninthGradeOrderNumber: '2021/007788',
    level: 'nouveauSecondaire',
    grade: 'NSIII',
    ninthGradeSchool: 'Collège Saint-Louis de Gonzague',
    ninthGradeGraduationYear: '2021',
    lastSchool: 'Lycée Anténor Firmin',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N3007',
    parentContact: {
      fatherName: 'Michel Toussaint',
      motherName: 'Micheline Toussaint',
      responsiblePerson: 'Micheline Toussaint',
      phone: '+509 7890-1235',
      email: 'micheline.toussaint@email.com',
      address: '555 Rue Capois, Port-au-Prince, Haïti',
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
    gender: 'female',
    dateOfBirth: '2007-04-25T00:00:00Z',
    placeOfBirth: 'Pétion-Ville, Ouest',
    email: 'roseline.moise@email.com',
    ninthGradeOrderNumber: '2022/009900',
    level: 'nouveauSecondaire',
    grade: 'NSIV',
    ninthGradeSchool: 'École Presbytérienne',
    ninthGradeGraduationYear: '2022',
    lastSchool: 'Institution Mixte Bethesda',
    enrollmentDate: '2023-09-01T00:00:00Z',
    studentId: '23N4008',
    parentContact: {
      fatherName: 'Jean Moïse',
      motherName: 'Sandra Moïse',
      responsiblePerson: 'Jean Moïse',
      phone: '+509 8901-2346',
      email: 'jean.moise@email.com',
      address: '777 Boulevard Harry Truman, Pétion-Ville, Haïti',
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
  let filteredStudents = students;

  // Appliquer les filtres
  if (filters.grade) {
    filteredStudents = filteredStudents.filter(student => student.grade === filters.grade);
  }

  if (filters.status) {
    filteredStudents = filteredStudents.filter(student => student.status === filters.status);
  }

  if (filters.gender) {
    filteredStudents = filteredStudents.filter(student => student.gender === filters.gender);
  }

  // Appliquer la recherche textuelle
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredStudents = filteredStudents.filter(student =>
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      (student.email && student.email.toLowerCase().includes(term)) ||
      student.studentId.toLowerCase().includes(term) ||
      student.parentContact.responsiblePerson.toLowerCase().includes(term)
    );
  }

  return filteredStudents;
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