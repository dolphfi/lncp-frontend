import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { useAuthStore } from '../../../stores/authStoreSimple';
import { DollarSign, Users, BookOpen, Activity } from 'lucide-react';

const ParentStudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Données de simulation
  const totalRevenue = 56389.50;
  const subscriptions = 2;
  const totalAbsences = 12;
  const averageGrade = 85.4;

  const overviewData = [
    { name: 'Jan', total: 4000 },
    { name: 'Fev', total: 3000 },
    { name: 'Mar', total: 5000 },
    { name: 'Avr', total: 4500 },
    { name: 'Mai', total: 6000 },
    { name: 'Juin', total: 7500 },
  ];

  const recentPayments = [
    { name: 'Jean Dupont', email: 'jean.dupont@email.com', amount: 2500, avatar: '/avatars/01.png' },
    { name: 'Marie Claire', email: 'marie.claire@email.com', amount: 1500, avatar: '/avatars/02.png' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
        <div className="flex items-center space-x-2">
          <Button>Télécharger</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Revenus Totaux" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="+20.1% depuis le mois dernier" />
            <StatCard title="Enfants Inscrits" value={subscriptions} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="+1 depuis le mois dernier" />
            <StatCard title="Absences (mois)" value={totalAbsences} icon={<Activity className="h-4 w-4 text-muted-foreground" />} description="+5 ce mois-ci" />
            <StatCard title="Moyenne Générale" value={`${averageGrade}%`} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} description="+2.5% depuis le dernier trimestre" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Vue d'ensemble des Paiements</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={overviewData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Paiements Récents</CardTitle>
                <CardDescription>Vous avez 2 paiements ce mois-ci.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentPayments.map((payment, i) => (
                    <div key={i} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={payment.avatar} alt="Avatar" />
                        <AvatarFallback>{payment.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{payment.name}</p>
                        <p className="text-sm text-muted-foreground">{payment.email}</p>
                      </div>
                      <div className="ml-auto font-medium">+${payment.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default ParentStudentDashboard;
