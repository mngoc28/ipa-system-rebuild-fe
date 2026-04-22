import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onOpenChange, onConfirm }: LogoutConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-brand-dark/10 shadow-2xl sm:max-w-md">
        <DialogHeader className="items-center sm:items-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-rose-100/50 bg-rose-50 text-rose-600 shadow-sm">
            <LogOut size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-black uppercase tracking-tight text-brand-dark">
            Xác nhận đăng xuất
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-[280px] text-center font-medium text-slate-500">
            Bạn có chắc chắn muốn thoát khỏi hệ thống không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 sm:w-32"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full rounded-xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 sm:w-32"
          >
            Đăng xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
