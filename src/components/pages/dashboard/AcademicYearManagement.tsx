import React, { useEffect, useState } from 'react';
import { useAcademicYearStore } from '../../../stores/academicYearStore';
import { CreateAcademicYearDTO } from '../../../services/academicYearService';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma de validation pour l'année académique
const academicYearSchema = z.object({
  label: z.string().min(1, "Le libellé est requis").max(50, "Le libellé ne peut pas dépasser 50 caractères"),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFin: z.string().min(1, "La date de fin est requise")
}).refine((data) => {
  const debut = new Date(data.dateDebut);
  const fin = new Date(data.dateFin);
  return debut < fin;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["dateFin"]
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

const FormField: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = 
({ label, required = false, error, children }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default function AcademicYearManagement() {
  const {
    academicYears,
    currentAcademicYear,
    loading,
    error,
    fetchAllAcademicYears,
    fetchCurrentAcademicYear,
    createAcademicYear,
    setCurrentAcademicYear,
    clearError
  } = useAcademicYearStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      label: '',
      dateDebut: '',
      dateFin: ''
    }
  });

  // Charger les données au montage
  useEffect(() => {
    fetchAllAcademicYears();
    fetchCurrentAcademicYear();
  }, [fetchAllAcademicYears, fetchCurrentAcademicYear]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data: AcademicYearFormData) => {
    setSubmitError(null);
    try {
      await createAcademicYear(data);
      setShowAddDialog(false);
      reset();
    } catch (error: any) {
      setSubmitError(error.message || "Une erreur s'est produite lors de la création");
    }
  };

  // Définir une année comme courante
  const handleSetCurrent = (academicYear: any) => {
    setCurrentAcademicYear(academicYear);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Années Académiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les années académiques de votre établissement
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Année
        </Button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Année académique courante */}
      {currentAcademicYear && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Année Académique Courante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {currentAcademicYear.label}
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Du {new Date(currentAcademicYear.dateDebut).toLocaleDateString()} 
                  au {new Date(currentAcademicYear.dateFin).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="default" className="bg-green-600">
                Actuelle
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des années académiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Toutes les Années Académiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          ) : academicYears.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune année académique trouvée</p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="mt-4"
                variant="outline"
              >
                Créer la première année
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {academicYears.map((year) => (
                <div
                  key={year.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {year.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Du {new Date(year.dateDebut).toLocaleDateString()} 
                      au {new Date(year.dateFin).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentAcademicYear?.id === year.id ? (
                      <Badge variant="default" className="bg-green-600">
                        Courante
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrent(year)}
                      >
                        Définir comme courante
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout d'année académique */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle Année Académique</DialogTitle>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Libellé" required error={errors.label?.message}>
              <Input
                {...register('label')}
                placeholder="Ex: 2025-2026"
                className="h-9"
              />
            </FormField>

            <FormField label="Date de début" required error={errors.dateDebut?.message}>
              <Input
                type="date"
                {...register('dateDebut')}
                className="h-9"
              />
            </FormField>

            <FormField label="Date de fin" required error={errors.dateFin?.message}>
              <Input
                type="date"
                {...register('dateFin')}
                className="h-9"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  reset();
                  setSubmitError(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
