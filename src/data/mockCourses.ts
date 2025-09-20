/**
 * =====================================================
 * DONNÉES MOCK POUR LES COURS (BACKEND COMPATIBLE)
 * =====================================================
 * Fichier temporaire compatible avec l'API backend
 */

import { Course, CourseStats, CourseCategory } from '../types/course';

// Données mock vides pour éviter les erreurs
export const mockCourses: Course[] = [];

// Fonctions utilitaires pour le store
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const generateCourseId = () => `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Fonctions de recherche et tri simplifiées
export const searchCourses = (courses: Course[], term: string, filters: any) => {
  return courses.filter(course => {
    const matchesSearch = !term || 
      course.titre.toLowerCase().includes(term.toLowerCase()) ||
      course.description.toLowerCase().includes(term.toLowerCase());
    
    const matchesCategory = !filters.category || course.categorie === filters.category;
    const matchesActive = filters.isActive === undefined || course.isActive === filters.isActive;
    
    return matchesSearch && matchesCategory && matchesActive;
  });
};

export const sortCourses = (courses: Course[], field: keyof Course, order: 'asc' | 'desc') => {
  return [...courses].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
};

export const paginateCourses = (courses: Course[], page: number, limit: number) => ({
  data: courses.slice((page - 1) * limit, page * limit),
  pagination: { page, limit, total: courses.length, totalPages: Math.ceil(courses.length / limit) }
});

export const calculateCourseStats = (courses: Course[]): CourseStats => {
  const total = courses.length;
  const active = courses.filter(c => c.isActive).length;
  const inactive = total - active;
  
  // Répartition par catégorie
  const byCategory: Record<CourseCategory, number> = {
    'Mathematiques': 0, 'Sciences': 0, 'Physique': 0, 'Chimie': 0, 'Biologie': 0,
    'Francais': 0, 'Anglais': 0, 'Langues': 0, 'Histoire': 0, 'Geographie': 0, 
    'Philosophie': 0, 'Arts': 0, 'Sport': 0, 'Informatique': 0
  };
  
  courses.forEach(course => {
    if (byCategory[course.categorie] !== undefined) {
      byCategory[course.categorie]++;
    }
  });
  
  const totalWeight = courses.reduce((sum, course) => sum + course.ponderation, 0);
  const averageWeight = total > 0 ? totalWeight / total : 0;
  
  const topCourses = [...courses]
    .sort((a, b) => b.ponderation - a.ponderation)
    .slice(0, 5)
    .map(course => ({
      courseId: course.id,
      courseCode: course.id,
      courseTitle: course.titre,
      weight: course.ponderation
    }));
  
  return {
    total,
    active,
    inactive,
    pending: 0,
    byCategory,
    byGrade: {},
    averageWeight,
    totalWeight,
    topCourses
  };
};
