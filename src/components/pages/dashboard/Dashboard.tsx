import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  PieLabelRenderProps,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { Badge } from "components/ui/badge";
import { Users, GraduationCap, BookOpen, Landmark, MoreVertical, DollarSign, Package, ShoppingCart } from "lucide-react";

// Mock data for Attendance Chart
const attendanceData = [
  { day: 'Lun', eleves: 1150, professeurs: 75 },
  { day: 'Mar', eleves: 1180, professeurs: 78 },
  { day: 'Mer', eleves: 1100, professeurs: 72 },
  { day: 'Jeu', eleves: 1200, professeurs: 80 },
  { day: 'Ven', eleves: 1050, professeurs: 70 },
];

// Mock data for Students per Class Chart
const studentsPerClassData = [
  { classe: 'NS 1', eleves: 28, filles: 15, garcons: 13, cours: 8 },
  { classe: 'NS 2', eleves: 30, filles: 16, garcons: 14, cours: 9 },
  { classe: 'NS 3', eleves: 29, filles: 15, garcons: 14, cours: 10 },
  { classe: 'NS 4', eleves: 31, filles: 17, garcons: 14, cours: 11 },
];

// Mock data for the table
const recentActivities = [
  {
    name: "Inscription de Jean Dupont",
    type: "Élève",
    status: "Complété",
    date: "2024-06-28",
  },
  {
    name: "Paiement de frais de scolarité",
    type: "Caisse",
    status: "En cours",
    date: "2024-06-27",
  },
  {
    name: "Ajout du cours de Mathématiques",
    type: "Cours",
    status: "Complété",
    date: "2024-06-26",
  },
  {
    name: "Recrutement de Mme. Lavoie",
    type: "Professeur",
    status: "Annulé",
    date: "2024-06-25",
  },
  {
    name: "Mise à jour du dossier de Marie Curie",
    type: "Élève",
    status: "Complété",
    date: "2024-06-24",
  },
];

const getBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case "complété":
      return "default";
    case "en cours":
      return "secondary";
    case "annulé":
      return "destructive";
    default:
      return "outline";
  }
};

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+10.1% depuis le mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professeurs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82</div>
            <p className="text-xs text-muted-foreground">+5 depuis l'année dernière</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+3 nouveaux ce semestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caisse</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">+12.5% de revenus</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Attendance and Activities */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Présence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorEleves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorProfesseurs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="eleves" stroke="#3b82f6" strokeWidth={2} fill="url(#colorEleves)" name="Élèves" />
                <Area type="monotone" dataKey="professeurs" stroke="#10b981" strokeWidth={2} fill="url(#colorProfesseurs)" name="Professeurs" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Activités</p>
                  <p className="text-xs opacity-80">Parascolaires</p>
                </div>
              </div>
              <button className="text-white/60 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-5xl font-bold mb-2">12</div>
              <p className="text-sm opacity-90">Activités prévues ce mois-ci</p>
              <p className="text-xs opacity-75 mt-1">Découvrez les activités parascolaires organisées par l'établissement</p>
            </div>

            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Club de Football</p>
                  <p className="text-xs text-gray-500">Mercredi 15h00</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Atelier de Théâtre</p>
                  <p className="text-xs text-gray-500">Jeudi 16h30</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Club de Robotique</p>
                  <p className="text-xs text-gray-500">Vendredi 14h00</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Chorale</p>
                  <p className="text-xs text-gray-500">Mardi 17h00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics and Class Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">STATISTIQUES</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Élèves', value: 1234, fill: '#3b82f6' },
                        { name: 'Professeurs', value: 82, fill: '#10b981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {[
                        { name: 'Élèves', value: 1234, fill: '#3b82f6' },
                        { name: 'Professeurs', value: 82, fill: '#10b981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs font-medium mt-2">Élèves vs Professeurs</p>
              </div>

              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Garçons', value: 640, fill: '#3b82f6' },
                        { name: 'Filles', value: 594, fill: '#ec4899' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {[
                        { name: 'Garçons', value: 640, fill: '#3b82f6' },
                        { name: 'Filles', value: 594, fill: '#ec4899' },
                      ].map((entry, index) => (
                        <Cell key={`cell2-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs font-medium mt-2">Répartition par Genre</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Statistiques de l'établissement</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 w-full">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Élèves</p>
                <p className="text-lg font-bold text-blue-600">1,234</p>
                <p className="text-xs text-muted-foreground">+10.1% ce mois</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Total Professeurs</p>
                <p className="text-lg font-bold text-green-600">82</p>
                <p className="text-xs text-muted-foreground">+5 cette année</p>
              </div>
            </div>

            <div className="flex gap-4 mt-3 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                <span className="text-xs font-medium">Élèves / Garçons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-xs font-medium">Professeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-pink-500"></div>
                <span className="text-xs font-medium">Filles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Élèves par Classe</CardTitle>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="mb-6">
              <div className="text-3xl font-bold mb-1">118</div>
              <p className="text-sm text-muted-foreground">Total élèves inscrits</p>
            </div>

            <div className="space-y-4">
              {studentsPerClassData.map((classe, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{classe.classe}</span>
                      <span className="text-xs text-muted-foreground">({classe.eleves} élèves)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-blue-600">{classe.filles}F</span>
                      <span className="text-green-600">{classe.garcons}G</span>
                      <span className="text-purple-600">{classe.cours} cours</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(classe.eleves / 35) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
                <span className="text-xs">Filles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                <span className="text-xs">Garçons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-400"></div>
                <span className="text-xs">Cours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
