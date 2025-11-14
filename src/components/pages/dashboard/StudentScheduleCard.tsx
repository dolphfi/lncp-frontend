import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { Schedule, TimeSlot } from "../../../types/dashboard";

interface StudentScheduleCardProps {
  schedule: Schedule[];
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7h à 17h
const DAYS: (
  | "LUNDI"
  | "MARDI"
  | "MERCREDI"
  | "JEUDI"
  | "VENDREDI"
  | "SAMEDI"
)[] = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

const getCourseColor = (index: number) => {
  const colors = [
    { bg: "bg-blue-100", border: "border-blue-500" },
    { bg: "bg-green-100", border: "border-green-500" },
    { bg: "bg-yellow-100", border: "border-yellow-500" },
    { bg: "bg-purple-100", border: "border-purple-500" },
    { bg: "bg-pink-100", border: "border-pink-500" },
    { bg: "bg-orange-100", border: "border-orange-500" },
  ];
  return colors[index % colors.length];
};

const StudentScheduleCard: React.FC<StudentScheduleCardProps> = ({
  schedule,
}) => {
  const getDaySlots = (day: (typeof DAYS)[number]): TimeSlot[] => {
    const daySchedule = schedule.filter((s) => s.dayOfWeek === day);
    return daySchedule
      .flatMap((s) => s.timeSlots)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <Card className=" transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Emploi du temps</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(6,1fr)] min-w-[700px] border rounded-lg">
          {/* En-têtes */}
          <div className="text-center font-semibold text-xs py-2 bg-gray-50 rounded-tl-lg">
            Heure
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-xs py-2 bg-gray-50 border-l"
            >
              {day.substring(0, 3)}
            </div>
          ))}

          {/* Grille horaire */}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="text-center text-xs py-2 border-t bg-gray-50">
                {hour}:00
              </div>
              {DAYS.map((day) => {
                const daySlots = getDaySlots(day);
                const hourSlots = daySlots.filter(
                  (slot) => parseInt(slot.startTime.split(":")[0]) === hour
                );
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="border-t border-l p-1 min-h-[50px] relative"
                  >
                    {hourSlots.map((slot, index) => {
                      const color = getCourseColor(index);
                      // Récupérer le premier professeur assigné au cours
                      const teacher = slot.course?.employees?.[0];
                      const teacherName = teacher
                        ? `${teacher.firstName} ${teacher.lastName}`
                        : null;
                      
                      // Récupérer la classe et la salle du cours
                      const className = slot.course?.classroom?.name;
                      
                      // Trouver la salle pour ce jour
                      const daySchedule = schedule.find((s) => s.dayOfWeek === day);
                      const roomName = daySchedule?.room?.name;
                      
                      return (
                        <div
                          key={slot.id}
                          className={`p-1 rounded-md text-[10px] ${color.bg} border-l-4 ${color.border}`}
                        >
                          <p className="font-bold truncate">
                            {slot.course?.titre}
                          </p>
                          <p className="truncate">
                            {slot.startTime.slice(0, 5)} -{" "}
                            {slot.endTime.slice(0, 5)}
                          </p>
                          {teacherName && (
                            <p className="text-[9px] font-bold text-gray-500 truncate mt-0.5">
                              {teacherName}
                            </p>
                          )}
                          {(className || roomName) && (
                            <p className="text-[9px] font-bold text-gray-500 truncate mt-0.5">
                              {className && roomName
                                ? `${className} • ${roomName}`
                                : className || roomName}
                            </p>
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
        {schedule.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucun emploi du temps disponible.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentScheduleCard;
