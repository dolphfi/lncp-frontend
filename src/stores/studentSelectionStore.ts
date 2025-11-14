/**
 * Store pour gérer la sélection de l'élève par un parent
 */
import { create } from 'zustand';
import type { ChildData, ParentDashboard } from '../types/dashboard';

interface StudentSelectionState {
  // Données du parent
  parentData: ParentDashboard | null;
  
  // Élève actuellement sélectionné
  selectedStudent: ChildData | null;
  
  // Actions
  setParentData: (data: ParentDashboard) => void;
  setSelectedStudent: (student: ChildData) => void;
  clearSelection: () => void;
}

export const useStudentSelectionStore = create<StudentSelectionState>((set) => ({
  parentData: null,
  selectedStudent: null,
  
  setParentData: (data) => {
    set({ 
      parentData: data,
      // Sélectionner automatiquement le premier enfant
      selectedStudent: data.children[0] || null
    });
  },
  
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  
  clearSelection: () => set({ parentData: null, selectedStudent: null }),
}));
