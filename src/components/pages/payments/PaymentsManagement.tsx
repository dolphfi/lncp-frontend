/**
 * Interface de gestion des paiements
 * Architecture identique aux autres modules (students, courses, employees)
 */

import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../../../stores/paymentStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import ManualPaymentForm from '../../forms/ManualPaymentForm';
import BankDepositForm from '../../forms/BankDepositForm';
import {
  DollarSign,
  CreditCard,
  Building2,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { TransactionType, PaymentStatus } from '../../../types/payment';

const PaymentsManagement: React.FC = () => {
  const payments = usePaymentStore((state) => Array.isArray(state.payments) ? state.payments : []);
  const stats = usePaymentStore((state) => state.stats);
  const loading = usePaymentStore((state) => state.loading);
  const filters = usePaymentStore((state) => state.filters);
  const searchQuery = usePaymentStore((state) => state.searchQuery);
  const fetchPayments = usePaymentStore((state) => state.fetchPayments);
  const setFilters = usePaymentStore((state) => state.setFilters);
  const setSearchQuery = usePaymentStore((state) => state.setSearchQuery);
  const deletePayment = usePaymentStore((state) => state.deletePayment);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'manual' | 'bank'>('manual');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await deletePayment(id);
        toast.success('Paiement supprimé avec succès');
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
    };

    const labels: Record<PaymentStatus, string> = {
      PENDING: 'En attente',
      COMPLETED: 'Terminé',
      FAILED: 'Échoué',
      CANCELLED: 'Annulé',
      REFUNDED: 'Remboursé',
    };

    return (
      <Badge className={variants[status]} variant="outline">
        {labels[status]}
      </Badge>
    );
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'CASH':
        return <DollarSign className="w-4 h-4" />;
      case 'CHECK':
        return <CreditCard className="w-4 h-4" />;
      case 'BANK_DEPOSIT':
        return <Building2 className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    const labels: Record<TransactionType, string> = {
      CASH: 'Espèces',
      CHECK: 'Chèque',
      BANK_DEPOSIT: 'Dépôt bancaire',
      STRIPE: 'Stripe',
      PAYPAL: 'PayPal',
      BOUSANM: 'Bousanm',
    };
    return labels[type];
  };

  const openDialog = (type: 'manual' | 'bank') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Paiements</h1>
          <p className="text-sm sm:text-base text-gray-500">Gérez tous les paiements des étudiants</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog('manual')} className="w-full sm:w-auto">
                <DollarSign className="w-4 h-4 mr-2" />
                Paiement manuel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {dialogType === 'manual' && 'Nouveau paiement manuel'}
                  {dialogType === 'bank' && 'Nouveau dépôt bancaire'}
                </DialogTitle>
              </DialogHeader>
              {dialogType === 'manual' && (
                <ManualPaymentForm onSuccess={() => setDialogOpen(false)} onCancel={() => setDialogOpen(false)} />
              )}
              {dialogType === 'bank' && (
                <BankDepositForm onSuccess={() => setDialogOpen(false)} onCancel={() => setDialogOpen(false)} />
              )}
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => openDialog('bank')} className="w-full sm:w-auto">
            <Building2 className="w-4 h-4 mr-2" />
            Dépôt bancaire
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des paiements</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Montant total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAmount.toLocaleString()} HTG</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Complétés</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedAmount.toLocaleString()} HTG</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">En attente</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingAmount.toLocaleString()} HTG</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par référence, étudiant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par type */}
            <Select
              value={filters.transactionType || 'all'}
              onValueChange={(value) =>
                setFilters({ transactionType: value === 'all' ? undefined : (value as TransactionType) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="BANK_DEPOSIT">Dépôt bancaire</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="BOUSANM">Bousanm</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par statut */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({ status: value === 'all' ? undefined : (value as PaymentStatus) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="REFUNDED">Remboursé</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par année */}
            <Input
              placeholder="Année académique"
              value={filters.academicYear || ''}
              onChange={(e) => setFilters({ academicYear: e.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des paiements */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-lg sm:text-xl">Liste des paiements ({payments.length})</CardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucun paiement trouvé</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">{payment.reference}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <div>
                        <p className="font-medium text-sm">{payment.studentName}</p>
                        <p className="text-xs text-gray-500">{payment.studentMatricule}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(payment.transactionType)}
                        <span className="text-sm">{getTypeLabel(payment.transactionType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm whitespace-nowrap">{payment.amount.toLocaleString()} HTG</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{payment.academicYear}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{new Date(payment.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsManagement;
