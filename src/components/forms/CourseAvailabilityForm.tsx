/**
 * =====================================================
 * FORMULAIRE DE GESTION DE DISPONIBILITÉ DES COURS
 * =====================================================
 * Composant pour définir la disponibilité d'un cours par trimestre
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Course, Trimestre, AvailabilityStatus } from '../../types/course';
import { courseService } from '../../services/courses/courseService';
import { getApiUrl } from '../../config/api';
import axios from 'axios';
import authService from '../../services/authService';

// =====================================================
// SCHÉMA DE VALIDATION
// =====================================================
const availabilitySchema = z.object({
  courseId: z.string().min(1, 'Cours requis'),
  roomId: z.string().min(1, 'Salle requise'),
  trimestre: z.enum(['T1', 'T2', 'T3'], { required_error: 'Trimestre requis' }),
  statut: z.enum(['Actif', 'Inactif'], { required_error: 'Statut requis' })
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

// =====================================================
// TYPES ET INTERFACES
// =====================================================
interface CourseAvailabilityFormProps {
  course?: Course;
  onSubmit: (data: AvailabilityFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface Room {
  id: string;
  name: string;
  capacity?: number;
  status?: string;
}

// Options pour les trimestres
const TRIMESTRE_OPTIONS = [
  { value: 'T1', label: 'Trimestre 1' },
  { value: 'T2', label: 'Trimestre 2' },
  { value: 'T3', label: 'Trimestre 3' }
];

// Options pour les statuts (selon l'API backend)
const STATUS_OPTIONS = [
  { value: 'Actif', label: 'Actif', color: 'bg-green-100 text-green-800' },
  { value: 'Inactif', label: 'Inactif', color: 'bg-red-100 text-red-800' }
];

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export const CourseAvailabilityForm: React.FC<CourseAvailabilityFormProps> = ({
  course,
  onSubmit,
  onCancel,
  loading = false
}) => {
  // =====================================================
  // ÉTATS LOCAUX
  // =====================================================
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // =====================================================
  // CONFIGURATION DU FORMULAIRE
  // =====================================================
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      courseId: course?.id || '',
      roomId: '',
      trimestre: 'T1',
      statut: 'Actif'
    }
  });

  const watchedTrimestre = watch('trimestre');
  const watchedStatut = watch('statut');
  const watchedRoomId = watch('roomId');

  // =====================================================
  // CHARGEMENT DES SALLES
  // =====================================================
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        
        const url = getApiUrl('/classroom/all-classroom');
        const response = await axios.get(url, {
          params: { page: 1, limit: 100 },
          headers: {
            Authorization: `Bearer ${authService.getAccessToken()}`
          }
        });
        const data = response.data;
        
        console.log('Données classes reçues:', data);
        
        // Extraire les salles de la classe du cours sélectionné
        const courseRooms: Room[] = [];
        
        if (data.data && Array.isArray(data.data) && course?.classroom?.id) {
          // Trouver la classe correspondant au cours
          const courseClassroom = data.data.find((classroom: any) => 
            classroom.id === course.classroom?.id
          );
          
          console.log('Classe du cours:', courseClassroom);
          console.log('ID classe recherchée:', course.classroom?.id);
          
          if (courseClassroom && courseClassroom.rooms && courseClassroom.rooms.length > 0) {
            courseClassroom.rooms.forEach((room: any) => {
              console.log('Salle de la classe trouvée:', room);
              courseRooms.push({
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                status: room.status
              });
            });
          } else {
            console.log('Aucune salle trouvée pour cette classe ou classe non trouvée');
          }
        } else {
          console.log('Pas de classe assignée au cours ou données manquantes');
        }
        
        console.log('Salles de la classe extraites:', courseRooms);
        setRooms(courseRooms);
      } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [course?.classroom?.id]); // Recharger si la classe du cours change

  // =====================================================
  // GESTION DE LA SOUMISSION
  // =====================================================
  const onFormSubmit = (data: AvailabilityFormData) => {
    onSubmit(data);
  };

  // Récupérer les informations de la salle sélectionnée
  const selectedRoom = rooms.find(r => r.id === watchedRoomId);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === watchedStatut);

  // =====================================================
  // RENDU DU COMPOSANT
  // =====================================================
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Gestion de disponibilité
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Définir la disponibilité du cours par trimestre
          </p>
        </div>
      </div>

      {/* Informations du cours */}
      {course && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4" />
              Cours sélectionné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xs">
                {course.code?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{course.titre}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.code} • {course.categorie}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration de disponibilité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trimestre */}
          <div className="space-y-2">
            <Label>Trimestre *</Label>
            <Select
              value={watchedTrimestre}
              onValueChange={(value) => setValue('trimestre', value as Trimestre)}
            >
              <SelectTrigger className={errors.trimestre ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner un trimestre" />
              </SelectTrigger>
              <SelectContent>
                {TRIMESTRE_OPTIONS.map((trimestre) => (
                  <SelectItem key={trimestre.value} value={trimestre.value}>
                    {trimestre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trimestre && (
              <p className="text-sm text-red-500">{errors.trimestre.message}</p>
            )}
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut *</Label>
            <Select
              value={watchedStatut}
              onValueChange={(value) => setValue('statut', value as AvailabilityStatus)}
            >
              <SelectTrigger className={errors.statut ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.statut && (
              <p className="text-sm text-red-500">{errors.statut.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sélection de salle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Salle assignée
          </CardTitle>
          {course?.classroom && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Salles disponibles pour la classe : <span className="font-medium">{course.classroom.name}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Salle *</Label>
            <Select
              value={watchedRoomId}
              onValueChange={(value) => setValue('roomId', value)}
            >
              <SelectTrigger className={errors.roomId ? 'border-red-500' : ''}>
                <SelectValue placeholder={
                  loadingRooms 
                    ? "Chargement des salles..." 
                    : rooms.length === 0 
                      ? "Aucune salle disponible" 
                      : "Sélectionner une salle"
                } />
              </SelectTrigger>
              <SelectContent>
                {loadingRooms ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Chargement...</span>
                    </div>
                  </SelectItem>
                ) : rooms.length === 0 ? (
                  <SelectItem value="no-rooms" disabled>
                    <span className="text-gray-500">Aucune salle disponible</span>
                  </SelectItem>
                ) : (
                  rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{room.name}</span>
                        {room.capacity && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {room.capacity} places
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.roomId && (
              <p className="text-sm text-red-500">{errors.roomId.message}</p>
            )}
          </div>

          {/* Aperçu de la configuration */}
          {selectedRoom && selectedStatus && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aperçu de la configuration
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>• Salle: <span className="font-medium">{selectedRoom.name}</span></p>
                <p>• Trimestre: <span className="font-medium">{TRIMESTRE_OPTIONS.find(t => t.value === watchedTrimestre)?.label}</span></p>
                <p>• Statut: <Badge className={`text-xs ${selectedStatus.color}`}>{selectedStatus.label}</Badge></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};
