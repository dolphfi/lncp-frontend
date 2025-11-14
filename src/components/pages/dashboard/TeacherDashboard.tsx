/**
 * =====================================================
 * DASHBOARD PROFESSEUR
 * =====================================================
 * Vue d'ensemble pour les enseignants avec cours, emploi du temps et notes
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
import { Button } from '../../ui/button';
import { useDashboardStore } from '../../../stores/dashboardStore';
import DashboardHeader from '../../includes/DashboardHeader';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Professeur
 */
export const TeacherDashboard: React.FC = () => {
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
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si les données ne sont pas disponibles
  if (!teacherData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune donnée disponible</p>
            <p className="text-gray-400 text-sm mt-2">
              {error || "Impossible de charger vos informations"}
            </p>
          </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Contenu principal */}
      <div className="flex justify-center px-4 py-8 pb-24 md:pb-8">
        <div className="w-full max-w-7xl space-y-6">
          {/* Bienvenue */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Bienvenue, Prof. {teacherInfo.firstName} {teacherInfo.lastName}
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Code: {teacherInfo.code} • {statistics.totalCourses} cours assignés
                </p>
              </div>
              <GraduationCap className="h-16 w-16 opacity-20" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Mes Cours
                    </CardTitle>
                    <CardDescription>
                      Cours que vous enseignez actuellement
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/academic/courses')}
                  >
                    Voir tous
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {course.titre}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {course.code}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {course.classroom.name}
                            </span>
                            <span>•</span>
                            <span>{course.categorie}</span>
                            <span>•</span>
                            <span className="font-medium">
                              Pondération: {course.ponderation}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={course.statut === 'Actif' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {course.statut}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun cours assigné</p>
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
                          className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm text-gray-900">{day}</p>
                            <p className="text-xs text-gray-600">{period}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {totalSlots} cours
                            </Badge>
                            <Clock className="h-4 w-4 text-indigo-600" />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate('/schedules/my-schedule')}
                    >
                      Voir l'emploi du temps complet
                    </Button>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Notes récentes
                  </CardTitle>
                  <CardDescription>
                    Notes en attente et validées
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/academic/notes')}
                >
                  Gérer les notes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Notes en attente */}
                {pendingNotes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      En attente de validation ({pendingNotes.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingNotes.slice(0, 3).map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {note.student.user.firstName} {note.student.user.lastName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {note.course.titre} • {note.trimestre}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-white">
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
                    <h3 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Validées récemment ({approvedNotes.length})
                    </h3>
                    <div className="space-y-2">
                      {approvedNotes.slice(0, 3).map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {note.student.user.firstName} {note.student.user.lastName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {note.course.titre} • {note.trimestre}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {note.note}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingNotes.length === 0 && approvedNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune note disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
