/*eslint-disable */
import React, {useState} from 'react';

import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Search,
  FileText,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Menu,
  X,
  GraduationCap,
  Award,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Tableau de Bord',
    href: '/academic/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble des statistiques'
  },
  {
    name: 'Gestion des Notes',
    href: '/academic/notes',
    icon: BookOpen,
    description: 'Saisie et consultation des notes',
    children: [
      {
        name: 'Saisie de Notes',
        href: '/academic/notes/entry',
        icon: Plus,
        description: 'Ajouter de nouvelles notes'
      },
      {
        name: 'Consultation',
        href: '/academic/notes/list',
        icon: Search,
        description: 'Consulter et modifier les notes'
      }
    ]
  },
  {
    name: 'Bulletins',
    href: '/academic/bulletins',
    icon: FileText,
    description: 'Génération et consultation des bulletins',
    children: [
      {
        name: 'Bulletin Individuel',
        href: '/academic/bulletins/individual',
        icon: Users,
        description: 'Bulletin d\'un étudiant'
      },
      {
        name: 'Bulletin Collectif',
        href: '/academic/bulletins/collective',
        icon: GraduationCap,
        description: 'Bulletin de classe'
      }
    ]
  },
  {
    name: 'Statistiques',
    href: '/academic/statistics',
    icon: BarChart3,
    description: 'Analyses et rapports',
    children: [
      {
        name: 'Palmarès',
        href: '/academic/statistics/laureates',
        icon: Award,
        description: 'Top des lauréats'
      },
      {
        name: 'Analyses par Classe',
        href: '/academic/statistics/classes',
        icon: TrendingUp,
        description: 'Statistiques détaillées'
      }
    ]
  }
];

const AcademicLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href) || 
           (navigation.find(item => item.href === href)?.children?.some(child => isActive(child.href)));
  };

  const NavigationItem: React.FC<{ item: NavigationItem; level?: number }> = ({ 
    item, 
    level = 0 
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.href);
    const active = isActive(item.href);

    return (
      <div>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
              level > 0 && "ml-4",
              active 
                ? "bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
              {item.badge && (
                <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            <svg
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded ? "rotate-90" : ""
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <Link
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
              level > 0 && "ml-4",
              active 
                ? "bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
            {item.badge && (
              <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}

        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavigationItem key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo et titre */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">LNCP</h1>
            <p className="text-sm text-gray-500">Gestion Académique</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavigationItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Informations utilisateur */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700">AD</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Administrateur</p>
            <p className="text-xs text-gray-500">admin@lncp.edu</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <Sidebar />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">LNCP</span>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Breadcrumb et actions */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link to="/academic" className="text-gray-400 hover:text-gray-500">
                    <GraduationCap className="h-5 w-5" />
                  </Link>
                </li>
                {location.pathname.split('/').filter(Boolean).slice(1).map((segment, index, array) => {
                  const href = '/' + ['academic', ...array.slice(0, index + 1)].join('/');
                  const isLast = index === array.length - 1;
                  const name = segment.charAt(0).toUpperCase() + segment.slice(1);
                  
                  return (
                    <li key={href} className="flex items-center">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {isLast ? (
                        <span className="ml-4 text-sm font-medium text-gray-700">
                          {name}
                        </span>
                      ) : (
                        <Link
                          to={href}
                          className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          {name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AcademicLayout;
