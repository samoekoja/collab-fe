<script lang="ts">
  import { activateAccount } from '$lib/api/auth';
  import { useAuth } from '$lib/stores/auth.svelte';
  import { goto } from '$app/navigation';
  import { Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-svelte';

  const auth = useAuth();
  let newPassword = $state('');
  let confirmPassword = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleActivate(e: Event) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      errorMsg = 'Passwords do not match';
      return;
    }
    errorMsg = '';
    loading = true;
    try {
      const res = await activateAccount({ new_password: newPassword });
      auth.setToken(res.token);
      goto('/dashboard');
    } catch (err: any) {
      errorMsg = err.message || 'Activation failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-6">
  <div class="w-full max-w-md animate-in">
    <!-- Brand mark -->
    <div class="mb-10 flex flex-col items-center text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-elevated transition-transform hover:scale-105">
        <Sparkles size={32} class="text-white" strokeWidth={2.5} />
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-reg-dark">Activate Account</h1>
      <p class="mt-2 text-sm font-medium text-reg-muted">Please set a new password to activate your account.</p>
    </div>

    <div class="glass overflow-hidden rounded-3xl border border-white/40 shadow-elevated">
      <div class="px-8 py-10 sm:px-10">
        {#if errorMsg}
          <div class="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
            {errorMsg}
          </div>
        {/if}

        <form onsubmit={handleActivate} class="space-y-5">
          <div>
            <label for="new-password" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">New Password</label>
            <div class="relative">
              <Lock size={18} class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-reg-muted/40" />
              <input
                id="new-password"
                type="password"
                bind:value={newPassword}
                required
                placeholder="••••••••"
                class="w-full rounded-2xl border border-duck-egg/25 bg-white/50 py-3.5 pl-11 pr-4 text-sm font-medium text-reg-dark shadow-inner transition-all placeholder:text-reg-muted/30 focus:border-duck-egg focus:bg-white focus:ring-4 focus:ring-duck-egg/10 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Confirm Password</label>
            <div class="relative">
              <ShieldCheck size={18} class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-reg-muted/40" />
              <input
                id="confirm-password"
                type="password"
                bind:value={confirmPassword}
                required
                placeholder="••••••••"
                class="w-full rounded-2xl border border-duck-egg/25 bg-white/50 py-3.5 pl-11 pr-4 text-sm font-medium text-reg-dark shadow-inner transition-all placeholder:text-reg-muted/30 focus:border-duck-egg focus:bg-white focus:ring-4 focus:ring-duck-egg/10 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-reg-dark py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {#if loading}
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              Setting Password...
            {:else}
              Activate Now
              <ArrowRight size={18} class="transition-transform group-hover:translate-x-1" />
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
