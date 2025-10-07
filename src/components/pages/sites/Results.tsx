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
        return "text-green-600 bg-green-50 border-green-200";
      case "Admis avec mention":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Redoublant":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <section id="results" className="min-h-screen relative overflow-hidden">
      {/* Split Background - Same as Login */}
      <div className="absolute inset-0">
        <div className="h-1/2 bg-white"></div>
        <img
          src="/overlay-top.png"
          alt="Paper decoration"
          className="w-full object-cover -mb-10 hidden md:block"
        />
        <div className="h-1/2 bg-blue-800"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-blue-500 mb-4 font-['Kaushan_Script']">
              Consultation des Résultats
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Consultez vos résultats scolaires en entrant votre numéro de
              matricule.
            </p>
          </div>

          {/* Search Form - Glassmorphic style like Login */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden mb-8">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-medium text-blue-900">
                  Rechercher vos résultats
                </h2>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label
                    htmlFor="matricule"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Numéro de Matricule
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-blue-900/50" />
                    </div>
                    <input
                      type="text"
                      id="matricule"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="Ex: LNCP2024001"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 text-xs"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Recherche en cours...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Consulter les résultats</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-xs">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Display */}
          {studentResult && (
            <div className="space-y-6">
              {/* Student Info Card - Glassmorphic style */}
              <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm font-medium text-blue-900">
                      Informations de l'étudiant
                    </h2>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">
                          {studentResult.prenom} {studentResult.nom}
                        </h3>
                        <p className="text-xs text-blue-700/70">
                          Matricule: {studentResult.matricule}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-xs text-blue-700/70 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>{studentResult.anneeAcademique}</span>
                      </div>
                      <div className="text-sm font-semibold text-blue-900">
                        {studentResult.classe}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50/50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        {studentResult.moyenneGenerale}
                      </div>
                      <div className="text-xs text-blue-700/70">Moyenne</div>
                    </div>
                    <div className="text-center p-3 bg-green-50/50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {studentResult.rang}
                      </div>
                      <div className="text-xs text-green-700/70">Rang</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50/50 rounded-xl">
                      <div
                        className={`text-sm font-bold px-3 py-1 rounded-full border ${getDecisionColor(
                          studentResult.decision
                        )}`}
                      >
                        {studentResult.decision}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grades Table - Glassmorphic style */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/40">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-blue-900">
                      Bulletin de Notes
                    </h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-blue-900">
                          Matière
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Note 1
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Note 2
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Note 3
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Moyenne
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Coeff.
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-blue-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {studentResult.notes.map((note, index) => (
                        <tr key={index} className="hover:bg-white/30">
                          <td className="px-4 py-3 text-xs font-medium text-blue-900">
                            {note.matiere}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-blue-700/70">
                            {note.note1}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-blue-700/70">
                            {note.note2}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-blue-700/70">
                            {note.note3}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-semibold text-blue-600">
                            {note.moyenne}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-blue-700/70">
                            {note.coefficient}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                            {note.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center space-x-2 bg-green-600 text-white font-medium py-2.5 px-6 rounded-full hover:bg-green-700 transition-colors duration-200 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Bulletin (PDF)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Results;
