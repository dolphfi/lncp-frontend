/**
 * Card affichant le statut financier et la liste complète des paiements
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { DollarSign, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import type { Payment } from '../../../types/dashboard';

interface StudentPaymentsCardProps {
  payments: Payment[];
  paymentRequired: boolean;
  paymentMessage?: string;
}

const StudentPaymentsCard: React.FC<StudentPaymentsCardProps> = ({ 
  payments, 
  paymentRequired, 
  paymentMessage 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complété
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Échoué
          </Badge>
        );
      case 'REFUNDED':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Remboursé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      CHECK: 'Chèque',
      BANK_DEPOSIT: 'Dépôt bancaire',
      STRIPE: 'Carte de crédit',
      PAYPAL: 'PayPal',
      BOUSANM: 'Bousanm',
    };
    return labels[type] || type;
  };

  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Statut Financier
          </CardTitle>
          <div className={`text-xl font-bold ${paymentRequired ? 'text-red-600' : 'text-green-600'}`}>
            {paymentRequired ? (
              <span className="flex items-center gap-1 text-sm">
                <AlertCircle className="w-4 h-4" />
                Paiement requis
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm">
                <CheckCircle className="w-4 h-4" />
                À jour
              </span>
            )}
          </div>
        </div>
        {paymentMessage && (
          <p className="text-sm text-gray-600 mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            {paymentMessage}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Résumé */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total payé</p>
            <p className="text-2xl font-bold text-blue-600">{formatAmount(totalPaid)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Nombre de paiements</p>
            <p className="text-2xl font-bold text-gray-700">{payments.length}</p>
          </div>
        </div>

        {/* Liste des paiements */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Historique des paiements
          </h4>
          
          {payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Référence</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="text-right font-semibold">Montant</TableHead>
                    <TableHead className="text-center font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {payment.reference}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTransactionTypeLabel(payment.transactionType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Aucun paiement enregistré pour le moment.</p>
            </div>
          )}
        </div>

        {/* Année académique */}
        {payments.length > 0 && (
          <div className="mt-4 text-xs text-gray-500 text-right">
            Année académique: {payments[0]?.academicYear}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPaymentsCard;
