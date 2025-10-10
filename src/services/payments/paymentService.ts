/**
 * Service API pour la gestion des paiements
 * Tous les endpoints backend intégrés
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import authService from '../authService';
import type {
  Payment,
  CreateManualPaymentDto,
  CreateBankDepositDto,
  CreateOnlinePaymentDto,
  UpdatePaymentDto,
  StudentBalance,
  PaymentsResponse,
  OnlinePaymentResponse,
} from '../../types/payment';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Configuration axios avec authentification
 */
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getAccessToken()}`,
  },
});

/**
 * POST /payments/manual-payment
 * Créer un paiement manuel (Cash ou Check)
 */
export const createManualPayment = async (
  data: CreateManualPaymentDto
): Promise<Payment> => {
  const response = await axios.post(
    `${API_URL}/payments/manual-payment`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * POST /payments/bank-deposit
 * Créer un dépôt bancaire (avec fichier)
 */
export const createBankDeposit = async (
  data: CreateBankDepositDto
): Promise<Payment> => {
  const formData = new FormData();
  formData.append('studentMatricule', data.studentMatricule);
  formData.append('amount', data.amount.toString());
  formData.append('bankReceiptNumber', data.bankReceiptNumber);
  formData.append('file', data.file);

  const response = await axios.post(
    `${API_URL}/payments/bank-deposit`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Initier un nouveau paiement en ligne (Stripe, Paypal, Bousanm)
 */
export const createOnlinePayment = async (
  data: CreateOnlinePaymentDto
): Promise<OnlinePaymentResponse> => {
  const response = await axios.post(
    `${API_URL}/payments/pay-online`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /payments/all-payments
 * Récupérer tous les paiements
 */
export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await axios.get(
    `${API_URL}/payments/all-payments`,
    getAuthHeaders()
  );
  // L'API retourne { data: [], total: 0, page: 1, limit: 10, lastPage: 0 }
  return response.data.data || [];
};

/**
 * GET /payments/{id}
 * Récupérer un paiement spécifique par ID
 */
export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await axios.get(
    `${API_URL}/payments/${id}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * PATCH /payments/{id}
 * Mettre à jour un paiement
 */
export const updatePayment = async (
  id: string,
  data: UpdatePaymentDto
): Promise<Payment> => {
  const response = await axios.patch(
    `${API_URL}/payments/${id}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * DELETE /payments/{id}
 * Supprimer un paiement
 */
export const deletePayment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/payments/${id}`, getAuthHeaders());
};

/**
 * GET /payments/by-reference/{reference}
 * Récupérer un paiement spécifique par sa référence
 */
export const getPaymentByReference = async (
  reference: string
): Promise<Payment> => {
  const response = await axios.get(
    `${API_URL}/payments/by-reference/${reference}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * GET /payments/balance/{studentMatricule}
 * Récupérer le solde financier d'un étudiant
 */
export const getStudentBalance = async (
  studentMatricule: string
): Promise<StudentBalance> => {
  const response = await axios.get(
    `${API_URL}/payments/balance/${studentMatricule}`,
    getAuthHeaders()
  );
  return response.data;
};

// Export de tous les services
export const paymentService = {
  createManualPayment,
  createBankDeposit,
  createOnlinePayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentByReference,
  getStudentBalance,
};
