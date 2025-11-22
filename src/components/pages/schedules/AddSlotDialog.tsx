import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { DayOfWeek } from '../../../types/schedule';
import { Course } from '../../../types/course';

interface AddSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    courseId: string; 
    teacherId?: string; 
    startTime: string; 
    endTime: string;
    type: 'COURSE' | 'BREAK' | 'LUNCH' | 'STUDY';
  }) => Promise<void>;
  day: DayOfWeek;
  startTime: string; // Format HH:mm
  endTime: string;   // Format HH:mm
  courses: Course[];
  isLoading?: boolean;
}

export const AddSlotDialog: React.FC<AddSlotDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  day,
  startTime,
  endTime,
  courses,
  isLoading = false
}) => {
  const [courseId, setCourseId] = useState<string>('');
  const [start, setStart] = useState<string>(startTime);
  const [end, setEnd] = useState<string>(endTime);
  const [type, setType] = useState<'COURSE' | 'BREAK' | 'LUNCH' | 'STUDY'>('COURSE');
  
  // Mettre à jour les heures quand les props changent
  useEffect(() => {
    if (isOpen) {
      setStart(startTime);
      setEnd(endTime);
      setCourseId('');
      setType('COURSE');
    }
  }, [isOpen, startTime, endTime]);

  const handleSave = async () => {
    if (!start || !end) return;
    if (type === 'COURSE' && !courseId) return;

    await onSave({
      courseId: type === 'COURSE' ? courseId : '',
      startTime: start.length === 5 ? `${start}:00` : start,
      endTime: end.length === 5 ? `${end}:00` : end,
      type
    });
  };

  // Trouver le cours sélectionné pour afficher des infos supplémentaires si besoin
  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un créneau - {day}</DialogTitle>
          <DialogDescription>
            Ajoutez un cours ou une pause à l'horaire.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Type de créneau */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select 
              value={type} 
              onValueChange={(val: any) => setType(val)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Type de créneau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COURSE">Cours</SelectItem>
                <SelectItem value="BREAK">Pause</SelectItem>
                <SelectItem value="LUNCH">Déjeuner</SelectItem>
                <SelectItem value="STUDY">Étude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélection du cours (si type === COURSE) */}
          {type === 'COURSE' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">
                Cours
              </Label>
              <Select 
                value={courseId} 
                onValueChange={setCourseId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.titre} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Heure de début (Lecture seule ou modifiable, mais fixée par la case cliquée) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Début
            </Label>
            <Input
              id="start"
              type="time"
              value={start}
              disabled
              className="col-span-3 bg-gray-100"
            />
          </div>

          {/* Heure de fin (Sélection intelligente) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              Fin
            </Label>
            <Select 
              value={end} 
              onValueChange={setEnd}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Heure de fin" />
              </SelectTrigger>
              <SelectContent>
                {/* Générer les options d'heures de fin possibles (de Start + 1h jusqu'à 18h) */}
                {(() => {
                  const startHour = parseInt(start.split(':')[0]);
                  const options = [];
                  
                  // Proposer des créneaux jusqu'à 18h
                  for (let h = startHour + 1; h <= 18; h++) {
                    const timeString = `${h.toString().padStart(2, '0')}:00`;
                    const duration = h - startHour;
                    options.push(
                      <SelectItem key={timeString} value={timeString}>
                        {timeString} ({duration}h)
                      </SelectItem>
                    );
                  }
                  return options;
                })()}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
