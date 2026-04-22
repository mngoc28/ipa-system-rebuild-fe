import * as React from "react";
import { useState } from "react";
import { ElementType } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

/**
 * Structure for a single sidebar navigation item.
 */
interface MenuItem {
    title: string;
    path: string;
    icon: ElementType;
}

/**
 * Navigation configuration for the administrative sidebar.
 */
const adminMenuItems: MenuItem[] = [
  { title: "Bảng điều khiển", path: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Định danh & Quyền hạn", path: "/admin/users", icon: Users },
  { title: "Dữ liệu danh mục", path: "/admin/master-data", icon: Server },
  { title: "Thông báo & Vận hành", path: "/admin/announcements", icon: Settings },
  { title: "Nhật ký hệ thống", path: "/admin/audit-log", icon: ShieldCheck },
];

/**
 * Props for the AdminSidebar component.
 */
interface AdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

/**
 * The primary navigation wrapper for the Administration section.
 * Supports a collapsed desktop mode and a drawer-based mobile mode.
 */
export default function AdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-brand-dark text-white shadow-2xl shadow-black/20",
        "w-[240px] transition-transform duration-300 lg:transition-all",
        isCollapsed ? "lg:w-16" : "lg:w-[240px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-white/5 bg-black/10 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-lg shadow-emerald-600/20">
          <ShieldCheck size={16} className="text-white" />
        </div>
        {!isCollapsed && <span className="ml-3 whitespace-nowrap font-title text-sm font-black uppercase tracking-widest text-emerald-400">SYS_ADMIN</span>}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-4 px-2">
           {!isCollapsed && <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Bộ điều khiển quản trị</p>}
        </div>
        <ul className="space-y-1.5">
          {adminMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) => cn(
                  "group relative flex h-10 items-center rounded-lg px-3 transition-all duration-200", 
                  isActive 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn("shrink-0 transition-transform group-hover:scale-110")} />
                {!isCollapsed && <span className="ml-3 truncate text-xs font-bold uppercase tracking-wider">{item.title}</span>}

                {/* Tooltip on collapsed */}
                {isCollapsed && (
                  <div className="invisible absolute left-14 z-50 whitespace-nowrap rounded bg-brand-dark-900 px-2 py-1.5 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    {item.title}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mb-4 mt-8 border-t border-white/10 px-2 pt-4">
            <NavLink
              to="/dashboard"
              onClick={onMobileClose}
              className={cn(
                "group relative flex h-10 items-center rounded-lg px-3 transition-all duration-200 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300"
              )}
            >
              <ArrowLeft size={18} className={cn("shrink-0 transition-transform group-hover:-translate-x-1")} />
              {!isCollapsed && <span className="ml-3 truncate text-xs font-black uppercase tracking-wider">THOÁT QUẢN TRỊ</span>}
              {isCollapsed && (
                  <div className="invisible absolute left-14 z-50 whitespace-nowrap rounded bg-brand-dark-900 px-2 py-1.5 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    Exit Admin
                  </div>
              )}
           </NavLink>
        </div>
      </nav>

      {/* Bottom Profile */}
      <div className="space-y-1 border-t border-white/10 bg-brand-dark-900/50 p-2">
        <div className={cn("flex h-12 items-center rounded-md px-2", isCollapsed ? "justify-center" : "")}>
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/50 bg-brand-dark-900/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="size-full object-cover" /> : <UserCircle size={20} className="text-emerald-400" />}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-xs font-black text-emerald-50">{user?.fullName || "System Admin"}</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-500/80">Quản trị viên hệ thống</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-px">
          <button onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} className="flex h-10 w-full items-center rounded-md px-3 text-white/40 transition-all hover:bg-white/5 hover:text-white">
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Thu gọn</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onMobileClose?.();
              setIsLogoutModalOpen(true);
            }}
            title="Logout"
            aria-label="Logout"
            className="flex h-10 w-full items-center rounded-md px-3 text-white/40 shadow-sm transition-all hover:bg-destructive hover:text-white"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Đăng xuất</span>}
          </button>
        </div>
      </div>
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onOpenChange={setIsLogoutModalOpen} 
        onConfirm={logout} 
      />
    </aside>
  );
}
