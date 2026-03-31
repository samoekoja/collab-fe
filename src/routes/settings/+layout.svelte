<script lang="ts">
  import { page } from '$app/stores';
  import { Building2, Users, ArrowLeft } from 'lucide-svelte';

  const { children } = $props();

  const tabs = [
    { path: '/settings', label: 'Organization', icon: Building2 },
    { path: '/settings/team', label: 'Team', icon: Users },
  ];
</script>

<div class="mx-auto max-w-4xl p-6 sm:p-10">
  <!-- Back -->
  <a href="/dashboard" class="animate-in mb-5 inline-flex items-center gap-2 text-xs font-semibold text-reg-muted transition-colors hover:text-reg-dark">
    <ArrowLeft size={14} /> Back to Dashboard
  </a>

  <div class="animate-in mb-2">
    <p class="mb-1 text-xs font-bold tracking-[0.12em] text-duck-egg-dark uppercase">Settings</p>
    <h1 class="text-3xl font-extrabold tracking-tight text-reg-dark sm:text-4xl">Organization</h1>
    <p class="mt-1.5 text-sm text-reg-muted">Manage your organization profile and team members</p>
  </div>

  <!-- Tab nav -->
  <nav class="animate-in-delayed -mx-1 mb-8 mt-6 flex gap-1 border-b border-duck-egg/12 pb-px">
    {#each tabs as tab}
      {@const isActive = tab.path === '/settings'
        ? $page.url.pathname === '/settings'
        : $page.url.pathname.startsWith(tab.path)}
      <a
        href={tab.path}
        class="relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition-colors
          {isActive
            ? 'text-duck-egg-dark'
            : 'text-reg-muted hover:text-reg-dark hover:bg-duck-egg/5'}"
      >
        <tab.icon size={14} strokeWidth={2.2} />
        {tab.label}
        {#if isActive}
          <span class="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-duck-egg-dark"></span>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="animate-in-delayed">
    {@render children()}
  </div>
</div>
