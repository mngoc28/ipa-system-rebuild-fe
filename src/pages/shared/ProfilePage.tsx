import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Mail, Building2, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [unit, setUnit] = useState(user?.unit ?? "");

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

  const handleSave = () => {
    updateUser({ fullName, email, unit });
    toast.success("Đã cập nhật thông tin hồ sơ.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-title text-2xl font-black uppercase tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Quản lý thông tin tài khoản và đơn vị công tác.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <User size={36} className="text-slate-500" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-black uppercase tracking-tight text-slate-900">{user?.fullName ?? "Người dùng"}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-primary">{roleLabel}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">{user?.username}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <User size={14} /> Họ và tên
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <Mail size={14} /> Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <Building2 size={14} /> Đơn vị
            </span>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary/30"
            />
          </label>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} /> Quyền hiện tại: {user?.role}
            </span>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-primary/90"
          >
            <Save size={14} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
