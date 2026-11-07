import { AuthSession, UserRole } from '../types';

// SHA-256 Hashes of credentials:
// OLGA:2008 -> 808a125ea27c37db88af8622ba3277a9beb3ef261911d475f329b500799e54c0 (ADMIN)
// CAJA:2026 -> 92d11dcdbb5c77b27d12fca7bf22a5d5e99469e04e7bbad3d73759f0b4eba855 (CASHIER)
const HASH_OLGA_ADMIN = '808a125ea27c37db88af8622ba3277a9beb3ef261911d475f329b500799e54c0';
const HASH_CAJA_CASHIER = '92d11dcdbb5c77b27d12fca7bf22a5d5e99469e04e7bbad3d73759f0b4eba855';

const SESSION_KEY = 'olga_salon_auth_session_v2';

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyLogin(username: string, pin: string): Promise<AuthSession | null> {
  const normUser = username.trim().toUpperCase();
  const normPin = pin.trim();

  const combinedHash = await sha256(`${normUser}:${normPin}`);

  if (combinedHash === HASH_OLGA_ADMIN) {
    const session: AuthSession = { username: 'OLGA', role: 'ADMIN' };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    return session;
  }

  if (combinedHash === HASH_CAJA_CASHIER) {
    const session: AuthSession = { username: 'CAJA', role: 'CASHIER' };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    return session;
  }

  return null;
}

export function getAuthSession(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
