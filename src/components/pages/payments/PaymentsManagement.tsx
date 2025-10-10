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
  X,
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
  const updatePayment = usePaymentStore((state) => state.updatePayment);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'manual' | 'bank'>('manual');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // États pour le formulaire de modification
  const [editStatus, setEditStatus] = useState<PaymentStatus>('PENDING');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setEditStatus(payment.status);
    setEditDescription(payment.description || '');
    setEditDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await updatePayment(selectedPayment.id, {
        status: editStatus,
        description: editDescription || undefined,
      });
      setEditDialogOpen(false);
      toast.success('Paiement modifié avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
    };

    const labels: Record<PaymentStatus, string> = {
      PENDING: 'En attente',
      COMPLETED: 'Terminé',
      FAILED: 'Échoué',
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
                        <p className="font-medium text-sm">{payment.studentName || 'Non disponible'}</p>
                        <p className="text-xs text-gray-500">
                          {payment.studentMatricule || (payment.studentId ? `ID: ${payment.studentId}` : '-')}
                        </p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(payment)}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditPayment(payment)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Dialog: Voir les détails */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Référence</p>
                  <p className="font-mono text-sm">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Étudiant</p>
                  <p className="text-sm">{selectedPayment.studentName || 'Non disponible'}</p>
                  {selectedPayment.studentMatricule ? (
                    <p className="text-xs text-gray-500">{selectedPayment.studentMatricule}</p>
                  ) : selectedPayment.studentId ? (
                    <p className="text-xs text-gray-500">ID: {selectedPayment.studentId}</p>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type de transaction</p>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedPayment.transactionType)}
                    <span className="text-sm">{getTypeLabel(selectedPayment.transactionType)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Montant</p>
                  <p className="text-lg font-bold">{selectedPayment.amount.toLocaleString()} HTG</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Année académique</p>
                  <p className="text-sm">{selectedPayment.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de création</p>
                  <p className="text-sm">{new Date(selectedPayment.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de mise à jour</p>
                  <p className="text-sm">{new Date(selectedPayment.updatedAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              {/* Informations spécifiques selon le type */}
              {selectedPayment.transactionType === 'CHECK' && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Informations du chèque</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPayment.checkNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Numéro de chèque</p>
                        <p className="text-sm">{selectedPayment.checkNumber}</p>
                      </div>
                    )}
                    {selectedPayment.employeeId && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID Employé</p>
                        <p className="text-sm">{selectedPayment.employeeId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPayment.transactionType === 'BANK_DEPOSIT' && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Informations du dépôt bancaire</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPayment.bankReceiptNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Numéro de reçu</p>
                        <p className="text-sm">{selectedPayment.bankReceiptNumber}</p>
                      </div>
                    )}
                    {selectedPayment.bankReceiptUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reçu bancaire</p>
                        <a href={selectedPayment.bankReceiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Voir le document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPayment.description && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Modifier le paiement */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le paiement</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Référence:</strong> {selectedPayment.reference}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Étudiant:</strong> {selectedPayment.studentName || 'Non disponible'} {selectedPayment.studentMatricule && `(${selectedPayment.studentMatricule})`}
                </p>
                {selectedPayment.studentId && (
                  <p className="text-xs text-blue-600 mt-1">
                    ID: {selectedPayment.studentId}
                  </p>
                )}
              </div>

              {/* Formulaire de modification */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut *</label>
                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as PaymentStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="FAILED">Échoué</SelectItem>
                      <SelectItem value="REFUNDED">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Statuts acceptés : En attente, Terminé, Échoué, Remboursé
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description (optionnel)</label>
                  <Input
                    placeholder="Ajouter une description..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSavePayment} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagement;
