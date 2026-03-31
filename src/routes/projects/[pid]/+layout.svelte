<script lang="ts">
  import { page } from '$app/stores';
  import { getProject } from '$lib/api/projects';
  import type { Project } from '$lib/types/project';
  import { setContext } from 'svelte';
  import { FlaskConical, Code2, TrendingUp, ArrowLeft } from 'lucide-svelte';
  
  const { children } = $props();
  
  let project = $state<Project | null>(null);
  let errorMsg = $state('');
  
  setContext('projectContext', {
    get current() { return project; }
  });

  $effect(() => {
    const pid = $page.params.pid;
    if (pid) {
      getProject(pid)
        .then(p => project = p)
        .catch(e => errorMsg = e.message);
    }
  });

  const tabs = [
    { path: '', label: 'Overview', icon: null },
    { path: '/research', label: 'Research', icon: FlaskConical },
    { path: '/development', label: 'Development', icon: Code2 },
    { path: '/market', label: 'Market', icon: TrendingUp },
  ];
</script>

{#if errorMsg}
  <div class="p-10">
    <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{errorMsg}</div>
  </div>
{:else if !project}
  <div class="flex items-center justify-center p-20">
    <div class="flex flex-col items-center gap-3">
      <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-duck-egg-light border-t-duck-egg"></div>
      <p class="text-sm font-medium text-reg-muted">Loading project…</p>
    </div>
  </div>
{:else}
  <div class="p-6 sm:p-10">
    <!-- Back nav -->
    <a href="/projects" class="animate-in mb-5 inline-flex items-center gap-2 text-xs font-semibold text-reg-muted transition-colors hover:text-reg-dark">
      <ArrowLeft size={14} /> All Projects
    </a>

    <!-- Project header -->
    <div class="animate-in mb-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-reg-dark sm:text-4xl">{project.name}</h1>
      <p class="mt-1.5 max-w-2xl text-sm leading-relaxed text-reg-muted">{project.description}</p>
    </div>

    <!-- Tab navigation -->
    <nav class="animate-in-delayed -mx-1 mb-8 mt-6 flex gap-1 border-b border-duck-egg/12 pb-px">
      {#each tabs as tab}
        {@const fullPath = `/projects/${$page.params.pid}${tab.path}`}
        {@const isActive = tab.path === ''
          ? $page.url.pathname === `/projects/${$page.params.pid}`
          : $page.url.pathname.includes(tab.path)}
        <a
          href={fullPath}
          class="relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition-colors
            {isActive
              ? 'text-duck-egg-dark'
              : 'text-reg-muted hover:text-reg-dark hover:bg-duck-egg/5'}"
        >
          {#if tab.icon}
            <tab.icon size={14} strokeWidth={2.2} />
          {/if}
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
{/if}
