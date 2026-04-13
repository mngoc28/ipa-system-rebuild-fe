import { useState } from "react";
import { Bell, Search, Menu, User, Settings, LogOut, ChevronDown, Globe, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const [language, setLanguage] = useState<"VI" | "EN">("VI");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white bg-white/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <div className="relative hidden w-72 items-center md:flex lg:w-96">
          <Search className="absolute left-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đoàn, đối tác, tài liệu..."
            className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Create - Staff Only */}
        {user?.role === "Staff" && (
          <Link to="/delegations/create" className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 sm:flex">
            <Plus size={14} />
            Tạo đoàn
          </Link>
        )}

        {/* Language Toggle */}
        <button onClick={() => setLanguage(language === "VI" ? "EN" : "VI")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100">
          <Globe size={16} />
          <span className="text-[10px] font-black tracking-widest">{language}</span>
          <ChevronDown size={12} className="text-slate-300" />
        </button>

        {/* Notifications */}
        <Link to="/notifications" className="group relative rounded-lg p-2.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-100">
          <Bell size={18} className="transition-transform group-hover:rotate-12" />
          <span className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-[8px] font-black text-white">5</span>
        </Link>

        <div className="mx-2 hidden h-6 w-px bg-slate-100 sm:block" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{user?.fullName || "User Name"}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{user?.role || "Guest"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-slate-100 shadow-sm transition-all hover:border-primary/20">
                {user?.avatar ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" /> : <User size={20} className="text-slate-400" />}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-64 rounded-xl border-slate-200 p-2 shadow-2xl">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem asChild className="rounded-lg">
              <Link to="/profile" className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <User size={16} className="text-slate-400" />
                Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg">
              <Link to="/profile?tab=settings" className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Settings size={16} className="text-slate-400" />
                Cài đặt hệ thống
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem onClick={logout} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600 transition-colors">
              <LogOut size={16} />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
