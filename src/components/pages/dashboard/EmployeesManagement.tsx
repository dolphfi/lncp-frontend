import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Target,
  BookOpen,
  Users,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  X
} from 'lucide-react';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

import EmployeeForm from '../../forms/EmployeeForm';
import ManageTeacherCoursesDialog from '../../modals/ManageTeacherCoursesDialog';

import {
  useEmployeeStore,
  useEmployees,
  useEmployeeLoading,
  useEmployeeError,
  useEmployeeStats,
  useEmployeeFilters,
  useEmployeePagination
} from '../../../stores/employeeStore';

import { Employee, CreateEmployeeDto } from '../../../types/employee';
import { toast } from 'react-toastify';

// Options pour les filtres
const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'professeur', label: 'Professeur' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'technique', label: 'Technique' },
  { value: 'direction', label: 'Direction' },
  { value: 'maintenance', label: 'Maintenance' }
];

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'en_congé', label: 'En congé' },
  { value: 'retraité', label: 'Retraité' },
  { value: 'démission', label: 'Démission' }
];

const PROFESSOR_SPECIALTY_OPTIONS = [
  { value: 'mathématiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'langues', label: 'Langues' },
  { value: 'histoire', label: 'Histoire' },
  { value: 'géographie', label: 'Géographie' },
  { value: 'arts', label: 'Arts' },
  { value: 'sport', label: 'Sport' },
  { value: 'informatique', label: 'Informatique' }
];

export const EmployeesManagement: React.FC = () => {
  // État local pour la recherche avec debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // État pour le dialog de gestion des cours (professeurs uniquement)
  const [isManageCoursesDialogOpen, setIsManageCoursesDialogOpen] = useState(false);
  const [teacherToManage, setTeacherToManage] = useState<Employee | null>(null);

  const {
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setFilters,
    setSortOptions,
    changePage,
    clearError,
    resetFilters,
    fetchStats
  } = useEmployeeStore();

  const employees = useEmployees();
  const loading = useEmployeeLoading();
  const error = useEmployeeError();
  const stats = useEmployeeStats();
  const filters = useEmployeeFilters();
  const pagination = useEmployeePagination();
  const loadingAction = useEmployeeStore(state => state.loadingAction);

  useEffect(() => {
    console.log('🔄 Chargement des employés...');
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats]);

  // Synchronisation de la recherche avec debounce
  useEffect(() => {
    console.log('🔍 Recherche mise à jour:', debouncedSearchTerm);
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);

  // Log des informations de pagination
  useEffect(() => {
    console.log('📊 Informations de pagination:', pagination);
    console.log('📊 Nombre d\'employés affichés:', employees.length);
    console.log('📊 Total employés:', pagination.total);
    console.log('📊 Total pages:', pagination.totalPages);
  }, [pagination, employees]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await deleteEmployee(employeeId);
        toast.success('Employé supprimé avec succès !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'employé', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailsDialogOpen(true);
  };

  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };
  
  /**
   * Ouvrir le dialog de gestion des cours pour un professeur
   */
  const handleManageCourses = (employee: Employee) => {
    console.log('📚 Gestion des cours pour:', employee.firstName, employee.lastName);
    setTeacherToManage(employee);
    setIsManageCoursesDialogOpen(true);
  };

  const handleSubmitAdd = async (data: CreateEmployeeDto) => {
    try {
      await createEmployee(data);
      setIsAddDialogOpen(false);
      toast.success('Employé créé avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de la création de l\'employé', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleSubmitEdit = async (data: CreateEmployeeDto) => {
    if (!editingEmployee) return;

    try {
      await updateEmployee({ ...data, id: editingEmployee.id });
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      toast.success('Employé modifié avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification de l\'employé', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters({ [key]: value === 'all' ? undefined : value });
  };

  const handleSortChange = (field: keyof Employee) => {
    const currentSort = useEmployeeStore.getState().sortOptions;
    const newOrder = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc';
    setSortOptions({ field, order: newOrder });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactif': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_congé': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'retraité': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'démission': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      professeur: 'bg-blue-100 text-blue-800 border-blue-200',
      administratif: 'bg-green-100 text-green-800 border-green-200',
      technique: 'bg-purple-100 text-purple-800 border-purple-200',
      direction: 'bg-orange-100 text-orange-800 border-orange-200',
      maintenance: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Employés</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez les employés de l'établissement (professeurs, administratifs, techniques, etc.)
          </p>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleAddEmployee}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administratifs</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byType.administratif || 0}</p>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Professeurs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.byType.professeur || 0}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card className="shadow-sm border-0 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {EMPLOYEE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSortChange('lastName')}
                >
                  <div className="flex items-center gap-2">
                    Employé
                    <Filter className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Chargement des employés...
                    </div>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Users className="h-8 w-8" />
                      <p>Aucun employé trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">{employee.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getTypeColor(employee.type)}>
                        {employee.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-start gap-2">
                        {employee.type === 'professeur' && employee.professorInfo && (
                          <>
                            <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-blue-600">{employee.professorInfo.assignedCourses.length}</span>
                                <span className="text-gray-500">/ {employee.professorInfo.maxCourses} cours</span>
                              </div>
                              {employee.professorInfo.assignedCourses.length > 0 && (
                                <div className="text-xs space-y-1">
                                  {employee.professorInfo.assignedCourses.map((assignment, idx) => (
                                    <div key={idx} className="bg-blue-50 rounded px-2 py-1 border border-blue-100">
                                      <div className="font-medium text-blue-800">{assignment.courseName}</div>
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Building className="h-3 w-3" />
                                        {assignment.rooms.length} salle{assignment.rooms.length > 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        {employee.type === 'administratif' && employee.administrativeInfo && (
                          <>
                            <Building className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <span className="font-medium text-green-600">{employee.administrativeInfo.department}</span>
                              <div className="text-xs text-gray-500">{employee.administrativeInfo.position}</div>
                            </div>
                          </>
                        )}
                        {employee.type === 'technique' && employee.technicalInfo && (
                          <>
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <span className="font-medium text-purple-600">{employee.technicalInfo.skills.length} compétences</span>
                              <div className="text-xs text-gray-500">{employee.technicalInfo.certifications.length} certifications</div>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          {/* Action spéciale pour les professeurs: gérer leurs cours */}
                          {employee.type === 'professeur' && (
                            <DropdownMenuItem onClick={() => handleManageCourses(employee)}>
                              <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                              Gérer les cours
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
            {pagination.total} employés
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Précédent
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => changePage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedEmployee && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Détails de l'Employé
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{selectedEmployee.employeeId}</p>

                  <div className="flex flex-wrap gap-3">
                    <Badge className={getTypeColor(selectedEmployee.type)}>
                      {selectedEmployee.type}
                    </Badge>
                    <Badge className={getStatusColor(selectedEmployee.status)}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Informations Personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Né(e) le {formatDate(selectedEmployee.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedEmployee.address.street}, {selectedEmployee.address.postalCode} {selectedEmployee.address.city}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4" />
                      Informations Professionnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Embauché(e) le {formatDate(selectedEmployee.hireDate)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations spécifiques selon le type */}
                {selectedEmployee.type === 'professeur' && selectedEmployee.professorInfo && (
                  <Card className="shadow-sm border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <GraduationCap className="h-4 w-4" />
                        Informations Professeur
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedEmployee.professorInfo.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Diplômé(e) en {selectedEmployee.professorInfo.graduationYear}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {selectedEmployee.professorInfo.assignedCourses.length} cours assignés / {selectedEmployee.professorInfo.maxCourses} max
                        </span>
                      </div>

                      {/* Détails des assignations de cours */}
                      {selectedEmployee.professorInfo.assignedCourses.length > 0 && (
                        <div className="mt-4">
                          <h6 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Cours assignés ({selectedEmployee.professorInfo.assignedCourses.length})
                          </h6>
                          <div className="space-y-3">
                            {selectedEmployee.professorInfo.assignedCourses.map((assignment, index) => (
                              <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h6 className="font-semibold text-blue-900 text-lg">{assignment.courseName}</h6>
                                    <p className="text-sm text-blue-700">Code: {assignment.courseId}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                                      {assignment.rooms.length} salle{assignment.rooms.length > 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <Label className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                                      <Building className="h-4 w-4" />
                                      Salles assignées:
                                    </Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {assignment.rooms.length > 0 ? (
                                        assignment.rooms.map((roomId, idx) => (
                                          <Badge key={idx} variant="outline" className="bg-white border-blue-300 text-blue-700">
                                            {roomId === '1' ? 'Salle 101' :
                                              roomId === '2' ? 'Salle 102' :
                                                roomId === '3' ? 'Salle 103' :
                                                  roomId === '4' ? 'Salle 201' :
                                                    roomId === '5' ? 'Salle 202' :
                                                      roomId === '6' ? 'Salle 203' :
                                                        roomId === '7' ? 'Laboratoire Sciences' :
                                                          roomId === '8' ? 'Salle Informatique' : roomId}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-sm text-gray-500 italic">Aucune salle assignée</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedEmployee.type === 'administratif' && selectedEmployee.administrativeInfo && (
                  <Card className="shadow-sm border-0">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building className="h-4 w-4" />
                        Informations Administratives
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Département: {selectedEmployee.administrativeInfo.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Poste: {selectedEmployee.administrativeInfo.position}</span>
                      </div>
                      {selectedEmployee.administrativeInfo.supervisor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Superviseur: {selectedEmployee.administrativeInfo.supervisor}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedEmployee.type === 'technique' && selectedEmployee.technicalInfo && (
                  <Card className="shadow-sm border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="h-4 w-4" />
                        Informations Techniques
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedEmployee.technicalInfo.skills.length} compétences</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedEmployee.technicalInfo.certifications.length} certifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedEmployee.technicalInfo.equipment.length} équipements</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedEmployee.notes && (
                <Card className="shadow-sm border-0">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedEmployee.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modale d'ajout d'employé */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvel Employé
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={loadingAction === 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Modale de modification d'employé */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier l'Employé
            </DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSubmitEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingEmployee(null);
              }}
              isLoading={loadingAction === 'update'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des cours (professeurs uniquement) */}
      <ManageTeacherCoursesDialog
        open={isManageCoursesDialogOpen}
        onOpenChange={setIsManageCoursesDialogOpen}
        employee={teacherToManage}
      />

      {/* Affichage des erreurs */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 