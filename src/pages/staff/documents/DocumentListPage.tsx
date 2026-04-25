import { useMemo, useState } from "react";
import { Upload, FolderPlus, Search, Filter, Grid, List, MoreVertical, FileText, FileImage, Download, Share2, Trash2, ChevronRight, Folder } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { documentsApi, toDocumentType, toSizeLabel, type FolderItem, type FileItem } from "@/api/documentsApi";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface UiDoc {
  id: string;
  name: string;
  type: "pdf" | "image" | "docx";
  size: string;
  updated: string;
  owner: string;
  folderId?: string | null;
  sizeBytes: number;
}

export default function DocumentListPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("grid");
  const [showPdfOnly, setShowPdfOnly] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: () => documentsApi.listFolders(),
  });

  const filesQuery = useQuery({
    queryKey: ["files", activeFolderId],
    queryFn: () => documentsApi.listFiles(activeFolderId ? { folderId: activeFolderId } : undefined),
  });

  const folders = foldersQuery.data?.items ?? [];
  const rawFiles = filesQuery.data?.items ?? [];

  const documents: UiDoc[] = useMemo(
    () =>
      rawFiles.map((file: FileItem) => ({
        id: file.id,
        name: file.fileName,
        type: toDocumentType(file.fileName),
        size: toSizeLabel(file.sizeBytes),
        updated: "Vừa cập nhật",
        owner: "Hệ thống",
        folderId: file.folderId,
        sizeBytes: file.sizeBytes,
      })),
    [rawFiles],
  );

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

  const patchFileMutation = useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => documentsApi.patchFile(id, { fileName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const handleCreateFolder = () => {
    createFolderMutation.mutate({
      folderName: `Thư mục mới ${folders.length + 1}`,
      scopeType: "GENERAL",
      parentFolderId: activeFolderId || undefined,
    });
  };

  const handleUploadDocument = () => {
    uploadMutation.mutate({
      fileName: `Tai_lieu_moi_${documents.length + 1}.pdf`,
      sizeBytes: 1_200_000,
      folderId: activeFolderId || undefined,
    });
  };

  const handleOpenFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    const folder = folders.find((item) => item.id === folderId);
    toast.info(`Đang xem: ${folder?.folderName || "Thư mục"}`);
  };

  const handleFilter = () => {
    setShowPdfOnly((prev) => !prev);
    toast.info(!showPdfOnly ? "Đang lọc chỉ file PDF." : "Đã bỏ lọc PDF.");
  };

  const handleDuplicate = (doc: UiDoc) => {
    uploadMutation.mutate({
      fileName: `${doc.name} (Bản sao)`,
      sizeBytes: doc.sizeBytes,
      folderId: doc.folderId || activeFolderId || undefined,
    });
  };

  const handleRename = (doc: UiDoc) => {
    patchFileMutation.mutate(
      {
        id: doc.id,
        fileName: `${doc.name} (Đã cập nhật)`,
      },
      {
        onSuccess: () => toast.success("Đã đổi tên tài liệu."),
        onError: () => toast.error("Không thể đổi tên tài liệu."),
      },
    );
  };

  const handleDownload = (doc: UiDoc) => {
    documentsApi
      .createDownloadUrl(doc.id)
      .then(() => toast.success(`Đã tạo liên kết tải: ${doc.name}`))
      .catch(() => toast.error("Không thể tạo liên kết tải xuống."));
  };

  const handleShare = (doc: UiDoc) => {
    documentsApi
      .shareFile(doc.id, { permissionLevel: "VIEW", sharedWithRoleId: "staff" })
      .then(() => toast.success(`Đã chia sẻ tài liệu: ${doc.name}`))
      .catch(() => toast.error("Không thể chia sẻ tài liệu."));
  };

  const handleDelete = (docName: string) => {
    toast.warning(`Chưa có endpoint xóa file. Bỏ qua thao tác xóa: ${docName}`);
  };

  const visibleDocuments = documents.filter((doc) => {
    const byType = showPdfOnly ? doc.type === "pdf" : true;
    const bySearch = searchTerm.trim()
      ? doc.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || doc.owner.toLowerCase().includes(searchTerm.trim().toLowerCase())
      : true;
    return byType && bySearch;
  });

  const activeFolderName = activeFolderId ? folders.find((item: FolderItem) => item.id === activeFolderId)?.folderName : null;

  if (foldersQuery.isLoading || filesQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner label="Đang tải tài liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Thư viện Tài liệu</h1>
          <p className="mt-1 text-sm font-semibold text-brand-text-dark/60">Lưu trữ, quản lý và chia sẻ tài liệu nghiệp vụ tập trung.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleCreateFolder} className="flex items-center gap-2 rounded-lg border border-brand-dark/10 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-text-dark/70 shadow-sm transition-all hover:bg-brand-dark/[0.03]">
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
        {folders.map((folder: FolderItem) => (
          <div
            key={folder.id}
            onClick={() => handleOpenFolder(folder.id)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-brand-dark/10 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex size-12 items-center justify-center rounded-lg border border-brand-dark/5 bg-brand-dark/[0.02] text-brand-text-dark/40 transition-all group-hover:bg-brand-dark-900 group-hover:text-white">
              <Folder size={24} fill="currentColor" className="opacity-20 group-hover:opacity-40" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-text-dark">{folder.folderName}</h4>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-text-dark/40">{rawFiles.filter((f: FileItem) => f.folderId === folder.id).length} tài liệu</p>
            </div>
            <ChevronRight className="ml-auto text-brand-text-dark/20 opacity-0 transition-opacity group-hover:opacity-100" size={16} />
          </div>
        ))}
      </div>

      {activeFolderName && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
          Đang xem thư mục: {activeFolderName}
        </div>
      )}

      <div className="rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="group relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-dark/40" size={16} />
            <input
              placeholder="Tìm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:border-primary/30 focus:bg-white focus:shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-brand-dark/5 p-1">
              <button onClick={() => setViewMode("grid")} title="Chế độ lưới" aria-label="Chế độ lưới" className={cn("rounded-md p-1.5 transition-all", viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-brand-text-dark/40 hover:text-brand-text-dark/70")}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode("list")} title="Chế độ danh sách" aria-label="Chế độ danh sách" className={cn("rounded-md p-1.5 transition-all", viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-brand-text-dark/40 hover:text-brand-text-dark/70")}>
                <List size={16} />
              </button>
            </div>
            <button onClick={handleFilter} title="Bộ lọc tài liệu" aria-label="Bộ lọc tài liệu" className="rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] p-2 text-brand-text-dark/40 transition-all hover:bg-white hover:text-primary">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative overflow-hidden rounded-xl border border-brand-dark/5 bg-brand-dark/[0.01] p-4 text-center transition-all hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-brand-dark/5 active:scale-95"
              >
                <div className="absolute right-1 top-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-brand-text-dark/20 opacity-0 transition-opacity hover:bg-brand-dark/[0.02] hover:text-brand-text-dark/70 group-hover:opacity-100" title="Mở thêm tuỳ chọn" aria-label="Mở thêm tuỳ chọn">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(doc)}>Đổi tên</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(doc)}>Nhân bản</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4 flex flex-col items-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-xl border border-brand-dark/5 bg-white text-brand-text-dark/40 shadow-sm transition-all group-hover:border-brand-dark group-hover:bg-brand-dark group-hover:text-white">
                    {doc.type === "image" ? <FileImage size={24} /> : <FileText size={24} />}
                  </div>
                  <h4 className="mb-2 line-clamp-2 min-h-10 px-1 text-[11px] font-black uppercase leading-relaxed tracking-tight text-brand-text-dark transition-colors group-hover:text-primary">{doc.name}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-dark/40">{doc.size}</p>
                </div>

                <div className="flex items-center justify-center gap-1 border-t border-brand-dark/5 pt-4">
                  <button onClick={() => handleDownload(doc)} title={`Tải xuống ${doc.name}`} aria-label={`Tải xuống ${doc.name}`} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-brand-dark hover:text-white active:scale-90">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleShare(doc)} title={`Chia sẻ ${doc.name}`} aria-label={`Chia sẻ ${doc.name}`} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-brand-dark hover:text-white active:scale-90">
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(doc.name)} title={`Xóa ${doc.name}`} aria-label={`Xóa ${doc.name}`} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-destructive hover:text-white active:scale-90">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-brand-dark/5 overflow-hidden rounded-xl border border-brand-dark/10 shadow-sm">
            {visibleDocuments.map((doc) => (
              <div key={doc.id} className="group flex items-center justify-between bg-white px-5 py-4 transition-all hover:bg-brand-dark/[0.02] active:bg-brand-dark/5">
                <div className="flex items-center gap-4">
                  <div className="flex size-8 items-center justify-center rounded border border-brand-dark/5 bg-brand-dark/[0.02] text-brand-text-dark/40 transition-colors group-hover:text-primary">
                    <FileText size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight text-brand-text-dark/80">{doc.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-dark/40">{doc.updated}</span>
                  <span className="w-24 text-right text-[9px] font-black uppercase tracking-widest text-brand-text-dark/40">{doc.owner}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-2 text-brand-text-dark/20 shadow-sm transition-all hover:bg-white hover:text-brand-text-dark/70 active:scale-90" title="Mở thêm tuỳ chọn" aria-label="Mở thêm tuỳ chọn">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(doc)}>Đổi tên</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(doc)}>Nhân bản</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(doc.name)}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-brand-dark/5 pt-4 text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-dark/40">
          <p>
            Dung lượng: {toSizeLabel(rawFiles.reduce((sum: number, item: FileItem) => sum + item.sizeBytes, 0))} / 100GB
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-dark/10" />
            {visibleDocuments.length} tài liệu hiển thị
          </p>
        </div>
      </div>
    </div>
  );
}
