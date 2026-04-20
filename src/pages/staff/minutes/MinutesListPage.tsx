import { useEffect, useState } from "react";
import { FileText, Plus, Search, Download, Share2, Eye, MoreVertical, CheckCircle2, Clock, History, PenTool, Filter, X } from "lucide-react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { delegationsApi } from "@/api/delegationsApi";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { mapMinutesStatus, minutesApi } from "@/api/minutesApi";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function MinutesListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSignedOnly, setShowSignedOnly] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const listQuery = useQuery({
    queryKey: ["minutes", page, pageSize, debouncedSearchQuery, showSignedOnly],
    queryFn: () =>
      minutesApi.list({
        page,
        pageSize,
        keyword: debouncedSearchQuery || undefined,
        status: showSignedOnly ? "FINAL" : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const delegationsQuery = useQuery({
    queryKey: ["delegations", "minutes-context"],
    queryFn: () => delegationsApi.list({ page: 1 }),
  });

  const firstDelegationId = delegationsQuery.data?.data?.items?.[0]?.id;

  const createMinutesMutation = useMutation({
    mutationFn: (payload: { title: string; delegationId: string; content?: string }) => minutesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minutes"] });
      toast.success("Đã tạo bản nháp biên bản mới.");
    },
  });

  const approveMinutesMutation = useMutation({
    mutationFn: (id: string) => minutesApi.approve(id, { decision: "APPROVE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minutes"] });
      toast.success("Đã cập nhật trạng thái biên bản.");
    },
    onError: () => {
      toast.error("Không thể chuyển trạng thái biên bản.");
    },
  });

  if (listQuery.isLoading || delegationsQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-sm font-semibold text-slate-500">
        <LoadingSpinner label="Đang tải biên bản..." />
      </div>
    );
  }

  if (listQuery.isError || delegationsQuery.isError) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">Không thể tải danh sách biên bản.</div>;
  }

  const minutes = (listQuery.data?.data?.items ?? []).map((item) => ({
    id: item.id,
    delegationId: item.delegationId,
    title: item.title,
    date: "Vừa cập nhật",
    type: item.eventId ? "Biên bản sự kiện" : "Biên bản đoàn",
    status: mapMinutesStatus(item.status),
    author: "Hệ thống",
    size: "--",
  }));

  const pagination = listQuery.data?.data?.meta;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? minutes.length;
  const pageLabelStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageLabelEnd = totalItems === 0 ? 0 : pageLabelStart + minutes.length - 1;
  const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleShare = (title: string) => {
    toast.success(`Đã gửi liên kết truy cập biên bản "${title}" cho đối tác!`);
  };

  const handleView = (id: string) => {
    navigate(`${id}`);
  };

  const handleDownload = (title: string) => {
    toast.success(`Đang tải bản gốc: ${title}`);
  };

  const handleOpenHistory = () => {
    setShowHistoryPanel((prev) => !prev);
    toast.info(!showHistoryPanel ? "Đã bật bảng lịch sử ký số." : "Đã ẩn bảng lịch sử ký số.");
  };

  const handleCreateMinutes = () => {
    if (!firstDelegationId) {
      toast.error("Không tìm thấy đoàn để tạo biên bản.");
      return;
    }
    createMinutesMutation.mutate(
      {
        title: `Biên bản mới #${minutes.length + 1}`,
        delegationId: String(firstDelegationId),
      },
      {
        onSuccess: (response) => {
          const newId = response.data?.id;
          if (newId) {
            navigate(`${newId}`);
            return;
          }
          toast.success("Đã tạo bản nháp biên bản mới.");
        },
        onError: () => {
          toast.error("Tạo biên bản thất bại.");
        },
      },
    );
  };

  const handleTemplate = (name: string) => {
    if (!firstDelegationId) {
      toast.error("Không tìm thấy đoàn để tạo từ mẫu.");
      return;
    }
    createMinutesMutation.mutate(
      {
        title: `${name} - Bản mới`,
        delegationId: String(firstDelegationId),
      },
      {
        onSuccess: (response) => {
          const newId = response.data?.id;
          if (newId) {
            navigate(`${newId}`);
            return;
          }
          toast.success(`Đã tạo biên bản từ mẫu: ${name}`);
        },
      },
    );
  };

  const handleFilter = () => {
    setShowSignedOnly((prev) => !prev);
    setPage(1);
    toast.info(!showSignedOnly ? "Đang lọc chỉ biên bản đã ký." : "Đã bỏ lọc trạng thái ký.");
  };

  const handleDuplicateRow = (id: string) => {
    const row = minutes.find((item) => item.id === id);
    if (!row) return;
    createMinutesMutation.mutate(
      {
        title: `${row.title} (Bản sao)`,
        delegationId: String(row.delegationId),
      },
      {
        onSuccess: (response) => {
          const newId = response.data?.id;
          if (newId) {
            navigate(`${newId}`);
            return;
          }
          toast.success("Đã nhân bản biên bản.");
        },
      },
    );
  };

  const handleToggleStatus = (id: string) => {
    const row = minutes.find((item) => item.id === id);
    if (!row) return;
    if (row.status === "Signed") {
      toast.info("Biên bản đã finalized, không thể đổi trạng thái tại danh sách.");
      return;
    }
    approveMinutesMutation.mutate(id);
  };

  const handlePagination = (page: number) => {
    setPage(page);
  };

  const visibleMinutes = minutes;

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-slate-900">Quản lý Biên bản</h1>
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
              <button key={i} onClick={() => handleTemplate(tpl)} className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white hover:text-slate-950">
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-10 py-2.5 text-[11px] font-bold outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={handleFilter} title="Bộ lọc biên bản" aria-label="Bộ lọc biên bản" className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-400 transition-all hover:bg-white hover:text-primary">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {listQuery.isFetching && !listQuery.data ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-sm font-semibold text-slate-500">
              <LoadingSpinner label="Đang cập nhật danh sách biên bản..." />
            </div>
          ) : visibleMinutes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">Không có biên bản phù hợp.</div>
          ) : visibleMinutes.map((item) => (
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
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 transition-colors group-hover:text-primary">{item.title}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest", item.status === "Signed" ? "text-emerald-600" : "text-slate-400")}>
                      {item.status === "Signed" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {item.status === "Signed" ? "Đã ký số" : item.status === "Pending" ? "Chờ ký" : "Bản nháp"}
                    </div>
                  </div>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
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
                <button onClick={() => handleShare(item.title)} title={`Chia sẻ nhanh ${item.title}`} aria-label={`Chia sẻ nhanh ${item.title}`} className="rounded border border-primary/20 bg-primary/5 p-2 text-primary shadow-sm transition-all hover:bg-primary hover:text-white">
                  <Share2 size={16} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-slate-300 transition-all hover:text-slate-600" title="Mở thêm tuỳ chọn" aria-label="Mở thêm tuỳ chọn">
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

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Hiển thị {pageLabelStart}-{pageLabelEnd} / {totalItems} biên bản
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {paginationPages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePagination(pageNumber)}
                  className={cn(
                    "h-7 w-7 rounded border text-[10px] font-bold transition-colors",
                    pageNumber === page ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50",
                  )}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
