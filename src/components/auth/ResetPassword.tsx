import React, { useState } from "react";
import { Lock, Key, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reset password logic
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    console.log("Resetting password with:", formData.password);
  };

  return (
    <section id="reset-password" className="min-h-screen relative overflow-hidden">
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
              <Key className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-blue-500 mb-4 font-['Kaushan_Script']">
              Réinitialiser le mot de passe
            </h1>
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-medium text-blue-900">
                  Entrez votre nouveau mot de passe
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-blue-900/50" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="Nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-900/60 hover:text-blue-900"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-blue-900 font-medium mb-2 text-sm"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-blue-900/50" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                      placeholder="Confirmez le mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-900/60 hover:text-blue-900"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 flex items-center justify-center text-sm font-medium"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Réinitialiser le mot de passe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
