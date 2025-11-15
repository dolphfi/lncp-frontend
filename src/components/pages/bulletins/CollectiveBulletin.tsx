import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Search,
  Download,
  Printer,
  Users,
  Award,
  TrendingUp,
  Eye,
  BarChart3,
  Trophy,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useClassroomStore } from '../../../stores/classroomStore';
import { useReportCardStore } from '../../../stores/reportCardStore';
import { generateReportCardPDF } from '../../../utils/reportCardPDF';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import StatCard from '../../ui/stat-card';

// Schéma de validation
const bulletinCollectifSchema = yup.object({
  classroomId: yup.string().required('La classe est requise'),
  roomId: yup.string().required('La salle est requise'),
  period: yup.string().oneOf(['T1', 'T2', 'T3', 'ANNUEL']).required('La période est requise')
});

type BulletinCollectifFormData = yup.InferType<typeof bulletinCollectifSchema>;

const CollectiveBulletin: React.FC = () => {
  // Stores
  const { items: classrooms, loading: loadingClassrooms, fetchAll: fetchClassrooms } = useClassroomStore();
  const { roomReportCards, loading, fetchRoomReportCards } = useReportCardStore();

  // États locaux
  const [showBulletin, setShowBulletin] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Array<{ value: string; label: string }>>([]);
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);

  // Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BulletinCollectifFormData>({
    resolver: yupResolver(bulletinCollectifSchema) as Resolver<BulletinCollectifFormData>,
    mode: 'onChange',
    defaultValues: {
      classroomId: '',
      roomId: '',
      period: 'T1' as const
    }
  });

  const classroomId = watch('classroomId');

  // Charger les classes au montage
  useEffect(() => {
    fetchClassrooms(1, 100); // Charger toutes les classes
  }, [fetchClassrooms]);

  // Mettre à jour les salles quand la classe change
  useEffect(() => {
    if (classroomId) {
      const classroom = classrooms.find(c => c.id === classroomId);
      if (classroom && classroom.rooms) {
        const roomOptions = classroom.rooms.map(room => ({
          value: room.id,
          label: `${room.name} (${room.capacity} places)`,
        }));
        setAvailableRooms(roomOptions);
        setSelectedClassroom(classroom.name);
      } else {
        setAvailableRooms([]);
      }
      // Réinitialiser la salle sélectionnée
      setValue('roomId', '');
    } else {
      setAvailableRooms([]);
      setSelectedClassroom('');
    }
  }, [classroomId, classrooms, setValue]);

  // Génération de l'aperçu des bulletins
  const onSubmit = async (data: BulletinCollectifFormData) => {
    try {
      await fetchRoomReportCards(data.roomId);
      setShowBulletin(true);
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      setShowBulletin(false);
    }
  };

  // Export PDF - Génère un PDF individuel pour chaque élève
  const handleExportPDF = async () => {
    if (!roomReportCards || roomReportCards.length === 0) {
      toast.error('Aucun bulletin à exporter');
      return;
    }

    setGeneratingPDFs(true);
    
    try {
      toast.info(`Génération de ${roomReportCards.length} bulletins en cours...`, { autoClose: 2000 });
      
      // Format année académique: 2024-2025
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear - 1}-${currentYear}`;
      
      // Générer un PDF pour chaque élève
      for (let i = 0; i < roomReportCards.length; i++) {
        const reportCard = roomReportCards[i];
        
        toast.info(`Génération bulletin ${i + 1}/${roomReportCards.length}...`, { autoClose: 500 });
        
        await generateReportCardPDF(reportCard, {
          headerImagePath: '/header-2.png',
          watermarkImagePath: '/paper.png',
          academicYear: academicYear,
          schoolName: 'LNCP'
        });
        
        // Petite pause entre chaque génération
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast.success(`${roomReportCards.length} bulletins générés avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export des PDF');
    } finally {
      setGeneratingPDFs(false);
    }
  };


  // Calcul de la couleur selon la moyenne
  const getGradeColor = (moyenne: number, max: number = 20) => {
    const percentage = (moyenne / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (decision: string) => {
    if (decision === 'ADMIS') return 'bg-green-100 text-green-800';
    if (decision === 'REDOUBLE') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulletin Collectif</h1>
          <p className="text-gray-600">
            Consultez le bulletin d'une classe complète
          </p>
        </div>
        
        {showBulletin && roomReportCards.length > 0 && (
          <div className="flex items-center space-x-3">
            <Button onClick={handleExportPDF} disabled={generatingPDFs}>
              {generatingPDFs ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter {roomReportCards.length} PDF
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Sélection de Classe et Salle</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez une classe, une salle et une période pour générer les bulletins
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data as BulletinCollectifFormData))} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select Classe */}
              <div className="space-y-2">
                <Label htmlFor="classroomId">Classe *</Label>
                <Controller
                  name="classroomId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={classrooms.map(classroom => ({
                        value: classroom.id,
                        label: classroom.name,
                        description: `${classroom.rooms?.length || 0} salle(s)`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner une classe..."
                    />
                  )}
                />
                {errors.classroomId && (
                  <p className="text-sm text-red-600">{errors.classroomId.message}</p>
                )}
              </div>

              {/* Select Salle */}
              <div className="space-y-2">
                <Label htmlFor="roomId">Salle *</Label>
                <Controller
                  name="roomId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={availableRooms}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={classroomId ? "Sélectionner une salle..." : "Choisissez d'abord une classe"}
                      disabled={!classroomId || availableRooms.length === 0}
                    />
                  )}
                />
                {errors.roomId && (
                  <p className="text-sm text-red-600">{errors.roomId.message}</p>
                )}
              </div>

              {/* Select Période */}
              <div className="space-y-2">
                <Label htmlFor="period">Période *</Label>
                <Controller
                  name="period"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={[
                        { value: 'T1', label: '1er Contrôle', description: 'Trimestre 1' },
                        { value: 'T2', label: '2e Contrôle', description: 'Trimestre 2' },
                        { value: 'T3', label: '3e Contrôle', description: 'Trimestre 3' },
                        { value: 'ANNUEL', label: 'Bulletin Annuel', description: 'Année complète' }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner la période..."
                    />
                  )}
                />
                {errors.period && (
                  <p className="text-sm text-red-600">{errors.period.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isValid || loading.room}
                className="min-w-[150px]"
              >
                {loading.room ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Afficher l'Aperçu
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Affichage du bulletin de classe */}
      {showBulletin && roomReportCards.length > 0 && (
        <div ref={bulletinRef} className="space-y-6 print:space-y-4">
          {/* En-tête du bulletin */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white print:bg-gray-100 print:text-black">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Bulletins Collectifs - {selectedClassroom}
                  </CardTitle>
                  <CardDescription className="text-indigo-100 print:text-gray-600">
                    {roomReportCards.length} élève(s) • Année Scolaire 2024-2025
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">
                    Date de génération
                  </div>
                  <div className="font-medium">
                    {new Date().toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistiques de la classe */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Étudiants"
              value={roomReportCards.length}
              description="Étudiants dans la salle"
              icon={Users}
              color="blue"
            />
            
            <StatCard
              title="Bulletins Générés"
              value={roomReportCards.length}
              description="Prêts à exporter"
              icon={FileText}
              color="green"
            />
            
            <StatCard
              title="Moyenne Générale"
              value={(roomReportCards.reduce((sum, rc) => sum + Number(rc.moyenneGenerale), 0) / roomReportCards.length).toFixed(2)}
              description="/10"
              icon={Award}
              color="purple"
            />
            
            <StatCard
              title="Classe"
              value={selectedClassroom}
              description="Niveau scolaire"
              icon={BarChart3}
              color="blue"
            />
          </div>

          {/* Classement des étudiants */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Classement de la Classe</span>
              </CardTitle>
              <CardDescription>
                Liste des {roomReportCards.length} bulletins prêts à exporter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Étudiant
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Matricule
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Classe
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Moyenne Générale
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Décision
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {roomReportCards.map((reportCard, index) => (
                      <tr key={reportCard.studentInfo.matricule} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-800">
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {reportCard.studentInfo.firstName} {reportCard.studentInfo.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-mono">
                            {reportCard.studentInfo.matricule}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm">
                            {reportCard.studentInfo.classRoom}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-lg ${getGradeColor(Number(reportCard.moyenneGenerale), 10)}`}>
                              {Number(reportCard.moyenneGenerale).toFixed(2)}
                            </span>
                            <Progress 
                              value={(Number(reportCard.moyenneGenerale) / 10) * 100} 
                              className="w-16 h-2"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getGradeBadgeColor(reportCard.decision || 'EN_ATTENTE')}>
                            {reportCard.decision || 'En attente'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Prêt
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Analyse détaillée */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par décision */}
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle>Répartition des Décisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Promu(e)</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(roomReportCards.filter(rc => rc.decision?.includes('Promu')).length / roomReportCards.length) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-bold text-green-600">
                        {roomReportCards.filter(rc => rc.decision?.includes('Promu')).length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Doublé</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(roomReportCards.filter(rc => rc.decision?.includes('Doublé')).length / roomReportCards.length) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-bold text-red-600">
                        {roomReportCards.filter(rc => rc.decision?.includes('Doublé')).length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques de performance */}
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle>Analyse de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Moyenne de la salle</span>
                    <span className="font-medium">
                      {(roomReportCards.reduce((sum, rc) => sum + Number(rc.moyenneGenerale), 0) / roomReportCards.length).toFixed(2)}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de réussite</span>
                    <span className="font-medium text-green-600">
                      {((roomReportCards.filter(rc => Number(rc.moyenneGenerale) >= 5).length / roomReportCards.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Meilleure moyenne</span>
                    <span className="font-medium text-green-600">
                      {Math.max(...roomReportCards.map(rc => Number(rc.moyenneGenerale))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Moyenne la plus faible</span>
                    <span className="font-medium text-red-600">
                      {Math.min(...roomReportCards.map(rc => Number(rc.moyenneGenerale))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pied de page */}
          <div className="text-center text-sm text-gray-500 print:text-black border-t pt-4">
            <p>
              Bulletin de classe généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </p>
            <p className="mt-1">
              Système de Gestion des Notes Académiques - LNCP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectiveBulletin;
