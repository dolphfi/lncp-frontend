import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowRight, Users, BookOpen, User, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const MainDashboard: React.FC = () => {
  // Données de simulation
  const stats = {
    students: 1250,
    teachers: 75,
    classes: 45,
    revenue: 56000,
  };

  const chartData = [
    { name: 'NSI', 'Élèves': 400 },
    { name: 'NSII', 'Élèves': 300 },
    { name: 'NSIII', 'Élèves': 200 },
    { name: 'NSIV', 'Élèves': 278 },
  ];

  const recentActivities = [
    { id: 1, text: 'Nouvel élève ajouté: Jean Dupont', time: 'il y a 5 min' },
    { id: 2, text: 'Paiement reçu de Marie Claire', time: 'il y a 2 heures' },
    { id: 3, text: 'Cours de Maths mis à jour', time: 'il y a 1 jour' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de Bord Principal</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cartes de statistiques */}
        <StatCard title="Élèves Inscrits" value={stats.students} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Professeurs" value={stats.teachers} icon={<User className="w-6 h-6 text-green-500" />} />
        <StatCard title="Classes Ouvertes" value={stats.classes} icon={<BookOpen className="w-6 h-6 text-yellow-500" />} />
        <StatCard title="Revenus (mensuel)" value={`$${stats.revenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-red-500" />} />

        {/* Graphique */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition des Élèves par Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Élèves" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Raccourcis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Accès Rapide</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ShortcutButton to="/students" text="Gérer les Élèves" />
            <ShortcutButton to="/courses" text="Gérer les Cours" />
            <ShortcutButton to="/employee" text="Gérer les Employés" />
            <ShortcutButton to="/academic/notes" text="Gérer les Notes" />
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex justify-between items-center">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {icon}
    </CardContent>
  </Card>
);

const ShortcutButton = ({ to, text }: { to: string, text: string }) => (
  <Button asChild variant="outline" className="justify-start">
    <Link to={to}>
      {text} <ArrowRight className="w-4 h-4 ml-auto" />
    </Link>
  </Button>
);

export default MainDashboard;
