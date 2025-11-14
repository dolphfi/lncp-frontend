import React, { useState, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { useStudentSelectionStore } from "../../../stores/studentSelectionStore";
import { useDashboardStore } from "../../../stores/dashboardStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import type { ChildData } from "../../../types/dashboard";

const ParentStudentDashboard: React.FC = () => {
  const { parentData, setSelectedStudent, setParentData } = useStudentSelectionStore();
  const { fetchDashboard, getParentDashboard, loading, error } = useDashboardStore();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Charger les données du dashboard au montage
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchDashboard();
        const dashboardData = getParentDashboard();
        if (dashboardData) {
          setParentData(dashboardData);
        }
      } catch (err: any) {
        toast.error(err.message || "Erreur lors du chargement des données");
      }
    };

    loadDashboardData();
  }, [fetchDashboard, getParentDashboard, setParentData]);

  // Utiliser uniquement les données du backend
  const children: ChildData[] = parentData?.children || [];

  // Filtrer les élèves selon la recherche
  const filteredChildren = children.filter((child: ChildData) =>
    `${child.studentInfo.firstName} ${child.studentInfo.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sélectionner le premier élève par défaut
  useEffect(() => {
    if (children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].studentInfo.id);
    }
  }, [children, selectedStudentId]);

  // Sélectionner automatiquement le premier élève filtré lors de la recherche
  useEffect(() => {
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

  // Calculer les statistiques à partir des données réelles
  const stats = useMemo(() => {
    // Total des revenus (somme des paiements complétés)
    const totalRevenue = children.reduce((sum, child) => {
      const childPayments = child.payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + childPayments;
    }, 0);

    // Total des absences
    const totalAbsences = children.reduce((sum, child) => {
      return sum + child.attendances.filter((a) => a.status === "Absent").length;
    }, 0);

    // Compter les retards
    const lateCount = children.reduce((sum, child) => {
      return sum + child.attendances.filter((a) => a.status === "Retard").length;
    }, 0);

    // Calculer la moyenne générale
    let totalNotes = 0;
    let noteCount = 0;
    children.forEach((child) => {
      child.notes.forEach((note) => {
        [note.trimestre_1, note.trimestre_2, note.trimestre_3].forEach((t) => {
          if (t !== null) {
            totalNotes += parseFloat(t);
            noteCount++;
          }
        });
      });
    });
    const averageGrade = noteCount > 0 ? totalNotes / noteCount : 0;

    // Pourcentage de présences
    const totalAttendances = children.reduce(
      (sum, child) => sum + child.attendances.length,
      0
    );
    const presentCount = children.reduce((sum, child) => {
      return sum + child.attendances.filter((a) => a.status === "Présent").length;
    }, 0);
    const presentPercentage =
      totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0;

    return {
      totalRevenue,
      subscriptions: children.length,
      totalAbsences,
      averageGrade: parseFloat(averageGrade.toFixed(2)),
      presentPercentage: parseFloat(presentPercentage.toFixed(0)),
      lateCount,
    };
  }, [children]);

  // Graphique de vue d'ensemble (simulation pour l'instant)
  const overviewData = [
    { name: "Jan", total: 4000 },
    { name: "Fev", total: 3000 },
    { name: "Mar", total: 5000 },
    { name: "Avr", total: 4500 },
    { name: "Mai", total: 6000 },
    { name: "Juin", total: 7500 },
  ];

  // Paiements récents (à partir des données réelles)
  const recentPayments = useMemo(() => {
    const allPayments: Array<{
      name: string;
      email: string;
      amount: number;
      avatar: string | null;
      date: string;
    }> = [];

    children.forEach((child) => {
      child.payments
        .filter((p) => p.status === "COMPLETED")
        .forEach((payment) => {
          allPayments.push({
            name: `${child.studentInfo.firstName} ${child.studentInfo.lastName}`,
            email: `${child.studentInfo.firstName.toLowerCase()}.${child.studentInfo.lastName.toLowerCase()}@example.com`,
            amount: payment.amount,
            avatar: child.studentInfo.avatarUrl,
            date: payment.createdAt,
          });
        });
    });

    // Trier par date et prendre les 5 plus récents
    return allPayments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [children]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec profil utilisateur */}
      <DashboardHeader />

      {/* Afficher le loader pendant le chargement */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      ) : (
        <>
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
              {recentPayments.length > 0 ? (
                <>
                  <p className="text-xs text-blue-900/60 mb-4">
                    Vous avez {recentPayments.length} paiement(s) récent(s).
                  </p>

                  <div className="space-y-4">
                    {recentPayments.map((payment, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-200">
                          <AvatarImage src={payment.avatar || undefined} alt="Avatar" />
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
                            {new Date(payment.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          +{payment.amount.toLocaleString()} G
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-blue-900/60">Aucun paiement récent</p>
                </div>
              )}
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
        </>
      )}
    </div>
  );
};

export default ParentStudentDashboard;
