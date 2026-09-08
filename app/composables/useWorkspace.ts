// composables/useWorkspaceStatusConfirmation.ts

import type { Database } from "~/types/database";
import { normalizeSupabaseError } from "~/utils/errors";

type WorkspaceRow = {
  id: string;
  name: string | null;
  status: string | null;
};

export function useWorkspaceStatusConfirmation() {
  const supabase = useSupabaseClient<Database>();

  const isConfirmModalOpen = ref(false); //modal control
  const isTogglingWorkspace = ref(false); 
  const updateError = ref<string | null>(null);
  const currentWorkspace = ref<WorkspaceRow | null>(null); //workspace being updated

  //returns true if current workspace is inactive. nec3essary for deriving moddal title and subtexts and button texts
  const isCurrentWorkspaceInactive = computed(
    () => currentWorkspace.value?.status === "inactive",
  );

  //sets dynamic modal title
  const confirmModalTitle = computed(() =>
    isCurrentWorkspaceInactive.value
      ? "Activate workspace?"
      : "Deactivate workspace?",
  );

  // sets dynamic modal subtext
  const confirmModalMessage = computed(() => {
    const name = currentWorkspace.value?.name || "This workspace";

    return isCurrentWorkspaceInactive.value
      ? `${name} will become bookable again immediately.`
      : `${name} will be disabled for new bookings until reactivated.`;
  });

  //fired by status button to open modal
  function toggleStatusUpdate(workspace: WorkspaceRow) {
    currentWorkspace.value = workspace;
    updateError.value = null;
    isConfirmModalOpen.value = true;
  }

  //status update function.
  async function updateWorkspaceStatus(
    workspaceId: string,
    status: "active" | "inactive",
  ) {
    const { error } = await supabase
      .from("workspaces")
      .update({ status })
      .eq("id", workspaceId);

    if (error) {
      throw error;
    }
  }

  //fired when modal actyion is confirmed
  async function confirmStatusUpdate() {
    if (!currentWorkspace.value) return false;

    isTogglingWorkspace.value = true;
    updateError.value = null;

    //the status to be set (if current status in inactive then the status to be set is "active" and vice versa)
    const nextStatus = isCurrentWorkspaceInactive.value
      ? "active"
      : "inactive";

    try {
      await updateWorkspaceStatus(
        currentWorkspace.value.id,
        nextStatus,
      );

      isConfirmModalOpen.value = false;
      currentWorkspace.value = null;

      return true;
    } catch (err) {
      updateError.value = normalizeSupabaseError(err).message; //sets error message shown in the modal

      return false;
    } finally {
      isTogglingWorkspace.value = false;
    }
  }

  return {
    isConfirmModalOpen,
    isTogglingWorkspace,
    updateError,

    isCurrentWorkspaceInactive,
    confirmModalTitle,
    confirmModalMessage,

    toggleStatusUpdate,
    confirmStatusUpdate,
    updateWorkspaceStatus,
  };
}