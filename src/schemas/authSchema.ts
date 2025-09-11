/**
 * =====================================================
 * SCHÉMAS DE VALIDATION POUR L'AUTHENTIFICATION
 * =====================================================
 * Schémas Yup pour la validation des formulaires d'authentification
 */

import * as yup from 'yup';

// Schéma pour la connexion
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  remember_me: yup.boolean().optional(),
});

// Schéma pour l'inscription
export const registerSchema = yup.object({
  first_name: yup
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .required('Le prénom est requis'),
  last_name: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .required('Le nom est requis'),
  email: yup
    .string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  phone: yup
    .string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Format de téléphone invalide')
    .optional(),
  password: yup
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .matches(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial')
    .required('Le mot de passe est requis'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

// Schéma pour le mot de passe oublié
export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
});

// Schéma pour la réinitialisation du mot de passe
export const resetPasswordSchema = yup.object({
  token: yup
    .string()
    .required('Le token de réinitialisation est requis'),
  email: yup
    .string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .matches(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial')
    .required('Le mot de passe est requis'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

// Schéma pour la mise à jour du profil
export const updateProfileSchema = yup.object({
  first_name: yup
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .required('Le prénom est requis'),
  last_name: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .required('Le nom est requis'),
  email: yup
    .string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  phone: yup
    .string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Format de téléphone invalide')
    .optional(),
});

// Types TypeScript dérivés des schémas
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
export type UpdateProfileFormData = yup.InferType<typeof updateProfileSchema>;
