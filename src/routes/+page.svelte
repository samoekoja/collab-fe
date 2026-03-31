<script lang="ts">
  import { ArrowRight, Layers, GitBranch, Users } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center text-center">
  <!-- Badge -->
  <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-duck-egg/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-duck-egg-dark shadow-sm backdrop-blur-sm">
    <span class="h-1.5 w-1.5 rounded-full bg-accent-success animate-pulse"></span>
    Collaborative Platform
  </div>

  <h1 class="mb-4 text-5xl font-black tracking-tight text-reg-dark sm:text-6xl">
    Ship, <span class="gradient-text">Together</span>.
  </h1>
  <p class="mb-10 max-w-lg text-lg leading-relaxed text-reg-muted">
    Manage projects from initial research through development release — with your entire team on one unified board.
  </p>
  
  <div class="flex items-center gap-3">
    <a href="/login" class="group inline-flex items-center gap-2 rounded-xl bg-reg-dark px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110">
      Sign In <ArrowRight size={16} class="transition-transform group-hover:translate-x-0.5" />
    </a>
    <a href="/signup" class="inline-flex items-center gap-2 rounded-xl border border-duck-egg/40 bg-white/80 px-7 py-3.5 text-sm font-bold text-reg-dark shadow-sm backdrop-blur-sm transition-all hover:border-duck-egg hover:shadow-md">
      Create Account
    </a>
  </div>

  <!-- Feature pills -->
  <div class="mt-16 flex flex-wrap items-center justify-center gap-4">
    {#each [
      { icon: Layers, label: 'Research → Development pipeline' },
      { icon: GitBranch, label: 'Feature lifecycle tracking' },
      { icon: Users, label: 'Team & org management' },
    ] as feat}
      <div class="flex items-center gap-2.5 rounded-full border border-duck-egg/20 bg-white/60 px-4 py-2 text-xs font-semibold text-reg-muted backdrop-blur-sm">
        <feat.icon size={14} class="text-duck-egg-dark" />
        {feat.label}
      </div>
    {/each}
  </div>
</div>
