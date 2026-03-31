<script lang="ts">
  import { login } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  import { useAuth } from '$lib/stores/auth.svelte';
  import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-svelte';
  
  const auth = useAuth();
  
  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMsg = '';
    loading = true;
    try {
      const res = await login({ email, password });
      auth.setToken(res.token);
      if (res.must_change_password) {
        goto('/activate');
      }
    } catch (err: any) {
      errorMsg = err.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full max-w-[420px]">
  <div class="glass rounded-2xl border border-white/40 p-8 shadow-[var(--shadow-elevated)] sm:p-10">
    <!-- Header -->
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-md">
        <Sparkles size={22} class="text-white" strokeWidth={2.5} />
      </div>
      <h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Welcome back</h2>
      <p class="mt-1 text-sm text-reg-muted">Sign in to your RegCollab workspace</p>
    </div>

    {#if errorMsg}
      <div class="animate-in mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label for="email" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Email</label>
        <div class="relative">
          <Mail size={16} class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-reg-muted/50" />
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            placeholder="you@company.com"
            class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-10 pr-4 py-3 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label for="password" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Password</label>
        <div class="relative">
          <Lock size={16} class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-reg-muted/50" />
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            placeholder="••••••••"
            class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-10 pr-4 py-3 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="group flex w-full items-center justify-center gap-2 rounded-xl bg-reg-dark px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
      >
        {#if loading}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
          Signing in…
        {:else}
          Sign In <ArrowRight size={15} class="transition-transform group-hover:translate-x-0.5" />
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-reg-muted">
      Don't have an account?
      <a href="/signup" class="font-bold text-duck-egg-dark transition-colors hover:text-duck-egg">Create one</a>
    </p>
  </div>
</div>
