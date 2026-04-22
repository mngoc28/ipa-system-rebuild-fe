import { useMemo, useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Mail, Building2, ShieldCheck, Save, Camera, Phone } from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/api/profileApi";
import { AvatarCropper } from "@/components/shared/AvatarCropper";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [unit, setUnit] = useState(user?.unit ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state if AppShell's background fetch updates the user later
  useEffect(() => {
    if (user) {
      if (!fullName && user.fullName) setFullName(user.fullName);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (!unit && user.unit) setUnit(user.unit);
    }
  }, [user]);

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case "Admin":
        return "Quản trị hệ thống";
      case "Director":
        return "Lãnh đạo thành phố";
      case "Manager":
        return "Trưởng phòng";
      case "Staff":
        return "Chuyên viên";
      default:
        return "Người dùng";
    }
  }, [user?.role]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateProfile({ fullName, email, phone });
      updateUser({ fullName, email, phone, unit });
      toast.success("Đã cập nhật thông tin hồ sơ.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedFile: File) => {
    setIsUploading(true);
    try {
      const response = await profileApi.updateAvatar(croppedFile);
      if (response.data?.avatar_url) {
        updateUser({ avatar: response.data.avatar_url });
        toast.success("Đã cập nhật ảnh đại diện.");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Không thể tải lên ảnh đại diện.");
    } finally {
      setIsUploading(false);
      setCropImage(null);
    }
  };



  return (
    <div className="mx-auto max-w-3xl space-y-6 duration-500 animate-in fade-in">
      <div className="rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm">
        <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm font-medium text-brand-text-dark/40">Quản lý thông tin tài khoản và đơn vị công tác.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-brand-dark/10 bg-white p-5 shadow-sm md:col-span-1">
          <div className="group relative mx-auto size-24">
            <div className="relative size-full overflow-hidden rounded-full border-4 border-brand-dark/5 bg-brand-dark/[0.02] shadow-sm ring-1 ring-brand-dark/10">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  className="size-full object-cover"
                  alt="Profile"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                  }}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <User size={36} className="text-brand-text-dark/40" />
                </div>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] duration-200 animate-in fade-in">
                  <LoadingSpinner variant="small" />
                  <span className="mt-1 text-[8px] font-black uppercase tracking-tighter text-primary">Tải lên...</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-white transition-all active:scale-95",
                isUploading ? "opacity-50 cursor-not-allowed scale-90" : "hover:scale-110"
              )}
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-bold tracking-tight text-brand-text-dark">{user?.fullName ?? "Người dùng"}</p>
            <div className="mt-1 flex items-center justify-center gap-1">
               <span className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/10">
                 {roleLabel}
               </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-brand-text-dark/40">@{user?.username}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-brand-dark/10 bg-white p-5 shadow-sm md:col-span-2">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40">
              <User size={14} /> Họ và tên
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 w-full rounded-lg border border-brand-dark/10 px-3 text-sm text-brand-text-dark outline-none transition focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40">
              <Mail size={14} /> Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-brand-dark/10 px-3 text-sm text-brand-text-dark outline-none transition focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40">
              <Phone size={14} /> Số điện thoại
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-lg border border-brand-dark/10 px-3 text-sm text-brand-text-dark outline-none transition focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40">
              <Building2 size={14} /> Đơn vị
            </span>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled
              className="h-11 w-full cursor-not-allowed rounded-lg border border-brand-dark/10 bg-brand-dark/[0.01] px-3 text-sm text-brand-text-dark/60 outline-none"
            />
          </label>

          <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} /> Quyền hiện tại: {user?.role}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn("inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-primary/90", isSaving && "opacity-70 cursor-not-allowed")}
          >
            {isSaving ? <LoadingSpinner variant="small" className="text-white" /> : <Save size={14} />} 
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <Dialog open={!!cropImage} onOpenChange={(open) => !open && setCropImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {cropImage && (
              <AvatarCropper 
                image={cropImage} 
                onCropComplete={onCropComplete} 
                onCancel={() => setCropImage(null)}
                isUploading={isUploading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
