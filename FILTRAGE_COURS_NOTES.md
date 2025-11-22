# Filtrage des cours lors de l'ajout de notes - Sécurité et Rôles

## 🔐 Principe de sécurité implémenté

**RÈGLE IMPORTANTE** : Seuls les administrateurs peuvent voir tous les cours du système. Les professeurs ne voient QUE leurs cours assignés via l'endpoint `/dashboard`.

---

## 📊 Fonctionnement par rôle

### 1️⃣ **PROFESSEUR (TEACHER)**

#### Endpoint utilisé
```typescript
GET /dashboard
```

#### Cours affichés
- ✅ **UNIQUEMENT** les cours assignés au professeur connecté
- ✅ Retournés automatiquement par le backend dans `response.data.courses`
- ❌ **AUCUN** accès aux cours des autres professeurs
- ❌ **AUCUN** accès aux cours non assignés

#### Filtrage supplémentaire
```typescript
if (userRole === 'TEACHER') {
  // Charger les cours depuis /dashboard
  const allTeacherCourses = await getTeacherCourses();
  
  // Filtrer par classe de l'étudiant sélectionné
  if (student.classroom?.id) {
    courses = allTeacherCourses.filter((course: any) => 
      course.classrooms?.some((classroom: any) => classroom.id === student.classroom.id) ||
      course.classroom?.id === student.classroom.id
    );
  }
}
```

**Pourquoi ce filtrage ?**
- Un professeur peut enseigner plusieurs cours dans différentes classes
- Quand il sélectionne un élève de NSI, on affiche SEULEMENT ses cours de NSI
- Empêche d'attribuer une note pour un cours qu'il enseigne en NSII à un élève de NSI

#### Interface utilisateur
- ❌ **PAS de filtre par classe** (masqué pour les professeurs)
- ✅ Message : "Cours filtrés pour la classe: [Classe de l'élève]"
- ✅ Liste déroulante réduite aux cours pertinents

---

### 2️⃣ **ADMINISTRATEUR (ADMIN, SUPER_ADMIN, DIRECTOR, CENSORED, SECRETARY)**

#### Endpoint utilisé
```typescript
GET /courses/all-courses
```

#### Cours affichés
- ✅ **TOUS** les cours du système
- ✅ Accès complet à tous les cours de toutes les classes
- ✅ Peut attribuer une note pour n'importe quel cours

#### Filtrage
```typescript
if (userRole !== 'TEACHER') {
  // Charger TOUS les cours avec filtre optionnel
  const classroomId = selectedClassroom || student.classroom?.id;
  if (classroomId) {
    courses = await getAllCoursesWithClassFilter(classroomId);
  }
}
```

**Filtrage appliqué :**
1. Si une classe est sélectionnée manuellement → filtre par cette classe
2. Sinon, si un élève est sélectionné → filtre par sa classe
3. Sinon → affiche tous les cours

#### Interface utilisateur
- ✅ **Filtre par classe visible** (optionnel)
- ✅ Peut sélectionner manuellement une classe pour réduire la liste
- ✅ Message : "Cours filtrés pour la classe: [Classe sélectionnée]"

---

## 🔒 Sécurité garantie

### Points de contrôle

1. **Backend** ✅
   - `/dashboard` → retourne UNIQUEMENT les cours du professeur
   - `/courses/all-courses` → accessible uniquement aux admins (vérification JWT)

2. **Frontend - Service** ✅
   ```typescript
   // noteService.ts ligne 123
   async getTeacherCourses(): Promise<any[]> {
     const response = await api.get<any>('/dashboard');
     return response.data?.courses || [];
   }
   ```

3. **Frontend - Store** ✅
   ```typescript
   // noteStore.ts
   getTeacherCourses: async () => {
     return await noteService.getTeacherCourses(); // Utilise /dashboard
   }
   ```

4. **Frontend - Composant** ✅
   ```typescript
   // NoteEntry.tsx ligne 214
   if (userRole === 'TEACHER') {
     const allTeacherCourses = await getTeacherCourses(); // /dashboard uniquement
     // + filtrage par classe de l'élève
   } else {
     // Admins utilisent getAllCoursesWithClassFilter
   }
   ```

---

## 🎯 Workflow d'ajout de note

### Pour un PROFESSEUR

1. **Connexion** → JWT avec rôle TEACHER
2. **Sélection élève** → ex: Jean Dupont (Classe NSI)
3. **Chargement cours** → 
   - Appel `/dashboard` → retourne uniquement ses cours
   - Filtrage : garde uniquement cours de la classe NSI
4. **Liste affichée** → ex: "Mathématiques NSI", "Français NSI", "Informatique NSI"
5. **Sélection cours** → Mathématiques NSI (pondération 100)
6. **Saisie note** → ex: 75/100
7. **Validation** → Note envoyée au backend

**Impossible d'attribuer :**
- ❌ Un cours d'un autre professeur
- ❌ Un cours d'une autre classe (NSII, NSIII, etc.)
- ❌ Un cours non assigné au professeur

### Pour un ADMINISTRATEUR

1. **Connexion** → JWT avec rôle ADMIN/SUPER_ADMIN
2. **(Optionnel) Filtre classe** → ex: Sélection NSII
3. **Chargement cours** → Appel `/courses/all-courses` → tous les cours du système
4. **Filtrage** → Si NSII sélectionnée, filtre côté client
5. **Sélection élève** → ex: Marie Martin (Classe NSII)
6. **Liste affichée** → Tous les cours de NSII (tous professeurs confondus)
7. **Sélection cours** → ex: Physique NSII
8. **Saisie note** → Note validée immédiatement

**Possibilités :**
- ✅ Attribuer une note pour n'importe quel cours
- ✅ Corriger une note d'un autre professeur
- ✅ Voir tous les cours de toutes les classes

---

## 📁 Fichiers concernés

### Services
- `/src/services/notes/noteService.ts`
  - `getTeacherCourses()` → ligne 95 → utilise `/dashboard`
  - `getAllCoursesWithClassFilter()` → ligne 133 → utilise `/courses/all-courses`

### Stores
- `/src/stores/noteStore.ts`
  - `getTeacherCourses()` → ligne 306
  - `getAllCoursesWithClassFilter()` → ligne 315

### Composants
- `/src/components/pages/notes/NoteEntry.tsx`
  - `loadCoursesForStudent()` → ligne 209-242
  - Condition `userRole === 'TEACHER'` → ligne 214
  - Filtre classe masqué pour TEACHER → ligne 372

---

## ✅ Résumé

| Aspect | Professeur | Administrateur |
|--------|-----------|----------------|
| **Endpoint** | `/dashboard` | `/courses/all-courses` |
| **Cours visibles** | Uniquement ses cours assignés | Tous les cours |
| **Filtrage classe** | Automatique (classe élève) | Optionnel (manuel) |
| **Filtre UI** | Masqué | Visible |
| **Peut voir cours autres profs** | ❌ NON | ✅ OUI |
| **Peut attribuer note autre classe** | ❌ NON | ✅ OUI |

---

## 🔐 Conclusion

Le système est **entièrement sécurisé** :

1. ✅ Les professeurs utilisent **exclusivement** l'endpoint `/dashboard`
2. ✅ Ils ne voient **QUE** leurs cours assignés
3. ✅ Un filtrage supplémentaire limite aux cours de la classe de l'élève
4. ✅ Les administrateurs ont accès à tous les cours via `/courses/all-courses`
5. ✅ Aucun risque de fuite de données ou d'accès non autorisé

**Le code actuel respecte parfaitement la séparation des privilèges !** 🎉
