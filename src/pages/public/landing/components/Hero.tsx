import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center justify-center pt-20 lg:min-h-[85vh]">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070&auto=format&fit=crop" 
          alt="Da Nang City" 
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark-900/70" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
          UBND Thành Phố Đà Nẵng
        </span>
        <h1 className="mb-6 font-title text-5xl font-black uppercase tracking-tight text-white lg:text-7xl">
          Cơ Quan Xúc Tiến Đầu Tư <br />
          <span className="text-primary">IPA Đà Nẵng</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
          Nền tảng số cửa ngõ, cung cấp thông tin minh bạch, kết nối các nhà đầu tư chiến lược với những cơ hội phát triển bền vững tại trung tâm kinh tế duyên hải Miền Trung.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/auth/login" className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/90">
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
}
