import React, { useState, useEffect, useRef } from 'react';
import { useAcademicStore } from '../../../stores/academicStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { SearchableSelect } from '../../ui/searchable-select';
import { StatCard } from '../../ui/stat-card';
import { Trophy, Medal, Award, Download, Printer, Users, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const TopLaureates: React.FC = () => {
  const { 
    globalStatistics, 
    topLaureates, 
    loading, 
    fetchGlobalStatistics, 
    fetchTopLaureates 
  } = useAcademicStore();
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>('ANNUEL');
  const printRef = useRef<HTMLDivElement>(null);

  // Charger les statistiques au montage
  useEffect(() => {
    fetchGlobalStatistics();
    fetchTopLaureates(50); // Charger plus de lauréats pour le filtrage
  }, [fetchGlobalStatistics, fetchTopLaureates]);

  // Filtrer les lauréats selon le niveau sélectionné
  const filteredLaureates = topLaureates?.filter((student: any) => 
    !selectedNiveau || student.niveau === selectedNiveau
  ) || [];

  // Export PDF
  const exportToPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
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

      pdf.save(`palmares-laureats-${selectedNiveau || 'tous'}-${selectedTrimestre}.pdf`);
      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  if (loading.globalStatistics || loading.topLaureates) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Palmarès des Lauréats</h1>
          <p className="text-gray-600 mt-1">
            Classement des meilleurs étudiants de l'établissement
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </Button>
          <Button 
            onClick={exportToPDF}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Étudiants"
          value={globalStatistics?.totalStudents || 0}
          icon={Users}
        />
        <StatCard
          title="Moyenne Générale"
          value={`${globalStatistics?.averageGrade?.toFixed(2) || '0.00'}/20`}
          icon={TrendingUp}
        />
        <StatCard
          title="Taux de Réussite"
          value={`${globalStatistics?.successRate?.toFixed(1) || '0.0'}%`}
          icon={Award}
        />
        <StatCard
          title="Mentions TB"
          value={globalStatistics?.excellentCount || 0}
          icon={Trophy}
        />
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrer les lauréats par niveau et trimestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrer par trimestre</label>
              <SearchableSelect
                options={[
                  { value: 'ANNUEL', label: 'Année complète' },
                  { value: 'T1', label: '1er Trimestre' },
                  { value: 'T2', label: '2ème Trimestre' },
                  { value: 'T3', label: '3ème Trimestre' }
                ]}
                value={selectedTrimestre}
                onValueChange={(value) => setSelectedTrimestre(value as string)}
                placeholder="Sélectionner..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrer par niveau</label>
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
                value={selectedNiveau}
                onValueChange={(value) => setSelectedNiveau(value as string)}
                placeholder="Sélectionner..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Podium des 3 premiers */}
      {filteredLaureates.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Podium</span>
            </CardTitle>
            <CardDescription>
              Les trois premiers lauréats de l'école
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 2ème place */}
              <div className="order-2 md:order-1">
                <div className="bg-gray-100 rounded-lg p-4 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                  </div>
                  <Medal className="h-12 w-12 text-gray-400 mx-auto mb-2 mt-2" />
                  <h3 className="font-semibold text-lg">{filteredLaureates[1]?.name}</h3>
                  <p className="text-sm text-gray-600">{filteredLaureates[1]?.matricule}</p>
                  <p className="text-sm text-gray-600">{filteredLaureates[1]?.niveau} - {filteredLaureates[1]?.classe}</p>
                  <p className="text-xl font-bold text-gray-700 mt-2">
                    {filteredLaureates[1]?.average?.toFixed(2)}/20
                  </p>
                </div>
              </div>

              {/* 1ère place */}
              <div className="order-1 md:order-2">
                <div className="bg-yellow-100 rounded-lg p-4 text-center relative border-2 border-yellow-300">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                  </div>
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-2 mt-2" />
                  <h3 className="font-semibold text-xl">{filteredLaureates[0]?.name}</h3>
                  <p className="text-sm text-gray-600">{filteredLaureates[0]?.matricule}</p>
                  <p className="text-sm text-gray-600">{filteredLaureates[0]?.niveau} - {filteredLaureates[0]?.classe}</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {filteredLaureates[0]?.average?.toFixed(2)}/20
                  </p>
                </div>
              </div>

              {/* 3ème place */}
              <div className="order-3">
                <div className="bg-orange-100 rounded-lg p-4 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                  </div>
                  <Award className="h-12 w-12 text-orange-500 mx-auto mb-2 mt-2" />
                  <h3 className="font-semibold text-lg">{filteredLaureates[2]?.name}</h3>
                  <p className="text-sm text-gray-600">{filteredLaureates[2]?.matricule}</p>
                  <p className="text-sm text-gray-600">{filteredLaureates[2]?.niveau} - {filteredLaureates[2]?.classe}</p>
                  <p className="text-xl font-bold text-orange-600 mt-2">
                    {filteredLaureates[2]?.average?.toFixed(2)}/20
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classement complet */}
      <div ref={printRef}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Classement Complet</span>
            </CardTitle>
            <CardDescription>
              Liste complète des lauréats {selectedNiveau && `- ${selectedNiveau}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLaureates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun lauréat trouvé pour les critères sélectionnés</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLaureates.map((student: any, index: number) => {
                  let bgColor = 'bg-white';
                  let borderColor = 'border-gray-200';
                  let textColor = 'text-gray-900';
                  
                  if (index === 0) {
                    bgColor = 'bg-yellow-50';
                    borderColor = 'border-yellow-200';
                    textColor = 'text-yellow-800';
                  } else if (index === 1) {
                    bgColor = 'bg-gray-50';
                    borderColor = 'border-gray-300';
                    textColor = 'text-gray-800';
                  } else if (index === 2) {
                    bgColor = 'bg-orange-50';
                    borderColor = 'border-orange-200';
                    textColor = 'text-orange-800';
                  }

                  return (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${bgColor} ${borderColor}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${textColor} ${bgColor}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${textColor}`}>{student.name}</h4>
                          <p className="text-sm text-gray-600">
                            {student.matricule} • {student.niveau} - {student.classe}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${textColor}`}>
                          {student.average?.toFixed(2)}/20
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.mention}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopLaureates;
