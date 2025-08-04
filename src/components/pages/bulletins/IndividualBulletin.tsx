import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Search,
  Download,
  Printer,
  User,
  Award,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAcademicStore } from '../../../stores/academicStore';
import { bulletinIndividualSchema } from '../../../schemas/academicSchemas';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import StatCard from '../../ui/stat-card';
import { Progress } from 'components/ui/progress';

const IndividualBulletin: React.FC = () => {
  const {
    studentBulletin,
    loading,
    fetchStudentBulletin,
    getStudentByMatricule
  } = useAcademicStore();

  const [showBulletin, setShowBulletin] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(bulletinIndividualSchema),
    mode: 'onChange',
    defaultValues: {
      matricule: '',
      trimestre: undefined
    }
  });

  // Recherche et génération du bulletin
  const onSubmit = async (data: any) => {
    try {
      await fetchStudentBulletin(data.matricule, data.trimestre);
      setShowBulletin(true);
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
    }
  };

  // Recherche rapide d'étudiant
  const handleQuickSearch = async (matricule: string) => {
    if (matricule.length < 3) return;

    try {
      const student = await getStudentByMatricule(matricule);
      if (student) {
        toast.success(`Étudiant trouvé: ${student.prenom} ${student.nom}`);
      }
    } catch (error) {
      // Erreur silencieuse pour la recherche rapide
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!bulletinRef.current || !studentBulletin) return;

    try {
      const canvas = await html2canvas(bulletinRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `bulletin_${studentBulletin.student.matricule}_${studentBulletin.trimestre}.pdf`;
      pdf.save(fileName);
      
      toast.success('Bulletin exporté en PDF avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  // Impression
  const handlePrint = () => {
    if (!bulletinRef.current) return;
    
    const printContent = bulletinRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
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
            Consultez le bulletin d'un étudiant par matricule
          </p>
        </div>
        
        {showBulletin && studentBulletin && (
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        )}
      </div>

      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche d'Étudiant</span>
          </CardTitle>
          <CardDescription>
            Saisissez le matricule de l'étudiant pour générer son bulletin
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule de l'étudiant *</Label>
                <Controller
                  name="matricule"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex: 2024001"
                      className={errors.matricule ? 'border-red-500' : ''}
                      onBlur={(e) => handleQuickSearch(e.target.value)}
                    />
                  )}
                />
                {errors.matricule && (
                  <p className="text-sm text-red-600">{errors.matricule.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre</Label>
                <Controller
                  name="trimestre"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={[
                        { value: 'T1', label: 'Premier Trimestre', description: 'T1' },
                        { value: 'T2', label: 'Deuxième Trimestre', description: 'T2' },
                        { value: 'T3', label: 'Troisième Trimestre', description: 'T3' },
                        { value: 'ANNUEL', label: 'Bulletin Annuel', description: 'Année complète' }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner le trimestre..."
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isValid || loading.bulletin}
                className="min-w-[150px]"
              >
                {loading.bulletin ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

      {/* Affichage du bulletin */}
      {showBulletin && studentBulletin && (
        <div ref={bulletinRef} className="space-y-6 print:space-y-4">
          {/* En-tête du bulletin */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white print:bg-gray-100 print:text-black">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Bulletin Scolaire - {studentBulletin.trimestre}
                  </CardTitle>
                  <CardDescription className="text-indigo-100 print:text-gray-600">
                    Année Scolaire 2024-2025
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
                      {studentBulletin.student.prenom} {studentBulletin.student.nom}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Matricule</span>
                    <p className="font-medium text-gray-900">
                      {studentBulletin.student.matricule}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Classe</span>
                    <p className="font-medium text-gray-900">
                      {studentBulletin.student.classe}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Niveau</span>
                    <p className="font-medium text-gray-900">
                      {studentBulletin.student.niveau}
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
              value={studentBulletin.moyenne_generale.toFixed(2)}
              description={`/${studentBulletin.total_ponderation > 0 ? 20 : 'N/A'}`}
              icon={Award}
              color={studentBulletin.moyenne_generale >= 10 ? 'green' : 'red'}
            />
            
            <StatCard
              title="Rang"
              value={studentBulletin.rang || 'N/A'}
              description="Position dans la classe"
              icon={TrendingUp}
              color="blue"
            />
            
            <StatCard
              title="Décision"
              value={studentBulletin.decision || 'En attente'}
              description="Statut de passage"
              icon={FileText}
              color={studentBulletin.decision === 'ADMIS' ? 'green' : 'red'}
            />
          </div>

          {/* Détail des notes */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Détail des Notes</CardTitle>
              <CardDescription>
                Notes obtenues par matière pour le {studentBulletin.trimestre}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentBulletin.notes.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">
                              Matière
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">
                              Note
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">
                              Pondération
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">
                              Pourcentage
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">
                              Appréciation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {studentBulletin.notes.map((noteItem, index) => {
                            const percentage = (noteItem.note / noteItem.ponderation) * 100;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                      {noteItem.course.nom}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {noteItem.course.code}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold ${getGradeColor(noteItem.note, noteItem.ponderation)}`}>
                                    {noteItem.note.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-gray-600">
                                    {noteItem.ponderation}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className={`font-medium ${getGradeColor(noteItem.note, noteItem.ponderation)}`}>
                                      {percentage.toFixed(1)}%
                                    </span>
                                    <Progress 
                                      value={percentage} 
                                      className="w-16 h-2"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge className={getGradeBadgeColor(noteItem.note, noteItem.ponderation)}>
                                    {percentage >= 80 ? 'Excellent' :
                                     percentage >= 60 ? 'Bien' :
                                     percentage >= 40 ? 'Passable' : 'Insuffisant'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Résumé statistique */}
                    <div className="bg-gray-50 rounded-lg p-4 print:bg-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {studentBulletin.notes.length}
                          </div>
                          <div className="text-sm text-gray-600">Matières</div>
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${getGradeColor(studentBulletin.moyenne_generale)}`}>
                            {studentBulletin.moyenne_generale.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">Moyenne</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {studentBulletin.total_ponderation}
                          </div>
                          <div className="text-sm text-gray-600">Total Pondération</div>
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${
                            studentBulletin.decision === 'ADMIS' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {studentBulletin.decision || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Décision</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune note disponible pour ce trimestre</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {studentBulletin.observations && (
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle>Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {studentBulletin.observations}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pied de page */}
          <div className="text-center text-sm text-gray-500 print:text-black border-t pt-4">
            <p>
              Bulletin généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
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

export default IndividualBulletin;
