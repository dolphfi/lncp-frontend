import React from "react";
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
  TrendingUp
} from "lucide-react";

const ParentStudentDashboard: React.FC = () => {

  // Données de simulation
  const stats = {
    totalRevenue: 56389.5,
    subscriptions: 2,
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

        {/* Graphique et Paiements Récents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique AreaChart */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">Vue d'ensemble des Paiements</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={overviewData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Paiements Récents avec avatars */}
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">Paiements Récents</h3>
            <p className="text-xs text-blue-900/60 mb-4">Vous avez {recentPayments.length} paiements ce mois-ci.</p>
            
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

        {/* Section Détails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques académiques */}
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Statistiques Académiques
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Présence</span>
                </div>
                <span className="text-sm font-bold text-blue-900">{stats.presentPercentage}%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <Activity className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Absences</span>
                </div>
                <span className="text-sm font-bold text-blue-900">{stats.totalAbsences}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Retards</span>
                </div>
                <span className="text-sm font-bold text-blue-900">{stats.lateCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">Moyenne</span>
                </div>
                <span className="text-base font-bold text-blue-900">{stats.averageGrade}/100</span>
              </div>
            </div>
          </div>

          {/* Informations financières */}
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Informations Financières
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-900">Total payé</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-blue-900/80">Frais de scolarité</span>
                  <span className="text-sm font-semibold text-blue-900">$45,000</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-blue-900/80">Frais supplémentaires</span>
                  <span className="text-sm font-semibold text-blue-900">$11,389.50</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-blue-900/60 text-center">
                  Tous les paiements sont à jour
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ParentStudentDashboard;
