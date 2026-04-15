import { useState } from "react";
import { FileStack, Upload, FolderPlus, Search, Filter, Grid, List, MoreVertical, FileText, FileImage, FileCode, Download, Share2, Trash2, ChevronRight, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DocumentListPage() {
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [showPdfOnly, setShowPdfOnly] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([
    { id: 1, name: "Chính sách ưu đãi đầu tư 2026.pdf", type: "pdf", size: "2.4MB", updated: "2 giờ trước", owner: "Trần Thu Hà" },
    { id: 2, name: "Bản đồ quy hoạch KCN SmartCity.png", type: "image", size: "12.8MB", updated: "1 ngày trước", owner: "Nguyễn Văn A" },
    { id: 3, name: "Danh sách doanh nghiệp HQ (Draft).docx", type: "docx", size: "850KB", updated: "Hôm qua", owner: "Trần Thu Hà" },
    { id: 4, name: "Biên bản thỏa thuận Samsung.pdf", type: "pdf", size: "1.5MB", updated: "3 ngày trước", owner: "Hồ Kỳ Minh" },
  ]);
  const [folders, setFolders] = useState([
    { id: 1, name: "Dự án Bán dẫn", count: 12 },
    { id: 2, name: "Tài liệu Pháp lý", count: 8 },
    { id: 3, name: "Hình ảnh thực địa", count: 24 },
  ]);

  const handleCreateFolder = () => {
    const nextIndex = folders.length + 1;
    const newFolder = { id: Date.now(), name: `Thư mục mới ${nextIndex}`, count: 0 };
    setFolders([newFolder, ...folders]);
    toast.success(`Đã tạo ${newFolder.name}`);
  };

  const handleUploadDocument = () => {
    const newDoc = {
      id: Date.now(),
      name: `Tai_lieu_moi_${documents.length + 1}.pdf`,
      type: "pdf",
      size: "1.1MB",
      updated: "Vừa xong",
      owner: "Bạn",
    };
    setDocuments([newDoc, ...documents]);
    toast.success("Đã tải lên 1 tài liệu mới.");
  };

  const handleOpenFolder = (folderName: string) => {
    setActiveFolder(folderName);
    toast.info(`Đang xem: ${folderName}`);
  };

  const handleFilter = () => {
    setShowPdfOnly((prev) => !prev);
    toast.info(!showPdfOnly ? "Đang lọc chỉ file PDF." : "Đã bỏ lọc PDF.");
  };

  const handleDuplicate = (name: string) => {
    const target = documents.find((d) => d.name === name);
    if (!target) return;
    const duplicated = { ...target, id: Date.now(), name: `${target.name} (Bản sao)`, updated: "Vừa xong", owner: "Bạn" };
    setDocuments([duplicated, ...documents]);
    toast.success(`Đã nhân bản: ${target.name}`);
  };

  const handleRename = (name: string) => {
    setDocuments(documents.map((doc) => (doc.name === name ? { ...doc, name: `${doc.name} (Đã cập nhật)` } : doc)));
    toast.success("Đã đổi tên tài liệu.");
  };

  const handleDownload = (name: string) => {
    toast.success(`Đang tải tài liệu: ${name}`);
  };

  const handleShare = (name: string) => {
    toast.success(`Đã chia sẻ tài liệu: ${name}`);
  };

  const handleDelete = (name: string) => {
    setDocuments(documents.filter((doc) => doc.name !== name));
    toast.error(`Đã xóa: ${name}`);
  };
  const visibleDocuments = documents.filter((doc) => {
    const byType = showPdfOnly ? doc.type === "pdf" : true;
    const bySearch = searchTerm.trim()
      ? doc.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || doc.owner.toLowerCase().includes(searchTerm.trim().toLowerCase())
      : true;
    return byType && bySearch;
  });

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Thư viện Tài liệu</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Lưu trữ, quản lý và chia sẻ tài liệu nghiệp vụ tập trung.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleCreateFolder} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
            <FolderPlus size={16} />
            Tạo thư mục
          </button>
          <button onClick={handleUploadDocument} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95">
            <Upload size={16} />
            Tải tài liệu lên
          </button>
        </div>
      </div>

      {/* Folders Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => handleOpenFolder(folder.name)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-100 transition-all group-hover:bg-slate-900 group-hover:text-white">
              <Folder size={24} fill="currentColor" className="opacity-20 group-hover:opacity-40" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{folder.name}</h4>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{folder.count} tài liệu</p>
            </div>
            <ChevronRight className="ml-auto text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" size={16} />
          </div>
        ))}
      </div>

      {activeFolder && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
          Đang xem thư mục: {activeFolder}
        </div>
      )}

      {/* Main Content Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="group relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Tìm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:bg-white focus:border-primary/30 focus:shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button 
                onClick={() => setViewMode("grid")} 
                className={cn("rounded-md p-1.5 transition-all", viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={cn("rounded-md p-1.5 transition-all", viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <List size={16} />
              </button>
            </div>
            <button onClick={handleFilter} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-400 transition-all hover:text-primary hover:bg-white">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Document Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/20 p-4 text-center transition-all hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 active:scale-95"
              >
                <div className="absolute right-1 top-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-50 hover:text-slate-600">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(doc.name)}>Đổi tên</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(doc.name)}>Nhân bản</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4 flex flex-col items-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 shadow-sm transition-all group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950">
                    {doc.type === "image" ? <FileImage size={24} /> : <FileText size={24} />}
                  </div>
                  <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] px-1 text-[11px] font-black uppercase tracking-tight leading-relaxed text-slate-800 transition-colors group-hover:text-primary">{doc.name}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{doc.size}</p>
                </div>

                <div className="flex items-center justify-center gap-1 border-t border-slate-100 pt-4">
                  <button onClick={() => handleDownload(doc.name)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-950 hover:text-white active:scale-90">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleShare(doc.name)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-950 hover:text-white active:scale-90">
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(doc.name)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-600 hover:text-white active:scale-90">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            {visibleDocuments.map((doc) => (
              <div key={doc.id} className="group flex items-center justify-between bg-white px-5 py-4 transition-all hover:bg-slate-50/80 active:bg-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-100 bg-slate-50 text-slate-400 group-hover:text-primary transition-colors">
                    <FileText size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{doc.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.updated}</span>
                  <span className="w-24 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">{doc.owner}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-2 text-slate-300 transition-all hover:bg-white hover:text-slate-600 active:scale-90 shadow-sm">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(doc.name)}>Đổi tên</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(doc.name)}>Nhân bản</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selection info and summary */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>Dung lượng: 24.5GB / 100GB (24.5%)</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
            0 tài liệu được chọn
          </p>
        </div>
      </div>
    </div>
  );
}
