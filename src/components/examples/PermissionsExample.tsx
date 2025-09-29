/**
 * =====================================================
 * EXEMPLE D'UTILISATION DES PERMISSIONS
 * =====================================================
 * Ce fichier montre comment utiliser les hooks de permissions dans les composants
 */

import React from 'react';
import { usePermission, useFeatureAccess, useIsAdmin, useCanManageEmployees, useCanManageNotes } from '../../hooks/usePermissions';
import { Button } from '../ui/button';

export function ExamplePermissionsComponent() {
  // Vérifier des permissions spécifiques
  const canReadUsers = usePermission('users.read');
  const canWriteUsers = usePermission('users.write');
  const canDeleteUsers = usePermission('users.delete');

  // Vérifier l'accès à des fonctionnalités
  const canAccessStudents = useFeatureAccess('students');
  const canAccessEmployees = useFeatureAccess('employees');
  const canAccessAdmin = useFeatureAccess('admin');

  // Vérifications spécialisées
  const isAdmin = useIsAdmin();
  const canManageEmployees = useCanManageEmployees();
  const canManageNotes = useCanManageNotes();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Permissions utilisateur</h3>

      {/* Permissions utilisateurs */}
      <div className="space-y-2">
        <h4 className="font-medium">Gestion des utilisateurs :</h4>
        <div className="flex gap-2">
          <Button disabled={!canReadUsers} variant={canReadUsers ? "default" : "secondary"}>
            Voir utilisateurs
          </Button>
          <Button disabled={!canWriteUsers} variant={canWriteUsers ? "default" : "secondary"}>
            Modifier utilisateurs
          </Button>
          <Button disabled={!canDeleteUsers} variant={canDeleteUsers ? "destructive" : "secondary"}>
            Supprimer utilisateurs
          </Button>
        </div>
      </div>

      {/* Accès aux fonctionnalités */}
      <div className="space-y-2">
        <h4 className="font-medium">Accès aux fonctionnalités :</h4>
        <div className="flex gap-2 flex-wrap">
          <Button disabled={!canAccessStudents} variant={canAccessStudents ? "default" : "secondary"}>
            Gestion des étudiants
          </Button>
          <Button disabled={!canAccessEmployees} variant={canAccessEmployees ? "default" : "secondary"}>
            Gestion des employés
          </Button>
          <Button disabled={!canAccessAdmin} variant={canAccessAdmin ? "default" : "secondary"}>
            Administration
          </Button>
        </div>
      </div>

      {/* Vérifications spécialisées */}
      <div className="space-y-2">
        <h4 className="font-medium">Vérifications spécialisées :</h4>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
            {isAdmin ? 'Administrateur' : 'Utilisateur standard'}
          </span>
          <span className={`px-2 py-1 rounded ${canManageEmployees ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
            {canManageEmployees ? 'Peut gérer les employés' : 'Ne peut pas gérer les employés'}
          </span>
          <span className={`px-2 py-1 rounded ${canManageNotes ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-400'}`}>
            {canManageNotes ? 'Peut gérer les notes' : 'Ne peut pas gérer les notes'}
          </span>
        </div>
      </div>
    </div>
  );
}
