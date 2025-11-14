/**
 * Table moderne pour afficher les notes avec les 3 trimestres
 * Inclut filtres et recherche
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Search, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { Note } from '../../../types/dashboard';

interface StudentNotesTableProps {
  notes: Note[];
  paymentRequired: boolean;
  paymentMessage?: string;
}

const StudentNotesTable: React.FC<StudentNotesTableProps> = ({
  notes,
  paymentRequired,
  paymentMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrimestre, setFilterTrimestre] = useState<string>('all');
  const [filterCategorie, setFilterCategorie] = useState<string>('all');

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(notes.map((n) => n.course.categorie));
    return Array.from(cats);
  }, [notes]);

  // Calculer la moyenne d'une note
  const calculateAverage = (note: Note): number | null => {
    const values = [note.trimestre_1, note.trimestre_2, note.trimestre_3]
      .filter((v) => v !== null)
      .map((v) => parseFloat(v!));

    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Déterminer la couleur de la note
  const getNoteColor = (noteValue: string | null): string => {
    if (!noteValue) return 'text-gray-400';
    const value = parseFloat(noteValue);
    if (value >= 14) return 'text-green-600 font-bold';
    if (value >= 10) return 'text-blue-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // Déterminer le badge de la moyenne
  const getAverageBadge = (avg: number | null) => {
    if (avg === null) return null;
    if (avg >= 14)
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <TrendingUp className="w-3 h-3 mr-1" />
          {avg.toFixed(2)}
        </Badge>
      );
    if (avg >= 10)
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {avg.toFixed(2)}
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        <TrendingDown className="w-3 h-3 mr-1" />
        {avg.toFixed(2)}
      </Badge>
    );
  };

  // Filtrer les notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Filtre de recherche
      const matchesSearch =
        note.course.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.course.categorie.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par trimestre
      const matchesTrimestre =
        filterTrimestre === 'all' ||
        (filterTrimestre === '1' && note.trimestre_1 !== null) ||
        (filterTrimestre === '2' && note.trimestre_2 !== null) ||
        (filterTrimestre === '3' && note.trimestre_3 !== null);

      // Filtre par catégorie
      const matchesCategorie =
        filterCategorie === 'all' || note.course.categorie === filterCategorie;

      return matchesSearch && matchesTrimestre && matchesCategorie;
    });
  }, [notes, searchTerm, filterTrimestre, filterCategorie]);

  // Calculer la moyenne générale
  const generalAverage = useMemo(() => {
    const averages = filteredNotes
      .map((note) => calculateAverage(note))
      .filter((avg): avg is number => avg !== null);

    if (averages.length === 0) return null;
    return averages.reduce((a, b) => a + b, 0) / averages.length;
  }, [filteredNotes]);

  if (paymentRequired) {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes Académiques
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-700 mb-2">
            Accès aux notes restreint
          </p>
          <p className="text-sm text-gray-500">
            {paymentMessage || 'Veuillez régulariser le paiement des frais scolaires.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes Académiques
          </CardTitle>
          {generalAverage !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Moyenne générale:</span>
              {getAverageBadge(generalAverage)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par trimestre */}
          <Select value={filterTrimestre} onValueChange={setFilterTrimestre}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tous les trimestres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les trimestres</SelectItem>
              <SelectItem value="1">Trimestre 1</SelectItem>
              <SelectItem value="2">Trimestre 2</SelectItem>
              <SelectItem value="3">Trimestre 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par catégorie */}
          <Select value={filterCategorie} onValueChange={setFilterCategorie}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table des notes */}
        {filteredNotes.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Cours</TableHead>
                  <TableHead className="font-semibold">Catégorie</TableHead>
                  <TableHead className="text-center font-semibold">
                    Trim. 1
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Trim. 2
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Trim. 3
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Moyenne
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Pondération
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => {
                  const avg = calculateAverage(note);
                  return (
                    <TableRow key={note.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {note.course.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {note.course.titre}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{note.course.categorie}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-center ${getNoteColor(note.trimestre_1)}`}
                      >
                        {note.trimestre_1 || '-'}
                      </TableCell>
                      <TableCell
                        className={`text-center ${getNoteColor(note.trimestre_2)}`}
                      >
                        {note.trimestre_2 || '-'}
                      </TableCell>
                      <TableCell
                        className={`text-center ${getNoteColor(note.trimestre_3)}`}
                      >
                        {note.trimestre_3 || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getAverageBadge(avg)}
                      </TableCell>
                      <TableCell className="text-center text-gray-600">
                        {note.course.ponderation}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {searchTerm || filterTrimestre !== 'all' || filterCategorie !== 'all'
                ? 'Aucune note ne correspond à vos critères de recherche.'
                : 'Aucune note disponible pour le moment.'}
            </p>
          </div>
        )}

        {/* Informations complémentaires */}
        {filteredNotes.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Affichage de {filteredNotes.length} note(s) sur {notes.length}
            </span>
            <span>Année académique: {notes[0]?.anneeAcademique.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentNotesTable;
