import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  MapPin,
  Send,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar,
  Home,
  Phone,
  Loader2,
} from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

import { CreateOnSiteAdmissionDTO } from "../../types/admission";
import { admissionService } from "../../services/admissions/admissionService";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../../styles/phone-input.css";

interface StepByStepAdmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom Input Component with Login Page Style
const StyledInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    hasError?: boolean;
  }
>(({ icon, hasError, className = "", ...props }, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 bg-white/50 ${hasError ? "border-red-500 border-2" : "border border-gray-100"
          } rounded-full focus:outline-none focus:ring-1 ${hasError ? "focus:ring-red-400" : "focus:ring-blue-400"
          } focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50 ${className}`}
        {...props}
      />
    </div>
  );
});

StyledInput.displayName = "StyledInput";

const StepByStepAdmissionModal: React.FC<StepByStepAdmissionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [backendError, setBackendError] = useState<string[] | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm<CreateOnSiteAdmissionDTO>();

  const totalSteps = 3;

  // Observer pour l'affichage conditionnel
  const handicap = watch("handicap");

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof CreateOnSiteAdmissionDTO)[] = [];

    switch (currentStep) {
      case 1: // Informations Personnelles
        fieldsToValidate = [
          "dateOfBirth",
          "email",
          "phone",
          "sexe",
          "lieuDeNaissance",
          "communeDeNaissance",
          "adresseLigne1",
          "departement",
          "commune",
          "sectionCommunale",
          "dernierEtablissementFrequente",
          "numeroOrdre9emeAF",
        ];
        break;
      case 2: // Informations Familiales
        fieldsToValidate = [
          "prenomMere",
          "nomMere",
          "statutMere",
          "occupationMere",
          "prenomPere",
          "nomPere",
          "statutPere",
          "occupationPere",
        ];
        break;
      case 3: // Responsable Légal
        fieldsToValidate = [
          "responsableFirstName",
          "responsableLastName",
          "lienParente",
        ];
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateOnSiteAdmissionDTO) => {
    setLoading(true);
    try {
      const formData: any = { ...data };

      // Nettoyage NIF si présent
      if (formData.responsableNif) {
        formData.responsableNif = formData.responsableNif.replace(/-/g, "");
      }

      // Appel direct au service d'admission en ligne
      await admissionService.createOnlineAdmission(formData);

      setSubmitted(true);
      toast.success("Votre demande d'admission a été soumise avec succès !");
    } catch (error: any) {
      console.error("Erreur soumission:", error);
      const backendMessage = error.response?.data?.message;

      let errorMessages: string[] = [];
      if (Array.isArray(backendMessage)) {
        errorMessages = backendMessage;
      } else if (typeof backendMessage === 'string') {
        errorMessages = [backendMessage];
      } else {
        errorMessages = [error.message || "Une erreur est survenue lors de la soumission."];
      }

      // Set error state to display in UI
      setBackendError(errorMessages);

      // Also show as toast for visibility
      toast.error(errorMessages.join('\n'), {
        autoClose: 8000,
        style: { whiteSpace: 'pre-line' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentStep(1);
      setSubmitted(false);
      onOpenChange(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${step === currentStep
              ? "bg-blue-600 text-white scale-110"
              : step < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
              }`}
          >
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`h-1 w-12 md:w-20 mx-2 transition-all ${step < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = [
      "Informations Personnelles",
      "Informations Familiales",
      "Responsable Légal",
    ];
    return (
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          {titles[currentStep - 1]}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Étape {currentStep} sur {totalSteps}
        </p>
      </div>
    );
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Demande Reçue !
            </h2>
            <p className="text-gray-600 mb-8">
              Votre dossier d'admission a été transmis avec succès à
              l'administration du Lycée National Charlemagne Péralte.
              <br />
              <br />
              Vous recevrez prochainement un email de confirmation avec les
              prochaines étapes.
              <br />
              <br />
              <span className="text-sm text-blue-700 font-medium">
                N'oubliez pas d'apporter les documents requis lors de votre
                validation dans l'établissement.
              </span>
            </p>
            <Button onClick={handleClose} variant="outline">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/90">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-blue-900">
            Dossier d'Admission en Ligne
          </DialogTitle>
          <DialogDescription className="text-center text-blue-700/70">
            Veuillez remplir ce formulaire avec soin. Tous les champs marqués
            d'un astérisque (<span className="text-red-500">*</span>) sont
            obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Backend Error Display */}
          {backendError && backendError.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Erreur de soumission</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    {backendError.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setBackendError(null)}
                    className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {renderStepIndicator()}
          {renderStepTitle()}

          {/* STEP 1: Informations Personnelles */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="firstName"
                    icon={<User className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.firstName}
                    {...register("firstName", { required: "Le prénom est requis" })}
                    placeholder="Ex: Jean"
                  />
                  {errors.firstName && (
                    <span className="text-xs text-red-500">{errors.firstName.message || "Le prénom est requis"}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="lastName"
                    icon={<User className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.lastName}
                    {...register("lastName", { required: "Le nom est requis" })}
                    placeholder="Ex: Dupont"
                  />
                  {errors.lastName && (
                    <span className="text-xs text-red-500">{errors.lastName.message || "Le nom est requis"}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="email"
                    type="email"
                    icon={<Mail className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.email}
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Adresse email invalide"
                      }
                    })}
                    placeholder="jean.dupont@email.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">{errors.email.message || "Email invalide"}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Le téléphone est requis" }}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Phone className="w-4 h-4 text-blue-900/50" />
                        </div>
                        <PhoneInput
                          placeholder="+509 1234 5678"
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="HT"
                          className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900 placeholder-blue-700/50"
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Date de naissance <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="dateOfBirth"
                    type="date"
                    icon={<Calendar className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.dateOfBirth}
                    {...register("dateOfBirth", {
                      required: "La date de naissance est requise",
                      validate: (value) => {
                        if (!value) return "La date de naissance est requise";
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        const actualAge = m < 0 || (m === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
                        return actualAge >= 13 || "L'étudiant doit avoir au moins 13 ans";
                      }
                    })}
                  />
                  {errors.dateOfBirth && (
                    <span className="text-xs text-red-500">{errors.dateOfBirth.message || "Date invalide"}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Sexe <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="sexe"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Homme">Homme</SelectItem>
                          <SelectItem value="Femme">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sexe && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lieuDeNaissance"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Lieu de naissance <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="lieuDeNaissance"
                    icon={<MapPin className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.lieuDeNaissance}
                    {...register("lieuDeNaissance", { required: true })}
                    placeholder="Ex: Port-au-Prince"
                  />
                  {errors.lieuDeNaissance && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="communeDeNaissance"
                    className="text-blue-900 font-medium text-sm"
                  >
                    Commune de naissance <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="communeDeNaissance"
                    icon={<Home className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.communeDeNaissance}
                    {...register("communeDeNaissance", { required: true })}
                    placeholder="Ex: Port-au-Prince"
                  />
                  {errors.communeDeNaissance && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
              </div>

              {/* Adresse */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-4">
                  Adresse
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="adresseLigne1"
                      className="text-blue-900 font-medium text-sm"
                    >
                      Adresse (Rue, Numéro){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      id="adresseLigne1"
                      icon={<Home className="w-4 h-4 text-blue-900/50" />}
                      hasError={!!errors.adresseLigne1}
                      {...register("adresseLigne1", { required: true })}
                      placeholder="Ex: 123 Rue de la Paix"
                    />
                    {errors.adresseLigne1 && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="departement"
                        className="text-blue-900 font-medium text-sm"
                      >
                        Département <span className="text-red-500">*</span>
                      </Label>
                      <StyledInput
                        id="departement"
                        icon={<MapPin className="w-4 h-4 text-blue-900/50" />}
                        hasError={!!errors.departement}
                        {...register("departement", { required: true })}
                        placeholder="Ex: Ouest"
                      />
                      {errors.departement && (
                        <span className="text-xs text-red-500">*</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="commune"
                        className="text-blue-900 font-medium text-sm"
                      >
                        Commune <span className="text-red-500">*</span>
                      </Label>
                      <StyledInput
                        id="commune"
                        icon={<Home className="w-4 h-4 text-blue-900/50" />}
                        hasError={!!errors.commune}
                        {...register("commune", { required: true })}
                        placeholder="Ex: Port-au-Prince"
                      />
                      {errors.commune && (
                        <span className="text-xs text-red-500">*</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="sectionCommunale"
                        className="text-blue-900 font-medium text-sm"
                      >
                        Section Communale <span className="text-red-500">*</span>
                      </Label>
                      <StyledInput
                        id="sectionCommunale"
                        hasError={!!errors.sectionCommunale}
                        {...register("sectionCommunale", { required: "La section communale est requise" })}
                        placeholder="Ex: Turgeau"
                      />
                      {errors.sectionCommunale && (
                        <span className="text-xs text-red-500">*</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations Académiques Précédentes */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-4">
                  Informations Académiques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dernierEtablissementFrequente"
                      className="text-blue-900 font-medium text-sm"
                    >
                      Dernier établissement fréquenté <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      id="dernierEtablissementFrequente"
                      hasError={!!errors.dernierEtablissementFrequente}
                      {...register("dernierEtablissementFrequente", { required: "Ce champ est requis" })}
                      placeholder="Ex: Collège Saint Louis"
                    />
                    {errors.dernierEtablissementFrequente && (
                      <span className="text-xs text-red-500">{errors.dernierEtablissementFrequente.message || "*"}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="numeroOrdre9emeAF"
                      className="text-blue-900 font-medium text-sm"
                    >
                      Numéro d'ordre 9ème AF <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      id="numeroOrdre9emeAF"
                      hasError={!!errors.numeroOrdre9emeAF}
                      {...register("numeroOrdre9emeAF", { required: "Ce champ est requis" })}
                      placeholder="Ex: 9AF-2023-..."
                    />
                    {errors.numeroOrdre9emeAF && (
                      <span className="text-xs text-red-500">{errors.numeroOrdre9emeAF.message || "*"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Classe et Vacation */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-4">
                  Inscription
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Vacation souhaitée <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="vacation"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
                            <SelectValue placeholder="Choisir une vacation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Matin (AM)">
                              Matin (AM)
                            </SelectItem>
                            <SelectItem value="Après-midi (PM)">
                              Après-midi (PM)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vacation && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Classe demandée <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="classe"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
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
                    {errors.classe && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Handicap */}
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Handicap ou besoins particuliers ?{" "}
                  </Label>
                  <Controller
                    name="handicap"
                    control={control}
                    defaultValue="Non"
                    render={({ field }) => (
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="handicap-non"
                            checked={field.value === "Non"}
                            onCheckedChange={() => field.onChange("Non")}
                          />
                          <label
                            htmlFor="handicap-non"
                            className="text-sm font-medium text-blue-900"
                          >
                            Non
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="handicap-oui"
                            checked={field.value === "Oui"}
                            onCheckedChange={() => field.onChange("Oui")}
                          />
                          <label
                            htmlFor="handicap-oui"
                            className="text-sm font-medium text-blue-900"
                          >
                            Oui
                          </label>
                        </div>
                      </div>
                    )}
                  />
                </div>

                {handicap === "Oui" && (
                  <div className="space-y-2 mt-4">
                    <Label
                      htmlFor="handicapDetails"
                      className="text-blue-900 font-medium text-sm"
                    >
                      Détails du handicap
                    </Label>
                    <Textarea
                      id="handicapDetails"
                      {...register("handicapDetails")}
                      placeholder="Précisez la nature du handicap..."
                      className="bg-white/50 border-gray-100 rounded-lg text-xs text-blue-900 placeholder-blue-700/50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Informations Familiales */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-600">
                  Informations Familiales
                </h4>
              </div>

              {/* Mère */}
              <div className="bg-blue-50/50 p-4 rounded-lg space-y-4 border border-blue-100">
                <h4 className="font-medium text-blue-900">Information Mère</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Prénom Mère <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      icon={<User className="w-4 h-4 text-blue-900/50" />}
                      hasError={!!errors.prenomMere}
                      {...register("prenomMere", { required: true })}
                      placeholder="Prénom"
                    />
                    {errors.prenomMere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Nom Mère <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      icon={<User className="w-4 h-4 text-blue-900/50" />}
                      hasError={!!errors.nomMere}
                      {...register("nomMere", { required: true })}
                      placeholder="Nom"
                    />
                    {errors.nomMere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Statut <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="statutMere"
                      control={control}
                      defaultValue="Vivant"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vivant">Vivant</SelectItem>
                            <SelectItem value="Mort">Décédé</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.statutMere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Occupation <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      hasError={!!errors.occupationMere}
                      {...register("occupationMere", { required: "L'occupation de la mère est requise" })}
                      placeholder="Profession"
                    />
                    {errors.occupationMere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Père */}
              <div className="bg-blue-50/50 p-4 rounded-lg space-y-4 border border-blue-100">
                <h4 className="font-medium text-blue-900">Information Père</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Prénom Père <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      icon={<User className="w-4 h-4 text-blue-900/50" />}
                      hasError={!!errors.prenomPere}
                      {...register("prenomPere", { required: true })}
                      placeholder="Prénom"
                    />
                    {errors.prenomPere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Nom Père <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      icon={<User className="w-4 h-4 text-blue-900/50" />}
                      hasError={!!errors.nomPere}
                      {...register("nomPere", { required: true })}
                      placeholder="Nom"
                    />
                    {errors.nomPere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Statut <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="statutPere"
                      control={control}
                      defaultValue="Vivant"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vivant">Vivant</SelectItem>
                            <SelectItem value="Mort">Décédé</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.statutPere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-sm">
                      Occupation <span className="text-red-500">*</span>
                    </Label>
                    <StyledInput
                      hasError={!!errors.occupationPere}
                      {...register("occupationPere", { required: "L'occupation du père est requise" })}
                      placeholder="Profession"
                    />
                    {errors.occupationPere && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Responsable Légal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-600">
                  Responsable Légal
                </h4>
              </div>
              <p className="text-sm text-blue-700/70">
                Personne à contacter en cas d'urgence et responsable du suivi
                scolaire.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Prénom Responsable <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    icon={<User className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.responsableFirstName}
                    {...register("responsableFirstName", { required: true })}
                    placeholder="Prénom"
                  />
                  {errors.responsableFirstName && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Nom Responsable <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    icon={<User className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.responsableLastName}
                    {...register("responsableLastName", { required: true })}
                    placeholder="Nom"
                  />
                  {errors.responsableLastName && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Lien de parenté <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="lienParente"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white/50 border-gray-100 rounded-full text-xs text-blue-900">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mère">Mère</SelectItem>
                          <SelectItem value="Père">Père</SelectItem>
                          <SelectItem value="Tante">Tante</SelectItem>
                          <SelectItem value="Oncle">Oncle</SelectItem>
                          <SelectItem value="Grand-parent">
                            Grand-parent
                          </SelectItem>
                          <SelectItem value="Tuteur">Tuteur</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.lienParente && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Email Responsable
                  </Label>
                  <StyledInput
                    type="email"
                    icon={<Mail className="w-4 h-4 text-blue-900/50" />}
                    hasError={!!errors.responsableEmail}
                    {...register("responsableEmail", {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Adresse email invalide"
                      }
                    })}
                    placeholder="email@example.com (optionnel)"
                  />
                  {errors.responsableEmail && (
                    <span className="text-xs text-red-500">{errors.responsableEmail.message || "Email invalide"}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-900 font-medium text-sm">
                    Téléphone Responsable
                  </Label>
                  <Controller
                    name="responsablePhone"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Phone className="w-4 h-4 text-blue-900/50" />
                        </div>
                        <PhoneInput
                          placeholder="Téléphone (optionnel)"
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="HT"
                          className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-xs text-blue-900"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Soumettre
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-blue-700/70 mt-4">
            En soumettant ce formulaire, vous certifiez que toutes les
            informations fournies sont exactes.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StepByStepAdmissionModal;
