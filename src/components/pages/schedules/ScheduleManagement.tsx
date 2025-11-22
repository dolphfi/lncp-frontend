/**
 * =====================================================
 * COMPOSANT DE GESTION DES HORAIRES
 * =====================================================
 * Interface complète pour la gestion des emplois du temps
 * Accès: ADMIN, DIRECTOR
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  RefreshCw,
  X,
  AlertCircle,
  MapPin,
  Users,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

import { useScheduleStore } from '../../../stores/scheduleStore';
import { Schedule, DayOfWeek, VacationType } from '../../../types/schedule';
import { DAY_OF_WEEK_OPTIONS, VACATION_OPTIONS, CreateScheduleFormData } from '../../../schemas/scheduleSchema';
import ScheduleForm from '../../forms/ScheduleForm';
import AdminScheduleView from './AdminScheduleView';
import noteService from '../../../services/notes/noteService';

/**
 * Page de gestion des horaires (ADMIN/DIRECTOR)
 */
export const ScheduleManagement: React.FC = () => {
  const {
    schedules,
    loading,
    error,
    loadingAction,
    filters,
    stats,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setFilters,
    clearFilters,
    clearError
  } = useScheduleStore();

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);

  // Charger les classes disponibles
  useEffect(() => {
    const loadClassrooms = async () => {
      setLoadingClassrooms(true);
      try {
        const data = await noteService.getAllClassrooms();
        setClassrooms(data);
        // Sélectionner la première classe par défaut
        if (data.length > 0) {
          setSelectedClassroom(data[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        toast.error('Impossible de charger les classes');
      } finally {
        setLoadingClassrooms(false);
      }
    };
    loadClassrooms();
  }, []);

  // Charger les horaires au montage
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Gestion de la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  };

  // Gestion des filtres
  const handleDayFilter = (day: string) => {
    setFilters({ day: day as DayOfWeek });
  };

  const handleVacationFilter = (vacation: string) => {
    setFilters({ vacation: vacation as VacationType });
  };

  // Afficher les détails
  const handleViewDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDetailsDialogOpen(true);
  };

  // Créer un horaire
  const handleCreateSchedule = async (data: CreateScheduleFormData) => {
    try {
      await createSchedule(data);
      setIsCreateDialogOpen(false);
      toast.success('Horaire créé avec succès !');
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  };

  // Modifier un horaire
  const handleEditSchedule = (schedule: Schedule) => {
    setScheduleToEdit(schedule);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = async (data: CreateScheduleFormData) => {
    if (!scheduleToEdit) return;

    try {
      await updateSchedule(scheduleToEdit.id, data);
      setIsEditDialogOpen(false);
      setScheduleToEdit(null);
      toast.success('Horaire mis à jour avec succès !');
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  };

  // Supprimer un horaire
  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule(scheduleToDelete.id);
      setIsDeleteDialogOpen(false);
      setScheduleToDelete(null);
      toast.success('Horaire supprimé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'horaire');
    }
  };

  // Obtenir le badge de couleur pour le jour
  const getDayBadgeColor = (day: DayOfWeek) => {
    const colors: Record<DayOfWeek, string> = {
      LUNDI: 'bg-blue-100 text-blue-800',
      MARDI: 'bg-green-100 text-green-800',
      MERCREDI: 'bg-yellow-100 text-yellow-800',
      JEUDI: 'bg-purple-100 text-purple-800',
      VENDREDI: 'bg-pink-100 text-pink-800',
      SAMEDI: 'bg-orange-100 text-orange-800',
      DIMANCHE: 'bg-red-100 text-red-800'
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  // Obtenir le badge de couleur pour la période
  const getVacationBadgeColor = (vacation: VacationType) => {
    return vacation === 'Matin (AM)' 
      ? 'bg-amber-100 text-amber-800' 
      : 'bg-indigo-100 text-indigo-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Gestion des Horaires</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Créez et gérez les emplois du temps des classes
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => fetchSchedules()}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouvel Horaire</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Horaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Matin (AM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.byVacation['Matin (AM)'] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Après-midi (PM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {stats.byVacation['Après-midi (PM)'] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Créneaux moyens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageTimeSlotsPerSchedule.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recherche et Filtres</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Masquer' : 'Afficher'} les filtres
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Jour de la semaine</Label>
                <Select onValueChange={handleDayFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les jours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les jours</SelectItem>
                    {DAY_OF_WEEK_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Période</Label>
                <Select onValueChange={handleVacationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les périodes</SelectItem>
                    {VACATION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters();
                    setSearchTerm('');
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun horaire trouvé</p>
            </div>
          ) : (
            <>
              {/* Vue Desktop - Tableau */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Jour</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Créneaux</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.name}
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getDayBadgeColor(schedule.dayOfWeek)}>
                            {DAY_OF_WEEK_OPTIONS.find(d => d.value === schedule.dayOfWeek)?.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getVacationBadgeColor(schedule.vacation)}>
                            {schedule.vacation}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            {schedule.classroom?.name || schedule.classroomId}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {schedule.room?.name || schedule.roomId}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">
                            {schedule.timeSlots.length} créneau(x)
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(schedule)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSchedule(schedule)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setScheduleToDelete(schedule);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vue Mobile - Cartes */}
              <div className="md:hidden space-y-3">
                {schedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {schedule.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(schedule)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSchedule(schedule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setScheduleToDelete(schedule);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getDayBadgeColor(schedule.dayOfWeek)} text-xs`}>
                          {DAY_OF_WEEK_OPTIONS.find(d => d.value === schedule.dayOfWeek)?.label}
                        </Badge>
                        <Badge className={`${getVacationBadgeColor(schedule.vacation)} text-xs`}>
                          {schedule.vacation}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {schedule.timeSlots.length} créneau(x)
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{schedule.classroom?.name || schedule.classroomId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{schedule.room?.name || schedule.roomId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog des détails */}
      {selectedSchedule && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedSchedule.name}
              </DialogTitle>
              <DialogDescription>
                Détails de l'emploi du temps
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-gray-600">Jour</Label>
                  <p className="font-medium">
                    {DAY_OF_WEEK_OPTIONS.find(d => d.value === selectedSchedule.dayOfWeek)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Période</Label>
                  <p className="font-medium">{selectedSchedule.vacation}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Classe</Label>
                  <p className="font-medium">
                    {selectedSchedule.classroom?.name || selectedSchedule.classroomId}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Salle</Label>
                  <p className="font-medium">
                    {selectedSchedule.room?.name || selectedSchedule.roomId}
                  </p>
                </div>
              </div>

              {/* Créneaux horaires */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">
                  Créneaux horaires ({selectedSchedule.timeSlots.length})
                </Label>
                <div className="space-y-2">
                  {selectedSchedule.timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {slot.courseName || slot.courseId}
                          </p>
                        </div>
                      </div>
                      {slot.teacherName && (
                        <Badge variant="outline">{slot.teacherName}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de création d'horaire */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer un Nouvel Horaire
            </DialogTitle>
            <DialogDescription>
              Créez un nouvel emploi du temps pour une classe
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            onSubmit={handleCreateSchedule}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={loadingAction === 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de modification d'horaire */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier l'Horaire
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de cet emploi du temps
            </DialogDescription>
          </DialogHeader>
          {scheduleToEdit && (
            <ScheduleForm
              schedule={scheduleToEdit}
              onSubmit={handleUpdateSchedule}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setScheduleToEdit(null);
              }}
              isLoading={loadingAction === 'update'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'horaire "{scheduleToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setScheduleToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSchedule}
              disabled={loadingAction === 'delete'}
            >
              {loadingAction === 'delete' ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Affichage des erreurs */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
