import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

interface UseDraftUnsavedGuardOptions<TValue> {
  enabled: boolean;
  storageKey: string;
  value: TValue;
  initialValue: TValue;
  isSubmitting?: boolean;
  restoreToastMessage?: string;
  restoreToastId?: string;
  onRestore: (value: TValue) => void;
}

interface UseDraftUnsavedGuardResult {
  isDirty: boolean;
  clearDraft: () => void;
}

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