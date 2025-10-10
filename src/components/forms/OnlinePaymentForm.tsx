/**
 * Formulaire pour initier un paiement en ligne
 */

import React from 'react';
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
import { Textarea } from '../ui/textarea';
import { onlinePaymentSchema, type OnlinePaymentFormData, ONLINE_PROVIDER_OPTIONS } from '../../schemas/paymentSchema';
import { usePaymentStore } from '../../stores/paymentStore';
import { CreditCard, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

interface OnlinePaymentFormProps {
  onSuccess?: (paymentUrl: string) => void;
  onCancel?: () => void;
  students?: Array<{ id: string; name: string; matricule: string }>;
}

const OnlinePaymentForm: React.FC<OnlinePaymentFormProps> = ({
  onSuccess,
  onCancel,
  students = [],
}) => {
  const { createOnlinePayment, loading } = usePaymentStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<OnlinePaymentFormData>({
    resolver: zodResolver(onlinePaymentSchema),
    defaultValues: {
      academicYear: '2024-2025',
      provider: 'STRIPE',
    },
  });

  const onSubmit = async (data: OnlinePaymentFormData) => {
    try {
      const response = await createOnlinePayment(data);
      toast.success('Paiement en ligne initié avec succès !');
      reset();
      
      // Rediriger vers l'URL de paiement
      if (response.paymentUrl) {
        window.open(response.paymentUrl, '_blank');
      }
      
      onSuccess?.(response.paymentUrl);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'initiation du paiement');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sélection de l'étudiant */}
      <div className="space-y-2">
        <Label htmlFor="studentId">
          Étudiant <span className="text-red-500">*</span>
        </Label>
        <Select onValueChange={(value) => setValue('studentId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un étudiant" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} - {student.matricule}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.studentId && (
          <p className="text-sm text-red-500">{errors.studentId.message}</p>
        )}
      </div>

      {/* Fournisseur de paiement */}
      <div className="space-y-2">
        <Label htmlFor="provider">
          Fournisseur de paiement <span className="text-red-500">*</span>
        </Label>
        <Select
          defaultValue="STRIPE"
          onValueChange={(value) => setValue('provider', value as 'STRIPE' | 'PAYPAL' | 'BOUSANM')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ONLINE_PROVIDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.provider && (
          <p className="text-sm text-red-500">{errors.provider.message}</p>
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
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* Année académique */}
      <div className="space-y-2">
        <Label htmlFor="academicYear">
          Année académique <span className="text-red-500">*</span>
        </Label>
        <Input
          id="academicYear"
          {...register('academicYear')}
          placeholder="2024-2025"
        />
        {errors.academicYear && (
          <p className="text-sm text-red-500">{errors.academicYear.message}</p>
        )}
      </div>

      {/* URL de retour */}
      <div className="space-y-2">
        <Label htmlFor="returnUrl">URL de retour (optionnel)</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="returnUrl"
            {...register('returnUrl')}
            placeholder="https://example.com/success"
            className="pl-10"
          />
        </div>
        {errors.returnUrl && (
          <p className="text-sm text-red-500">{errors.returnUrl.message}</p>
        )}
      </div>

      {/* URL d'annulation */}
      <div className="space-y-2">
        <Label htmlFor="cancelUrl">URL d'annulation (optionnel)</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="cancelUrl"
            {...register('cancelUrl')}
            placeholder="https://example.com/cancel"
            className="pl-10"
          />
        </div>
        {errors.cancelUrl && (
          <p className="text-sm text-red-500">{errors.cancelUrl.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Informations complémentaires..."
          rows={3}
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Initiation...' : 'Initier le paiement'}
        </Button>
      </div>
    </form>
  );
};

export default OnlinePaymentForm;
