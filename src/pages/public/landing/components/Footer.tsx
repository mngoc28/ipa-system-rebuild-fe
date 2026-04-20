export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-title text-xl font-black uppercase tracking-widest text-slate-900">IPA ĐÀ NẴNG</h2>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-slate-500">
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
              <li className="cursor-pointer hover:text-blue-600">Chính quyền Điện tử</li>
              <li className="cursor-pointer hover:text-blue-600">Sở Kế hoạch Đầu tư</li>
              <li className="cursor-pointer hover:text-blue-600">Khu Công nghệ cao</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 text-center font-sans text-xs text-slate-400">
          © {new Date().getFullYear()} IPA Da Nang. Được phát triển để trình diễn thiết kế.
        </div>
      </div>
    </footer>
  );
}