/**
 * =====================================================
 * COMPOSANT MON HORAIRE (VUE PERSONNELLE)
 * =====================================================
 * Affichage de l'emploi du temps personnel
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

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Mon Emploi du Temps</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {currentUser?.firstName} {currentUser?.lastName} - {currentUser?.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => loadSchedule()}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('Export PDF à venir')}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exporter PDF</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <CardDescription>
            Filtrez votre emploi du temps par jour ou période
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <CardHeader>
          <CardTitle>Calendrier de la Semaine</CardTitle>
          <CardDescription>
            Votre emploi du temps hebdomadaire
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-6">
              {/* Tableau par jour */}
              {DAY_OF_WEEK_OPTIONS.map(dayOption => {
                // Ignorer si filtre actif et pas le bon jour
                if (selectedDay && selectedDay !== 'all' && selectedDay !== dayOption.value) return null;

                const morningSlots = getTimeSlotsForDayAndVacation(dayOption.value as DayOfWeek, 'Matin (AM)');
                const afternoonSlots = getTimeSlotsForDayAndVacation(dayOption.value as DayOfWeek, 'Après-midi (PM)');

                // Ignorer les jours sans créneaux
                if (morningSlots.length === 0 && afternoonSlots.length === 0) return null;

                return (
                  <div key={dayOption.value} className="border rounded-lg overflow-hidden">
                    {/* En-tête du jour */}
                    <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 border-l-4 ${getDayColor(dayOption.value as DayOfWeek)}`}>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                          {dayOption.label}
                        </h3>
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs sm:text-sm whitespace-nowrap">
                          {morningSlots.length + afternoonSlots.length} cours
                        </Badge>
                      </div>
                    </div>

                    {/* Créneaux du matin */}
                    {(selectedVacation === 'all' || selectedVacation === 'Matin (AM)') && morningSlots.length > 0 && (
                      <div className="p-3 sm:p-4 bg-amber-50/50">
                        <h4 className="text-sm sm:text-base font-medium text-amber-900 mb-2 sm:mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Matin (AM)
                        </h4>
                        <div className="space-y-2">
                          {morningSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="bg-white p-2 sm:p-3 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                    <Badge className="bg-amber-600 text-white text-xs whitespace-nowrap w-fit">
                                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                    </Badge>
                                    <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                      {slot.courseName || 'Cours'}
                                    </span>
                                  </div>
                                  {slot.teacherName && (
                                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                                      <Users className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </p>
                                  )}
                                </div>
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Créneaux de l'après-midi */}
                    {(selectedVacation === 'all' || selectedVacation === 'Après-midi (PM)') && afternoonSlots.length > 0 && (
                      <div className="p-3 sm:p-4 bg-indigo-50/50">
                        <h4 className="text-sm sm:text-base font-medium text-indigo-900 mb-2 sm:mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Après-midi (PM)
                        </h4>
                        <div className="space-y-2">
                          {afternoonSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="bg-white p-2 sm:p-3 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                    <Badge className="bg-indigo-600 text-white text-xs whitespace-nowrap w-fit">
                                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                    </Badge>
                                    <span className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                      {slot.courseName || 'Cours'}
                                    </span>
                                  </div>
                                  {slot.teacherName && (
                                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                                      <Users className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </p>
                                  )}
                                </div>
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {mySchedule.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {mySchedule.reduce((sum, s) => sum + s.timeSlots.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Jours de cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Set(mySchedule.map(s => s.dayOfWeek)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Classes concernées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
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
