import * as React from "react";
import { Mail, Shield, MessageSquare, UserPlus, Zap, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamsApi, type TeamCreateMemberPayload, type OrgUnitItem } from "@/api/teamsApi";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SelectField } from "@/components/ui/SelectField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 8;
const POSITION_OPTIONS = ["Chuyên viên", "Chuyên viên chính", "Phó phòng", "Trưởng phòng"];

const emptyForm = (): TeamCreateMemberPayload => ({
  fullName: "",
  email: "",
  username: "",
  phone: "",
  positionTitle: "Chuyên viên",
  unitId: undefined,
});

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState<TeamCreateMemberPayload>(emptyForm());
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);

  const unitsQuery = useQuery({
    queryKey: ["teams-units"],
    queryFn: () => teamsApi.listUnits(),
  });

  const teamsQuery = useQuery({
    queryKey: ["teams", page, PAGE_SIZE],
    queryFn: () => teamsApi.getDashboard({ page, pageSize: PAGE_SIZE }),
    placeholderData: (previousData) => previousData,
  });

  const createMemberMutation = useMutation({
    mutationFn: (payload: TeamCreateMemberPayload) => teamsApi.createMember(payload),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      const createdName = data.data?.name || "thành viên mới";
      setLastAction(`Đã thêm ${createdName}`);
      setCreateOpen(false);
      setForm(emptyForm());
      setPage(1);
      toast.success("Đã thêm thành viên mới vào đội.");
    },
    onError: () => toast.error("Không thể thêm thành viên mới."),
  });

  const members = teamsQuery.data?.data?.members ?? [];
  const activities = teamsQuery.data?.data?.activities ?? [];
  const summary = teamsQuery.data?.data?.summary;
  const meta = teamsQuery.data?.meta;
  const totalPages = Math.max(1, meta?.totalPages || meta?.total_pages || 1);
  const units = unitsQuery.data?.data?.items ?? [];

  React.useEffect(() => {
    if (!teamsQuery.isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLoadingTimedOut(true);
    }, 12000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [teamsQuery.isLoading]);

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Vui lòng nhập họ tên và email.");
      return;
    }

    createMemberMutation.mutate({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      username: form.username?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      positionTitle: form.positionTitle?.trim() || undefined,
      unitId: form.unitId,
    });
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Đội nhóm & Nhân sự</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Quản lý hiệu suất và lịch trình làm việc của phòng ban.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-dark-900 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-brand-dark-900/10 transition-all hover:bg-slate-800 active:scale-95"
        >
          <UserPlus size={16} /> THÊM THÀNH VIÊN
        </button>
      </div>

      {lastAction && <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">{lastAction}</div>}

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <TeamStat label="Tổng nhân sự" value={summary.totalMembers} accent="slate" />
          <TeamStat label="Đang văn phòng" value={summary.inOffice} accent="emerald" />
          <TeamStat label="Đang công tác" value={summary.onField} accent="amber" />
          <TeamStat label="Nghỉ phép" value={summary.onLeave} accent="rose" />
        </div>
      )}

      {teamsQuery.isLoading && !loadingTimedOut && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-sm font-medium text-slate-500 shadow-sm">
          <LoadingSpinner label="Đang tải dữ liệu đội nhóm..." />
        </div>
      )}

      {teamsQuery.isLoading && loadingTimedOut && (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Đã quá thời gian tải dữ liệu đội nhóm</p>
          <p className="max-w-md text-sm font-medium text-amber-800">Hệ thống chưa phản hồi trong thời gian kỳ vọng. Vui lòng thử tải lại danh sách đội nhóm.</p>
          <button
            onClick={() => {
              setLoadingTimedOut(false);
              void teamsQuery.refetch();
            }}
            className="rounded-lg bg-amber-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-amber-700"
          >
            Thử lại
          </button>
        </div>
      )}

      {teamsQuery.isError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700 shadow-sm">Không thể tải dữ liệu đội nhóm.</div>}

      {members.length === 0 && !teamsQuery.isLoading && <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">Chưa có thành viên nào trên trang hiện tại.</div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <div key={member.id} className="group rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <div className="relative mb-4 inline-block">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md">
                <img src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} className="size-full object-cover" />
              </div>
              <div
                className={cn(
                  "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm",
                  member.status === "In Office" ? "bg-emerald-500" : member.status === "On Field" ? "bg-amber-500" : "bg-slate-300",
                )}
              />
            </div>

            <div className="mb-4 space-y-0.5">
              <h3 className="text-sm font-bold text-brand-text-dark">{member.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{member.role}</p>
            </div>

            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Hiệu suất</span>
                <span className="text-brand-text-dark">{member.performance}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    member.performance > 90 ? "bg-emerald-500" : member.performance > 75 ? "bg-blue-500" : "bg-amber-500",
                  )}
                  style={{ width: `${member.performance}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span>{member.email}</span>
                <span>{member.tasks} việc</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-50 pt-2">
              <button
                aria-label={`Giao việc cho ${member.name}`}
                title={`Giao việc cho ${member.name}`}
                onClick={() => navigate(`/tasks?openCreate=true&memberId=${member.id}`)}
                className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary"
              >
                <ClipboardList size={16} />
              </button>
              <button aria-label={`Gửi email cho ${member.name}`} title={`Gửi email cho ${member.name}`} onClick={() => setLastAction(`Đã tạo email cho ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <Mail size={16} />
              </button>
              <button aria-label={`Mở chat với ${member.name}`} title={`Mở chat với ${member.name}`} onClick={() => setLastAction(`Đã mở chat nội bộ với ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <MessageSquare size={16} />
              </button>
              <button aria-label={`Mở phân quyền cho ${member.name}`} title={`Mở phân quyền cho ${member.name}`} onClick={() => setLastAction(`Đã mở phân quyền cho ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <Shield size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Trang {meta?.page || page} / {totalPages} {meta?.total ? `- ${meta.total} nhân sự` : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || teamsQuery.isFetching}>
            <ChevronLeft size={16} /> Trước
          </Button>
          <div className="flex items-center gap-1">
            {buildPaginationPages(page, totalPages).map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm font-black text-slate-400">...</span>
              ) : (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    "min-w-9 rounded-md border px-3 py-2 text-sm font-black transition-all",
                    pageNumber === page ? "border-primary bg-primary text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary",
                  )}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || teamsQuery.isFetching}>
            Sau <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-brand-dark p-6 text-white shadow-xl shadow-brand-dark/20 lg:p-10">
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="max-w-lg space-y-6">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/5 bg-white/10 text-amber-400 shadow-inner">
              <Zap size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-title text-2xl font-black uppercase tracking-tight">Trạng thái hạ tầng công việc</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Hiện có {summary?.totalMembers ?? members.length} đầu mối đang theo dõi trong phòng ban. Hiệu suất trung bình toàn bộ phận đạt <span className="font-bold text-white">{members.length > 0 ? Math.round(members.reduce((sum, member) => sum + member.performance, 0) / members.length) : 0}%</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5">
                <p className="text-xl font-black">{summary?.inOffice ?? 0}</p>
                <p className="text-[9px] font-black uppercase text-slate-500">Đang văn phòng</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5">
                <p className="text-xl font-black">{summary?.onField ?? 0}</p>
                <p className="text-[9px] font-black uppercase text-slate-500">Đang công tác</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-5 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:w-80">
            <h4 className="border-b border-white/5 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Nhật ký hoạt động</h4>
            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{act.user}</p>
                    <p className="truncate text-[10px] text-slate-400">{act.action}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[8px] font-black uppercase text-slate-500">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Thêm thành viên</DialogTitle>
            <DialogDescription>Nhập thông tin nhân sự để tạo mới trong đội nhóm.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Họ và tên" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} placeholder="Nguyễn Văn A" id="team-fullname" />
            <Field label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="a.nv@danang.gov.vn" id="team-email" />
            <Field label="Tên đăng nhập" value={form.username || ""} onChange={(value) => setForm((current) => ({ ...current, username: value }))} placeholder="nguyenvana" id="team-username" />
            <Field label="Số điện thoại" value={form.phone || ""} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} placeholder="0900000000" id="team-phone" />
            <div className="space-y-1.5 text-left">
              <label htmlFor="team-position" className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Chức danh</label>
              <SelectField
                id="team-position"
                value={form.positionTitle || ""}
                onValueChange={(value) => setForm((current) => ({ ...current, positionTitle: value }))}
                options={POSITION_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
                placeholder="Chọn chức danh"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label htmlFor="team-unit" className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Đơn vị</label>
              <SelectField
                id="team-unit"
                value={form.unitId?.toString() || ""}
                onValueChange={(value) => setForm((current) => ({ ...current, unitId: value.trim() ? Number(value) : undefined }))}
                options={units.map((unit: OrgUnitItem) => ({ value: unit.id, label: `${unit.unitName} (${unit.unitCode})` }))}
                placeholder={unitsQuery.isLoading ? "Đang tải đơn vị..." : "Chọn đơn vị"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={createMemberMutation.isPending}>
              {createMemberMutation.isPending ? <LoadingSpinner variant="small" label="Đang lưu..." /> : "Tạo thành viên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamStat({ label, value, accent }: { label: string; value: number; accent: "slate" | "emerald" | "amber" | "rose" }) {
  const accentClasses = {
    slate: "border-slate-200 bg-white text-brand-text-dark",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", accentClasses[accent])}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
      />
    </div>
  );
}


function buildPaginationPages(currentPage: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("...");
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
}
