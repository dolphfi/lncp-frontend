/**
 * =====================================================
 * PAGE PROFIL ÉTUDIANT/PARENT
 * =====================================================
 * Page dédiée aux étudiants et parents avec leurs informations académiques
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStoreSimple';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import {
  User,
  GraduationCap,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import authService from '../../../services/authService';
import { toast } from 'react-toastify';

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
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate?: string;
  avatar?: string;
}

interface AcademicRecord {
  subject: string;
  grade: number;
  coefficient: number;
  semester: string;
  year: string;
}

const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Récupérer les informations de profil
      const me = await authService.getMe();

      // Simuler la récupération des données académiques
      // Dans un vrai projet, vous feriez des appels API ici
      const mockProfile: StudentProfile = {
        id: me.id || '',
        firstName: me.firstName || user?.first_name || '',
        lastName: me.lastName || user?.last_name || '',
        email: me.email || user?.email || '',
        phone: me.phone || user?.phone,
        className: 'Terminale Scientifique A',
        academicYear: '2023-2024',
        average: 14.5,
        rank: 3,
        status: 'active',
        enrollmentDate: '2023-09-01'
      };

      const mockAcademicRecords: AcademicRecord[] = [
        { subject: 'Mathématiques', grade: 16.2, coefficient: 4, semester: 'Semestre 1', year: '2023-2024' },
        { subject: 'Physique-Chimie', grade: 15.8, coefficient: 3, semester: 'Semestre 1', year: '2023-2024' },
        { subject: 'Français', grade: 14.1, coefficient: 3, semester: 'Semestre 1', year: '2023-2024' },
        { subject: 'Histoire-Géographie', grade: 13.9, coefficient: 2, semester: 'Semestre 1', year: '2023-2024' },
        { subject: 'Anglais', grade: 15.3, coefficient: 2, semester: 'Semestre 1', year: '2023-2024' },
      ];

      setProfile(mockProfile);
      setAcademicRecords(mockAcademicRecords);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'graduated': return 'Diplômé';
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête du profil */}
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{profile.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getStatusColor(profile.status)}>
                {getStatusText(profile.status)}
              </Badge>
              <span className="text-sm text-gray-500">
                Inscrit depuis le {profile.enrollmentDate ? new Date(profile.enrollmentDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations académiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Informations Académiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Classe</label>
                  <p className="text-lg font-semibold">{profile.className || 'Non assignée'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Année Académique</label>
                  <p className="text-lg font-semibold">{profile.academicYear || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Moyenne Générale</label>
                  <p className="text-lg font-semibold">{profile.average ? `${profile.average}/20` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rang</label>
                  <p className="text-lg font-semibold">{profile.rank ? `${profile.rank}ème` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulletin académique */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Bulletin Académique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{record.subject}</h4>
                      <p className="text-sm text-gray-500">
                        {record.semester} - {record.year} • Coefficient {record.coefficient}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">{record.grade}</span>
                      <span className="text-gray-500">/20</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations personnelles */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="font-semibold">{profile.phone || 'Non renseigné'}</p>
              </div>

              {profile.dateOfBirth && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                  <p className="font-semibold">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}

              {profile.placeOfBirth && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                  <p className="font-semibold">{profile.placeOfBirth}</p>
                </div>
              )}

              {profile.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Adresse</label>
                  <p className="font-semibold">{profile.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Moyenne du semestre</span>
                <span className="font-bold text-lg">{profile.average ? profile.average.toFixed(2) : 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Classement</span>
                <span className="font-bold text-lg">{profile.rank ? `${profile.rank}ème` : 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Matières suivies</span>
                <span className="font-bold text-lg">{academicRecords.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
