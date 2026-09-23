import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Minimum password policy enforced when an admin sets/resets a password.
 * Kept simple and explainable rather than a fake "strength meter".
 */
export function isPasswordStrongEnough(plain: string): boolean {
  return plain.length >= 8;
}
