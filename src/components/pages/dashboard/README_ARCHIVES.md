# Module Archives - Documentation

## 📋 Vue d'ensemble

Le module Archives permet de gérer et consulter les données archivées des années académiques précédentes. Il est intégré dans l'**AdminPanel** sous forme d'un onglet dédié.

---

## 🏗️ Architecture

### 1. **Types TypeScript** (`/types/archive.ts`)

Définit toutes les interfaces et types nécessaires :

- `ArchivedYear` : Année académique archivée avec métadonnées
- `ArchiveStats` : Statistiques globales des archives
- `ArchivedData` : Données archivées par type (étudiants, employés, etc.)
- `ArchiveDataType` : Types de données disponibles (students, employees, courses, payments, grades, attendance, bulletins)
- `ArchiveStatus` : Statuts possibles (archived, restoring, restored, error)

### 2. **Service API** (`/services/archives/archiveService.ts`)

Gère toutes les requêtes HTTP vers le backend :

```typescript
// Endpoints disponibles
GET    /archives/years              // Liste des années archivées
GET    /archives/years/:id          // Détails d'une année
GET    /archives/stats              // Statistiques globales
GET    /archives/years/:id/data/:type  // Données archivées
POST   /archives/create             // Créer une archive
POST   /archives/restore            // Restaurer une archive
DELETE /archives/years/:id          // Supprimer une archive
GET    /archives/years/:id/download // Télécharger l'archive
GET    /archives/years/:id/export/:type // Exporter des données
```

**Fonctionnalités :**
- Configuration Axios avec JWT
- Intercepteurs pour l'authentification
- Timeout de 30 secondes (fichiers volumineux)
- Gestion des téléchargements de fichiers (Blob)
- Exports multiformats (PDF, Excel, CSV)

### 3. **Store Zustand** (`/stores/archiveStore.ts`)

Gestion de l'état global avec middleware immer et subscribeWithSelector :

**État :**
```typescript
{
  archivedYears: ArchivedYear[],        // Liste des années
  selectedYear: ArchivedYear | null,    // Année sélectionnée
  archivedData: Record<ArchiveDataType, any[]>, // Données par type
  stats: ArchiveStats | null,           // Statistiques
  loading: boolean,                     // États de chargement
  error: string | null                  // Gestion des erreurs
}
```

**Actions principales :**
- `fetchArchivedYears()` : Charge toutes les années archivées
- `fetchArchivedData()` : Charge les données d'un type spécifique
- `downloadArchive()` : Télécharge une archive complète
- `exportData()` : Exporte des données au format souhaité
- `deleteArchive()` : Supprime une archive

**Sélecteurs personnalisés :**
```typescript
useArchivedYears()  // Liste des années
useSelectedYear()   // Année sélectionnée
useArchiveStats()   // Statistiques
useArchiveLoading() // État de chargement
useArchiveError()   // Erreurs
```

### 4. **Composant UI** (`/components/pages/dashboard/ArchivesTab.tsx`)

Interface utilisateur complète avec :

---

## 🎨 Fonctionnalités UI

### **1. Cartes de statistiques**
- Archives totales
- Taille totale utilisée
- Dernière archive créée
- Archive la plus ancienne

### **2. Tableau des années archivées**

**Colonnes :**
- Année (ex: 2023-2024)
- Période (dates de début et fin)
- Date d'archivage
- Statut (badge coloré)
- Taille de l'archive
- Actions (voir, télécharger, supprimer)

**Responsive :**
- Mobile : Colonnes essentielles uniquement
- Desktop : Toutes les colonnes visibles
- Scroll horizontal automatique

### **3. Dialog de détails**

Lorsqu'on clique sur une année, un dialogue s'ouvre avec :

**a. Informations générales**
- Période de l'année
- Date et auteur de l'archivage
- Taille et statut
- Description (optionnelle)

**b. Statistiques des données**
Grille affichant le nombre d'enregistrements par type :
- 👥 Étudiants
- 🎓 Employés
- 📚 Cours
- 💰 Paiements
- ✅ Notes
- 📝 Présences
- 📄 Bulletins

**c. Onglets de consultation**
7 onglets pour explorer chaque type de données :
- Chargement dynamique des données
- Affichage JSON formaté
- Compteur d'enregistrements
- Message si aucune donnée

**d. Boutons d'export**
- Export PDF
- Export Excel
- Export CSV
- Téléchargement automatique du fichier

### **4. Dialog de confirmation**
Avant suppression, demande de confirmation avec :
- Icône d'alerte
- Nom de l'année à supprimer
- Avertissement "action irréversible"
- Boutons Annuler/Confirmer

---

## 📱 Responsive Design

### **Mobile (< 640px)**
- Cartes statistiques : 1 colonne
- Tableau : Colonnes essentielles + scroll horizontal
- Boutons : Pleine largeur
- Textes réduits

### **Tablet (640px - 1024px)**
- Cartes statistiques : 2 colonnes
- Plus de colonnes visibles dans le tableau
- Onglets : 4 colonnes

### **Desktop (≥ 1024px)**
- Cartes statistiques : 4 colonnes
- Toutes les colonnes du tableau
- Onglets : 7 colonnes
- Layout optimal

---

## 🔄 Flux de données

### **Chargement initial**
```
useEffect → fetchArchivedYears() → API → Store → UI
         ↘ fetchArchiveStats()   → API → Store → UI
```

### **Consultation des données**
```
Click sur année → setSelectedYear() → fetchArchivedData(type) → API → Store → UI
```

### **Téléchargement**
```
Click Download → downloadArchive() → API → Blob → Téléchargement navigateur
```

### **Export**
```
Click Export → exportData(format) → API → Blob → Téléchargement fichier
```

### **Suppression**
```
Click Delete → Confirmation → deleteArchive() → API → Remove from store → UI update
```

---

## 🎯 Intégration dans AdminPanel

### **1. Import du composant**
```typescript
import ArchivesTab from './ArchivesTab';
```

### **2. Ajout de l'icône**
```typescript
import { Archive } from 'lucide-react';
```

### **3. Menu mobile (Select)**
```tsx
<SelectItem value="archives">📦 Archives</SelectItem>
```

### **4. Menu desktop (Tabs)**
```tsx
<TabsList className="grid-cols-9"> {/* 8 → 9 colonnes */}
  <TabsTrigger value="archives">Archives</TabsTrigger>
</TabsList>
```

### **5. Contenu de l'onglet**
```tsx
<TabsContent value="archives">
  <ArchivesTab />
</TabsContent>
```

---

## 🔒 Sécurité

- **Authentification JWT** : Token automatiquement ajouté aux requêtes
- **Intercepteurs** : Redirection si token expiré
- **Confirmation** : Dialogue avant suppression
- **Timeouts** : 30 secondes pour éviter les blocages
- **Gestion d'erreurs** : Tous les appels API sont dans des try/catch

---

## 🚀 Utilisation

### **Consulter les archives**
1. Aller dans AdminPanel → Archives
2. Voir la liste des années archivées
3. Cliquer sur "👁️" pour voir les détails

### **Explorer les données**
1. Dans le dialogue de détails
2. Cliquer sur un onglet (Étudiants, Cours, etc.)
3. Les données se chargent automatiquement
4. Scroller pour voir tous les enregistrements

### **Exporter des données**
1. Sélectionner un onglet (type de données)
2. Cliquer sur PDF/Excel/CSV
3. Le fichier se télécharge automatiquement

### **Télécharger une archive complète**
1. Dans le tableau, cliquer sur "📥"
2. Le fichier ZIP se télécharge
3. Contient toutes les données de l'année

### **Supprimer une archive**
1. Cliquer sur "🗑️" (icône rouge)
2. Confirmer dans le dialogue
3. L'archive est supprimée du serveur et de la liste

---

## 📊 Exemples de données

### **ArchivedYear**
```json
{
  "id": "ay-2023-2024",
  "name": "2023-2024",
  "startDate": "2023-09-01",
  "endDate": "2024-06-30",
  "archivedAt": "2024-07-15T10:30:00Z",
  "archivedBy": "admin@lncp.edu.ht",
  "status": "archived",
  "size": "2.5 GB",
  "recordsCount": {
    "students": 450,
    "employees": 85,
    "courses": 120,
    "payments": 1250,
    "grades": 8900,
    "attendance": 15000,
    "bulletins": 1800
  },
  "description": "Archive de l'année scolaire 2023-2024"
}
```

### **ArchiveStats**
```json
{
  "totalYears": 5,
  "totalSize": "12.3 GB",
  "latestArchive": { /* ArchivedYear */ },
  "oldestArchive": { /* ArchivedYear */ }
}
```

---

## 🛠️ Extension future

### **Fonctionnalités à ajouter**
- ✅ Restauration sélective des données
- ✅ Comparaison entre années
- ✅ Recherche dans les archives
- ✅ Planification d'archivage automatique
- ✅ Compression et optimisation
- ✅ Versioning des archives
- ✅ Permissions par rôle

### **Optimisations possibles**
- Pagination des données archivées
- Cache local (IndexedDB)
- Chargement progressif (lazy loading)
- Virtualisation pour grandes listes
- WebWorkers pour exports volumineux

---

## 📝 Notes techniques

### **Pattern utilisé**
Le module suit strictement le pattern des autres modules du projet :
- Types séparés dans `/types`
- Service API dans `/services`
- Store Zustand avec middleware
- Composant UI dans `/components/pages`
- Responsive first
- Commentaires exhaustifs

### **Dépendances**
- React 18+
- Zustand (state management)
- Axios (HTTP)
- Lucide React (icons)
- Shadcn/ui (components)
- React Toastify (notifications)
- TypeScript 5+

### **Performance**
- Chargement à la demande des données
- Pas de polling automatique
- Nettoyage du cache lors du changement d'année
- États de chargement pour UX fluide
- Gestion des erreurs réseau

---

## ✅ Checklist d'implémentation

- [x] Types TypeScript définis
- [x] Service API créé avec tous les endpoints
- [x] Store Zustand avec middleware
- [x] Composant UI responsive
- [x] Intégration dans AdminPanel
- [x] Gestion des erreurs
- [x] États de chargement
- [x] Notifications toast
- [x] Dialogues de confirmation
- [x] Exports multiformats
- [x] Téléchargements de fichiers
- [x] Commentaires exhaustifs
- [x] Documentation complète

---

**Le module Archives est maintenant entièrement fonctionnel et prêt à être connecté au backend !** 🎉
