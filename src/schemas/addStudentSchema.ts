import { z } from 'zod';

// Schéma spécifique pour le nouveau modal AddStudentModal
// Aligné 1:1 avec les champs de l'endpoint POST /students/add-student
export const addStudentSchema = z.object({
  // Identité
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  gender: z.enum(['male', 'female'], { required_error: "Le sexe est requis" }),
  dateOfBirth: z.string().min(1, "La date de naissance est requise")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      return actualAge >= 5;
    }, "L'étudiant doit avoir au moins 5 ans"),

  // Photo de profil
  avatar: z.instanceof(File).optional(),

  // Naissance
  placeOfBirth: z.string().trim().min(1, "Le lieu de naissance est requis"),
  communeDeNaissance: z.string().trim().min(2, "La commune de naissance est requise (min 2 caractères)"),

  // Administratif
  hasHandicap: z.boolean().default(false),
  handicapDetails: z.string().optional(),
  adresse: z.string().trim().min(1, "L'adresse est requise"),
  vacation: z.enum(['AM', 'PM'], { required_error: "La vacation est requise" }),
  niveauEnseignement: z.enum(['Fondamentale', 'Secondaire'], { required_error: "Le niveau d'enseignement est requis" }),
  grade: z.enum(['NSI', 'NSII', 'NSIII', 'NSIV'], { required_error: "Le niveau d'étude est requis" }),

  // Parents (tous requis)
  nomMere: z.string().trim().min(1, "Le nom de la mère est requis"),
  prenomMere: z.string().trim().min(1, "Le prénom de la mère est requis"),
  statutMere: z.string().trim().min(1, "Le statut de la mère est requis"),
  occupationMere: z.string().optional(),
  nomPere: z.string().trim().min(1, "Le nom du père est requis"),
  prenomPere: z.string().trim().min(1, "Le prénom du père est requis"),
  statutPere: z.string().trim().min(1, "Le statut du père est requis"),
  occupationPere: z.string().optional(),

  // Responsable
  responsableMode: z.enum(['select', 'create'], { required_error: "Le mode responsable est requis" }),
  personneResponsableId: z.string().optional(),
  responsable: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    lienParente: z.string().optional(),
    // Validation simplifiée pour PhoneInput qui renvoie une string (ex: +509...)
    phone: z.string().optional().or(z.literal("")), 
    // NIF format: xxx-xxx-xxx-x (13 caractères)
    nif: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{1}$/, "Le NIF doit respecter le format xxx-xxx-xxx-x").optional().or(z.literal("")),
    // NINU format: 10 chiffres
    ninu: z.string().regex(/^\d{10}$/, "Le NINU doit contenir exactement 10 chiffres").optional().or(z.literal("")),
  }).optional(),

  // Classe et salle
  selectedClassroomId: z.string().min(1, "La classe est requise"),
  roomId: z.string().min(1, "La salle est requise").refine(val => val !== 'none', "Veuillez sélectionner une salle"),
}).refine((data) => {
  // Validation conditionnelle du responsable
  if (data.responsableMode === 'select') {
    return data.personneResponsableId && data.personneResponsableId.length > 0;
  } else if (data.responsableMode === 'create') {
    return data.responsable && 
           data.responsable.firstName && 
           data.responsable.lastName && 
           data.responsable.lienParente;
  }
  return false;
}, {
  message: "Veuillez sélectionner un responsable existant ou créer un nouveau responsable",
  path: ["responsableMode"]
});

export type AddStudentFormData = z.infer<typeof addStudentSchema>;
