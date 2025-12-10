import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  MapPin, 
  Send,
  FileText,
  Users
} from 'lucide-react';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Separator } from '../../ui/separator';

import { CreateOnSiteAdmissionDTO } from '../../../types/admission';
import { admissionService } from '../../../services/admissions/admissionService';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../../styles/phone-input.css';

const OnlineAdmissionPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<CreateOnSiteAdmissionDTO>();
  
  // Observer pour l'affichage conditionnel
  const handicap = watch('handicap');

  const onSubmit = async (data: CreateOnSiteAdmissionDTO) => {
    setLoading(true);
    try {
      // Transformation des données pour l'API
      // On utilise createDraft + finalize pour simuler une admission complète
      // Ou createOnSiteAdmission si l'API le permettait en public (mais auth requise ?)
      
      // Note: Si l'API requiert une authentification, cette page ne fonctionnera pas pour les visiteurs anonymes.
      // On suppose que l'utilisateur doit être connecté OU que l'API a un endpoint public.
      // Pour l'instant, on utilise la même logique que le modal admin.
      
      const formData: any = { ...data };
      
      // Nettoyage NIF
      if (formData.responsableNif) {
        formData.responsableNif = formData.responsableNif.replace(/-/g, '');
      }

      // Traitement fichiers
      const fileFields = [
        'photoInscription', 'acteNaissance', 'bulletinPrecedent', 
        'certificatMedical', 'justificatifDomicile', 'carteIdentiteParent'
      ];
      fileFields.forEach(field => {
        if (formData[field] && formData[field].length > 0) {
           formData[field] = formData[field][0];
        } else {
           delete formData[field];
        }
      });

      // Appel direct au service d'admission en ligne
      await admissionService.createOnlineAdmission(formData);
      
      setSubmitted(true);
      toast.success("Votre demande d'admission a été soumise avec succès !");
      
    } catch (error: any) {
      console.error("Erreur soumission:", error);
      const msg = error.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(typeof msg === 'string' ? msg : "Erreur lors de la soumission. Veuillez vérifier tous les champs.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto py-20 px-4 text-center max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-10 pb-10">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Demande Reçue !</h2>
            <p className="text-gray-600 mb-8">
              Votre dossier d'admission a été transmis avec succès à l'administration du Lycée National Charlemagne Péralte.
              <br/><br/>
              Vous recevrez prochainement un email de confirmation avec les prochaines étapes.
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dossier d'Admission en Ligne</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Veuillez remplir ce formulaire avec soin. Tous les champs marqués d'un astérisque (*) sont obligatoires.
            Assurez-vous d'avoir les documents numérisés prêts à être téléchargés.
          </p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>Informations du Candidat</CardTitle>
            <CardDescription>Données personnelles de l'élève à inscrire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* 1. INFORMATIONS DE L'ÉLÈVE */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                    <Input id="firstName" {...register('firstName', { required: true })} placeholder="Ex: Jean" />
                    {errors.firstName && <span className="text-xs text-red-500">Ce champ est requis</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                    <Input id="lastName" {...register('lastName', { required: true })} placeholder="Ex: Dupont" />
                    {errors.lastName && <span className="text-xs text-red-500">Ce champ est requis</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sexe <span className="text-red-500">*</span></Label>
                    <Controller
                      name="sexe"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homme">Homme</SelectItem>
                            <SelectItem value="Femme">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.sexe && <span className="text-xs text-red-500">Requis</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance <span className="text-red-500">*</span></Label>
                    <Input id="dateOfBirth" type="date" {...register('dateOfBirth', { required: true })} />
                    {errors.dateOfBirth && <span className="text-xs text-red-500">Requis</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lieuDeNaissance">Lieu de naissance <span className="text-red-500">*</span></Label>
                    <Input id="lieuDeNaissance" {...register('lieuDeNaissance', { required: true })} placeholder="Ex: Port-au-Prince" />
                    {errors.lieuDeNaissance && <span className="text-xs text-red-500">Requis</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communeDeNaissance">Commune de naissance <span className="text-red-500">*</span></Label>
                    <Input id="communeDeNaissance" {...register('communeDeNaissance', { required: true })} />
                    {errors.communeDeNaissance && <span className="text-xs text-red-500">Requis</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="email">Email (Facultatif)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="email" className="pl-9" {...register('email')} placeholder="student@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (Facultatif)</Label>
                    <div className="relative">
                       <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            placeholder="Entrez le numéro de téléphone"
                            value={field.value}
                            onChange={field.onChange}
                            defaultCountry="HT"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Handicap ou besoins particuliers ?</Label>
                  <Controller
                    name="handicap"
                    control={control}
                    defaultValue="Non"
                    render={({ field }) => (
                      <div className="flex gap-4">
                         <div className="flex items-center space-x-2">
                            <Checkbox id="handicap-non" checked={field.value === 'Non'} onCheckedChange={() => field.onChange('Non')} />
                            <label htmlFor="handicap-non" className="text-sm font-medium">Non</label>
                         </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="handicap-oui" checked={field.value === 'Oui'} onCheckedChange={() => field.onChange('Oui')} />
                            <label htmlFor="handicap-oui" className="text-sm font-medium">Oui</label>
                         </div>
                      </div>
                    )}
                  />
                </div>

                {handicap === 'Oui' && (
                  <div className="space-y-2">
                    <Label htmlFor="handicapDetails">Détails du handicap</Label>
                    <Textarea id="handicapDetails" {...register('handicapDetails')} placeholder="Précisez la nature du handicap..." />
                  </div>
                )}
              </div>

              <Separator className="my-8" />

              {/* 2. COORDONNÉES & ADRESSE */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Coordonnées & Adresse
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="adresseLigne1">Adresse (Rue, Numéro) <span className="text-red-500">*</span></Label>
                  <Input id="adresseLigne1" {...register('adresseLigne1', { required: true })} placeholder="Ex: 123 Rue Principale" />
                  {errors.adresseLigne1 && <span className="text-xs text-red-500">Requis</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departement">Département <span className="text-red-500">*</span></Label>
                    <Input id="departement" {...register('departement', { required: true })} />
                    {errors.departement && <span className="text-xs text-red-500">Requis</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commune">Commune <span className="text-red-500">*</span></Label>
                    <Input id="commune" {...register('commune', { required: true })} />
                    {errors.commune && <span className="text-xs text-red-500">Requis</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionCommunale">Section Communale</Label>
                    <Input id="sectionCommunale" {...register('sectionCommunale')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vacation">Vacation souhaitée <span className="text-red-500">*</span></Label>
                    <Controller
                      name="vacation"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une vacation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Matin (AM)">Matin (AM)</SelectItem>
                            <SelectItem value="Après-midi (PM)">Après-midi (PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vacation && <span className="text-xs text-red-500">Requis</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classe">Classe demandée <span className="text-red-500">*</span></Label>
                    <Controller
                      name="classe"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une classe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NS1">NS1 (S3)</SelectItem>
                            <SelectItem value="NS2">NS2 (S4)</SelectItem>
                            <SelectItem value="NS3">NS3 (Philo)</SelectItem>
                            <SelectItem value="NS4">NS4 (Philo)</SelectItem>
                            <SelectItem value="7eme">7ème AF</SelectItem>
                            <SelectItem value="8eme">8ème AF</SelectItem>
                            <SelectItem value="9eme">9ème AF</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.classe && <span className="text-xs text-red-500">Requis</span>}
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* 3. INFO PARENTS */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                   <Users className="w-5 h-5" /> Informations Familiales
                </h3>
                
                {/* Mère */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                   <h4 className="font-medium">Information Mère</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Prénom Mère <span className="text-red-500">*</span></Label><Input {...register('prenomMere', { required: true })} /></div>
                      <div><Label>Nom Mère <span className="text-red-500">*</span></Label><Input {...register('nomMere', { required: true })} /></div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Statut</Label>
                        <Controller name="statutMere" control={control} defaultValue="Vivant" render={({field}) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Vivant">Vivant</SelectItem><SelectItem value="Mort">Décédé</SelectItem></SelectContent></Select>
                        )} />
                      </div>
                      <div><Label>Occupation</Label><Input {...register('occupationMere')} /></div>
                   </div>
                </div>

                {/* Père */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                   <h4 className="font-medium">Information Père</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Prénom Père <span className="text-red-500">*</span></Label><Input {...register('prenomPere', { required: true })} /></div>
                      <div><Label>Nom Père <span className="text-red-500">*</span></Label><Input {...register('nomPere', { required: true })} /></div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Statut</Label>
                        <Controller name="statutPere" control={control} defaultValue="Vivant" render={({field}) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Vivant">Vivant</SelectItem><SelectItem value="Mort">Décédé</SelectItem></SelectContent></Select>
                        )} />
                      </div>
                      <div><Label>Occupation</Label><Input {...register('occupationPere')} /></div>
                   </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* 4. RESPONSABLE LÉGAL */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                   <User className="w-5 h-5" /> Responsable Légal
                </h3>
                <p className="text-sm text-gray-500">Personne à contacter en cas d'urgence et responsable du suivi scolaire.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Prénom Responsable <span className="text-red-500">*</span></Label>
                      <Input {...register('responsableFirstName', { required: true })} />
                      {errors.responsableFirstName && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="space-y-2">
                      <Label>Nom Responsable <span className="text-red-500">*</span></Label>
                      <Input {...register('responsableLastName', { required: true })} />
                      {errors.responsableLastName && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="space-y-2">
                      <Label>Lien de parenté <span className="text-red-500">*</span></Label>
                      <Controller name="lienParente" control={control} rules={{required:true}} render={({field}) => (
                         <Select onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Sélectionner"/></SelectTrigger><SelectContent>
                           <SelectItem value="Mère">Mère</SelectItem><SelectItem value="Père">Père</SelectItem>
                           <SelectItem value="Tante">Tante</SelectItem><SelectItem value="Oncle">Oncle</SelectItem>
                           <SelectItem value="Grand-parent">Grand-parent</SelectItem><SelectItem value="Tuteur">Tuteur</SelectItem>
                           <SelectItem value="Autre">Autre</SelectItem>
                         </SelectContent></Select>
                      )} />
                      {errors.lienParente && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="space-y-2">
                      <Label>Email Responsable <span className="text-red-500">*</span></Label>
                      <Input type="email" {...register('responsableEmail', { required: true })} />
                      {errors.responsableEmail && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="space-y-2">
                      <Label>Téléphone Responsable <span className="text-red-500">*</span></Label>
                      <Controller name="responsablePhone" control={control} rules={{required:true}} render={({ field }) => (
                          <PhoneInput placeholder="Téléphone" value={field.value} onChange={field.onChange} defaultCountry="HT" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/>
                      )} />
                      {errors.responsablePhone && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="space-y-2">
                      <Label>NIF (Optionnel)</Label>
                      <Controller name="responsableNif" control={control} render={({field}) => (
                        <Input {...field} placeholder="000-000-000-0" onChange={(e) => {
                           // Garder seulement les chiffres
                           let v = e.target.value.replace(/\D/g, '');
                           // Limiter à 10 chiffres
                           if (v.length > 10) v = v.slice(0, 10);
                           
                           // Formatage XXX-XXX-XXX-X
                           let formatted = v;
                           if (v.length > 3) formatted = `${v.slice(0, 3)}-${v.slice(3)}`;
                           if (v.length > 6) formatted = `${formatted.slice(0, 7)}-${v.slice(6)}`;
                           if (v.length > 9) formatted = `${formatted.slice(0, 11)}-${v.slice(9)}`;
                           
                           field.onChange(formatted);
                        }} />
                      )} />
                   </div>
                   <div className="space-y-2">
                      <Label>NINU (Optionnel)</Label>
                      <Controller name="responsableNinu" control={control} render={({field}) => (
                        <Input {...field} placeholder="10 chiffres" onChange={(e) => {
                           let v = e.target.value.replace(/\D/g, '');
                           if (v.length > 10) v = v.slice(0, 10);
                           field.onChange(v);
                        }} />
                      )} />
                   </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* 5. DOCUMENTS */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                   <FileText className="w-5 h-5" /> Documents requis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { name: 'photoInscription', label: "Photo d'identité (Récent)" },
                     { name: 'acteNaissance', label: "Acte de Naissance" },
                     { name: 'bulletinPrecedent', label: "Dernier Bulletin Scolaire" },
                     { name: 'certificatMedical', label: "Certificat Médical" },
                     { name: 'justificatifDomicile', label: "Justificatif de Domicile" },
                     { name: 'carteIdentiteParent', label: "Pièce d'identité du Responsable" },
                   ].map((doc) => (
                     <div key={doc.name} className="space-y-2 border p-4 rounded-md bg-gray-50">
                        <Label htmlFor={doc.name} className="font-medium">{doc.label}</Label>
                        <Input id={doc.name} type="file" accept=".pdf,.jpg,.jpeg,.png" {...register(doc.name as any)} className="cursor-pointer" />
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Soumettre le dossier d'admission
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  En soumettant ce formulaire, vous certifiez que toutes les informations fournies sont exactes.
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlineAdmissionPage;
