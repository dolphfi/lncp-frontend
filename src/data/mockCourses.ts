/**
 * =====================================================
 * DONNÉES SIMULÉES POUR LES COURS
 * =====================================================
 * Ce fichier contient des données factices pour tester
 * le système de gestion des cours sans backend (École classique)
 */

import { Course, CourseStats } from '../types/course';

// =====================================================
// DONNÉES SIMULÉES DES COURS
// =====================================================
export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'MATH101',
    title: 'Algèbre Fondamentale',
    description: 'Cours d\'introduction à l\'algèbre avec les concepts de base, équations linéaires, polynômes et factorisation.',
    category: 'mathématiques',
    weight: 400,
    grade: 'NSI',
    schedule: [
      { day: 'lundi', startTime: '08:00', endTime: '10:00' },
      { day: 'mercredi', startTime: '14:00', endTime: '16:00' }
    ],
    prerequisites: [],
    objectives: [
      'Maîtriser les concepts fondamentaux de l\'algèbre',
      'Résoudre des équations linéaires et quadratiques',
      'Comprendre la factorisation des polynômes',
      'Appliquer les techniques algébriques à des problèmes concrets'
    ],
    materials: ['Calculatrice scientifique', 'Cahier d\'exercices', 'Règle et compas'],
    syllabus: 'Introduction aux nombres réels, équations du premier degré, équations du second degré, factorisation, identités remarquables, résolution de problèmes.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    code: 'PHY201',
    title: 'Physique Mécanique',
    description: 'Étude des lois fondamentales de la mécanique classique, cinématique, dynamique et énergie.',
    category: 'sciences',
    weight: 300,
    grade: 'NSII',
    schedule: [
      { day: 'mardi', startTime: '10:00', endTime: '12:00' },
      { day: 'jeudi', startTime: '16:00', endTime: '18:00' }
    ],
    prerequisites: ['MATH101'],
    objectives: [
      'Comprendre les lois de Newton',
      'Analyser le mouvement des objets',
      'Calculer les énergies cinétique et potentielle',
      'Résoudre des problèmes de mécanique'
    ],
    materials: ['Calculatrice', 'Matériel de laboratoire', 'Manuel de physique'],
    syllabus: 'Cinématique en une et deux dimensions, lois de Newton, forces, travail et énergie, conservation de l\'énergie, mouvement circulaire.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    code: 'ENG101',
    title: 'Anglais Avancé',
    description: 'Perfectionnement de la langue anglaise avec focus sur la communication orale et écrite.',
    category: 'langues',
    weight: 200,
    grade: 'NSI',
    schedule: [
      { day: 'lundi', startTime: '14:00', endTime: '16:00' },
      { day: 'vendredi', startTime: '10:00', endTime: '12:00' }
    ],
    prerequisites: [],
    objectives: [
      'Améliorer la compréhension orale et écrite',
      'Développer l\'expression en anglais',
      'Maîtriser la grammaire avancée',
      'Préparer aux examens internationaux'
    ],
    materials: ['Manuel d\'anglais', 'CD audio', 'Dictionnaire bilingue'],
    syllabus: 'Grammaire avancée, vocabulaire thématique, compréhension orale, expression écrite, littérature anglaise, préparation aux examens.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    code: 'HIST101',
    title: 'Histoire Contemporaine',
    description: 'Étude de l\'histoire du 20ème siècle et des événements qui ont façonné le monde moderne.',
    category: 'histoire',
    weight: 200,
    grade: 'NSIII',
    schedule: [
      { day: 'mardi', startTime: '14:00', endTime: '16:00' },
      { day: 'samedi', startTime: '08:00', endTime: '10:00' }
    ],
    prerequisites: [],
    objectives: [
      'Comprendre les événements majeurs du 20ème siècle',
      'Analyser les causes et conséquences des conflits',
      'Développer l\'esprit critique historique',
      'Maîtriser la méthodologie historique'
    ],
    materials: ['Manuel d\'histoire', 'Documents historiques', 'Atlas historique'],
    syllabus: 'Première et Seconde Guerres mondiales, Guerre froide, décolonisation, construction européenne, mondialisation, défis contemporains.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    code: 'GEO101',
    title: 'Géographie Humaine',
    description: 'Étude des relations entre les sociétés humaines et leur environnement géographique.',
    category: 'géographie',
    weight: 200,
    grade: 'NSII',
    schedule: [
      { day: 'mercredi', startTime: '10:00', endTime: '12:00' },
      { day: 'vendredi', startTime: '14:00', endTime: '16:00' }
    ],
    prerequisites: [],
    objectives: [
      'Comprendre les dynamiques spatiales',
      'Analyser les enjeux environnementaux',
      'Étudier les migrations humaines',
      'Appréhender la mondialisation'
    ],
    materials: ['Atlas géographique', 'Cartes thématiques', 'Données statistiques'],
    syllabus: 'Dynamiques démographiques, migrations internationales, urbanisation, développement durable, mondialisation, géopolitique.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    code: 'ART101',
    title: 'Arts Plastiques',
    description: 'Découverte et pratique des différentes techniques artistiques et expression créative.',
    category: 'arts',
    weight: 100,
    grade: 'NSI',
    schedule: [
      { day: 'jeudi', startTime: '14:00', endTime: '17:00' }
    ],
    prerequisites: [],
    objectives: [
      'Développer la créativité artistique',
      'Maîtriser différentes techniques plastiques',
      'Comprendre l\'histoire de l\'art',
      'Exprimer des idées par l\'art'
    ],
    materials: ['Pinceaux et peintures', 'Papier et toiles', 'Matériaux de récupération'],
    syllabus: 'Techniques de dessin, peinture à l\'huile et à l\'eau, sculpture, histoire de l\'art, analyse d\'œuvres, projet personnel.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    code: 'SPORT101',
    title: 'Éducation Physique',
    description: 'Développement des capacités physiques et sportives avec pratique de différents sports.',
    category: 'sport',
    weight: 100,
    grade: 'NSI',
    schedule: [
      { day: 'mardi', startTime: '16:00', endTime: '18:00' },
      { day: 'vendredi', startTime: '16:00', endTime: '18:00' }
    ],
    prerequisites: [],
    objectives: [
      'Améliorer la condition physique',
      'Pratiquer différents sports',
      'Développer l\'esprit d\'équipe',
      'Promouvoir la santé'
    ],
    materials: ['Tenue de sport', 'Équipements sportifs', 'Matériel de fitness'],
    syllabus: 'Athlétisme, sports collectifs, natation, gymnastique, activités de pleine nature, préparation physique générale.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '8',
    code: 'INFO101',
    title: 'Informatique Fondamentale',
    description: 'Introduction à l\'informatique et à la programmation avec Python.',
    category: 'informatique',
    weight: 300,
    grade: 'NSII',
    schedule: [
      { day: 'lundi', startTime: '16:00', endTime: '18:00' },
      { day: 'mercredi', startTime: '16:00', endTime: '18:00' }
    ],
    prerequisites: ['MATH101'],
    objectives: [
      'Comprendre les bases de l\'informatique',
      'Apprendre la programmation Python',
      'Développer la logique algorithmique',
      'Créer des projets informatiques'
    ],
    materials: ['Ordinateur portable', 'Logiciels de développement', 'Manuel Python'],
    syllabus: 'Architecture des ordinateurs, algorithmes de base, programmation Python, structures de données, projets pratiques.',
    status: 'actif',
    isActive: true,
    enrollmentStartDate: '2024-01-15T00:00:00Z',
    enrollmentEndDate: '2024-02-15T00:00:00Z',
    startDate: '2024-02-20T00:00:00Z',
    endDate: '2024-06-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// =====================================================
// STATISTIQUES SIMULÉES DES COURS
// =====================================================
export const mockCourseStats: CourseStats = {
  total: 8,
  active: 7,
  inactive: 1,
  pending: 0,
  byCategory: {
    mathématiques: 1,
    sciences: 1,
    langues: 1,
    histoire: 1,
    géographie: 1,
    arts: 1,
    sport: 1,
    informatique: 1
  },
  byGrade: {
    NSI: 4,
    NSII: 3,
    NSIII: 1,
    NSIV: 0
  },
  averageWeight: 2.25,
  totalWeight: 18,
  topCourses: [
    {
      courseId: '1',
      courseCode: 'MATH101',
      courseTitle: 'Algèbre Fondamentale',
      weight: 4
    },
    {
      courseId: '2',
      courseCode: 'PHY201',
      courseTitle: 'Physique Mécanique',
      weight: 3
    },
    {
      courseId: '8',
      courseCode: 'INFO101',
      courseTitle: 'Informatique Fondamentale',
      weight: 3
    }
  ]
};

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Simuler un délai d'API
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Générer un ID unique
export const generateCourseId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Rechercher des cours avec filtres
export const searchCourses = (
  courses: Course[],
  searchTerm: string,
  filters: {
    category?: string;
    grade?: string;
    status?: string;
    isActive?: boolean;
  } = {}
): Course[] => {
  return courses.filter(course => {
    // Recherche par code, titre, description
    const matchesSearch = !searchTerm || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par catégorie
    const matchesCategory = !filters.category || course.category === filters.category;

    // Filtre par classe
    const matchesGrade = !filters.grade || course.grade === filters.grade;

    // Filtre par statut
    const matchesStatus = !filters.status || course.status === filters.status;

    // Filtre par statut actif
    const matchesActive = filters.isActive === undefined || course.isActive === filters.isActive;

    return matchesSearch && matchesCategory && matchesGrade && matchesStatus && matchesActive;
  });
};

// Trier les cours
export const sortCourses = (
  courses: Course[],
  field: keyof Course,
  order: 'asc' | 'desc'
): Course[] => {
  return [...courses].sort((a, b) => {
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

    // Gérer les comparaisons string
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    }

    return 0;
  });
};

// Paginer les cours
export const paginateCourses = (
  courses: Course[],
  page: number,
  limit: number
): {
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  return {
    data: paginatedCourses,
    pagination: {
      page,
      limit,
      total: courses.length,
      totalPages: Math.ceil(courses.length / limit)
    }
  };
};

// Calculer les statistiques
export const calculateCourseStats = (courses: Course[]): CourseStats => {
  const total = courses.length;
  const active = courses.filter(course => course.status === 'actif').length;
  const inactive = courses.filter(course => course.status === 'inactif').length;
  const pending = courses.filter(course => course.status === 'en_attente').length;

  // Répartition par catégorie
  const byCategory = {
    mathématiques: 0,
    sciences: 0,
    langues: 0,
    histoire: 0,
    géographie: 0,
    arts: 0,
    sport: 0,
    informatique: 0
  };

  courses.forEach(course => {
    byCategory[course.category]++;
  });

  // Répartition par classe
  const byGrade: Record<string, number> = {};
  courses.forEach(course => {
    byGrade[course.grade] = (byGrade[course.grade] || 0) + 1;
  });

  // Calcul des pondérations
  const weights = courses.map(course => course.weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const averageWeight = total > 0 ? totalWeight / total : 0;

  // Cours les plus importants (par pondération)
  const topCourses = [...courses]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(course => ({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      weight: course.weight
    }));

  return {
    total,
    active,
    inactive,
    pending,
    byCategory,
    byGrade,
    averageWeight,
    totalWeight,
    topCourses
  };
}; 