# 🔄 **INTÉGRATION BACKEND - GUIDE COMPLET**

## 📋 **VUE D'ENSEMBLE**

Ce guide explique comment connecter votre frontend React/TypeScript avec un backend pour remplacer les données mock par de vraies données API.

## 🏗️ **ARCHITECTURE PROPOSÉE**

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts          # Client HTTP configuré
│   │   ├── endpoints.ts       # URLs des endpoints
│   │   └── types.ts           # Types pour les réponses API
│   ├── students/
│   │   ├── studentService.ts  # Service pour les élèves
│   │   └── studentApi.ts      # Appels API élèves
│   └── rooms/
│       ├── roomService.ts     # Service pour les salles
│       └── roomApi.ts         # Appels API salles
├── stores/
│   ├── studentStore.ts        # Store modifié pour API
│   └── roomStore.ts           # Store modifié pour API
├── config/
│   └── environment.ts         # Configuration environnement
└── utils/
    ├── errorHandler.ts        # Gestion des erreurs
    └── responseTransformer.ts # Transformation des données
```

## 🔧 **ÉTAPES D'IMPLÉMENTATION**

### **1. Installation des dépendances**

```bash
# Client HTTP
npm install axios

# Gestion des erreurs
npm install @tanstack/react-query

# Variables d'environnement (déjà inclus avec Create React App)
# .env.local pour les variables locales
```

### **2. Configuration des variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration de l'API
REACT_APP_API_URL=http://localhost:3001/api

# Configuration de l'application
REACT_APP_NAME=LNCP Frontend
REACT_APP_VERSION=1.0.0

# Configuration de l'authentification
REACT_APP_AUTH_TOKEN_KEY=lncp_auth_token
REACT_APP_AUTH_REFRESH_TOKEN_KEY=lncp_refresh_token

# Configuration des uploads
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Configuration de la pagination
REACT_APP_DEFAULT_PAGE_SIZE=10
REACT_APP_MAX_PAGE_SIZE=100
```

### **3. Structure des endpoints backend attendus**

#### **Élèves (`/api/students`)**

```typescript
// GET /api/students - Liste des élèves avec filtres
interface GetStudentsResponse {
  success: boolean;
  data: {
    students: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

// POST /api/students - Créer un élève
interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  placeOfBirth: string;
  email?: string;
  ninthGradeOrderNumber: string;
  level: 'secondaire' | 'nouveauSecondaire';
  grade: 'NSI' | 'NSII' | 'NSIII' | 'NSIV';
  roomId?: string;
  ninthGradeSchool?: string;
  ninthGradeGraduationYear?: string;
  lastSchool?: string;
  enrollmentDate: string;
  studentId: string;
  parentContact: {
    fatherName?: string;
    motherName?: string;
    responsiblePerson: string;
    phone: string;
    email?: string;
    address?: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

// PUT /api/students/:id - Mettre à jour un élève
// DELETE /api/students/:id - Supprimer un élève
// GET /api/students/:id - Récupérer un élève
```

#### **Salles (`/api/rooms`)**

```typescript
// GET /api/rooms - Liste des salles
interface GetRoomsResponse {
  success: boolean;
  data: {
    rooms: Room[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

// POST /api/rooms - Créer une salle
interface CreateRoomRequest {
  name: string;
  classLevel: 'NSI' | 'NSII' | 'NSIII' | 'NSIV';
  capacity: number;
  description?: string;
  isActive?: boolean;
}

// PUT /api/rooms/:id - Mettre à jour une salle
// DELETE /api/rooms/:id - Supprimer une salle
// GET /api/rooms/:id - Récupérer une salle
```

### **4. Migration des stores**

#### **Avant (avec données mock)**
```typescript
// Dans studentStore.ts
fetchStudents: async () => {
  // Utilise les données mock
  const filteredStudents = searchStudents(mockStudents, filters.search);
  set(state => {
    state.students = filteredStudents;
  });
}
```

#### **Après (avec API)**
```typescript
// Dans studentStore.ts
fetchStudents: async () => {
  try {
    const response = await StudentApiService.getStudents(filters);
    set(state => {
      state.students = response.data;
      state.pagination = response.pagination;
    });
  } catch (error) {
    set(state => {
      state.error = {
        message: 'Erreur lors du chargement des élèves',
        code: 'FETCH_ERROR'
      };
    });
  }
}
```

### **5. Gestion des erreurs**

```typescript
// Dans errorHandler.ts
export const handleApiError = (error: any) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  switch (status) {
    case 401:
      // Token expiré
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      break;
    case 403:
      // Accès interdit
      toast.error('Accès interdit');
      break;
    case 404:
      // Ressource non trouvée
      toast.error('Ressource non trouvée');
      break;
    case 422:
      // Erreurs de validation
      const errors = error.response?.data?.errors;
      errors?.forEach((err: any) => {
        toast.error(err.message);
      });
      break;
    case 500:
      // Erreur serveur
      toast.error('Erreur serveur');
      break;
    default:
      toast.error('Erreur inconnue');
  }
};
```

### **6. Authentification**

```typescript
// Dans authService.ts
export class AuthService {
  static async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, refreshToken } = response.data;
    
    setAuthToken(token);
    setRefreshToken(refreshToken);
    
    return response.data;
  }

  static async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthTokens();
      window.location.href = '/login';
    }
  }

  static async refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { token, newRefreshToken } = response.data;
    
    setAuthToken(token);
    setRefreshToken(newRefreshToken);
    
    return token;
  }
}
```

## 🔄 **MIGRATION PROGRESSIVE**

### **Phase 1: Préparation**
1. ✅ Créer la structure des services API
2. ✅ Configurer le client HTTP
3. ✅ Définir les types de réponses API

### **Phase 2: Migration des stores**
1. Modifier `studentStore.ts` pour utiliser les services API
2. Modifier `roomStore.ts` pour utiliser les services API
3. Tester avec un backend de développement

### **Phase 3: Gestion des erreurs**
1. Implémenter la gestion centralisée des erreurs
2. Ajouter les toasts de notification
3. Gérer les états de chargement

### **Phase 4: Authentification**
1. Implémenter le système d'authentification
2. Ajouter les intercepteurs pour les tokens
3. Gérer le refresh des tokens

### **Phase 5: Optimisations**
1. Ajouter le cache avec React Query
2. Implémenter la pagination côté serveur
3. Optimiser les requêtes

## 🧪 **TESTING**

### **Tests unitaires**
```typescript
// Dans __tests__/services/studentApi.test.ts
describe('StudentApiService', () => {
  it('should fetch students successfully', async () => {
    const mockResponse = { data: [], pagination: { page: 1, total: 0 } };
    jest.spyOn(apiClient, 'get').mockResolvedValue(mockResponse);
    
    const result = await StudentApiService.getStudents();
    expect(result).toEqual(mockResponse);
  });
});
```

### **Tests d'intégration**
```typescript
// Dans __tests__/integration/studentManagement.test.ts
describe('Student Management Integration', () => {
  it('should create and display a new student', async () => {
    // Test complet du flux CRUD
  });
});
```

## 🚀 **DÉPLOIEMENT**

### **Variables d'environnement de production**
```env
REACT_APP_API_URL=https://api.lncp.edu.ht/api
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
```

### **Configuration Netlify**
```toml
# netlify.toml
[build.environment]
  REACT_APP_API_URL = "https://api.lncp.edu.ht/api"
  REACT_APP_DEBUG = "false"
```

## 📚 **RESSOURCES UTILES**

- [Axios Documentation](https://axios-http.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🔍 **DÉBOGAGE**

### **Logs de développement**
```typescript
// Dans client.ts
if (isDevelopment()) {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`✅ API Response: ${response.status} ${response.config.url}`);
}
```

### **Outils de développement**
- Redux DevTools pour Zustand
- React Query DevTools
- Network tab du navigateur
- Postman pour tester les APIs

## ✅ **CHECKLIST DE MIGRATION**

- [ ] Configuration des variables d'environnement
- [ ] Création du client API
- [ ] Définition des endpoints
- [ ] Migration du store des élèves
- [ ] Migration du store des salles
- [ ] Gestion des erreurs
- [ ] Authentification
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation
- [ ] Déploiement

Cette architecture vous permettra de migrer progressivement de vos données mock vers un vrai backend tout en gardant une structure propre et maintenable. 