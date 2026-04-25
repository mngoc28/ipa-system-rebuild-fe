import logoBrand from "@/assets/logo-brand.png";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Globe, ChevronDown } from "lucide-react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLoginMutation } from "@/hooks/useAuthQuery";
import { getLoginRedirectPath } from "@/lib/routeHelpers";
import { setAccessToken, setRefreshToken } from "@/utils/storage";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isVneidLoading, setIsVneidLoading] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotValue, setForgotValue] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const mapRole = (roles: string[]): UserRole => {
    const primaryRole = (roles[0] || "").toLowerCase();
    if (primaryRole === "staff") return "Staff";
    if (primaryRole === "manager") return "Manager";
    if (primaryRole === "director") return "Director";
    return "Admin";
  };

  const getErrorMessage = (error: unknown): string => {
    const maybeAxiosError = error as {
      response?: {
        data?: {
          error?: { message?: string } | string;
          message?: string;
        };
        status?: number;
      };
      message?: string;
    };

    const responseError = maybeAxiosError?.response?.data?.error;
    if (typeof responseError === "string" && responseError.trim()) {
      return responseError;
    }

    return (
      (typeof responseError === "object" ? responseError?.message : undefined) ||
      maybeAxiosError?.response?.data?.message ||
      maybeAxiosError?.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu."
    );
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        usernameOrEmail: username.trim(),
        password,
      });

      const payload = result;
      const role = mapRole(payload.user?.role_codes || []);
      const normalizedUser = {
        id: payload.user.id,
        username: username.trim().toLowerCase(),
        fullName: payload.user.full_name || payload.user.fullName || "",
        email: payload.user.email,
        role,
        unit: payload.user.unit?.unit_name || payload.user.unit?.name || "",
        avatar: payload.user.avatar_url || payload.user.avatar || "",
        phone: payload.user.phone || "",
        permissions: payload.user.permission_codes || [],
      };

      setAccessToken(payload.accessToken);
      setRefreshToken(payload.refreshToken);
      login(normalizedUser, payload.accessToken);
      toast.success(`Đăng nhập thành công với quyền ${role}!`);
      navigate(getLoginRedirectPath(role), { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };


  const isSubmitting = loginMutation.isPending || isLoading;

  const handleForgotPassword = async () => {
    const emailOrUsername = forgotValue.trim();
    if (!emailOrUsername) {
      toast.error("Vui lòng nhập email hoặc tên đăng nhập để nhận hướng dẫn đặt lại mật khẩu.");
      return;
    }

    setIsSendingReset(true);
    window.setTimeout(() => {
      setIsSendingReset(false);
      toast.success(`Đã gửi hướng dẫn đặt lại mật khẩu tới tài khoản ${emailOrUsername}.`);
      setShowForgotForm(false);
      setForgotValue("");
    }, 800);
  };

  const handleVneidLogin = () => {
    setIsVneidLoading(true);
    window.setTimeout(() => {
      setIsVneidLoading(false);
      toast.info("Tính năng đăng nhập VNeID đang trong giai đoạn tích hợp với cổng SSO. Vui lòng dùng đăng nhập tài khoản nội bộ.");
    }, 700);
  };

  return (
    <main className="flex min-h-screen overflow-hidden bg-brand-dark/[0.02] font-sans antialiased">
      {/* Left Column: Branding (45%) */}
      <section className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-[45%]">
        <div className="absolute inset-0 z-0">
          <img 
            className="size-full object-cover brightness-50 contrast-125" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdvmaQVFgFiYfS03odpVko0lSI8HS3ffl5sxvKJGDEe8uLq7p2eV_CquvvvmJYbHqHR09I_2fwkczFcmQyuu4yhoGBaOYM3HZz_50QIq7Lq8S6jjUy4QWtPLTkyWEetaOLTId-ShTFh0B_dQvLndVEwd1tqiTOkVNLDml0dU10NclFPQjoHpZ_dyYAB2hpbhFB3N4HmSVynGEnKApctxlYUPiO0OTnL33R3C_832kvEiQtK4Ssato8OwHEmrunQoicP4gBk6t0a00"
            alt="Da Nang Skyline"
          />
          {/* Decorative overlay for branding column */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003fb1]/90 to-[#003fb1]/40 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full space-y-12 px-16">
          {/* Government Logo Container */}
          <div className="flex items-center space-x-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-md">
              <img 
                className="size-14 object-contain" 
                src={logoBrand} 
                alt="Da Nang Emblem" 
              />
            </div>
            <div className="border-l border-white/20 pl-6 text-white">
              <p className="text-lg font-bold uppercase leading-tight tracking-tight">ỦY BAN NHÂN DÂN</p>
              <p className="text-2xl font-black uppercase tracking-tight">THÀNH PHỐ ĐÀ NẴNG</p>
            </div>
          </div>

          {/* Strategic Messaging */}
          <div className="space-y-6">
            <h1 className="font-title text-5xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-sm">
              Hệ thống Quản lý <br/>Xúc tiến Đầu tư
            </h1>
            <div className="h-1 w-24 bg-emerald-400"></div>
            <p className="text-xl font-light italic tracking-wide text-blue-100">
              "Nâng tầm đầu tư, phát triển bền vững"
            </p>
          </div>

          {/* Institutional Trust Badges */}
          <div className="flex gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Cơ quan thực hiện</p>
              <p className="text-sm font-bold text-white">IPA Đà Nẵng</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">Phiên bản</p>
              <p className="text-sm font-bold uppercase tracking-widest text-white">v2.4.0 High-Level</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Login Form (55%) */}
      <section className="relative flex w-full flex-col items-center justify-center bg-[#f9f9ff] px-6 lg:w-[55%] lg:px-24">
        {/* Language Selector Sticky Corner */}
        <div className="absolute right-8 top-8 flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-text-dark/40 transition-colors hover:text-primary">
            <Globe className="text-sm" size={16} />
            <span>Tiếng Việt</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Login Card Container */}
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="mb-2 font-title text-3xl font-black text-brand-text-dark">Chào mừng trở lại</h2>
            <p className="text-sm font-medium text-brand-text-dark/40">Vui lòng đăng nhập để truy cập hệ thống quản lý.</p>
          </div>

          <div className="group/card relative overflow-hidden rounded-[1.25rem] border border-brand-dark/10 bg-white p-10 shadow-[0_20px_50px_rgba(18,28,42,0.05)] transition-all">
            <form onSubmit={handleLogin} className="relative z-10 space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="ml-1 block text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40" htmlFor="username">Tên đăng nhập</label>
                <div className="group relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-dark/20 transition-colors group-focus-within:text-primary">
                    <User size={18} />
                  </span>
                  <input 
                    className="block w-full rounded-xl border-none bg-brand-dark/[0.04] py-4 pl-12 pr-4 text-sm font-medium text-brand-text-dark outline-none transition-all placeholder:text-brand-text-dark/30 focus:ring-2 focus:ring-primary/20" 
                    id="username" 
                    name="username" 
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder="Nhập email hoặc tên người dùng" 
                    type="text"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40" htmlFor="password">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotForm((prev) => !prev);
                      setForgotValue(username.trim());
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="group relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-dark/20 transition-colors group-focus-within:text-primary">
                    <Lock size={18} />
                  </span>
                  <input 
                    className="block w-full rounded-xl border-none bg-brand-dark/[0.04] px-12 py-4 text-sm font-medium text-brand-text-dark outline-none transition-all placeholder:text-brand-text-dark/30 focus:ring-2 focus:ring-primary/20" 
                    id="password" 
                    name="password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-text-dark/30 transition-colors hover:text-primary" 
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="ml-1 flex items-center space-x-3">
                <input className="size-4 cursor-pointer rounded-md border-brand-dark/10 text-primary focus:ring-primary/20" id="remember" name="remember" type="checkbox"/>
                <label className="cursor-pointer select-none text-[11px] font-black uppercase tracking-widest text-brand-text-dark/40" htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>

              {showForgotForm && (
                <div className="space-y-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Khôi phục mật khẩu</p>
                  <input
                    value={forgotValue}
                    onChange={(event) => setForgotValue(event.target.value)}
                    placeholder="Nhập email hoặc tên đăng nhập"
                    className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-semibold text-brand-text-dark/80 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isSendingReset}
                      className="rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 disabled:opacity-60"
                    >
                      {isSendingReset ? "Đang gửi..." : "Gửi hướng dẫn"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotForm(false)}
                      className="rounded-lg border border-brand-dark/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/60 hover:bg-brand-dark/[0.02]"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button 
                className={cn(
                  "w-full bg-primary text-white font-black text-xs uppercase tracking-[0.15em] py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3",
                  isSubmitting && "opacity-80 cursor-not-allowed"
                )}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {isSubmitting ? "Đang xác thực..." : "Đăng nhập"}
              </button>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" aria-live="polite">
                  {loginError}
                </div>
              )}

              {/* Social Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-dark/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-white px-4 text-brand-text-dark/20">HOẶC</span>
                </div>
              </div>

              {/* VNeID Integration */}
              <button 
                onClick={handleVneidLogin}
                className="group/vneid flex w-full items-center justify-center space-x-3 rounded-xl border-2 border-slate-50 bg-white py-4 font-bold text-[#003fb1] transition-all hover:bg-slate-50 active:scale-[0.98]" 
                type="button"
                disabled={isVneidLoading}
              >
                <img 
                    className="size-6 object-contain transition-all duration-500" 
                    src="/download.jpg" 
                  alt="VNeID Logo" 
                />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 transition-colors group-hover/vneid:text-[#003fb1]">
                  {isVneidLoading ? "Đang khởi tạo VNeID..." : "Đăng nhập bằng VNeID"}
                </span>
              </button>

            </form>
          </div>

          {/* Footer Text */}
          <div className="mt-12 space-y-2 text-center">
            <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest text-brand-text-dark/40">
              Bản quyền © 2024 Ban Xúc tiến và Hỗ trợ đầu tư Đà Nẵng (IPA Đà Nẵng).
            </p>
            <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-brand-text-dark/20">
              Trung tâm Phát triển hạ tầng CNTT - Sở TT&TT
            </p>
          </div>
        </div>

        {/* Floating Decoration */}
        <div className="pointer-events-none absolute bottom-[-100px] left-[-100px] size-64 rounded-full bg-primary/5 blur-3xl"></div>
      </section>
    </main>
  );
}
