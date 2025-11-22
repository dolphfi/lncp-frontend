/**
 * =====================================================
 * COMPOSANT VUE HORAIRES ADMIN (PAR SALLE)
 * =====================================================
 * Affichage calendrier des horaires par salle avec le même design que MySchedule
 * Accès: ADMIN, DIRECTOR, SUPER_ADMIN
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

import { useScheduleStore } from '../../../stores/scheduleStore';
import { Schedule, DayOfWeek, VacationType, TimeSlot } from '../../../types/schedule';
import { Course } from '../../../types/course';
import { DAY_OF_WEEK_OPTIONS, VACATION_OPTIONS } from '../../../schemas/scheduleSchema';
import { classroomService } from '../../../services/classroomService';
import { courseService } from '../../../services/courses/courseService';
import noteService from '../../../services/notes/noteService';
import { MobileScheduleView } from './MobileScheduleView';
import { AddSlotDialog } from './AddSlotDialog';

// Constantes pour la vue calendrier
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7h à 17h
const DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DAYS_FULL: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

interface AdminScheduleViewProps {
  classrooms: any[];
  selectedClassroom: string | null;
  onClassroomChange: (classroomId: string) => void;
}

/**
 * Vue Calendrier pour Administrateurs (organisée par classe)
 */
export const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  classrooms,
  selectedClassroom,
  onClassroomChange
}) => {
  const {
    schedules,
    loading,
    fetchSchedulesByRoom,
    createSchedule,
    updateSchedule
  } = useScheduleStore();

  // États locaux
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [selectedVacation, setSelectedVacation] = useState<VacationType | 'all'>('all');
  const [mobileDayIndex, setMobileDayIndex] = useState<number>(0);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // États pour le modal d'ajout
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);

  // Charger les cours disponibles pour la classe sélectionnée
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedClassroom) {
        setCourses([]);
        return;
      }

      setLoadingCourses(true);
      try {
        // Utiliser le service de notes qui possède déjà une méthode pour récupérer tous les cours d'une classe
        // (en gérant la pagination si nécessaire)
        const coursesData = await noteService.getAllCoursesWithClassFilter(selectedClassroom);
        setCourses(coursesData);
      } catch (error) {
        console.error('Erreur chargement cours:', error);
        toast.error('Impossible de charger les cours de la classe');
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [selectedClassroom]);

  // Charger les salles quand une classe est sélectionnée
  useEffect(() => {
    if (selectedClassroom) {
      loadRoomsForClassroom();
    } else {
      setRooms([]);
      setSelectedRoom(null);
    }
  }, [selectedClassroom]);

  // Charger les horaires de la salle sélectionnée
  useEffect(() => {
    if (selectedRoom) {
      loadSchedules();
    }
  }, [selectedRoom, selectedDay, selectedVacation]);

  // Charger les salles d'une classe
  const loadRoomsForClassroom = async () => {
    if (!selectedClassroom) return;

    setLoadingRooms(true);
    try {
      // Trouver la classe sélectionnée
      const classroom = classrooms.find(c => c.id === selectedClassroom);
      if (classroom?.rooms && classroom.rooms.length > 0) {
        setRooms(classroom.rooms);
        // Sélectionner la première salle par défaut
        setSelectedRoom(classroom.rooms[0].id);
      } else {
        // Si pas de salles dans l'objet classe, charger les détails de la classe (fallback)
        try {
          const classroomDetails = await classroomService.getById(selectedClassroom);
          if (classroomDetails?.rooms && classroomDetails.rooms.length > 0) {
            setRooms(classroomDetails.rooms);
            setSelectedRoom(classroomDetails.rooms[0].id);
          } else {
            setRooms([]);
            setSelectedRoom(null);
            toast.info('Aucune salle trouvée pour cette classe');
          }
        } catch (err) {
          console.error('Erreur lors du chargement des détails de la classe:', err);
          setRooms([]);
          setSelectedRoom(null);
          toast.info('Impossible de charger les salles');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
      toast.error('Erreur lors du chargement des salles');
      setRooms([]);
      setSelectedRoom(null);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Charger les horaires avec filtres
  const loadSchedules = () => {
    if (!selectedRoom) return;

    const filters: any = {};
    if (selectedDay && selectedDay !== 'all') filters.day = selectedDay;
    if (selectedVacation && selectedVacation !== 'all') filters.vacation = selectedVacation;

    fetchSchedulesByRoom(selectedRoom, filters);
  };

  // Grouper les horaires par jour et période
  const groupedSchedules = React.useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};

    schedules.forEach(schedule => {
      // Filtrer par salle si une salle est sélectionnée (sécurité)
      const scheduleRoomId = schedule.roomId || schedule.room?.id;
      if (selectedRoom && scheduleRoomId !== selectedRoom) {
        return;
      }

      const key = `${schedule.dayOfWeek}-${schedule.vacation}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });

    return grouped;
  }, [schedules, selectedRoom]);

  // Obtenir les créneaux d'un jour/période spécifique
  const getTimeSlotsForDayAndVacation = (day: DayOfWeek, vacation: VacationType): TimeSlot[] => {
    const key = `${day}-${vacation}`;
    const schedules = groupedSchedules[key] || [];
    
    const allSlots = schedules.flatMap(s => s.timeSlots);
    return allSlots.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  };

  // Obtenir la couleur du badge selon le jour
  const getDayColor = (day: DayOfWeek) => {
    const colors: Record<DayOfWeek, string> = {
      LUNDI: 'border-l-blue-500',
      MARDI: 'border-l-green-500',
      MERCREDI: 'border-l-yellow-500',
      JEUDI: 'border-l-purple-500',
      VENDREDI: 'border-l-pink-500',
      SAMEDI: 'border-l-orange-500',
      DIMANCHE: 'border-l-red-500'
    };
    return colors[day] || 'border-l-gray-500';
  };

  // Obtenir les couleurs pour les cours
  const getCourseColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-white' },
      { bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-white' },
      { bg: 'bg-cyan-600', border: 'border-cyan-700', text: 'text-white' },
      { bg: 'bg-orange-600', border: 'border-orange-700', text: 'text-white' },
      { bg: 'bg-rose-600', border: 'border-rose-700', text: 'text-white' },
      { bg: 'bg-teal-600', border: 'border-teal-700', text: 'text-white' },
      { bg: 'bg-sky-600', border: 'border-sky-700', text: 'text-white' },
    ];
    return colors[index % colors.length];
  };

  // Convertir l'heure en position dans la grille
  const getTimePosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours - 7) * 60 + minutes;
  };

  // Calculer la hauteur en fonction de la durée
  const getSlotHeight = (startTime: string, endTime: string): number => {
    const start = getTimePosition(startTime);
    const end = getTimePosition(endTime);
    return end - start;
  };

  // Obtenir tous les créneaux pour une journée spécifique
  const getDaySlots = (day: DayOfWeek): TimeSlot[] => {
    const morningSlots = getTimeSlotsForDayAndVacation(day, 'Matin (AM)');
    const afternoonSlots = getTimeSlotsForDayAndVacation(day, 'Après-midi (PM)');
    return [...morningSlots, ...afternoonSlots].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  };

  // Navigation mobile
  const currentMobileDay = DAYS_FULL[mobileDayIndex];
  const mobileDaySlots = getDaySlots(currentMobileDay);

  const handlePreviousDay = () => {
    setMobileDayIndex((prev) => (prev > 0 ? prev - 1 : DAYS_FULL.length - 1));
  };

  const handleNextDay = () => {
    setMobileDayIndex((prev) => (prev < DAYS_FULL.length - 1 ? prev + 1 : 0));
  };

  // Trouver la classe sélectionnée
  const currentClassroom = classrooms.find(c => c.id === selectedClassroom);

  // Gestion du clic sur une cellule pour ajouter un créneau
  const handleCellClick = (day: DayOfWeek, hour: number) => {
    if (!selectedRoom || !selectedClassroom) {
      toast.info('Veuillez sélectionner une classe et une salle');
      return;
    }

    // Formatage de l'heure (ex: "08:00")
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setSelectedSlotInfo({
      day,
      startTime,
      endTime
    });
    setIsAddSlotOpen(true);
  };

  // Enregistrement du créneau
  const handleSaveSlot = async (data: { 
    courseId: string; 
    teacherId?: string; 
    startTime: string; 
    endTime: string;
    type: 'COURSE' | 'BREAK' | 'LUNCH' | 'STUDY';
  }) => {
    if (!selectedSlotInfo || !selectedRoom || !selectedClassroom) return;
    
    setSavingSlot(true);
    try {
      // Déterminer la vacation (Matin < 12h, PM >= 12h)
      const startHour = parseInt(data.startTime.split(':')[0]);
      const vacation: VacationType = startHour < 12 ? 'Matin (AM)' : 'Après-midi (PM)';
      
      // Chercher si un horaire existe déjà pour ce jour/salle/classe/période
      const existingSchedule = schedules.find(s => 
        s.dayOfWeek === selectedSlotInfo.day && 
        s.vacation === vacation &&
        (s.roomId === selectedRoom || s.room?.id === selectedRoom)
      );

      const newSlot: any = {
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        // Pour les cours, on ajoute les infos course
        ...(data.type === 'COURSE' ? {
          courseId: data.courseId,
          teacherId: data.teacherId
        } : {})
      };

      if (existingSchedule) {
        // Mise à jour de l'horaire existant
        // On ajoute le nouveau slot à la liste existante
        const updatedSlots = [...existingSchedule.timeSlots, newSlot];
        
        await updateSchedule(existingSchedule.id, {
          timeSlots: updatedSlots
        });
      } else {
        // Création d'un nouvel horaire
        await createSchedule({
          name: `Horaire ${selectedSlotInfo.day} ${vacation}`,
          dayOfWeek: selectedSlotInfo.day,
          vacation: vacation,
          classroomId: selectedClassroom,
          roomId: selectedRoom,
          timeSlots: [newSlot]
        });
      }
      
      setIsAddSlotOpen(false);
      // Rafraîchir les données
      loadSchedules();
      
    } catch (error) {
      console.error('Erreur sauvegarde créneau:', error);
      toast.error('Erreur lors de l\'enregistrement du créneau');
    } finally {
      setSavingSlot(false);
    }
  };

  // Vérifier si une case est occupée par un cours qui a commencé avant (pour ne pas afficher le fond blanc)
  const isSlotOccupied = (day: DayOfWeek, hour: number): boolean => {
    const daySlots = getDaySlots(day);
    return daySlots.some(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      // Si le cours finit à pile l'heure (ex: 15:00), la case de 15h n'est pas occupée
      // Si le cours finit à 15:30, la case de 15h est occupée
      const endMinutes = parseInt(slot.endTime.split(':')[1]);
      const realEndHour = endMinutes > 0 ? endHour + 1 : endHour;

      // La case H est occupée si le cours commence AVANT H et finit APRES H
      return startHour < hour && hour < realEndHour;
    });
  };

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {/* En-tête avec sélection de classe */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Emploi du Temps par Salle
          </h2>
          {currentClassroom && selectedRoom && (
            <p className="text-xs sm:text-sm text-gray-600">
              {currentClassroom.name} - {rooms.find(r => r.id === selectedRoom)?.name || 'Salle'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSchedules()}
            disabled={loading || !selectedRoom}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''} sm:mr-1.5`} />
            <span className="hidden sm:inline text-xs">Actualiser</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Export PDF à venir')}
            className="hidden sm:flex h-7 px-2"
          >
            <Download className="h-3 w-3 sm:mr-1.5" />
            <span className="text-xs">PDF</span>
          </Button>
        </div>
      </div>

      {/* Sélection de la classe et de la salle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5" />
            Sélection Classe et Salle
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Sélection de la classe */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Classe</label>
              <Select
                value={selectedClassroom || ''}
                onValueChange={onClassroomChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe..." />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map(classroom => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} {classroom.niveau ? `- ${classroom.niveau}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection de la salle */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Salle</label>
              <Select
                value={selectedRoom || ''}
                onValueChange={setSelectedRoom}
                disabled={!selectedClassroom || loadingRooms || rooms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRooms ? 'Chargement...' : rooms.length === 0 ? 'Aucune salle' : 'Sélectionnez une salle...'} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {room.name} {room.capacity ? `(${room.capacity} places)` : ''}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedClassroom && (
                <p className="text-xs text-gray-500">Sélectionnez d'abord une classe</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres - Cachés sur mobile */}
      <Card className="hidden sm:block">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Filter className="h-3.5 w-3.5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jour de la semaine</label>
              <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value as DayOfWeek | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les jours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les jours</SelectItem>
                  {DAY_OF_WEEK_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={selectedVacation} onValueChange={(value) => setSelectedVacation(value as VacationType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  {VACATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendrier hebdomadaire */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Calendrier de la Semaine</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs hidden sm:block">
            Emploi du temps de la classe
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 sm:px-4 pb-2 sm:pb-4">
          {!selectedClassroom ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Sélectionnez une classe</p>
              <p className="text-gray-400 text-sm mt-2">
                Choisissez une classe pour voir les salles disponibles
              </p>
            </div>
          ) : !selectedRoom ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Sélectionnez une salle</p>
              <p className="text-gray-400 text-sm mt-2">
                {loadingRooms ? 'Chargement des salles...' : rooms.length === 0 ? 'Aucune salle disponible pour cette classe' : 'Choisissez une salle pour voir son emploi du temps'}
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Chargement de l'horaire...</span>
            </div>
          ) : (
            <>
              {/* VUE MOBILE - Style Android */}
              <MobileScheduleView
                currentDay={currentMobileDay}
                dayIndex={mobileDayIndex}
                daySlots={mobileDaySlots}
                daysShort={DAYS_SHORT}
                onPreviousDay={handlePreviousDay}
                onNextDay={handleNextDay}
                getCourseColor={getCourseColor}
              />

              {/* VUE CALENDRIER - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Grille de calendrier */}
                  <div className="grid grid-cols-8 border rounded-lg overflow-hidden">
                    {/* En-tête - Colonne des heures */}
                    <div className="bg-gray-50 border-r font-medium text-center py-1 text-[10px] text-gray-600">
                      Heure
                    </div>
                    
                    {/* En-têtes des jours */}
                    {DAYS_FULL.map((day, dayIndex) => {
                      const slots = getDaySlots(day);
                      return (
                        <div
                          key={day}
                          className={`bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-center py-1 border-r last:border-r-0`}
                        >
                          <div className="font-semibold text-[10px]">{DAYS_SHORT[dayIndex]}</div>
                          <div className="text-[8px] opacity-90">{slots.length}</div>
                        </div>
                      );
                    })}

                    {/* Lignes des heures */}
                    {HOURS.map((hour) => (
                      <React.Fragment key={hour}>
                        {/* Colonne de l'heure */}
                        <div className="border-r border-t bg-gray-50 px-0.5 py-1 text-[9px] font-medium text-gray-500 text-center">
                          {hour}h
                        </div>
                        
                        {/* Colonnes des jours */}
                        {DAYS_FULL.map((day, dayIndex) => {
                          const daySlots = getDaySlots(day);
                          const hourSlots = daySlots.filter(slot => {
                            const startHour = parseInt(slot.startTime.split(':')[0]);
                            return startHour === hour;
                          });
                          
                          const isOccupied = isSlotOccupied(day, hour);

                          return (
                            <div
                              key={`${day}-${hour}`}
                              onClick={() => !isOccupied && handleCellClick(day, hour)}
                              className={`
                                border-r border-t last:border-r-0 min-h-[45px] p-0.5 relative group
                                ${isOccupied ? 'bg-transparent border-t-transparent pointer-events-none' : 'bg-white hover:bg-blue-50 cursor-pointer transition-colors'}
                              `}
                            >
                              {/* Indication visuelle de l'ajout (seulement si case vide et non occupée) */}
                              {hourSlots.length === 0 && !isOccupied && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <span className="text-blue-300 text-lg font-bold">+</span>
                                </div>
                              )}

                              {hourSlots.map((slot, slotIndex) => {
                                const color = getCourseColor(daySlots.indexOf(slot));
                                const duration = getSlotHeight(slot.startTime, slot.endTime);
                                const heightClass = duration <= 60 ? 'h-10' : duration <= 120 ? 'h-20' : 'h-32';
                                
                                // Calcul de la hauteur en pixels (approximatif : 45px par heure + marges)
                                // Une heure = 45px. Donc hauteur = (duration / 60) * 45 + ajustements
                                const pixelHeight = (duration / 60) * 45 + (Math.floor(duration/60) - 1); 
                                
                                return (
                                  <div
                                    key={slotIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Édition du slot
                                      toast.info('Modification à venir');
                                    }}
                                    className={`${color.bg} ${color.border} ${color.text} rounded p-1 mb-0.5 border-l-2 shadow-sm hover:shadow transition-all cursor-pointer overflow-hidden absolute left-0.5 right-0.5 z-10`}
                                    style={{ height: `${pixelHeight}px`, minHeight: `${heightClass}` }}
                                    title={`${slot.courseName}\n${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}\nProf: ${slot.teacherName || 'N/A'}\n${slot.roomName || ''}`}
                                  >
                                    <div className="text-[8px] font-bold mb-0.5 truncate leading-tight">
                                      {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                                    </div>
                                    <div className="text-[9px] font-semibold truncate leading-tight">
                                      {slot.courseName || 'Cours'}
                                    </div>
                                    {slot.teacherName && (
                                      <div className="text-[8px] opacity-90 truncate mt-0.5">
                                        Prof: {slot.teacherName}
                                      </div>
                                    )}
                                    {slot.roomName && (
                                      <div className="text-[8px] opacity-90 truncate">
                                        {slot.roomName}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dialog d'ajout de créneau */}
              {selectedSlotInfo && (
                <AddSlotDialog
                  isOpen={isAddSlotOpen}
                  onClose={() => setIsAddSlotOpen(false)}
                  onSave={handleSaveSlot}
                  day={selectedSlotInfo.day}
                  startTime={selectedSlotInfo.startTime}
                  endTime={selectedSlotInfo.endTime}
                  courses={courses}
                  isLoading={savingSlot}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-600">
                Total cours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {schedules.reduce((sum, s) => sum + s.timeSlots.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-600">
                Jours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-lg sm:text-xl font-bold text-emerald-600">
                {new Set(schedules.map(s => s.dayOfWeek)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-600">
                Professeurs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-lg sm:text-xl font-bold text-cyan-600">
                {new Set(schedules.flatMap(s => s.timeSlots.map(t => t.teacherId)).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminScheduleView;
