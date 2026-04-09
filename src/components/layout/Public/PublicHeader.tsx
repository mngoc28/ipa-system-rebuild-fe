import { Link } from "react-router-dom";
import { Heart, Phone, Star, HomeIcon, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import LanguageSwitcher from "./LanguageSwitcher";
import { PublicHeaderProps } from "@/components/type";
import { useState } from "react";

// Props for PublicHeader component
const PublicHeader = ({
  contactHref = "#contact",
  rewardsHref = "#rewards",
  favoritesHref = "#favorites",
}: PublicHeaderProps) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate header height for mobile menu positioning
  const headerHeight = 80; // approximate header height in pixels

  return (
    <>
    <header className="relative border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/80 backdrop-blur" style={{ zIndex: 80 }}>
     <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to={ROUTERS.HOME} className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-sky-200/60">
          <HomeIcon className="h-5 w-5" />
        </span>
          <div className="leading-tight">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-sky-500">{t("public.header.brand.eyebrow")}</p>
          <p className="text-base font-semibold text-slate-900">{t("public.header.brand.title")}</p>
        </div>
      </Link>
      
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ml-auto inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
       </button>

        {/* Desktop menu */}
        <div className="ml-auto hidden items-center gap-6 lg:flex">
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href={contactHref}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-sky-600"
            >
              <Phone className="h-4 w-4" />
              {t("public.header.nav.contact")}
            </a>
            <a
              href={rewardsHref}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-sky-600"
            >
              <Star className="h-4 w-4" />
              {t("public.header.nav.points")}
            </a>
            <a
             href={favoritesHref}
             className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 transition hover:border-slate-200 hover:bg-slate-50 hover:text-sky-600"
           >
             <Heart className="h-4 w-4" />
             {t("public.header.nav.favorites")}
           </a>
         </nav>

          <LanguageSwitcher />
       </div>
     </div>
   </header>
     
     {/* Mobile menu */}
     {mobileMenuOpen && (
        <div className="fixed left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg lg:hidden" style={{ top: `${headerHeight}px` }}>
         <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4">
            <a
              href={contactHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-sky-600"
            >
              <Phone className="h-5 w-5" />
              {t("public.header.nav.contact")}
            </a>
            <a
              href={rewardsHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-sky-600"
            >
              <Star className="h-5 w-5" />
              {t("public.header.nav.points")}
            </a>
            <a
             href={favoritesHref}
             onClick={() => setMobileMenuOpen(false)}
             className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-sky-600"
           >
             <Heart className="h-5 w-5" />
             {t("public.header.nav.favorites")}
           </a>
            
            {/* Language switcher in mobile menu */}
            <div className="mt-2 border-t border-slate-200 pt-4">
              <LanguageSwitcher className="w-full" />
            </div>
         </nav>
       </div>
     )}
    </>
  );
};

export default PublicHeader;
