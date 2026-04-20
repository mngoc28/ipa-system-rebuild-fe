import * as React from "react";
import { 
  BookOpen, 
  ChevronRight, 
  Activity, 
  Bell, 
  Users, 
  ShieldCheck, 
  ArrowLeft,
  FileText,
  MousePointer2,
  Calendar,
  AlertCircle,
  CheckSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminGuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-8">
        <Link to="/admin/announcements">
          <Button variant="ghost" size="sm" className="pl-0 text-slate-500 transition-colors hover:text-primary">
            <ArrowLeft size={16} className="mr-2" /> Quay lại Quản lý
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
            <BookOpen size={30} />
          </div>
          <div>
            <h1 className="font-title text-3xl font-black uppercase tracking-tight text-slate-900">Hướng dẫn Quản trị</h1>
            <p className="mt-1 text-base font-medium text-slate-500">Tài liệu hướng dẫn vận hành hệ thống dành cho người quản trị (Admin).</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="sticky top-24 h-fit space-y-2 md:col-span-3">
          <GuideNavLink href="#dashboard" label="Dashboard & Chỉ số" icon={<Activity size={14} />} />
          <GuideNavLink href="#announcements" label="Quản lý Thông báo" icon={<Bell size={14} />} />
          <GuideNavLink href="#visibility" label="Thời gian hiển thị" icon={<Calendar size={14} />} />
          <GuideNavLink href="#best-practices" label="Lưu ý vận hành" icon={<ShieldCheck size={14} />} />
        </div>

        {/* Content Area */}
        <div className="space-y-12 md:col-span-9">
          {/* Section: Dashboard */}
          <section id="dashboard" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Activity size={20} />
              <h2 className="text-xl font-black uppercase tracking-tight">1. Dashboard & Chỉ số vận hành</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600">
              <p>Hệ thống cung cấp các chỉ số thời gian thực giúp bạn theo dõi tình trạng vận hành của hệ thống:</p>
              <ul className="grid list-none grid-cols-1 gap-4 pl-0 sm:grid-cols-2">
                <GuideFeatureCard 
                  title="Người dùng Online" 
                  desc="Số lượng phiên đăng nhập (session) đang hoạt động trong hệ thống. Chỉ số này giúp bạn biết được lưu lượng truy cập hiện tại." 
                  icon={<Users size={18} className="text-emerald-500" />}
                />
                <GuideFeatureCard 
                  title="Dung lượng lưu trữ" 
                  desc="Tổng dung lượng của tất cả hồ sơ, tài liệu đã được tải lên. Giúp kiểm soát giới hạn hạ tầng máy chủ." 
                  icon={<FileText size={18} className="text-blue-500" />}
                />
              </ul>
            </div>
          </section>

          {/* Section: Announcements */}
          <section id="announcements" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Bell size={20} />
              <h2 className="text-xl font-black uppercase tracking-tight">2. Quản lý Thông báo</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              <p>Bạn có thể tạo các thông báo quan trọng xuất hiện tại Header của người dùng thông thường:</p>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">1</div>
                  <p>Nhấn nút <b>+ THÊM THÔNG BÁO</b> ở góc trên bên phải trang quản lý.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">2</div>
                  <p>Chọn <b>Loại thông báo</b> phù hợp (Thông tin, Quan trọng hoặc Cập nhật) để hệ thống hiển thị màu sắc tương ứng.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">3</div>
                  <p>Nhập nội dung và cài đặt trạng thái <b>Kích hoạt</b>.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Visibility Duration */}
          <section id="visibility" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Calendar size={20} />
              <h2 className="text-xl font-black uppercase tracking-tight">3. Cài đặt Thời gian hiển thị</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              <p>Tính năng này giúp tự động hóa việc hiển thị thông báo theo lịch trình:</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="mb-2 font-bold text-slate-900">Ngày bắt đầu</p>
                  <p className="text-[11px]">Thông báo sẽ ở trạng thái <b>"Chờ hiệu lực"</b> cho đến khi tới ngày này.</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="mb-2 font-bold text-slate-900">Ngày kết thúc</p>
                  <p className="text-[11px]">Hệ thống tự động chuyển sang trạng thái <b>"Đã hết hạn"</b> và ẩn khỏi giao diện người dùng.</p>
                </div>
              </div>
              <p className="flex gap-2 rounded border border-amber-100 bg-amber-50 p-3 text-[11px] italic text-amber-700">
                <AlertCircle size={14} className="shrink-0" /> Lưu ý: Nếu để trống cả hai, thông báo sẽ hiển thị vĩnh viễn cho đến khi bạn tắt "Kích hoạt" thủ công.
              </p>
            </div>
          </section>

          {/* Section: Best Practices */}
          <section id="best-practices" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck size={20} />
              <h2 className="text-xl font-black uppercase tracking-tight">4. Lưu ý vận hành an toàn</h2>
            </div>
            <div className="space-y-4 rounded-2xl bg-slate-900 p-6 text-slate-300 shadow-xl">
              <div className="flex items-start gap-4">
                <MousePointer2 className="mt-1 shrink-0 text-primary" size={18} />
                <div>
                  <p className="mb-1 text-sm font-bold uppercase tracking-tight text-white">Quy tắc quản trị</p>
                  <p className="text-xs leading-relaxed">
                    Hạn chế tạo quá nhiều thông báo cùng lúc làm nhiễu giao diện người dùng. Chỉ nên duy trì tối đa 2-3 thông báo "Dạng Thông tin" tại một thời điểm.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckSquare size={18} className="mt-1 shrink-0 text-emerald-400" />
                <div>
                  <p className="mb-1 text-sm font-bold uppercase tracking-tight text-white">Làm mới dữ liệu</p>
                  <p className="text-xs leading-relaxed">
                    Nhấn nút "Làm mới dữ liệu" định kỳ để đảm bảo bạn đang xem các chỉ số chính xác nhất từ máy chủ.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function GuideNavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:border-slate-100 hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-400 transition-colors group-hover:text-primary">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-900">
          {label}
        </span>
      </div>
      <ChevronRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </a>
  );
}

function GuideFeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="mt-1">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-bold uppercase tracking-tight text-slate-900">{title}</p>
        <p className="text-[11px] leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
