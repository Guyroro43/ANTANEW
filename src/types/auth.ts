import type { EnglishLevel } from '@/types/user';

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  englishLevel?: EnglishLevel;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthFormState {
  error: string | null;
  isLoading: boolean;
}
