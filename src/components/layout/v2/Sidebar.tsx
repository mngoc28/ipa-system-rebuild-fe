import logoBrand from "@/assets/logo-brand.png";
import { cn } from "@/lib/utils";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FileStack,
  FileText,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { ElementType, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

/**
 * Structure for a single sidebar navigation item.
 */
interface MenuItem {
    title: string;
    path: string;
    icon: ElementType;
    roles: UserRole[];
    badge?: number;
}

/**
 * Structure for grouping related menu items under a header.
 */
interface MenuGroup {
    group: string;
    roles?: UserRole[];
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    group: "TỔNG QUAN",
    items: [
      { title: "Bảng điều khiển", path: "/dashboard", icon: LayoutDashboard, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Đoàn công tác", path: "/delegations", icon: Briefcase, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "QUẢN LÝ ĐƠN VỊ",
    roles: ["Manager"],
    items: [
      { title: "Chờ phê duyệt", path: "/approvals", icon: ClipboardList, roles: ["Manager"] },
      { title: "Báo cáo đơn vị", path: "/reports/unit", icon: BarChart3, roles: ["Manager"] },
      { title: "Đội nhóm & Nhân sự", path: "/teams", icon: Users, roles: ["Manager"] },
    ]
  },
  {
    group: "LÃNH ĐẠO THÀNH PHỐ",
    roles: ["Director"],
    items: [
      { title: "Tổng quan thành phố", path: "/city-overview", icon: Building2, roles: ["Director"] },
      { title: "Báo cáo thành phố", path: "/reports/city", icon: BarChart3, roles: ["Director"] },
    ]
  },
  {
    group: "HỆ THỐNG",
    roles: ["Admin"],
    items: [
      { title: "Quản trị hệ thống", path: "/admin/dashboard", icon: ShieldCheck, roles: ["Admin"] },
      { title: "Dữ liệu danh mục", path: "/admin/master-data", icon: Database, roles: ["Admin"] },
      { title: "Nhật ký hệ thống", path: "/admin/audit-logs", icon: Activity, roles: ["Admin"] },
      { title: "Thông báo & Vận hành", path: "/admin/announcements", icon: Settings, roles: ["Admin"] },
    ]
  },
  {
    group: "NGHIỆP VỤ",
    items: [
      { title: "Tuyến dự án", path: "/pipeline", icon: PieChart, roles: ["Staff", "Manager", "Director"] },
      { title: "Lịch làm việc", path: "/schedule", icon: Calendar, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Quản lý nhiệm vụ", path: "/tasks", icon: CheckSquare, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "VĂN PHÒNG",
    items: [
      { title: "Biên bản", path: "/minutes", icon: FileText, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Thông báo", path: "/notifications", icon: Bell, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "TÀI NGUYÊN",
    items: [
      { title: "CRM ĐỐI TÁC", path: "/partners", icon: Users, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "TÀI LIỆU", path: "/documents", icon: FileStack, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  }
];

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { unreadCount, pendingApprovalsCount, fetchCounts } = useNotificationStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const filteredGroups = useMemo(() => {
    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            // Inject dynamic badges
            if (item.path === "/notifications") {
              return { ...item, badge: unreadCount > 0 ? unreadCount : undefined };
            }
            if (item.path === "/approvals") {
              return { ...item, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined };
            }
            return item;
          }),
      }))
      .filter((group) => group.items.length > 0);
  }, [user, unreadCount, pendingApprovalsCount]);

  return (
    <aside
      data-testid="app-sidebar"
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-[hsl(var(--brand-dark))] text-white shadow-2xl shadow-black/20",
        "w-[240px] transition-transform duration-300 lg:transition-all",
        isCollapsed ? "lg:w-16" : "lg:w-[240px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-white/5 bg-black/10 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-lg">
          <img 
            src={logoBrand} 
            alt="Da Nang Emblem" 
            className="size-full object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="ml-3 flex flex-col justify-center overflow-hidden">
            <span className="whitespace-nowrap font-title text-[11px] font-black tracking-[0.2em] text-white">IPA DANANG</span>
            <span className="text-[8px] font-medium tracking-tight text-white/30">HỆ THỐNG QUẢN TRỊ ĐOÀN CÔNG TÁC</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                  {group.group}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) => cn(
                        "group relative flex h-10 items-center rounded-xl px-3 transition-all duration-200", 
                        isActive 
                          ? "bg-white/10 text-white shadow-lg" 
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent opacity-0 transition-opacity group-[.active]:opacity-100" />
                      <item.icon size={18} className={cn("relative z-10 shrink-0 transition-transform group-hover:scale-110")} />
                      {!isCollapsed && <span className="relative z-10 ml-3 truncate text-[11px] font-black uppercase tracking-widest">{item.title}</span>}
                      {item.badge && !isCollapsed && (
                        <span className="relative z-10 ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[8px] font-black text-white shadow-sm ring-2 ring-brand-dark">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on collapsed */}
                      {isCollapsed && (
                        <div className="invisible absolute left-14 z-[100] whitespace-nowrap rounded-lg border border-white/10 bg-brand-dark-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                          {item.title}
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Profile */}
      <div className="space-y-1 border-t border-white/10 bg-brand-dark-900/50 p-2">
        <NavLink to="/profile" aria-label="Hồ sơ cá nhân" onClick={onMobileClose} className={cn("flex h-12 items-center rounded-md px-2 transition-all hover:bg-white/5", isCollapsed ? "justify-center" : "")}> 
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-brand-dark-900/50">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="size-full object-cover" /> : <UserCircle size={20} className="text-white/20" />}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-xs font-semibold">{user?.fullName || "User Name"}</p>
              <p className="text-[10px] capitalize text-white/40">{user?.role || "Role"}</p>
            </div>
          )}
        </NavLink>

        <div className="flex flex-col gap-px">
          <button onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Mở rộng" : "Thu gọn"} aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"} className="flex h-10 w-full items-center rounded-md px-3 text-white/40 transition-all hover:bg-white/5 hover:text-white">
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="ml-3 text-xs">Thu gọn</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onMobileClose?.();
              setIsLogoutModalOpen(true);
            }}
            title="Đăng xuất"
            aria-label="Đăng xuất khỏi hệ thống"
            className="flex h-10 w-full items-center rounded-md px-3 text-white/40 shadow-sm transition-all hover:bg-destructive hover:text-white"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3 text-xs">Đăng xuất</span>}
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
