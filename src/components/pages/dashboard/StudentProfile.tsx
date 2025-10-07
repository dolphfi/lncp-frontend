/**
 * =====================================================
 * PAGE PROFIL ÉTUDIANT/PARENT
 * =====================================================
 * Page dédiée aux étudiants et parents avec design moderne
 * Support pour les parents avec plusieurs élèves via dropdown
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStoreSimple';
import { useStudentStore } from '../../../stores/studentStore';
import { useAcademicStore } from '../../../stores/academicStore';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Send,
  BookOpen,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  address?: string;
  className?: string;
  academicYear?: string;
  average?: number;
  rank?: number;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  enrollmentDate?: string;
  avatar?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  className: string;
  avatar?: string;
}

interface ParentStudent {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  className: string;
  avatar?: string;
  academicYear?: string;
  average?: number;
  rank?: number;
}

const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { getStudentById } = useStudentStore();
  const { fetchStudentBulletin, studentBulletin } = useAcademicStore();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [parentStudents, setParentStudents] = useState<ParentStudent[]>([]);

  const isParent = user?.role === 'PARENT';
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    loadProfileData();
  }, [selectedStudent]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      if (isParent) {
        await loadParentStudents();
      }

      let studentData = null;

      if (isStudent) {
        // Pour un étudiant, récupérer ses propres données
        studentData = await getStudentById(user?.id || '');
      } else if (isParent && selectedStudent) {
        // Pour un parent, récupérer les données de l'élève sélectionné
        studentData = await getStudentById(selectedStudent);
      }

      if (studentData) {
        // Convertir les données du store vers le format StudentProfile
        const profileData: StudentProfile = {
          id: studentData.id,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email || 'non-renseigné@lncp.edu',
          phone: studentData.parentContact?.phone,
          dateOfBirth: studentData.dateOfBirth,
          placeOfBirth: studentData.placeOfBirth,
          address: studentData.parentContact?.address,
          className: studentData.roomName || studentData.grade,
          academicYear: '2023-2024', // TODO: récupérer depuis API
          average: 14.5, // TODO: calculer depuis les notes
          rank: 3, // TODO: calculer depuis les statistiques
          status: studentData.status as 'active' | 'inactive' | 'graduated' | 'suspended',
          enrollmentDate: studentData.enrollmentDate,
          avatar: studentData.avatar
        };

        setProfile(profileData);

        // Récupérer le bulletin de l'étudiant
        await fetchStudentBulletin(studentData.studentId);

        // TODO: Récupérer les vraies notes académiques depuis l'API
        // Les notes seront affichées via le bulletin académique (studentBulletin)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadParentStudents = async () => {
    try {
      // TODO: Créer un endpoint API pour récupérer les élèves d'un parent
      // Pour l'instant, simulation avec des données mockées
      const mockParentStudents: ParentStudent[] = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          matricule: 'LNCP2024001',
          className: 'Terminale Scientifique A',
          academicYear: '2023-2024',
          average: 14.5,
          rank: 3
        },
        {
          id: '2',
          firstName: 'Marie',
          lastName: 'Dupont',
          matricule: 'LNCP2024002',
          className: 'Première Littéraire B',
          academicYear: '2023-2024',
          average: 15.2,
          rank: 2
        }
      ];

      setParentStudents(mockParentStudents);

      // Sélectionner automatiquement le premier élève si aucun n'est sélectionné
      if (!selectedStudent && mockParentStudents.length > 0) {
        setSelectedStudent(mockParentStudents[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
      toast.error('Erreur lors du chargement des élèves');
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'graduated': return 'Diplômé';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h2>
          <p className="text-gray-600">Impossible de charger les informations du profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Sélection d'élève pour les parents */}
      {isParent && parentStudents.length > 1 && (
        <div className="mb-6 max-w-xs">
          <Select value={selectedStudent} onValueChange={handleStudentChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Sélectionner un élève" />
            </SelectTrigger>
            <SelectContent>
              {parentStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} - {student.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* En-tête avec photo et infos */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Photo et infos principales */}
            <div className="flex items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600 mb-4">{profile.email}</p>

                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.average || 0}</div>
                    <div className="text-sm text-gray-500">Moyenne</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.rank || 0}</div>
                    <div className="text-sm text-gray-500">Rang</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile.className || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Classe</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton d'action */}
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Envoyer un message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale: Colonne gauche + Colonne droite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations détaillées */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="font-medium">Homme</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de naissance</p>
                    <p className="font-medium">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{profile.phone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">{profile.address || 'Non renseignée'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lieu de naissance</p>
                    <p className="font-medium">{profile.placeOfBirth || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onglets pour différentes sections */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="upcoming" className="w-full">
                <div className="border-b px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Cours à venir</TabsTrigger>
                    <TabsTrigger value="past">Historique</TabsTrigger>
                    <TabsTrigger value="medical">Résultats</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upcoming" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Mathématiques</p>
                          <p className="text-sm text-gray-500">Lundi 10:00 - 12:00</p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Physique-Chimie</p>
                          <p className="text-sm text-gray-500">Mardi 14:00 - 16:00</p>
                        </div>
                      </div>
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="past" className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Historique des cours passés</p>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Résultats académiques</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          {/* Card Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Notes</span>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Révision Mathématiques</p>
                  <p className="text-xs text-gray-600">Préparer examen chapitre 5</p>
                  <p className="text-xs text-gray-400 mt-2">Il y a 2 jours</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Devoir Français</p>
                  <p className="text-xs text-gray-600">Rendre dissertation pour vendredi</p>
                  <p className="text-xs text-gray-400 mt-2">Il y a 5 jours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Documents</span>
                <Button variant="ghost" size="sm">
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Bulletin T1.pdf</p>
                      <p className="text-xs text-gray-500">2.5 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Certificat.pdf</p>
                      <p className="text-xs text-gray-500">1.8 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Paiements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Frais scolaires</span>
                  <span className="font-bold text-green-600">Payé</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cantine</span>
                  <span className="font-bold text-green-600">Payé</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transport</span>
                  <span className="font-bold text-orange-600">En attente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
