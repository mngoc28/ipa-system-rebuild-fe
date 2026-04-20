import * as React from "react";
import { ElementType, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  PieChart,
  ShieldCheck,
  ClipboardList,
  Database,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils";

/**
 * Structure for a single sidebar navigation item.
 */
interface MenuItem {
  /** Display title for the menu item. */
  title: string;
  /** Internal application path. */
  path: string;
  /** Lucide icon component to display. */
  icon: ElementType;
  /** List of roles authorized to view this item. */
  roles: UserRole[];
  /** Optional numeric notification badge. */
  badge?: number;
}

/**
 * Structure for grouping related menu items under a header.
 */
interface MenuGroup {
  /** Display name of the category. */
  group: string;
  /** Optional roles authorized to view this entire group. */
  roles?: UserRole[];
  /** List of items within this category. */
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    group: "GENERAL",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Delegations", path: "/delegations", icon: Briefcase, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "UNIT MANAGEMENT",
    roles: ["Manager"],
    items: [
      { title: "Pending Approvals", path: "/approvals", icon: ClipboardList, roles: ["Manager"] },
      { title: "Unit Reports", path: "/reports/unit", icon: BarChart3, roles: ["Manager"] },
      { title: "Teams & HR", path: "/teams", icon: Users, roles: ["Manager"] },
    ]
  },
  {
    group: "CITY LEADERSHIP",
    roles: ["Director"],
    items: [
      { title: "City Overview", path: "/city-overview", icon: Building2, roles: ["Director"] },
      { title: "City Reports", path: "/reports/city", icon: BarChart3, roles: ["Director"] },
    ]
  },
  {
    group: "SYSTEM",
    roles: ["Admin"],
    items: [
      { title: "Admin Portal", path: "/admin/dashboard", icon: ShieldCheck, roles: ["Admin"] },
      { title: "Master Data", path: "/admin/master-data", icon: Database, roles: ["Admin"] },
      { title: "Audit Logs", path: "/admin/audit-logs", icon: Activity, roles: ["Admin"] },
      { title: "Announcements & Ops", path: "/admin/announcements", icon: Settings, roles: ["Admin"] },
    ]
  },
  {
    group: "OPERATIONS",
    items: [
      { title: "Project Pipeline", path: "/pipeline", icon: PieChart, roles: ["Staff", "Manager", "Director"] },
      { title: "Work Schedule", path: "/schedule", icon: Calendar, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Task Manager", path: "/tasks", icon: CheckSquare, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "OFFICE",
    items: [
      { title: "Minutes", path: "/minutes", icon: FileText, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Notifications", path: "/notifications", icon: Bell, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  },
  {
    group: "RESOURCES",
    items: [
      { title: "Partner CRM", path: "/partners", icon: Users, roles: ["Staff", "Manager", "Director", "Admin"] },
      { title: "Documents", path: "/documents", icon: FileStack, roles: ["Staff", "Manager", "Director", "Admin"] },
    ]
  }
];

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** Whether the sidebar is in its narrow (icon-only) state. */
  isCollapsed: boolean;
  /** Callback to toggle the collapsed state. */
  setIsCollapsed: (val: boolean) => void;
  /** Visibility state for small screen mobile drawer. */
  isMobileOpen?: boolean;
  /** Callback to close the mobile drawer. */
  onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { unreadCount, pendingApprovalsCount, fetchCounts } = useNotificationStore();

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
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-slate-950 text-white shadow-2xl shadow-black/20",
        "w-[240px] transition-transform duration-300 lg:transition-all",
        isCollapsed ? "lg:w-16" : "lg:w-[240px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-white/5 bg-black/10 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
          <span className="text-[10px] font-black tracking-widest text-white">IPA</span>
        </div>
        {!isCollapsed && <span className="ml-3 whitespace-nowrap font-title text-sm font-black tracking-[0.15em] text-slate-100">IPA DANANG</span>}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/80">
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
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon size={18} className={cn("relative z-10 shrink-0 transition-transform group-hover:scale-110")} />
                      {!isCollapsed && <span className="relative z-10 ml-3 truncate text-[11px] font-black uppercase tracking-widest">{item.title}</span>}
                      {item.badge && !isCollapsed && (
                        <span className="relative z-10 ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[8px] font-black text-white shadow-sm ring-2 ring-slate-950">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on collapsed */}
                      {isCollapsed && (
                        <div className="invisible absolute left-14 z-[100] whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
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
      <div className="space-y-1 border-t border-white/10 bg-slate-900/50 p-2">
        <NavLink to="/profile" onClick={onMobileClose} className={cn("flex h-12 items-center rounded-md px-2 transition-all hover:bg-white/5", isCollapsed ? "justify-center" : "")}> 
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-slate-600">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="size-full object-cover" /> : <UserCircle size={20} className="text-slate-300" />}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-xs font-semibold">{user?.fullName || "User Name"}</p>
              <p className="text-[10px] capitalize text-slate-400">{user?.role || "Role"}</p>
            </div>
          )}
        </NavLink>

        <div className="flex flex-col gap-px">
          <button onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} className="flex h-10 w-full items-center rounded-md px-3 text-slate-400 transition-all hover:bg-white/5 hover:text-white">
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="ml-3 text-xs">Collapse</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onMobileClose?.();
              logout();
            }}
            title="Logout"
            aria-label="Logout"
            className="flex h-10 w-full items-center rounded-md px-3 text-slate-400 shadow-sm transition-all hover:bg-destructive hover:text-white"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3 text-xs">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
