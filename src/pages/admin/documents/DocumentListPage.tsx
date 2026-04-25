import { useMemo, useState } from "react";
import { Upload, FolderPlus, Search, MoreVertical, ChevronRight, Folder, FileText, Grid, List, Filter } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type FolderItem, type FileItem, documentsApi, toDocumentType, toSizeLabel } from "@/api/documentsApi";

export default function DocumentListPage() {
  const queryClient = useQueryClient();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showPdfOnly, setShowPdfOnly] = useState(false);

  const foldersQuery = useQuery({
    queryKey: ["folders", activeFolderId],
    queryFn: () => documentsApi.listFolders(activeFolderId ? { parentId: activeFolderId } : undefined),
  });

  const filesQuery = useQuery({
    queryKey: ["files", activeFolderId],
    queryFn: () => documentsApi.listFiles(activeFolderId ? { folderId: activeFolderId } : undefined),
  });

  const items = useMemo(() => {
    const folders = (foldersQuery.data?.items || []) as FolderItem[];
    const files = (filesQuery.data?.items || []) as FileItem[];
    return {
      folders: folders.map((f) => ({ ...f, type: "folder" })),
      files: files.map((f) => ({
        ...f,
        type: "file",
        name: f.fileName,
        docType: toDocumentType(f.fileName),
        sizeLabel: toSizeLabel(f.sizeBytes),
      })),
    };
  }, [foldersQuery.data, filesQuery.data]);

  const createFolderMutation = useMutation({
    mutationFn: documentsApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Đã tạo thư mục mới.");
    },
    onError: () => toast.error("Không thể tạo thư mục."),
  });

  const uploadMutation = useMutation({
    mutationFn: documentsApi.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("Đã tải lên 1 tài liệu mới.");
    },
    onError: () => toast.error("Tải tài liệu thất bại."),
  });

  const handleCreateFolder = () => {
    createFolderMutation.mutate({
      folderName: `Thư mục mới ${items.folders.length + 1}`,
      scopeType: "GENERAL",
      parentFolderId: activeFolderId || undefined,
    });
  };

  const handleUploadDocument = () => {
    uploadMutation.mutate({
      fileName: `Tai_lieu_moi_${items.files.length + 1}.pdf`,
      sizeBytes: 1_200_000,
      folderId: activeFolderId || undefined,
    });
  };

  const handleFolderClick = (folderId: string, folderName: string) => {
    setActiveFolderId(folderId);
    toast.info(`Đang xem: ${folderName}`);
  };

  const handleDelete = (docName: string) => {
    toast.warning(`Chưa có endpoint xóa file: ${docName}`);
  };

  const handleFilter = () => {
    setShowPdfOnly(!showPdfOnly);
    toast.info(!showPdfOnly ? "Đã lọc chỉ hiển thị file PDF" : "Đã hủy lọc file PDF");
  };

  const visibleFiles = items.files.filter((file) => {
    const bySearch = searchTerm.trim()
      ? file.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      : true;
    const byType = showPdfOnly ? file.docType === "pdf" : true;
    return bySearch && byType;
  });

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Thư viện Tài liệu</h1>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => handleFolderClick(folder.id, folder.folderName)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all group-hover:bg-brand-dark-900 group-hover:text-white">
              <Folder size={24} fill="currentColor" className="opacity-20 group-hover:opacity-40" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-text-dark">{folder.folderName}</h4>
            </div>
            <ChevronRight className="ml-auto text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" size={16} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="group relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Tìm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:border-primary/30 focus:bg-white focus:shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                title="Chế độ Lưới"
                className={`rounded-md p-1.5 transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Chế độ Danh sách"
                className={`rounded-md p-1.5 transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={16} />
              </button>
            </div>
            <button 
              onClick={handleFilter} 
              title="Bộ lọc tài liệu"
              className={`rounded-lg border p-2 transition-all ${showPdfOnly ? "border-primary/30 bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {visibleFiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
              Không tìm thấy tài liệu nào.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleFiles.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-primary shadow-sm transition-transform group-hover:scale-110">
                    <FileText size={28} />
                  </div>
                  <div className="text-center">
                    <h4 className="line-clamp-1 text-[11px] font-black uppercase tracking-widest text-brand-text-dark" title={doc.name}>{doc.name}</h4>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-tighter text-slate-400">{doc.sizeLabel} • {doc.docType}</p>
                  </div>
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("Đang phát triển tính năng đổi tên")}>Đổi tên</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Đang phát triển tính năng nhân bản")}>Nhân bản</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleFiles.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/40 p-4 transition-all hover:border-primary/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm transition-transform group-hover:scale-110">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-text-dark">{doc.name}</h4>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-tighter text-slate-400">{doc.sizeLabel} • {doc.docType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-lg p-2 text-slate-300 shadow-sm transition-all hover:bg-white hover:text-slate-600 active:scale-90"
                        title="Mở thêm tuỳ chọn"
                        aria-label="Mở thêm tuỳ chọn"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Đang phát triển tính năng đổi tên")}>Đổi tên</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Đang phát triển tính năng nhân bản")}>Nhân bản</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>
            Dung lượng: {toSizeLabel(items.files.reduce((sum, item) => sum + item.sizeBytes, 0))} / 100GB
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-slate-300" />
            {visibleFiles.length} tài liệu hiển thị
          </p>
        </div>
      </div>
    </div>
  );
}
