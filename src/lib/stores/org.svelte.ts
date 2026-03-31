/**
 * Decodes JWT payload without verifying signature (client-side only).
 * Returns null if token is invalid or missing.
 */
export function decodeJwtPayload(token: string | null): { sub: string; org_id: string; role: string; exp: number } | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

let currentOrgId = $state<string | null>(null);
let currentUserId = $state<string | null>(null);
let currentRole = $state<string | null>(null);

function initFromToken() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('rc_token');
  const decoded = decodeJwtPayload(token);
  if (decoded) {
    currentOrgId = decoded.org_id;
    currentUserId = decoded.sub;
    currentRole = decoded.role ?? null;
  } else {
    currentOrgId = null;
    currentUserId = null;
    currentRole = null;
  }
}

export function useOrgContext() {
  return {
    get orgId() { return currentOrgId; },
    get userId() { return currentUserId; },
    get role() { return currentRole; },
    get isAdminOrOwner() { return currentRole === 'admin' || currentRole === 'owner'; },
    init: initFromToken,
    clear() { currentOrgId = null; currentUserId = null; currentRole = null; },
  };
}
