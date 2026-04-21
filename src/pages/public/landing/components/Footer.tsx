export default function Footer() {
  return (
    <footer className="border-t border-brand-dark/10 bg-white pb-8 pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-title text-xl font-black uppercase tracking-widest text-brand-text-dark">IPA ĐÀ NẴNG</h2>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-brand-text-dark/60">
              Cơ quan Hỗ trợ và Xúc tiến Đầu tư trực thuộc UBND Thành phố Đà Nẵng. Cầu nối tin cậy cho doanh nghiệp tại Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-brand-text-dark">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-brand-text-dark/60">
              <li>📍 Tầng 29, Trung tâm Hành chính Đà Nẵng</li>
              <li>📞 (+84) 236 381 0056</li>
              <li>✉️ ipa@danang.gov.vn</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-brand-text-dark">Liên kết</h4>
            <ul className="space-y-3 text-sm text-brand-text-dark/60">
              <li className="cursor-pointer hover:text-primary">Chính quyền Điện tử</li>
              <li className="cursor-pointer hover:text-primary">Sở Kế hoạch Đầu tư</li>
              <li className="cursor-pointer hover:text-primary">Khu Công nghệ cao</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-dark/5 pt-8 text-center font-sans text-xs text-brand-text-dark/40">
          © {new Date().getFullYear()} IPA Da Nang. Được phát triển để trình diễn thiết kế.
        </div>
      </div>
    </footer>
  );
}
