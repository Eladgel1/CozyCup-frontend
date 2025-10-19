export function mapHttpErrorToMessage(error) {
  const status = error?.status ?? null;
  const msg = (error?.serverMessage || '').toLowerCase();

  // Auth: invalid credentials
  if (status === 401) {
    return 'Invalid email or password.';
  }

  // Validation issues (server-side 400)
  if (status === 400) {
    if (msg.includes('required')) return 'Email and password are required.';
    if (msg.includes('too short') || msg.includes('min 8')) return 'Password must be at least 8 characters.';
    if (msg.includes('invalid email')) return 'Please enter a valid email address.';
    return 'Some fields are invalid. Please review and try again.';
  }

  // Conflict (e.g., register with existing email)
  if (status === 409) {
    return 'An account with this email already exists.';
  }

  // Fallback
  return 'Something went wrong. Please try again.';
}
