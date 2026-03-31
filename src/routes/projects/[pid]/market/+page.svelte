<script lang="ts">
  import { page } from '$app/stores';
  import { listClientRequests, createClientRequest, updateClientRequest, deleteClientRequest } from '$lib/api/market';
  import { listGroups, listTopics } from '$lib/api/research';
  import { listFeatures } from '$lib/api/development';
  import { extractId } from '$lib/api/client';
  import { useOrgContext } from '$lib/stores/org.svelte';
  import type { ClientRequest } from '$lib/types/market';
  import type { ResearchTopic } from '$lib/types/research';
  import type { Feature } from '$lib/types/development';
  import { TrendingUp, AlertTriangle, UserCircle, Link as LinkIcon, Briefcase, FlaskConical, Plus, X, Trash2 } from 'lucide-svelte';

  const org = useOrgContext();
  let canManage = $derived(org.isAdminOrOwner);

  let requests = $state<ClientRequest[]>([]);
  let loading = $state(true);

  let allTopics = $state<ResearchTopic[]>([]);
  let allFeatures = $state<Feature[]>([]);

  let showForm = $state(false);
  let cName = $state('');
  let cTitle = $state('');
  let cDesc = $state('');
  let cLevel = $state('medium');
  let submitting = $state(false);

  let activeLinking = $state<string | null>(null);
  let linkType = $state<'topic'|'feature'>('topic');
  let linkId = $state('');

  let statusFilter = $state('all');

  $effect(() => {
    const pid = $page.params.pid;
    if (pid) {
      listClientRequests(pid).then(res => requests = res).finally(() => loading = false);
      
      listFeatures(pid).then(res => allFeatures = res).catch(() => {});
      
      listGroups(pid).then(groups => {
        Promise.all(groups.map(g => listTopics(pid, extractId(g)!)))
          .then(results => allTopics = results.flat())
          .catch(() => {});
      }).catch(() => {});
    }
  });

  let filteredRequests = $derived(
    statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter)
  );

  async function handleCreate(e: Event) {
    e.preventDefault();
    submitting = true;
    try {
      const cr = await createClientRequest($page.params.pid!, {
        client_name: cName, title: cTitle, description: cDesc, demand_level: cLevel
      });
      requests = [...requests, cr];
      showForm = false; cName=''; cTitle=''; cDesc=''; cLevel='medium';
    } catch(err: any) { alert(err.message); }
    finally { submitting = false; }
  }

  async function handleLink(reqId: string) {
    if(!linkId.trim()) return;
    try {
      const payload = linkType === 'topic' ? { linked_topic_id: linkId } : { linked_feature_id: linkId };
      const cr = await updateClientRequest($page.params.pid!, reqId, payload);
      requests = requests.map(r => (extractId(r) === reqId || r._id === reqId) ? cr : r);
      activeLinking = null;
      linkId = '';
    } catch(err: any) { alert(err.message); }
  }

  async function handleDelete(reqId: string) {
    if (!confirm('Delete this client request?')) return;
    try {
      await deleteClientRequest($page.params.pid!, reqId);
      requests = requests.filter(r => extractId(r) !== reqId && r._id !== reqId);
    } catch(err: any) { alert(err.message); }
  }

  function demandStyle(level: string) {
    if (level === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  function statusStyle(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      researching: 'bg-blue-50 text-blue-700 border-blue-200',
      developing: 'bg-purple-50 text-purple-700 border-purple-200',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return map[status] ?? map.pending;
  }

  const filters = ['all', 'pending', 'researching', 'developing', 'resolved'];
</script>

<!-- Header -->
<div class="mb-6 flex items-center justify-between">
  <div>
    <h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Market & Client Requests</h2>
    <p class="mt-1 text-sm text-reg-muted">Track demand and map into the pipeline</p>
  </div>
  {#if canManage}
  <button onclick={() => showForm = !showForm}
    class="inline-flex items-center gap-2 rounded-xl {showForm ? 'bg-reg-muted/10 text-reg-muted' : 'bg-reg-dark text-white shadow-lg hover:shadow-xl hover:brightness-110'} px-5 py-2.5 text-sm font-bold transition-all">
    {#if showForm}<X size={15} /> Cancel{:else}<Plus size={15} /> Log Demand{/if}
  </button>
  {/if}
</div>

<!-- Create form -->
{#if showForm && canManage}
  <form onsubmit={handleCreate} class="animate-in mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
    <div class="border-b border-duck-egg/10 bg-surface-raised px-7 py-5">
      <h3 class="text-lg font-extrabold text-reg-dark">Record Customer Demand</h3>
    </div>
    <div class="p-7 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Reporter</label>
          <div class="relative">
            <UserCircle size={15} class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-reg-muted/40" />
            <input type="text" bind:value={cName} required placeholder="Client name"
              class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised pl-10 pr-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Demand Level</label>
          <select bind:value={cLevel}
            class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Demand / Blocked</option>
          </select>
        </div>
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Title</label>
        <input type="text" bind:value={cTitle} required placeholder="Feature or issue summary"
          class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
      </div>
      <div>
        <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Description</label>
        <textarea bind:value={cDesc} required rows="3" placeholder="Context and details..."
          class="w-full resize-none rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium leading-relaxed text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"></textarea>
      </div>
      <div class="flex gap-3">
        <button type="submit" disabled={submitting}
          class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:brightness-110 disabled:opacity-50 transition-all">
          {submitting ? 'Logging…' : 'Log Demand'}
        </button>
        <button type="button" onclick={() => showForm = false}
          class="rounded-xl px-5 py-3 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 transition-colors">Cancel</button>
      </div>
    </div>
  </form>
{/if}

<!-- Status filter tabs -->
<div class="mb-6 flex gap-1 rounded-xl bg-white/80 border border-duck-egg/12 p-1 w-fit shadow-sm">
  {#each filters as f}
    <button onclick={() => statusFilter = f}
      class="rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition-all {statusFilter === f ? 'bg-reg-dark text-white shadow-sm' : 'text-reg-muted hover:text-reg-dark hover:bg-duck-egg/8'}">
      {f}
    </button>
  {/each}
</div>

<!-- Request list -->
{#if loading}
  <div class="space-y-4">
    {#each [1,2,3] as _}
      <div class="rounded-2xl border border-duck-egg/12 bg-white p-6">
        <div class="skeleton mb-3 h-4 w-32"></div>
        <div class="skeleton mb-2 h-5 w-2/3"></div>
        <div class="skeleton h-3 w-full"></div>
      </div>
    {/each}
  </div>
{:else}
  <div class="space-y-4">
    {#each filteredRequests as req}
      {@const rid = extractId(req) || req._id || ''}
      <div class="overflow-hidden rounded-2xl border border-duck-egg/12 bg-white shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)]">
        <div class="flex flex-col md:flex-row">
          <!-- Main content -->
          <div class="flex-1 p-6 border-b md:border-b-0 md:border-r border-duck-egg/8">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider {demandStyle(req.demand_level)}">{req.demand_level} demand</span>
              <span class="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider {statusStyle(req.status)}">{req.status}</span>
            </div>
            <h3 class="mb-2 text-lg font-extrabold text-reg-dark">{req.title}</h3>
            <p class="mb-3 text-sm leading-relaxed text-reg-muted">{req.description}</p>
            <div class="flex items-center gap-2 text-xs font-semibold text-reg-muted/70">
              <UserCircle size={14} /> {req.client_name}
            </div>
          </div>

          <!-- Action panel -->
          <div class="md:w-[280px] p-5 bg-surface-raised/50 flex flex-col justify-center gap-3">
            {#if activeLinking === rid}
              <div class="animate-in rounded-xl border border-duck-egg/20 bg-white p-4 shadow-sm">
                <h4 class="mb-3 text-xs font-bold text-reg-dark">Escalate to Pipeline</h4>
                <div class="mb-3 flex gap-1.5">
                  <button onclick={() => linkType='topic'}
                    class="flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-colors {linkType==='topic' ? 'bg-duck-egg/20 text-duck-egg-dark' : 'bg-surface-raised text-reg-muted'}">
                    <FlaskConical size={12} class="inline mr-1" />Research
                  </button>
                  <button onclick={() => linkType='feature'}
                    class="flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-colors {linkType==='feature' ? 'bg-duck-egg/20 text-duck-egg-dark' : 'bg-surface-raised text-reg-muted'}">
                    <Briefcase size={12} class="inline mr-1" />Dev
                  </button>
                </div>
                {#if linkType === 'topic'}
                  <select bind:value={linkId} 
                    class="mb-3 w-full rounded-lg border border-duck-egg/25 bg-surface-raised px-3 py-2 text-xs text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
                    <option value="" disabled selected>Select a Research Topic...</option>
                    {#each allTopics as topic}
                      <option value={extractId(topic)}>{topic.title}</option>
                    {/each}
                  </select>
                {:else}
                  <select bind:value={linkId} 
                    class="mb-3 w-full rounded-lg border border-duck-egg/25 bg-surface-raised px-3 py-2 text-xs text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
                    <option value="" disabled selected>Select a Feature...</option>
                    {#each allFeatures as feature}
                      <option value={extractId(feature)}>{feature.title}</option>
                    {/each}
                  </select>
                {/if}
                <div class="flex gap-2">
                  <button onclick={() => handleLink(rid)}
                    class="flex-1 rounded-lg bg-reg-dark py-2 text-[11px] font-bold text-white transition-all hover:brightness-110">Apply</button>
                  <button onclick={() => activeLinking=null}
                    class="flex-1 rounded-lg bg-surface-raised py-2 text-[11px] font-bold text-reg-muted transition-colors hover:bg-duck-egg/10">Cancel</button>
                </div>
              </div>
            {:else}
              {#if req.linked_topic_id}
                {@const topicIdStr = typeof req.linked_topic_id === 'object' ? (req.linked_topic_id as any).$oid : req.linked_topic_id}
                {@const matchedTopic = allTopics.find(t => extractId(t) === topicIdStr)}
                {#if matchedTopic}
                <a href={`/projects/${$page.params.pid}/research/${matchedTopic.group_id}`}
                  class="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2.5 text-xs font-bold text-blue-700 line-clamp-1 transition-colors hover:bg-blue-100">
                  <FlaskConical size={14} class="shrink-0" /> <span class="truncate">Research: {matchedTopic.title}</span>
                </a>
                {:else}
                <div class="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2.5 text-xs font-bold text-blue-700 line-clamp-1">
                  <FlaskConical size={14} class="shrink-0" /> <span class="truncate">Research: Pipeline</span>
                </div>
                {/if}
              {/if}
              {#if req.linked_feature_id}
                {@const featureIdStr = typeof req.linked_feature_id === 'object' ? (req.linked_feature_id as any).$oid : req.linked_feature_id}
                {@const matchedFeature = allFeatures.find(f => extractId(f) === featureIdStr)}
                {#if matchedFeature}
                <a href={`/projects/${$page.params.pid}/development/${featureIdStr}`}
                  class="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50/50 px-3 py-2.5 text-xs font-bold text-purple-700 line-clamp-1 transition-colors hover:bg-purple-100">
                  <Briefcase size={14} class="shrink-0" /> <span class="truncate">Dev: {matchedFeature.title}</span>
                </a>
                {:else}
                <div class="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50/50 px-3 py-2.5 text-xs font-bold text-purple-700 line-clamp-1">
                  <Briefcase size={14} class="shrink-0" /> <span class="truncate">Dev: Pipeline</span>
                </div>
                {/if}
              {/if}

              {#if req.status === 'pending'}
                <div class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
                  <AlertTriangle size={14} class="shrink-0 mt-0.5" />
                  <span>Awaiting response</span>
                </div>
              {/if}
              
              {#if canManage}
              <div class="flex gap-2">
                <button onclick={() => activeLinking = rid}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-duck-egg/25 bg-white py-2.5 text-xs font-bold text-reg-dark transition-all hover:border-duck-egg hover:bg-duck-egg/5">
                  <LinkIcon size={13} /> Link
                </button>
                <button onclick={() => handleDelete(rid)}
                  class="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              </div>
              {/if}
            {/if}
          </div>
        </div>
      </div>
    {/each}

    {#if filteredRequests.length === 0}
      <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 p-14 text-center">
        <TrendingUp size={36} class="mb-3 text-duck-egg/40" />
        <h4 class="text-lg font-bold text-reg-dark">{statusFilter === 'all' ? 'No demands catalogued' : `No ${statusFilter} requests`}</h4>
        <p class="mt-1 text-sm text-reg-muted">Capture feature requests and client issues to funnel them into the pipeline</p>
      </div>
    {/if}
  </div>
{/if}
