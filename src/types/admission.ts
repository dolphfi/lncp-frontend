export enum AdmissionType {
  ON_SITE = 'ON_SITE',
  ONLINE = 'ONLINE'
}

export enum AdmissionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WAITING_LIST = 'WAITING_LIST',
  DRAFT = 'DRAFT',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export interface AdmissionDocument {
  type: string;
  path: string;
  uploadedAt: string;
}

export interface Admission {
  id: string;
  numeroDossier?: string;
  type: AdmissionType;
  status: AdmissionStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sexe?: string;
  dateOfBirth?: string;
  lieuDeNaissance?: string;
  communeDeNaissance?: string;
  handicap?: string;
  handicapDetails?: string;
  adresseLigne1?: string;
  departement?: string;
  commune?: string;
  sectionCommunale?: string;
  vacation?: string;
  classe?: string;
  nomMere?: string;
  prenomMere?: string;
  statutMere?: string;
  occupationMere?: string;
  nomPere?: string;
  prenomPere?: string;
  statutPere?: string;
  occupationPere?: string;
  responsableFirstName?: string;
  responsableLastName?: string;
  responsableEmail?: string;
  responsablePhone?: string;
  lienParente?: string;
  responsableNif?: string;
  responsableNinu?: string;
  photoInscriptionUrl?: string;
  documentsFournis?: AdmissionDocument[];
  commentaires?: string;
  createdAt: string;
  updatedAt?: string;
  evaluatedAt?: string;
  evaluatorId?: string;
}

export interface AdmissionDraft {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  sexe?: string;
  dateOfBirth?: string;
  lieuDeNaissance?: string;
  communeDeNaissance?: string;
  formData?: any;
  uploadedFiles?: string[];
  status: string;
  completionPercentage: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateOnSiteAdmissionDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sexe: string;
  dateOfBirth: string;
  lieuDeNaissance: string;
  communeDeNaissance: string;
  handicap?: string;
  handicapDetails?: string;
  adresseLigne1: string;
  departement: string;
  commune: string;
  sectionCommunale?: string;
  dernierEtablissementFrequente: string;
  numeroOrdre9emeAF: string;
  vacation: string;
  classe?: string;
  nomMere: string;
  prenomMere: string;
  statutMere: string;
  occupationMere?: string;
  nomPere: string;
  prenomPere: string;
  statutPere: string;
  occupationPere?: string;
  responsableFirstName?: string;
  responsableLastName?: string;
  responsableEmail?: string;
  responsablePhone?: string;
  lienParente?: string;
  responsableNif?: string;
  responsableNinu?: string;
  commentaires?: string;
  photoInscription?: File;
  acteNaissance?: File;
  bulletinPrecedent?: File;
  certificatMedical?: File;
  justificatifDomicile?: File;
  carteIdentiteParent?: File;
}

export interface CreateDraftDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  notes?: string;
}

export interface UpdateDraftDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  lieuDeNaissance?: string;
  communeDeNaissance?: string;
  sexe?: string;
  formData?: any;
  notes?: string;
  status?: string;
  files?: any[]; // Array<object> as per spec
  completionPercentage?: number;
}
