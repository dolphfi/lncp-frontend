/**
 * Formulaire pour créer un paiement manuel (Cash ou Check)
 * CASH: { studentMatricule, transactionType, amount }
 * CHECK: { transactionType, amount, employeeId, checkNumber, issueDate }
 */

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SearchableSelect, type Option } from '../ui/searchable-select';
import { manualPaymentSchema, type ManualPaymentFormData } from '../../schemas/paymentSchema';
import { usePaymentStore } from '../../stores/paymentStore';
import { useStudentStore } from '../../stores/studentStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { DollarSign, CreditCard, Users, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

interface ManualPaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const createManualPayment = usePaymentStore((state) => state.createManualPayment);
  const loading = usePaymentStore((state) => state.loading);
  
  // Charger les étudiants
  const allStudents = useStudentStore((state) => state.allStudents);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const studentsLoading = useStudentStore((state) => state.loading);

  // Charger les employés
  const allEmployees = useEmployeeStore((state) => state.allEmployees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);
  const employeesLoading = useEmployeeStore((state) => state.loading);

  useEffect(() => {
    if (allStudents.length === 0) {
      fetchStudents();
    }
    if (allEmployees.length === 0) {
      fetchEmployees();
    }
  }, [allStudents.length, fetchStudents, allEmployees.length, fetchEmployees]);

  // Transformer les étudiants en options pour le SearchableSelect
  const studentOptions: Option[] = useMemo(() => {
    return allStudents.map((student) => ({
      value: student.studentId,
      label: `${student.firstName} ${student.lastName}`,
      description: `${student.studentId} • ${student.grade || 'N/A'}`,
    }));
  }, [allStudents]);

  // Transformer les employés en options pour le SearchableSelect
  const employeeOptions: Option[] = useMemo(() => {
    return allEmployees.map((employee) => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
      description: `${employee.employeeId} • ${employee.type}`,
    }));
  }, [allEmployees]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ManualPaymentFormData>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: {
      transactionType: 'CASH',
    },
  });

  const transactionType = watch('transactionType');
  const selectedMatricule = watch('studentMatricule');
  const selectedEmployeeId = watch('employeeId');

  const onSubmit = async (data: ManualPaymentFormData) => {
    try {
      await createManualPayment(data as any);
      toast.success('Paiement créé avec succès !');
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type de transaction */}
      <div className="space-y-2">
        <Label htmlFor="transactionType">
          Type de paiement <span className="text-red-500">*</span>
        </Label>
        <Select
          defaultValue="CASH"
          onValueChange={(value) => setValue('transactionType', value as 'CASH' | 'CHECK')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">💵 Espèces</SelectItem>
            <SelectItem value="CHECK">📝 Chèque</SelectItem>
          </SelectContent>
        </Select>
        {errors.transactionType && (
          <p className="text-sm text-red-500">{errors.transactionType.message}</p>
        )}
      </div>

      {/* Montant */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          Montant (HTG) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          placeholder="5000"
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Champs pour CASH */}
      {transactionType === 'CASH' && (
        <div className="space-y-2">
          <Label htmlFor="studentMatricule">
            Étudiant <span className="text-red-500">*</span>
          </Label>
          <SearchableSelect
            options={studentOptions}
            value={selectedMatricule}
            onValueChange={(value) => setValue('studentMatricule', value as string)}
            placeholder="Rechercher un étudiant..."
            searchPlaceholder="Rechercher par nom, prénom, matricule..."
            emptyText="Aucun étudiant trouvé"
            loading={studentsLoading}
            clearable
            renderOption={(option) => (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500 ml-6">{option.description}</span>
              </div>
            )}
            renderValue={(option) => (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{option.label}</span>
                <span className="text-xs text-gray-500">({option.value})</span>
              </div>
            )}
          />
          {errors.studentMatricule && (
            <p className="text-sm text-red-500">{errors.studentMatricule.message}</p>
          )}
        </div>
      )}

      {/* Champs pour CHECK */}
      {transactionType === 'CHECK' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Employé <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              options={employeeOptions}
              value={selectedEmployeeId}
              onValueChange={(value) => setValue('employeeId', value as string)}
              placeholder="Rechercher un employé..."
              searchPlaceholder="Rechercher par nom, prénom, ID..."
              emptyText="Aucun employé trouvé"
              loading={employeesLoading}
              clearable
              renderOption={(option) => (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-6">{option.description}</span>
                </div>
              )}
              renderValue={(option) => (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{option.label}</span>
                  <span className="text-xs text-gray-500">({option.description?.split(' • ')[0]})</span>
                </div>
              )}
            />
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkNumber">
              Numéro de chèque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="checkNumber"
              {...register('checkNumber')}
              placeholder="123456789"
            />
            {errors.checkNumber && (
              <p className="text-sm text-red-500">{errors.checkNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">
              Date d'émission <span className="text-red-500">*</span>
            </Label>
            <Input
              id="issueDate"
              type="date"
              {...register('issueDate')}
            />
            {errors.issueDate && (
              <p className="text-sm text-red-500">{errors.issueDate.message}</p>
            )}
          </div>
        </>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer le paiement'}
        </Button>
      </div>
    </form>
  );
};

export default ManualPaymentForm;
