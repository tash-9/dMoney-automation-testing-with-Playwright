import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Reads an env var, falling back to a default when it is empty/undefined. */
function read(name: string, fallback = ''): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

/** Reads a numeric env var. */
function readNumber(name: string, fallback: number): number {
  const value = Number(read(name, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

export const ENV = {
  baseURL: read('BASE_URL', 'https://dmoneyportal.roadtocareer.net'),

  admin: {
    email: read('ADMIN_EMAIL', 'admin@dmoney.com'),
    password: read('ADMIN_PASSWORD', '1234'),
  },

  system: {
    email: read('SYSTEM_EMAIL', 'system@dmoney.com'),
    password: read('SYSTEM_PASSWORD', '1234'),
  },

  agentPassword: read('AGENT_PASSWORD', '1234'),

  gmail: {
    /** Local-part of the Gmail address used for plus-addressing (before "@"). */
    baseLocal: read('GMAIL_BASE_LOCAL', ''),
    accessToken: read('GMAIL_ACCESS_TOKEN', ''),
  },

  amounts: {
    systemDeposit: readNumber('SYSTEM_DEPOSIT_AMOUNT', 2000),
    customerDeposit: readNumber('CUSTOMER_DEPOSIT_AMOUNT', 500),
  },

  existingCustomerPhone: read('EXISTING_CUSTOMER_PHONE', '01711111111'),
} as const;
