import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="size-6 text-rose-500" />,
          button: "bg-rose-500 hover:bg-rose-600 text-white",
          iconBg: "bg-rose-50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="size-6 text-amber-500" />,
          button: "bg-amber-500 hover:bg-amber-600 text-white",
          iconBg: "bg-amber-50",
        };
      case "info":
      case "primary":
        return {
          icon: <AlertTriangle className="size-6 text-primary" />,
          button: "bg-primary hover:bg-primary/90 text-white",
          iconBg: "bg-primary/10",
        };
      default:
        return {
          icon: <AlertTriangle className="size-6 text-primary" />,
          button: "bg-primary hover:bg-primary/90 text-white",
          iconBg: "bg-primary/10",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-[440px]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="space-y-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="leading-relaxed text-slate-500">
                {description}
              </DialogDescription>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 bg-slate-50 p-4 sm:flex-row-reverse sm:justify-start">
          <Button
            type="button"
            className={`px-6 font-bold transition-all active:scale-95 ${styles.button}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-6 font-bold text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700"
            onClick={onClose}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
