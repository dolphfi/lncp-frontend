# Gestion des Horaires Admin - Vue Calendrier par Classe

## 🎯 Objectif

Afficher les horaires pour les administrateurs **organisés par classe** avec le **même design** que l'horaire des professeurs (MySchedule), tout en gardant la fonctionnalité de gestion (création/modification/suppression).

---

## ✅ Solution implémentée

### **Nouveau composant créé : AdminScheduleView.tsx**

Un composant dédié qui reprend **exactement le même design** que `MySchedule.tsx` mais adapté pour afficher les horaires **par classe** au lieu d'un horaire personnel.

---

## 📊 Fonctionnalités

### **1. Sélection de classe**

```typescript
<Select value={selectedClassroom || ''} onValueChange={onClassroomChange}>
  <SelectValue placeholder="Sélectionnez une classe..." />
  <SelectContent>
    {classrooms.map(classroom => (
      <SelectItem key={classroom.id} value={classroom.id}>
        {classroom.name} {classroom.niveau ? `- ${classroom.niveau}` : ''}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Comportement** :
- ✅ Liste déroulante de toutes les classes disponibles
- ✅ Affiche le nom et le niveau de chaque classe (ex: "NSI - Secondaire")
- ✅ Sélection de la première classe par défaut au chargement

---

### **2. Vue Calendrier Hebdomadaire**

**Design identique à MySchedule** :
- ✅ Grille 8 colonnes (Heure + 7 jours de la semaine)
- ✅ En-têtes colorés avec dégradé bleu-cyan
- ✅ Heures de 7h à 17h (11 heures)
- ✅ Cours affichés avec couleurs alternées
- ✅ Informations affichées : Horaire, Nom du cours, Professeur, Salle

**Différences avec MySchedule** :
- ❌ Pas d'horaire personnel → Horaire de la **classe sélectionnée**
- ✅ Affiche le **nom du professeur** sur chaque cours (tooltip + texte)
- ✅ Statistiques adaptées : Total cours, Jours, **Professeurs** (au lieu de "Classes")

---

### **3. Vue Mobile Responsive**

- ✅ Utilise le même composant `MobileScheduleView` que MySchedule
- ✅ Navigation par jour avec flèches gauche/droite
- ✅ Affichage en cards verticales
- ✅ Même système de couleurs et badges

---

### **4. Filtres**

**Identiques à MySchedule** :
- Jour de la semaine (Tous / Lundi / Mardi / etc.)
- Période (Toutes / Matin (AM) / Après-midi (PM))
- Cachés sur mobile pour économiser l'espace

---

### **5. Statistiques**

**3 cards en bas du calendrier** :

| Stat | Description |
|------|-------------|
| **Total cours** | Nombre total de créneaux dans la semaine |
| **Jours** | Nombre de jours différents avec cours |
| **Professeurs** | Nombre de professeurs différents enseignant dans cette classe |

---

## 🏗️ Architecture

### **Fichiers créés**

#### `/components/pages/schedules/AdminScheduleView.tsx`

**Composant principal** pour la vue calendrier admin.

**Props** :
```typescript
interface AdminScheduleViewProps {
  classrooms: any[];              // Liste des classes disponibles
  selectedClassroom: string | null; // ID de la classe sélectionnée
  onClassroomChange: (classroomId: string) => void; // Callback changement classe
}
```

**Fonctionnalités** :
- Chargement des horaires via `fetchSchedulesByClassroom(classroomId)`
- Filtrage par jour et période
- Affichage calendrier desktop (grille)
- Affichage mobile (navigation par jour)
- Statistiques calculées dynamiquement

---

### **Fichiers modifiés**

#### `/components/pages/schedules/ScheduleManagement.tsx`

**Modifications apportées** :

1. **Import du nouveau composant** :
   ```typescript
   import AdminScheduleView from './AdminScheduleView';
   import noteService from '../../../services/notes/noteService';
   ```

2. **Nouveaux états** :
   ```typescript
   const [classrooms, setClassrooms] = useState<any[]>([]);
   const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
   const [loadingClassrooms, setLoadingClassrooms] = useState(false);
   ```

3. **Chargement des classes** :
   ```typescript
   useEffect(() => {
     const loadClassrooms = async () => {
       setLoadingClassrooms(true);
       try {
         const data = await noteService.getAllClassrooms();
         setClassrooms(data);
         if (data.length > 0) {
           setSelectedClassroom(data[0].id); // Première classe par défaut
         }
       } catch (error) {
         toast.error('Impossible de charger les classes');
       } finally {
         setLoadingClassrooms(false);
       }
     };
     loadClassrooms();
   }, []);
   ```

4. **Intégration du composant** :
   ```typescript
   {/* Vue Calendrier par Classe */}
   <AdminScheduleView
     classrooms={classrooms}
     selectedClassroom={selectedClassroom}
     onClassroomChange={setSelectedClassroom}
   />

   {/* Tableau des horaires (Liste complète pour gestion) */}
   <Card className="mt-6">
     <CardHeader>
       <CardTitle>Liste des Horaires (Gestion)</CardTitle>
       <CardDescription>
         {schedules.length} horaire(s) trouvé(s) - Vue de gestion pour création/modification/suppression
       </CardDescription>
     </CardHeader>
     {/* ... Tableau existant ... */}
   </Card>
   ```

---

## 🎨 Design et UX

### **Calendrier Desktop**

```
┌─────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  Heure  │  LUN   │  MAR   │  MER   │  JEU   │  VEN   │  SAM   │  DIM   │
├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│   7h    │        │ [Cours]│        │ [Cours]│        │        │        │
│   8h    │ [Cours]│ [Cours]│ [Cours]│ [Cours]│ [Cours]│        │        │
│   9h    │ [Cours]│        │ [Cours]│        │ [Cours]│        │        │
│  10h    │        │ [Cours]│        │ [Cours]│        │        │        │
│  ...    │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │
└─────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

**Chaque cours affiche** :
- ⏰ Horaire (ex: 08:00-09:00)
- 📚 Nom du cours (ex: Mathématiques)
- 👨‍🏫 Professeur (ex: Prof: Jean Dupont)
- 🏫 Salle (ex: Salle A1)

### **Couleurs des cours**

Même palette que MySchedule :
- 🔵 Bleu (`bg-blue-600`)
- 🟢 Émeraude (`bg-emerald-600`)
- 🔵 Cyan (`bg-cyan-600`)
- 🟠 Orange (`bg-orange-600`)
- 🔴 Rose (`bg-rose-600`)
- 🟦 Teal (`bg-teal-600`)
- 🔵 Sky (`bg-sky-600`)

---

## 🔄 Flux utilisateur

### **Admin consulte l'horaire d'une classe**

1. **Accès** : `/schedules/manage` (Gestion des Horaires)
2. **Affichage automatique** : Calendrier de la première classe chargé
3. **Sélection classe** : Utilise le select pour changer de classe
4. **Vue calendrier** : Affiche tous les cours de la semaine pour cette classe
5. **Filtres** : Peut filtrer par jour ou période
6. **Statistiques** : Voit total cours, jours, nombre de profs

### **Admin gère les horaires**

1. **Scroll down** : Tableau de gestion en dessous du calendrier
2. **Actions disponibles** :
   - ➕ Créer un nouvel horaire
   - ✏️ Modifier un horaire existant
   - 🗑️ Supprimer un horaire
   - 👁️ Voir détails d'un horaire

---

## 📱 Responsive Design

### **Desktop (md+)**
- ✅ Calendrier complet visible
- ✅ Grille 8 colonnes avec toute la semaine
- ✅ Filtres visibles en permanence
- ✅ Tableau de gestion en dessous

### **Mobile (sm)**
- ✅ Navigation par jour avec flèches
- ✅ Affichage vertical en cards
- ✅ Filtres cachés (économie d'espace)
- ✅ Statistiques adaptées (petites cards)

---

## ✅ Comparaison MySchedule vs AdminScheduleView

| Aspect | MySchedule (Prof/Élève) | AdminScheduleView (Admin) |
|--------|-------------------------|---------------------------|
| **Données affichées** | Horaire personnel | Horaire d'une classe |
| **Sélecteur** | Aucun (automatique) | Sélecteur de classe |
| **Endpoint API** | `/dashboard` ou `/schedules/my-schedule` | `/schedules/classroom/{id}` |
| **Professeur affiché** | Non (c'est son horaire) | ✅ Oui (nom du prof) |
| **Statistiques** | Total cours, Jours, Classes | Total cours, Jours, **Professeurs** |
| **Design calendrier** | ✅ Identique | ✅ Identique |
| **Vue mobile** | ✅ Identique | ✅ Identique |
| **Couleurs** | ✅ Identique | ✅ Identique |
| **Filtres** | ✅ Identique | ✅ Identique |

---

## 🔐 Permissions

**Qui a accès** :
- ✅ ADMIN
- ✅ SUPER_ADMIN
- ✅ DIRECTOR
- ✅ CENSORED (si permissions horaires)
- ❌ TEACHER → Utilise `/schedules/my-schedule` (MySchedule)
- ❌ STUDENT → Utilise `/schedules/my-schedule` (MySchedule)

---

## 🎯 Avantages de cette approche

1. ✅ **Design cohérent** : Même interface que MySchedule → familiarité
2. ✅ **Organisation claire** : Vue par classe → pas de confusion
3. ✅ **Facilité de navigation** : Select simple pour changer de classe
4. ✅ **Vue d'ensemble** : Calendrier hebdomadaire complet
5. ✅ **Détails visibles** : Professeur + salle sur chaque cours
6. ✅ **Gestion préservée** : Tableau en dessous pour CRUD
7. ✅ **Responsive** : Même expérience mobile que les profs
8. ✅ **Statistiques utiles** : Aperçu rapide de la charge de la classe

---

## 📁 Fichiers impliqués

### Créés
- ✅ `/components/pages/schedules/AdminScheduleView.tsx`
- ✅ `/HORAIRES_ADMIN_PAR_CLASSE.md` (cette doc)

### Modifiés
- ✅ `/components/pages/schedules/ScheduleManagement.tsx`

### Réutilisés
- ✅ `/components/pages/schedules/MobileScheduleView.tsx` (partagé avec MySchedule)
- ✅ `/stores/scheduleStore.ts` (méthode `fetchSchedulesByClassroom`)
- ✅ `/services/notes/noteService.ts` (méthode `getAllClassrooms`)

---

## 🔧 Stack technique

- React + TypeScript
- Zustand (state management)
- Shadcn/ui (composants UI)
- Tailwind CSS (styling)
- React Toastify (notifications)
- Lucide React (icônes)

---

## ✅ Résultat final

Les administrateurs ont maintenant :
- ✅ Une **vue calendrier** identique à celle des professeurs
- ✅ Une **organisation par classe** claire et intuitive
- ✅ Un **sélecteur de classe** pour basculer rapidement
- ✅ Les **mêmes filtres** et options que MySchedule
- ✅ Le **tableau de gestion** préservé en dessous
- ✅ Une **expérience responsive** parfaite sur mobile

**L'interface de gestion des horaires est maintenant visuellement cohérente et organisée par classe ! 🎉**
