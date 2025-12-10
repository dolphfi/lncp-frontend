import React, { useEffect, useRef, useState } from "react";
import authService, { TrustedDevice } from "../../../services/authService";
import { useAuthStore } from "../../../stores/authStoreSimple";
import DashboardHeader from "../../includes/DashboardHeader";
import {
  Loader2,
  Mail,
  Phone,
  Shield,
  UserRound,
  Save,
  X,
  ImagePlus,
  CheckCircle,
  XCircle,
  Circle,
  Clock,
  LogIn,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Activity,
  Download,
  Copy,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { InputOTP } from "../../ui/input-otp";
// IMPORTANT: Installer la dépendance si elle n'est pas déjà présente:
// npm i react-easy-crop
import Cropper from "react-easy-crop";

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isStudentOrParent = user?.role === 'STUDENT' || user?.role === 'PARENT';
  const [me, setMe] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
  }>({ firstName: "", lastName: "", phone: "", bio: "" });

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 2FA modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [enable2FALoading, setEnable2FALoading] = useState(false);
  const [twoFactorCodeError, setTwoFactorCodeError] = useState(false);

  // Avatar + Crop states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trusted devices
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [trustedLoading, setTrustedLoading] = useState(false);
  const [trustedError, setTrustedError] = useState<string | null>(null);
  const [showTrustedDevicesModal, setShowTrustedDevicesModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authService.getMe();
        if (!cancelled) {
          setMe(data);
          setEdit({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            bio: data.bio || "",
          });
          setTwoFactorEnabled(!!data.twoFactorEnabled);
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || "Impossible de charger le profil");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setTrustedLoading(true);
        const devices = await authService.getTrustedDevices();
        if (!cancelled) {
          setTrustedDevices(devices);
        }
      } catch (e: any) {
        if (!cancelled) {
          setTrustedError(e?.message || "Impossible de charger les appareils de confiance");
        }
      } finally {
        if (!cancelled) {
          setTrustedLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = me
    ? `${me.firstName || ""} ${me.lastName || ""}`.trim()
    : user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : "";
  const role = me?.role || user?.role || "USER";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit.firstName.trim() || !edit.lastName.trim()) {
      toast.error("Nom et prénom sont requis");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        firstName: edit.firstName.trim(),
        lastName: edit.lastName.trim(),
        phone: edit.phone.trim() || undefined,
        bio: edit.bio.trim() || undefined,
      };
      // Si un nouvel avatar est prêt (recadré), l'ajouter
      if ((window as any).__profileCroppedFile) {
        payload.avatar = (window as any).__profileCroppedFile as File;
      }

      const updated = await authService.updateMe(payload);
      setMe(updated);
      try {
        document.dispatchEvent(
          new CustomEvent("profile:updated", { detail: updated })
        );
      } catch { }
      // Nettoyer les buffers temporaires
      (window as any).__profileCroppedFile = undefined;

      toast.success("Profil mis à jour avec succès");
    } catch (err: any) {
      toast.error(err?.message || "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel2FASetup = () => {
    setShow2FAModal(false);
    setTwoFactorEnabled(false);
    setTwoFactorCodeInput("");
    setTwoFactorCodeError(false);
  };

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const res = await authService.setup2FA();
        setQrCodeUrl(res.qrCodeDataUrl);
        setBackupCodes(res.backupCodes || []);
        setTwoFactorCodeInput("");
        setShow2FAModal(true);
      } catch (e: any) {
        toast.error(e?.message || "Impossible d'initialiser la 2FA");
        setTwoFactorEnabled(false);
      }
    } else {
      try {
        await authService.disable2FA();
        setTwoFactorEnabled(false);
        setMe((prev: any) => (prev ? { ...prev, twoFactorEnabled: false } : prev));
        toast.success("Authentification 2FA désactivée");
      } catch (e: any) {
        toast.error(e?.message || "Impossible de désactiver la 2FA");
        setTwoFactorEnabled(true);
      }
    }
  };

  const handleEnable2FA = async (code: string) => {
    if (code.trim().length !== 6) {
      return;
    }
    setEnable2FALoading(true);
    try {
      await authService.enable2FA(code.trim());
      setTwoFactorEnabled(true);
      setMe((prev: any) => (prev ? { ...prev, twoFactorEnabled: true } : prev));
      toast.success("Authentification 2FA activée avec succès");
      setShow2FAModal(false);
      setTwoFactorCodeInput("");
      setTwoFactorCodeError(false);
    } catch (e: any) {
      console.error("Erreur lors de l'activation de la 2FA:", e);
      setTwoFactorCodeError(true);
      setTwoFactorCodeInput("");
    } finally {
      setEnable2FALoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lncp-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Codes de secours téléchargés");
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Codes de secours copiés dans le presse-papier");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword.trim()) {
      toast.error("Mot de passe actuel requis");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("Nouveau mot de passe requis");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Validation selon les exigences du backend
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
      );
      return;
    }

    setPasswordSaving(true);
    try {
      // Appel à l'API pour changer le mot de passe
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success("Mot de passe modifié avec succès");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toast.error(err?.message || "Échec de la modification du mot de passe");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRemoveTrustedDevice = async (deviceId: string) => {
    try {
      const updated = await authService.removeTrustedDevice(deviceId);
      setTrustedDevices(updated);
      toast.success("Appareil supprimé des appareils de confiance");
    } catch (e: any) {
      toast.error(e?.message || "Impossible de supprimer cet appareil");
    }
  };

  const handleClearTrustedDevices = async () => {
    if (!trustedDevices.length) return;
    try {
      await authService.clearTrustedDevices();
      setTrustedDevices([]);
      toast.success("Tous les appareils de confiance ont été supprimés");
    } catch (e: any) {
      toast.error(e?.message || "Impossible de supprimer les appareils de confiance");
    }
  };

  return (
    <section className="relative min-h-screen bg-gray-50">
      {/* Header pour STUDENT et PARENT */}
      {isStudentOrParent && <DashboardHeader />}

      <div className={`px-4 ${isStudentOrParent ? 'py-6 pb-24 md:pb-8' : 'py-6 md:py-8'}`}>
        <div className="max-w-5xl mx-auto">
          {/* Bouton retour pour STUDENT et PARENT - Masqué en mobile */}
          {isStudentOrParent && (
            <button
              onClick={() => navigate('/dashboard-overview')}
              className="mb-4 hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-blue-900 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </button>
          )}

          {/* Modal Appareils de confiance */}
          {showTrustedDevicesModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-sky-100 text-sky-600">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900">Appareils de confiance</h3>
                      <p className="text-[11px] text-blue-900/70">
                        Appareils sur lesquels la 2FA ne sera pas redemandée pendant une période limitée.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTrustedDevicesModal(false)}
                    className="p-1.5 rounded-full bg-gray-100 text-blue-900 hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {trustedLoading ? (
                    <div className="flex items-center text-blue-900 text-[11px]">
                      <Loader2 className="w-3 h-3 animate-spin mr-2" /> Chargement des appareils...
                    </div>
                  ) : trustedError ? (
                    <p className="text-[11px] text-red-600">{trustedError}</p>
                  ) : trustedDevices.length === 0 ? (
                    <p className="text-[11px] text-blue-900/70">
                      Aucun appareil de confiance enregistré. Lors de la validation d'un code 2FA, vous pourrez approuver cet appareil.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {trustedDevices.map((device) => {
                        const lastUsed = device.lastUsedAt ? new Date(device.lastUsedAt) : null;
                        const expires = device.expiresAt ? new Date(device.expiresAt) : null;
                        return (
                          <div
                            key={device.id}
                            className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                          >
                            <div className="flex-1 mr-2">
                              <p className="text-[11px] font-medium text-blue-900 line-clamp-1">
                                {device.userAgent}
                              </p>
                              <p className="text-[11px] text-blue-900/70">
                                IP: {device.ipAddress}
                                {device.location ? ` · ${device.location}` : ""}
                              </p>
                              <p className="text-[11px] text-blue-900/50">
                                Dernière utilisation: {lastUsed ? lastUsed.toLocaleString('fr-FR') : 'Inconnue'}
                              </p>
                              <p className="text-[11px] text-blue-900/50">
                                Expire le: {expires ? expires.toLocaleString('fr-FR') : 'Inconnu'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTrustedDevice(device.id)}
                              className="text-[11px] text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end">
                  {trustedDevices.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearTrustedDevices}
                      className="text-[11px] text-red-600 hover:text-red-700"
                    >
                      Supprimer tous les appareils
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Carte profil */}
            <div className="md:col-span-1">
              <div className="rounded-2xl backdrop-blur-xl bg-white/40 overflow-hidden border border-gray-200/60">
                {/* Cover Photo Section */}
                <div className="relative h-36 bg-gradient-to-r from-blue-100 to-sky-200">
                  <img
                    src={"/lncp.png"}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  {/* Status Icons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {/* Verified Status */}
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
                      {me?.isVerified ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span className="text-xs font-medium text-gray-700">
                        {me?.isVerified ? "Vérifié" : "Non vérifié"}
                      </span>
                    </div>
                    {/* Active Status */}
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
                      {me?.isActive ? (
                        <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                      ) : (
                        <Circle className="w-3 h-3 text-red-400" />
                      )}
                      <span className="text-xs font-medium text-gray-700">
                        {me?.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Avatar and Info Section */}
                <div className="relative p-5 pt-0">
                  {/* Avatar */}
                  <div className="-mt-12 mb-4 flex justify-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full border-4 border-white/50 bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold overflow-hidden">
                        {me?.avatarUrl || avatarPreview ? (
                          <img
                            src={avatarPreview || me?.avatarUrl}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (fullName || "U").slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        title="Changer la photo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <h2 className="text-sm md:text-base font-semibold text-blue-900">
                      {fullName || me?.email || user?.email}
                    </h2>
                    <p className="text-xs text-blue-700/70 flex items-center justify-center gap-1 mt-1">
                      <Shield className="w-3 h-3" /> {role}
                    </p>
                  </div>

                  {/* Contact Info */}

                  {/* Statistiques utilisateur */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-semibold text-blue-900/80 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Statistiques
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Dernière connexion */}
                      <button className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-green-200/60 transition-all duration-200 group">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors duration-200">
                            <Clock className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium text-blue-900 group-hover:text-blue-800">
                            Dernière connexion
                          </span>
                        </div>
                        <span className="text-xs text-blue-900/80 text-right max-w-[160px] group-hover:text-blue-900">
                          {me?.lastLoginAt
                            ? (() => {
                              const date = new Date(me.lastLoginAt);
                              const formattedDate = date.toLocaleDateString(
                                "fr-FR",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              );
                              const formattedTime = date.toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              );
                              return `${formattedDate} à ${formattedTime}`;
                            })()
                            : "Jamais"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setAvatarPreview(reader.result as string);
                    setCropping(true);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {/* Section Paramètres */}
              <div className="mt-4 rounded-2xl backdrop-blur-xl bg-white/40 overflow-hidden border border-gray-200/60">
                <div className="p-5">
                  <h3 className="text-xs font-medium text-blue-900 mb-4 flex items-center">
                    <Shield className="w-3 h-3 mr-2" /> Paramètres
                  </h3>

                  <div className="space-y-3">
                    {/* Authentification à deux facteurs */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                          <Shield className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-blue-900">
                          Authentification 2FA
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={twoFactorEnabled}
                          onChange={(e) => {
                            setTwoFactorEnabled(e.target.checked);
                            void handle2FAToggle(e.target.checked);
                          }}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Visibilité du profil / Appareils de confiance (modal) */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-purple-100 text-purple-600">
                          <Activity className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-blue-900">
                          Appareils de confiance
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTrustedDevicesModal(true)}
                        className="inline-flex items-center justify-center p-2 rounded-full bg-white/80 border border-gray-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        title="Voir les appareils de confiance"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Changer le mot de passe */}
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-orange-100 text-orange-600">
                          <Lock className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-blue-900">
                          Changer le mot de passe
                        </span>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails & activité */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 border border-gray-200/60">
                <h3 className="text-xs font-medium text-blue-900 mb-4 flex items-center">
                  <UserRound className="w-3 h-3 mr-2" /> Détails
                </h3>
                {loading ? (
                  <div className="flex items-center text-blue-900 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />{" "}
                    Chargement...
                  </div>
                ) : error ? (
                  <p className="text-red-600 text-xs">{error}</p>
                ) : (
                  <>
                    <form
                      onSubmit={handleSave}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs text-blue-900"
                    >
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">
                          Nom
                        </label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.firstName}
                          onChange={(e) =>
                            setEdit((v) => ({
                              ...v,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">
                          Prénom
                        </label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.lastName}
                          onChange={(e) =>
                            setEdit((v) => ({ ...v, lastName: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">
                          Téléphone
                        </label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.phone}
                          onChange={(e) =>
                            setEdit((v) => ({ ...v, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        {/* className="md:col-span-2" */}
                        <label className="block text-xs text-blue-900/70 mb-1">
                          Bio
                        </label>
                        <textarea
                          rows={3}
                          className="w-full rounded-lg bg-white/60 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.bio}
                          onChange={(e) =>
                            setEdit((v) => ({ ...v, bio: e.target.value }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end items-center">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-xs"
                        >
                          <Save className="w-3 h-3" />{" "}
                          {saving ? "Modification..." : "Modifier"}
                        </button>
                      </div>
                    </form>
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm text-blue-900 mt-4">
                      <div><span className="font-medium">Vérifié:</span> {me?.isVerified ? 'Oui' : 'Non'}</div>
                      <div><span className="font-medium">Actif:</span> {me?.isActive ? 'Oui' : 'Non'}</div>
                      <div><span className="font-medium">Dernière connexion:</span> {me?.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString() : '-'}</div>
                      <div><span className="font-medium">Tentatives:</span> {me?.loginAttempts ?? '-'}</div>
                    </div> */}
                  </>
                )}
              </div>

              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 border border-gray-200/60">
                <h3 className="text-xs font-medium text-blue-900 mb-4">
                  Activité récente
                </h3>
                {loading ? (
                  <div className="flex items-center text-blue-900 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />{" "}
                    Chargement...
                  </div>
                ) : error ? (
                  <p className="text-red-600 text-xs">{error}</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 md:pr-2">
                    {me?.activityLogs?.length ? (
                      [...me.activityLogs]
                        .sort((a: any, b: any) => {
                          const ta = new Date(a.timestamp).getTime();
                          const tb = new Date(b.timestamp).getTime();
                          return tb - ta;
                        })
                        .map((log: any, idx: number) => {
                          const date = new Date(log.timestamp);
                          const formattedDate = date.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          });
                          const formattedTime = date.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                          let title = "Activité";
                          let description: string | null = null;
                          let IconComponent: React.ElementType = Activity;

                          switch (log.action) {
                            case "LOGIN":
                              title = "Connexion";
                              description = "Connexion réussie au compte";
                              IconComponent = LogIn;
                              break;
                            case "PROFILE_UPDATE":
                              title = "Mise à jour du profil";
                              description = "Modification de vos informations de profil";
                              IconComponent = UserRound;
                              break;
                            case "PASSWORD_UPDATE":
                              title = "Changement de mot de passe";
                              description = "Votre mot de passe a été modifié";
                              IconComponent = Lock;
                              break;
                            default:
                              title = log.action || "Activité";
                              IconComponent = Activity;
                              break;
                          }

                          const ip = log.ip as string | undefined;
                          const userAgent = log.userAgent as string | undefined;

                          return (
                            <div
                              key={idx}
                              className="bg-white/70 rounded-xl p-4 border border-gray-200/60 hover:bg-white/80 transition-colors duration-200"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 flex gap-2">
                                  <div className="mt-1">
                                    <IconComponent className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-blue-900 mb-0.5">
                                      {title}
                                    </h4>
                                    {description && (
                                      <p className="text-[11px] text-blue-900/70 mb-1">
                                        {description}
                                      </p>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-blue-900/70">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formattedDate}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formattedTime}
                                      </span>
                                    </div>
                                    {(ip || userAgent) && (
                                      <p className="mt-1 text-[10px] text-blue-900/50 line-clamp-1">
                                        {ip && <span>IP: {ip}</span>}
                                        {ip && userAgent && <span> · </span>}
                                        {userAgent && <span>Appareil: {userAgent}</span>}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-blue-900/70 text-sm">
                          Aucune activité récente
                        </p>
                        <p className="text-blue-900/50 text-xs mt-1">
                          Vos activités apparaîtront ici
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop overlay */}
      {cropping && avatarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white overflow-hidden">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
              onClick={() => {
                setCropping(false);
                setAvatarPreview(null);
              }}
            >
              <X className="w-5 h-5 text-blue-900" />
            </button>
            <div className="relative h-[320px] sm:h-[420px] bg-black/5">
              <Cropper
                image={avatarPreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_: unknown, areaPixels: any) =>
                  setCroppedAreaPixels(areaPixels)
                }
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-900/70">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-blue-900 hover:bg-gray-200"
                  onClick={() => {
                    setCropping(false);
                    setAvatarPreview(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="px-2 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      if (!avatarPreview || !croppedAreaPixels) return;
                      const blob = await getCroppedImg(
                        avatarPreview,
                        croppedAreaPixels
                      );
                      const file = new File([blob], "avatar.jpg", {
                        type: "image/jpeg",
                      });
                      // stocker pour la sauvegarde et afficher l'aperçu
                      (window as any).__profileCroppedFile = file;
                      const url = URL.createObjectURL(blob);
                      setAvatarPreview(url);
                      setCropping(false);
                      toast.success(
                        "Aperçu de la photo mis à jour. Cliquez sur Enregistrer pour valider."
                      );
                    } catch (err: any) {
                      toast.error(err?.message || "Échec du recadrage");
                    }
                  }}
                >
                  Recadrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white overflow-hidden border border-gray-200/80">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="p-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-medium text-blue-900/70 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900 text-sm"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-blue-900/70 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900 text-sm"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-blue-900/70 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900 text-sm"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Modifier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white overflow-hidden border border-gray-200/80 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5" />
                Configuration 2FA
              </h3>
              <button
                onClick={handleCancel2FASetup}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* QR Code Section */}
              <div className="text-center">
                <div className="inline-block p-2 bg-white border border-gray-200 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Scannez avec votre app d'authentification
                </p>
              </div>

              {/* Backup Codes Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-blue-900">
                    Codes de secours
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={copyBackupCodes}
                      className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      title="Copier"
                    >
                      <Copy className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="p-1 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                      title="Télécharger"
                    >
                      <Download className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-white px-2 py-1.5 rounded border border-gray-200 text-center"
                      >
                        <span className="text-[10px] font-mono text-blue-900 font-medium">
                          {code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-blue-900 mb-1">
                  Code de vérification
                </label>
                <div className="flex flex-col items-center gap-2">
                  <InputOTP
                    value={twoFactorCodeInput}
                    onChange={(val) => {
                      const numeric = val.replace(/[^0-9]/g, "");
                      setTwoFactorCodeInput(numeric);
                      if (twoFactorCodeError) {
                        setTwoFactorCodeError(false);
                      }
                      if (numeric.length === 6 && !enable2FALoading) {
                        void handleEnable2FA(numeric);
                      }
                    }}
                    length={6}
                    error={twoFactorCodeError}
                    disabled={enable2FALoading}
                  />
                  <p className="mt-1 text-[10px] text-blue-900/60 text-center">
                    Entrez le code généré par votre application d'authentification pour activer la 2FA.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                <div className="flex gap-2">
                  <Shield className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800">
                    Sauvegardez vos codes de secours avant d'activer la 2FA.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel2FASetup}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Utilitaire pour convertir une zone crop en Blob/File
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9)
  );
}
// Overlay de cropper (rendu conditionnel au bas du composant)

export default Profile;
