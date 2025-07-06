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
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
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
  DropdownMenuContent, 
  DropdownMenuItem, 
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

// Type pour les filtres
export interface FilterOption {
  field: string;                   // Champ à filtrer
  value: any;                      // Valeur du filtre
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith'; // Opérateur de comparaison
}

// Type pour la pagination
export interface PaginationInfo {
  page: number;                    // Page actuelle
  limit: number;                   // Éléments par page
  total: number;                   // Total d'éléments
  totalPages: number;              // Total de pages
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
  const [showFilters, setShowFilters] = useState(false);
  
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
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
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
          
          {/* Barre de recherche */}
          {searchable && (
            <div className="flex items-center gap-2 mt-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
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