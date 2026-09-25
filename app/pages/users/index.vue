<script setup lang="ts">
import type { Database } from "~/types/database";

definePageMeta({
  title: "Users",
  heading: "User management",
  subtext: "Manage admin accounts, roles, and access.",
  ssr: false,
});

const supabase = useSupabaseClient<Database>();
const { scopedLocations } = useScopedLocation();
const { can, pending: permissionsPending } = usePermissions();
const { data: currentUser } = useAsyncData("current-auth-user", async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
});

type AdminRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  location_id: number | null;
  is_active: boolean;
  created_at: string | null;
  locations: { id: number; location: string } | null;
};

const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const locationFilter = ref<number | null>(null);
const page = ref(1);
const pageSize = 20;

const {
  data: admins,
  pending,
  error,
  refresh,
} = useLazyAsyncData<AdminRow[]>(
  "admin-users",
  async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, phone, role, location_id, is_active, created_at, locations ( id, location )",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as AdminRow[];
  },
  { immediate: !permissionsPending.value },
);

watch(permissionsPending, (stillPending) => {
  if (!stillPending) refresh();
});

const filteredAdmins = computed(() => {
  const search = searchQuery.value.trim().toLowerCase();
  return (admins.value ?? []).filter((a) => {
    const matchesSearch =
      !search ||
      (a.full_name ?? "").toLowerCase().includes(search) ||
      a.email.toLowerCase().includes(search);
    const matchesRole = !roleFilter.value || a.role === roleFilter.value;
    const matchesStatus =
      !statusFilter.value ||
      (statusFilter.value === "active" ? a.is_active : !a.is_active);
    const matchesLocation =
      locationFilter.value == null || a.location_id === locationFilter.value;
    return matchesSearch && matchesRole && matchesStatus && matchesLocation;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAdmins.value.length / pageSize)),
);
const paginatedAdmins = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredAdmins.value.slice(start, start + pageSize);
});

watch([searchQuery, roleFilter, statusFilter, locationFilter], () => {
  page.value = 1;
});

const isInviteModalOpen = ref(false);
const isEditModalOpen = ref(false);
const editingAdmin = ref<AdminRow | null>(null);
const isToggling = ref<string | null>(null); // id currently being toggled
const toggleError = ref<string | null>(null);

function openEdit(admin: AdminRow) {
  editingAdmin.value = admin;
  isEditModalOpen.value = true;
}

async function toggleActive(admin: AdminRow) {
  isToggling.value = admin.id;
  toggleError.value = null;

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !admin.is_active })
    .eq("id", admin.id);

  isToggling.value = null;

  if (error) {
    toggleError.value =
      error.code === "42501"
        ? "You don't have permission to change this."
        : "Unable to update status. Please try again.";
    return;
  }

  await refresh();
}

const roleBadgeClass: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  super_admin: "bg-primary/10 text-primary",
};
</script>

<template>
  <section class="space-y-6 pb-4 max-w-screen">
    <article
      v-if="!permissionsPending && !can('view_users')"
      class="rounded-2xl bg-alt-bg2 p-10 shadow-elev text-center"
    >
      <p class="text-sm text-muted">You don't have permission to view users.</p>
    </article>

    <template v-else>
      <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <label class="block w-full max-w-md space-y-2 text-sm">
            <span class="font-medium text-heading">Search</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Name or email..."
              class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div class="grid w-full gap-3 sm:grid-cols-3 xl:max-w-2xl">
            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Role</span>
              <select
                v-model="roleFilter"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Status</span>
              <select
                v-model="statusFilter"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label class="space-y-2 text-sm">
              <span class="font-medium text-heading">Location</span>
              <select
                v-model="locationFilter"
                class="w-full rounded-xl border border-border bg-bg px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option :value="null">All locations</option>
                <option
                  v-for="location in scopedLocations"
                  :key="location.id"
                  :value="location.id"
                >
                  {{ location.location }}
                </option>
              </select>
            </label>
          </div>

          <button
            v-if="can('manage_users')"
            type="button"
            class="primary"
            @click="isInviteModalOpen = true"
          >
            Invite admin
          </button>
        </div>
      </article>

      <p
        v-if="error"
        class="rounded-2xl bg-alt-bg2 p-5 text-sm text-error-text shadow-elev"
      >
        Unable to load users: {{ error.message }}
      </p>
      <p
        v-if="toggleError"
        class="rounded-2xl bg-alt-bg2 p-5 text-sm text-error-text shadow-elev"
      >
        {{ toggleError }}
      </p>

      <article class="rounded-2xl bg-alt-bg2 p-5 shadow-elev">
        <div class="overflow-x-auto">
          <table class="w-full min-w-225 text-left text-sm">
            <thead
              class="sticky top-0 z-10 border-b border-border bg-border text-xs uppercase tracking-wider text-muted"
            >
              <tr>
                <th class="px-3 py-3 font-semibold">Name</th>
                <th class="px-3 py-3 font-semibold">Email</th>
                <th class="px-3 py-3 font-semibold">Role</th>
                <th class="px-3 py-3 font-semibold">Location</th>
                <th class="px-3 py-3 font-semibold">Status</th>
                <th class="px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="pending" v-for="i in 6" :key="i">
                <td v-for="c in 6" :key="c" class="px-3 py-4">
                  <div class="h-4 animate-pulse rounded bg-muted/20"></div>
                </td>
              </tr>

              <tr
                v-else-if="paginatedAdmins.length"
                v-for="admin in paginatedAdmins"
                :key="admin.id"
                class="hover:bg-card-bg2/60 odd:bg-card-bg even:bg-card-bg2/40"
              >
                <td class="px-3 py-4 font-medium text-heading">
                  {{ admin.full_name || "—" }}
                  <span
                    v-if="admin.id === currentUser?.id"
                    class="ml-1 text-xs text-muted"
                    >(you)</span
                  >
                </td>
                <td class="px-3 py-4 text-body">{{ admin.email }}</td>
                <td class="px-3 py-4">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold capitalize"
                    :class="roleBadgeClass[admin.role]"
                  >
                    {{ admin.role.replace("_", " ") }}
                  </span>
                </td>
                <td class="px-3 py-4 text-body">
                  {{ admin.locations?.location ?? "—" }}
                </td>
                <td class="px-3 py-4">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold"
                    :class="
                      admin.is_active
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    "
                  >
                    {{ admin.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td class="px-3 py-4">
                  <div v-if="can('manage_users')" class="flex gap-2">
                    <button
                      type="button"
                      class="secondary"
                      @click="openEdit(admin)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      :class="
                        admin.is_active
                          ? 'border-danger text-danger hover:bg-danger/10'
                          : 'border-success text-success hover:bg-success/10'
                      "
                      :disabled="
                        isToggling === admin.id || admin.id === currentUser?.id
                      "
                      :title="
                        admin.id === currentUser?.id
                          ? 'You cannot deactivate your own account'
                          : ''
                      "
                      @click="toggleActive(admin)"
                    >
                      {{ admin.is_active ? "Deactivate" : "Reactivate" }}
                    </button>
                  </div>
                  <span v-else class="text-xs text-muted">—</span>
                </td>
              </tr>

              <tr v-else>
                <td colspan="6" class="p-10 text-center text-sm text-muted">
                  No users match the current filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-4 text-sm text-muted">
          <span>{{ filteredAdmins.length }} users</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="secondary"
              :disabled="page === 1"
              @click="page = Math.max(1, page - 1)"
            >
              Previous
            </button>
            <span>Page {{ page }} of {{ totalPages }}</span>
            <button
              type="button"
              class="secondary"
              :disabled="page === totalPages"
              @click="page = Math.min(totalPages, page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </article>
    </template>

    <InviteAdminModal
      v-model="isInviteModalOpen"
      :locations="scopedLocations ?? []"
      @invited="refresh"
    />
    <EditAdminModal
      v-model="isEditModalOpen"
      :admin="editingAdmin"
      :locations="scopedLocations ?? []"
      @updated="refresh"
    />
  </section>
</template>
