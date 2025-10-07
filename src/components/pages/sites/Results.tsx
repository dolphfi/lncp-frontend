import React, { useState } from "react";
import {
  Search,
  Download,
  FileText,
  User,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  BarChart2,
  BookOpen,
  Book,
  BookMarked,
  BookOpenCheck,
  BookType,
  BookUp,
  BookUser,
  GraduationCap,
  School,
  Trophy,
  ArrowLeft,
} from "lucide-react";

interface StudentResult {
  matricule: string;
  nom: string;
  prenom: string;
  classe: string;
  anneeAcademique: string;
  notes: {
    matiere: string;
    note1: number;
    note2: number;
    note3: number;
    moyenne: number;
    coefficient: number;
    total: number;
  }[];
  moyenneGenerale: number;
  rang: number;
  decision: string;
}

const Results = () => {
  const [matricule, setMatricule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentResult, setStudentResult] = useState<StudentResult | null>(
    null
  );
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Données simulées pour la démonstration
  const mockResults: StudentResult = {
    matricule: "LNCP2024001",
    nom: "Dupont",
    prenom: "Jean",
    classe: "Terminale A",
    anneeAcademique: "2023-2024",
    notes: [
      {
        matiere: "Mathématiques",
        note1: 85,
        note2: 78,
        note3: 92,
        moyenne: 85,
        coefficient: 4,
        total: 340,
      },
      {
        matiere: "Français",
        note1: 88,
        note2: 82,
        note3: 90,
        moyenne: 86.7,
        coefficient: 3,
        total: 260,
      },
      {
        matiere: "Histoire-Géographie",
        note1: 75,
        note2: 80,
        note3: 85,
        moyenne: 80,
        coefficient: 2,
        total: 160,
      },
      {
        matiere: "Sciences Physiques",
        note1: 90,
        note2: 85,
        note3: 88,
        moyenne: 87.7,
        coefficient: 3,
        total: 263,
      },
      {
        matiere: "Sciences de la Vie",
        note1: 82,
        note2: 88,
        note3: 85,
        moyenne: 85,
        coefficient: 2,
        total: 170,
      },
      {
        matiere: "Anglais",
        note1: 78,
        note2: 82,
        note3: 80,
        moyenne: 80,
        coefficient: 2,
        total: 160,
      },
      {
        matiere: "Philosophie",
        note1: 85,
        note2: 88,
        note3: 90,
        moyenne: 87.7,
        coefficient: 2,
        total: 175,
      },
    ],
    moyenneGenerale: 84.2,
    rang: 5,
    decision: "Admis",
  };

  const getMatiereIcon = (matiere: string) => {
    const matiereIcons: Record<string, React.ReactNode> = {
      Mathématiques: <BarChart2 className="w-4 h-4 text-white" />,
      Français: <BookOpen className="w-4 h-4 text-white" />,
      "Histoire-Géographie": <Book className="w-4 h-4 text-white" />,
      "Sciences Physiques": <BookMarked className="w-4 h-4 text-white" />,
      "Sciences de la Vie": <BookOpenCheck className="w-4 h-4 text-white" />,
      Anglais: <BookType className="w-4 h-4 text-white" />,
      Philosophie: <BookUser className="w-4 h-4 text-white" />,
    };
    return matiereIcons[matiere] || <Book className="w-4 h-4 text-white" />;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulation d'une recherche
    setTimeout(() => {
      if (matricule === "LNCP2024001") {
        setStudentResult(mockResults);
      } else {
        setError("Aucun résultat trouvé pour ce matricule.");
      }
      setLoading(false);
    }, 1500);
  };

  const handleDownloadPDF = () => {
    // Simulation du téléchargement PDF
    alert("Téléchargement du bulletin en PDF...");
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "Admis":
        return "from-green-500/90 to-green-600/90";
      case "Admis avec mention":
        return "from-blue-500/90 to-blue-600/90";
      case "Redoublant":
        return "from-amber-500/90 to-amber-600/90";
      default:
        return "from-gray-500/90 to-gray-600/90";
    }
  };

  const getNoteColor = (note: number) => {
    if (note >= 16) return "text-green-500";
    if (note >= 14) return "text-blue-500";
    if (note >= 12) return "text-indigo-500";
    if (note >= 10) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <section
      id="results"
      className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-blue-900"
      style={{
        backgroundImage: 'url("/school.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Decorative overlays */}
      <div className="absolute top-0 left-0 right-0 w-full z-20">
        <img
          src="/overlay-top.png"
          alt="Paper decoration"
          className="w-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 w-full z-20">
        <img
          src="/overlay-bottom.png"
          alt="Paper decoration"
          className="w-full object-cover"
        />
      </div>

      <div className="z-20 px-6 md:px-16 lg:px-32 pt-24 pb-20">
        {/* Back to Site Button */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
            <GraduationCap className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-['Kaushan_Script'] drop-shadow-2xl">
            Résultats Scolaires
          </h1>
          <p className="text-sm text-white/90 max-w-2xl mx-auto leading-relaxed">
            Consultez vos résultats scolaires en temps réel
          </p>
        </div>

        {/* Simple Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/50" />
              </div>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full pl-11 pr-24 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-white/50 text-sm"
                placeholder="Entrez votre matricule..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-xs font-medium"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Rechercher"
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-300" />
                <span className="text-red-200 text-xs">{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Results Display */}
        {studentResult && (
          <div className="space-y-8">
            {/* Student Info Card */}
            <div className="relative group">
              <div className="relative h-full overflow-hidden">
                <div className="relative">
                  {/* Header compact */}
                  <div className="mb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      {/* Nom et photo */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-white truncate">
                            {studentResult.prenom} {studentResult.nom}
                          </h3>
                          <p className="text-[10px] md:text-xs text-white/60">
                            {studentResult.matricule}
                          </p>
                        </div>
                      </div>

                      {/* Année académique et classe - à droite en desktop */}
                      <div className="flex items-center gap-3 text-[10px] md:text-xs text-white/70 flex-wrap">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span>{studentResult.anneeAcademique}</span>
                        </div>
                        <div className="px-2 md:px-3 py-1 bg-white/10 rounded-full font-medium text-white">
                          {studentResult.classe}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats compactes */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <div className="bg-white/5 backdrop-blur-sm px-2 md:px-3 py-2 md:py-2.5 rounded-xl border border-white/10 text-center">
                      <div className="text-xl md:text-2xl font-bold text-blue-300">
                        {studentResult.moyenneGenerale.toFixed(2)}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-white/60 uppercase tracking-wide mt-0.5">
                        Moyenne
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm px-2 md:px-3 py-2 md:py-2.5 rounded-xl border border-white/10 text-center">
                      <div className="text-xl md:text-2xl font-bold text-green-300">
                        {studentResult.rang}
                        <span className="text-[10px] md:text-xs text-white/50">
                          {studentResult.rang === 1
                            ? "er"
                            : studentResult.rang === 2
                            ? "nd"
                            : studentResult.rang === 3
                            ? "rd"
                            : "e"}
                        </span>
                      </div>
                      <div className="text-[9px] md:text-[10px] text-white/60 uppercase tracking-wide mt-0.5">
                        Rang
                      </div>
                    </div>
                    <div
                      className={`bg-gradient-to-br ${getDecisionColor(
                        studentResult.decision
                      )} px-2 md:px-3 py-2 md:py-2.5 rounded-xl border border-white/20 text-center`}
                    >
                      <div className="text-base md:text-lg font-bold text-white">
                        {studentResult.decision}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-white/80 uppercase tracking-wide mt-0.5">
                        Décision
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mr-3">
                        <Award className="w-5 h-5 text-blue-300" />
                      </div>
                      <h2 className="text-base md:text-lg font-medium text-white">
                        Bulletin de Notes
                      </h2>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-full transition-all duration-200 text-[10px] md:text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Télécharger PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Matière
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                          Note 1
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                          Note 2
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                          Note 3
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                          Moyenne
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                          Coeff.
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {studentResult.notes.map((note, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                                {getMatiereIcon(note.matiere)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {note.matiere}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNoteColor(
                                note.note1
                              )} bg-opacity-10`}
                            >
                              {note.note1}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNoteColor(
                                note.note2
                              )} bg-opacity-10`}
                            >
                              {note.note2}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNoteColor(
                                note.note3
                              )} bg-opacity-10`}
                            >
                              {note.note3}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                note.moyenne >= 10
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {note.moyenne.toFixed(1)}
                              <span className="ml-1 text-xs opacity-70">
                                /20
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-white/70">
                            {note.coefficient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-300">
                            {note.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* New Search Button */}
            <div className="flex justify-start pt-4">
              <button
                onClick={() => setStudentResult(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white transition-colors duration-200 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Nouvelle recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;
