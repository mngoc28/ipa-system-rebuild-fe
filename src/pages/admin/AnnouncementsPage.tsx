import * as React from "react";
import { 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Activity, 
  Database, 
  ExternalLink,
  Users,
  FileText,
  CheckSquare,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useAdminOperationalStats, 
  useAnnouncementsList, 
  useCreateAnnouncement, 
  useUpdateAnnouncement, 
  useDeleteAnnouncement 
} from "@/hooks/useAdminData";
import { Announcement } from "@/api/adminApi";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  // Data Fetching
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminOperationalStats();
  const { data: announcements, isLoading: annLoading, refetch: refetchAnnouncements } = useAnnouncementsList(searchTerm);

  // Mutations
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (values: Partial<Announcement>) => {
    try {
      if (editingAnnouncement) {
        await updateMutation.mutateAsync({ id: editingAnnouncement.id, data: values });
        toast.success("Cập nhật thông báo thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo thông báo mới thành công");
      }
      setIsFormModalOpen(false);
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Đã xóa thông báo");
      setDeletingId(null);
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleRefresh = async () => {
    const promise = Promise.all([refetchStats(), refetchAnnouncements()]);
    toast.promise(promise, {
      loading: "Đang cập nhật dữ liệu...",
      success: "Dữ liệu đã được làm mới",
      error: "Không thể làm mới dữ liệu",
    });
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Quản lý Thông báo</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Quản lý nội dung truyền thông nội bộ và giám sát trạng thái hệ thống.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus size={16} /> THÊM THÔNG BÁO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column: Management */}
        <div className="space-y-6 lg:col-span-3">
          {/* Stats Quick Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickStat 
              title="Đang hiển thị" 
              value={stats?.active_announcements?.toString() || "0"} 
              icon={<Bell size={18} />} 
              color="emerald" 
              loading={statsLoading} 
            />
            <QuickStat 
              title="Tổng lượt xem" 
              value="0" 
              icon={<Activity size={18} />} 
              color="blue" 
              loading={statsLoading} 
            />
            <QuickStat 
              title="Người dùng Online" 
              value={stats?.online_users?.toString() || "0"} 
              icon={<Users size={18} />} 
              color="slate" 
              loading={statsLoading} 
            />
          </div>

          {/* Table Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300">
            <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4 md:flex-row">
              <div className="relative w-full md:w-[350px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  placeholder="Tìm kiếm nội dung..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5" 
                />
              </div>
            </div>

            <div className="min-h-[400px] overflow-x-auto">
              {annLoading ? (
                <div className="space-y-4 p-6">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tiêu đề thông báo</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Loại</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {announcements?.items?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                              <Bell size={24} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Chưa có thông báo</p>
                              <p className="text-[10px] text-slate-400">Hãy tạo thông báo mới để gửi thông tin đến người dùng.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-2 h-8 px-4 text-[10px] font-black uppercase">
                              Tạo ngay
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      announcements?.items?.map((item: Announcement) => (
                        <tr key={item.id} className="group transition-all duration-300 animate-in slide-in-from-bottom-2 hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="line-clamp-1 text-xs font-bold text-brand-text-dark transition-colors group-hover:text-primary">{item.title}</span>
                              <span className="mt-0.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                ID: #{item.id} • {format(new Date(item.created_at), "HH:mm dd/MM/yyyy")}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <TypeBadge type={item.type as Announcement["type"]} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-[10px] font-medium text-slate-600">
                              <div>{item.starts_at ? format(new Date(item.starts_at), "dd/MM/yyyy") : "Luôn luôn"}</div>
                              <div className="text-slate-400">{item.ends_at ? format(new Date(item.ends_at), "dd/MM/yyyy") : "Không thời hạn"}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge item={item} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100">
                                  <MoreVertical size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex cursor-pointer items-center gap-2" onClick={() => handleOpenEdit(item)}>
                                  <Edit2 size={14} /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex cursor-pointer items-center gap-2 text-rose-600" 
                                  onClick={() => setDeletingId(item.id)}
                                >
                                  <Trash2 size={14} /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Operational Stats & Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-[11px] font-black uppercase tracking-wider text-brand-text-dark">
              <Activity size={14} className="text-primary" /> Thống kê vận hành
            </h3>
            <div className="space-y-4">
              <StatItem label="Người dùng Online" value={stats?.online_users?.toString() || "0"} icon={<Users size={14} />} color="emerald" loading={statsLoading} />
              <StatItem label="Hồ sơ mới (24h)" value={stats?.new_files_24h?.toString() || "0"} icon={<FileText size={14} />} color="blue" loading={statsLoading} />
              <StatItem label="Nhiệm vụ đang chạy" value={stats?.active_tasks?.toString() || "0"} icon={<CheckSquare size={14} />} color="orange" loading={statsLoading} />
              <StatItem label="Dung lượng lưu trữ" value={stats?.storage_used || "0 B"} icon={<Database size={14} />} color="slate" loading={statsLoading} />
            </div>
            <button 
              onClick={handleRefresh}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 active:scale-95"
            >
              <RefreshCw size={12} className={cn(statsLoading && "animate-spin")} /> LÀM MỚI DỮ LIỆU
            </button>
          </div>

          <div className="rounded-xl border border-dashed border-primary/10 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-3 text-[11px] font-black uppercase tracking-wider text-primary">Tài liệu quản trị</h3>
            <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
              Admin có thể tùy chỉnh các thông báo này để hướng dẫn người dùng sử dụng hệ thống hiệu quả.
            </p>
            <Link 
              to="/admin/guide"
              className="group flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline"
            >
              XEM HƯỚNG DẪN <ExternalLink size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="mb-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {editingAnnouncement ? <Edit2 size={20} /> : <Plus size={20} />}
              </div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-brand-text-dark">
                {editingAnnouncement ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <AnnouncementForm 
            initialData={editingAnnouncement}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormModalOpen(false)}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function QuickStat({ title, value, icon, color, loading }: { title: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "slate"; loading?: boolean }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200"
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <div className="flex items-center gap-2">
          {loading ? (
             <Skeleton className="mt-1 h-5 w-12" />
          ) : (
            <p className="mt-0.5 text-lg font-black leading-none text-brand-text-dark">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: "info" | "warning" | "success" }) {
  const styles = {
    info: "bg-blue-50 text-blue-600 border-blue-100",
    warning: "bg-orange-50 text-orange-600 border-orange-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const labels = { info: "Thông tin", warning: "Quan trọng", success: "Cập nhật" };
  const icons = { info: <Info size={10} />, warning: <AlertCircle size={10} />, success: <CheckCircle2 size={10} /> };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider", styles[type])}>
      {icons[type]} {labels[type]}
    </span>
  );
}

function StatusBadge({ item }: { item: Announcement }) {
  const now = new Date();
  const startsAt = item.starts_at ? new Date(item.starts_at) : null;
  const endsAt = item.ends_at ? new Date(item.ends_at) : null;

  let status: "active" | "expired" | "pending" | "hidden" = "active";
  
  if (!item.is_active) {
    status = "hidden";
  } else if (startsAt && isAfter(startOfDay(startsAt), startOfDay(now))) {
    status = "pending";
  } else if (endsAt && isBefore(endsAt, now)) {
    status = "expired";
  }

  const styles = {
    active: "text-emerald-600",
    expired: "text-slate-400",
    pending: "text-blue-500",
    hidden: "text-rose-500",
  };
  
  const labels = { 
    active: "Đang hiển thị", 
    expired: "Đã hết hạn", 
    pending: "Chờ hiệu lực",
    hidden: "Đang bị ẩn"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-1.5 w-1.5 rounded-full", 
        status === 'active' ? 'bg-emerald-500 animate-pulse' : 
        status === 'pending' ? 'bg-blue-500' : 
        status === 'hidden' ? 'bg-rose-500' : 'bg-slate-300'
      )} />
      <span className={cn("text-[10px] font-black uppercase tracking-widest", styles[status])}>
        {labels[status]}
      </span>
    </div>
  );
}

function StatItem({ label, value, icon, color, loading }: { label: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "orange" | "slate"; loading?: boolean }) {
  const iconColors = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    slate: "text-slate-500"
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <div className={cn("shrink-0", iconColors[color])}>{icon}</div>
        <span className="text-[10px] font-bold">{label}</span>
      </div>
      <div className="text-[11px] font-black text-brand-text-dark">
        {loading ? (
          <Skeleton className="h-3 w-10" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
