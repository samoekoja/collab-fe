<script lang="ts">
  import { register } from '$lib/api/auth';
  import { useAuth } from '$lib/stores/auth.svelte';
  import { Mail, Lock, ArrowRight, Sparkles, User, Building2 } from 'lucide-svelte';
  
  const auth = useAuth();
  
  let name = $state('');
  let email = $state('');
  let organizationName = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (password !== confirmPassword) {
      errorMsg = "Passwords do not match";
      return;
    }

    errorMsg = '';
    loading = true;
    try {
      const res = await register({ name, email, password, organization_name: organizationName });
      auth.setToken(res.token);
    } catch (err: any) {
      errorMsg = err.message || 'Registration failed';
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
      <h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Create your workspace</h2>
      <p class="mt-1 text-sm text-reg-muted">Set up your account and organization</p>
    </div>

    {#if errorMsg}
      <div class="animate-in mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="name" class="mb-1.5 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Full Name</label>
          <div class="relative">
            <User size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-reg-muted/50" />
            <input id="name" type="text" bind:value={name} required placeholder="Jane Doe"
              class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-9 pr-3 py-2.5 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label for="org" class="mb-1.5 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Organization</label>
          <div class="relative">
            <Building2 size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-reg-muted/50" />
            <input id="org" type="text" bind:value={organizationName} required placeholder="Acme Inc."
              class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-9 pr-3 py-2.5 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label for="email" class="mb-1.5 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Email</label>
        <div class="relative">
          <Mail size={15} class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-reg-muted/50" />
          <input id="email" type="email" bind:value={email} required placeholder="you@company.com"
            class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-10 pr-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="password" class="mb-1.5 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Password</label>
          <div class="relative">
            <Lock size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-reg-muted/50" />
            <input id="password" type="password" bind:value={password} required minlength="6" placeholder="••••••••"
              class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-9 pr-3 py-2.5 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label for="confirm" class="mb-1.5 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Confirm</label>
          <div class="relative">
            <Lock size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-reg-muted/50" />
            <input id="confirm" type="password" bind:value={confirmPassword} required placeholder="••••••••"
              class="w-full rounded-xl border border-duck-egg/30 bg-surface-raised pl-9 pr-3 py-2.5 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-reg-dark px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
      >
        {#if loading}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
          Creating workspace…
        {:else}
          Get Started <ArrowRight size={15} class="transition-transform group-hover:translate-x-0.5" />
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-reg-muted">
      Already have an account?
      <a href="/login" class="font-bold text-duck-egg-dark transition-colors hover:text-duck-egg">Sign in</a>
    </p>
  </div>
</div>
