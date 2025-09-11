import React, { useEffect, useRef, useState } from 'react';
import authService from '../../../services/authService';
import { useAuthStore } from '../../../stores/authStoreSimple';
import { Loader2, Mail, Phone, Shield, UserRound, Save, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';
// IMPORTANT: Installer la dépendance si elle n'est pas déjà présente:
// npm i react-easy-crop
import Cropper from 'react-easy-crop';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [me, setMe] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<{ firstName: string; lastName: string; phone: string; bio: string }>({ firstName: '', lastName: '', phone: '', bio: '' });
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
          setEdit({ firstName: data.firstName || '', lastName: data.lastName || '', phone: data.phone || '', bio: data.bio || '' });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Impossible de charger le profil');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fullName = me ? `${me.firstName || ''} ${me.lastName || ''}`.trim() : user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  const role = me?.role || user?.role || 'USER';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit.firstName.trim() || !edit.lastName.trim()) {
      toast.error('Nom et prénom sont requis');
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
        document.dispatchEvent(new CustomEvent('profile:updated', { detail: updated }));
      } catch {}
      // Nettoyer le buffer temporaire d'avatar
      (window as any).__profileCroppedFile = undefined;
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err?.message || 'Échec de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen bg-gradient-to-b from-blue-100 via-blue-50 to-blue-100">
      {/* Decorative blue gradients in main background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Large subtle radial glow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[-20%] w-[120rem] h-[120rem] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />
        {/* Accent blobs */}
        <div className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600" />
        <div className="absolute -bottom-20 -left-20 md:-bottom-28 md:-left-28 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-sky-400 via-blue-400 to-blue-600" />
      </div>

      <div className="px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Mon Profil</h1>
            <p className="text-sm text-blue-900/60">Informations personnelles et activité</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Carte profil */}
            <div className="md:col-span-1 rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5">
              <div className="flex flex-col items-center text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold overflow-hidden">
                    {me?.avatarUrl || avatarPreview ? (
                      <img src={avatarPreview || me?.avatarUrl} alt="avatar" className="w-24 h-24 object-cover" />
                    ) : (
                      (fullName || 'U').slice(0,2).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
                    title="Changer la photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
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
                <h2 className="mt-4 text-lg md:text-xl font-semibold text-blue-900">{fullName || me?.email || user?.email}</h2>
                <p className="text-xs text-blue-700/70 flex items-center gap-1 mt-1"><Shield className="w-4 h-4" /> {role}</p>
              </div>
              <div className="mt-5 md:mt-6 space-y-2 text-sm">
                <div className="flex items-center text-blue-900/80"><Mail className="w-4 h-4 mr-2" /> {me?.email || user?.email}</div>
                {me?.phone && (<div className="flex items-center text-blue-900/80"><Phone className="w-4 h-4 mr-2" /> {me.phone}</div>)}
              </div>
            </div>

            {/* Détails & activité */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5">
                <h3 className="text-sm font-medium text-blue-900 mb-4 flex items-center"><UserRound className="w-4 h-4 mr-2" /> Détails</h3>
                {loading ? (
                  <div className="flex items-center text-blue-900"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Chargement...</div>
                ) : error ? (
                  <p className="text-red-600 text-sm">{error}</p>
                ) : (
                  <>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm text-blue-900">
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">Prénom</label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.firstName}
                          onChange={(e) => setEdit(v => ({ ...v, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">Nom</label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.lastName}
                          onChange={(e) => setEdit(v => ({ ...v, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-900/70 mb-1">Téléphone</label>
                        <input
                          className="w-full rounded-lg bg-white/60 border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.phone}
                          onChange={(e) => setEdit(v => ({ ...v, phone: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-blue-900/70 mb-1">Bio</label>
                        <textarea
                          rows={3}
                          className="w-full rounded-lg bg-white/60 border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-blue-900"
                          value={edit.bio}
                          onChange={(e) => setEdit(v => ({ ...v, bio: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                      </div>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm text-blue-900 mt-4">
                      <div><span className="font-medium">Vérifié:</span> {me?.isVerified ? 'Oui' : 'Non'}</div>
                      <div><span className="font-medium">Actif:</span> {me?.isActive ? 'Oui' : 'Non'}</div>
                      <div><span className="font-medium">Dernière connexion:</span> {me?.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString() : '-'}</div>
                      <div><span className="font-medium">Tentatives:</span> {me?.loginAttempts ?? '-'}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl p-5 md:p-6 backdrop-blur-xl bg-white/40 shadow-xl shadow-blue-900/5">
                <h3 className="text-sm font-medium text-blue-900 mb-4">Activité récente</h3>
                {loading ? (
                  <div className="flex items-center text-blue-900"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Chargement...</div>
                ) : error ? (
                  <p className="text-red-600 text-sm">{error}</p>
                ) : (
                  <ul className="space-y-2 text-sm text-blue-900/90 max-h-64 overflow-y-auto pr-1 md:pr-2">
                    {me?.activityLogs?.length ? me.activityLogs.map((log: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-white/50">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-xs text-blue-900/70">{new Date(log.timestamp).toLocaleString()}</span>
                      </li>
                    )) : <li className="text-blue-900/70">Aucune activité récente</li>}
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
              onClick={() => { setCropping(false); setAvatarPreview(null); }}
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
                onCropComplete={(_: unknown, areaPixels: any) => setCroppedAreaPixels(areaPixels)}
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
                  className="px-3 py-2 text-xs rounded-lg bg-gray-100 text-blue-900 hover:bg-gray-200"
                  onClick={() => { setCropping(false); setAvatarPreview(null); }}
                >
                  Annuler
                </button>
                <button
                  className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={async () => {
                    try {
                      if (!avatarPreview || !croppedAreaPixels) return;
                      const blob = await getCroppedImg(avatarPreview, croppedAreaPixels);
                      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                      // stocker pour la sauvegarde et afficher l'aperçu
                      (window as any).__profileCroppedFile = file;
                      const url = URL.createObjectURL(blob);
                      setAvatarPreview(url);
                      setCropping(false);
                      toast.success('Aperçu de la photo mis à jour. Cliquez sur Enregistrer pour valider.');
                    } catch (err: any) {
                      toast.error(err?.message || 'Échec du recadrage');
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
    </section>
  );
};

// Utilitaire pour convertir une zone crop en Blob/File
async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
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
  return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', 0.9));
}
// Overlay de cropper (rendu conditionnel au bas du composant)

export default Profile;
