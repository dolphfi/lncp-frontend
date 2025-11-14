/**
 * =====================================================
 * VUE DASHBOARD PROFESSEUR (pour MainDashboard)
 * =====================================================
 * Vue intégrée dans le dashboard principal avec sidebar
 */

import React, { useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  MapPin,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useDashboardStore } from '../../../stores/dashboardStore';
import { useNavigate } from 'react-router-dom';

/**
 * Vue Dashboard Professeur (intégrée dans MainDashboard)
 */
export const TeacherDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    fetchDashboard, 
    getTeacherDashboard, 
    loading, 
    error 
  } = useDashboardStore();

  const teacherData = getTeacherDashboard();

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDashboard();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du chargement des données");
      }
    };

    loadData();
  }, [fetchDashboard]);

  // Afficher le loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si les données ne sont pas disponibles
  if (!teacherData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucune donnée disponible</p>
          <p className="text-gray-400 text-sm mt-2">
            {error || "Impossible de charger vos informations"}
          </p>
        </div>
      </div>
    );
  }

  const { teacherInfo, courses, schedule, pendingNotes, approvedNotes, statistics } = teacherData;

  // Statistiques calculées
  const stats = [
    {
      title: 'Cours assignés',
      value: statistics.totalCourses,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${courses.length} cours actifs`
    },
    {
      title: 'Notes en attente',
      value: statistics.pendingNotesCount,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'À valider'
    },
    {
      title: 'Notes validées',
      value: statistics.approvedNotesCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Ce trimestre'
    }
  ];

  // Grouper l'emploi du temps par jour
  const scheduleByDay = schedule.reduce((acc, sched) => {
    const key = `${sched.dayOfWeek}-${sched.vacation}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(sched);
    return acc;
  }, {} as Record<string, typeof schedule>);

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 truncate">
              Bienvenue, Prof. {teacherInfo.firstName} {teacherInfo.lastName}
            </h1>
            <p className="text-blue-100 text-xs md:text-sm lg:text-base">
              Code: {teacherInfo.code}
            </p>
            <p className="text-blue-100 text-xs md:text-sm lg:text-base">
              {statistics.totalCourses} cours assignés
            </p>
          </div>
          <GraduationCap className="h-12 w-12 md:h-16 md:w-16 opacity-20 flex-shrink-0 ml-2" />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cours assignés */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Mes Cours
            </CardTitle>
            <CardDescription>
              Cours que vous enseignez actuellement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => navigate('/my-courses')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {course.titre}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {course.code}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{course.classroom.name}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{course.categorie}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="font-medium truncate hidden md:inline">
                          Pondération: {course.ponderation}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={course.statut === 'Actif' ? 'default' : 'secondary'}
                      className="mt-2 sm:mt-0 sm:ml-2 self-start sm:self-center"
                    >
                      {course.statut}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">Aucun cours assigné</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emploi du temps rapide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Emploi du temps
            </CardTitle>
            <CardDescription>
              Vue rapide de la semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedule.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(scheduleByDay).slice(0, 5).map(([key, schedules]) => {
                  const [day, period] = key.split('-');
                  const totalSlots = schedules.reduce((sum, s) => sum + s.timeSlots.length, 0);
                  
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 md:p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                      onClick={() => navigate('/schedules/my-schedule')}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-xs md:text-sm text-gray-900 truncate">{day}</p>
                        <p className="text-[10px] md:text-xs text-gray-600 truncate">{period}</p>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-[10px] md:text-xs">
                          {totalSlots} cours
                        </Badge>
                        <Clock className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun horaire disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Notes récentes
          </CardTitle>
          <CardDescription>
            Notes en attente et validées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {/* Notes en attente */}
            {pendingNotes.length > 0 && (
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-orange-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                  En attente de validation ({pendingNotes.length})
                </h3>
                <div className="space-y-2">
                  {pendingNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors gap-2"
                      onClick={() => navigate('/academic/notes')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-sm text-gray-900 truncate">
                          {note.student.user.firstName} {note.student.user.lastName}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-600 truncate">
                          {note.course.titre} • {note.trimestre}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white text-xs self-start sm:self-center">
                        {note.note}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes validées */}
            {approvedNotes.length > 0 && (
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                  Validées récemment ({approvedNotes.length})
                </h3>
                <div className="space-y-2">
                  {approvedNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 md:p-3 bg-green-50 rounded-lg border border-green-200 gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-sm text-gray-900 truncate">
                          {note.student.user.firstName} {note.student.user.lastName}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-600 truncate">
                          {note.course.titre} • {note.trimestre}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white text-xs self-start sm:self-center">
                        {note.note}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingNotes.length === 0 && approvedNotes.length === 0 && (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">Aucune note disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboardView;
