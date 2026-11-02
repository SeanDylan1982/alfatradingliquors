import { toast } from "sonner";

export function describeError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function showError(error: unknown) {
  toast.error(describeError(error));
}
