import React, { useEffect, useRef, useState } from "react";
import authService from "../../../services/authService";
import { useAuthStore } from "../../../stores/authStoreSimple";
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
} from "lucide-react";
import { toast } from "react-toastify";
// IMPORTANT: Installer la dépendance si elle n'est pas déjà présente:
// npm i react-easy-crop
import Cropper from "react-easy-crop";

const Profile: React.FC = () => {
  const { user } = useAuthStore();
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
  // Avatar + Crop states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      } catch {}
      // Nettoyer les buffers temporaires
      (window as any).__profileCroppedFile = undefined;

      toast.success("Profil mis à jour avec succès");
    } catch (err: any) {
      toast.error(err?.message || "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
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

  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Carte profil */}
            <div className="md:col-span-1">
              <div className="rounded-2xl backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-200/60">
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
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
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
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
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
                      <div className="w-24 h-24 rounded-full border-4 border-white/50 shadow-lg bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold overflow-hidden">
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
                        className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
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
                  <div className="mt-5 md:mt-6 space-y-2 text-xs">
                    <div className="flex items-center text-blue-900/80">
                      <Mail className="w-3 h-3 mr-2 text-blue-500" />{" "}
                      {me?.email || user?.email}
                    </div>
                    {me?.phone && (
                      <div className="flex items-center text-blue-900/80">
                        <Phone className="w-3 h-3 mr-2 text-blue-500" />{" "}
                        {me.phone}
                      </div>
                    )}
                  </div>
                  {/* Statistiques utilisateur */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-semibold text-blue-900/80 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Statistiques
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Tentatives de connexion */}
                      <button className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-200/80 hover:bg-white/70 hover:border-blue-200/60 transition-all duration-200 group">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors duration-200">
                            <LogIn className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium text-blue-900 group-hover:text-blue-800">
                            Tentatives de connexion
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
                          {me?.loginAttempts ?? 0}
                        </span>
                      </button>

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
                        <span className="text-xs text-blue-900/80 text-right max-w-[140px] group-hover:text-blue-900">
                          {me?.lastLoginAt
                            ? new Date(me.lastLoginAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
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
            </div>

            {/* Détails & activité */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5 border border-gray-200/60">
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
                      <div className="md:col-span-2 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setShowPasswordModal(true)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs transition-colors duration-200"
                        >
                          <Lock className="w-3 h-3" />
                          Changer le mot de passe
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-xs"
                        >
                          <Save className="w-3 h-3" />{" "}
                          {saving ? "Enregistrement..." : "Enregistrer"}
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

              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5 border border-gray-200/60">
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
                  <ul className="space-y-2 text-xs text-blue-900/90 max-h-64 overflow-y-auto pr-1 md:pr-2">
                    {me?.activityLogs?.length ? (
                      me.activityLogs.map((log: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-gray-200/80"
                        >
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-blue-900/70">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-blue-900/70">
                        Aucune activité récente
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop overlay */}
      {cropping && avatarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow"
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
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200/80">
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
