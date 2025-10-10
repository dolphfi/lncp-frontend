/**
 * Types pour le module de gestion des paiements
 * Compatible avec l'API backend
 */

// Types de transaction
export type TransactionType = 'CASH' | 'CHECK' | 'BANK_DEPOSIT' | 'STRIPE' | 'PAYPAL' | 'BOUSANM';

// Statuts de paiement (selon l'API backend)
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Fournisseurs de paiement en ligne
export type OnlinePaymentProvider = 'STRIPE' | 'PAYPAL' | 'BOUSANM';

// Interface principale pour un paiement
export interface Payment {
  id: string;
  reference: string;
  studentId?: string;
  studentMatricule?: string;
  studentName?: string;
  amount: number;
  transactionType: TransactionType;
  status: PaymentStatus;
  academicYear: string;
  description?: string;
  receiptUrl?: string;
  
  // Relations avec les entités
  student?: any; // Objet étudiant complet du backend
  employee?: any; // Objet employé complet du backend
  employeeId?: string; // ID de l'employé pour les paiements CHECK
  
  // Champs spécifiques aux chèques
  checkNumber?: string;
  checkBank?: string;
  checkIssueDate?: string;
  issueDate?: string; // Alias pour checkIssueDate
  
  // Champs spécifiques aux dépôts bancaires
  bankName?: string;
  depositSlipNumber?: string;
  depositDate?: string;
  bankReceiptNumber?: string;
  bankReceiptUrl?: string;
  
  // Champs spécifiques aux paiements en ligne
  onlineProvider?: OnlinePaymentProvider;
  transactionId?: string;
  paymentUrl?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// DTO pour créer un paiement manuel CASH
export interface CreateCashPaymentDto {
  studentMatricule: string; // L'API attend studentMatricule
  transactionType: 'CASH';
  amount: number;
}

// DTO pour créer un paiement manuel CHECK
export interface CreateCheckPaymentDto {
  transactionType: 'CHECK';
  amount: number;
  employeeId: string;
  checkNumber: string;
  issueDate: string;
}

// DTO union pour paiement manuel
export type CreateManualPaymentDto = CreateCashPaymentDto | CreateCheckPaymentDto;

// DTO pour créer un dépôt bancaire
export interface CreateBankDepositDto {
  studentMatricule: string; // L'API attend studentMatricule
  amount: number;
  bankReceiptNumber: string;
  file: File;
}

// DTO pour initier un paiement en ligne
export interface CreateOnlinePaymentDto {
  studentId: string;
  amount: number;
  academicYear: string;
  provider: OnlinePaymentProvider;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

// DTO pour mettre à jour un paiement
export interface UpdatePaymentDto {
  status?: PaymentStatus;
  amount?: number;
  description?: string;
  receiptUrl?: string;
}

// Solde financier d'un étudiant
export interface StudentBalance {
  studentId: string;
  studentMatricule: string;
  studentName: string;
  totalPaid: number;
  totalDue: number;
  balance: number;
  lastPaymentDate?: string;
  payments: Payment[];
}

// Filtres pour les paiements
export interface PaymentFilters {
  transactionType?: TransactionType;
  status?: PaymentStatus;
  academicYear?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Statistiques des paiements
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  byType: Record<TransactionType, number>;
  byStatus: Record<PaymentStatus, number>;
  pendingAmount: number;
  completedAmount: number;
}

// Réponse de l'API pour la liste des paiements
export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

// Réponse de l'API pour un paiement en ligne
export interface OnlinePaymentResponse {
  payment: Payment;
  paymentUrl: string;
  transactionId: string;
}
