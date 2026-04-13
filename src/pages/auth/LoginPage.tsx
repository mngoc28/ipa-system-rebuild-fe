import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Globe, ChevronDown } from "lucide-react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Determine role based on username
      let role: UserRole = "Admin";
      let fullName = "Nguyễn Văn Quản Trị";
      let email = "admin@danang.gov.vn";

      const lowerUser = username.toLowerCase();
      if (lowerUser === "staff") {
        role = "Staff";
        fullName = "Trần Thu Hà";
        email = "staff@danang.gov.vn";
      } else if (lowerUser === "manager") {
        role = "Manager";
        fullName = "Nguyễn Minh Châu";
        email = "manager@danang.gov.vn";
      } else if (lowerUser === "director") {
        role = "Director";
        fullName = "Hồ Kỳ Minh";
        email = "director@danang.gov.vn";
      }

      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: lowerUser,
        fullName,
        email,
        role,
        unit: "IPA Đà Nẵng",
      };

      login(mockUser, "mock-jwt-token-123");
      setIsLoading(false);
      toast.success(`Đăng nhập thành công với quyền ${role}!`);
      navigate("/dashboard");
    }, 1500);
  };

  const handleMockLogin = (role: UserRole, fullName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: role.toLowerCase(),
        fullName,
        email: `${role.toLowerCase()}@danang.gov.vn`,
        role: role,
        unit: "IPA Đà Nẵng",
      };
      login(mockUser, "mock-jwt-token-xyz");
      setIsLoading(false);
      toast.success(`Đăng nhập bằng quyền ${role} thành công!`);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <main className="flex min-h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* Left Column: Branding (45%) */}
      <section className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover brightness-50 contrast-125" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdvmaQVFgFiYfS03odpVko0lSI8HS3ffl5sxvKJGDEe8uLq7p2eV_CquvvvmJYbHqHR09I_2fwkczFcmQyuu4yhoGBaOYM3HZz_50QIq7Lq8S6jjUy4QWtPLTkyWEetaOLTId-ShTFh0B_dQvLndVEwd1tqiTOkVNLDml0dU10NclFPQjoHpZ_dyYAB2hpbhFB3N4HmSVynGEnKApctxlYUPiO0OTnL33R3C_832kvEiQtK4Ssato8OwHEmrunQoicP4gBk6t0a00"
            alt="Da Nang Skyline"
          />
          {/* @ts-ignore */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#003fb1]/90 to-[#003fb1]/40 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full px-16 space-y-12">
          {/* Government Logo Container */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center p-2 ring-1 ring-white/20">
              <img 
                className="w-14 h-14 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA78iF6rVKRwAlnSpF-nsDDtPdwxd3iLf8ia10TYNd6CovRi9ziKmTSgaJPXQ5wnihvrWQljSiraLcJL2HVitPrVbDs4VDN14hJyUkPIA-hLA2oMkRmQLNAjGLRN_z1bmM6YSJNacswUUGclhIzKI-LWqVZ8whVEHyM2pmoNPd7vAr6ctf6lQVE9p1IA_LRppuK9gD_MVpsJsy22oU3P-x8H7v60RnXSHlAK3Hd8JT1K6LjKBcUCeroLHDMtrg8tNB_RDp1pEh3B3Q" 
                alt="Emblem of Vietnam" 
              />
            </div>
            <div className="text-white border-l border-white/20 pl-6">
              <p className="font-bold text-lg leading-tight uppercase tracking-tight">ỦY BAN NHÂN DÂN</p>
              <p className="font-black text-2xl tracking-tight uppercase">THÀNH PHỐ ĐÀ NẴNG</p>
            </div>
          </div>

          {/* Strategic Messaging */}
          <div className="space-y-6">
            <h1 className="font-title font-black text-5xl text-white leading-tight tracking-tight drop-shadow-sm uppercase">
              Hệ thống Quản lý <br/>Xúc tiến Đầu tư
            </h1>
            <div className="h-1 w-24 bg-emerald-400"></div>
            <p className="text-blue-100 text-xl font-light tracking-wide italic">
              "Nâng tầm đầu tư, phát triển bền vững"
            </p>
          </div>

          {/* Institutional Trust Badges */}
          <div className="pt-8 flex gap-8 border-t border-white/10">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cơ quan thực hiện</p>
              <p className="text-white font-bold text-sm">IPA Đà Nẵng</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Phiên bản</p>
              <p className="text-white font-bold text-sm tracking-widest uppercase">v2.4.0 High-Level</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Login Form (55%) */}
      <section className="w-full lg:w-[55%] flex flex-col items-center justify-center px-6 lg:px-24 bg-[#f9f9ff] relative">
        {/* Language Selector Sticky Corner */}
        <div className="absolute top-8 right-8 flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-slate-500 hover:text-[#003fb1] transition-colors text-xs font-bold uppercase tracking-widest">
            <Globe className="text-sm" size={16} />
            <span>Tiếng Việt</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Login Card Container */}
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="font-title font-black text-3xl text-slate-900 mb-2">Chào mừng trở lại</h2>
            <p className="text-slate-500 text-sm font-medium">Vui lòng đăng nhập để truy cập hệ thống quản lý.</p>
          </div>

          <div className="bg-white rounded-[1.25rem] p-10 border border-slate-100 shadow-[0_20px_50px_rgba(18,28,42,0.05)] relative overflow-hidden group/card transition-all">
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="username">Tên đăng nhập</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-[#003fb1] transition-colors">
                    <User size={18} />
                  </span>
                  <input 
                    className="block w-full pl-12 pr-4 py-4 bg-[#eff3ff] border-none rounded-xl text-slate-900 placeholder:text-slate-400/50 focus:ring-2 focus:ring-[#003fb1]/20 transition-all outline-none text-sm font-medium" 
                    id="username" 
                    name="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập email hoặc tên người dùng" 
                    type="text"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest" htmlFor="password">Mật khẩu</label>
                  <button type="button" className="text-[10px] font-black text-[#003fb1] hover:underline transition-colors uppercase tracking-widest">Quên mật khẩu?</button>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-[#003fb1] transition-colors">
                    <Lock size={18} />
                  </span>
                  <input 
                    className="block w-full pl-12 pr-12 py-4 bg-[#eff3ff] border-none rounded-xl text-slate-900 placeholder:text-slate-400/50 focus:ring-2 focus:ring-[#003fb1]/20 transition-all outline-none text-sm font-medium" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003fb1] transition-colors" 
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3 ml-1">
                <input className="w-4 h-4 rounded-md border-slate-200 text-[#003fb1] focus:ring-[#003fb1]/20 cursor-pointer" id="remember" type="checkbox"/>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none" htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>

              {/* Login Button */}
              <button 
                className={cn(
                  "w-full bg-[#003fb1] text-white font-black text-xs uppercase tracking-[0.15em] py-4 rounded-xl shadow-lg shadow-blue-900/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {isLoading ? "Đang xác thực..." : "Đăng nhập"}
              </button>

              {/* Social Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-white px-4 text-slate-300">HOẶC</span>
                </div>
              </div>

              {/* VNeID Integration */}
              <button 
                className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-50 text-[#003fb1] font-bold py-4 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all group/vneid" 
                type="button"
              >
                <img 
                  className="w-6 h-6 object-contain grayscale group-hover/vneid:grayscale-0 transition-all duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJSn_CEWm46o4BCymNR0Nc9L6fddl3y6khHQm1mwbDCJRBdd9Eh2darg2fr5v8UUYUh-JyyjNjTRC9vV3mg80UAze-UzHLTzYNabKjoIwJjh3TYYBUtyaFF7sC_Q54NhHsMnQZ4wW4by3RvjVWLknv5ZCLwpGsHRLubgzbIZWecaIH7FhJq9xWnF7UITTGoQJ29RjLj3TGFEuSaDLP1LPmgsAHf5INSdaeF3g1xW8W9tBLDFE2nbVmLCdO07JnYSbKvM71Kk8hWHs" 
                  alt="VNeID Logo" 
                />
                <span className="text-[11px] uppercase font-black tracking-widest text-slate-600 group-hover/vneid:text-[#003fb1] transition-colors">Đăng nhập bằng VNeID</span>
              </button>

              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Đăng nhập nhanh (Mock QA)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMockLogin("Staff", "Trần Thu Hà")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-primary/30 hover:text-primary"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockLogin("Manager", "Nguyễn Minh Châu")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-primary/30 hover:text-primary"
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockLogin("Director", "Hồ Kỳ Minh")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-primary/30 hover:text-primary"
                  >
                    Director
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockLogin("Admin", "Nguyễn Văn Quản Trị")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-primary/30 hover:text-primary"
                  >
                    Admin
                  </button>
                </div>
                <p className="text-[10px] font-semibold text-slate-400">Tài khoản nhập tay: staff, manager, director, admin (mật khẩu bất kỳ).</p>
              </div>
            </form>
          </div>

          {/* Footer Text */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
              Bản quyền © 2024 Ban Xúc tiến và Hỗ trợ đầu tư Đà Nẵng (IPA Đà Nẵng).
            </p>
            <p className="text-[8px] text-slate-300 uppercase tracking-[0.3em] font-medium">
              Trung tâm Phát triển hạ tầng CNTT - Sở TT&TT
            </p>
          </div>
        </div>

        {/* Floating Decoration */}
        <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>
    </main>
  );
}
