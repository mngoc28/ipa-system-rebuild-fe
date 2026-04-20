import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { ROUTERS } from "../constant";

/**
 * Navigates the application to the 404 Not Found page.
 * @param navigate - Router navigation function from useNavigate hook.
 * @param replace - Whether to replace the current entry in the history stack.
 */
export const redirectTo404 = (navigate: NavigateFunction, replace: boolean = true): void => {
  navigate(ROUTERS.NOT_FOUND, { replace });
};

/**
 * Validates a numeric ID; redirects to 404 if invalid (missing, non-finite, or non-positive).
 * @param id - The ID string to validate.
 * @param navigate - Router navigation function for redirection.
 * @returns boolean - true if ID is valid, false otherwise.
 */
export const validateIdOrRedirect = (id: string | undefined, navigate: NavigateFunction): boolean => {
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    redirectTo404(navigate);
    return false;
  }
  return true;
};

/**
 * Global handler for displaying error messages via toast notifications.
 * Supports both simple strings and Laravel-style validation error structures.
 * @param message - The error message or a map of field-specific error arrays.
 */
export const handleError = (message: string | Record<string, string[]>) => {
  if (typeof message === 'object') {
    Object.values(message).forEach(messages => {
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          toast.error(msg);
        });
      }
    });
    return;
  }
  toast.error(message);
};