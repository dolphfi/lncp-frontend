/**
 * =====================================================
 * COMPOSANT MON HORAIRE (VUE PERSONNELLE)
 * =====================================================
 * Affichage de l'emploi du temps personnel sous forme de calendrier moderne
 * Accès: TEACHER, STUDENT
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
import { DAY_OF_WEEK_OPTIONS, VACATION_OPTIONS } from '../../../schemas/scheduleSchema';
import authService from '../../../services/authService';
import { MobileScheduleView } from './MobileScheduleView';

// Constantes pour la vue calendrier
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7h à 17h
const DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DAYS_FULL: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

/**
 * Page Mon Horaire (TEACHER/STUDENT)
 */
export const MySchedule: React.FC = () => {
  const {
    mySchedule,
    loading,
    fetchMySchedule
  } = useScheduleStore();

  // États locaux
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [selectedVacation, setSelectedVacation] = useState<VacationType | 'all'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileDayIndex, setMobileDayIndex] = useState<number>(0); // Index du jour actuel sur mobile

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);
  }, []);

  // Charger l'horaire au montage
  useEffect(() => {
    loadSchedule();
  }, []);

  // Charger l'horaire avec filtres
  const loadSchedule = () => {
    const filters: any = {};
    if (selectedDay && selectedDay !== 'all') filters.day = selectedDay;
    if (selectedVacation && selectedVacation !== 'all') filters.vacation = selectedVacation;

    fetchMySchedule(filters);
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    loadSchedule();
  }, [selectedDay, selectedVacation]);

  // Grouper les horaires par jour et période
  const groupedSchedules = React.useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};

    mySchedule.forEach(schedule => {
      const key = `${schedule.dayOfWeek}-${schedule.vacation}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });

    return grouped;
  }, [mySchedule]);

  // Obtenir les créneaux d'un jour/période spécifique
  const getTimeSlotsForDayAndVacation = (day: DayOfWeek, vacation: VacationType): TimeSlot[] => {
    const key = `${day}-${vacation}`;
    const schedules = groupedSchedules[key] || [];
    
    // Combiner tous les créneaux et les trier
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

  // Obtenir les couleurs pour les cours selon l'index (sans mauve)
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
    return (hours - 7) * 60 + minutes; // Minutes depuis 7h
  };

  // Calculer la hauteur en fonction de la durée
  const getSlotHeight = (startTime: string, endTime: string): number => {
    const start = getTimePosition(startTime);
    const end = getTimePosition(endTime);
    return end - start; // Durée en minutes
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

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 p-2 sm:p-3 md:p-4 lg:p-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSchedule()}
            disabled={loading}
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
            Votre emploi du temps hebdomadaire
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 sm:px-4 pb-2 sm:pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Chargement de votre horaire...</span>
            </div>
          ) : mySchedule.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun horaire trouvé</p>
              <p className="text-gray-400 text-sm mt-2">
                Votre emploi du temps n'a pas encore été créé
              </p>
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

                            return (
                              <div
                                key={`${day}-${hour}`}
                                className="border-r border-t last:border-r-0 min-h-[45px] p-0.5 bg-white hover:bg-gray-50 transition-colors relative"
                              >
                                {hourSlots.map((slot, slotIndex) => {
                                  const color = getCourseColor(daySlots.indexOf(slot));
                                  const duration = getSlotHeight(slot.startTime, slot.endTime);
                                  const heightClass = duration <= 60 ? 'h-10' : duration <= 120 ? 'h-20' : 'h-32';
                                  
                                  return (
                                    <div
                                      key={slotIndex}
                                      className={`${color.bg} ${color.border} ${color.text} ${heightClass} rounded p-1 mb-0.5 border-l-2 shadow-sm hover:shadow transition-all cursor-pointer overflow-hidden`}
                                      title={`${slot.courseName}\n${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}\n${slot.teacherName || ''}`}
                                    >
                                      <div className="text-[8px] font-bold mb-0.5 truncate leading-tight">
                                        {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                                      </div>
                                      <div className="text-[9px] font-semibold truncate leading-tight">
                                        {slot.courseName || 'Cours'}
                                      </div>
                                      {slot.teacherName && duration > 60 && (
                                        <div className="text-[8px] opacity-90 truncate mt-0.5">
                                          {slot.teacherName}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {mySchedule.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-600">
                Total cours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {mySchedule.reduce((sum, s) => sum + s.timeSlots.length, 0)}
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
                {new Set(mySchedule.map(s => s.dayOfWeek)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-gray-600">
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-lg sm:text-xl font-bold text-cyan-600">
                {new Set(mySchedule.map(s => s.classroomId)).size}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MySchedule;
