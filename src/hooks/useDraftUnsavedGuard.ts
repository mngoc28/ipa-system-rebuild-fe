import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

/**
 * Configuration options for the draft persistence hook.
 */
interface UseDraftUnsavedGuardOptions<TValue> {
  /** Whether the preservation logic is active for the current context. */
  enabled: boolean;
  /** The unique key used to partition this draft in localStorage. */
  storageKey: string;
  /** The current live state value to be persisted. */
  value: TValue;
  /** The baseline value used to determine if the state has changed. */
  initialValue: TValue;
  /** Flag to suppress the 'unsaved changes' warning during legitimate submissions. */
  isSubmitting?: boolean;
  /** Optional notification message shown when a draft is recovered. */
  restoreToastMessage?: string;
  /** Unique ID for the restoration toast to prevent duplication. */
  restoreToastId?: string;
  /** Callback triggered when a saved draft is successfully parsed and loaded. */
  onRestore: (value: TValue) => void;
}

/**
 * Return type providing the dirty state and a manual cleanup method.
 */
interface UseDraftUnsavedGuardResult {
  /** true if current value differs from initialValue. */
  isDirty: boolean;
  /** Silently removes the draft from localStorage. */
  clearDraft: () => void;
}

/**
 * Hook to automatically persist form/state drafts to localStorage and provide
 * a 'beforeunload' guard to prevent accidental loss of unsaved changes.
 * 
 * @param options - Configuration for persistence and restoration.
 * @returns State indicating if the data is modified and a function to purge the draft.
 */
export function useDraftUnsavedGuard<TValue>({
  enabled,
  storageKey,
  value,
  initialValue,
  isSubmitting = false,
  restoreToastMessage,
  restoreToastId = "draft-restored",
  onRestore,
}: UseDraftUnsavedGuardOptions<TValue>): UseDraftUnsavedGuardResult {
  const serializedCurrentValue = useMemo(() => JSON.stringify(value), [value]);
  const serializedInitialValue = useMemo(() => JSON.stringify(initialValue), [initialValue]);
  const isDirty = serializedCurrentValue !== serializedInitialValue;

  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const rawDraft = window.localStorage.getItem(storageKey);
    if (!rawDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(rawDraft) as TValue;
      onRestoreRef.current(parsed);

      if (restoreToastMessage) {
        toast.info(restoreToastMessage, { id: restoreToastId });
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [enabled, storageKey, restoreToastId, restoreToastMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.localStorage.setItem(storageKey, serializedCurrentValue);
  }, [enabled, serializedCurrentValue, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled || !isDirty || isSubmitting) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, isDirty, isSubmitting]);

  const clearDraft = () => {
    window.localStorage.removeItem(storageKey);
  };

  return {
    isDirty,
    clearDraft,
  };
}