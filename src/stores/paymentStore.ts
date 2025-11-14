/**
 * Store Zustand pour la gestion des paiements
 * Architecture identique aux autres modules (students, courses, employees)
 */

import { create } from 'zustand';
import { paymentService } from '../services/payments/paymentService';
import { getErrorMessage, createErrorWithMessage } from '../utils/errorHandler';
import type {
  Payment,
  PaymentFilters,
  PaymentStats,
  CreateManualPaymentDto,
  CreateBankDepositDto,
  CreateOnlinePaymentDto,
  UpdatePaymentDto,
  StudentBalance,
  TransactionType,
  PaymentStatus,
} from '../types/payment';

interface PaymentState {
  // Données
  allPayments: Payment[];
  payments: Payment[];
  selectedPayment: Payment | null;
  studentBalance: StudentBalance | null;

  // États UI
  loading: boolean;
  error: string | null;

  // Filtres et pagination
  filters: PaymentFilters;
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;

  // Statistiques
  stats: PaymentStats;

  // Actions CRUD
  fetchPayments: () => Promise<void>;
  createManualPayment: (data: CreateManualPaymentDto) => Promise<Payment>;
  createBankDeposit: (data: CreateBankDepositDto) => Promise<Payment>;
  createOnlinePayment: (data: CreateOnlinePaymentDto) => Promise<{ payment: Payment; paymentUrl: string }>;
  getPaymentById: (id: string) => Promise<Payment>;
  updatePayment: (id: string, data: UpdatePaymentDto) => Promise<Payment>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentByReference: (reference: string) => Promise<Payment>;
  fetchStudentBalance: (studentMatricule: string) => Promise<void>;

  // Actions de filtrage et recherche
  setFilters: (filters: Partial<PaymentFilters>) => void;
  setSearchQuery: (query: string) => void;
  applyFiltersLocally: () => void;
  clearFilters: () => void;

  // Actions de pagination
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;

  // Actions utilitaires
  calculateStats: () => void;
  setSelectedPayment: (payment: Payment | null) => void;
  clearError: () => void;
}

const initialFilters: PaymentFilters = {
  transactionType: undefined,
  status: undefined,
  academicYear: undefined,
  studentId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

const initialStats: PaymentStats = {
  totalPayments: 0,
  totalAmount: 0,
  byType: {
    CASH: 0,
    CHECK: 0,
    BANK_DEPOSIT: 0,
    STRIPE: 0,
    PAYPAL: 0,
    BOUSANM: 0,
  },
  byStatus: {
    PENDING: 0,
    COMPLETED: 0,
    FAILED: 0,
    REFUNDED: 0,
  },
  pendingAmount: 0,
  completedAmount: 0,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
    // État initial
    allPayments: [],
    payments: [],
    selectedPayment: null,
    studentBalance: null,
    loading: false,
    error: null,
    filters: initialFilters,
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 10,
    stats: initialStats,

    // Récupérer tous les paiements
    fetchPayments: async () => {
      set({ loading: true, error: null });
      try {
        const payments = await paymentService.getAllPayments();
        set({
          allPayments: payments,
          payments: payments,
          loading: false,
        });
        get().calculateStats();
        get().applyFiltersLocally();
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
      }
    },

    // Créer un paiement manuel
    createManualPayment: async (data: CreateManualPaymentDto) => {
      set({ loading: true, error: null });
      try {
        const newPayment = await paymentService.createManualPayment(data);
        set((state) => ({
          allPayments: [newPayment, ...state.allPayments],
          loading: false
        }));
        get().calculateStats();
        get().applyFiltersLocally();
        return newPayment;
      } catch (error: any) {
        const errorMsg = getErrorMessage(error, 'Erreur lors de la création du paiement');
        set({
          error: errorMsg,
          loading: false,
        });
        // Re-lancer l'erreur avec le message pour que le formulaire puisse l'afficher
        throw createErrorWithMessage(error, 'Erreur lors de la création du paiement');
      }
    },

    // Créer un dépôt bancaire
    createBankDeposit: async (data: CreateBankDepositDto) => {
      set({ loading: true, error: null });
      try {
        const newPayment = await paymentService.createBankDeposit(data);
        set((state) => ({
          allPayments: [newPayment, ...state.allPayments],
          loading: false
        }));
        get().calculateStats();
        get().applyFiltersLocally();
        return newPayment;
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Créer un paiement en ligne
    createOnlinePayment: async (data: CreateOnlinePaymentDto) => {
      set({ loading: true, error: null });
      try {
        const response = await paymentService.createOnlinePayment(data);
        set((state) => ({
          allPayments: [response.payment, ...state.allPayments],
          loading: false
        }));
        get().calculateStats();
        get().applyFiltersLocally();
        return {
          payment: response.payment,
          paymentUrl: response.paymentUrl,
        };
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Récupérer un paiement par ID
    getPaymentById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const payment = await paymentService.getPaymentById(id);
        set({ selectedPayment: payment, loading: false });
        return payment;
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Mettre à jour un paiement
    updatePayment: async (id: string, data: UpdatePaymentDto) => {
      set({ loading: true, error: null });
      try {
        const updatedPayment = await paymentService.updatePayment(id, data);
        set((state) => ({
          allPayments: state.allPayments.map((p) => p.id === id ? updatedPayment : p),
          loading: false
        }));
        get().calculateStats();
        get().applyFiltersLocally();
        return updatedPayment;
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Supprimer un paiement
    deletePayment: async (id: string) => {
      set({ loading: true, error: null });
      try {
        await paymentService.deletePayment(id);
        set((state) => ({
          allPayments: state.allPayments.filter((p) => p.id !== id),
          loading: false
        }));
        get().calculateStats();
        get().applyFiltersLocally();
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Récupérer un paiement par référence
    getPaymentByReference: async (reference: string) => {
      set({ loading: true, error: null });
      try {
        const payment = await paymentService.getPaymentByReference(reference);
        set({ selectedPayment: payment, loading: false });
        return payment;
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
        throw new Error(errorMsg);
      }
    },

    // Récupérer le solde d'un étudiant
    fetchStudentBalance: async (studentMatricule: string) => {
      set({ loading: true, error: null });
      try {
        const balance = await paymentService.getStudentBalance(studentMatricule);
        set({ studentBalance: balance, loading: false });
      } catch (error: any) {
        const errorMsg = getErrorMessage(error);
        set({
          error: errorMsg,
          loading: false,
        });
      }
    },

    // Définir les filtres
    setFilters: (filters: Partial<PaymentFilters>) => {
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }));
      get().applyFiltersLocally();
    },

    // Définir la requête de recherche
    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      get().applyFiltersLocally();
    },

    // Appliquer les filtres localement
    applyFiltersLocally: () => {
      const { allPayments, filters, searchQuery } = get();
      let filtered = [...allPayments];

      // Filtre par type de transaction
      if (filters.transactionType) {
        filtered = filtered.filter((p) => p.transactionType === filters.transactionType);
      }

      // Filtre par statut
      if (filters.status) {
        filtered = filtered.filter((p) => p.status === filters.status);
      }

      // Filtre par année académique
      if (filters.academicYear) {
        filtered = filtered.filter((p) => p.academicYear === filters.academicYear);
      }

      // Filtre par étudiant
      if (filters.studentId) {
        filtered = filtered.filter((p) => p.studentId === filters.studentId);
      }

      // Filtre par date
      if (filters.dateFrom) {
        filtered = filtered.filter((p) => new Date(p.createdAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        filtered = filtered.filter((p) => new Date(p.createdAt) <= new Date(filters.dateTo!));
      }

      // Recherche textuelle
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) => {
            // Recherche dans les champs communs
            if (p.reference.toLowerCase().includes(query)) return true;
            if (p.description?.toLowerCase().includes(query)) return true;
            
            // Recherche dans les champs étudiant
            if (p.studentName?.toLowerCase().includes(query)) return true;
            if (p.studentMatricule?.toLowerCase().includes(query)) return true;
            
            // Recherche dans les champs employé
            if (p.employee?.user?.firstName?.toLowerCase().includes(query)) return true;
            if (p.employee?.user?.lastName?.toLowerCase().includes(query)) return true;
            if (p.employee?.employeeId?.toLowerCase().includes(query)) return true;
            
            return false;
          }
        );
      }

      set({ payments: filtered });
    },

    // Effacer les filtres
    clearFilters: () => {
      set({
        filters: initialFilters,
        searchQuery: '',
      });
      get().applyFiltersLocally();
    },

    // Définir la page
    setPage: (page: number) => {
      set({ currentPage: page });
    },

    // Définir le nombre d'éléments par page
    setItemsPerPage: (itemsPerPage: number) => {
      set({ itemsPerPage, currentPage: 1 });
    },

    // Calculer les statistiques
    calculateStats: () => {
      const { allPayments } = get();
      
      const stats: PaymentStats = {
        totalPayments: allPayments.length,
        totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
        byType: {
          CASH: 0,
          CHECK: 0,
          BANK_DEPOSIT: 0,
          STRIPE: 0,
          PAYPAL: 0,
          BOUSANM: 0,
        },
        byStatus: {
          PENDING: 0,
          COMPLETED: 0,
          FAILED: 0,
          REFUNDED: 0,
        },
        pendingAmount: 0,
        completedAmount: 0,
      };

      allPayments.forEach((payment) => {
        stats.byType[payment.transactionType]++;
        stats.byStatus[payment.status]++;
        
        if (payment.status === 'PENDING') {
          stats.pendingAmount += payment.amount;
        } else if (payment.status === 'COMPLETED') {
          stats.completedAmount += payment.amount;
        }
      });

      set({ stats });
    },

    // Définir le paiement sélectionné
    setSelectedPayment: (payment: Payment | null) => {
      set({ selectedPayment: payment });
    },

    // Effacer l'erreur
    clearError: () => {
      set({ error: null });
    },
}));
