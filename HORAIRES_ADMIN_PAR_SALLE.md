# Gestion des Horaires Admin - Vue Calendrier par Salle

## 🎯 Objectif Final

Afficher les horaires pour les administrateurs **organisés par salle** avec un workflow en 2 étapes :
1. **Sélectionner une classe** → Charge les salles de cette classe
2. **Sélectionner une salle** → Affiche l'horaire de cette salle

**Salle par défaut** : La première salle de la classe est automatiquement sélectionnée.

---

## ✅ Solution implémentée

### **Workflow utilisateur**

```
┌──────────────────┐
│ Sélection Classe │  →  Charge les salles  →  Première salle par défaut
└──────────────────┘
         ↓
┌──────────────────┐
│ Sélection Salle  │  →  Affiche l'horaire de la salle
└──────────────────┘
         ↓
┌──────────────────┐
│ Vue Calendrier   │  →  Horaire hebdomadaire de la salle
└──────────────────┘
```

---

## 📊 Interface

### **1. Card de sélection (2 colonnes)**

```typescript
<Card>
  <CardHeader>Sélection Classe et Salle</CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Colonne 1 : Classe */}
      <Select value={selectedClassroom}>
        {classrooms.map(classroom => (
          <SelectItem>{classroom.name}</SelectItem>
        ))}
      </Select>

      {/* Colonne 2 : Salle */}
      <Select 
        value={selectedRoom} 
        disabled={!selectedClassroom || loadingRooms}
      >
        {rooms.map(room => (
          <SelectItem>
            <MapPin /> {room.name} ({room.capacity} places)
          </SelectItem>
        ))}
      </Select>
    </div>
  </CardContent>
</Card>
```

**États du select de salle** :
- ✅ **Classe non sélectionnée** : Désactivé avec message "Sélectionnez d'abord une classe"
- ⏳ **Chargement des salles** : Désactivé avec texte "Chargement..."
- ❌ **Aucune salle** : Désactivé avec texte "Aucune salle"
- ✅ **Salles disponibles** : Activé avec liste des salles

---

### **2. Vue Calendrier**

**3 états possibles** :

#### **État 1 : Aucune classe sélectionnée**
```
┌──────────────────────────┐
│  👥 Icône Users (grise)  │
│  "Sélectionnez une classe" │
│  "Choisissez une classe pour voir les salles disponibles" │
└──────────────────────────┘
```

#### **État 2 : Classe sélectionnée, aucune salle**
```
┌──────────────────────────┐
│  📍 Icône MapPin (grise) │
│  "Sélectionnez une salle" │
│  "Choisissez une salle pour voir son emploi du temps" │
│  OU "Aucune salle disponible pour cette classe" │
└──────────────────────────┘
```

#### **État 3 : Salle sélectionnée → Calendrier**
```
┌─────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  Heure  │  LUN   │  MAR   │  MER   │  JEU   │  VEN   │  SAM   │  DIM   │
├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│   7h    │        │ [Cours]│        │ [Cours]│        │        │        │
│   8h    │ [Cours]│ [Cours]│ [Cours]│ [Cours]│ [Cours]│        │        │
│  ...    │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │
└─────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

---

## 🔄 Logique de chargement

### **1. Chargement des classes (ScheduleManagement.tsx)**

```typescript
useEffect(() => {
  const loadClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const data = await noteService.getAllClassrooms(); // Inclut les rooms
      setClassrooms(data);
      if (data.length > 0) {
        setSelectedClassroom(data[0].id); // Première classe par défaut
      }
    } finally {
      setLoadingClassrooms(false);
    }
  };
  loadClassrooms();
}, []);
```

**Endpoint** : `GET /classroom/all-classroom?page=1&limit=100`

**Réponse attendue** :
```json
{
  "data": [
    {
      "id": "class-1",
      "name": "NSI",
      "niveau": "Secondaire",
      "rooms": [
        {
          "id": "room-1",
          "name": "Salle A1",
          "capacity": 30,
          "status": "active"
        },
        {
          "id": "room-2",
          "name": "Salle A2",
          "capacity": 25,
          "status": "active"
        }
      ]
    }
  ]
}
```

---

### **2. Chargement des salles (AdminScheduleView.tsx)**

```typescript
useEffect(() => {
  if (selectedClassroom) {
    loadRoomsForClassroom();
  } else {
    setRooms([]);
    setSelectedRoom(null);
  }
}, [selectedClassroom]);

const loadRoomsForClassroom = async () => {
  setLoadingRooms(true);
  try {
    const classroom = classrooms.find(c => c.id === selectedClassroom);
    if (classroom?.rooms && classroom.rooms.length > 0) {
      setRooms(classroom.rooms);
      setSelectedRoom(classroom.rooms[0].id); // ✅ PREMIÈRE SALLE PAR DÉFAUT
    } else {
      setRooms([]);
      setSelectedRoom(null);
      toast.info('Aucune salle trouvée pour cette classe');
    }
  } finally {
    setLoadingRooms(false);
  }
};
```

**Comportement** :
- ✅ Si la classe a des `rooms[]` → Affiche la liste et sélectionne la première
- ❌ Si pas de `rooms[]` → Message d'information

---

### **3. Chargement de l'horaire (AdminScheduleView.tsx)**

```typescript
useEffect(() => {
  if (selectedRoom) {
    loadSchedules();
  }
}, [selectedRoom, selectedDay, selectedVacation]);

const loadSchedules = () => {
  if (!selectedRoom) return;

  const filters: any = {};
  if (selectedDay && selectedDay !== 'all') filters.day = selectedDay;
  if (selectedVacation && selectedVacation !== 'all') filters.vacation = selectedVacation;

  fetchSchedulesByRoom(selectedRoom, filters); // ✅ PAR SALLE
};
```

**Endpoint** : `GET /schedules/room/{roomId}?day=LUNDI&vacation=Matin (AM)`

---

## 🎨 Affichage des cours

### **Informations affichées sur chaque créneau**

```typescript
<div className="bg-blue-600 rounded p-1">
  {/* Horaire */}
  <div className="text-[8px] font-bold">08:00-09:00</div>
  
  {/* Nom du cours */}
  <div className="text-[9px] font-semibold">Mathématiques</div>
  
  {/* Professeur */}
  <div className="text-[8px] opacity-90">Prof: Jean Dupont</div>
  
  {/* Salle (pas nécessaire car on affiche déjà l'horaire PAR salle) */}
  {/* <div className="text-[8px]">Salle A1</div> */}
</div>
```

**Tooltip** :
```
Mathématiques
08:00 - 09:00
Prof: Jean Dupont
Salle A1
```

---

## 📊 Statistiques

**3 cards en bas du calendrier** :

```typescript
<div className="grid grid-cols-3 gap-2">
  {/* Total cours dans la semaine pour cette salle */}
  <Card>
    <CardTitle>Total cours</CardTitle>
    <div className="text-xl font-bold text-blue-600">
      {schedules.reduce((sum, s) => sum + s.timeSlots.length, 0)}
    </div>
  </Card>

  {/* Jours différents avec cours */}
  <Card>
    <CardTitle>Jours</CardTitle>
    <div className="text-xl font-bold text-emerald-600">
      {new Set(schedules.map(s => s.dayOfWeek)).size}
    </div>
  </Card>

  {/* Professeurs différents utilisant cette salle */}
  <Card>
    <CardTitle>Professeurs</CardTitle>
    <div className="text-xl font-bold text-cyan-600">
      {new Set(schedules.flatMap(s => s.timeSlots.map(t => t.teacherId)).filter(Boolean)).size}
    </div>
  </Card>
</div>
```

---

## 🔧 Modifications apportées

### **Fichiers modifiés**

#### **1. `/services/notes/noteService.ts`**

**Ajout pagination** :
```typescript
async getAllClassrooms(): Promise<any[]> {
  const response = await api.get<any>('/classroom/all-classroom', {
    params: {
      page: 1,
      limit: 100 // ✅ Charger toutes les classes avec leurs salles
    }
  });
  return response.data?.data || response.data || [];
}
```

---

#### **2. `/components/pages/schedules/AdminScheduleView.tsx`**

**Nouveaux états** :
```typescript
const [rooms, setRooms] = useState<any[]>([]);
const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
const [loadingRooms, setLoadingRooms] = useState(false);
```

**Changement API** :
```typescript
// ❌ AVANT : Par classe
fetchSchedulesByClassroom(selectedClassroom, filters);

// ✅ APRÈS : Par salle
fetchSchedulesByRoom(selectedRoom, filters);
```

**Nouvelle interface** :
```typescript
{/* Sélection Classe et Salle */}
<Card>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {/* Select Classe */}
    <Select value={selectedClassroom}>...</Select>
    
    {/* Select Salle (dépend de la classe) */}
    <Select 
      value={selectedRoom} 
      disabled={!selectedClassroom || loadingRooms}
    >
      {rooms.map(room => (
        <SelectItem>
          <MapPin /> {room.name} ({room.capacity} places)
        </SelectItem>
      ))}
    </Select>
  </div>
</Card>
```

---

## 🎯 Workflow complet

### **Scénario 1 : Navigation normale**

1. **Chargement initial** :
   - ✅ Toutes les classes chargées avec leurs salles
   - ✅ Première classe sélectionnée par défaut
   - ✅ Première salle de cette classe sélectionnée par défaut
   - ✅ Horaire de cette salle affiché

2. **Changement de classe** :
   - ✅ Utilisateur sélectionne une autre classe (ex: NSII)
   - ✅ Salles de NSII chargées automatiquement
   - ✅ Première salle de NSII sélectionnée par défaut
   - ✅ Horaire de cette nouvelle salle affiché

3. **Changement de salle** :
   - ✅ Utilisateur sélectionne une autre salle (ex: Salle B2)
   - ✅ Horaire de Salle B2 affiché immédiatement
   - ✅ Classe reste la même (NSII)

---

### **Scénario 2 : Classe sans salles**

1. **Sélection classe** : NSI
2. **Chargement salles** : `classroom.rooms === []`
3. **Résultat** :
   - ❌ Aucune salle disponible
   - 📍 Icône MapPin avec message "Aucune salle disponible pour cette classe"
   - 🔔 Toast informatif : "Aucune salle trouvée pour cette classe"
   - ⏸️ Calendrier vide avec message

---

## 📱 Responsive Design

### **Desktop (md+)**
- ✅ Select Classe et Select Salle côte à côte (2 colonnes)
- ✅ Calendrier complet 8 colonnes
- ✅ Filtres visibles

### **Mobile (sm)**
- ✅ Selects empilés verticalement (1 colonne)
- ✅ Navigation par jour avec flèches
- ✅ Filtres cachés

---

## 🔐 Sécurité

**Validation** :
- ✅ Select salle désactivé si aucune classe sélectionnée
- ✅ Bouton actualiser désactivé si aucune salle sélectionnée
- ✅ Calendrier ne charge que si `selectedRoom !== null`

**Gestion d'erreurs** :
- ✅ Toast en cas d'échec chargement salles
- ✅ Fallback sur liste vide si erreur
- ✅ Messages explicites à chaque étape

---

## ✅ Comparaison Avant/Après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Organisation** | Par classe | ✅ Par salle |
| **Sélection** | 1 select (classe) | ✅ 2 selects (classe + salle) |
| **Défaut** | Première classe | ✅ Première classe + première salle |
| **Endpoint API** | `/schedules/classroom/{id}` | ✅ `/schedules/room/{id}` |
| **Info affichée** | Classe - NSI | ✅ NSI - Salle A1 |
| **Statistiques** | Professeurs de la classe | ✅ Professeurs de la salle |
| **Workflow** | 1 étape | ✅ 2 étapes (classe → salle) |

---

## 📁 Fichiers modifiés

1. ✅ `/services/notes/noteService.ts` (pagination classes)
2. ✅ `/components/pages/schedules/AdminScheduleView.tsx` (logique salle + UI)
3. ✅ `/HORAIRES_ADMIN_PAR_SALLE.md` (cette doc)

---

## 🎉 Résultat final

Les administrateurs peuvent maintenant :
- ✅ **Sélectionner une classe** → Charge les salles automatiquement
- ✅ **Sélectionner une salle** → Affiche l'horaire de cette salle
- ✅ **Première salle par défaut** → Expérience fluide sans clics supplémentaires
- ✅ **Workflow logique** : Classe → Salle → Horaire
- ✅ **Messages clairs** : États vides bien gérés
- ✅ **Design cohérent** : Même interface que MySchedule

**L'interface de gestion des horaires est maintenant organisée par salle avec sélection automatique de la première salle ! 🎉**
