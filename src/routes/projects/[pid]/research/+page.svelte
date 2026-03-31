<script lang="ts">
  import { page } from '$app/stores';
  import { listGroups, createGroup } from '$lib/api/research';
  import { extractId } from '$lib/api/client';
  import { useOrgContext } from '$lib/stores/org.svelte';
  import type { ResearchGroup } from '$lib/types/research';
  import { Plus, FolderSymlink, ArrowRight, X } from 'lucide-svelte';

  const org = useOrgContext();
  let canManage = $derived(org.isAdminOrOwner);
  
  let groups = $state<ResearchGroup[]>([]);
  let loading = $state(true);
  let errorMsg = $state('');

  let showForm = $state(false);
  let newName = $state('');
  let newDesc = $state('');
  let submitting = $state(false);

  $effect(() => {
    const pid = $page.params.pid;
    if (pid) loadGroups(pid);
  });

  async function loadGroups(pid: string) {
    loading = true;
    try { groups = await listGroups(pid); }
    catch (e: any) { errorMsg = e.message; }
    finally { loading = false; }
  }

  async function handleCreate(e: Event) {
    e.preventDefault();
    submitting = true;
    try {
      const g = await createGroup($page.params.pid!, { name: newName, description: newDesc });
      groups = [...groups, g];
      showForm = false;
      newName = ''; newDesc = '';
    } catch(e: any) { alert("Error: " + e.message); }
    finally { submitting = false; }
  }
</script>

<!-- Header -->
<div class="mb-8 flex items-center justify-between">
  <div>
    <h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Research Groups</h2>
    <p class="mt-1 text-sm text-reg-muted">Organize topics and architectural deep-dives</p>
  </div>
  {#if canManage}
  <button onclick={() => showForm = !showForm}
    class="inline-flex items-center gap-2 rounded-xl {showForm ? 'bg-reg-muted/10 text-reg-muted' : 'bg-reg-dark text-white shadow-lg hover:shadow-xl hover:brightness-110'} px-5 py-2.5 text-sm font-bold transition-all"
  >
    {#if showForm}<X size={15} /> Cancel{:else}<Plus size={15} /> New Group{/if}
  </button>
  {/if}
</div>

<!-- Create Form -->
{#if showForm && canManage}
  <form onsubmit={handleCreate} class="animate-in mb-10 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
    <div class="border-b border-duck-egg/10 bg-surface-raised px-7 py-5">
      <h3 class="text-lg font-extrabold text-reg-dark">Create Research Group</h3>
    </div>
    <div class="space-y-5 p-7">
      <div>
        <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Group Name</label>
        <input type="text" bind:value={newName} required placeholder="e.g. API Architecture"
          class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Description</label>
        <textarea bind:value={newDesc} required rows="3" placeholder="What will this group explore?"
          class="w-full resize-none rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium leading-relaxed text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"></textarea>
      </div>
      <div class="flex gap-3">
        <button type="submit" disabled={submitting}
          class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50">
          {#if submitting}<div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>{/if}
          {submitting ? 'Saving…' : 'Save Group'}
        </button>
        <button type="button" onclick={() => showForm = false}
          class="rounded-xl px-5 py-3 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 hover:text-reg-dark transition-colors">Cancel</button>
      </div>
    </div>
  </form>
{/if}

<!-- Content -->
{#if loading}
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each [1,2,3] as _}
      <div class="rounded-2xl border border-duck-egg/15 bg-white p-7">
        <div class="skeleton mb-4 h-5 w-3/4"></div>
        <div class="skeleton mb-2 h-3 w-full"></div>
        <div class="skeleton h-3 w-2/3"></div>
      </div>
    {/each}
  </div>
{:else if errorMsg}
  <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{errorMsg}</div>
{:else if groups.length === 0}
  <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 py-20 text-center">
    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-duck-egg/10">
      <FolderSymlink size={24} class="text-duck-egg" />
    </div>
    <h3 class="text-lg font-bold text-reg-dark">No research groups yet</h3>
    <p class="mt-1.5 max-w-sm text-sm text-reg-muted">Create a group to organize your architectural deep-dives</p>
    {#if canManage}
    <button onclick={() => showForm = true}
      class="mt-5 inline-flex items-center gap-2 rounded-xl bg-duck-egg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105">
      <Plus size={15} /> Create First Group
    </button>
    {/if}
  </div>
{:else}
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each groups as group}
      <a href={`/projects/${$page.params.pid}/research/${extractId(group)}`}
        class="hover-lift group relative flex flex-col overflow-hidden rounded-2xl border border-duck-egg/15 bg-white p-7 shadow-[var(--shadow-soft)]"
      >
        <div class="absolute inset-x-0 top-0 h-[3px] gradient-accent opacity-0 transition-opacity group-hover:opacity-100"></div>
        <div class="mb-4 flex items-start justify-between">
          <h3 class="text-lg font-extrabold text-reg-dark transition-colors group-hover:text-duck-egg-dark">{group.name}</h3>
          <span class="shrink-0 rounded-full bg-duck-egg/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-duck-egg-dark uppercase">{group.status}</span>
        </div>
        <p class="flex-1 line-clamp-3 text-sm leading-relaxed text-reg-muted">{group.description}</p>
        <div class="mt-5 flex items-center gap-1 text-xs font-bold text-duck-egg opacity-0 transition-all group-hover:opacity-100">
          Explore Topics <ArrowRight size={13} />
        </div>
      </a>
    {/each}
  </div>
{/if}
