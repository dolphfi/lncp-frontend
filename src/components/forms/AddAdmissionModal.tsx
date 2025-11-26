import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CreateOnSiteAdmissionDTO } from '../../types/admission';
import { useAdmissionStore } from '../../stores/admissionStore';
import { studentsService, Responsable } from '../../services/students/studentsService';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../styles/phone-input.css';

interface AddAdmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddAdmissionModal: React.FC<AddAdmissionModalProps> = ({ open, onOpenChange }) => {
  const { createOnSiteAdmission, loadingAction } = useAdmissionStore();
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, clearErrors } = useForm<CreateOnSiteAdmissionDTO>();
  
  // États pour la gestion des responsables
  const [responsableMode, setResponsableMode] = useState<'create' | 'select'>('create');
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResponsables, setFilteredResponsables] = useState<Responsable[]>([]);
  const [selectedResponsableId, setSelectedResponsableId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Observer pour l'affichage conditionnel
  const handicap = watch('handicap');

  // Charger les responsables au montage si le modal est ouvert
  useEffect(() => {
    if (open && responsableMode === 'select') {
      const loadResponsables = async () => {
        try {
          const data = await studentsService.getResponsables();
          setResponsables(data);
          setFilteredResponsables(data);
        } catch (error) {
          console.error('Erreur chargement responsables:', error);
          toast.error('Impossible de charger la liste des responsables');
        }
      };
      loadResponsables();
    }
  }, [open, responsableMode]);

  // Réinitialiser les champs du responsable quand on passe en mode 'create'
  useEffect(() => {
    if (responsableMode === 'create') {
      setValue('responsableFirstName', '');
      setValue('responsableLastName', '');
      setValue('responsableEmail', '');
      setValue('responsablePhone', '');
      setValue('lienParente', '');
      setValue('responsableNif', '');
      setValue('responsableNinu', '');
      setSelectedResponsableId('');
    } else {
      // En mode select, on efface les erreurs potentielles de validation strictes
      clearErrors(['responsableNif', 'responsableNinu']);
    }
  }, [responsableMode, setValue, clearErrors]);

  // Filtrer les responsables
  useEffect(() => {
    if (!searchTerm) {
      setFilteredResponsables(responsables);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredResponsables(responsables.filter(r => 
        r.user.firstName.toLowerCase().includes(term) || 
        r.user.lastName.toLowerCase().includes(term) ||
        (r.user.phone && r.user.phone.includes(term))
      ));
    }
  }, [searchTerm, responsables]);

  // Gérer la sélection d'un responsable
  const handleResponsableSelect = (responsableId: string) => {
    setSelectedResponsableId(responsableId);
    const responsable = responsables.find(r => r.id === responsableId);
    
    if (responsable) {
      setValue('responsableFirstName', responsable.user.firstName);
      setValue('responsableLastName', responsable.user.lastName);
      setValue('responsableEmail', responsable.user.email);
      setValue('responsablePhone', responsable.user.phone || '');
      setValue('lienParente', responsable.lienParente);
      // Formater le NIF pour l'affichage s'il existe
      setValue('responsableNif', formatNif(responsable.nif || ''));
      setValue('responsableNinu', responsable.ninu || '');
    }
  };

  // Utilitaire pour formater le NIF
  const formatNif = (value: string) => {
    if (!value) return value;
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 10)}`;
  };

  const onSubmit = async (data: CreateOnSiteAdmissionDTO) => {
    setErrorMessage(null);
    try {
      // Transformation des FileList en File pour le service
      const formData: any = { ...data };
      
      // Ajouter responsableId si mode sélection
      if (responsableMode === 'select') {
        // Si on sélectionne un responsable existant, on ne peut pas envoyer ses identifiants uniques
        // car le backend actuel (non modifié) les considérerait comme des doublons et rejetterait la demande.
        // On nettoie donc ces champs pour permettre la création de l'admission avec au moins le nom/prénom.
        delete formData.responsableEmail;
        delete formData.responsableNif;
        delete formData.responsableNinu;
        delete formData.responsablePhone;
        
        // On supprime aussi l'ID car le backend ne le gère pas
        delete formData.responsableId;
      }

      // Nettoyage du NIF (enlever les tirets pour l'envoi)
      if (formData.responsableNif) {
        formData.responsableNif = formData.responsableNif.replace(/-/g, '');
      }

      // Traitement des fichiers
      const fileFields = [
        'photoInscription', 
        'acteNaissance', 
        'bulletinPrecedent', 
        'certificatMedical', 
        'justificatifDomicile', 
        'carteIdentiteParent'
      ];

      fileFields.forEach(field => {
        if (formData[field] && formData[field].length > 0) {
          formData[field] = formData[field][0];
        } else {
          delete formData[field];
        }
      });

      await createOnSiteAdmission(formData);
      toast.success('Admission créée avec succès');
      reset();
      setErrorMessage(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message;
      const formattedMessage = Array.isArray(message) 
        ? message.join('\n') 
        : (message || 'Erreur lors de la création');
      
      setErrorMessage(formattedMessage);
      toast.error('Erreur lors de la création, veuillez vérifier les champs');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
        if(!v) setErrorMessage(null);
        onOpenChange(v);
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Nouvelle Admission Sur Site</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm leading-5 font-medium text-red-800">
                  Erreur lors de la soumission
                </h3>
                <div className="mt-2 text-sm leading-5 text-red-700 whitespace-pre-line">
                  {errorMessage}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. IDENTITÉ DE L'ÉLÈVE */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">1. Identité de l'élève</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Prénom *</Label>
                <Input {...register('firstName', { required: true })} placeholder="Prénom de l'élève" />
                {errors.firstName && <span className="text-red-500 text-xs">Requis</span>}
              </div>
              
              <div>
                <Label>Nom *</Label>
                <Input {...register('lastName', { required: true })} placeholder="Nom de famille" />
                {errors.lastName && <span className="text-red-500 text-xs">Requis</span>}
              </div>

              <div>
                <Label>Sexe *</Label>
                <select {...register('sexe', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Sélectionner</option>
                  <option value="Homme">Masculin</option>
                  <option value="Femme">Féminin</option>
                </select>
                {errors.sexe && <span className="text-red-500 text-xs">Requis</span>}
              </div>

              <div>
                <Label>Date de naissance *</Label>
                <Input type="date" {...register('dateOfBirth', { required: true })} />
                {errors.dateOfBirth && <span className="text-red-500 text-xs">Requis</span>}
              </div>

              <div>
                <Label>Lieu de naissance *</Label>
                <Input {...register('lieuDeNaissance', { required: true })} placeholder="Ville de naissance" />
                {errors.lieuDeNaissance && <span className="text-red-500 text-xs">Requis</span>}
              </div>
              
              <div>
                <Label>Commune de naissance *</Label>
                <Input {...register('communeDeNaissance', { required: true })} placeholder="Commune" />
                {errors.communeDeNaissance && <span className="text-red-500 text-xs">Requis</span>}
              </div>

              <div>
                <Label>Vacation souhaitée *</Label>
                <select {...register('vacation', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Matin (AM)">AM (Matin)</option>
                  <option value="Après-midi (PM)">PM (Après-midi)</option>
                </select>
                {errors.vacation && <span className="text-red-500 text-xs">Requis</span>}
              </div>

              <div>
                <Label>Handicap ?</Label>
                <select {...register('handicap')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Non">Non</option>
                  <option value="Oui">Oui</option>
                </select>
              </div>

              {handicap === 'Oui' && (
                <div className="col-span-2">
                  <Label>Détails du handicap</Label>
                  <Input {...register('handicapDetails')} placeholder="Précisez la nature du handicap" />
                </div>
              )}
            </div>
          </div>

          {/* 2. COORDONNÉES & ADRESSE */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">2. Coordonnées & Adresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  {...register('email', { 
                    required: 'Requis',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email invalide'
                    }
                  })} 
                  placeholder="email@exemple.com" 
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
              </div>

              <div>
                <Label>Téléphone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      defaultCountry="HT"
                      placeholder="Entrez le numéro..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Adresse (Numéro, Rue) *</Label>
                  <Input {...register('adresseLigne1', { required: true })} placeholder="ex: 12, Rue Capois" />
                  {errors.adresseLigne1 && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                
                <div>
                  <Label>Département *</Label>
                  <Input {...register('departement', { required: true })} placeholder="ex: Ouest" />
                  {errors.departement && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                
                <div>
                  <Label>Commune *</Label>
                  <Input {...register('commune', { required: true })} placeholder="ex: Port-au-Prince" />
                  {errors.commune && <span className="text-red-500 text-xs">Requis</span>}
                </div>

                <div>
                  <Label>Section Communale</Label>
                  <Input {...register('sectionCommunale')} placeholder="ex: Turgeau" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. INFORMATIONS FAMILIALES */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">3. Informations Familiales</h3>
            
            {/* Mère */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="font-medium mb-3 text-gray-700">Mère</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Prénom *</Label>
                  <Input {...register('prenomMere', { required: true })} />
                  {errors.prenomMere && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input {...register('nomMere', { required: true })} />
                  {errors.nomMere && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                <div>
                  <Label>Statut *</Label>
                  <select {...register('statutMere', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Vivant">Vivante</option>
                    <option value="Mort">Décédée</option>
                  </select>
                </div>
                <div>
                  <Label>Occupation</Label>
                  <Input {...register('occupationMere')} placeholder="Profession" />
                </div>
              </div>
            </div>

            {/* Père */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-3 text-gray-700">Père</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Prénom *</Label>
                  <Input {...register('prenomPere', { required: true })} />
                  {errors.prenomPere && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input {...register('nomPere', { required: true })} />
                  {errors.nomPere && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                <div>
                  <Label>Statut *</Label>
                  <select {...register('statutPere', { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Vivant">Vivant</option>
                    <option value="Mort">Décédé</option>
                  </select>
                </div>
                <div>
                  <Label>Occupation</Label>
                  <Input {...register('occupationPere')} placeholder="Profession" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. RESPONSABLE LÉGAL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">4. Responsable Légal</h3>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={responsableMode === 'create'} 
                  onChange={() => setResponsableMode('create')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Créer un nouveau</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={responsableMode === 'select'} 
                  onChange={() => setResponsableMode('select')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Sélectionner existant</span>
              </label>
            </div>

            {responsableMode === 'select' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                <Label className="mb-2 block">Rechercher un responsable</Label>
                <Input 
                  placeholder="Rechercher par nom, prénom ou téléphone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-3"
                />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedResponsableId}
                  onChange={(e) => handleResponsableSelect(e.target.value)}
                >
                  <option value="">-- Choisir un responsable --</option>
                  {filteredResponsables.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.user.firstName} {r.user.lastName} ({r.lienParente})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Prénom</Label>
                <Input {...register('responsableFirstName')} disabled={responsableMode === 'select'} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input {...register('responsableLastName')} disabled={responsableMode === 'select'} />
              </div>
              <div>
                <Label>Lien de parenté</Label>
                <select {...register('lienParente')} disabled={responsableMode === 'select'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Sélectionner</option>
                  <option value="Mère">Mère</option>
                  <option value="Père">Père</option>
                  <option value="Tante">Tante</option>
                  <option value="Oncle">Oncle</option>
                  <option value="Grand-parent">Grand-parent</option>
                  <option value="Tuteur">Tuteur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  {...register('responsableEmail', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email invalide'
                    }
                  })} 
                  disabled={responsableMode === 'select'} 
                />
                {errors.responsableEmail && <span className="text-red-500 text-xs">{errors.responsableEmail.message}</span>}
              </div>
              <div>
                <Label>Téléphone</Label>
                <Controller
                  name="responsablePhone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      defaultCountry="HT"
                      placeholder="Entrez le numéro..."
                      disabled={responsableMode === 'select'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </div>
              <div>
                <Label>NIF</Label>
                <Controller
                  name="responsableNif"
                  control={control}
                  rules={{
                    pattern: responsableMode === 'create' ? {
                      value: /^\d{3}-\d{3}-\d{3}-\d{1}$/,
                      message: 'Format invalide (000-000-000-0)'
                    } : undefined
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      {...field}
                      value={value || ''}
                      onChange={(e) => {
                        const formatted = formatNif(e.target.value);
                        onChange(formatted);
                      }}
                      placeholder="000-000-000-0"
                      maxLength={13}
                      disabled={responsableMode === 'select'}
                    />
                  )}
                />
                {errors.responsableNif && <span className="text-red-500 text-xs">{errors.responsableNif.message}</span>}
              </div>
              <div>
                <Label>NINU</Label>
                <Input 
                  {...register('responsableNinu', {
                    pattern: responsableMode === 'create' ? {
                      value: /^\d{10}$/,
                      message: 'Le NINU doit contenir exactement 10 chiffres'
                    } : undefined
                  })} 
                  placeholder="Carte d'identité (10 chiffres)" 
                  maxLength={10}
                  disabled={responsableMode === 'select'} 
                />
                {errors.responsableNinu && <span className="text-red-500 text-xs">{errors.responsableNinu.message}</span>}
              </div>
            </div>
          </div>

          {/* 5. DOCUMENTS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">5. Documents & Pièces Jointes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Photo d'identité</Label>
                <Input type="file" accept="image/*" {...register('photoInscription')} className="cursor-pointer" />
                <p className="text-xs text-gray-500 mt-1">Format image requis</p>
              </div>
              
              <div>
                <Label>Acte de naissance</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('acteNaissance')} className="cursor-pointer" />
              </div>

              <div>
                <Label>Bulletin de l'année précédente</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('bulletinPrecedent')} className="cursor-pointer" />
              </div>

              <div>
                <Label>Certificat médical</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('certificatMedical')} className="cursor-pointer" />
              </div>

              <div>
                <Label>Justificatif de domicile</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('justificatifDomicile')} className="cursor-pointer" />
              </div>

              <div>
                <Label>Carte d'identité parent/responsable</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('carteIdentiteParent')} className="cursor-pointer" />
              </div>
            </div>
          </div>

          {/* 6. AUTRES */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 text-blue-600">6. Commentaires</h3>
            <div>
              <Label>Notes ou observations</Label>
              <textarea 
                {...register('commentaires')} 
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                placeholder="Commentaires éventuels sur l'admission..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-8 sticky bottom-0 bg-white py-4 z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loadingAction === 'create'}>
              {loadingAction === 'create' ? 'Création en cours...' : 'Enregistrer l\'admission'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
