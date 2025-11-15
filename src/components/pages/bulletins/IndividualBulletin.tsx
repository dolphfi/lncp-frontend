import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Search,
  Download,
  Printer,
  User,
  Award,
  TrendingUp,
  FileText,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useReportCardStore } from '../../../stores/reportCardStore';
import { useStudentStore } from '../../../stores/studentStore';
import { generateReportCardPDF } from '../../../utils/reportCardPDF';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import StatCard from '../../ui/stat-card';
import { Progress } from 'components/ui/progress';
import type { ReportCard } from '../../../types/reportCard';

// Schéma de validation
const bulletinIndividualSchema = yup.object().shape({
  studentId: yup.string().required('L\'ID de l\'étudiant est requis'),
});

const IndividualBulletin: React.FC = () => {
  const {
    individualReportCard,
    loading,
    fetchIndividualReportCard,
    clearIndividualReportCard
  } = useReportCardStore();

  const { students, fetchStudents } = useStudentStore();

  const [showBulletin, setShowBulletin] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const bulletinRef = useRef<HTMLDivElement>(null);

  // Charger les étudiants au montage
  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(bulletinIndividualSchema),
    mode: 'onChange',
    defaultValues: {
      studentId: '',
    }
  });

  const studentId = watch('studentId');

  // Recherche et génération du bulletin
  const onSubmit = async (data: any) => {
    try {
      await fetchIndividualReportCard(data.studentId);
      
      // Trouver l'étudiant sélectionné
      const student = students.find(s => s.id === data.studentId);
      setSelectedStudent(student);
      
      setShowBulletin(true);
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      setShowBulletin(false);
    }
  };

  // Réinitialiser
  const handleReset = () => {
    setShowBulletin(false);
    setSelectedStudent(null);
    clearIndividualReportCard();
    setValue('studentId', '');
  };

  // Export PDF avec le nouvel utilitaire
  const handleExportPDF = async () => {
    if (!individualReportCard) {
      toast.error('Aucun bulletin à exporter');
      return;
    }

    try {
      toast.info('Génération du PDF en cours...', { autoClose: 1000 });
      
      // Format année académique: 2024-2025
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear - 1}-${currentYear}`;
      
      await generateReportCardPDF(individualReportCard, {
        headerImagePath: '/header-2.png',
        watermarkImagePath: '/paper.png',
        academicYear: academicYear,
        schoolName: 'LNCP'
      });
      
      toast.success('Bulletin exporté en PDF avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
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

  const getGradeBadgeColor = (moyenne: number, max: number = 20) => {
    const percentage = (moyenne / max) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulletin Individuel</h1>
          <p className="text-gray-600">
            Consultez le bulletin d'un étudiant
          </p>
        </div>
        
        {showBulletin && individualReportCard && (
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleReset}>
              <Search className="h-4 w-4 mr-2" />
              Nouvelle recherche
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        )}
      </div>

      {/* Formulaire de recherche */}
      {!showBulletin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Recherche d'Étudiant</span>
            </CardTitle>
            <CardDescription>
              Sélectionnez un étudiant pour générer son bulletin
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Étudiant *</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={students.map(student => ({
                        value: student.id,
                        label: `${student.firstName} ${student.lastName}`,
                        description: `${student.studentId} - ${student.grade || 'N/A'}`
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Rechercher un étudiant..."
                    />
                  )}
                />
                {errors.studentId && (
                  <p className="text-sm text-red-600">{errors.studentId.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isValid || loading.individual}
                  className="min-w-[150px]"
                >
                  {loading.individual ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Génération...</span>
                    </div>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Générer le Bulletin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Affichage du bulletin */}
      {showBulletin && individualReportCard && (
        <div ref={bulletinRef} className="space-y-6 print:space-y-4">
          {/* En-tête du bulletin */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white print:bg-gray-100 print:text-black">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Bulletin Scolaire - Année Complète
                  </CardTitle>
                  <CardDescription className="text-indigo-100 print:text-gray-600">
                    Année Scolaire {new Date().getFullYear()}
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

          {/* Informations de l'étudiant */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations de l'Étudiant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nom complet</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {individualReportCard.studentInfo.firstName} {individualReportCard.studentInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Matricule</span>
                    <p className="font-medium text-gray-900">
                      {individualReportCard.studentInfo.matricule}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Classe</span>
                    <p className="font-medium text-gray-900">
                      {individualReportCard.studentInfo.classRoom}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Salle</span>
                    <p className="font-medium text-gray-900">
                      {individualReportCard.studentInfo.room}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résumé des performances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Moyenne Générale"
              value={Number(individualReportCard.moyenneGenerale).toFixed(2)}
              description="/10"
              icon={Award}
              color={Number(individualReportCard.moyenneGenerale) >= 5 ? 'green' : 'red'}
            />
            
            <StatCard
              title="Total Notes T1"
              value={Number(individualReportCard.grades.sumOfNotes1).toFixed(2)}
              description={`Sur ${individualReportCard.grades.ponderationTrimestre1}`}
              icon={TrendingUp}
              color="blue"
            />
            
            <StatCard
              title="Décision"
              value={individualReportCard.decision || 'En attente'}
              description="Statut de passage"
              icon={FileText}
              color={individualReportCard.decision && individualReportCard.decision.includes('Promu') ? 'green' : 'red'}
            />
          </div>

          {/* Détail des notes */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Détail des Notes par Trimestre</CardTitle>
              <CardDescription>
                Notes obtenues pour l'année scolaire complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Matière
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Pondération
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Trimestre 1
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Trimestre 2
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Trimestre 3
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Combiner tous les cours des 3 trimestres */}
                      {(() => {
                        const allCourses = new Map<string, any>();
                        
                        // Trimestre 1
                        individualReportCard.grades.trimestre1.forEach(grade => {
                          allCourses.set(grade.courseCode, {
                            code: grade.courseCode,
                            titre: grade.courseTitre,
                            ponderation: Number(grade.ponderation),
                            t1: grade.note !== null ? Number(grade.note) : null,
                            t2: null,
                            t3: null
                          });
                        });
                        
                        // Trimestre 2
                        individualReportCard.grades.trimestre2.forEach(grade => {
                          if (allCourses.has(grade.courseCode)) {
                            allCourses.get(grade.courseCode)!.t2 = grade.note !== null ? Number(grade.note) : null;
                          } else {
                            allCourses.set(grade.courseCode, {
                              code: grade.courseCode,
                              titre: grade.courseTitre,
                              ponderation: Number(grade.ponderation),
                              t1: null,
                              t2: grade.note !== null ? Number(grade.note) : null,
                              t3: null
                            });
                          }
                        });
                        
                        // Trimestre 3
                        individualReportCard.grades.trimestre3.forEach(grade => {
                          if (allCourses.has(grade.courseCode)) {
                            allCourses.get(grade.courseCode)!.t3 = grade.note !== null ? Number(grade.note) : null;
                          } else {
                            allCourses.set(grade.courseCode, {
                              code: grade.courseCode,
                              titre: grade.courseTitre,
                              ponderation: Number(grade.ponderation),
                              t1: null,
                              t2: null,
                              t3: grade.note !== null ? Number(grade.note) : null
                            });
                          }
                        });
                        
                        return Array.from(allCourses.values()).map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {course.titre}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {course.code}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-gray-600 font-medium">
                                {course.ponderation}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {course.t1 !== null ? (
                                <span className={`font-bold ${course.t1 >= course.ponderation * 0.6 ? 'text-green-600' : 'text-red-600'}`}>
                                  {course.t1.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {course.t2 !== null ? (
                                <span className={`font-bold ${course.t2 >= course.ponderation * 0.6 ? 'text-green-600' : 'text-red-600'}`}>
                                  {course.t2.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {course.t3 !== null ? (
                                <span className={`font-bold ${course.t3 >= course.ponderation * 0.6 ? 'text-green-600' : 'text-red-600'}`}>
                                  {course.t3.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                      
                      {/* Ligne de totaux */}
                      <tr className="bg-gray-50 font-bold">
                        <td className="py-3 px-4" colSpan={2}>
                          Total
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Number(individualReportCard.grades.sumOfNotes1).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Number(individualReportCard.grades.sumOfNotes2).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Number(individualReportCard.grades.sumOfNotes3).toFixed(2)}
                        </td>
                      </tr>
                      
                      {/* Ligne de moyennes */}
                      <tr className="bg-indigo-50 font-bold">
                        <td className="py-3 px-4" colSpan={2}>
                          Moyenne (/10)
                        </td>
                        <td className="py-3 px-4 text-center text-indigo-700">
                          {Number(individualReportCard.grades.moyenneTrimestre1).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center text-indigo-700">
                          {Number(individualReportCard.grades.moyenneTrimestre2).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center text-indigo-700">
                          {Number(individualReportCard.grades.moyenneTrimestre3).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Résumé statistique */}
                <div className="bg-gray-50 rounded-lg p-4 print:bg-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${Number(individualReportCard.moyenneGenerale) >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(individualReportCard.moyenneGenerale).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Moyenne Générale</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {Array.from(new Set([
                          ...individualReportCard.grades.trimestre1.map(g => g.courseCode),
                          ...individualReportCard.grades.trimestre2.map(g => g.courseCode),
                          ...individualReportCard.grades.trimestre3.map(g => g.courseCode)
                        ])).length}
                      </div>
                      <div className="text-sm text-gray-600">Matières</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${individualReportCard.decision && individualReportCard.decision.includes('Promu') ? 'text-green-600' : 'text-red-600'}`}>
                        {individualReportCard.decision}
                      </div>
                      <div className="text-sm text-gray-600">Décision</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pied de page */}
          <div className="text-center text-sm text-gray-500 print:text-black border-t pt-4">
            <p>
              Bulletin généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </p>
            <p className="mt-1">
              Système de Gestion des Notes Académiques - LNCP
            </p>
            <p className="mt-1 text-xs">
              Étudiant : {individualReportCard.studentInfo.matricule} - {individualReportCard.studentInfo.firstName} {individualReportCard.studentInfo.lastName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualBulletin;
