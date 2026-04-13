import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ChangePasswordFirstTime() {
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const requirements = useMemo(
    () => [
      { label: "Tối thiểu 8 ký tự", met: passwords.new.length >= 8 },
      { label: "Có ít nhất 1 chữ hoa", met: /[A-Z]/.test(passwords.new) },
      { label: "Có ít nhất 1 số", met: /[0-9]/.test(passwords.new) },
      { label: "Có ít nhất 1 ký tự đặc biệt", met: /[^A-Za-z0-9]/.test(passwords.new) },
    ],
    [passwords.new],
  );

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: "Rất yếu", color: "bg-slate-200", score: 0 };
    if (metCount <= 1) return { label: "Yếu", color: "bg-destructive", score: 1 };
    if (metCount <= 2) return { label: "Trung bình", color: "bg-amber-500", score: 2 };
    if (metCount <= 3) return { label: "Mạnh", color: "bg-secondary", score: 3 };
    return { label: "Rất mạnh", color: "bg-emerald-600", score: 4 };
  }, [requirements]);

  const canSubmit = requirements.every((r) => r.met) && passwords.new === passwords.confirm && passwords.new !== "";

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đã cập nhật mật khẩu mới thành công!");
      navigate("/ui/dashboard");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[500px]">
        {/* Header Branding */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20">IPA</div>
          <h1 className="border-l border-slate-300 pl-3 font-title text-xl font-black text-slate-900">ĐÀ NẴNG</h1>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50 md:p-12">
          {/* Decorative bar */}
          <div className="absolute left-0 right-0 top-0 h-2 bg-primary/10" />

          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-4 ring-primary/5">
              <ShieldCheck size={32} />
            </div>
            <h2 className="mb-3 font-title text-2xl font-extrabold text-slate-900">Cập nhật mật khẩu mới</h2>
            <p className="mx-auto max-w-[320px] text-sm leading-relaxed text-slate-500">Để bảo vệ tài khoản, hãy đặt mật khẩu mới trước khi bắt đầu sử dụng hệ thống IPA.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-slate-700">Mật khẩu mới</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-primary">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-12 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  placeholder="Nhập mật khẩu mới"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="pt-2">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Độ bảo mật</span>
                  <span className={cn("text-[10px] font-bold uppercase", passwords.new ? "text-slate-700" : "text-slate-400")}>{passwords.new ? strength.label : "---"}</span>
                </div>
                <div className="flex h-1.5 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= strength.score ? strength.color : "bg-slate-100")} />
                  ))}
                </div>
              </div>

              {/* Requirements List */}
              <div className="grid grid-cols-2 gap-y-2 px-1 pt-3">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={cn("transition-colors", req.met ? "text-secondary" : "text-slate-300")} />
                    <span className={cn("text-[11px] font-medium transition-colors", req.met ? "text-slate-700" : "text-slate-400")}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-primary">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={cn(
                    "block w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-12 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10",
                    passwords.confirm && passwords.new !== passwords.confirm && "border-destructive focus:border-destructive focus:ring-destructive/10",
                  )}
                  placeholder="Xác nhận lại mật khẩu"
                />
              </div>
              {passwords.confirm && passwords.new !== passwords.confirm && <p className="ml-1 text-[11px] font-semibold text-destructive">Mật khẩu xác nhận không khớp!</p>}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/95 active:translate-y-0",
                (!canSubmit || isLoading) && "transform-none cursor-not-allowed bg-slate-400 opacity-50 shadow-none",
              )}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Xác nhận thay đổi
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-400">
          <Lock size={12} />
          Kết nối được mã hóa 256-bit chuẩn an ninh chính phủ
        </p>
      </div>
    </div>
  );
}
