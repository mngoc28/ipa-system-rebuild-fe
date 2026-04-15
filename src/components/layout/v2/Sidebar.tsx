import * as React from "react";
import { useState, ElementType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  Bell,
  Users,
  FileStack,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  PieChart,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  path: string;
  icon: ElementType;
  roles: UserRole[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  // Mọi role
  { title: "Tổng quan", path: "/dashboard", icon: LayoutDashboard, roles: ["Staff", "Manager", "Director", "Admin"] },
  { title: "Pipeline dự án", path: "/pipeline", icon: PieChart, roles: ["Staff", "Manager", "Director"] },
  { title: "Đoàn đến/đi", path: "/delegations", icon: Briefcase, roles: ["Staff", "Manager", "Director", "Admin"] },
  { title: "Lịch công tác", path: "/schedule", icon: Calendar, roles: ["Staff", "Manager", "Director", "Admin"] },
  { title: "Việc cần làm", path: "/tasks", icon: CheckSquare, roles: ["Staff", "Manager", "Director", "Admin"] },

  // Mọi role
  { title: "Biên bản", path: "/minutes", icon: FileText, roles: ["Staff", "Manager", "Director", "Admin"] },
  { title: "Thông báo", path: "/notifications", icon: Bell, roles: ["Staff", "Manager", "Director", "Admin"] },

  // Manager thêm
  { title: "Chờ phê duyệt", path: "/approvals", icon: ClipboardList, roles: ["Manager"], badge: 5 },
  { title: "Báo cáo đơn vị", path: "/reports/unit", icon: PieChart, roles: ["Manager"] },
  { title: "Đội nhóm", path: "/teams", icon: Users, roles: ["Manager"] },

  // Director thêm
  { title: "Tổng quan thành phố", path: "/city-overview", icon: Building2, roles: ["Director"] },
  { title: "Báo cáo thành phố", path: "/reports/city", icon: PieChart, roles: ["Director"] },

  // Mọi role (CRM & Tài liệu)
  { title: "CRM Đối tác", path: "/partners", icon: Users, roles: ["Staff", "Manager", "Director", "Admin"] },
  { title: "Tài liệu", path: "/documents", icon: FileStack, roles: ["Staff", "Manager", "Director", "Admin"] },

  // Admin
  { title: "Portal Quản trị", path: "/admin/dashboard", icon: Settings, roles: ["Admin"] },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const filteredMenu = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className={cn("fixed left-0 top-0 z-50 flex h-screen flex-col bg-slate-950 text-white transition-all duration-300 shadow-2xl shadow-black/20", isCollapsed ? "w-16" : "w-[240px]")}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-white/5 px-4 bg-black/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
          <span className="text-[10px] font-black text-white tracking-widest">IPA</span>
        </div>
        {!isCollapsed && <span className="ml-3 whitespace-nowrap font-title text-sm font-black tracking-[0.15em] text-slate-100">IPA ĐÀ NẴNG</span>}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-1.5">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "group relative flex h-10 items-center rounded-lg px-3 transition-all duration-200", 
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn("shrink-0 transition-transform group-hover:scale-110")} />
                {!isCollapsed && <span className="ml-3 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold uppercase tracking-wider">{item.title}</span>}
                {item.badge && !isCollapsed && <span className="ml-auto rounded-md bg-rose-600 px-1.5 py-0.5 text-[8px] font-black text-white">{item.badge}</span>}

                {/* Tooltip on collapsed */}
                {isCollapsed && (
                  <div className="invisible absolute left-14 z-50 whitespace-nowrap rounded bg-slate-800 px-2 py-1.5 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    {item.title}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Profile */}
      <div className="space-y-1 border-t border-white/10 bg-slate-900/50 p-2">
        <NavLink to="/profile" className={cn("flex h-12 items-center rounded-md px-2 transition-all hover:bg-white/5", isCollapsed ? "justify-center" : "")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-slate-600">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" /> : <UserCircle size={20} className="text-slate-300" />}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-xs font-semibold">{user?.fullName || "User Name"}</p>
              <p className="text-[10px] capitalize text-slate-400">{user?.role || "Role"}</p>
            </div>
          )}
        </NavLink>

        <div className="flex flex-col gap-px">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex h-10 w-full items-center rounded-md px-3 text-slate-400 transition-all hover:bg-white/5 hover:text-white">
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="ml-3 text-xs">Thu nhỏ</span>
              </>
            )}
          </button>

          <button onClick={logout} className="flex h-10 w-full items-center rounded-md px-3 text-slate-400 shadow-sm transition-all hover:bg-destructive hover:text-white">
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3 text-xs">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
