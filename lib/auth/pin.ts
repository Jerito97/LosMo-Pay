import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPin(pin: string) {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}
