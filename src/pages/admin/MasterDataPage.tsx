import { toast } from "sonner";
import { useState } from "react";
import { Settings2, Map, Flag, Briefcase, Tags, Plus, Search, Edit3, Trash2, ChevronRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "countries", name: "Danh bạ Quốc gia", icon: Flag, count: 24, color: "text-rose-500" },
  { id: "delegation_types", name: "Loại hình đoàn", icon: Briefcase, count: 6, color: "text-blue-500" },
  { id: "priorities", name: "Mức độ ưu tiên", icon: Tags, count: 4, color: "text-amber-500" },
  { id: "locations", name: "Địa điểm khảo sát", icon: Map, count: 18, color: "text-emerald-500" },
];

const mockData: Record<string, any[]> = {
  countries: [
    { id: 1, name: "Hàn Quốc", code: "KR", status: "active" },
    { id: 2, name: "Nhật Bản", code: "JP", status: "active" },
    { id: 3, name: "Singapore", code: "SG", status: "active" },
    { id: 4, name: "Đức", code: "DE", status: "active" },
    { id: 5, name: "Hoa Kỳ", code: "US", status: "active" },
  ],
  delegation_types: [
    { id: 1, name: "Đoàn Inbound", code: "IN", status: "active" },
    { id: 2, name: "Đoàn Outbound", code: "OUT", status: "active" },
    { id: 3, name: "Khảo sát thực địa", code: "SURVEY", status: "active" },
  ],
};

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("countries");

  return (
    <div className="flex flex-col gap-6 duration-500 animate-in fade-in lg:flex-row">
      {/* Left Sidebar: Categories */}
      <aside className="w-full shrink-0 space-y-6 lg:w-[320px]">
        <div>
          <h1 className="flex items-center gap-3 font-title text-2xl font-black tracking-tight text-slate-900 uppercase">
            <Database size={24} className="text-primary" />
            Danh mục hệ thống
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-tight">Cấu hình dữ liệu nền cho toàn hệ thống.</p>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {categories.map((cat) => (
            <button 
key={cat.id}
 onClick={() => setActiveTab(cat.id)}
              className={cn(
                "group flex w-full items-center justify-between rounded-lg p-3.5 transition-all outline-none",
                activeTab === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border transition-colors", activeTab === cat.id ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-white")}>
                  <cat.icon size={16} className={activeTab === cat.id ? "text-white" : cat.color} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">{cat.name}</p>
                  <p className={cn("mt-0.5 text-[9px] font-black uppercase tracking-widest", activeTab === cat.id ? "text-white/60" : "text-slate-400")}>{cat.count} BẢN GHI</p>
                </div>
              </div>
              <ChevronRight size={12} className={activeTab === cat.id ? "text-white/40" : "text-slate-300"} />
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-xl bg-slate-950 p-6 text-white border border-slate-900 shadow-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg border border-primary/20">
            <Settings2 size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-tight text-white">Yêu cầu bổ sung dữ liệu?</p>
            <p className="text-[10px] font-medium leading-relaxed text-slate-500 uppercase tracking-widest">Liên hệ IT để cấu hình thêm các trường dữ liệu tùy chỉnh.</p>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
            GỬI YÊU CẦU IT
          </button>
        </div>
      </aside>

      {/* Main Content: Category Items */}
      <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search & Actions */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30 p-5 md:flex-row">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Tìm kiếm bản ghi..." 
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm" 
            />
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
            <Plus size={16} />
            THÊM MỚI BẢN GHI
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tên thuộc tính</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Định danh (Key)</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(mockData[activeTab] || mockData.countries).map((item) => (
                <tr key={item.id} className="group transition-all hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-black text-slate-500 uppercase">{item.code}</code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Hoạt động
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Tổng cộng <span className="text-slate-900">{(mockData[activeTab] || mockData.countries).length}</span> bản ghi hệ thống
          </p>
          <div className="flex gap-1">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors">Trang kế</button>
          </div>
        </div>
      </main>
    </div>
  );
}
