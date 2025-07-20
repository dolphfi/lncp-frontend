/**
 * =====================================================
 * COMPOSANT DATA TABLE RÉUTILISABLE
 * =====================================================
 * Ce composant fournit une table avec :
 * - Tri par colonnes
 * - Recherche et filtres
 * - Pagination
 * - Actions personnalisées
 * - Design avec shadcn/ui
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  X,
  Search,
  Filter,
  Building,
  Users,
  Activity,
  RotateCcw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './table';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuTrigger 
} from './dropdown-menu';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';

// =====================================================
// TYPES POUR LA CONFIGURATION DU DATA TABLE
// =====================================================

// Type pour définir une colonne
export interface Column<T> {
  key: keyof T;                    // Clé de la propriété dans l'objet
  label: string;                   // Libellé affiché dans l'en-tête
  sortable?: boolean;              // Si la colonne peut être triée
  filterable?: boolean;            // Si la colonne peut être filtrée
  searchable?: boolean;            // Si la colonne est incluse dans la recherche
  render?: (value: any, row: T) => React.ReactNode; // Fonction de rendu personnalisée
  width?: string;                  // Largeur de la colonne (ex: "200px", "20%")
  align?: 'left' | 'center' | 'right'; // Alignement du contenu
}

// Type pour les actions sur une ligne
export interface RowAction<T> {
  label: string;                   // Libellé de l'action
  icon?: React.ReactNode;          // Icône de l'action
  onClick: (row: T) => void;       // Fonction à exécuter
  variant?: 'default' | 'destructive'; // Style de l'action
  disabled?: (row: T) => boolean;  // Fonction pour désactiver l'action
}

// Type pour les options de tri
export interface SortOption {
  field: string;                   // Champ à trier
  order: 'asc' | 'desc';          // Ordre de tri
}

// Types pour les filtres
// type ColumnFiltersState = any[];
// type VisibilityState = Record<string, boolean>;
type FilterOption = {
  field: string;
  value: any;
  label: string;
};

// Type pour la pagination
export interface PaginationInfo {
  page: number;                    // Page actuelle
  limit: number;                   // Éléments par page
  total: number;                   // Total d'éléments
  totalPages: number;              // Total de pages
}

// Type pour les filtres spécifiques aux élèves
export interface StudentFilters {
  search?: string;
  grade?: string;
  roomId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  gender?: 'male' | 'female';
}

// Type pour une salle (pour les filtres)
export interface Room {
  id: string;
  name: string;
  classLevel: string;
}

// =====================================================
// PROPS DU COMPOSANT DATA TABLE
// =====================================================
interface DataTableProps<T> {
  data: T[];                       // Données à afficher
  columns: Column<T>[];            // Configuration des colonnes
  loading?: boolean;               // État de chargement
  searchable?: boolean;            // Activer la recherche globale
  searchPlaceholder?: string;      // Placeholder de la recherche
  rowActions?: RowAction<T>[];     // Actions disponibles sur chaque ligne
  pagination?: PaginationInfo;     // Informations de pagination
  onPageChange?: (page: number) => void; // Callback lors du changement de page
  onSort?: (sort: SortOption) => void;   // Callback lors du tri
  onSearch?: (search: string) => void;   // Callback lors de la recherche
  onFilter?: (filters: FilterOption[]) => void; // Callback lors du filtrage
  // ✨ Nouveaux props pour les filtres étudiants
  onStudentFilter?: (filters: Partial<StudentFilters>) => void; // Callback spécifique élèves
  currentFilters?: Partial<StudentFilters>; // Filtres actuels pour l'affichage
  rooms?: Room[];                  // Liste des salles pour les filtres
  emptyStateMessage?: string;      // Message lorsqu'il n'y a pas de données
  title?: string;                  // Titre de la table
  description?: string;            // Description de la table
  actions?: React.ReactNode;       // Actions globales (boutons d'ajout, etc.)
  className?: string;              // Classes CSS personnalisées
}

// =====================================================
// COMPOSANT PRINCIPAL DATA TABLE
// =====================================================
export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Rechercher...",
  rowActions = [],
  pagination,
  onPageChange,
  onSort,
  onSearch,
  onFilter,
  onStudentFilter,
  currentFilters,
  rooms = [],
  emptyStateMessage = "Aucune donnée disponible",
  title,
  description,
  actions,
  className = ""
}: DataTableProps<T>) {
  
  // =====================================================
  // ÉTAT LOCAL DU COMPOSANT
  // =====================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);
  // Variables d'état pour les filtres (commentées car non utilisées pour l'instant)
  // const [globalFilter, setGlobalFilter] = useState('');
  // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  // const [rowSelection, setRowSelection] = useState({});
  
  // =====================================================
  // GESTION DU TRI
  // =====================================================
  const handleSort = (field: string) => {
    let order: 'asc' | 'desc' = 'asc';
    
    // Si on trie déjà par ce champ, inverser l'ordre
    if (sortConfig?.field === field && sortConfig?.order === 'asc') {
      order = 'desc';
    }
    
    const newSortConfig = { field, order };
    setSortConfig(newSortConfig);
    
    // Appeler le callback parent si fourni
    if (onSort) {
      onSort(newSortConfig);
    }
  };
  
  // =====================================================
  // GESTION DE LA RECHERCHE
  // =====================================================
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Appeler le callback parent si fourni
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // =====================================================
  // RENDU DES ICÔNES DE TRI
  // =====================================================
  const renderSortIcon = (field: string) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.order === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };
  
  // =====================================================
  // RENDU DES ACTIONS DE LIGNE
  // =====================================================
  const renderRowActions = (row: T) => {
    if (!rowActions.length) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {rowActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row)}
              disabled={action.disabled ? action.disabled(row) : false}
              className={action.variant === 'destructive' ? 'text-red-600' : ''}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  // =====================================================
  // RENDU DE LA PAGINATION
  // =====================================================
  const renderPagination = () => {
    if (!pagination || !onPageChange) return null;
    
    const { page, totalPages } = pagination;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} sur {totalPages} ({pagination.total} éléments)
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Précédent
          </Button>
          
          {pages.map(pageNumber => (
            <Button
              key={pageNumber}
              variant={page === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              disabled={loading}
            >
              {pageNumber}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Suivant
          </Button>
        </div>
      </div>
    );
  };
  
  // =====================================================
  // RENDU PRINCIPAL DU COMPOSANT
  // =====================================================
  return (
    <Card className={`w-full ${className}`}>
      {/* En-tête de la table */}
      {(title || description || actions || searchable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
          
          {/* Barre de recherche et filtres */}
          {searchable && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
                
                {/* ✨ Menu de filtres avancé et moderne */}
                {onStudentFilter && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="relative transition-colors duration-200 hover:bg-accent"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtres
                        {/* Badge animé pour indiquer des filtres actifs */}
                        {currentFilters && (
                          Object.keys(currentFilters).filter(key => 
                            key !== 'search' && currentFilters[key as keyof StudentFilters]
                          ).length > 0
                        ) && (
                          <Badge 
                            variant="destructive" 
                            className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {Object.keys(currentFilters).filter(key => 
                              key !== 'search' && currentFilters[key as keyof StudentFilters]
                            ).length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-72 p-2 space-y-2 bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-xl"
                      sideOffset={8}
                    >
                      {/* Section Salles */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 space-y-2">
                        <DropdownMenuLabel className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-medium">
                          <Building className="h-4 w-4" />
                          Filtrer par Salle
                        </DropdownMenuLabel>
                        <div className="space-y-1">
                          <DropdownMenuCheckboxItem
                            checked={!currentFilters?.roomId}
                            onCheckedChange={() => onStudentFilter({ roomId: undefined })}
                            className="text-sm rounded-md transition-colors"
                          >
                            <span className="font-medium">Toutes les salles</span>
                          </DropdownMenuCheckboxItem>
                          {rooms.map((room) => (
                            <DropdownMenuCheckboxItem
                              key={room.id}
                              checked={currentFilters?.roomId === room.id}
                              onCheckedChange={(checked) => 
                                onStudentFilter({ roomId: checked ? room.id : undefined })
                              }
                              className="text-sm rounded-md transition-colors hover:bg-orange-100 dark:hover:bg-orange-800/30"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-300">
                                  {room.classLevel.slice(-1)}
                                </span>
                                {room.classLevel} - {room.name}
                              </span>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </div>
                      </div>
                      
                      {/* Section Sexe */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-2">
                        <DropdownMenuLabel className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                          <Users className="h-4 w-4" />
                          Filtrer par Sexe
                        </DropdownMenuLabel>
                        <div className="space-y-1">
                          <DropdownMenuCheckboxItem
                            checked={!currentFilters?.gender}
                            onCheckedChange={() => onStudentFilter({ gender: undefined })}
                            className="text-sm rounded-md transition-colors"
                          >
                            <span className="font-medium">Tous</span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={currentFilters?.gender === 'male'}
                            onCheckedChange={(checked) => 
                              onStudentFilter({ gender: checked ? 'male' : undefined })
                            }
                            className="text-sm rounded-md transition-colors hover:bg-purple-100 dark:hover:bg-purple-800/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs">
                                👨
                              </span>
                              Hommes
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={currentFilters?.gender === 'female'}
                            onCheckedChange={(checked) => 
                              onStudentFilter({ gender: checked ? 'female' : undefined })
                            }
                            className="text-sm rounded-md transition-colors hover:bg-purple-100 dark:hover:bg-purple-800/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center text-xs">
                                👩
                              </span>
                              Femmes
                            </span>
                          </DropdownMenuCheckboxItem>
                        </div>
                      </div>
                      
                      {/* Section Statut */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                        <DropdownMenuLabel className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                          <Activity className="h-4 w-4" />
                          Filtrer par Statut
                        </DropdownMenuLabel>
                        <div className="space-y-1">
                          <DropdownMenuCheckboxItem
                            checked={!currentFilters?.status}
                            onCheckedChange={() => onStudentFilter({ status: undefined })}
                            className="text-sm rounded-md transition-colors"
                          >
                            <span className="font-medium">Tous</span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={currentFilters?.status === 'active'}
                            onCheckedChange={(checked) => 
                              onStudentFilter({ status: checked ? 'active' : undefined })
                            }
                            className="text-sm rounded-md transition-colors hover:bg-green-100 dark:hover:bg-green-800/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-xs">
                                ✅
                              </span>
                              Actifs
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={currentFilters?.status === 'inactive'}
                            onCheckedChange={(checked) => 
                              onStudentFilter({ status: checked ? 'inactive' : undefined })
                            }
                            className="text-sm rounded-md transition-colors hover:bg-green-100 dark:hover:bg-green-800/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs">
                                ⏸️
                              </span>
                              Inactifs
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={currentFilters?.status === 'suspended'}
                            onCheckedChange={(checked) => 
                              onStudentFilter({ status: checked ? 'suspended' : undefined })
                            }
                            className="text-sm rounded-md transition-colors hover:bg-green-100 dark:hover:bg-green-800/30"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-xs">
                                🚫
                              </span>
                              Suspendus
                            </span>
                          </DropdownMenuCheckboxItem>
                        </div>
                      </div>
                      
                      {/* Bouton de réinitialisation moderne */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <DropdownMenuItem
                          onClick={() => onStudentFilter({
                            gender: undefined,
                            status: undefined,
                            roomId: undefined
                          })}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          <span className="font-medium">Effacer tous les filtres</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {/* ✨ Affichage moderne des filtres actifs */}
              {currentFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {currentFilters.gender && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 rounded-full transition-colors duration-200 hover:bg-purple-200 dark:hover:bg-purple-800/50"
                    >
                      <Users className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        Sexe: {currentFilters.gender === 'male' ? 'Hommes' : 'Femmes'}
                      </span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                        onClick={() => onStudentFilter?.({ gender: undefined })}
                      />
                    </Badge>
                  )}
                  {currentFilters.status && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 rounded-full transition-colors duration-200 hover:bg-green-200 dark:hover:bg-green-800/50"
                    >
                      <Activity className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        Statut: {
                          currentFilters.status === 'active' ? 'Actifs' :
                          currentFilters.status === 'inactive' ? 'Inactifs' : 'Suspendus'
                        }
                      </span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                        onClick={() => onStudentFilter?.({ status: undefined })}
                      />
                    </Badge>
                  )}
                  {currentFilters.roomId && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 rounded-full transition-colors duration-200 hover:bg-orange-200 dark:hover:bg-orange-800/50"
                    >
                      <Building className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        Salle: {(() => {
                          const room = rooms.find(r => r.id === currentFilters.roomId);
                          return room ? `${room.classLevel} - ${room.name}` : 'Inconnue';
                        })()}
                      </span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                        onClick={() => onStudentFilter?.({ roomId: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>
      )}
      
      {/* Contenu de la table */}
      <CardContent>
        {loading ? (
          // État de chargement
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          // État vide
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {emptyStateMessage}
          </div>
        ) : (
          // Table avec données
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key as string}
                      style={{ width: column.width }}
                      className={`
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'right' ? 'text-right' : ''}
                        ${column.sortable ? 'cursor-pointer select-none' : ''}
                      `}
                      onClick={() => column.sortable && handleSort(column.key as string)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && renderSortIcon(column.key as string)}
                      </div>
                    </TableHead>
                  ))}
                  {rowActions.length > 0 && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key as string}
                        className={`
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {column.render 
                          ? column.render((row as any)[column.key], row)
                          : (row as any)[column.key]
                        }
                      </TableCell>
                    ))}
                    {rowActions.length > 0 && (
                      <TableCell className="text-right">
                        {renderRowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}

// =====================================================
// EXEMPLES D'UTILISATION ET HELPERS
// =====================================================

// Helper pour créer des actions communes
export const createDefaultActions = <T extends { id: string }>(
  onView: (item: T) => void,
  onEdit: (item: T) => void,
  onDelete: (item: T) => void
): RowAction<T>[] => [
  {
    label: "Voir",
    icon: <Eye className="h-4 w-4" />,
    onClick: onView,
  },
  {
    label: "Modifier",
    icon: <Edit className="h-4 w-4" />,
    onClick: onEdit,
  },
  {
    label: "Supprimer",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: "destructive",
  },
];

// Helper pour créer un rendu de badge de statut
export const createStatusBadge = (status: string, colorMap: Record<string, string>) => {
  const color = colorMap[status] || 'default';
  return <Badge variant={color as any}>{status}</Badge>;
}; 