/**
 * Utilitaire pour extraire les messages d'erreur du backend
 */

export interface ErrorDetails {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code: string;
  details: ErrorDetails[];
}

/**
 * Extrait le message d'erreur depuis une erreur Axios
 * Priorité : message backend > message axios > message par défaut
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Une erreur est survenue'): string => {
  // 1. Si l'erreur vient du backend (axios response)
  if (error.response?.data?.message) {
    // Si c'est un tableau de messages (validation errors)
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message.join(', ');
    }
    return error.response.data.message;
  }
  
  // 2. Si c'est une erreur réseau ou autre
  if (error.message) {
    return error.message;
  }
  
  // 3. Message par défaut
  return defaultMessage;
};

/**
 * Extrait les détails d'erreur pour les formulaires
 */
export const getErrorDetails = (error: any, field: string = 'general'): ErrorDetails[] => {
  const message = getErrorMessage(error);
  
  // Si le backend renvoie des détails de validation
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((err: any) => ({
      field: err.field || err.property || field,
      message: err.message || err.constraints?.[Object.keys(err.constraints)[0]] || message
    }));
  }
  
  // Sinon, créer un détail générique
  return [{ field, message }];
};

/**
 * Crée un objet ApiError complet
 */
export const createApiError = (
  error: any,
  defaultMessage: string,
  code: string,
  field: string = 'general'
): ApiError => {
  return {
    message: getErrorMessage(error, defaultMessage),
    code,
    details: getErrorDetails(error, field)
  };
};

/**
 * Crée une nouvelle erreur avec le message extrait du backend
 */
export const createErrorWithMessage = (error: any, defaultMessage?: string): Error => {
  const message = getErrorMessage(error, defaultMessage);
  const newError = new Error(message);
  (newError as any).originalError = error;
  (newError as any).response = error.response;
  return newError;
};
