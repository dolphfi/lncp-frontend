/**
 * Schémas Zod pour la validation des formulaires de paiement
 */

import { z } from 'zod';

// Schéma pour un paiement manuel (Cash ou Check)
export const manualPaymentSchema = z.object({
  transactionType: z.enum(['CASH', 'CHECK'], {
    required_error: 'Le type de transaction est requis',
  }),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  
  // Champs pour CASH
  studentMatricule: z.string().optional(),
  
  // Champs pour CHECK
  employeeId: z.string().optional(),
  checkNumber: z.string().optional(),
  issueDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.transactionType === 'CASH') {
      return !!data.studentMatricule;
    }
    if (data.transactionType === 'CHECK') {
      return !!data.employeeId && !!data.checkNumber && !!data.issueDate;
    }
    return true;
  },
  {
    message: 'Veuillez remplir tous les champs requis',
    path: ['transactionType'],
  }
);

// Schéma pour un dépôt bancaire
export const bankDepositSchema = z.object({
  studentMatricule: z.string().min(1, 'Le matricule de l\'étudiant est requis'),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  bankReceiptNumber: z.string().min(1, 'Le numéro du bordereau est requis'),
  file: z.instanceof(File, { message: 'Le fichier est requis' }),
});

// Schéma pour un paiement en ligne
export const onlinePaymentSchema = z.object({
  studentId: z.string().min(1, 'L\'étudiant est requis'),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  academicYear: z.string().min(1, 'L\'année académique est requise'),
  provider: z.enum(['STRIPE', 'PAYPAL', 'BOUSANM'], {
    required_error: 'Le fournisseur de paiement est requis',
  }),
  description: z.string().optional(),
  returnUrl: z.string().url('URL de retour invalide').optional(),
  cancelUrl: z.string().url('URL d\'annulation invalide').optional(),
});

// Schéma pour mettre à jour un paiement
export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']).optional(),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0').optional(),
  description: z.string().optional(),
  receiptUrl: z.string().url('URL de reçu invalide').optional(),
});

// Types inférés
export type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>;
export type BankDepositFormData = z.infer<typeof bankDepositSchema>;
export type OnlinePaymentFormData = z.infer<typeof onlinePaymentSchema>;
export type UpdatePaymentFormData = z.infer<typeof updatePaymentSchema>;

// Options pour les selects
export const TRANSACTION_TYPE_OPTIONS = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Chèque', value: 'CHECK' },
  { label: 'Dépôt bancaire', value: 'BANK_DEPOSIT' },
  { label: 'Stripe', value: 'STRIPE' },
  { label: 'PayPal', value: 'PAYPAL' },
  { label: 'Bousanm', value: 'BOUSANM' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { label: 'En attente', value: 'PENDING' },
  { label: 'Terminé', value: 'COMPLETED' },
  { label: 'Échoué', value: 'FAILED' },
  { label: 'Annulé', value: 'CANCELLED' },
  { label: 'Remboursé', value: 'REFUNDED' },
];

export const ONLINE_PROVIDER_OPTIONS = [
  { label: 'Stripe', value: 'STRIPE' },
  { label: 'PayPal', value: 'PAYPAL' },
  { label: 'Bousanm', value: 'BOUSANM' },
];
