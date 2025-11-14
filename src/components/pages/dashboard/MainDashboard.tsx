import React from 'react';
import Dashboard from './Dashboard';
import TeacherDashboardView from './TeacherDashboardView';
import { useAuthStore } from '../../../stores/authStoreSimple';

const MainDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Afficher le dashboard approprié selon le rôle */}
      {user?.role === 'TEACHER' ? (
        <TeacherDashboardView />
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default MainDashboard;
