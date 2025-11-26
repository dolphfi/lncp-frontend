import React, { useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  Download,
  X,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { admissionService } from "../../../services/admissions/admissionService";

const Admissions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.grade) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      // Nous créons un brouillon d'admission
      await admissionService.createDraft({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        notes: `Demande d'inscription pour la classe : ${formData.grade}. Téléphone: ${formData.phone}`
      });
      
      toast.success("Votre demande d'inscription a été envoyée avec succès !");
      setIsModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        grade: "",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 text-xs hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+509 0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau souhaité <span className="text-red-500">*</span>
                </label>
                <select 
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="NS1">NS1 (S3)</option>
                  <option value="NS2">NS2 (S4)</option>
                  <option value="NS3">NS3 (Philo)</option>
                  <option value="NS4">NS4 (Philo)</option>
                  <option value="7eme">7ème AF</option>
                  <option value="8eme">8ème AF</option>
                  <option value="9eme">9ème AF</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-6 py-3 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Envoi en cours..." : "Soumettre l'inscription"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Admissions;
