/**
 * Page de consultation du solde financier d'un étudiant
 */

import React, { useState } from 'react';
import { usePaymentStore } from '../../../stores/paymentStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  DollarSign,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
} from 'lucide-react';
import type { TransactionType } from '../../../types/payment';

const StudentBalanceView: React.FC = () => {
  const studentBalance = usePaymentStore((state) => state.studentBalance);
  const loading = usePaymentStore((state) => state.loading);
  const fetchStudentBalance = usePaymentStore((state) => state.fetchStudentBalance);
  const [matricule, setMatricule] = useState('');

  const handleSearch = async () => {
    if (matricule.trim()) {
      await fetchStudentBalance(matricule);
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

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Consultation du Solde Étudiant</h1>
        <p className="text-gray-500">Consultez le solde financier et l'historique des paiements</p>
      </div>

      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un étudiant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="matricule">Matricule de l'étudiant</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="matricule"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder="Ex: LNCP-FR-2024-0001"
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading || !matricule.trim()}>
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur le solde */}
      {studentBalance && (
        <>
          {/* Carte d'informations de l'étudiant */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'étudiant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="text-lg font-semibold">{studentBalance.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Matricule</p>
                  <p className="text-lg font-semibold">{studentBalance.studentMatricule}</p>
                </div>
                {studentBalance.lastPaymentDate && (
                  <div>
                    <p className="text-sm text-gray-500">Dernier paiement</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(studentBalance.lastPaymentDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques financières */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total payé</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {studentBalance.totalPaid.toLocaleString()} HTG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total dû</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {studentBalance.totalDue.toLocaleString()} HTG
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${studentBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {studentBalance.balance.toLocaleString()} HTG
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {studentBalance.balance >= 0 ? 'Compte à jour' : 'Solde débiteur'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historique des paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements ({studentBalance.payments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {studentBalance.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Année</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentBalance.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {getTypeLabel(payment.transactionType)}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {payment.amount.toLocaleString()} HTG
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.academicYear}</TableCell>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-gray-500">Aucun paiement trouvé</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Message si aucun résultat */}
      {!studentBalance && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              Entrez un matricule pour consulter le solde d'un étudiant
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentBalanceView;
