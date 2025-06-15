import React, { useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  Download,
  X,
  Plus,
} from "lucide-react";

const Admissions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="admissions"
      className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-white"
    >
      {/* Background Image */}
      {/* <div className="absolute inset-0">
        <img
          src="/school.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/90" />
      </div> */}

      {/* Decorative overlays */}
      {/* <div className="absolute top-0 left-0 right-0 w-full z-20">
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
      </div> */}

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
                onClick={() => setIsModalOpen(true)}
                className="mt-4 flex items-center bg-blue-500/10 text-blue-600 text-xs py-2 px-6 rounded-full hover:bg-blue-500/20 transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40"
              >
                <Plus className="h-3 w-3 mr-2" />
                <span>Inscrire</span>
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
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 text-xs hover:shadow-lg hover:shadow-blue-200 transition-all duration-300">
              <Download className="w-4 h-4" />
              Formulaire d'Inscription
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Formulaire d'Inscription
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre numéro de téléphone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau souhaité
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Sélectionnez un niveau</option>
                  <option value="6eme">6ème</option>
                  <option value="5eme">5ème</option>
                  <option value="4eme">4ème</option>
                  <option value="3eme">3ème</option>
                  <option value="2nde">2nde</option>
                  <option value="1ere">1ère</option>
                  <option value="terminale">Terminale</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-6 py-3 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
              >
                Soumettre l'inscription
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Admissions;
