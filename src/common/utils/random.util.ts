import { randomInt } from 'crypto';

export function generateRandomInt(length: number) {
  if (length < 1) throw new Error('Length must be at least 1');

  return randomInt(10 ** (length - 1), 10 ** length);
}
