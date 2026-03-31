<script lang="ts">
	import { page } from '$app/stores';
	import { getGroup, listTopics, createTopic, updateTopic } from '$lib/api/research';
	import { listOrgMembers } from '$lib/api/organizations';
	import { extractId } from '$lib/api/client';
	import { useOrgContext } from '$lib/stores/org.svelte';
	import type { ResearchGroup, ResearchTopic } from '$lib/types/research';
	import type { EnrichedMember } from '$lib/types/organization';
	import { ArrowLeft, CheckCircle2, Circle, Clock, Plus, X, Hash, Calendar, GitMerge, Users } from 'lucide-svelte';

	const org = useOrgContext();
	let canManage = $derived(org.isAdminOrOwner);

	let group = $state<ResearchGroup | null>(null);
	let topics = $state<ResearchTopic[]>([]);
	let loading = $state(true);

	let newTitle = $state('');
	let newDesc = $state('');
	let newStatus = $state('open');
	let newOriginType = $state('research');
	let newOriginId = $state('');
	let selectedUserIds = $state<string[]>([]);
	let submitting = $state(false);
	let showForm = $state(false);
	let members = $state<EnrichedMember[]>([]);

	$effect(() => {
		const { pid, gid } = $page.params;
		if (pid && gid) {
			Promise.all([
				getGroup(pid, gid).then((g) => (group = g)),
				listTopics(pid, gid).then((t) => (topics = t))
			]).finally(() => (loading = false));
		}
	});

	$effect(() => {
		if (org.orgId) {
			listOrgMembers(org.orgId).then((m) => members = m).catch(() => {});
		}
	});

	async function handleCreate(e: Event) {
		e.preventDefault();
		submitting = true;
		try {
			const assignees = selectedUserIds.map(uid => ({ user_id: uid, assigned_at: new Date().toISOString() }));
			const origin = newOriginType !== 'none' ? { source_type: newOriginType, source_id: newOriginId || 'unknown' } : undefined;
			
			const payload = {
				title: newTitle,
				description: newDesc,
				status: newStatus,
				assignees,
				origin
			};

			const t = await createTopic($page.params.pid!, $page.params.gid!, payload);
			topics = [...topics, t];
			showForm = false;
			newTitle = ''; newDesc = ''; newStatus = 'open'; newOriginType = 'research'; newOriginId = ''; selectedUserIds = [];
		} catch (e: any) { alert('Error: ' + e.message); }
		finally { submitting = false; }
	}

	let editingTopicAssignees = $state<string | null>(null);
	let editTopicUserIds = $state<string[]>([]);

	function startEditTopicAssignees(topic: ResearchTopic) {
		editingTopicAssignees = extractId(topic) || topic._id as any;
		editTopicUserIds = topic.assignees?.map(a => a.user_id) || [];
	}

	async function saveTopicAssignees(topic: ResearchTopic) {
		try {
			const assignees = editTopicUserIds.map(uid => ({ user_id: uid, assigned_at: new Date().toISOString() }));
			const tId = extractId(topic) || topic._id as any;
			await updateTopic($page.params.pid!, $page.params.gid!, tId, { assignees });
			topic.assignees = assignees;
			topics = [...topics];
			editingTopicAssignees = null;
		} catch (err: any) { alert('Failed to reassign: ' + err.message); }
	}

	function statusConfig(status: string) {
		const map: Record<string, { icon: any; color: string; bg: string }> = {
			open: { icon: Circle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
			in_progress: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
			completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
			converted: { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
		};
		return map[status] ?? map.open;
	}
</script>

<!-- Back nav -->
<a href={`/projects/${$page.params.pid}/research`}
	class="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-reg-muted transition-colors hover:text-reg-dark">
	<ArrowLeft size={14} /> Back to Groups
</a>

{#if loading}
	<div class="flex items-center justify-center py-16">
		<div class="h-8 w-8 animate-spin rounded-full border-[3px] border-duck-egg-light border-t-duck-egg"></div>
	</div>
{:else if group}
	<!-- Group header -->
	<div class="mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
		<div class="h-2 gradient-accent"></div>
		<div class="p-7">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-2xl font-extrabold text-reg-dark">{group.name}</h2>
				<span class="rounded-full bg-duck-egg/10 px-3 py-1 text-[10px] font-bold tracking-widest text-duck-egg-dark uppercase">{group.status}</span>
			</div>
			<p class="max-w-2xl text-sm leading-relaxed text-reg-muted">{group.description}</p>
		</div>
	</div>

	<!-- Topics header -->
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-extrabold text-reg-dark">Topics <span class="ml-1 text-sm font-semibold text-reg-muted">({topics.length})</span></h3>
		{#if canManage}
		<button onclick={() => (showForm = !showForm)}
			class="inline-flex items-center gap-2 rounded-xl {showForm ? 'bg-reg-muted/10 text-reg-muted' : 'bg-reg-dark text-white shadow-lg hover:shadow-xl hover:brightness-110'} px-4 py-2 text-sm font-bold transition-all">
			{#if showForm}<X size={14} /> Cancel{:else}<Plus size={14} /> New Topic{/if}
		</button>
		{/if}
	</div>

	<!-- Create form -->
	{#if showForm && canManage}
		<form onsubmit={handleCreate} class="animate-in mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
			<div class="border-b border-duck-egg/10 bg-surface-raised px-6 py-4">
				<h4 class="text-sm font-extrabold text-reg-dark">New Research Topic</h4>
			</div>
			<div class="space-y-4 p-6">
				<div>
					<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Title</label>
					<input type="text" bind:value={newTitle} required placeholder="e.g. Evaluate caching strategies"
						class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
				</div>
				<div>
					<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Description</label>
					<textarea bind:value={newDesc} required rows="3" placeholder="Describe the research scope..."
						class="w-full resize-none rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium leading-relaxed text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"></textarea>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Status</label>
						<select bind:value={newStatus} class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
							<option value="open">Open</option>
							<option value="in_progress">In Progress</option>
							<option value="completed">Completed</option>
							<option value="converted">Converted</option>
						</select>
					</div>
					<div>
						<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Origin Type</label>
						<select bind:value={newOriginType} class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
							<option value="none">None</option>
							<option value="research">Research</option>
							<option value="market">Market Request</option>
							<option value="other">Other</option>
						</select>
					</div>
				</div>
				{#if newOriginType !== 'none'}
				<div>
					<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Origin Identifier (Optional)</label>
					<input type="text" bind:value={newOriginId} placeholder={`e.g. Reference ID for ${newOriginType}`}
						class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
				</div>
				{/if}
				<div>
					<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Assignees</label>
					<select multiple bind:value={selectedUserIds} class="w-full min-h-[100px] rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none">
						{#each members as member}
							<option value={member.user_id}>{member.user_name} ({member.user_email})</option>
						{/each}
					</select>
					<p class="mt-1.5 text-[11px] font-bold text-reg-muted/70">Hold Ctrl/Cmd to select multiple members.</p>
				</div>
				<div class="flex gap-3">
					<button type="submit" disabled={submitting}
						class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:brightness-110 disabled:opacity-50 transition-all">
						{submitting ? 'Saving…' : 'Save Topic'}
					</button>
					<button type="button" onclick={() => (showForm = false)} class="rounded-xl px-4 py-2.5 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 transition-colors">Cancel</button>
				</div>
			</div>
		</form>
	{/if}

	<!-- Topics list -->
	<div class="space-y-3">
		{#each topics.sort((a, b) => b.issue_number - a.issue_number) as topic}
			{@const sc = statusConfig(topic.status)}
			<div class="group flex items-start gap-4 rounded-2xl border border-duck-egg/12 bg-white p-5 shadow-[var(--shadow-soft)] transition-all hover:border-duck-egg/25 hover:shadow-[var(--shadow-card)]">
				<div class="mt-1 {sc.color} transition-colors">
					<sc.icon size={20} strokeWidth={2.2} />
				</div>
				<div class="flex-1 min-w-0">
					<div class="mb-1.5 flex flex-wrap items-center gap-2">
						<h4 class="text-[15px] font-bold text-reg-dark">{topic.title}</h4>
						<span class="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase {sc.bg}">{topic.status.replace('_', ' ')}</span>
					</div>
					<p class="mb-3 text-sm leading-relaxed text-reg-muted line-clamp-2">{topic.description}</p>
					
					{#if topic.origin}
					<div class="mb-3 flex items-center gap-1.5">
						<span class="inline-flex items-center gap-1.5 rounded-full border border-duck-egg/20 bg-duck-egg/5 px-2.5 py-1 text-[10px] font-bold tracking-widest text-duck-egg-dark uppercase shadow-sm">
							<GitMerge size={12} class="opacity-70" /> {topic.origin.source_type} 
							{#if topic.origin.source_id && topic.origin.source_id !== 'unknown'}<span class="text-reg-muted/60 lowercase">({topic.origin.source_id})</span>{/if}
						</span>
					</div>
					{/if}

					{#if editingTopicAssignees === (extractId(topic) || topic._id)}
						<div class="mb-4 flex items-start gap-2">
							<select multiple bind:value={editTopicUserIds} class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-3 py-2 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none min-h-[60px] hide-scrollbar" title="Hold Ctrl/Cmd to select multiple">
								{#each members as member}
									<option value={member.user_id}>{member.user_name}</option>
								{/each}
							</select>
							<div class="flex flex-col gap-1">
								<button onclick={() => saveTopicAssignees(topic)} class="rounded-lg bg-reg-dark px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:brightness-110">Save</button>
								<button onclick={() => editingTopicAssignees = null} class="rounded-lg bg-surface-raised px-3 py-1.5 text-[10px] font-bold text-reg-muted transition-colors hover:bg-duck-egg/10">Cancel</button>
							</div>
						</div>
					{:else}
						<div class="mb-4 flex flex-wrap items-center gap-2">
							<Users size={14} class="text-reg-muted/50" />
							{#if topic.assignees && topic.assignees.length > 0}
								{#each topic.assignees as assignee}
									{@const member = members.find(m => m.user_id === assignee.user_id)}
									<div class="group/badge relative inline-flex items-center gap-2 rounded-full border border-duck-egg/15 bg-white py-1 pl-1 pr-3 shadow-[var(--shadow-soft)] transition-colors hover:border-duck-egg/30">
										<div class="flex h-5 w-5 items-center justify-center rounded-full bg-duck-egg/15 font-mono text-[9px] font-bold uppercase text-duck-egg-dark group-hover/badge:bg-duck-egg/25">
											{member ? member.user_name.slice(0, 2) : '??'}
										</div>
										<span class="text-[11px] font-bold text-reg-dark">{member ? member.user_name : 'Unknown User'}</span>
									</div>
								{/each}
							{:else}
								<span class="text-[11px] text-reg-muted">No assignees</span>
							{/if}
							<button onclick={() => startEditTopicAssignees(topic)} class="rounded-full p-1.5 text-reg-muted/50 transition-colors hover:bg-duck-egg/10 hover:text-duck-egg-dark" title="Edit Assignees">
								<Plus size={14} />
							</button>
						</div>
					{/if}

					<div class="flex items-center gap-4 text-[11px] font-semibold text-reg-muted/60">
						<span class="flex items-center gap-1 rounded-md bg-duck-egg/8 px-2 py-0.5 font-mono text-duck-egg-dark">
							<Hash size={10} />{topic.issue_number}
						</span>
						{#if topic.created_at}
							<span class="flex items-center gap-1">
								<Calendar size={10} /> {new Date(topic.created_at).toLocaleDateString()}
							</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
		{#if topics.length === 0}
			<div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 py-14 text-center">
				<p class="text-sm font-medium text-reg-muted">No topics found. Start a new topic above.</p>
			</div>
		{/if}
	</div>
{/if}
