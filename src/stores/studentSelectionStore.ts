/**
 * Store pour gérer la sélection de l'élève par un parent
 */
import { create } from 'zustand';
import type { ChildData, ParentProfileData } from '../types/studentProfile';

interface StudentSelectionState {
  // Données du parent
  parentData: ParentProfileData | null;
  
  // Élève actuellement sélectionné
  selectedStudent: ChildData | null;
  
  // Actions
  setParentData: (data: ParentProfileData) => void;
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
