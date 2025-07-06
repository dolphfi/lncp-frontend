import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    alert("Formulaire envoyé avec succès!");
  };

  return (
    <section id="contact" className="min-h-screen relative overflow-hidden">
      {/* Split Background */}
      <div className="absolute inset-0">
        <div className="h-1/2 bg-white"></div>
        <img
          src="/overlay-top.png"
          alt="Paper decoration"
          className="w-full object-cover -mb-10 hidden md:block"
        />
        <div className="h-1/2 bg-blue-900"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Glassmorphic Contact Form */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-medium text-blue-900">
                  Envoyez-nous un message
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-blue-900 font-medium mb-2 text-sm"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-blue-900 font-medium mb-2 text-sm"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900"
                    required
                  >
                    <option value="" className="bg-white text-blue-900">
                      Sélectionnez un sujet
                    </option>
                    <option
                      value="admission"
                      className="bg-white text-blue-900"
                    >
                      Admission
                    </option>
                    <option
                      value="information"
                      className="bg-white text-blue-900"
                    >
                      Information
                    </option>
                    <option value="visite" className="bg-white text-blue-900">
                      Visite
                    </option>
                    <option value="autre" className="bg-white text-blue-900">
                      Autre
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50 resize-none"
                    placeholder="Votre message..."
                    required
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-full hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-4 border-t border-white/40">
                <div className="flex flex-col space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-blue-900/70">
                    <Phone className="w-3 h-3" />
                    <span>(509) 1234-5678</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-900/70">
                    <Mail className="w-3 h-3" />
                    <span>contact@lncp.edu.ht</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-900/70">
                    <MapPin className="w-3 h-3" />
                    <span>Saint-Raphaël, Haïti</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
