<script lang="ts">
  import { createProject } from '$lib/api/projects';
  import { extractId } from '$lib/api/client';
  import { useOrgContext } from '$lib/stores/org.svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Rocket } from 'lucide-svelte';

  const org = useOrgContext();

  // Redirect non-admin/non-owner users
  $effect(() => {
    if (!org.isAdminOrOwner) {
      goto('/projects');
    }
  });

  let name = $state('');
  let description = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMsg = '';
    loading = true;
    try {
      const p = await createProject({ name, description });
      const id = extractId(p);
      goto(`/projects/${id}`);
    } catch (err: any) {
      errorMsg = err.message || 'Failed to create project';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-2xl p-6 sm:p-10">
  <a href="/projects" class="animate-in mb-6 inline-flex items-center gap-2 text-sm font-semibold text-reg-muted transition-colors hover:text-reg-dark">
    <ArrowLeft size={15} /> Back to Projects
  </a>

  <div class="animate-in-delayed overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
    <!-- Header band -->
    <div class="border-b border-duck-egg/10 bg-surface-raised px-8 py-6">
      <h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Create New Project</h2>
      <p class="mt-1 text-sm text-reg-muted">Set up a new project hub for your team</p>
    </div>

    <div class="p-8">
      {#if errorMsg}
        <div class="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
          {errorMsg}
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="space-y-6">
        <div>
          <label for="name" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Project Name</label>
          <input id="name" type="text" bind:value={name} required placeholder="e.g. MiFID II Compliance Engine"
            class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
          />
        </div>

        <div>
          <label for="description" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Description</label>
          <textarea id="description" bind:value={description} rows="5" required placeholder="What is this project about? What are the high-level goals?"
            class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium leading-relaxed text-reg-dark shadow-inner transition-colors placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none resize-none"
          ></textarea>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            class="group inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
          >
            {#if loading}
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              Creating…
            {:else}
              <Rocket size={15} /> Create Project
            {/if}
          </button>
          <a href="/projects" class="rounded-xl px-5 py-3 text-sm font-semibold text-reg-muted transition-colors hover:text-reg-dark hover:bg-sand-warm/50">Cancel</a>
        </div>
      </form>
    </div>
  </div>
</div>
