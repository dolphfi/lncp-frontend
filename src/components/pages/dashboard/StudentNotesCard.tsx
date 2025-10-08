import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { FileText } from 'lucide-react';
import type { AcademicNote } from '../../../types/studentProfile';

interface StudentNotesCardProps {
  notes: AcademicNote[];
  paymentRequired: boolean;
}

const StudentNotesCard: React.FC<StudentNotesCardProps> = ({ notes, paymentRequired }) => {
  if (paymentRequired) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Dernières Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-gray-300" />
          <p className="mt-4 text-sm font-semibold text-gray-600">Accès aux notes restreint</p>
          <p className="text-xs text-gray-400">Veuillez régulariser le paiement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Dernières Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold text-sm text-gray-800">{note.course.titre}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Trim. 1</p>
                    <p className="font-semibold text-sm">{note.trimestre_1 || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trim. 2</p>
                    <p className="font-semibold text-sm">{note.trimestre_2 || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trim. 3</p>
                    <p className="font-semibold text-sm">{note.trimestre_3 || '-'}</p>
                  </div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-2">{note.anneeAcademique.label}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Aucune note disponible.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentNotesCard;
