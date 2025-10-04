/**
 * =====================================================
 * VUE MOBILE CALENDRIER - Style Android
 * =====================================================
 */

import React from 'react';
import { BookOpen, Users, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { TimeSlot, DayOfWeek } from '../../../types/schedule';

interface MobileScheduleViewProps {
  currentDay: DayOfWeek;
  dayIndex: number;
  daySlots: TimeSlot[];
  daysShort: string[];
  onPreviousDay: () => void;
  onNextDay: () => void;
  getCourseColor: (index: number) => { bg: string; border: string; text: string };
}

export const MobileScheduleView: React.FC<MobileScheduleViewProps> = ({
  currentDay,
  dayIndex,
  daySlots,
  daysShort,
  onPreviousDay,
  onNextDay,
  getCourseColor
}) => {
  return (
    <div className="md:hidden">
      {/* Navigation jour */}
      <div className="flex items-center justify-between mb-3 px-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousDay}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-semibold text-gray-900">
          {daysShort[dayIndex]}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextDay}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Liste des cours */}
      {daySlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aucun cours ce jour</p>
        </div>
      ) : (
        <div className="space-y-2">
          {daySlots.map((slot, index) => {
            const color = getCourseColor(index);
            return (
              <div
                key={index}
                className={`${color.bg} ${color.text} rounded-lg p-3 border-l-4 ${color.border} shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold mb-1 opacity-90">
                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                    </div>
                    <div className="text-sm font-semibold mb-2 truncate">
                      {slot.courseName || 'Cours'}
                    </div>
                    {slot.teacherName && (
                      <div className="text-xs opacity-90 flex items-center gap-1.5 truncate">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{slot.teacherName}</span>
                      </div>
                    )}
                  </div>
                  <BookOpen className="h-5 w-5 opacity-80 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileScheduleView;
