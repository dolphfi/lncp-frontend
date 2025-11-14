/**
 * =====================================================
 * PAGE PROFIL ÉTUDIANT/PARENT - NOUVEAU DESIGN
 * =====================================================
 * Design basé sur le modèle fourni avec cards pour chaque enfant
 * Compatible avec le sidebar du dashboard
 */

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../stores/authStoreSimple";
import { useStudentSelectionStore } from "../../../stores/studentSelectionStore";
import { useDashboardStore } from "../../../stores/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import StudentScheduleCard from "./StudentScheduleCard";
import StudentNotesTable from "./StudentNotesTable";
import StudentPaymentsCard from "./StudentPaymentsCard";
import DashboardHeader from "../../includes/DashboardHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type {
  ParentDashboard,
  StudentDashboard,
  ChildData,
  Attendance,
} from "../../../types/dashboard";

const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { selectedStudent, setParentData } = useStudentSelectionStore();
  
  // Utiliser le dashboard store
  const {
    fetchDashboard,
    getParentDashboard,
    getStudentDashboard,
    loading,
    error
  } = useDashboardStore();
  
  const [studentData, setStudentData] = useState<StudentDashboard | ChildData | null>(
    null
  );
  const isParent = user?.role === "PARENT";
  const isStudentOrParent = user?.role === "STUDENT" || user?.role === "PARENT";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfileData = async () => {
    try {
      // Charger les données depuis le backend
      await fetchDashboard();
      
      // Récupérer les données selon le rôle
      if (isParent) {
        const parentDashboard = getParentDashboard();
        if (parentDashboard) {
          setParentData(parentDashboard); // Le store sélectionne automatiquement le 1er enfant
        }
      } else {
        const studentDashboard = getStudentDashboard();
        if (studentDashboard) {
          setStudentData(studentDashboard);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du chargement des données");
    }
  };

  // Afficher l'erreur si elle existe
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentData = isParent ? selectedStudent : studentData;

  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Profil non trouvé
          </h2>
          <p className="text-gray-600">
            Impossible de charger les informations du profil.
          </p>
        </div>
      </div>
    );
  }

  const attendanceStats = {
    presentPercentage:
      currentData.attendances.length > 0
        ? Math.round(
            (currentData.attendances.filter((a) => a.status === "Présent")
              .length /
              currentData.attendances.length) *
              100
          )
        : 100,
    absent: currentData.attendances.filter((a) => a.status === "Absent").length,
    late: currentData.attendances.filter((a) => a.status === "Retard").length,
  };

  // Calculer les dernières notes - Convertir AcademicNote en format simple
  const latestNotes = currentData.notes.slice(0, 3).map((note) => {
    // Prendre la première note disponible parmi les trimestres
    const noteValue = note.trimestre_1 || note.trimestre_2 || note.trimestre_3;
    return {
      course: note.course.titre,
      note: noteValue ? parseFloat(noteValue) : 0,
    };
  });

  const averageNote =
    currentData.notes.length > 0
      ? (() => {
          const allNotes: number[] = [];
          currentData.notes.forEach((note) => {
            if (note.trimestre_1) allNotes.push(parseFloat(note.trimestre_1));
            if (note.trimestre_2) allNotes.push(parseFloat(note.trimestre_2));
            if (note.trimestre_3) allNotes.push(parseFloat(note.trimestre_3));
          });
          return allNotes.length > 0
            ? (
                allNotes.reduce((sum, n) => sum + n, 0) / allNotes.length
              ).toFixed(1)
            : "N/A";
        })()
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour STUDENT et PARENT - Masquer la navigation bottom en mobile */}
      {isStudentOrParent && <DashboardHeader hideBottomNav={true} />}
      
      <div className={`px-2 md:px-4 ${isStudentOrParent ? 'py-6 md:pb-8' : 'py-6 md:py-8'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Bouton retour pour STUDENT et PARENT */}
          {isStudentOrParent && (
            <button
              onClick={() => navigate('/dashboard-overview')}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-blue-900 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </button>
          )}
        {/* Grille de cartes d'information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1 - Profil, Statistiques et Finances */}
          <div className="col-span-1 lg:col-span-1 space-y-4">
          {/* Card Profile - Design inspiré de Profile.tsx */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/90 overflow-hidden border border-gray-200">
            {/* Avatar et Info Section */}
            <div className="relative p-5">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full border-2 border-white/50 bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold overflow-hidden shadow-md">
                    {currentData.studentInfo.avatarUrl ? (
                      <img
                        src={currentData.studentInfo.avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${currentData.studentInfo.firstName[0]}${currentData.studentInfo.lastName[0]}`.toUpperCase()
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center">
                <h2 className="text-base font-semibold text-blue-900">
                  {currentData.studentInfo.firstName}{" "}
                  {currentData.studentInfo.lastName}
                </h2>
                <p className="text-xs text-blue-700/70 mt-1">
                  {currentData.studentInfo.matricule}
                </p>
              </div>

              {/* Informations compactes */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-blue-900/80 font-medium">Classe</span>
                  </div>
                  <span className="text-blue-900 font-semibold">
                    {currentData.studentInfo.classroom}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-blue-900/80 font-medium">Âge</span>
                  </div>
                  <span className="text-blue-900 font-semibold">
                    {currentData.studentInfo.age} ans
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-blue-900/80 font-medium">
                      Vacation
                    </span>
                  </div>
                  <span className="text-blue-900 font-semibold">
                    {currentData.studentInfo.vacation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques - Design compact */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/90 overflow-hidden border border-gray-200">
            <div className="p-4">
              <h4 className="text-xs font-semibold text-blue-900/80 flex items-center gap-1 mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                Statistiques
              </h4>

              <div className="space-y-2">
                {/* Présence */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-green-200/60 transition-all duration-200 group">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors duration-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-blue-900 group-hover:text-blue-800">
                      Présence
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-900 bg-green-50 px-3 py-1.5 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                    {attendanceStats.presentPercentage}%
                  </span>
                </div>

                {/* Absences */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-red-200/60 transition-all duration-200 group">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors duration-200">
                      <XCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-blue-900 group-hover:text-blue-800">
                      Absences
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-900 bg-red-50 px-3 py-1.5 rounded-full group-hover:bg-red-100 transition-colors duration-200">
                    {attendanceStats.absent}
                  </span>
                </div>

                {/* Retards */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-orange-200/60 transition-all duration-200 group">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors duration-200">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-blue-900 group-hover:text-blue-800">
                      Retards
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-900 bg-orange-50 px-3 py-1.5 rounded-full group-hover:bg-orange-100 transition-colors duration-200">
                    {attendanceStats.late}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières Notes */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/90 overflow-hidden border border-gray-200">
            <div className="p-4">
              <h4 className="text-xs font-semibold text-blue-900/80 flex items-center gap-1 mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                Dernières Notes
              </h4>

              {currentData.paymentRequired ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-xs text-blue-900/70">
                    {currentData.paymentMessage}
                  </p>
                </div>
              ) : latestNotes.length > 0 ? (
                <div className="space-y-2">
                  {latestNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-gray-200/80"
                    >
                      <span className="text-xs text-blue-900/80 truncate">
                        {note.course}
                      </span>
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-full">
                        {note.note}/100
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200/80 mt-3">
                    <span className="text-xs font-semibold text-blue-900">
                      Moyenne
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      {averageNote}/100
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-blue-900/50">
                    Aucune note disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statut Financier */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/90 overflow-hidden border border-gray-200">
            <div className="p-4">
              <h4 className="text-xs font-semibold text-blue-900/80 flex items-center gap-1 mb-3">
                <DollarSign className="w-3.5 h-3.5" />
                Statut Financier
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-full ${
                      currentData.paymentRequired
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {currentData.paymentRequired ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-blue-900">
                    {currentData.paymentRequired ? "Paiement requis" : "À jour"}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    currentData.paymentRequired
                      ? "bg-red-50 text-red-900"
                      : "bg-green-50 text-green-900"
                  }`}
                >
                  {currentData.payments.length} paiements
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 2 - Activités Récentes */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Table des notes - EN HAUT */}
          <StudentNotesTable
            notes={currentData.notes}
            paymentRequired={currentData.paymentRequired}
            paymentMessage={currentData.paymentMessage}
          />

          {/* Emploi du temps */}
          <StudentScheduleCard schedule={currentData.schedule} />

          {/* Carte Absences et Retards Récents - Redesign */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/90 overflow-hidden border border-gray-200">
            <div className="p-5">
              <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Absences et Retards Récents
              </h4>

              {currentData.attendances.filter((a) => a.status !== "Présent")
                .length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-blue-900/70 font-medium">
                    Aucune absence ou retard
                  </p>
                  <p className="text-xs text-blue-900/50 mt-1">
                    Excellent comportement !
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentData.attendances
                    .filter((a) => a.status !== "Présent")
                    .slice(0, 5)
                    .map((att: Attendance) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-full flex-shrink-0 ${
                              att.status === "Absent"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {att.status === "Absent" ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-blue-900">
                                {att.status}
                              </p>
                              <span className="text-xs text-blue-900/60">
                                •
                              </span>
                              <p className="text-xs text-blue-900/70">
                                {formatDate(att.timestamp)}
                              </p>
                            </div>
                            <p className="text-xs text-blue-900/60 mt-0.5 truncate">
                              {att.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              att.isJustified
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {att.isJustified ? "Justifié" : "Non justifié"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Card Statut Financier - EN BAS */}
          <StudentPaymentsCard
            payments={currentData.payments}
            paymentRequired={currentData.paymentRequired}
            paymentMessage={currentData.paymentMessage}
          />
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
