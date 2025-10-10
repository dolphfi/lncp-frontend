/**
 * Formulaire pour créer un dépôt bancaire
 * Body: { studentMatricule, amount, bankReceiptNumber, file }
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SearchableSelect, type Option } from '../ui/searchable-select';
import { bankDepositSchema, type BankDepositFormData } from '../../schemas/paymentSchema';
import { usePaymentStore } from '../../stores/paymentStore';
import { useStudentStore } from '../../stores/studentStore';
import { Building2, FileText, Upload, Users } from 'lucide-react';
import { toast } from 'react-toastify';

interface BankDepositFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BankDepositForm: React.FC<BankDepositFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const createBankDeposit = usePaymentStore((state) => state.createBankDeposit);
  const loading = usePaymentStore((state) => state.loading);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Charger les étudiants
  const allStudents = useStudentStore((state) => state.allStudents);
  const fetchStudents = useStudentStore((state) => state.fetchStudents);
  const studentsLoading = useStudentStore((state) => state.loading);

  useEffect(() => {
    if (allStudents.length === 0) {
      fetchStudents();
    }
  }, [allStudents.length, fetchStudents]);

  // Transformer les étudiants en options pour le SearchableSelect
  const studentOptions: Option[] = useMemo(() => {
    return allStudents.map((student) => ({
      value: student.studentId,
      label: `${student.firstName} ${student.lastName}`,
      description: `${student.studentId} • ${student.grade || 'N/A'}`,
    }));
  }, [allStudents]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BankDepositFormData>({
    resolver: zodResolver(bankDepositSchema),
  });

  const selectedMatricule = watch('studentMatricule');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('file', file);
    }
  };

  const onSubmit = async (data: BankDepositFormData) => {
    try {
      await createBankDeposit(data);
      toast.success('Dépôt bancaire créé avec succès !');
      reset();
      setSelectedFile(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du dépôt bancaire');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sélection de l'étudiant */}
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

      {/* Numéro du bordereau bancaire */}
      <div className="space-y-2">
        <Label htmlFor="bankReceiptNumber">
          Numéro du bordereau bancaire <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="bankReceiptNumber"
            {...register('bankReceiptNumber')}
            placeholder="BRD-2024-001"
            className="pl-10"
          />
        </div>
        {errors.bankReceiptNumber && (
          <p className="text-sm text-red-500">{errors.bankReceiptNumber.message}</p>
        )}
      </div>

      {/* Fichier (bordereau scanné) */}
      <div className="space-y-2">
        <Label htmlFor="file">
          Bordereau scanné <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="file"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">{selectedFile ? selectedFile.name : 'Choisir un fichier'}</span>
          </label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
        {selectedFile && (
          <p className="text-sm text-gray-500">
            Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {errors.file && (
          <p className="text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading || !selectedFile}>
          {loading ? 'Création...' : 'Créer le dépôt'}
        </Button>
      </div>
    </form>
  );
};
export default BankDepositForm;
