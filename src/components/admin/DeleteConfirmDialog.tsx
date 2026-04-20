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

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa?",
  description = "Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.",
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center gap-2 pt-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900">{title}</DialogTitle>
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
            Hủy bỏ
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
                ĐANG XÓA
              </>
            ) : (
              "XÁC NHẬN XÓA"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
