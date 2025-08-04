import React, { useState, useRef } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { BulletinCollectifFormData } from '../../../types/academic';
import {
  Search,
  Download,
  Printer,
  Users,
  Award,
  TrendingUp,
  Eye,
  BarChart3,
  Trophy
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAcademicStore } from '../../../stores/academicStore';
import { bulletinCollectifSchema } from '../../../schemas/academicSchemas';
import SearchableSelect from '../../ui/searchable-select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import StatCard from '../../ui/stat-card';

const CollectiveBulletin: React.FC = () => {
  const {
    classBulletin,
    loading,
    fetchClassBulletin
  } = useAcademicStore();

  const [showBulletin, setShowBulletin] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BulletinCollectifFormData>({
    resolver: yupResolver(bulletinCollectifSchema) as Resolver<BulletinCollectifFormData>,
    mode: 'onChange',
    defaultValues: {
      niveau: undefined,
      trimestre: 'T1' as const,
      classe: ''
    }
  });

  // Génération du bulletin de classe
  const onSubmit = async (data: BulletinCollectifFormData) => {
    try {
      await fetchClassBulletin(data.classe, data.trimestre);
      setShowBulletin(true);
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin de classe:', error);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!bulletinRef.current || !classBulletin) return;

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

      const fileName = `bulletin_classe_${classBulletin.classe}_${classBulletin.trimestre}.pdf`;
      pdf.save(fileName);
      
      toast.success('Bulletin de classe exporté en PDF avec succès');
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
        
        {showBulletin && classBulletin && (
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
            <span>Sélection de Classe</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez une classe et un trimestre pour générer le bulletin collectif
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data as BulletinCollectifFormData))} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau</Label>
                <Controller
                  name="niveau"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={[
                        { value: '', label: 'Tous les niveaux' },
                        { value: '6eme', label: '6ème' },
                        { value: '5eme', label: '5ème' },
                        { value: '4eme', label: '4ème' },
                        { value: '3eme', label: '3ème' },
                        { value: '2nde', label: '2nde' },
                        { value: '1ere', label: '1ère' },
                        { value: 'Tle', label: 'Terminale' }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner le niveau..."
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classe">Classe *</Label>
                <Controller
                  name="classe"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex: 6eme A"
                      className={errors.classe ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.classe && (
                  <p className="text-sm text-red-600">{errors.classe.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre *</Label>
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

      {/* Affichage du bulletin de classe */}
      {showBulletin && classBulletin && (
        <div ref={bulletinRef} className="space-y-6 print:space-y-4">
          {/* En-tête du bulletin */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white print:bg-gray-100 print:text-black">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Bulletin de Classe - {classBulletin.classe}
                  </CardTitle>
                  <CardDescription className="text-indigo-100 print:text-gray-600">
                    {classBulletin.trimestre} • Année Scolaire 2024-2025
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
              value={classBulletin.statistiques.total_etudiants}
              description="Étudiants dans la classe"
              icon={Users}
              color="blue"
            />
            
            <StatCard
              title="Admis"
              value={classBulletin.statistiques.admis}
              description={`${classBulletin.statistiques.taux_reussite.toFixed(1)}% de réussite`}
              icon={Award}
              color="green"
            />
            
            <StatCard
              title="Redoublants"
              value={classBulletin.statistiques.redoublants}
              description="Étudiants en difficulté"
              icon={TrendingUp}
              color="red"
            />
            
            <StatCard
              title="Moyenne de Classe"
              value={classBulletin.statistiques.moyenne_classe.toFixed(2)}
              description="/20"
              icon={BarChart3}
              color="purple"
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
                Classement par ordre de mérite - {classBulletin.classe}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Rang
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Étudiant
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Matricule
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Moyenne
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Décision
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Appréciation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classBulletin.students.map((studentBulletin, index) => (
                      <tr key={studentBulletin.student.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {studentBulletin.rang || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {studentBulletin.student.prenom} {studentBulletin.student.nom}
                            </span>
                            <span className="text-sm text-gray-500">
                              {studentBulletin.student.sexe === 'M' ? 'Masculin' : 'Féminin'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-mono">
                            {studentBulletin.student.matricule}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`font-bold text-lg ${getGradeColor(studentBulletin.moyenne_generale)}`}>
                              {studentBulletin.moyenne_generale.toFixed(2)}
                            </span>
                            <Progress 
                              value={(studentBulletin.moyenne_generale / 20) * 100} 
                              className="w-16 h-2"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getGradeBadgeColor(studentBulletin.decision || 'EN_ATTENTE')}>
                            {studentBulletin.decision || 'En attente'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm">
                            {studentBulletin.moyenne_generale >= 16 ? 'Excellent' :
                             studentBulletin.moyenne_generale >= 14 ? 'Très bien' :
                             studentBulletin.moyenne_generale >= 12 ? 'Bien' :
                             studentBulletin.moyenne_generale >= 10 ? 'Assez bien' :
                             studentBulletin.moyenne_generale >= 8 ? 'Passable' : 'Insuffisant'}
                          </span>
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
                    <span className="text-sm font-medium">Admis</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={classBulletin.statistiques.taux_reussite} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-bold text-green-600">
                        {classBulletin.statistiques.admis}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Redoublants</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={100 - classBulletin.statistiques.taux_reussite} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-bold text-red-600">
                        {classBulletin.statistiques.redoublants}
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
                    <span className="text-sm text-gray-600">Moyenne de classe</span>
                    <span className="font-medium">
                      {classBulletin.statistiques.moyenne_classe.toFixed(2)}/20
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de réussite</span>
                    <span className="font-medium text-green-600">
                      {classBulletin.statistiques.taux_reussite.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Meilleure moyenne</span>
                    <span className="font-medium text-green-600">
                      {Math.max(...classBulletin.students.map(s => s.moyenne_generale)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Moyenne la plus faible</span>
                    <span className="font-medium text-red-600">
                      {Math.min(...classBulletin.students.map(s => s.moyenne_generale)).toFixed(2)}
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
