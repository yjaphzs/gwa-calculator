const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/claims-too-large': 'The claims payload is too large (max 1000 bytes).',
  'auth/email-already-exists': 'This email address is already in use.',
  'auth/email-already-in-use': 'This email address is already in use.',
  'auth/id-token-expired': 'Your session has expired. Please sign in again.',
  'auth/id-token-revoked': 'Your session has been revoked. Please sign in again.',
  'auth/insufficient-permission': 'You do not have permission to perform this action.',
  'auth/internal-error': 'An unexpected error occurred. Please try again.',
  'auth/invalid-argument': 'An invalid argument was provided.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'The email address is invalid.',
  'auth/invalid-password': 'The password must be at least 6 characters.',
  'auth/invalid-photo-url': 'The photo URL is invalid.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  'auth/too-many-requests': 'Too many requests. Please try again later.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with the provided identifier.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/network-request-failed': 'A network error occurred. Please check your connection.',
  'auth/popup-closed-by-user': 'The sign-in popup was closed before completing.',
  'auth/popup-blocked': 'The sign-in popup was blocked by the browser.',
  'auth/cancelled-popup-request': 'The sign-in popup request was cancelled.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
  'auth/weak-password': 'The password is too weak. Use at least 6 characters.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid or has already been used.',
};

/**
 * Converts a Firebase Auth error (or any unknown error) into a human-readable
 * message suitable for display in the UI.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;
    return AUTH_ERROR_MESSAGES[code] ?? 'An unexpected error occurred. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
