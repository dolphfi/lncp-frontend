/*eslint-disable */
import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

import { useAcademicStore } from '../../../stores/academicStore';
import StatCard, { StatCardGroup } from '../../ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from 'components/ui/progress';

// Configuration Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AcademicDashboard: React.FC = () => {
  const {
    globalStatistics,
    topLaureates,
    loading,
    fetchGlobalStatistics,
    fetchTopLaureates
  } = useAcademicStore();

  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchGlobalStatistics(),
        fetchTopLaureates(10)
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Configuration des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Données pour le graphique de répartition par niveau
  const niveauxChartData = globalStatistics ? {
    labels: globalStatistics.repartition_par_niveau.map(item => item.niveau),
    datasets: [
      {
        label: 'Total étudiants',
        data: globalStatistics.repartition_par_niveau.map(item => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Admis',
        data: globalStatistics.repartition_par_niveau.map(item => item.admis),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  // Données pour le graphique en secteurs des taux de réussite
  const tauxReussiteChartData = globalStatistics ? {
    labels: ['Admis', 'Redoublants'],
    datasets: [
      {
        data: [globalStatistics.total_admis, globalStatistics.total_redoublants],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  // Données pour le graphique des moyennes par classe
  const moyennesClasseChartData = globalStatistics ? {
    labels: globalStatistics.repartition_par_classe.map(item => item.classe),
    datasets: [
      {
        label: 'Moyenne de classe',
        data: globalStatistics.repartition_par_classe.map(item => item.moyenne_classe),
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Académique</h1>
          <p className="text-gray-600">
            Vue d'ensemble des performances et statistiques scolaires
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Actualiser</span>
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <StatCardGroup>
        <StatCard
          title="Total Étudiants"
          value={globalStatistics ? globalStatistics.totalStudents.toString() : '0'}
          icon={Users}
          color="blue"
          loading={loading.globalStatistics}
        />
        
        <StatCard
          title="Taux de Réussite"
          value={globalStatistics ? `${globalStatistics.successRate.toFixed(1)}%` : '0%'}
          icon={GraduationCap}
          color={globalStatistics && globalStatistics.successRate >= 80 ? 'green' : 'yellow'}
          loading={loading.globalStatistics}
          trend={{
            value: 2.5,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Moyenne Générale"
          value={globalStatistics ? globalStatistics.averageGrade.toFixed(2) : '0.00'}
          icon={Award}
          color="purple"
          loading={loading.globalStatistics}
        />
        
        <StatCard
          title="Mentions 'Excellent'"
          value={globalStatistics ? globalStatistics.excellentCount.toString() : '0'}
          icon={TrendingUp}
          color="green"
          loading={loading.globalStatistics}
        />
      </StatCardGroup>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par niveau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Répartition par Niveau</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.globalStatistics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : niveauxChartData ? (
              <div className="h-64">
                <Bar data={niveauxChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Données non disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taux de réussite global */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Taux de Réussite Global</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.globalStatistics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : tauxReussiteChartData ? (
              <div className="h-64">
                <Pie data={tauxReussiteChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Données non disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Moyennes par classe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Moyennes par Classe</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.globalStatistics ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : moyennesClasseChartData ? (
            <div className="h-64">
              <Line data={moyennesClasseChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Données non disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meilleurs lauréats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Meilleurs Lauréats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.topLaureates ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topLaureates.length > 0 ? (
              <ul className="space-y-3">
                {topLaureates.map((laureate, index) => (
                  <li key={laureate.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="font-bold text-purple-700">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{laureate.name}</p>
                      <p className="text-sm text-gray-500">
                        Moyenne: <span className="font-medium text-gray-800">{laureate.average.toFixed(2)}</span> - {laureate.classe}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun lauréat à afficher</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taux de réussite par niveau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Taux de Réussite par Niveau</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.globalStatistics ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : globalStatistics && globalStatistics.repartition_par_niveau.length > 0 ? (
              <div className="space-y-4">
                {globalStatistics.repartition_par_niveau.map((niveau) => (
                  <div key={niveau.niveau} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {niveau.niveau}
                      </span>
                      <Badge className={
                        niveau.taux_reussite >= 80 ? 'bg-green-100 text-green-800' :
                        niveau.taux_reussite >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {niveau.taux_reussite.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={niveau.taux_reussite} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{niveau.admis}/{niveau.total} admis</span>
                      <span>{niveau.total} étudiants</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune statistique disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Résumé rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Résumé de l'Année Scolaire</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {globalStatistics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {globalStatistics.repartition_par_niveau.length}
                </div>
                <div className="text-sm text-gray-600">Niveaux</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {globalStatistics.repartition_par_classe.length}
                </div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {globalStatistics.total_admis}
                </div>
                <div className="text-sm text-gray-600">Admis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {globalStatistics.total_redoublants}
                </div>
                <div className="text-sm text-gray-600">Redoublants</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicDashboard;
