import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStoreSimple';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center px-3 py-1.5 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Se déconnecter
    </button>
  );
};

export default LogoutButton;
