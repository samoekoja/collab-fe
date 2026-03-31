import { useOrgContext } from './org.svelte';

let token = $state<string | null>(null);

function initState() {
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('rc_token');
    // Also hydrate org context from the stored token
    const org = useOrgContext();
    org.init();
  }
}

function setToken(t: string | null) {
  token = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('rc_token', t);
    else localStorage.removeItem('rc_token');

    // Keep org context in sync
    const org = useOrgContext();
    if (t) org.init();
    else org.clear();
  }
}

export function useAuth() {
  return {
    get token() { return token; },
    get isAuthenticated() { return !!token; },
    initState,
    setToken,
    logout() { setToken(null); }
  };
}
