import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme_dev_secret_32chars_min!!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  village?: string;
  language?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

function sanitizeUser(u: { _id: unknown; name: string; phone: string; village: string; language: string }) {
  return { id: String(u._id), name: u.name, phone: u.phone, village: u.village, language: u.language };
}

export async function register(input: RegisterInput) {
  const { name, phone, password, confirmPassword, village = '', language = 'en' } = input;

  // Validation
  if (!/^\d{10}$/.test(phone)) throw { code: 'PHONE_INVALID', message: 'Phone must be exactly 10 digits', status: 400 };
  if (password.length < 8) throw { code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 8 characters', status: 400 };
  if (password !== confirmPassword) throw { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match', status: 400 };

  const exists = await User.findOne({ phone });
  if (exists) throw { code: 'PHONE_DUPLICATE', message: 'An account with this number already exists', status: 409 };

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, phone, password: hashed, village, language });
  const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: sanitizeUser(user) };
}

export async function login(input: LoginInput) {
  const { phone, password } = input;
  if (!phone || !password) throw { code: 'FIELD_REQUIRED', message: 'Phone and password are required', status: 400 };

  const user = await User.findOne({ phone });
  if (!user) throw { code: 'NO_ACCOUNT_FOUND', message: 'No account found with this number', status: 401 };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { code: 'INCORRECT_PASSWORD', message: 'Incorrect password', status: 401 };

  const token = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: sanitizeUser(user) };
}
