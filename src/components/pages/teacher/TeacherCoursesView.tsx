/**
 * =====================================================
 * MES COURS - Vue pour les professeurs
 * =====================================================
 * Affiche uniquement les cours assignés au professeur connecté
 */

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  MapPin,
  Loader2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { useDashboardStore } from '../../../stores/dashboardStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

/**
 * Vue Mes Cours pour les professeurs
 */
export const TeacherCoursesView: React.FC = () => {
  const { 
    fetchDashboard, 
    getTeacherDashboard, 
    loading, 
    error 
  } = useDashboardStore();

  const teacherData = getTeacherDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDashboard();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du chargement des cours");
      }
    };

    loadData();
  }, [fetchDashboard]);

  // Filtrer les cours
  const filteredCourses = React.useMemo(() => {
    if (!teacherData?.courses) return [];

    let filtered = teacherData.courses;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.titre.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.categorie.toLowerCase().includes(query) ||
        course.classroom.name.toLowerCase().includes(query)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.statut === statusFilter);
    }

    return filtered;
  }, [teacherData?.courses, searchQuery, statusFilter]);

  // Afficher le loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si les données ne sont pas disponibles
  if (!teacherData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Impossible de charger vos cours</p>
          <p className="text-gray-400 text-sm mt-2">
            {error || "Une erreur s'est produite"}
          </p>
        </div>
      </div>
    );
  }

  const { courses, statistics } = teacherData;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Mes Cours
        </h1>
        <p className="text-gray-600">
          {statistics.totalCourses} cours assignés
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Rechercher et filtrer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par titre, code, catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Liste des cours
            </span>
            <Badge variant="secondary">
              {filteredCourses.length} cours
            </Badge>
          </CardTitle>
          <CardDescription>
            Cours que vous enseignez actuellement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length > 0 ? (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {/* Titre et code */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {course.titre}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {course.code}
                      </Badge>
                    </div>

                    {/* Détails */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          <span className="font-medium">Classe:</span> {course.classroom.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="truncate">
                          <span className="font-medium">Catégorie:</span> {course.categorie}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="truncate">
                          <span className="font-medium">Pondération:</span> {course.ponderation}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Badge statut */}
                  <Badge
                    variant={course.statut === 'Actif' ? 'default' : 'secondary'}
                    className="mt-3 sm:mt-0 sm:ml-4 self-start sm:self-center"
                  >
                    {course.statut}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-base font-medium mb-1">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Aucun cours trouvé' 
                  : 'Aucun cours assigné'}
              </p>
              <p className="text-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Vos cours apparaîtront ici'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {courses.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Cours Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.statut === 'Actif').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {new Set(courses.map(c => c.classroom.name)).size}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesView;
