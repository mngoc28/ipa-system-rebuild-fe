import { useState } from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "sonner";
import { useAuthStore, getHasFetchedLatestUser, setHasFetchedLatestUserFlag } from "@/store/useAuthStore";
import { authApi } from "@/api/authApi";
import { cn } from "@/lib/utils";

/**
 * The core application shell that wraps all non-administrative pages.
 * Handles background user profile synchronization, mobile menu state,
 * and standard app-wide UI elements like Sidebar and Header.
 */
export default function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { updateUser } = useAuthStore();

  useEffect(() => {
    // Prevent duplicate API calls immediately after login
    if (getHasFetchedLatestUser()) return;
    const fetchLatestUser = async () => {
      try {
        const response = await authApi.me();
        if (response?.data) {
          const authUser = response.data;
          
          let fetchedUnit = "";
          if (typeof authUser.unit === "object" && authUser.unit !== null) {
            fetchedUnit = authUser.unit.unit_name || authUser.unit.name || "";
          } else if (typeof authUser.unit === "string") {
            fetchedUnit = authUser.unit;
          }

          updateUser({
            fullName: authUser.full_name || authUser.fullName || "",
            email: authUser.email,
            avatar: authUser.avatar_url || authUser.avatar || "",
            unit: fetchedUnit,
            phone: authUser.phone || "",
          });
          setHasFetchedLatestUserFlag(true);
        }
      } catch {
        console.error("Failed to sync user data in background");
      }
    };
    
    fetchLatestUser();
  }, [updateUser]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark/[0.02] font-sans text-brand-text-dark">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className={cn("flex flex-col transition-all duration-300", isSidebarCollapsed ? "lg:pl-16" : "lg:pl-[240px]")}>
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 p-4 lg:p-8">
          {/* Breadcrumb Container could go here */}
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <button 
          type="button"
          aria-label="Đóng menu di động"
          className="fixed inset-0 z-40 bg-brand-dark-900/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sonner Toasts */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
