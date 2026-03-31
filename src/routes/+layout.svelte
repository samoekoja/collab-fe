<script lang="ts">
  import './layout.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { useAuth } from '$lib/stores/auth.svelte';
  import { LayoutDashboard, FolderKanban, Settings, Users, LogOut, ChevronRight, Sparkles } from 'lucide-svelte';

  const { children } = $props();
  const auth = useAuth();
  
  let initialized = $state(false);

  let isPublicRoute = $derived(['/', '/login', '/signup', '/activate'].includes($page.url.pathname));

  onMount(() => {
    auth.initState();
    initialized = true;
  });

  $effect(() => {
    if (initialized) {
      if (!auth.isAuthenticated && !isPublicRoute) {
        goto('/login');
      } else if (auth.isAuthenticated && isPublicRoute) {
        goto('/dashboard');
      }
    }
  });

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
  ];

  const manageItems = [
    { href: '/settings/team', label: 'Team', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
</script>

{#if !initialized}
  <div class="flex h-screen w-full items-center justify-center bg-sand">
    <div class="flex flex-col items-center gap-4">
      <div class="h-10 w-10 animate-spin rounded-full border-[3px] border-duck-egg-light border-t-duck-egg"></div>
      <p class="text-sm font-medium text-reg-muted">Loading RegCollab…</p>
    </div>
  </div>
{:else if isPublicRoute}
  <!-- Public layout — centered with ambient background -->
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <!-- Ambient gradient blobs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-duck-egg/10 blur-[120px]"></div>
      <div class="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-lavender/10 blur-[100px]"></div>
      <div class="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-duck-egg/5 blur-[80px]"></div>
    </div>
    <div class="relative z-10 animate-in">
      {@render children()}
    </div>
  </main>
{:else}
  <!-- Protected layout -->
  <div class="flex h-screen w-full overflow-hidden bg-sand">
    <!-- Sidebar -->
    <aside class="group/sidebar relative flex w-[260px] flex-col border-r border-duck-egg/15 bg-surface">
      <!-- Sidebar gradient accent line -->
      <div class="absolute left-0 top-0 h-full w-[2px] gradient-accent opacity-40"></div>

      <!-- Brand -->
      <div class="relative flex items-center gap-3 px-6 py-6">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent shadow-sm">
          <Sparkles size={18} class="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 class="text-lg font-extrabold tracking-tight text-reg-dark">RegCollab</h1>
          <p class="text-[11px] font-medium tracking-wide text-reg-muted uppercase">Workspace</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        <p class="mb-2 px-3 text-[10px] font-bold tracking-[0.1em] text-reg-muted/60 uppercase">Navigate</p>
        {#each navItems as item}
          {@const isActive = item.href === '/dashboard'
            ? $page.url.pathname === '/dashboard'
            : $page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200 {isActive
              ? 'bg-duck-egg/12 text-duck-egg-dark shadow-sm ring-1 ring-duck-egg/10'
              : 'text-reg-muted hover:bg-duck-egg/6 hover:text-reg-dark'}"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isActive ? 'bg-duck-egg/20 text-duck-egg-dark' : 'bg-transparent text-reg-muted group-hover:bg-duck-egg/10 group-hover:text-reg-dark'}">
              <item.icon size={17} strokeWidth={2} />
            </div>
            {item.label}
            {#if isActive}
              <ChevronRight size={14} class="ml-auto text-duck-egg/60" />
            {/if}
          </a>
        {/each}

        <p class="mb-2 mt-6 px-3 text-[10px] font-bold tracking-[0.1em] text-reg-muted/60 uppercase">Manage</p>
        {#each manageItems as item}
          {@const isActive = item.href === '/settings'
            ? $page.url.pathname === '/settings'
            : $page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200 {isActive
              ? 'bg-duck-egg/12 text-duck-egg-dark shadow-sm ring-1 ring-duck-egg/10'
              : 'text-reg-muted hover:bg-duck-egg/6 hover:text-reg-dark'}"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {isActive ? 'bg-duck-egg/20 text-duck-egg-dark' : 'bg-transparent text-reg-muted group-hover:bg-duck-egg/10 group-hover:text-reg-dark'}">
              <item.icon size={17} strokeWidth={2} />
            </div>
            {item.label}
            {#if isActive}
              <ChevronRight size={14} class="ml-auto text-duck-egg/60" />
            {/if}
          </a>
        {/each}
      </nav>

      <!-- Footer -->
      <div class="border-t border-duck-egg/10 p-3">
        <button
          onclick={handleLogout}
          class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-reg-muted transition-all hover:bg-red-50 hover:text-red-600"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:bg-red-100">
            <LogOut size={17} strokeWidth={2} />
          </div>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="relative flex-1 overflow-y-auto bg-sand/60">
      <!-- Subtle top gradient -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-duck-egg/[0.03] to-transparent"></div>
      <div class="relative">
        {@render children()}
      </div>
    </main>
  </div>
{/if}
