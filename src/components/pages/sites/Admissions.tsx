import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  CheckCircle,
  Download,
  Plus,
} from "lucide-react";

const Admissions = () => {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate('/admission/apply');
  };

  return (
    <section
      id="admissions"
      className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-white"
    >
      <div className="relative z-10 px-6 md:px-16 lg:px-32 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6 border border-yellow-200">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-['Kaushan_Script']">
            Processus d'Admission
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Rejoignez notre communauté éducative d'excellence. Découvrez les
            étapes pour intégrer le Lycée National Charlemagne Péralte.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Conditions Requises */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Conditions Requises
              </h3>
              <ul className="space-y-3">
                {[
                  "Dossier scolaire complet des années précédentes",
                  "Lettre de recommandation d'un ancien professeur",
                  "Examen d'entrée en mathématiques et en français",
                  "Entretien avec le comité d'admission",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-600 text-sm"
                  >
                    <span className="text-blue-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleApplyClick}
                className="mt-4 flex items-center bg-blue-500/10 text-blue-600 text-xs py-2 px-6 rounded-full hover:bg-blue-500/20 transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40"
              >
                <Plus className="h-3 w-3 mr-2" />
                <span>Commencer l'inscription</span>
              </button>
            </div>

            {/* Dates Importantes */}
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Dates Importantes
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-purple-600 text-sm font-medium mb-1">
                    Période d'inscription
                  </p>
                  <p className="text-gray-600 text-sm">
                    1er juin - 31 juillet 2024
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-purple-600 text-sm font-medium mb-1">
                    Examens d'entrée
                  </p>
                  <p className="text-gray-600 text-sm">15 août 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button 
              onClick={handleApplyClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 text-xs hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Remplir le dossier en ligne
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admissions;
