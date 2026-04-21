import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Props for the DeleteConfirmDialog component.
 */
interface DeleteConfirmDialogProps {
  /** Whether the dialog is visible. */
  isOpen: boolean;
  /** Callback triggered when the dialog is dismissed or canceled. */
  onClose: () => void;
  /** Callback triggered when the deletion is confirmed. */
  onConfirm: () => void;
  /** Optional title for the dialog. Defaults to English equivalent of "Confirm delete?". */
  title?: string;
  /** Optional detailed description for the dialog. */
  description?: string;
  /** Whether a deletion operation is currently in progress. */
  loading?: boolean;
}

/**
 * A modal dialog used to confirm destructive deletion actions.
 * Features a rose-colored warning theme and localized English labels.
 */
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete?",
  description = "This action cannot be undone. This will permanently delete the data from the system.",
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center gap-2 pt-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-brand-text-dark">{title}</DialogTitle>
          <DialogDescription className="text-center text-sm font-medium text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-row gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-10 flex-1 text-[10px] font-black uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 flex-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                DELETING...
              </>
            ) : (
              "CONFIRM DELETE"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
