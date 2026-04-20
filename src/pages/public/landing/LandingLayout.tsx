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
    <div className="relative font-sans text-slate-900">
      <header className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200" : "bg-transparent text-white"
      )}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
             <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-black tracking-widest text-white shadow-lg">IPA</div>
             <span className={cn("font-title text-base font-black tracking-[0.2em]", isScrolled ? "text-slate-900" : "text-white")}>ĐÀ NẴNG</span>
          </div>
          
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
              <li className={cn("cursor-pointer transition-colors hover:text-blue-500", !isScrolled && "text-slate-200")}>Giới thiệu</li>
              <li className={cn("cursor-pointer transition-colors hover:text-blue-500", !isScrolled && "text-slate-200")}>Dự án</li>
              <li className={cn("cursor-pointer transition-colors hover:text-blue-500", !isScrolled && "text-slate-200")}>Thủ tục</li>
              <li className={cn("cursor-pointer transition-colors hover:text-blue-500", !isScrolled && "text-slate-200")}>Tin tức</li>
            </ul>
          </nav>

          <Link to="/auth/login" className={cn(
            "rounded-md px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
            isScrolled ? "bg-slate-900 text-white hover:bg-blue-600" : "bg-white/10 text-white backdrop-blur hover:bg-white/20"
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