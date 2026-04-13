import { useState } from "react";
import { FileText, Plus, Search, Download, Share2, Eye, MoreVertical, CheckCircle2, Clock, History, PenTool, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MinutesListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSignedOnly, setShowSignedOnly] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const [minutes, setMinutes] = useState([
    { id: 1, title: "Biên bản làm việc - Samsung Electronics", date: "10/04/2026", type: "Ghi nhớ (MoU)", status: "Signed", author: "Trần Thu Hà", size: "1.2MB" },
    { id: 2, title: "Biên bản khảo sát - KCN Thung lũng Silicon", date: "08/04/2026", type: "Khảo sát thực địa", status: "Pending", author: "Nguyễn Văn A", size: "2.5MB" },
    { id: 3, title: "Biên bản họp nội bộ - Chuẩn bị đón đoàn HQ", date: "05/04/2026", type: "Nội bộ", status: "Draft", author: "Trần Thu Hà", size: "850KB" },
  ]);

  const handleShare = (title: string) => {
    toast.success(`Đã gửi liên kết truy cập biên bản "${title}" cho đối tác!`);
  };

  const handleView = (id: number) => {
    navigate(`/minutes/${id}`);
  };

  const handleDownload = (title: string) => {
    toast.success(`Đang tải bản gốc: ${title}`);
  };

  const handleOpenHistory = () => {
    setShowHistoryPanel((prev) => !prev);
    toast.info(!showHistoryPanel ? "Đã bật bảng lịch sử ký số." : "Đã ẩn bảng lịch sử ký số.");
  };

  const handleCreateMinutes = () => {
    const newItem = {
      id: Date.now(),
      title: `Biên bản mới #${minutes.length + 1}`,
      date: "Vừa xong",
      type: "Nội bộ",
      status: "Draft",
      author: "Bạn",
      size: "640KB",
    };
    setMinutes([newItem, ...minutes]);
    toast.success("Đã tạo bản nháp biên bản mới.");
  };

  const handleTemplate = (name: string) => {
    const templated = {
      id: Date.now(),
      title: `${name} - Bản mới`,
      date: "Vừa xong",
      type: "Mẫu chuẩn",
      status: "Draft",
      author: "Bạn",
      size: "700KB",
    };
    setMinutes([templated, ...minutes]);
    toast.success(`Đã tạo biên bản từ mẫu: ${name}`);
  };

  const handleFilter = () => {
    setShowSignedOnly((prev) => !prev);
    toast.info(!showSignedOnly ? "Đang lọc chỉ biên bản đã ký." : "Đã bỏ lọc trạng thái ký.");
  };

  const handleDuplicateRow = (id: number) => {
    const row = minutes.find((item) => item.id === id);
    if (!row) return;
    setMinutes([{ ...row, id: Date.now(), title: `${row.title} (Bản sao)`, status: "Draft", date: "Vừa xong", author: "Bạn" }, ...minutes]);
    toast.success("Đã nhân bản biên bản.");
  };

  const handleToggleStatus = (id: number) => {
    setMinutes(
      minutes.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "Draft") return { ...item, status: "Pending" };
        if (item.status === "Pending") return { ...item, status: "Signed" };
        return { ...item, status: "Draft" };
      }),
    );
    toast.success("Đã cập nhật trạng thái biên bản.");
  };

  const handlePagination = (page: number) => {
    toast.info(`Đang chuyển sang trang ${page}`);
  };

  const visibleMinutes = minutes.filter((item) => {
    const byStatus = showSignedOnly ? item.status === "Signed" : true;
    const keyword = searchQuery.trim().toLowerCase();
    const byKeyword = keyword ? item.title.toLowerCase().includes(keyword) || item.author.toLowerCase().includes(keyword) : true;
    return byStatus && byKeyword;
  });

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Quản lý Biên bản</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Lập biên bản làm việc, ký số và lưu trữ hồ sơ pháp lý của dự án.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleOpenHistory} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
            <History size={16} />
            Lịch sử ký
          </button>
          <button onClick={handleCreateMinutes} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95">
            <Plus size={16} />
            Tạo biên bản mới
          </button>
        </div>
      </div>

      {/* Templates Feature */}
      <div className="group relative overflow-hidden rounded-xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-900/20">
        <PenTool size={80} className="absolute -bottom-4 -right-4 rotate-12 text-white opacity-10 transition-all duration-700 group-hover:rotate-0" />
        <div className="relative z-10 space-y-4 lg:w-2/3">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Tạo biên bản từ mẫu chuyên nghiệp</h3>
            <p className="text-xs font-medium text-slate-400">Sử dụng các mẫu biên bản đã được chuẩn hóa để tiết kiệm thời gian và đảm bảo tính pháp lý.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["BIÊN BẢN GHI NHỚ (MOU)", "BIÊN BẢN KHẢO SÁT", "BIÊN BẢN HỌP ĐOÀN"].map((tpl, i) => (
              <button key={i} onClick={() => handleTemplate(tpl)} className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-[9px] font-black text-white/80 transition-all hover:bg-white hover:text-slate-950 uppercase tracking-widest">
                {tpl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {showHistoryPanel && (
          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Lịch sử ký số gần đây</h3>
            <div className="mt-3 space-y-2 text-[11px] font-semibold text-slate-600">
              <p>10:15 - Biên bản Samsung được ký bởi Nguyễn Minh Châu.</p>
              <p>09:42 - Biên bản khảo sát KCN được gửi duyệt.</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="group relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Tìm tên biên bản, đối tác..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={handleFilter} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-400 transition-all hover:text-primary hover:bg-white">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {visibleMinutes.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-all hover:border-primary/30 hover:bg-white hover:shadow-md lg:flex-row lg:items-center"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md border",
                    item.status === "Signed" ? "bg-emerald-600 border-emerald-700 shadow-emerald-600/10" : item.status === "Pending" ? "bg-amber-500 border-amber-600 shadow-amber-500/10" : "bg-slate-500 border-slate-600 shadow-slate-500/10",
                  )}
                >
                  <FileText size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight">{item.title}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest", item.status === "Signed" ? "text-emerald-600" : "text-slate-400")}>
                      {item.status === "Signed" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {item.status === "Signed" ? "Đã ký số" : item.status === "Pending" ? "Chờ ký" : "Bản nháp"}
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Cập nhật: {item.date} &bull; {item.author}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleView(item.id)} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-950 hover:text-white">
                  <Eye size={14} /> Xem
                </button>
                <button onClick={() => handleDownload(item.title)} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-950 hover:text-white">
                  <Download size={14} /> Gốc
                </button>
                <button onClick={() => handleShare(item.title)} className="rounded border border-primary/20 bg-primary/5 p-2 text-primary transition-all hover:bg-primary hover:text-white shadow-sm">
                  <Share2 size={16} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-slate-300 transition-all hover:text-slate-600">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleStatus(item.id)}>Đổi trạng thái</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateRow(item.id)}>Nhân bản</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleShare(item.title)}>Chia sẻ nhanh</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination mockup */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Hiển thị 3 / 45 biên bản</p>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 rounded bg-slate-950 text-[10px] font-bold text-white shadow-md">1</button>
            <button onClick={() => handlePagination(2)} className="h-7 w-7 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-colors">2</button>
            <button onClick={() => handlePagination(3)} className="h-7 w-7 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-colors">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
