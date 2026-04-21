import { useState } from "react";
import { Search, Menu, User, LogOut, ChevronDown, Globe, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationModal from "@/components/notifications/NotificationModal";
import { Link } from "react-router-dom";
import logoBrand from "@/assets/logo-brand.png";

/**
 * Shared application header component.
 * Features global search, quick-action buttons (e.g., Create Delegation),
 * language toggle, notifications, and user profile dropdown.
 * 
 * @param props - Component props.
 * @param props.onMenuClick - Optional callback to trigger the mobile sidebar drawer.
 */
export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const [language, setLanguage] = useState<"VI" | "EN">("VI");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button data-testid="mobile-menu-toggle" onClick={onMenuClick} title="Mở menu điều hướng" aria-label="Mở menu điều hướng" className="rounded-md p-2 text-brand-text-dark/80 hover:bg-brand-dark/5 lg:hidden">
          <Menu size={20} />
        </button>

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand-dark/10 bg-white p-1 shadow-sm">
            <img 
              src={logoBrand} 
              alt="Da Nang Emblem" 
              className="size-full object-contain"
            />
          </div>
          <span className="text-[10px] font-black tracking-widest text-brand-text-dark">IPA</span>
        </div>

        {/* Global Search */}
        <div className="relative hidden w-72 items-center md:flex lg:w-96">
          <Search className="absolute left-3.5 text-brand-text-dark/40" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đoàn công tác, đối tác, tài liệu..."
            className="h-10 w-full rounded-xl border border-brand-dark/5 bg-brand-dark/[0.02] pl-10 pr-4 text-sm transition-all focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Create - Staff Only */}
        {user?.role === "Staff" && (
          <Link 
            to="/delegations/create" 
            className="hidden items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 sm:flex"
          >
            <Plus size={14} />
            Thêm đoàn công tác
          </Link>
        )}

        {/* Language Toggle */}
        <button onClick={() => setLanguage(language === "VI" ? "EN" : "VI")} className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-brand-text-dark/60 transition-all hover:border-brand-dark/10 hover:bg-brand-dark/[0.02] hover:text-brand-text-dark">
          <Globe size={16} />
          <span className="text-[10px] font-black tracking-widest">{language}</span>
          <ChevronDown size={12} className="text-brand-text-dark/20" />
        </button>

        {/* Notifications */}
        <NotificationModal />

        <div className="mx-2 hidden h-6 w-px bg-brand-dark/10 sm:block" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg border border-transparent p-1.5 transition-all hover:border-brand-dark/10 hover:bg-brand-dark/[0.02]">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black uppercase tracking-tight text-brand-text-dark">{user?.fullName || "Người dùng"}</p>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-dark/40">{user?.role || "Khách"}</p>
              </div>
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-brand-dark/[0.02] shadow-sm transition-all hover:border-primary/20">
                {user?.avatar ? <img src={user.avatar} alt="Avatar" className="size-full object-cover" /> : <User size={20} className="text-brand-text-dark/40" />}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-64 rounded-xl border-brand-dark/10 p-2 shadow-2xl">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dark/40">Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-brand-dark/[0.02]" />
            <DropdownMenuItem asChild className="rounded-lg">
              <Link to="/profile" className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-xs font-bold text-brand-text-dark/80 hover:bg-brand-dark/[0.02]">
                <User size={16} className="text-brand-text-dark/40" />
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-brand-dark/[0.02]" />
            <DropdownMenuItem onClick={logout} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600">
              <LogOut size={16} />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
