const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'src', 'pages', 'public', 'landing');
const componentsDir = path.join(baseDir, 'components');

fs.mkdirSync(componentsDir, { recursive: true });

const heroContent = `import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative flex min-h-[600px] lg:min-h-[85vh] items-center justify-center pt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070&auto=format&fit=crop" 
          alt="Da Nang City" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
          UBND Thành Phố Đà Nẵng
        </span>
        <h1 className="mb-6 font-title text-5xl font-black uppercase tracking-tight text-white lg:text-7xl">
          Cơ Quan Xúc Tiến Đầu Tư <br />
          <span className="text-blue-400">IPA Đà Nẵng</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
          Nền tảng số cửa ngõ, cung cấp thông tin minh bạch, kết nối các nhà đầu tư chiến lược với những cơ hội phát triển bền vững tại trung tâm kinh tế duyên hải Miền Trung.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/auth/login" className="group flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-blue-500">
            Đăng nhập Hệ thống
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <button onClick={() => alert("Chức năng tra cứu đang được xây dựng!")} className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white/10">
            <Search size={18} />
            Tra cứu Dự án
          </button>
        </div>
      </div>
    </section>
  );
}`;

const aboutContent = `import { MapPin, TrendingUp, Users } from "lucide-react";

export default function About() {
  const highlights = [
    {
      icon: MapPin,
      title: "Vị trí Chiến lược",
      desc: "Trọng điểm kinh tế miền Trung, sở hữu cảng biển nước sâu và sân bay quốc tế nối liền các tuyến đường huyết mạch Á - Âu."
    },
    {
      icon: TrendingUp,
      title: "Chính sách Đột phá",
      desc: "Ưu đãi thuế minh bạch, cam kết hỗ trợ toàn diện từ chính quyền địa phương trong suốt vòng đời dự án."
    },
    {
      icon: Users,
      title: "Nguồn Nhân lực Cao",
      desc: "Tập trung nhiều trường đại học trọng điểm, cung cấp nguồn kỹ sư công nghệ và lao động chất lượng cao cực kỳ dồi dào."
    }
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-title text-3xl font-black uppercase tracking-tight text-slate-900">Vì sao chọn Đà Nẵng?</h2>
          <div className="mx-auto h-1 w-20 bg-blue-600"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <item.icon size={24} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="font-serif leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const sectorsContent = `import { Cpu, DollarSign, Plane, Building } from "lucide-react";

export default function Sectors() {
  const sectors = [
    { icon: Cpu, name: "Công nghệ Thông tin", count: "142 Dự án", color: "bg-indigo-50 text-indigo-600" },
    { icon: Plane, name: "Du lịch Dịch vụ", count: "89 Dự án", color: "bg-sky-50 text-sky-600" },
    { icon: Building, name: "Bất động sản Công nghiệp", count: "34 Dự án", color: "bg-emerald-50 text-emerald-600" },
    { icon: DollarSign, name: "Tài chính Quốc tế", count: "12 Dự án", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/3">
          <h2 className="mb-4 font-title text-3xl font-black uppercase tracking-tight text-slate-900">Lĩnh vực<br/>Trọng điểm</h2>
          <div className="mb-6 h-1 w-16 bg-blue-600"></div>
          <p className="text-slate-600 leading-relaxed font-serif">
            Đà Nẵng tập trung thu hút dòng vốn FDI chất lượng cao, ưu tiên các ngành công nghiệp mũi nhọn có giá trị gia tăng lớn và thân thiện với môi trường.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:w-2/3 lg:grid-cols-2">
          {sectors.map((s, idx) => (
            <div key={idx} className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-md cursor-pointer">
              <div className={\`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg \${s.color}\`}> 
                <s.icon size={26} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{s.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const procedureContent = `export default function Procedure() {
  const steps = [
    { title: "Nghiên cứu vị trí", desc: "Giới thiệu địa điểm, quy hoạch kiến trúc." },
    { title: "Đề xuất dự án", desc: "Thẩm định năng lực và quy mô đầu tư." },
    { title: "Cấp chứng nhận", desc: "Phê duyệt chủ trương và cấp giấy chứng nhận." },
    { title: "Triển khai", desc: "Hỗ trợ thủ tục xây dựng và khởi công." },
  ];

  return (
    <section className="bg-slate-900 py-24 text-white">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="mb-16 font-title text-3xl font-black uppercase tracking-tight">Thủ tục Xúc tiến Đầu tư</h2>
        
        <div className="relative mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-4">
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-[75%] -translate-x-1/2 bg-white/10 md:block" />
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-xl font-black text-white shadow-xl shadow-blue-900/50">
                0{idx + 1}
              </div>
              <h4 className="mb-2 font-bold text-slate-100">{step.title}</h4>
              <p className="text-sm text-slate-400 font-serif leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const footerContent = `export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-title text-xl font-black uppercase tracking-widest text-slate-900">IPA ĐÀ NẴNG</h2>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 font-serif">
              Cơ quan Hỗ trợ và Xúc tiến Đầu tư trực thuộc UBND Thành phố Đà Nẵng. Cầu nối tin cậy cho doanh nghiệp tại Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-900">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>📍 Tầng 29, Trung tâm Hành chính Đà Nẵng</li>
              <li>📞 (+84) 236 381 0056</li>
              <li>✉️ ipa@danang.gov.vn</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-900">Liên kết</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="hover:text-blue-600 cursor-pointer">Chính quyền Điện tử</li>
              <li className="hover:text-blue-600 cursor-pointer">Sở Kế hoạch Đầu tư</li>
              <li className="hover:text-blue-600 cursor-pointer">Khu Công nghệ cao</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400 font-serif">
          © {new Date().getFullYear()} IPA Da Nang. Được phát triển để trình diễn thiết kế.
        </div>
      </div>
    </footer>
  );
}`;

const landingPageContent = `import Hero from "./components/Hero";
import About from "./components/About";
import Sectors from "./components/Sectors";
import Procedure from "./components/Procedure";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <About />
      <Sectors />
      <Procedure />
      <Footer />
    </div>
  );
}`;

const landingLayoutContent = `import { Outlet } from "react-router-dom";
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
             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-black tracking-widest text-white shadow-lg">IPA</div>
             <span className={cn("font-title text-base font-black tracking-[0.2em]", isScrolled ? "text-slate-900" : "text-white")}>ĐÀ NẴNG</span>
          </div>
          
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[11px]">
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
}`;

fs.writeFileSync(path.join(componentsDir, 'Hero.tsx'), heroContent);
fs.writeFileSync(path.join(componentsDir, 'About.tsx'), aboutContent);
fs.writeFileSync(path.join(componentsDir, 'Sectors.tsx'), sectorsContent);
fs.writeFileSync(path.join(componentsDir, 'Procedure.tsx'), procedureContent);
fs.writeFileSync(path.join(componentsDir, 'Footer.tsx'), footerContent);
fs.writeFileSync(path.join(baseDir, 'index.tsx'), landingPageContent);
fs.writeFileSync(path.join(baseDir, 'LandingLayout.tsx'), landingLayoutContent);

console.log("Landing page scaffolded successfully.");
