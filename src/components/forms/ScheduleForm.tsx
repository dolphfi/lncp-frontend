/**
 * =====================================================
 * FORMULAIRE DE GESTION DES HORAIRES
 * =====================================================
 * Création et modification d'emplois du temps
 */

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Clock, Calendar, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

import { createScheduleSchema, CreateScheduleFormData, DAY_OF_WEEK_OPTIONS, VACATION_OPTIONS, PRESET_TIME_SLOTS } from '../../schemas/scheduleSchema';
import { Schedule, TimeSlot } from '../../types/schedule';
import { useCourseStore } from '../../stores/courseStore';
import { useRoomStore } from '../../stores/roomStore';

interface ScheduleFormProps {
  schedule?: Schedule | null;
  onSubmit: (data: CreateScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Formulaire de création/modification d'horaire
 */
export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { allCourses, fetchCourses } = useCourseStore();
  const { rooms, fetchRooms } = useRoomStore();
  
  const [selectedVacation, setSelectedVacation] = useState<string>('');

  // Charger les données au montage
  useEffect(() => {
    if (allCourses.length === 0) {
      fetchCourses();
    }
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, []);

  // Configuration du formulaire
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateScheduleFormData>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: schedule ? {
      name: schedule.name,
      dayOfWeek: schedule.dayOfWeek,
      vacation: schedule.vacation,
      classroomId: schedule.classroomId,
      roomId: schedule.roomId,
      timeSlots: schedule.timeSlots
    } : {
      name: '',
      dayOfWeek: 'LUNDI',
      vacation: 'Matin (AM)',
      classroomId: '',
      roomId: '',
      timeSlots: []
    }
  });

  // Gestion dynamique des créneaux horaires
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'timeSlots'
  });

  // Surveiller la période sélectionnée
  const vacationValue = watch('vacation');
  useEffect(() => {
    setSelectedVacation(vacationValue);
  }, [vacationValue]);

  // Ajouter un créneau vide
  const addTimeSlot = () => {
    append({
      startTime: '',
      endTime: '',
      courseId: '',
      teacherId: '',
      courseName: '',
      teacherName: ''
    });
  };

  // Ajouter un créneau prédéfini
  const addPresetTimeSlot = (preset: { startTime: string; endTime: string }) => {
    append({
      startTime: preset.startTime,
      endTime: preset.endTime,
      courseId: '',
      teacherId: '',
      courseName: '',
      teacherName: ''
    });
  };

  // Soumission du formulaire
  const onSubmitForm = async (data: CreateScheduleFormData) => {
    try {
      console.log('📝 Soumission du formulaire horaire:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      toast.error('Erreur lors de la soumission du formulaire');
    }
  };

  // Options pour les salles (rooms)
  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: `${room.name} ${room.capacity ? `(Capacité: ${room.capacity})` : ''}`
  }));

  // Options pour les cours
  const courseOptions = allCourses.map((course) => ({
    value: course.id,
    label: `${course.code} - ${course.titre}`
  }));

  // Créneaux prédéfinis selon la période
  const presetSlots = selectedVacation === 'Matin (AM)' 
    ? PRESET_TIME_SLOTS.morning 
    : PRESET_TIME_SLOTS.afternoon;

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nom de l'horaire */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom de l'emploi du temps <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Horaire Lundi Matin - NS I"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jour de la semaine */}
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">
                Jour de la semaine <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('dayOfWeek')}
                onValueChange={(value) => setValue('dayOfWeek', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jour" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OF_WEEK_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayOfWeek && (
                <p className="text-sm text-red-600">{errors.dayOfWeek.message}</p>
              )}
            </div>

            {/* Période */}
            <div className="space-y-2">
              <Label htmlFor="vacation">
                Période <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('vacation')}
                onValueChange={(value) => setValue('vacation', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {VACATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vacation && (
                <p className="text-sm text-red-600">{errors.vacation.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Classe (Classroom) */}
            <div className="space-y-2">
              <Label htmlFor="classroomId">
                Classe <span className="text-red-500">*</span>
              </Label>
              <Input
                id="classroomId"
                {...register('classroomId')}
                placeholder="ID de la classe"
                disabled={isLoading}
              />
              {errors.classroomId && (
                <p className="text-sm text-red-600">{errors.classroomId.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Entrez l'ID de la classe concernée
              </p>
            </div>

            {/* Salle (Room) */}
            <div className="space-y-2">
              <Label htmlFor="roomId">
                Salle <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('roomId')}
                onValueChange={(value) => setValue('roomId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <p className="text-sm text-red-600">{errors.roomId.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Créneaux horaires */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Créneaux Horaires ({fields.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un créneau
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Créneaux prédéfinis */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Créneaux prédéfinis pour {selectedVacation}:
            </p>
            <div className="flex flex-wrap gap-2">
              {presetSlots.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPresetTimeSlot(preset)}
                  disabled={isLoading}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message si pas de créneaux */}
          {fields.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucun créneau horaire</p>
              <p className="text-sm text-gray-400 mt-1">
                Cliquez sur "Ajouter un créneau" ou utilisez les créneaux prédéfinis
              </p>
            </div>
          )}

          {/* Liste des créneaux */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-white border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Créneau {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Heure de début */}
                  <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Input
                      type="time"
                      {...register(`timeSlots.${index}.startTime`)}
                      disabled={isLoading}
                    />
                    {errors.timeSlots?.[index]?.startTime && (
                      <p className="text-xs text-red-600">
                        {errors.timeSlots[index]?.startTime?.message}
                      </p>
                    )}
                  </div>

                  {/* Heure de fin */}
                  <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Input
                      type="time"
                      {...register(`timeSlots.${index}.endTime`)}
                      disabled={isLoading}
                    />
                    {errors.timeSlots?.[index]?.endTime && (
                      <p className="text-xs text-red-600">
                        {errors.timeSlots[index]?.endTime?.message}
                      </p>
                    )}
                  </div>

                  {/* Cours */}
                  <div className="space-y-2">
                    <Label>Cours</Label>
                    <Select
                      value={watch(`timeSlots.${index}.courseId`)}
                      onValueChange={(value) => setValue(`timeSlots.${index}.courseId`, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timeSlots?.[index]?.courseId && (
                      <p className="text-xs text-red-600">
                        {errors.timeSlots[index]?.courseId?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Erreur globale sur timeSlots */}
          {errors.timeSlots && typeof errors.timeSlots.message === 'string' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.timeSlots.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {schedule ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {schedule ? 'Mettre à jour' : 'Créer l\'horaire'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
