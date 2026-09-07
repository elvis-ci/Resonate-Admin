
export function normalizeSupabaseError(error: any) {
  if (error.code === "23505") {
    if (error.message.includes("locations_slug_unique")) {
      return {
        code: "LOCATION_EXISTS",
        message: "A location with this name already exists.",
      };
    }

    return {
      code: "DUPLICATE",
      message: "This information already exists.",
    };
  }

  if (error.code === "23503") {
    return {
      code: "REFERENCE_ERROR",
      message: "This item cannot be deleted because it is being used elsewhere.",
    };
  }

  if (error.code === "42501") {
    return {
      code: "PERMISSION_DENIED",
      message: "You don't have permission to perform this action.",
    };
  }

  return {
    code: "UNKNOWN",
    message: "Something went wrong. Please try again.",
  };
}