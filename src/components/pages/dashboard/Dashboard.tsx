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
import { Users, GraduationCap, BookOpen, Landmark } from "lucide-react";

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
