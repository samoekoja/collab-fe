<script lang="ts">
  import { useOrgContext } from '$lib/stores/org.svelte';
  import {
    listOrgMembers,
    inviteMember,
    updateOrgMemberRole,
    removeOrgMember,
    getOrganization
  } from '$lib/api/organizations';
  import { extractId } from '$lib/api/client';
  import type { EnrichedMember, Organization } from '$lib/types/organization';
  import {
    Users, UserPlus, Mail, Shield, ShieldCheck, Crown,
    ChevronDown, Trash2, Check, X, Copy, AlertTriangle
  } from 'lucide-svelte';

  const org = useOrgContext();

  let organization = $state<Organization | null>(null);
  let members = $state<EnrichedMember[]>([]);
  let loading = $state(true);
  let errorMsg = $state('');

  // Invite form
  let showInvite = $state(false);
  let inviteEmail = $state('');
  let inviting = $state(false);
  let inviteSuccess = $state('');
  let inviteError = $state('');

  // Role editing
  let editingRole = $state<string | null>(null); // user_id being edited

  // Confirm remove
  let confirmRemove = $state<string | null>(null); // user_id to remove

  $effect(() => {
    if (org.orgId) {
      loadData(org.orgId);
    }
  });

  async function loadData(id: string) {
    loading = true;
    try {
      const [orgData, memberData] = await Promise.all([
        getOrganization(id),
        listOrgMembers(id)
      ]);
      organization = orgData;
      members = memberData;
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleInvite(e: Event) {
    e.preventDefault();
    if (!org.orgId || !inviteEmail.trim()) return;
    inviting = true;
    inviteError = '';
    inviteSuccess = '';
    try {
      await inviteMember(org.orgId, { email: inviteEmail.trim() });
      inviteSuccess = `User ${inviteEmail} added to the team. They can log in with temporary password '123456'.`;
      inviteEmail = '';
      showInvite = false;
      // Refresh members in case user already existed and was added
      if (org.orgId) {
        members = await listOrgMembers(org.orgId);
      }
      setTimeout(() => inviteSuccess = '', 7000);
    } catch (e: any) {
      inviteError = e.message;
    } finally {
      inviting = false;
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!org.orgId) return;
    try {
      await updateOrgMemberRole(org.orgId, userId, { role: newRole });
      members = members.map(m =>
        m.user_id === userId ? { ...m, org_role: newRole } : m
      );
      editingRole = null;
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleRemove(userId: string) {
    if (!org.orgId) return;
    try {
      await removeOrgMember(org.orgId, userId);
      members = members.filter(m => m.user_id !== userId);
      confirmRemove = null;
    } catch (e: any) {
      alert(e.message);
      confirmRemove = null;
    }
  }

  function roleIcon(role: string) {
    if (role === 'owner') return Crown;
    if (role === 'admin') return ShieldCheck;
    return Shield;
  }

  function roleColor(role: string) {
    if (role === 'owner') return 'text-amber-600 bg-amber-50 border-amber-200';
    if (role === 'admin') return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-duck-egg-dark bg-duck-egg/10 border-duck-egg/20';
  }

  let isOwner = $derived(
    organization ? org.userId === organization.owner_id : false
  );

  let canManage = $derived(org.isAdminOrOwner);
</script>

{#if loading}
  <div class="space-y-4">
    <div class="rounded-2xl border border-duck-egg/15 bg-white p-7">
      <div class="skeleton mb-4 h-5 w-48"></div>
      <div class="skeleton h-12 w-full"></div>
    </div>
    {#each [1,2,3] as _}
      <div class="rounded-2xl border border-duck-egg/15 bg-white p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton h-10 w-10 rounded-full"></div>
          <div class="flex-1">
            <div class="skeleton mb-2 h-4 w-32"></div>
            <div class="skeleton h-3 w-20"></div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else if errorMsg}
  <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{errorMsg}</div>
{:else}
  <!-- Success toast -->
  {#if inviteSuccess}
    <div class="animate-in mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      <Check size={15} class="shrink-0" />
      {inviteSuccess}
    </div>
  {/if}

  <!-- Invite section (admin/owner only) -->
  {#if canManage}
  <div class="mb-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-[var(--shadow-card)]">
    <div class="flex items-center justify-between border-b border-duck-egg/10 bg-surface-raised px-7 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
          <UserPlus size={18} class="text-white" />
        </div>
        <div>
          <h3 class="text-base font-extrabold text-reg-dark">Invite Team Members</h3>
          <p class="text-xs text-reg-muted">Add people to your organization by email</p>
        </div>
      </div>
      {#if !showInvite}
        <button onclick={() => showInvite = true}
          class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110">
          <UserPlus size={14} /> Invite
        </button>
      {/if}
    </div>

    {#if showInvite}
      <div class="animate-in p-7">
        {#if inviteError}
          <div class="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertTriangle size={14} class="shrink-0" />
            {inviteError}
          </div>
        {/if}

        <form onsubmit={handleInvite} class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Email Address</label>
            <div class="relative">
              <Mail size={15} class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-reg-muted/40" />
              <input
                type="email"
                bind:value={inviteEmail}
                required
                placeholder="colleague@company.com"
                class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised pl-10 pr-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              disabled={inviting}
              class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
            >
              {#if inviting}
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Sending…
              {:else}
                <Mail size={14} /> Send Invite
              {/if}
            </button>
            <button type="button" onclick={() => { showInvite = false; inviteError = ''; }}
              class="rounded-xl px-4 py-3 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 transition-colors">
              Cancel
            </button>
          </div>
        </form>

        <p class="mt-4 text-xs text-reg-muted leading-relaxed">
          The user will be added to your organization immediately. If they don't have an account, one will be created with the temporary password <span class="font-bold text-reg-dark">123456</span>. They will be prompted to change it on their first login.
        </p>
      </div>
    {/if}
  </div>
  {/if}

  <!-- Members list -->
  <div class="mb-5 flex items-center justify-between">
    <h3 class="flex items-center gap-2 text-lg font-extrabold text-reg-dark">
      <Users size={18} class="text-reg-muted" />
      Team Members
      <span class="text-sm font-semibold text-reg-muted">({members.length})</span>
    </h3>
  </div>

  <div class="space-y-2.5">
    {#each members as member}
      {@const RoleIcon = roleIcon(member.org_role)}
      {@const isCurrentUser = member.user_id === org.userId}
      <div class="group flex items-center gap-4 rounded-2xl border border-duck-egg/12 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-duck-egg/25 hover:shadow-[var(--shadow-card)] sm:p-5">
      <!-- Avatar -->
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-duck-egg/20 to-lavender/20 text-sm font-bold text-reg-dark">
          {member.user_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-bold text-reg-dark">
              {member.user_name}
              {#if isCurrentUser}
                <span class="ml-1.5 text-[10px] font-semibold text-duck-egg-dark">(you)</span>
              {/if}
            </p>
            {#if member.user_status === 'inactive'}
              <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold tracking-wide text-amber-600 uppercase">Pending</span>
            {/if}
          </div>
          <p class="mt-0.5 text-xs text-reg-muted">
            {member.user_email}
            <span class="mx-1.5 text-duck-egg/30">·</span>
            Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
          </p>
        </div>

        <!-- Actions (admin/owner only, not on self or other owners) -->
        {#if canManage && !isCurrentUser && member.org_role !== 'owner'}
          <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 pr-2">
            {#if editingRole !== member.user_id}
              <button onclick={() => editingRole = member.user_id}
                class="rounded-lg border border-duck-egg/20 p-2 text-reg-muted transition-all hover:border-duck-egg hover:text-reg-dark"
                title="Change role">
                <ChevronDown size={14} />
              </button>
            {/if}

            {#if confirmRemove === member.user_id}
              <div class="animate-in flex items-center gap-1">
                <button onclick={() => handleRemove(member.user_id)}
                  class="rounded-lg bg-red-500 p-2 text-white transition-all hover:bg-red-600"
                  title="Confirm remove">
                  <Check size={14} />
                </button>
                <button onclick={() => confirmRemove = null}
                  class="rounded-lg border border-duck-egg/20 p-2 text-reg-muted transition-all hover:text-reg-dark"
                  title="Cancel">
                  <X size={14} />
                </button>
              </div>
            {:else}
              <button onclick={() => confirmRemove = member.user_id}
                class="rounded-lg border border-red-200 p-2 text-red-400 transition-all hover:border-red-400 hover:text-red-600"
                title="Remove member">
                <Trash2 size={14} />
              </button>
            {/if}
          </div>
        {/if}

        <!-- Role badge / editing -->
        <div class="flex items-center gap-2">
          {#if editingRole === member.user_id && member.org_role !== 'owner'}
            <div class="animate-in flex items-center gap-1.5">
              <button onclick={() => handleRoleChange(member.user_id, 'admin')}
                class="rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors {member.org_role === 'admin' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'bg-surface-raised text-reg-muted hover:bg-purple-50 hover:text-purple-700'}">
                Admin
              </button>
              <button onclick={() => handleRoleChange(member.user_id, 'member')}
                class="rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors {member.org_role === 'member' ? 'bg-duck-egg/20 text-duck-egg-dark ring-1 ring-duck-egg/40' : 'bg-surface-raised text-reg-muted hover:bg-duck-egg/10 hover:text-duck-egg-dark'}">
                Member
              </button>
              <button onclick={() => editingRole = null}
                class="rounded-lg p-1.5 text-reg-muted hover:bg-sand-warm/50 transition-colors">
                <X size={14} />
              </button>
            </div>
          {:else}
            <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase {roleColor(member.org_role)}">
              <RoleIcon size={11} />
              {member.org_role}
            </span>
          {/if}
        </div>
      </div>
    {/each}

    {#if members.length === 0}
      <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-duck-egg/25 bg-white/50 py-14 text-center">
        <Users size={32} class="mb-3 text-duck-egg/40" />
        <h4 class="text-sm font-bold text-reg-dark">No team members</h4>
        <p class="mt-1 text-xs text-reg-muted">Invite your first team member above</p>
      </div>
    {/if}
  </div>

  <!-- Role legend -->
  <div class="mt-8 rounded-2xl border border-duck-egg/12 bg-surface-raised p-5">
    <h4 class="mb-3 text-xs font-bold tracking-[0.1em] text-reg-muted uppercase">Role Permissions</h4>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="flex items-start gap-2.5">
        <Crown size={14} class="mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p class="text-xs font-bold text-reg-dark">Owner</p>
          <p class="text-[11px] text-reg-muted">Full access. Manage org, roles, and billing.</p>
        </div>
      </div>
      <div class="flex items-start gap-2.5">
        <ShieldCheck size={14} class="mt-0.5 shrink-0 text-purple-500" />
        <div>
          <p class="text-xs font-bold text-reg-dark">Admin</p>
          <p class="text-[11px] text-reg-muted">Invite members. Manage projects and teams.</p>
        </div>
      </div>
      <div class="flex items-start gap-2.5">
        <Shield size={14} class="mt-0.5 shrink-0 text-duck-egg" />
        <div>
          <p class="text-xs font-bold text-reg-dark">Member</p>
          <p class="text-[11px] text-reg-muted">Contribute to assigned projects.</p>
        </div>
      </div>
    </div>
  </div>
{/if}
