<script lang="ts">
  import { listProjects } from '$lib/api/projects';
  import { extractId } from '$lib/api/client';
  import { useOrgContext } from '$lib/stores/org.svelte';
  import type { Project } from '$lib/types/project';
  import { Briefcase, FolderPlus, ArrowRight, Calendar } from 'lucide-svelte';

  const org = useOrgContext();
  let canManage = $derived(org.isAdminOrOwner);

  let projects = $state<Project[]>([]);
  let loading = $state(true);
  let errorMsg = $state('');

  $effect(() => {
    loading = true;
    listProjects(true)
      .then(data => projects = data)
      .catch(err => errorMsg = err.message)
      .finally(() => loading = false);
  });
</script>

<div class="p-6 sm:p-10">
  <!-- Header -->
  <div class="animate-in mb-10">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="mb-1 text-xs font-bold tracking-[0.12em] text-duck-egg-dark uppercase">Dashboard</p>
        <h2 class="text-3xl font-extrabold tracking-tight text-reg-dark sm:text-4xl">Your Projects</h2>
        <p class="mt-2 max-w-md text-sm leading-relaxed text-reg-muted">Recent work and active project hubs across your organization.</p>
      </div>
      {#if canManage}
      <a href="/projects/new"
        class="group inline-flex items-center gap-2 rounded-xl bg-reg-dark px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
      >
        <FolderPlus size={16} /> New Project
      </a>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="animate-in-delayed grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each [1,2,3] as _}
        <div class="rounded-2xl border border-duck-egg/15 bg-white p-7">
          <div class="skeleton mb-4 h-5 w-2/3"></div>
          <div class="skeleton mb-2 h-3 w-full"></div>
          <div class="skeleton h-3 w-4/5"></div>
        </div>
      {/each}
    </div>
  {:else if errorMsg}
    <div class="animate-in rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{errorMsg}</div>
  {:else if projects.length === 0}
    <div class="animate-in flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 py-24 text-center">
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-duck-egg/10">
        <Briefcase size={28} class="text-duck-egg" />
      </div>
      <h3 class="text-xl font-bold text-reg-dark">No projects yet</h3>
      <p class="mt-1.5 max-w-sm text-sm text-reg-muted">{canManage ? "Create a project to start organizing your research, development, and client demand." : "No projects have been assigned or configured for your account yet."}</p>
      {#if canManage}
      <a href="/projects/new" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-duck-egg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105">
        <FolderPlus size={15} /> Create First Project
      </a>
      {/if}
    </div>
  {:else}
    <div class="animate-in-delayed grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each projects as project, i}
        <a
          href={`/projects/${extractId(project)}`}
          class="hover-lift group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-duck-egg/15 bg-white p-7 shadow-[var(--shadow-soft)]"
          style="animation-delay: {i * 60}ms"
        >
          <!-- Top accent -->
          <div class="absolute inset-x-0 top-0 h-[3px] gradient-accent opacity-0 transition-opacity group-hover:opacity-100"></div>

          <div>
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-duck-egg/10 text-duck-egg transition-colors group-hover:bg-duck-egg group-hover:text-white">
              <Briefcase size={19} strokeWidth={2} />
            </div>
            <h3 class="mb-2 text-lg font-extrabold text-reg-dark transition-colors group-hover:text-duck-egg-dark">{project.name}</h3>
            <p class="line-clamp-2 text-sm leading-relaxed text-reg-muted">{project.description}</p>
          </div>

          <div class="mt-6 flex items-center justify-between border-t border-duck-egg/8 pt-4">
            {#if project.created_at}
              <span class="flex items-center gap-1.5 text-xs font-medium text-reg-muted/70">
                <Calendar size={12} /> {new Date(project.created_at).toLocaleDateString()}
              </span>
            {:else}
              <span></span>
            {/if}
            <span class="flex items-center gap-1 text-xs font-bold text-duck-egg opacity-0 transition-all group-hover:opacity-100">
              Open <ArrowRight size={13} />
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
