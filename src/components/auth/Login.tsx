import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { InputOTP } from "../ui/input-otp";
import { useAuthStore } from '../../stores/authStoreSimple';
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();
  const {
    login,
    twoFactorLogin,
    clearError,
    isLoading,
    error,
    isAuthenticated,
    user
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember_me: false,

  });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérifier si l'utilisateur est déjà authentifié au chargement de la page
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      if (user?.role === 'PARENT' || user?.role === 'STUDENT') {
        navigate('/dashboard-overview', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, []);

  // Nettoyer les erreurs au démontage
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Nettoyer les erreurs lors de la saisie
    if (error) {
      clearError();
    }

  };

  const handleTwoFactorSubmit = async () => {
    if (isSubmitting || !twoFactorUserId) return;
    // On ne tente la validation automatique que lorsque le code est complet (6 chiffres)
    if (twoFactorCode.length !== 6) return;

    setIsSubmitting(true);
    try {
      const loggedInUser = await twoFactorLogin({ userId: twoFactorUserId, twoFactorCode });
      if (loggedInUser?.role === 'PARENT' || loggedInUser?.role === 'STUDENT') {
        navigate('/dashboard-overview', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Erreur de connexion 2FA:', error);
      // Réinitialiser le code OTP pour forcer une nouvelle saisie
      setTwoFactorCode("");
      setTwoFactorError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation automatique du code 2FA dès que l'OTP est complet
  useEffect(() => {
    if (isTwoFactorStep && twoFactorUserId && twoFactorCode.length === 6 && !isSubmitting) {
      void handleTwoFactorSubmit();
    }
  }, [isTwoFactorStep, twoFactorUserId, twoFactorCode, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({ email: formData.email, password: formData.password });

      if (res?.twoFactorRequired && res.twoFactorUserId) {
        setTwoFactorUserId(res.twoFactorUserId);
        setIsTwoFactorStep(true);
        return;
      }

      const loggedInUser = res?.user;
      if (loggedInUser?.role === 'PARENT' || loggedInUser?.role === 'STUDENT') {
        navigate('/dashboard-overview', { replace: true });
      } else if (loggedInUser) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="login" className="min-h-screen relative overflow-hidden">
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
            <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
              <LogIn className="w-8 h-8 text-blue-500" />
            </Link>
            <h1 className="text-4xl font-bold text-blue-500 mb-4 font-['Kaushan_Script']">
              Connexion
            </h1>
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Accédez à votre espace personnel pour gérer vos informations et
              suivre votre parcours.
            </p>
          </div>

          {/* Login Form */}
          <div className="backdrop-blur-xl bg-white/70 p-6 rounded-2xl shadow-lg border border-white/40 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <LogIn className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-medium text-blue-900">
                  Connectez-vous à votre compte
                </h2>
              </div>

              {!isTwoFactorStep ? (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-blue-900 font-medium mb-2 text-sm"
                    >
                      Mot de passe
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
                        placeholder="Votre mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-blue-900/50 hover:text-blue-900" />
                        ) : (
                          <Eye className="w-4 h-4 text-blue-900/50 hover:text-blue-900" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember_me"
                        type="checkbox"
                        checked={formData.remember_me}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded-full"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-xs text-blue-900"
                      >
                        Se souvenir de moi
                      </label>
                    </div>
                    <Link
                      to="/forgot_password"
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 text-xs"
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Se connecter</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div>
                    <label
                      htmlFor="twoFactorCode"
                      className="block text-blue-900 font-medium mb-2 text-sm"
                    >
                      Code de vérification (2FA)
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <InputOTP
                        value={twoFactorCode}
                        onChange={(val) => {
                          setTwoFactorCode(val);
                          if (twoFactorError) {
                            setTwoFactorError(false);
                          }
                        }}
                        length={6}
                        error={twoFactorError}
                      />
                      <p className="text-[11px] text-blue-900/70 text-center">
                        Entrez le code à 6 chiffres généré par votre application d'authentification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTwoFactorStep(false);
                        setTwoFactorCode("");
                        setTwoFactorUserId(null);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      ⟵ Retour à la connexion
                    </button>
                  </div>

                  {isSubmitting && (
                    <div className="w-full flex items-center justify-center text-xs text-blue-900/80 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Vérification du code...</span>
                    </div>
                  )}
                </form>
              )}

              {/* Register Link */}
              {/* <div className="mt-6 pt-4 border-t border-white/40">
                <p className="text-xs text-center text-blue-900/70">
                  Vous n'avez pas de compte ?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
