<script lang="ts">
  import { useOrgContext } from '$lib/stores/org.svelte';
  import { getOrganization, updateOrganization } from '$lib/api/organizations';
  import { changePassword } from '$lib/api/auth';
  import type { Organization } from '$lib/types/organization';
  import { Building2, Save, Calendar, Shield, Lock, Check, AlertTriangle } from 'lucide-svelte';

  const org = useOrgContext();
  let canManage = $derived(org.isAdminOrOwner);

  let organization = $state<Organization | null>(null);
  let loading = $state(true);
  let errorMsg = $state('');

  // Edit state
  let editingName = $state(false);
  let nameValue = $state('');
  let saving = $state(false);
  let successMsg = $state('');

  // Password change state
  let showPasswordForm = $state(false);
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');
  let pwSaving = $state(false);
  let pwError = $state('');
  let pwSuccess = $state('');

  $effect(() => {
    if (org.orgId) {
      loadOrg(org.orgId);
    }
  });

  async function loadOrg(id: string) {
    loading = true;
    try {
      organization = await getOrganization(id);
      nameValue = organization.name;
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleSaveName() {
    if (!org.orgId || !nameValue.trim()) return;
    saving = true;
    successMsg = '';
    try {
      organization = await updateOrganization(org.orgId, { name: nameValue.trim() });
      editingName = false;
      successMsg = 'Organization name updated';
      setTimeout(() => successMsg = '', 3000);
    } catch (e: any) {
      errorMsg = e.message;
    } finally {
      saving = false;
    }
  }

  async function handleChangePassword(e: Event) {
    e.preventDefault();
    pwError = '';
    pwSuccess = '';

    if (newPassword !== confirmNewPassword) {
      pwError = 'New passwords do not match';
      return;
    }
    if (newPassword.length < 6) {
      pwError = 'Password must be at least 6 characters';
      return;
    }

    pwSaving = true;
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      pwSuccess = 'Password changed successfully';
      currentPassword = '';
      newPassword = '';
      confirmNewPassword = '';
      showPasswordForm = false;
      setTimeout(() => pwSuccess = '', 5000);
    } catch (e: any) {
      pwError = e.message || 'Failed to change password';
    } finally {
      pwSaving = false;
    }
  }
</script>

{#if loading}
  <div class="space-y-6">
    <div class="rounded-2xl border border-duck-egg/15 bg-white p-7">
      <div class="skeleton mb-4 h-5 w-48"></div>
      <div class="skeleton mb-2 h-4 w-72"></div>
      <div class="skeleton h-10 w-full mt-4"></div>
    </div>
  </div>
{:else if errorMsg}
  <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{errorMsg}</div>
{:else if organization}
  {#if successMsg || pwSuccess}
    <div class="animate-in mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      <Check size={15} class="shrink-0" />
      {successMsg || pwSuccess}
    </div>
  {/if}

  <!-- Org profile card -->
  <div class="overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-(--shadow-card)">
    <div class="h-2 gradient-accent"></div>
    <div class="p-7 sm:p-8">
      <div class="mb-6 flex items-center gap-4">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-md">
          <Building2 size={24} class="text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 class="text-xl font-extrabold text-reg-dark">{organization.name}</h2>
          <p class="text-xs font-medium text-reg-muted">Organization Profile</p>
        </div>
      </div>

      <!-- Name field -->
      <div class="rounded-xl border border-duck-egg/12 bg-surface-raised p-5">
        <label for="org-name" class="mb-1.5 block text-[10px] font-bold tracking-widest text-reg-muted uppercase">Organization Name</label>
        {#if editingName}
          <div class="flex items-center gap-3">
            <input
              id="org-name"
              type="text"
              bind:value={nameValue}
              class="flex-1 rounded-xl border border-duck-egg/25 bg-white px-4 py-2.5 text-sm font-medium text-reg-dark shadow-inner focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
            <button
              onclick={handleSaveName}
              disabled={saving}
              class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
            >
              {#if saving}
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              {:else}
                <Save size={14} />
              {/if}
              Save
            </button>
            <button
              onclick={() => { editingName = false; nameValue = organization?.name ?? ''; }}
              class="rounded-xl px-4 py-2.5 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 transition-colors"
            >Cancel</button>
          </div>
        {:else}
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-reg-dark">{organization.name}</p>
            {#if canManage}
            <button
              onclick={() => editingName = true}
              class="rounded-lg border border-duck-egg/25 px-3.5 py-1.5 text-xs font-bold text-reg-muted transition-all hover:border-duck-egg hover:text-reg-dark"
            >Edit</button>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Meta info -->
      <div class="mt-4 grid grid-cols-2 gap-4">
        <div class="rounded-xl border border-duck-egg/12 bg-surface-raised p-4">
          <div class="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-reg-muted uppercase">
            <Calendar size={11} /> Created
          </div>
          <p class="text-sm font-semibold text-reg-dark">
            {organization.created_at ? new Date(organization.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div class="rounded-xl border border-duck-egg/12 bg-surface-raised p-4">
          <div class="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-reg-muted uppercase">
            <Shield size={11} /> Your Role
          </div>
          <p class="text-sm font-semibold text-reg-dark capitalize">
            {org.userId === organization.owner_id ? 'Owner' : 'Member'}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Change Password card -->
  <div class="mt-8 overflow-hidden rounded-2xl border border-duck-egg/15 bg-white shadow-(--shadow-card)">
    <div class="flex items-center justify-between border-b border-duck-egg/10 bg-surface-raised px-7 py-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-reg-dark/10">
          <Lock size={18} class="text-reg-dark" />
        </div>
        <div>
          <h3 class="text-base font-extrabold text-reg-dark">Security</h3>
          <p class="text-xs text-reg-muted">Manage your account password</p>
        </div>
      </div>
      {#if !showPasswordForm}
        <button onclick={() => showPasswordForm = true}
          class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110">
          <Lock size={14} /> Change Password
        </button>
      {/if}
    </div>

    {#if showPasswordForm}
      <div class="animate-in p-7">
        {#if pwError}
          <div class="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertTriangle size={14} class="shrink-0" />
            {pwError}
          </div>
        {/if}

        <form onsubmit={handleChangePassword} class="space-y-4">
          <div>
            <label for="current-pw" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Current Password</label>
            <input
              id="current-pw"
              type="password"
              bind:value={currentPassword}
              required
              placeholder="Enter current password"
              class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="new-pw" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">New Password</label>
              <input
                id="new-pw"
                type="password"
                bind:value={newPassword}
                required
                placeholder="Min 6 characters"
                class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
              />
            </div>
            <div>
              <label for="confirm-new-pw" class="mb-1.5 block text-xs font-bold tracking-wide text-reg-muted uppercase">Confirm New Password</label>
              <input
                id="confirm-new-pw"
                type="password"
                bind:value={confirmNewPassword}
                required
                placeholder="Re-enter new password"
                class="w-full rounded-xl border border-duck-egg/25 bg-surface-raised px-4 py-3 text-sm font-medium text-reg-dark shadow-inner placeholder:text-reg-muted/40 focus:border-duck-egg focus:ring-2 focus:ring-duck-egg/20 focus:outline-none"
              />
            </div>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pwSaving}
              class="inline-flex items-center gap-2 rounded-xl bg-reg-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
            >
              {#if pwSaving}
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Saving…
              {:else}
                <Save size={14} /> Update Password
              {/if}
            </button>
            <button type="button" onclick={() => { showPasswordForm = false; pwError = ''; currentPassword = ''; newPassword = ''; confirmNewPassword = ''; }}
              class="rounded-xl px-4 py-3 text-sm font-semibold text-reg-muted hover:bg-sand-warm/50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}
  </div>
{/if}
