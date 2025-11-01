/**
 * =====================================================
 * TYPES TYPESCRIPT POUR LA GESTION DES CONCOURS/TESTS
 * =====================================================
 * Ce fichier contient tous les types nécessaires pour
 * la gestion des concours dans le système scolaire
 */

// =====================================================
// TYPES POUR LES CONCOURS/TESTS
// =====================================================

// Type pour une note par matière
export interface SubjectNote {
  matiere: string;               // Nom de la matière
  note: number;                  // Note obtenue
}

// Type principal pour un test/concours
export interface Test {
  id: string;                    // Identifiant unique du test
  postulant: string;             // Nom du postulant
  moyenne: number;               // Moyenne obtenue
  status: 'admis' | 'echoue';    // Statut du concours (admis ou échoué)
  testDate: string;              // Date du test (format ISO)
  testType?: string;             // Type de concours (optionnel)
  grade?: string;                // Classe visée (optionnel)
  remarks?: string;              // Remarques (optionnel)
  notes?: SubjectNote[];         // Notes par matière (optionnel)
  createdAt: string;             // Date de création
  updatedAt: string;             // Date de dernière mise à jour
}

// Type pour créer un nouveau test
export interface CreateTestDto {
  postulant: string;
  moyenne: number;
  testDate: string;
  testType?: string;
  grade?: string;
  remarks?: string;
}

// Type pour mettre à jour un test
export interface UpdateTestDto {
  id: string;
  postulant?: string;
  moyenne?: number;
  testDate?: string;
  testType?: string;
  grade?: string;
  remarks?: string;
}

// Type pour les filtres de recherche
export interface TestFilters {
  search?: string;               // Recherche par nom du postulant
  status?: 'admis' | 'echoue';   // Filtrer par statut
  grade?: string;                // Filtrer par classe visée
  testType?: string;             // Filtrer par type de concours
  testYear?: number;             // Filtrer par année du test
  minMoyenne?: number;           // Note moyenne minimale
  maxMoyenne?: number;           // Note moyenne maximale
}

// Type pour les options de tri
export interface TestSortOptions {
  field: keyof Test;             // Champ à utiliser pour le tri
  order: 'asc' | 'desc';         // Ordre croissant ou décroissant
}

// Type pour la pagination
export interface TestPaginationOptions {
  page: number;                  // Page actuelle (commence à 1)
  limit: number;                 // Nombre d'éléments par page
  total: number;                 // Nombre total d'éléments
  totalPages: number;            // Nombre total de pages
}

// Type pour la réponse de l'API avec pagination
export interface TestsResponse {
  data: Test[];                  // Liste des tests
  pagination: TestPaginationOptions; // Informations de pagination
}

// Type pour les statistiques des tests
export interface TestStats {
  total: number;                 // Nombre total de tests
  admis: number;                 // Nombre de candidats admis
  echoue: number;                // Nombre de candidats échoués
  moyenneGenerale: number;       // Moyenne générale de tous les tests
  tauxReussite: number;          // Taux de réussite en pourcentage
  byGrade: Record<string, number>; // Répartition par classe visée
  byTestType: Record<string, number>; // Répartition par type de concours
}

// Type pour les erreurs de validation
export interface TestValidationError {
  field: string;                 // Champ qui contient l'erreur
  message: string;               // Message d'erreur
}

// Type pour les erreurs de l'API
export interface TestApiError {
  message: string;               // Message d'erreur principal
  code: string;                  // Code d'erreur
  details?: TestValidationError[]; // Détails des erreurs de validation
}
