/**
 * =====================================================
 * DONNÉES SIMULÉES POUR LES EMPLOYÉS
 * =====================================================
 * Ce fichier contient des données factices pour tester
 * le système de gestion des employés sans backend
 * Inclut les professeurs et autres types d'employés
 */

import { 
  Employee, 
  EmployeeStats
} from '../types/employee';

// =====================================================
// DONNÉES SIMULÉES DES EMPLOYÉS
// =====================================================
export const mockEmployees: Employee[] = [
  // PROFESSEURS
  {
    id: '1',
    employeeId: 'EMP001',
    type: 'professeur',
    firstName: 'Martin',
    lastName: 'Dupont',
    email: 'martin.dupont@ecole.fr',
    phone: '+33 1 23 45 67 89',
    dateOfBirth: '1980-05-15',
    gender: 'homme',
    address: {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    hireDate: '2000-09-01',
    status: 'actif',
    isActive: true,
    notes: 'Professeur expérimenté en mathématiques',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    professorInfo: {
      specialty: 'mathématiques',
      secondarySpecialties: ['informatique'],
      degree: 'agrégation',
      institution: 'École Normale Supérieure',
      graduationYear: 2005,
      assignedCourses: [
        {
          courseId: '1',
          courseName: 'Mathématiques',
          classes: ['1', '2'],
          rooms: ['1', '2']
        },
        {
          courseId: '2',
          courseName: 'Physique',
          classes: ['3', '4'],
          rooms: ['3', '4']
        }
      ],
      maxCourses: 4,
      availability: [
        { day: 'lundi', startTime: '08:00', endTime: '17:00', available: true },
        { day: 'mardi', startTime: '08:00', endTime: '17:00', available: true },
        { day: 'mercredi', startTime: '08:00', endTime: '17:00', available: true },
        { day: 'jeudi', startTime: '08:00', endTime: '17:00', available: true },
        { day: 'vendredi', startTime: '08:00', endTime: '17:00', available: true },
        { day: 'samedi', startTime: '08:00', endTime: '12:00', available: false }
      ]
    }
  },
  {
    id: '2',
    employeeId: 'EMP002',
    type: 'professeur',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@ecole.fr',
    phone: '+33 1 23 45 67 90',
    dateOfBirth: '1985-03-22',
    gender: 'femme',
    address: {
      street: '456 Avenue des Sciences',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    },
    hireDate: '2008-09-01',
    status: 'actif',
    isActive: true,
    notes: 'Spécialiste en sciences physiques',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    professorInfo: {
      specialty: 'sciences',
      secondarySpecialties: ['sciences'],
      degree: 'doctorat',
      institution: 'Université de Lyon',
      graduationYear: 2010,
      assignedCourses: [
        {
          courseId: '2',
          courseName: 'Physique',
          classes: ['5', '6'],
          rooms: ['5', '6']
        },
        {
          courseId: '3',
          courseName: 'Chimie',
          classes: ['7', '8'],
          rooms: ['7', '8']
        }
      ],
      maxCourses: 3,
      availability: [
        { day: 'lundi', startTime: '09:00', endTime: '18:00', available: true },
        { day: 'mardi', startTime: '09:00', endTime: '18:00', available: true },
        { day: 'mercredi', startTime: '09:00', endTime: '18:00', available: true },
        { day: 'jeudi', startTime: '09:00', endTime: '18:00', available: true },
        { day: 'vendredi', startTime: '09:00', endTime: '18:00', available: true },
        { day: 'samedi', startTime: '09:00', endTime: '13:00', available: false }
      ]
    }
  },

  // EMPLOYÉS ADMINISTRATIFS
  {
    id: '3',
    employeeId: 'EMP003',
    type: 'administratif',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@ecole.fr',
    phone: '+33 1 23 45 67 92',
    dateOfBirth: '1988-06-18',
    gender: 'femme',
    address: {
      street: '654 Avenue de l\'Administration',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France'
    },
    hireDate: '2013-09-01',
    status: 'actif',
    isActive: true,
    notes: 'Secrétaire administrative expérimentée',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    administrativeInfo: {
      department: 'Secrétariat',
      position: 'Secrétaire administrative',
      supervisor: 'Directeur administratif'
    }
  },

  // EMPLOYÉS TECHNIQUES
  {
    id: '4',
    employeeId: 'EMP004',
    type: 'technique',
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@ecole.fr',
    phone: '+33 1 23 45 67 93',
    dateOfBirth: '1983-09-12',
    gender: 'homme',
    address: {
      street: '147 Rue de la Technique',
      city: 'Nantes',
      postalCode: '44000',
      country: 'France'
    },
    hireDate: '2009-09-01',
    status: 'actif',
    isActive: true,
    notes: 'Technicien de maintenance polyvalent',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    technicalInfo: {
      skills: ['Maintenance informatique', 'Réseaux', 'Sécurité'],
      certifications: ['CCNA', 'CompTIA A+'],
      equipment: ['Ordinateurs', 'Serveurs', 'Imprimantes']
    }
  }
];

// =====================================================
// STATISTIQUES SIMULÉES
// =====================================================
export const mockEmployeeStats: EmployeeStats = {
  total: 4,
  active: 4,
  inactive: 0,
  onLeave: 0,
  retired: 0,
  byType: {
    professeur: 2,
    administratif: 1,
    technique: 1,
    direction: 0,
    maintenance: 0
  },
  byStatus: {
    actif: 4,
    inactif: 0,
    en_congé: 0,
    retraité: 0,
    démission: 0
  },
  byDepartment: {
    'Secrétariat': 1
  },
  averageExperience: 14.3,
  topProfessors: [
    { employeeId: '1', employeeName: 'Martin Dupont', courseCount: 2 },
    { employeeId: '2', employeeName: 'Sophie Bernard', courseCount: 2 }
  ]
};

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateEmployeeId = (): string => {
  return (mockEmployees.length + 1).toString();
};

export const searchEmployees = (
  employees: Employee[],
  searchTerm: string,
  filters: {
    type?: string;
    status?: string;
    isActive?: boolean;
    department?: string;
    specialty?: string;
    experienceMin?: number;
    experienceMax?: number;
  } = {}
): Employee[] => {
  return employees.filter(employee => {
    // Recherche textuelle
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      employee.firstName.toLowerCase().includes(searchLower) ||
      employee.lastName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.employeeId.toLowerCase().includes(searchLower);

    // Filtre par type
    const matchesType = !filters.type || employee.type === filters.type;

    // Filtre par statut
    const matchesStatus = !filters.status || employee.status === filters.status;

    // Filtre par département (pour les administratifs)
    const matchesDepartment = !filters.department || 
      (employee.administrativeInfo && employee.administrativeInfo.department === filters.department);

    // Filtre par spécialité (pour les professeurs)
    const matchesSpecialty = !filters.specialty || 
      (employee.professorInfo && employee.professorInfo.specialty === filters.specialty);

    // Filtre par statut actif
    const matchesActive = filters.isActive === undefined || employee.isActive === filters.isActive;

    return matchesSearch && matchesType && matchesStatus && matchesDepartment && 
           matchesSpecialty && matchesActive;
  });
};

export const sortEmployees = (
  employees: Employee[],
  field: keyof Employee,
  order: 'asc' | 'desc'
): Employee[] => {
  return [...employees].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Gestion des valeurs nulles/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Tri spécial pour les noms complets
    if (field === 'firstName' || field === 'lastName') {
      const aFullName = `${a.firstName} ${a.lastName}`;
      const bFullName = `${b.firstName} ${b.lastName}`;
      aValue = aFullName;
      bValue = bFullName;
    }

    // Tri numérique pour certains champs
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Tri alphabétique pour les autres champs
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (order === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });
};

export const paginateEmployees = (
  employees: Employee[],
  page: number,
  limit: number
): {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = employees.slice(startIndex, endIndex);
  const total = employees.length;
  const totalPages = Math.ceil(total / limit);

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

export const calculateEmployeeStats = (employees: Employee[]): EmployeeStats => {
  const total = employees.length;
  const active = employees.filter(e => e.isActive).length;
  const inactive = employees.filter(e => !e.isActive).length;
  const onLeave = employees.filter(e => e.status === 'en_congé').length;
  const retired = employees.filter(e => e.status === 'retraité').length;

  // Répartition par type
  const byType: Record<string, number> = {};
  employees.forEach(employee => {
    byType[employee.type] = (byType[employee.type] || 0) + 1;
  });

  // Répartition par statut
  const byStatus: Record<string, number> = {};
  employees.forEach(employee => {
    byStatus[employee.status] = (byStatus[employee.status] || 0) + 1;
  });

  // Répartition par département
  const byDepartment: Record<string, number> = {};
  employees.forEach(employee => {
    if (employee.administrativeInfo) {
      byDepartment[employee.administrativeInfo.department] = 
        (byDepartment[employee.administrativeInfo.department] || 0) + 1;
    }
  });

  // Statistiques moyennes
  const averageExperience = 0; // Supprimé car experience n'existe plus
  
  // Top professeurs par nombre de cours
  const topProfessors = employees
    .filter(e => e.type === 'professeur' && e.professorInfo)
    .map(e => ({
      employeeId: e.id,
      employeeName: `${e.firstName} ${e.lastName}`,
      courseCount: e.professorInfo!.assignedCourses.length
    }))
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, 5);

  return {
    total,
    active,
    inactive,
    onLeave,
    retired,
    byType,
    byStatus,
    byDepartment,
    averageExperience,
    topProfessors
  };
}; 