/**
 * =====================================================
 * STORE ZUSTAND POUR LES BULLETINS (REPORT CARDS)
 * =====================================================
 * Gestion de l'état des bulletins scolaires
 */

import { create } from 'zustand';
import { toast } from 'react-toastify';
import { noteService } from '../services/notes/noteService';
import type { ReportCard } from '../types/reportCard';

interface ReportCardState {
  // État des données
  individualReportCard: ReportCard | null;
  classroomReportCards: ReportCard[];
  roomReportCards: ReportCard[];
  generatedReportCards: ReportCard[];
  
  // État du chargement
  loading: {
    individual: boolean;
    classroom: boolean;
    room: boolean;
    generating: boolean;
    generated: boolean;
  };
  
  // Erreurs
  error: string | null;
  
  // Pagination pour bulletin individuel
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  // Actions
  fetchIndividualReportCard: (studentId: string, page?: number, limit?: number) => Promise<void>;
  fetchClassroomReportCards: (classroomId: string) => Promise<void>;
  fetchRoomReportCards: (roomId: string) => Promise<void>;
  generateAllReportCards: () => Promise<void>;
  fetchGeneratedReportCards: (batchId?: string) => Promise<void>;
  clearError: () => void;
  clearIndividualReportCard: () => void;
}

export const useReportCardStore = create<ReportCardState>((set, get) => ({
  // État initial
  individualReportCard: null,
  classroomReportCards: [],
  roomReportCards: [],
  generatedReportCards: [],
  
  loading: {
    individual: false,
    classroom: false,
    room: false,
    generating: false,
    generated: false,
  },
  
  error: null,
  
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  
  // Actions
  
  /**
   * Récupérer le bulletin d'un étudiant
   */
  fetchIndividualReportCard: async (studentId: string, page: number = 1, limit: number = 10) => {
    set((state) => ({
      loading: { ...state.loading, individual: true },
      error: null,
    }));
    
    try {
      console.log(`📊 Chargement bulletin étudiant ${studentId}...`);
      const response = await noteService.getStudentReportCard(studentId, page, limit);
      
      console.log('✅ Bulletin chargé:', response);
      
      set({
        individualReportCard: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
        },
        loading: { ...get().loading, individual: false },
      });
      
      toast.success('Bulletin chargé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur chargement bulletin:', error);
      const errorMessage = error.message || 'Erreur lors du chargement du bulletin';
      
      set({
        error: errorMessage,
        loading: { ...get().loading, individual: false },
      });
      
      toast.error(errorMessage);
    }
  },
  
  /**
   * Récupérer tous les bulletins d'une classe
   */
  fetchClassroomReportCards: async (classroomId: string) => {
    set((state) => ({
      loading: { ...state.loading, classroom: true },
      error: null,
    }));
    
    try {
      console.log(`📊 Chargement bulletins classe ${classroomId}...`);
      const reportCards = await noteService.getReportCardsByClassroom(classroomId);
      
      console.log(`✅ ${reportCards.length} bulletins chargés`);
      
      set({
        classroomReportCards: reportCards,
        loading: { ...get().loading, classroom: false },
      });
      
      toast.success(`${reportCards.length} bulletins chargés`);
    } catch (error: any) {
      console.error('❌ Erreur chargement bulletins classe:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des bulletins de la classe';
      
      set({
        error: errorMessage,
        loading: { ...get().loading, classroom: false },
      });
      
      toast.error(errorMessage);
    }
  },
  
  /**
   * Récupérer tous les bulletins d'une salle
   */
  fetchRoomReportCards: async (roomId: string) => {
    set((state) => ({
      loading: { ...state.loading, room: true },
      error: null,
    }));
    
    try {
      console.log(`📊 Chargement bulletins salle ${roomId}...`);
      const reportCards = await noteService.getReportCardsByRoom(roomId);
      
      console.log(`✅ ${reportCards.length} bulletins chargés`);
      
      set({
        roomReportCards: reportCards,
        loading: { ...get().loading, room: false },
      });
      
      toast.success(`${reportCards.length} bulletins chargés`);
    } catch (error: any) {
      console.error('❌ Erreur chargement bulletins salle:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des bulletins de la salle';
      
      set({
        error: errorMessage,
        loading: { ...get().loading, room: false },
      });
      
      toast.error(errorMessage);
    }
  },
  
  /**
   * Générer tous les bulletins (job asynchrone)
   */
  generateAllReportCards: async () => {
    set((state) => ({
      loading: { ...state.loading, generating: true },
      error: null,
    }));
    
    try {
      console.log('🚀 Lancement génération de tous les bulletins...');
      const response = await noteService.generateAllReportCards();
      
      console.log('✅ Génération planifiée:', response);
      
      set({
        loading: { ...get().loading, generating: false },
      });
      
      toast.success('Génération des bulletins lancée. Cela peut prendre quelques minutes.');
    } catch (error: any) {
      console.error('❌ Erreur génération bulletins:', error);
      const errorMessage = error.message || 'Erreur lors de la génération des bulletins';
      
      set({
        error: errorMessage,
        loading: { ...get().loading, generating: false },
      });
      
      toast.error(errorMessage);
    }
  },
  
  /**
   * Récupérer les bulletins générés
   */
  fetchGeneratedReportCards: async (batchId?: string) => {
    set((state) => ({
      loading: { ...state.loading, generated: true },
      error: null,
    }));
    
    try {
      console.log('📊 Chargement bulletins générés...');
      const reportCards = await noteService.getGeneratedReportCards(batchId);
      
      console.log(`✅ ${reportCards.length} bulletins générés chargés`);
      
      set({
        generatedReportCards: reportCards,
        loading: { ...get().loading, generated: false },
      });
      
      toast.success(`${reportCards.length} bulletins générés récupérés`);
    } catch (error: any) {
      console.error('❌ Erreur chargement bulletins générés:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des bulletins générés';
      
      set({
        error: errorMessage,
        loading: { ...get().loading, generated: false },
      });
      
      toast.error(errorMessage);
    }
  },
  
  /**
   * Effacer l'erreur
   */
  clearError: () => {
    set({ error: null });
  },
  
  /**
   * Effacer le bulletin individuel
   */
  clearIndividualReportCard: () => {
    set({ individualReportCard: null });
  },
}));
