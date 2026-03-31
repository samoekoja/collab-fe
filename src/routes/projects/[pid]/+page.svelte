<script lang="ts">
	import { getContext } from 'svelte';
	import type { Project } from '$lib/types/project';
	import { page } from '$app/stores';
	import { FlaskConical, Code2, TrendingUp, ArrowRight } from 'lucide-svelte';

	const ctx: { current: Project | null } = getContext('projectContext');

	const segments = [
		{
			href: 'research',
			icon: FlaskConical,
			title: 'Research Segment',
			description: 'Organize research groups, topics, and references before features are built.',
			color: 'duck-egg',
			gradient: 'from-duck-egg/10 to-duck-egg/5',
		},
		{
			href: 'development',
			icon: Code2,
			title: 'Development Segment',
			description: 'Convert research into actionable features. Manage PRDs and Kanban task flows.',
			color: 'lavender',
			gradient: 'from-lavender/10 to-lavender/5',
		},
		{
			href: 'market',
			icon: TrendingUp,
			title: 'Client Segment',
			description: 'Process and track client requests. Funnel demand into research or development.',
			color: 'duck-egg',
			gradient: 'from-amber-50 to-orange-50/50',
		},
	];
</script>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each segments as seg, i}
		<a
			href={`/projects/${$page.params.pid}/${seg.href}`}
			class="hover-lift group relative flex flex-col overflow-hidden rounded-2xl border border-{seg.color}/15 bg-white shadow-[var(--shadow-soft)]"
			style="animation-delay: {i * 80}ms"
		>
			<!-- Gradient top -->
			<div class="h-24 bg-gradient-to-br {seg.gradient} flex items-center justify-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm transition-transform group-hover:scale-110">
					<seg.icon size={26} strokeWidth={2} class="text-{seg.color === 'lavender' ? 'lavender' : 'duck-egg-dark'}" />
				</div>
			</div>

			<div class="flex flex-1 flex-col p-6">
				<h3 class="mb-2 text-lg font-extrabold text-reg-dark">{seg.title}</h3>
				<p class="flex-1 text-sm leading-relaxed text-reg-muted">{seg.description}</p>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-duck-egg opacity-0 transition-all group-hover:opacity-100">
					Explore <ArrowRight size={13} />
				</div>
			</div>
		</a>
	{/each}
</div>
