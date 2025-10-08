/**
 * =====================================================
 * PAGE PROFIL ÉTUDIANT/PARENT - NOUVEAU DESIGN
 * =====================================================
 * Design basé sur le modèle fourni avec cards pour chaque enfant
 * Compatible avec le sidebar du dashboard
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStoreSimple';
import { useStudentSelectionStore } from '../../../stores/studentSelectionStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  User,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import StudentScheduleCard from './StudentScheduleCard';
import StudentNotesCard from './StudentNotesCard';
import StudentPaymentsCard from './StudentPaymentsCard';
import type { 
  ParentProfileData,
  StudentProfileData,
  ChildData,
  Attendance
} from '../../../types/studentProfile';

const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { parentData, selectedStudent, setParentData } = useStudentSelectionStore();
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isParent = user?.role === 'PARENT';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Mock data basé sur la structure JSON fournie
      if (isParent) {
        const mockParentData: ParentProfileData = {
          "parentInfo": {
            "id": user?.id || "c35adb28-5b1f-4990-a341-ee6823fa2c8a",
            "firstName": user?.first_name || "Hashim",
            "lastName": user?.last_name || "Key",
            "childrenCount": 9
          },
          "children": [
            {
              "studentInfo": {
                "id": "23690c10-c976-4a19-94ad-c85dcdc1fbc2",
                "firstName": "Willa",
                "lastName": "Hamilton",
                "matricule": "LNCP-WH-2025-0003",
                "classroom": "NSI",
                "room": "Salle XY",
                "dateOfBirth": "2009-11-10",
                "age": 16,
                "lieuDeNaissance": "Corrupti ratione qu",
                "communeDeNaissance": "Consequat Voluptate",
                "sexe": "Femme",
                "handicap": "Non",
                "handicapDetails": "Sunt et numquam ea l",
                "badge": null,
                "avatarUrl": "https://res.cloudinary.com/dsx2ogi7w/image/upload/v1757822724/students/ku7hrepcmssp22kjgu0b.png",
                "adresse": {
                  "ligne1": null,
                  "departement": null,
                  "commune": null,
                  "sectionCommunale": null
                },
                "vacation": "Après-midi (PM)"
              },
              "notes": [],
              "paymentRequired": true,
              "paymentMessage": "Frais scolaires non payés - Accès aux notes restreint",
              "payments": [],
              "attendances": [
                {
                  "id": "0dca886b-e3ee-473e-9366-a5e604a3be9d",
                  "timestamp": "2025-10-01T12:30:00.812Z",
                  "type": "Entrée",
                  "status": "Absent",
                  "readerId": "SYSTEM_AUTO_DETECTION",
                  "reason": "Absence détectée automatiquement par le système",
                  "isJustified": false,
                  "justification": null
                },
                {
                  "id": "62813c40-b84d-450e-ab71-9c1f46652644",
                  "timestamp": "2025-10-02T18:46:52.331Z",
                  "type": "Entrée",
                  "status": "Absent",
                  "readerId": "SYSTEM_AUTO_DETECTION",
                  "reason": "Absence détectée automatiquement par le système",
                  "isJustified": false,
                  "justification": null
                },
                {
                  "id": "ce947a5b-8427-402c-89a9-92a167c47cf9",
                  "timestamp": "2025-10-03T13:06:56.350Z",
                  "type": "Entrée",
                  "status": "Absent",
                  "readerId": "SYSTEM_AUTO_DETECTION",
                  "reason": "Absence détectée automatiquement par le système",
                  "isJustified": false,
                  "justification": null
                }
              ],
              "schedule": [
                {
                  "id": "1093bdae-fcb2-4bb9-9f71-49cde9c4c341",
                  "name": "Maxis",
                  "dayOfWeek": "LUNDI",
                  "vacation": "Matin (AM)",
                  "room": {
                    "id": "2ebcda2d-b492-4a41-a218-ec3af4864fcb",
                    "name": "Salle XY",
                    "capacity": 60,
                    "status": "Disponible"
                  },
                  "timeSlots": [
                    {
                      "id": "5e42959c-1018-4e0c-ab44-54d01def14dd",
                      "startTime": "08:00:00",
                      "endTime": "09:00:00",
                      "type": "COURSE",
                      "course": {
                        "id": "fcf51ca7-210e-48c6-9d6e-fd9c8494a11e",
                        "code": "PHYS-101",
                        "titre": "Optique",
                        "description": "ssdnskds sd",
                        "categorie": "Physique",
                        "ponderation": 100,
                        "statut": "Actif",
                        "classroom": {
                          "id": "82f8d071-3c1d-4c7f-93f8-286a9aa01e8d",
                          "name": "NSI",
                          "description": "1er Année Sec."
                        },
                        "employees": [
                          {
                            "id": "9f947900-545b-4e73-b8a3-281cea579f76",
                            "firstName": "Madaline",
                            "lastName": "Parsons"
                          },
                          {
                            "id": "e9c41c13-86ce-4658-a6da-7201ef4d4c23",
                            "firstName": "Olga",
                            "lastName": "Cardenas"
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        };
        setParentData(mockParentData); // Le store sélectionne automatiquement le 1er enfant
      } else {
        // Pour un élève connecté
        const mockStudentData: StudentProfileData = {
          studentInfo: {
            id: user?.id || "1",
            firstName: user?.first_name || "Jean",
            lastName: user?.last_name || "Dupont",
            matricule: "LNCP-JD-2025-0001",
            classroom: "NSIII",
            room: "Salle A",
            dateOfBirth: "2008-05-20",
            age: 17,
            lieuDeNaissance: "Port-au-Prince",
            communeDeNaissance: "Port-au-Prince",
            sexe: "Homme",
            handicap: "Non",
            vacation: "Matin (AM)",
            avatarUrl: user?.avatar
          },
          notes: [],
          paymentRequired: false,
          payments: [],
          attendances: [],
          schedule: []
        };
        setStudentData(mockStudentData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentData = isParent ? selectedStudent : studentData;

  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h2>
          <p className="text-gray-600">Impossible de charger les informations du profil.</p>
        </div>
      </div>
    );
  }

  const attendanceStats = {
    presentPercentage: currentData.attendances.length > 0 ? Math.round(currentData.attendances.filter(a => a.status === 'Présent').length / currentData.attendances.length * 100) : 100,
    absent: currentData.attendances.filter(a => a.status === 'Absent').length,
    late: currentData.attendances.filter(a => a.status === 'Retard').length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Grille de cartes d'information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 - Profil, Statistiques et Finances */}
        <div className="col-span-1 lg:col-span-1 space-y-6">
          {/* Card Profile */}
          <Card className="shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-20" />
            <CardContent className="p-6 text-center -mt-12">
              <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={currentData.studentInfo.avatarUrl || undefined} />
                <AvatarFallback className="bg-gray-200 text-gray-500 text-3xl">
                  {currentData.studentInfo.firstName[0]}{currentData.studentInfo.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mt-4">{currentData.studentInfo.firstName} {currentData.studentInfo.lastName}</h2>
              <p className="text-sm text-gray-500">{currentData.studentInfo.matricule}</p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{currentData.studentInfo.classroom} - {currentData.studentInfo.room}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{currentData.studentInfo.age} ans</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{currentData.studentInfo.vacation}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Carte Statistiques de Présence */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Présence</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.presentPercentage}%</div>
              <p className="text-xs text-gray-500">{attendanceStats.absent} absences, {attendanceStats.late} retards au total</p>
            </CardContent>
          </Card>

          <StudentPaymentsCard payments={currentData.payments} paymentRequired={currentData.paymentRequired} paymentMessage={currentData.paymentMessage || ''} />
        </div>

        {/* Colonne 2 - Activités Récentes */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <StudentScheduleCard schedule={currentData.schedule} />
          {/* Carte Absences et Retards Récents */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Absences et Retards Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.attendances.filter(a => a.status !== 'Présent').slice(0, 4).map((att: Attendance) => (
                  <div key={att.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${att.status === 'Absent' ? 'bg-red-100' : 'bg-orange-100'}`}>
                        {att.status === 'Absent' ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{att.status} le {formatDate(att.timestamp)}</p>
                        <p className="text-xs text-gray-500">{att.reason}</p>
                      </div>
                    </div>
                    <Badge variant={att.isJustified ? 'default' : 'secondary'}>{att.isJustified ? 'Justifié' : 'Non justifié'}</Badge>
                  </div>
                ))}
                {currentData.attendances.filter(a => a.status !== 'Présent').length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune absence ou retard à signaler.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <StudentNotesCard notes={currentData.notes} paymentRequired={currentData.paymentRequired} />
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
