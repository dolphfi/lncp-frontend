/**
 * =====================================================
 * DIALOG DE GESTION DES COURS D'UN PROFESSEUR
 * =====================================================
 * Composant pour ajouter/retirer des cours à un professeur
 * Utilise les endpoints POST /employees/{id}/add-courses
 * et POST /employees/{id}/remove-courses
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import SearchableSelect from '../ui/searchable-select';

import { Employee } from '../../types/employee';
import { useEmployeeStore } from '../../stores/employeeStore';
import { useCourseStore } from '../../stores/courseStore';

interface ManageTeacherCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

/**
 * Dialog pour gérer les cours assignés à un professeur
 */
const ManageTeacherCoursesDialog: React.FC<ManageTeacherCoursesDialogProps> = ({
  open,
  onOpenChange,
  employee
}) => {
  const { addCoursesToEmployee, removeCoursesFromEmployee, loadingAction } = useEmployeeStore();
  const { allCourses, fetchCourses } = useCourseStore();
  
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState<string>('');
  const [coursesToRemove, setCoursesToRemove] = useState<string[]>([]);
  
  // Charger les cours au montage
  useEffect(() => {
    if (open && allCourses.length === 0) {
      console.log('📚 Chargement des cours disponibles...');
      fetchCourses();
    }
  }, [open, allCourses.length, fetchCourses]);
  
  // Réinitialiser les sélections quand le dialog s'ouvre/ferme
  useEffect(() => {
    if (!open) {
      setSelectedCourseToAdd('');
      setCoursesToRemove([]);
    }
  }, [open]);
  
  // Si pas d'employé ou pas un professeur, ne rien afficher
  if (!employee || employee.type !== 'professeur') {
    return null;
  }
  
  // Cours actuellement assignés au professeur
  const assignedCourses = employee.professorInfo?.assignedCourses || [];
  const assignedCourseIds = assignedCourses.map(c => c.courseId);
  
  // Cours disponibles (pas encore assignés)
  const availableCourses = allCourses.filter(
    course => !assignedCourseIds.includes(course.id)
  );
  
  // Options pour le select
  const courseOptions = availableCourses.map(course => ({
    value: course.id,
    label: `${course.code} - ${course.titre} (${course.categorie})`
  }));
  
  /**
   * Ajouter un cours au professeur
   */
  const handleAddCourse = async () => {
    if (!selectedCourseToAdd || !employee) {
      toast.warning('Veuillez sélectionner un cours à ajouter');
      return;
    }
    
    console.log('➕ Ajout du cours', selectedCourseToAdd, 'à l\'employé', employee.id);
    
    try {
      await addCoursesToEmployee(employee.id, [selectedCourseToAdd]);
      
      toast.success('Cours ajouté avec succès !');
      setSelectedCourseToAdd('');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du cours:', error);
      toast.error('Erreur lors de l\'ajout du cours');
    }
  };
  
  /**
   * Retirer les cours sélectionnés
   */
  const handleRemoveCourses = async () => {
    if (coursesToRemove.length === 0 || !employee) {
      toast.warning('Veuillez sélectionner au moins un cours à retirer');
      return;
    }
    
    console.log('➖ Retrait des cours', coursesToRemove, 'de l\'employé', employee.id);
    
    try {
      await removeCoursesFromEmployee(employee.id, coursesToRemove);
      
      toast.success(`${coursesToRemove.length} cours retirés avec succès !`);
      setCoursesToRemove([]);
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait des cours:', error);
      toast.error('Erreur lors du retrait des cours');
    }
  };
  
  /**
   * Basculer la sélection d'un cours pour suppression
   */
  const toggleCourseForRemoval = (courseId: string) => {
    setCoursesToRemove(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };
  
  const isLoading = loadingAction === 'assign';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Gérer les cours de {employee.firstName} {employee.lastName}
          </DialogTitle>
          <DialogDescription>
            Ajoutez ou retirez des cours assignés à ce professeur
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Section: Ajouter un cours */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600" />
              Ajouter un nouveau cours
            </h3>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Sélectionner un cours disponible</Label>
                <SearchableSelect
                  options={courseOptions}
                  value={selectedCourseToAdd}
                  onValueChange={(value) => setSelectedCourseToAdd(String(value || ''))}
                  placeholder={availableCourses.length > 0 ? 'Sélectionner un cours...' : 'Aucun cours disponible'}
                  disabled={isLoading || availableCourses.length === 0}
                />
                {availableCourses.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tous les cours sont déjà assignés à ce professeur
                  </p>
                )}
              </div>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddCourse}
                  disabled={!selectedCourseToAdd || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Section: Cours actuellement assignés */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Cours assignés ({assignedCourses.length})
              </span>
              {coursesToRemove.length > 0 && (
                <Button
                  type="button"
                  onClick={handleRemoveCourses}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrait...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Retirer ({coursesToRemove.length})
                    </>
                  )}
                </Button>
              )}
            </h3>
            
            {assignedCourses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun cours assigné pour le moment
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {assignedCourses.map((course) => {
                  const isSelected = coursesToRemove.includes(course.courseId);
                  const courseDetails = allCourses.find(c => c.id === course.courseId);
                  
                  return (
                    <div
                      key={course.courseId}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer
                        transition-all
                        ${isSelected 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                        }
                      `}
                      onClick={() => toggleCourseForRemoval(course.courseId)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          disabled={isLoading}
                        />
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {course.courseName}
                          </p>
                          {courseDetails && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {courseDetails.code}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {courseDetails.categorie}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Informations sur les limites */}
          {employee.professorInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Limite de cours:</strong> {assignedCourses.length} / {employee.professorInfo.maxCourses} cours assignés
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTeacherCoursesDialog;
