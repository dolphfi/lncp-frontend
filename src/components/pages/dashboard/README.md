# Module Dashboard Professeur

## 📋 Vue d'ensemble

Le module Dashboard Professeur fournit une interface complète pour afficher les informations d'un professeur connecté, incluant :
- Informations personnelles du professeur
- Liste de ses cours actifs
- Emploi du temps hebdomadaire
- Notes en attente
- Statistiques diverses

## 🏗️ Architecture

### Composants créés

1. **Types** (`/types/teacherDashboard.ts`)
   - `TeacherDashboardData` : Interface pour les données du dashboard

2. **Services** (`/services/dashboard/teacherDashboardService.ts`)
   - `getTeacherDashboard()` : Récupération des données du dashboard
   - `markNoteAsRead()` : Marquage des notes comme lues

3. **Store** (`/stores/teacherDashboardStore.ts`)
   - Gestion centralisée de l'état du dashboard
   - Actions pour récupérer et mettre à jour les données

4. **Composants UI**
   - `TeacherDashboard.tsx` : Composant principal du dashboard
   - `TeacherNavigation.tsx` : Menu de navigation professeur
   - `TeacherLayout.tsx` : Layout avec navigation intégrée
   - `TeacherDashboardPage.tsx` : Page complète du dashboard

## 🚀 Utilisation

### Utilisation basique

```tsx
import { TeacherDashboard } from './components/pages/dashboard/TeacherDashboard';
import { TeacherDashboardData } from './types/teacherDashboard';

// Données d'exemple
const dashboardData: TeacherDashboardData = {
  teacherInfo: { /* ... */ },
  courses: [ /* ... */ ],
  schedule: [ /* ... */ ],
  pendingNotes: [ /* ... */ ],
  statistics: { /* ... */ }
};

function App() {
  return (
    <TeacherDashboard
      dashboardData={dashboardData}
      isLoading={false}
      onRefresh={() => console.log('Actualiser')}
    />
  );
}
```

### Avec le layout complet

```tsx
import TeacherLayout from './components/layout/TeacherLayout';

function App() {
  return (
    <TeacherLayout>
      {/* Contenu personnalisé */}
    </TeacherLayout>
  );
}
```

### Intégration avec les stores

```tsx
import { useTeacherDashboardStore } from './stores/teacherDashboardStore';

function DashboardPage() {
  const { dashboardData, loading, fetchDashboardData } = useTeacherDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <TeacherDashboard
      dashboardData={dashboardData!}
      onRefresh={fetchDashboardData}
    />
  );
}
```

## 🔧 Configuration API

### Endpoint attendu

Le composant attend un endpoint `GET /dashboard/teacher` qui retourne :

```typescript
{
  "teacherInfo": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "code": "string",
    "coursesCount": number
  },
  "courses": [...],
  "schedule": [...],
  "pendingNotes": [...],
  "statistics": {
    "totalCourses": number,
    "pendingNotesCount": number
  }
}
```

## 📊 Fonctionnalités

### Dashboard principal
- ✅ **Informations professeur** : Nom, code, nombre de cours
- ✅ **Statistiques rapides** : Cours, horaires, notes en attente
- ✅ **Onglets de navigation** : Vue d'ensemble, cours, emploi du temps, notes

### Onglet "Vue d'ensemble"
- ✅ **Prochains cours** : 3 prochains cours à venir
- ✅ **Emploi du temps du jour** : Créneaux d'aujourd'hui

### Onglet "Mes cours"
- ✅ **Tableau des cours** : Code, titre, catégorie, classe, statut
- ✅ **Informations détaillées** : Description, pondération

### Onglet "Emploi du temps"
- ✅ **Horaires hebdomadaires** : Groupés par jour et période
- ✅ **Détails des créneaux** : Heures, cours, salles

### Onglet "Notes en attente"
- ✅ **Liste des notes** : Titre, étudiant, date
- ✅ **Actions disponibles** : Marquer comme lue, voir détails

## 🎨 Interface utilisateur

### Design
- Interface moderne avec Shadcn/ui
- Badges colorés pour les statuts et catégories
- Icônes Lucide React pour la cohérence
- Design responsive (mobile, tablette, desktop)

### Navigation
- Menu de navigation avec onglets
- Indicateur visuel pour les notes en attente
- Menu utilisateur avec profil et paramètres

### États
- Indicateurs de chargement
- Gestion des erreurs avec messages utilisateur
- États vides avec messages appropriés

## 🔄 Gestion d'état

### Store Zustand
```typescript
interface TeacherDashboardStore {
  dashboardData: TeacherDashboardData | null;
  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
  markNoteAsRead: (noteId: string) => Promise<void>;
  clearError: () => void;
}
```

### Actions disponibles
- `fetchDashboardData()` : Récupérer les données du dashboard
- `markNoteAsRead(noteId)` : Marquer une note comme lue
- `clearError()` : Effacer les erreurs

## 📝 Notes d'intégration

1. **Authentification** : Assurez-vous que l'utilisateur est authentifié avant d'afficher le dashboard
2. **Gestion d'erreurs** : Le composant gère automatiquement les erreurs API
3. **Actualisation** : Bouton d'actualisation intégré pour recharger les données
4. **Performance** : Composant optimisé avec gestion du loading

## 🚀 Prochaines étapes

Pour une intégration complète :
1. Ajouter la route `/dashboard/teacher` dans votre système de routage
2. Intégrer avec votre système d'authentification
3. Ajouter les permissions appropriées (rôle professeur uniquement)
4. Personnaliser les couleurs et le thème selon votre charte graphique
