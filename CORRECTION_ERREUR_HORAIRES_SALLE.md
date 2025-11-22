# Correction Erreur : Cannot read properties of undefined (reading 'map')

## 🐛 Erreur rencontrée

```
Erreur lors du chargement des horaires de la salle
❌ Erreur: TypeError: Cannot read properties of undefined (reading 'map')
    at fetchSchedulesByRoom (scheduleStore.ts:279:1)
```

---

## 🔍 Cause du problème

L'erreur se produisait à la ligne 279 dans `scheduleStore.ts` :

```typescript
const schedules = response.data.map(convertScheduleFromApi);
```

**Raisons possibles** :
1. ❌ `response` est `undefined` (endpoint backend non implémenté ou erreur réseau)
2. ❌ `response.data` est `undefined` (backend retourne un format différent)
3. ❌ L'endpoint `/schedules/by-room/{roomId}` n'existe pas encore

---

## ✅ Solution appliquée

### **Ajout de vérifications de sécurité**

```typescript
// AVANT ❌
const schedules = response.data.map(convertScheduleFromApi);

// APRÈS ✅
console.log('📦 Réponse reçue:', response);

// Vérifier que response et response.data existent
if (!response || !response.data) {
  console.warn('⚠️ Réponse vide ou invalide du backend');
  set(state => {
    state.schedules = [];
    state.pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    state.loading = false;
  });
  return; // ✅ Sortie anticipée sans erreur
}

const schedules = response.data.map(convertScheduleFromApi);
```

---

## 📋 Modifications apportées

### **1. `fetchSchedulesByRoom` (ligne 268-347)**

**Ajouts** :
- ✅ Log de debug : `console.log('📦 Réponse reçue:', response)`
- ✅ Vérification : `if (!response || !response.data)`
- ✅ Fallback sécurisé : Retourne liste vide avec pagination par défaut
- ✅ Gestion pagination : `response.pagination || { ... }` (au cas où manquante)
- ✅ Reset schedules dans catch : `state.schedules = []`

### **2. `fetchSchedulesByClassroom` (ligne 227-285)**

**Même correction appliquée** pour éviter le bug sur cet endpoint aussi.

---

## 🔧 Comportement après correction

### **Cas 1 : Backend retourne des données valides**
```json
{
  "data": [
    {
      "id": "schedule-1",
      "name": "Horaire NSI AM",
      "dayOfWeek": "LUNDI",
      "vacation": "Matin (AM)",
      "timeSlots": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```
**Résultat** : ✅ Horaires affichés correctement

---

### **Cas 2 : Backend retourne réponse vide ou invalide**
```json
{
  "data": null
}
// OU
null
```
**Résultat** : 
- ⚠️ Log console : "Réponse vide ou invalide du backend"
- ✅ Pas d'erreur JavaScript
- 📊 Calendrier affiche : "Aucun horaire trouvé"
- 🔄 Interface reste utilisable

---

### **Cas 3 : Erreur réseau ou endpoint manquant**
```
404 Not Found
/schedules/by-room/room-123
```
**Résultat** :
- ❌ Erreur capturée dans le `catch`
- 🔔 Toast : "Erreur lors du chargement des horaires de la salle"
- 📊 Calendrier affiche message d'erreur
- 🔄 Bouton "Actualiser" reste disponible

---

## 🎯 Vérifications à faire côté backend

### **Endpoint requis : `/schedules/by-room/{roomId}`**

**Méthode** : `GET`

**Paramètres query** :
```typescript
{
  page?: number;      // Pagination (défaut: 1)
  limit?: number;     // Limite par page (défaut: 10)
  day?: DayOfWeek;    // Filtre par jour (optionnel)
  vacation?: VacationType; // Filtre par période (optionnel)
}
```

**Réponse attendue** :
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "dayOfWeek": "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI" | "DIMANCHE",
      "vacation": "Matin (AM)" | "Après-midi (PM)",
      "classroomId": "string",
      "roomId": "string",
      "timeSlots": [
        {
          "id": "string",
          "startTime": "HH:mm:ss",
          "endTime": "HH:mm:ss",
          "type": "COURS" | "PAUSE" | "RECREATION",
          "courseId": "string",
          "courseName": "string",
          "teacherId": "string",
          "teacherName": "string",
          "classroomName": "string",
          "roomName": "string"
        }
      ],
      "classroom": {
        "id": "string",
        "name": "string",
        "niveau": "string"
      },
      "room": {
        "id": "string",
        "name": "string",
        "capacity": number
      },
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 🧪 Test de l'endpoint

### **1. Vérifier l'existence de l'endpoint**

```bash
# Test avec curl
curl -X GET "http://localhost:3000/schedules/by-room/ROOM_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponses possibles** :
- ✅ `200 OK` → Endpoint implémenté
- ❌ `404 Not Found` → Endpoint manquant
- ❌ `500 Internal Server Error` → Erreur backend

---

### **2. Tester dans l'application**

1. Ouvrir la console navigateur (F12)
2. Aller sur `/schedules/manage`
3. Sélectionner une classe
4. Sélectionner une salle
5. Observer les logs :
   ```
   📚 Store - Récupération des horaires de la salle room-123
   🌐 Service API - Récupération des horaires par salle
   🏫 ID salle: room-123
   🔍 Filtres: {}
   📦 Réponse reçue: { data: [...], pagination: {...} }
   ```

**Si erreur** :
```
❌ Erreur lors de la récupération des horaires de la salle: AxiosError
```
→ Vérifier que l'endpoint backend existe

---

## 📊 Logs de débogage

### **Logs frontend (console navigateur)**

```javascript
// Service API
🌐 Service API - Récupération des horaires par salle
🏫 ID salle: room-123
🔍 Filtres: { day: "LUNDI" }

// Store
📚 Store - Récupération des horaires de la salle room-123
📦 Réponse reçue: { data: [...], pagination: {...} }

// OU en cas de réponse vide
⚠️ Réponse vide ou invalide du backend

// OU en cas d'erreur
❌ Erreur: AxiosError: Request failed with status code 404
```

---

## 🔄 Prochaines étapes

### **Si l'endpoint n'existe pas encore**

**Option 1 : Créer l'endpoint backend**
```typescript
// Controller NestJS (exemple)
@Get('by-room/:roomId')
async getSchedulesByRoom(
  @Param('roomId') roomId: string,
  @Query() filters: ScheduleFilters
) {
  const schedules = await this.scheduleService.findByRoom(roomId, filters);
  return {
    data: schedules,
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total: schedules.length,
      totalPages: Math.ceil(schedules.length / (filters.limit || 10))
    }
  };
}
```

**Option 2 : Utiliser un endpoint alternatif temporaire**
```typescript
// Dans scheduleService.ts, remplacer temporairement par :
getSchedulesByRoom: async (roomId, filters) => {
  // Fallback : charger tous les horaires et filtrer côté client
  const allSchedules = await scheduleService.getAll();
  const filtered = allSchedules.data.filter(s => s.roomId === roomId);
  return {
    data: filtered,
    pagination: allSchedules.pagination
  };
}
```

---

## ✅ Résumé

| Aspect | Avant ❌ | Après ✅ |
|--------|----------|----------|
| **Erreur si response vide** | Crash JavaScript | Gestion gracieuse |
| **Message utilisateur** | Erreur technique | Message clair |
| **Logs de debug** | Aucun | Logs détaillés |
| **Fallback pagination** | Erreur | Valeurs par défaut |
| **État interface** | Bloquée | Reste utilisable |
| **Schedules après erreur** | Undefined | Liste vide [] |

---

## 📁 Fichiers modifiés

- ✅ `/stores/scheduleStore.ts` (lignes 227-347)
  - `fetchSchedulesByClassroom()` - Ajout vérifications
  - `fetchSchedulesByRoom()` - Ajout vérifications
- ✅ `/CORRECTION_ERREUR_HORAIRES_SALLE.md` (cette doc)

---

## 🎉 Résultat

L'application ne plante plus si :
- ✅ L'endpoint backend n'existe pas encore
- ✅ Le backend retourne une réponse vide
- ✅ La structure de la réponse est différente
- ✅ Une erreur réseau se produit

**L'interface reste utilisable et affiche des messages clairs à l'utilisateur !**
