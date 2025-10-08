import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../ui/badge';
import type { Payment } from '../../../types/studentProfile';

interface StudentPaymentsCardProps {
  payments: Payment[];
  paymentRequired: boolean;
  paymentMessage: string;
}

const StudentPaymentsCard: React.FC<StudentPaymentsCardProps> = ({ payments, paymentRequired, paymentMessage }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Statut Financier</CardTitle>
        <DollarSign className="w-4 h-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${paymentRequired ? 'text-red-600' : 'text-green-600'}`}>
          {paymentRequired ? 'Paiement Requis' : 'À jour'}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {paymentMessage || 'Aucune notification de paiement.'}
        </p>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 border-t pt-3">Historique Récent</h4>
          {payments.length > 0 ? (
            payments.slice(0, 3).map(payment => (
              <div key={payment.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{payment.reference}</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{payment.amount} G</p>
                  <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'destructive'}>{payment.status}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Aucun paiement récent.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentPaymentsCard;
