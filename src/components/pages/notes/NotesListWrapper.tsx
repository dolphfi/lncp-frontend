/**
 * =====================================================
 * WRAPPER - LISTE DES NOTES
 * =====================================================
 * Composant wrapper qui affiche l'interface appropriée selon le rôle
 * - AdminNotesList pour les administrateurs (validation/rejet)
 * - NotesList pour les autres utilisateurs (consultation)
 */

import React, { useEffect, useState } from 'react';
import authService from '../../../services/authService';
import AdminNotesList from './AdminNotesList';
import NotesList from './NotesList';

/**
 * Liste des rôles admin qui peuvent valider/rejeter des notes
 */
const ADMIN_ROLES = [
  'Super Administrateur',
  'Administrateur',
  'ADMIN',
  'SUPER_ADMIN',
  'Secrétaire',
  'SECRETARY',
  'Censeur',
  'CENSORED'
];

/**
 * Composant wrapper principal
 */
const NotesListWrapper: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur depuis authService
    const user = authService.getUser();
    
    // Vérifier si l'utilisateur a un rôle admin
    if (user && user.role) {
      setIsAdmin(ADMIN_ROLES.includes(user.role));
    }
    
    setLoading(false);
  }, []);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Afficher l'interface appropriée
  if (isAdmin) {
    return <AdminNotesList />;
  }

  return <NotesList />;
};

export default NotesListWrapper;
