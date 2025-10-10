import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import DashboardHeader from "../../includes/DashboardHeader";
import {
  DollarSign,
  Users,
  BookOpen,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  GraduationCap,
  Calendar,
  MapPin,
  AlertTriangle,
  Search,
  XCircle,
} from "lucide-react";
import { useStudentSelectionStore } from "../../../stores/studentSelectionStore";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import type { ChildData } from "../../../types/studentProfile";

const ParentStudentDashboard: React.FC = () => {
  const { parentData, setSelectedStudent } = useStudentSelectionStore();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Données fictives si parentData n'est pas disponible
  const mockChildren = [
    {
      studentInfo: {
        id: "23690c10-c976-4a19-94ad-c85dcdc1fbc2",
        firstName: "Willa",
        lastName: "Hamilton",
        matricule: "LNCP-WH-2025-0003",
        classroom: "NSI",
        room: "Salle XY",
        dateOfBirth: "2009-11-10",
        age: 16,
        lieuDeNaissance: "Corrupti ratione qu",
        communeDeNaissance: "Consequat Voluptate",
        sexe: "Femme",
        handicap: "Non",
        avatarUrl:
          "https://res.cloudinary.com/dsx2ogi7w/image/upload/v1757822724/students/ku7hrepcmssp22kjgu0b.png",
        vacation: "Après-midi (PM)",
      },
      notes: [
        {
          id: "1",
          course: {
            id: "1",
            code: "MATH-101",
            titre: "Mathématiques",
            categorie: "Sciences",
          },
          trimestre_1: "85",
          trimestre_2: "88",
          trimestre_3: "90",
          anneeAcademique: {
            id: "1",
            label: "2024-2025",
          },
        },
        {
          id: "2",
          course: {
            id: "2",
            code: "PHYS-101",
            titre: "Physique",
            categorie: "Sciences",
          },
          trimestre_1: "78",
          trimestre_2: "82",
          trimestre_3: null,
          anneeAcademique: {
            id: "1",
            label: "2024-2025",
          },
        },
      ],
      paymentRequired: true,
      paymentMessage: "Frais scolaires non payés - Solde restant: $5,000",
      payments: [
        {
          id: "1",
          amount: 2500,
          transactionType: "Frais de scolarité",
          status: "Complété",
          academicYear: "2024-2025",
          reference: "PAY-001",
          createdAt: "2024-09-15",
        },
      ],
      attendances: [
        {
          id: "1",
          timestamp: "2025-01-05T08:00:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "2",
          timestamp: "2025-01-06T08:00:00Z",
          type: "Entrée",
          status: "Absent",
          reason: "Maladie",
          isJustified: true,
        },
        {
          id: "3",
          timestamp: "2025-01-07T08:00:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "4",
          timestamp: "2025-01-08T08:00:00Z",
          type: "Entrée",
          status: "Retard",
          reason: "Transport",
          isJustified: false,
        },
      ],
      schedule: [],
    },
    {
      studentInfo: {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        firstName: "Jean",
        lastName: "Dupont",
        matricule: "LNCP-JD-2025-0012",
        classroom: "NSIII",
        room: "Salle A",
        dateOfBirth: "2008-03-15",
        age: 17,
        lieuDeNaissance: "Port-au-Prince",
        communeDeNaissance: "Delmas",
        sexe: "Homme",
        handicap: "Non",
        avatarUrl: null,
        vacation: "Matin (AM)",
      },
      notes: [
        {
          id: "3",
          course: {
            id: "3",
            code: "HIST-101",
            titre: "Histoire",
            categorie: "Sciences Humaines",
          },
          trimestre_1: "92",
          trimestre_2: "95",
          trimestre_3: "93",
          anneeAcademique: {
            id: "1",
            label: "2024-2025",
          },
        },
        {
          id: "4",
          course: {
            id: "4",
            code: "FR-101",
            titre: "Français",
            categorie: "Langues",
          },
          trimestre_1: "88",
          trimestre_2: "90",
          trimestre_3: "91",
          anneeAcademique: {
            id: "1",
            label: "2024-2025",
          },
        },
        {
          id: "5",
          course: {
            id: "5",
            code: "ENG-101",
            titre: "Anglais",
            categorie: "Langues",
          },
          trimestre_1: "85",
          trimestre_2: "87",
          trimestre_3: null,
          anneeAcademique: {
            id: "1",
            label: "2024-2025",
          },
        },
      ],
      paymentRequired: false,
      paymentMessage: "",
      payments: [
        {
          id: "2",
          amount: 15000,
          transactionType: "Frais de scolarité",
          status: "Complété",
          academicYear: "2024-2025",
          reference: "PAY-002",
          createdAt: "2024-09-01",
        },
        {
          id: "3",
          amount: 3000,
          transactionType: "Frais supplémentaires",
          status: "Complété",
          academicYear: "2024-2025",
          reference: "PAY-003",
          createdAt: "2024-10-15",
        },
      ],
      attendances: [
        {
          id: "5",
          timestamp: "2025-01-05T07:30:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "6",
          timestamp: "2025-01-06T07:30:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "7",
          timestamp: "2025-01-07T07:30:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "8",
          timestamp: "2025-01-08T07:30:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
        {
          id: "9",
          timestamp: "2025-01-09T07:30:00Z",
          type: "Entrée",
          status: "Présent",
          reason: "",
          isJustified: true,
        },
      ],
      schedule: [],
    },
  ];

  const children: ChildData[] = parentData?.children || mockChildren;

  // Filtrer les élèves selon la recherche
  const filteredChildren = children.filter((child: ChildData) =>
    `${child.studentInfo.firstName} ${child.studentInfo.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sélectionner le premier élève par défaut
  React.useEffect(() => {
    if (children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].studentInfo.id);
    }
  }, [children, selectedStudentId]);

  // Sélectionner automatiquement le premier élève filtré lors de la recherche
  React.useEffect(() => {
    if (searchQuery && filteredChildren.length > 0) {
      setSelectedStudentId(filteredChildren[0].studentInfo.id);
      const child = filteredChildren[0];
      setSelectedStudent(child);
    } else if (!searchQuery && children.length > 0) {
      // Si on efface la recherche, revenir au premier élève
      setSelectedStudentId(children[0].studentInfo.id);
      setSelectedStudent(children[0]);
    }
  }, [searchQuery, filteredChildren.length]);

  const selectedChild = children.find(
    (child: ChildData) => child.studentInfo.id === selectedStudentId
  );

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const child = children.find(
      (c: ChildData) => c.studentInfo.id === studentId
    );
    if (child) {
      setSelectedStudent(child);
    }
  };

  const handleViewProfile = () => {
    if (selectedChild) {
      setSelectedStudent(selectedChild);
      navigate("/student-profile");
    }
  };

  // Données de simulation
  const stats = {
    totalRevenue: 56389.5,
    subscriptions: children.length,
    totalAbsences: 12,
    averageGrade: 85.4,
    presentPercentage: 92,
    lateCount: 3,
  };

  const overviewData = [
    { name: "Jan", total: 4000 },
    { name: "Fev", total: 3000 },
    { name: "Mar", total: 5000 },
    { name: "Avr", total: 4500 },
    { name: "Mai", total: 6000 },
    { name: "Juin", total: 7500 },
  ];

  const recentPayments = [
    {
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      amount: 2500,
      avatar: "/avatars/01.png",
    },
    {
      name: "Marie Claire",
      email: "marie.claire@email.com",
      amount: 1500,
      avatar: "/avatars/02.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec profil utilisateur */}
      <DashboardHeader />

      {/* Contenu principal - Centré avec padding bottom pour mobile */}
      <div className="flex justify-center px-4 py-8 pb-24 md:pb-8">
        <div className="w-full max-w-5xl space-y-6">
          {/* Liste des Élèves avec Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des Élèves */}
            <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Mes Élèves
              </h3>

              {children.length > 0 ? (
                <div className="space-y-4">
                  {/* Select avec recherche */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedStudentId}
                        onValueChange={handleStudentChange}
                      >
                        <SelectTrigger className="h-11 flex-1">
                          <SelectValue placeholder="Sélectionner un élève" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredChildren.map((child: ChildData) => (
                            <SelectItem
                              key={child.studentInfo.id}
                              value={child.studentInfo.id}
                            >
                              {child.studentInfo.firstName}{" "}
                              {child.studentInfo.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedChild && (
                        <button
                          onClick={handleViewProfile}
                          className="h-11 px-4 rounded-md border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700"
                          title="Voir le profil complet"
                        >
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Profil</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-blue-900/70 text-sm">Aucun élève trouvé</p>
                  <p className="text-blue-900/50 text-xs mt-1">
                    Vos élèves apparaîtront ici
                  </p>
                </div>
              )}
            </div>

            {/* Paiements Récents avec avatars */}
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-4">
                Paiements Récents
              </h3>
              <p className="text-xs text-blue-900/60 mb-4">
                Vous avez {recentPayments.length} paiements ce mois-ci.
              </p>

              <div className="space-y-4">
                {recentPayments.map((payment, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                      <AvatarImage src={payment.avatar} alt="Avatar" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {payment.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {payment.name}
                      </p>
                      <p className="text-xs text-blue-900/60 truncate">
                        {payment.email}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      +${payment.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grille de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Carte Revenus */}
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-blue-900/60">Revenus totaux</p>
            </div>

            {/* Carte Enfants */}
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {stats.subscriptions}
              </div>
              <p className="text-xs text-blue-900/60">Enfants inscrits</p>
            </div>

            {/* Carte Présence */}
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {stats.presentPercentage}%
              </div>
              <p className="text-xs text-blue-900/60">Taux de présence</p>
            </div>

            {/* Carte Moyenne */}
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {stats.averageGrade}/100
              </div>
              <p className="text-xs text-blue-900/60">Moyenne générale</p>
            </div>
          </div>

          {/* Section Détails - Affichage selon l'élève sélectionné */}
          {selectedChild && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques académiques de l'élève sélectionné */}
              <div className="rounded-xl bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistiques Académiques -{" "}
                  {selectedChild.studentInfo.firstName}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        Présence
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-900">
                      {selectedChild.attendances.length > 0
                        ? Math.round(
                            (selectedChild.attendances.filter(
                              (a) => a.status === "Présent"
                            ).length /
                              selectedChild.attendances.length) *
                              100
                          )
                        : 100}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-100">
                        <Activity className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        Absences
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-900">
                      {
                        selectedChild.attendances.filter(
                          (a) => a.status === "Absent"
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        Retards
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-900">
                      {
                        selectedChild.attendances.filter(
                          (a) => a.status === "Retard"
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-blue-900">
                        Moyenne
                      </span>
                    </div>
                    <span className="text-base font-bold text-blue-900">
                      {selectedChild.notes.length > 0
                        ? (() => {
                            const allNotes: number[] = [];
                            selectedChild.notes.forEach((note) => {
                              if (note.trimestre_1)
                                allNotes.push(parseFloat(note.trimestre_1));
                              if (note.trimestre_2)
                                allNotes.push(parseFloat(note.trimestre_2));
                              if (note.trimestre_3)
                                allNotes.push(parseFloat(note.trimestre_3));
                            });
                            return allNotes.length > 0
                              ? (
                                  allNotes.reduce((sum, n) => sum + n, 0) /
                                  allNotes.length
                                ).toFixed(1)
                              : "N/A";
                          })()
                        : "N/A"}
                      /100
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations financières de l'élève sélectionné */}
              <div className="rounded-xl bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Informations Financières -{" "}
                  {selectedChild.studentInfo.firstName}
                </h3>

                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      selectedChild.paymentRequired
                        ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-medium ${
                          selectedChild.paymentRequired
                            ? "text-orange-900"
                            : "text-green-900"
                        }`}
                      >
                        {selectedChild.paymentRequired
                          ? "Paiement requis"
                          : "Total payé"}
                      </span>
                      {selectedChild.paymentRequired ? (
                        <XCircle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        selectedChild.paymentRequired
                          ? "text-orange-900"
                          : "text-green-900"
                      }`}
                    >
                      $
                      {selectedChild.payments
                        .reduce((sum, p) => sum + p.amount, 0)
                        .toLocaleString()}
                    </div>
                    {selectedChild.paymentRequired && (
                      <p className="text-xs text-orange-700 mt-2">
                        {selectedChild.paymentMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm text-blue-900/80">
                        Frais de scolarité
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        $45,000
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm text-blue-900/80">
                        Frais supplémentaires
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        $11,389.50
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-blue-900/60 text-center">
                      {selectedChild.paymentRequired
                        ? "Veuillez effectuer le paiement"
                        : "Tous les paiements sont à jour"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentStudentDashboard;
