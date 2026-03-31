<script lang="ts">
	import { page } from '$app/stores';
	import { getFeature, updateFeature, listTasks, createTask, updateTask } from '$lib/api/development';
	import { listGroups } from '$lib/api/research';
	import { listOrgMembers } from '$lib/api/organizations';
	import { extractId } from '$lib/api/client';
	import { useOrgContext } from '$lib/stores/org.svelte';
	import type { Feature, Task } from '$lib/types/development';
	import type { ResearchGroup } from '$lib/types/research';
	import type { EnrichedMember } from '$lib/types/organization';
	import { ArrowLeft, CheckCircle2, Circle, Clock, Eye, ListTodo, PlusCircle, AlertCircle, Link, Users, Plus } from 'lucide-svelte';

	const org = useOrgContext();

	let feature = $state<Feature | null>(null);
	let tasks = $state<Task[]>([]);
	let loading = $state(true);
	let researchGroups = $state<ResearchGroup[]>([]);
	let members = $state<EnrichedMember[]>([]);

	let newTaskTitle = $state('');
	let newTaskDesc = $state('');
	let newTaskUserIds = $state<string[]>([]);

	$effect(() => {
		const { pid, fid } = $page.params;
		if (pid && fid) {
			Promise.all([
				getFeature(pid, fid).then((f) => (feature = f)),
				listTasks(pid, fid).then((t) => (tasks = t)),
				listGroups(pid).then((rg) => (researchGroups = rg)).catch(() => [])
			]).finally(() => (loading = false));
		}
	});

	$effect(() => {
		if (org.orgId) {
			listOrgMembers(org.orgId).then((m) => (members = m)).catch(() => {});
		}
	});

	async function handleCycleUpdate(e: Event) {
		const stage = (e.target as HTMLSelectElement).value;
		if (!feature) return;
		try {
			await updateFeature($page.params.pid!, $page.params.fid!, { lifecycle_stage: stage });
			feature.lifecycle_stage = stage;
		} catch (err: any) { alert(err.message); }
	}

	async function handleAddTask(e: Event) {
		e.preventDefault();
		if (!newTaskTitle.trim()) return;
		try {
			const assignees = newTaskUserIds.map(uid => ({ user_id: uid, assigned_at: new Date().toISOString() }));
			const t = await createTask($page.params.pid!, $page.params.fid!, { 
				title: newTaskTitle, 
				description: newTaskDesc, 
				assignees 
			});
			tasks = [...tasks, t];
			newTaskTitle = ''; newTaskDesc = ''; newTaskUserIds = [];
		} catch (err: any) { alert(err.message); }
	}

	let editingTaskAssignees = $state<string | null>(null);
	let editTaskUserIds = $state<string[]>([]);

	function startEditTaskAssignees(task: Task) {
		editingTaskAssignees = extractId(task) || task._id as any;
		editTaskUserIds = task.assignees?.map(a => a.user_id) || [];
	}

	async function saveTaskAssignees(task: Task) {
		try {
			const assignees = editTaskUserIds.map(uid => ({ user_id: uid, assigned_at: new Date().toISOString() }));
			const tId = extractId(task) || task._id as any;
			await updateTask($page.params.pid!, $page.params.fid!, tId, { assignees });
			task.assignees = assignees;
			tasks = [...tasks];
			editingTaskAssignees = null;
		} catch (err: any) {
			alert('Failed to update assignees: ' + err.message);
		}
	}

	async function cycleTaskStatus(task: Task) {
		const order = ['todo', 'in_progress', 'in_review', 'done'];
		const idx = order.indexOf(task.status);
		const next = order[(idx + 1) % order.length];
		try {
			await updateTask($page.params.pid!, $page.params.fid!, extractId(task), { status: next });
			task.status = next;
			tasks = [...tasks]; // trigger reactivity
		} catch (err: any) { alert(err.message); }
	}

	function statusConfig(status: string) {
		const map: Record<string, { icon: any; color: string; bg: string; label: string }> = {
			todo: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200 text-slate-600', label: 'To Do' },
			in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'In Progress' },
			in_review: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200 text-blue-700', label: 'In Review' },
			done: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Done' },
		};
		return map[status] ?? map.todo;
	}

	function priorityStyle(p: string) {
		if (p === 'high') return 'border-red-200 bg-red-50 text-red-700';
		if (p === 'medium') return 'border-amber-200 bg-amber-50 text-amber-700';
		return 'border-duck-egg/20 bg-duck-egg/10 text-duck-egg-dark';
	}
</script>

<!-- Back nav -->
<a href={`/projects/${$page.params.pid}/development`}
	class="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-reg-muted transition-colors hover:text-reg-dark">
	<ArrowLeft size={14} /> Back to Feature Board
</a>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<div class="h-8 w-8 animate-spin rounded-full border-[3px] border-duck-egg-light border-t-duck-egg"></div>
	</div>
{:else if feature}
	<!-- Feature header card -->
	<div class="mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
		<div class="h-2 gradient-accent"></div>
		<div class="p-7 sm:p-8">
			<div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
				<div class="flex-1">
					<h1 class="mb-3 text-2xl font-extrabold tracking-tight text-reg-dark sm:text-3xl">{feature.title}</h1>
					<div class="flex flex-wrap items-center gap-2">
						<span class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase {priorityStyle(feature.priority)}">
							{#if feature.priority === 'high'}<AlertCircle size={10} />{/if}
							{feature.priority} Priority
						</span>
						{#if feature.requirements?.length}
							<span class="rounded-full bg-duck-egg/10 px-3 py-1 text-[10px] font-bold text-duck-egg-dark">
								{feature.requirements.length} req{feature.requirements.length !== 1 ? 's' : ''}
							</span>
						{/if}
					</div>
				</div>

				<!-- Lifecycle selector -->
				<div class="min-w-[200px] rounded-xl border border-duck-egg/15 bg-surface-raised p-4">
					<label for="lifecycle-select" class="mb-1.5 block text-[10px] font-bold tracking-[0.1em] text-reg-muted uppercase">Lifecycle</label>
					<select
						id="lifecycle-select"
						value={feature.lifecycle_stage}
						onchange={handleCycleUpdate}
						class="w-full rounded-lg border border-duck-egg/25 bg-white px-3 py-2 text-sm font-semibold text-reg-dark shadow-sm focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
					>
						<option value="planning">📋 Planning</option>
						<option value="in_development">⚡ Active Dev</option>
						<option value="testing">🧪 Testing / QA</option>
						<option value="staging">🚀 Staging</option>
						<option value="released">✅ Released</option>
					</select>
				</div>
			</div>

			<p class="mt-5 max-w-3xl text-sm leading-relaxed text-reg-muted whitespace-pre-wrap">{feature.description}</p>

			{#if feature.prd}
				<div class="mt-8">
					<h3 class="mb-3 text-xs font-extrabold tracking-wide text-reg-muted uppercase">Product Requirements Document (PRD)</h3>
					<div class="prose-sm prose max-w-none rounded-xl border border-duck-egg/10 bg-surface-raised p-5 text-reg-dark shadow-inner"><p class="whitespace-pre-wrap">{feature.prd}</p></div>
				</div>
			{/if}

			{#if feature.requirements && feature.requirements.length > 0}
				<div class="mt-8">
					<h3 class="mb-3 text-xs font-extrabold tracking-wide text-reg-muted uppercase">Core Requirements</h3>
					<ul class="space-y-2">
						{#each feature.requirements as req}
							<li class="flex items-start gap-2 text-sm font-medium text-reg-dark">
								<div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-duck-egg-dark"></div>
								<span class="flex-1 leading-relaxed">{req}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if feature.research_links && feature.research_links.length > 0}
				<div class="mt-8 border-t border-duck-egg/10 pt-8">
					<h3 class="mb-3 text-xs font-extrabold tracking-wide text-reg-muted uppercase">Linked Research</h3>
					<div class="flex flex-wrap gap-3">
						{#each feature.research_links as link}
							{@const gid = link.split('/').pop() || ''}
							{@const group = researchGroups.find(g => extractId(g) === gid)}
							<a href={link} class="inline-flex items-center gap-2 rounded-xl border border-duck-egg/20 bg-duck-egg/5 px-4 py-2.5 text-sm font-bold text-duck-egg-dark transition-all hover:bg-duck-egg/15 hover:shadow-sm">
								<Link size={14} />
								{group ? group.name : `Research Group ${gid.slice(-4)}`}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Tasks section -->
	<div class="mb-5 flex items-center gap-2.5">
		<ListTodo size={20} class="text-reg-muted/60" />
		<h3 class="text-lg font-extrabold text-reg-dark">Tasks <span class="ml-1 text-sm font-semibold text-reg-muted">({tasks.length})</span></h3>
	</div>

	<!-- Inline task creator -->
	<form onsubmit={handleAddTask}
		class="mb-6 flex flex-col gap-3 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white p-5 shadow-[var(--shadow-soft)] md:flex-row md:items-end"
	>
		<div class="flex-1">
			<label for="new_task_title" class="mb-1 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Task Title</label>
			<input id="new_task_title" bind:value={newTaskTitle} placeholder="e.g. Implement schema migration" required
				class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
		</div>
		<div class="flex-1">
			<label for="new_task_assignees" class="mb-1 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Assignees</label>
			<select id="new_task_assignees" multiple bind:value={newTaskUserIds} class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none max-h-[46px] hide-scrollbar" title="Hold Ctrl/Cmd to select multiple">
				{#each members as member}
					<option value={member.user_id}>{member.user_name}</option>
				{/each}
			</select>
		</div>
		<div class="flex-[1.5]">
			<label for="new_task_desc" class="mb-1 block text-[10px] font-bold tracking-wide text-reg-muted uppercase">Description</label>
			<input id="new_task_desc" bind:value={newTaskDesc} placeholder="Engineering details…" required
				class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none" />
		</div>
		<button type="submit"
			class="inline-flex items-center justify-center gap-2 rounded-xl bg-reg-dark px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110">
			<PlusCircle size={15} /> Add
		</button>
	</form>

	<!-- Task list -->
	<div class="space-y-2.5">
		{#each tasks as task}
			{@const sc = statusConfig(task.status)}
			<div class="group flex items-start gap-4 rounded-2xl border border-duck-egg/12 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-duck-egg/25 hover:shadow-[var(--shadow-card)]">
				<!-- Clickable status icon -->
				<button onclick={() => cycleTaskStatus(task)}
					class="mt-0.5 {sc.color} transition-all hover:scale-110 active:scale-95"
					title="Click to advance status">
					<sc.icon size={20} strokeWidth={2.2} />
				</button>
				<div class="flex-1 min-w-0">
					<div class="flex items-start justify-between gap-3">
						<h4 class="text-[14px] font-bold text-reg-dark {task.status === 'done' ? 'line-through opacity-60' : ''}">{task.title}</h4>
						<button onclick={() => cycleTaskStatus(task)}
							class="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-colors hover:brightness-95 {sc.bg}">
							{sc.label}
						</button>
					</div>
					<p class="mt-1 text-[12px] leading-relaxed text-reg-muted {task.status === 'done' ? 'opacity-50' : ''}">{task.description}</p>
					{#if editingTaskAssignees === (extractId(task) || task._id)}
						<div class="mt-3 flex items-start gap-2">
							<select multiple bind:value={editTaskUserIds} class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-3 py-2 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none min-h-[60px] hide-scrollbar" title="Hold Ctrl/Cmd to select multiple">
								{#each members as member}
									<option value={member.user_id}>{member.user_name}</option>
								{/each}
							</select>
							<div class="flex flex-col gap-1">
								<button onclick={() => saveTaskAssignees(task)} class="rounded-lg bg-reg-dark px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:brightness-110">Save</button>
								<button onclick={() => editingTaskAssignees = null} class="rounded-lg bg-surface-raised px-3 py-1.5 text-[10px] font-bold text-reg-muted transition-colors hover:bg-duck-egg/10">Cancel</button>
							</div>
						</div>
					{:else}
						<div class="mt-2.5 flex flex-wrap items-center gap-1.5 {task.status === 'done' ? 'opacity-50' : ''}">
							<Users size={12} class="text-reg-muted/50" />
							{#if task.assignees && task.assignees.length > 0}
								{#each task.assignees as assignee}
									{@const member = members.find(m => m.user_id === assignee.user_id)}
									<div class="inline-flex items-center gap-1.5 rounded-full border border-duck-egg/15 bg-duck-egg/5 py-0.5 pl-0.5 pr-2.5 shadow-sm transition-colors hover:border-duck-egg/30">
										<div class="flex h-4 w-4 items-center justify-center rounded-full bg-duck-egg/20 font-mono text-[8px] font-bold uppercase text-duck-egg-dark">
											{member ? member.user_name.slice(0, 2) : '??'}
										</div>
										<span class="text-[10px] font-bold text-reg-dark opacity-80">{member ? member.user_name : 'Unknown User'}</span>
									</div>
								{/each}
							{:else}
								<span class="text-[10px] text-reg-muted">Unassigned</span>
							{/if}
							<button onclick={() => startEditTaskAssignees(task)} class="ml-1 rounded-full p-1 text-reg-muted/50 transition-colors hover:bg-duck-egg/10 hover:text-duck-egg-dark" title="Edit Assignees">
								<Plus size={12} />
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		{#if tasks.length === 0}
			<div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 p-10 text-center">
				<ListTodo size={32} class="mb-3 text-duck-egg/40" />
				<h4 class="text-sm font-bold text-reg-dark">No tasks yet</h4>
				<p class="mt-1 text-xs text-reg-muted">Break this feature down into manageable tasks above</p>
			</div>
		{/if}
	</div>
{/if}
