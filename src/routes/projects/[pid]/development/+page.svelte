<script lang="ts">
	import { page } from '$app/stores';
	import { listFeatures, createFeature, updateFeature } from '$lib/api/development';
	import { listGroups } from '$lib/api/research';
	import { extractId } from '$lib/api/client';
	import { useOrgContext } from '$lib/stores/org.svelte';
	import type { Feature } from '$lib/types/development';
	import type { ResearchGroup } from '$lib/types/research';
	import { Plus, GripVertical, AlertCircle, X, ArrowRight } from 'lucide-svelte';

	const org = useOrgContext();
	let canManage = $derived(org.isAdminOrOwner);

	let features = $state<Feature[]>([]);
	let loading = $state(true);

	const columns = [
		{ id: 'planning', title: 'Backlog', emoji: '📋' },
		{ id: 'in_development', title: 'In Progress', emoji: '⚡' },
		{ id: 'staging', title: 'Staging', emoji: '🚀' },
		{ id: 'testing', title: 'Testing / QA', emoji: '🧪' },

		{ id: 'released', title: 'Released', emoji: '✅' }
	];

	let showForm = $state(false);
	let newTitle = $state('');
	let newDesc = $state('');
	let newPrd = $state('');
	let newPriority = $state('medium');
	let newRequirementInput = $state('');
	let newRequirements = $state<string[]>([]);
	let selectedGroupIds = $state<string[]>([]);
	let submitting = $state(false);
	let researchGroups = $state<ResearchGroup[]>([]);

	$effect(() => {
		const pid = $page.params.pid;
		if (pid) {
			listFeatures(pid)
				.then((res) => (features = res))
				.finally(() => (loading = false));
			listGroups(pid)
				.then((res) => (researchGroups = res))
				.catch(() => {});
		}
	});

	function addRequirement() {
		if (newRequirementInput.trim()) {
			newRequirements = [...newRequirements, newRequirementInput.trim()];
			newRequirementInput = '';
		}
	}

	function removeRequirement(index: number) {
		newRequirements = newRequirements.filter((_, i) => i !== index);
	}

	async function handleCreate(e: Event) {
		e.preventDefault();
		submitting = true;
		try {
			const pid = $page.params.pid!;
			const research_links = selectedGroupIds.map((gid) => `/projects/${pid}/research/${gid}`);
			const f = await createFeature(pid, {
				title: newTitle,
				description: newDesc,
				prd: newPrd,
				priority: newPriority,
				requirements: newRequirements,
				research_links
			});
			features = [...features, f];
			showForm = false;
			newTitle = '';
			newDesc = '';
			newPrd = '';
			newPriority = 'medium';
			newRequirements = [];
			newRequirementInput = '';
			selectedGroupIds = [];
		} catch (err: any) {
			alert(err.message);
		} finally {
			submitting = false;
		}
	}

	function handleDragStart(e: DragEvent, feature: Feature) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('featureId', extractId(feature));
		}
	}

	async function handleDrop(e: DragEvent, targetStage: string) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		const featureId = e.dataTransfer.getData('featureId');
		const featureIndex = features.findIndex((f) => extractId(f) === featureId);
		if (featureIndex !== -1 && features[featureIndex].lifecycle_stage !== targetStage) {
			const originalStage = features[featureIndex].lifecycle_stage;
			features[featureIndex].lifecycle_stage = targetStage;
			try {
				await updateFeature($page.params.pid!, featureId, { lifecycle_stage: targetStage });
			} catch (err: any) {
				features[featureIndex].lifecycle_stage = originalStage;
				alert('Failed to move feature: ' + err.message);
			}
		}
	}

	function priorityStyle(p: string) {
		if (p === 'high') return 'bg-red-50 text-red-700 border-red-200';
		if (p === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
		return 'bg-duck-egg/10 text-duck-egg-dark border-duck-egg/20';
	}
</script>

<!-- Header -->
<div class="mb-8 flex items-center justify-between">
	<div>
		<h2 class="text-2xl font-extrabold tracking-tight text-reg-dark">Feature Board</h2>
		<p class="mt-1 text-sm text-reg-muted">Track feature lifecycles</p>
	</div>
	{#if canManage}
		<button
			onclick={() => (showForm = !showForm)}
			class="inline-flex items-center gap-2 rounded-xl {showForm
				? 'bg-reg-muted/10 text-reg-muted'
				: 'bg-reg-dark text-white shadow-lg hover:shadow-xl hover:brightness-110'} px-5 py-2.5 text-sm font-bold transition-all"
		>
			{#if showForm}<X size={15} /> Cancel{:else}<Plus size={15} /> New Feature{/if}
		</button>
	{/if}
</div>

<!-- Create form -->
{#if showForm && canManage}
	<form
		onsubmit={handleCreate}
		class="animate-in mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]"
	>
		<div class="border-b border-duck-egg/10 bg-surface-raised px-7 py-5">
			<h3 class="text-lg font-extrabold text-reg-dark">Draft New Feature</h3>
		</div>
		<div class="space-y-5 p-7">
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>Feature Title</label
				>
				<input
					type="text"
					bind:value={newTitle}
					required
					placeholder="e.g. Real-time notification engine"
					class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
				/>
			</div>
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>Description/User Story</label
				>
				<textarea
					bind:value={newDesc}
					required
					rows="3"
					placeholder="As a user I want to be able to... so that..."
					class="w-full resize-none rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm leading-relaxed font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
				></textarea>
			</div>
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>PRD Link / Content</label
				>
				<textarea
					bind:value={newPrd}
					rows="2"
					placeholder="Link to PRD or paste short content..."
					class="w-full resize-none rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm leading-relaxed font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
				></textarea>
			</div>
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>Priority</label
				>
				<select
					bind:value={newPriority}
					class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
				>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
			</div>
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>Research Groups</label
				>
				<select
					multiple
					bind:value={selectedGroupIds}
					class="min-h-[100px] w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
				>
					{#each researchGroups as group}
						<option value={extractId(group)}>{group.name}</option>
					{/each}
				</select>
				<p class="mt-1.5 text-[11px] font-bold text-reg-muted/70">
					Hold Ctrl/Cmd to select multiple groups.
				</p>
			</div>
			<div>
				<label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase"
					>Requirements</label
				>
				<div class="space-y-2">
					{#each newRequirements as req, i}
						<div class="flex items-center gap-2">
							<span
								class="flex-1 rounded-xl border border-duck-egg/15 bg-white px-4 py-2 text-sm font-medium text-reg-dark shadow-[var(--shadow-soft)]"
								>{req}</span
							>
							<button
								type="button"
								onclick={() => removeRequirement(i)}
								class="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-700"
							>
								<X size={15} />
							</button>
						</div>
					{/each}
					<div class="flex items-center gap-2">
						<input
							type="text"
							bind:value={newRequirementInput}
							placeholder="Add requirement..."
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addRequirement();
								}
							}}
							class="flex-1 rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
						/>
						<button
							type="button"
							onclick={addRequirement}
							class="rounded-xl bg-duck-egg/10 p-2.5 text-duck-egg-dark transition-colors hover:bg-duck-egg/20"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>
			</div>
			<div class="flex gap-3">
				<button
					type="submit"
					disabled={submitting}
					class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
				>
					{submitting ? 'Creating…' : 'Create Feature'}
				</button>
				<button
					type="button"
					onclick={() => (showForm = false)}
					class="rounded-xl px-5 py-3 text-sm font-semibold text-reg-muted transition-colors hover:bg-sand-warm/50 hover:text-reg-dark"
					>Cancel</button
				>
			</div>
		</div>
	</form>
{/if}

<!-- Kanban Board -->
{#if loading}
	<div class="flex gap-5 overflow-x-auto pb-4">
		{#each columns as _}
			<div class="w-[300px] min-w-[300px] rounded-2xl border border-duck-egg/12 bg-white p-4">
				<div class="skeleton mb-4 h-5 w-24"></div>
				<div class="skeleton mb-3 h-20 w-full rounded-xl"></div>
				<div class="skeleton h-20 w-full rounded-xl"></div>
			</div>
		{/each}
	</div>
{:else}
	<div class="hide-scrollbar flex min-h-[550px] snap-x items-start gap-5 overflow-x-auto pb-8">
		{#each columns as col}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="flex max-h-[70vh] w-[300px] min-w-[300px] snap-start flex-col rounded-2xl border border-duck-egg/12 bg-white/70 shadow-[var(--shadow-soft)] transition-colors"
				ondragover={(e) => {
					if (canManage) {
						e.preventDefault();
						e.dataTransfer!.dropEffect = 'move';
					}
				}}
				ondragenter={(e) => {
					if (canManage) {
						e.preventDefault();
						(e.currentTarget as HTMLElement).classList.add(
							'ring-2',
							'ring-duck-egg/20',
							'bg-duck-egg/5'
						);
					}
				}}
				ondragleave={(e) => {
					if (canManage)
						(e.currentTarget as HTMLElement).classList.remove(
							'ring-2',
							'ring-duck-egg/20',
							'bg-duck-egg/5'
						);
				}}
				ondrop={(e) => {
					if (canManage) {
						(e.currentTarget as HTMLElement).classList.remove(
							'ring-2',
							'ring-duck-egg/20',
							'bg-duck-egg/5'
						);
						handleDrop(e, col.id);
					}
				}}
			>
				<!-- Column header -->
				<div class="flex items-center justify-between border-b border-duck-egg/10 px-4 py-3.5">
					<h3 class="flex items-center gap-2 text-sm font-extrabold text-reg-dark">
						<span>{col.emoji}</span>
						{col.title}
					</h3>
					<span
						class="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-duck-egg/10 px-2 text-[11px] font-bold text-duck-egg-dark"
					>
						{features.filter((f) => f.lifecycle_stage === col.id).length}
					</span>
				</div>

				<!-- Cards -->
				<div class="hide-scrollbar min-h-[80px] flex-1 space-y-3 overflow-y-auto p-3">
					{#each features.filter((f) => f.lifecycle_stage === col.id) as feature}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							draggable={canManage ? 'true' : 'false'}
							ondragstart={(e) => {
								if (canManage) handleDragStart(e, feature);
							}}
							class="group relative {canManage
								? 'cursor-grab active:cursor-grabbing'
								: ''} rounded-xl border border-duck-egg/12 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-duck-egg/25 hover:shadow-[var(--shadow-card)] active:shadow-lg"
						>
							{#if canManage}
								<div
									class="absolute top-3 right-3 text-reg-muted/20 transition-colors group-hover:text-reg-muted/50"
								>
									<GripVertical size={14} />
								</div>
							{/if}
							<h4
								class="mb-2 pr-5 text-[13px] leading-snug font-bold text-reg-dark group-hover:text-duck-egg-dark"
							>
								{feature.title}
							</h4>
							<p class="mb-3 line-clamp-2 text-[11px] leading-relaxed text-reg-muted">
								{feature.description}
							</p>
							<div class="flex items-center justify-between">
								<span
									class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {priorityStyle(
										feature.priority
									)}"
								>
									{#if feature.priority === 'high'}<AlertCircle size={10} />{/if}
									{feature.priority}
								</span>
								<a
									href={`/projects/${$page.params.pid}/development/${extractId(feature)}`}
									onclick={(e) => e.stopPropagation()}
									class="flex items-center gap-1 text-[11px] font-bold text-duck-egg opacity-0 transition-all group-hover:opacity-100 hover:underline"
								>
									Open <ArrowRight size={11} />
								</a>
							</div>
						</div>
					{/each}
					{#if features.filter((f) => f.lifecycle_stage === col.id).length === 0}
						<div
							class="flex items-center justify-center rounded-xl border-2 border-dashed border-duck-egg/15 py-8 text-center"
						>
							<p class="text-[11px] font-medium text-reg-muted/50">Drop features here</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
