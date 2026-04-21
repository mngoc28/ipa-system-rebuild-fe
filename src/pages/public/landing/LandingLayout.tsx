import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function LandingLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative font-sans text-brand-text-dark">
      <header className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-dark/10" : "bg-transparent text-white"
      )}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
             <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-black tracking-widest text-white shadow-lg">IPA</div>
             <span className={cn("font-title text-base font-black tracking-[0.2em]", isScrolled ? "text-brand-text-dark" : "text-white")}>ĐÀ NẴNG</span>
          </div>
          
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
              <li className={cn("cursor-pointer transition-colors hover:text-primary", !isScrolled && "text-white/60")}>Giới thiệu</li>
              <li className={cn("cursor-pointer transition-colors hover:text-primary", !isScrolled && "text-white/60")}>Dự án</li>
              <li className={cn("cursor-pointer transition-colors hover:text-primary", !isScrolled && "text-white/60")}>Thủ tục</li>
              <li className={cn("cursor-pointer transition-colors hover:text-primary", !isScrolled && "text-white/60")}>Tin tức</li>
            </ul>
          </nav>

          <Link to="/auth/login" className={cn(
            "rounded-md px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
            isScrolled ? "bg-brand-dark text-white hover:bg-primary" : "bg-white/10 text-white backdrop-blur hover:bg-white/20"
          )}>
            Đăng nhập
          </Link>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}
