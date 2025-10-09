import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "../../stores/authStoreSimple";
import { 
  LogOut,
  ChevronDown,
  Settings,
  User as UserIcon,
  Home,
  LayoutDashboard
} from "lucide-react";

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  const role = user?.role || 'USER';

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Header Desktop - Hidden on mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Tableau de Bord</h1>
              <p className="text-sm text-blue-900/60 mt-1">Bienvenue, {fullName || user?.email}</p>
            </div>
            
            {/* Profil utilisateur avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-900">{fullName || 'Utilisateur'}</p>
                  <p className="text-xs text-blue-900/60">{user?.email}</p>
                  <p className="text-xs text-blue-600 font-medium">{role}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-blue-200">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {(fullName || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className={`w-4 h-4 text-blue-900 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/my-profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-900 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Mon Profil
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-900 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Mobile Simple - Visible only on mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-blue-900">Tableau de Bord</h1>
          <p className="text-xs text-blue-900/60">Bienvenue, {fullName || user?.email}</p>
        </div>
      </div>

      {/* Bottom Navigation Mobile - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {/* Dashboard */}
          <button
            onClick={() => navigate('/dashboard-overview')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive('/dashboard-overview')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Accueil</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/my-profile')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive('/my-profile')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profil</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Paramètres</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Sortir</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
