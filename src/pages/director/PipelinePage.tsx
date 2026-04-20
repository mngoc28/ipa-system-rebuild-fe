import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Download, LayoutGrid, Plus, Search, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { pipelineApi, PipelineProject } from "@/api/pipelineApi";
import { ProjectFunnel } from "@/components/pipeline/ProjectFunnel";
import { SharedProjectList } from "@/components/pipeline/SharedProjectList";
import { SharedProjectForm } from "@/components/pipeline/SharedProjectForm";
import { SharedProjectDetail } from "@/components/pipeline/SharedProjectDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { projectDataHelper } from "@/dataHelper/projects.dataHelper";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function DirectorPipelinePage() {
  const queryClient = useQueryClient();
  const [stageFilter, setStageFilter] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<PipelineProject | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<PipelineProject | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["pipeline-summary"],
    queryFn: pipelineApi.summary,
  });

  const projectsQuery = useQuery({
    queryKey: ["pipeline-projects", stageFilter],
    queryFn: () => pipelineApi.listProjects(stageFilter ? { stage_id: stageFilter } : {}),
  });

  const summary = summaryQuery.data?.data;
  const projects = projectsQuery.data?.data?.items || [];
  const visibleProjects = projects.filter((project) => !isPlaceholderProject(project.project_code, project.project_name));
  const filteredProjects = projects.filter((project) => {
    const keyword = searchTerm.toLowerCase();
    return visibleProjects.includes(project) && (project.project_name.toLowerCase().includes(keyword) || project.project_code.toLowerCase().includes(keyword));
  });

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: PipelineProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleView = (project: PipelineProject) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleDelete = async (project: PipelineProject) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dự án ${project.project_name}?`)) {
      return;
    }

    try {
      await pipelineApi.deleteProject(project.id);
      toast.success("Đã xóa dự án");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] }),
        queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] }),
      ]);
    } catch {
      toast.error("Không thể xóa dự án");
    }
  };

  const handlePatchStage = async (id: string, currentStage: string) => {
    const stages = ["LEAD", "CONTACTED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[(currentIndex + 1) % stages.length];

    try {
      await pipelineApi.patchStage(id, nextStage, "Quick transition from Director view");
      toast.success(`Đã chuyển sang giai đoạn ${nextStage}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] }),
        queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] }),
      ]);
    } catch {
      toast.error("Không thể chuyển giai đoạn");
    }
  };

  const isLoading = summaryQuery.isLoading || projectsQuery.isLoading;
  const isError = summaryQuery.isError || projectsQuery.isError;

  if (isLoading) {
    return <PipelineSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <TrendingUp size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">Không tải được Pipeline</h1>
            <p className="text-sm font-medium text-slate-500">Kiểm tra lại backend pipeline API rồi thử tải lại dữ liệu.</p>
          </div>
          <button
            onClick={() => {
              void summaryQuery.refetch();
              void projectsQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
          >
            <TrendingUp size={14} />
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  const stageFilterItems = [
    { value: "", label: "Tất cả" },
    ...(summary.stageBreakdown ?? []).map((stage) => ({ value: stage.stageCode, label: projectDataHelper.getStageLabel(stage.stageCode) })),
  ];
  const countryBreakdown = (summary.countryBreakdown ?? []).filter((item) => !isPlaceholderName(item.countryName));
  const sectorBreakdown = (summary.sectorBreakdown ?? []).filter((item) => !isPlaceholderName(item.sectorName));

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Director Pipeline</p>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-slate-900">Pipeline Xúc tiến Đầu tư</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi và quản lý phễu dòng vốn đầu tư chiến lược bằng dữ liệu thật từ backend.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus size={14} /> Tạo dự án mới
          </button>
          <button
            onClick={() => toast.success("Đã tạo gói xuất báo cáo")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <Download size={14} /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng dự án" value={String(summary.stats.projects)} note="từ backend" icon={<LayoutGrid size={18} />} color="blue" />
        <StatCard title="Đang mở" value={String(summary.stats.activeProjects)} note="stage còn hoạt động" icon={<TrendingUp size={18} />} color="emerald" />
        <StatCard title="Đã chốt" value={String(summary.stats.closedWonProjects)} note="closed won" icon={<Target size={18} />} color="amber" />
        <StatCard title="Tỉ lệ thành công" value={`${summary.stats.averageProbability.toFixed(1)}%`} note="xác suất trung bình" icon={<BarChart3 size={18} />} color="purple" />
      </div>

      <ProjectFunnel projects={visibleProjects} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 font-title text-lg font-black uppercase tracking-tight text-slate-900">
              <Target size={20} className="text-primary" /> Dự án trọng điểm
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input placeholder="Tìm dự án..." className="h-9 pl-9 text-xs" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </div>
          </div>

          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-2">
            {stageFilterItems.map((item) => (
              <button
                key={item.value || "all"}
                onClick={() => setStageFilter(item.value)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all",
                  stageFilter === item.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <SharedProjectList projects={filteredProjects} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} onPatchStage={handlePatchStage} />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col justify-between rounded-xl border border-primary/10 bg-primary p-6 text-white shadow-xl shadow-primary/20">
            <div className="space-y-5">
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/5 bg-white/10 text-amber-300 shadow-inner">
                <TrendingUp size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black uppercase tracking-tight">Dòng vốn 2026</h3>
                <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-white/50">
                  Tổng giá trị pipeline: <span className="font-black text-amber-300">{formatCurrency(summary.value.total)}</span>
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <SummaryLine label="Giá trị đang mở" value={formatCurrency(summary.value.active)} />
                <SummaryLine label="Nhóm giai đoạn" value={`${summary.stageBreakdown.length} nhóm`} />
                <SummaryLine label="KPI trung bình" value={`${summary.stats.averageProbability.toFixed(1)}%`} />
              </div>
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 active:scale-[0.98]">
              Xem phân tích tài chính sâu
            </button>
          </div>

          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-50 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Phân bổ quốc gia</h3>
            <div className="space-y-4">
              {countryBreakdown.length === 0 ? (
                <EmptyState label="Chưa có dữ liệu quốc gia." />
              ) : (
                countryBreakdown.map((item) => (
                  <BreakdownItem key={item.countryName} label={item.countryName} value={`${item.projectCount} dự án`} percent={Math.max(10, Math.round((item.projectCount / Math.max(1, summary.stats.projects)) * 100))} color="bg-blue-600" />
                ))
              )}
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-50 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Phân bổ lĩnh vực</h3>
            <div className="space-y-4">
              {sectorBreakdown.length === 0 ? (
                <EmptyState label="Chưa có dữ liệu lĩnh vực." />
              ) : (
                sectorBreakdown.map((item, index) => (
                  <BreakdownItem
                    key={item.sectorName}
                    label={item.sectorName}
                    value={`${item.projectCount} dự án`}
                    percent={Math.max(10, Math.round((item.projectCount / Math.max(1, summary.stats.projects)) * 100))}
                    color={sectorColors[index % sectorColors.length]}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{editingProject ? "Cập nhật dự án" : "Thêm dự án pipeline mới"}</DialogTitle>
          </DialogHeader>
          <SharedProjectForm
            initialData={editingProject}
            onSuccess={() => {
              setIsFormOpen(false);
              void queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] });
              void queryClient.invalidateQueries({ queryKey: ["pipeline-summary"] });
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary">Chi tiết dự án</DialogTitle>
          </DialogHeader>
          {selectedProject && <SharedProjectDetail project={selectedProject} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, note, icon, color }: { title: string; value: string; note: string; icon: React.ReactNode; color: "blue" | "emerald" | "amber" | "purple" }) {
  const colors = {
    blue: "text-blue-600 bg-white border-blue-100",
    emerald: "text-emerald-600 bg-white border-emerald-100",
    amber: "text-amber-600 bg-white border-amber-100",
    purple: "text-purple-600 bg-white border-purple-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/40 active:scale-[0.98]">
      <div className="absolute right-[-10px] top-[-10px] size-20 rounded-full bg-slate-50 opacity-40 transition-all group-hover:scale-110 group-hover:bg-primary/10" />
      <div className="relative z-10 space-y-5">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-all group-hover:scale-110", colors[color])}>{icon}</div>
        <div>
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="text-3xl font-black tracking-tighter text-slate-950">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <TrendingUp size={14} className="animate-pulse" /> {note}
        </div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[11px] font-bold">
      <span className="uppercase tracking-tight text-white/60">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function BreakdownItem({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold">
        <span className="uppercase tracking-tight text-slate-500">{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm font-medium text-slate-500">{label}</div>;
}

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="h-14 w-2/3 rounded-2xl bg-slate-200" />
        <div className="h-10 w-56 rounded-2xl bg-slate-200" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-[260px] rounded-2xl bg-slate-100" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[420px] rounded-2xl bg-slate-100 lg:col-span-2" />
        <div className="h-[420px] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

const sectorColors = ["bg-blue-600", "bg-amber-600", "bg-violet-600", "bg-emerald-600"];

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function isPlaceholderName(value: string): boolean {
  const lowered = value.toLowerCase();
  return lowered.includes("seed") || lowered.startsWith("name_vi_") || lowered.startsWith("name_en_") || lowered.startsWith("ipa_");
}

function isPlaceholderProject(code: string, name: string): boolean {
  const loweredCode = code.toLowerCase();
  const loweredName = name.toLowerCase();

  return loweredCode.includes("seed") || loweredCode.startsWith("ipa_") || loweredName.includes("seed") || loweredName.startsWith("project_name_") || loweredName.startsWith("copilot qa");
}
