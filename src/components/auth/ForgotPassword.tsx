import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft } from "lucide-react";
import authService from "../../services/authService";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez saisir votre email");
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success("Si l'email existe, un lien de réinitialisation a été envoyé.");
    } catch (err: any) {
      const message = err?.message || "Impossible d'envoyer le lien";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="forgot-password" className="min-h-screen relative overflow-hidden">
      {/* Split Background */}
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
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-blue-500 mb-4 font-['Kaushan_Script']">
              Mot de passe oublié
            </h1>
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-medium text-blue-900">
                  Récupérer votre compte
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-blue-900/50" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 flex items-center justify-center text-sm font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Envoi..." : "Envoyer le lien"}
                </button>
              </form>
            </div>
          </div>
          
          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-xs text-blue-200 hover:text-white hover:underline transition-colors duration-300 inline-flex items-center"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
