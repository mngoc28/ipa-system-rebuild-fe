import * as React from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  Layers3,
  MapPinned,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDashboardSummaryQuery, useDashboardTasksQuery } from "@/hooks/useDashboardQuery";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function CityOverviewPage() {
  const navigate = useNavigate();
  const summaryQuery = useDashboardSummaryQuery("director");
  const tasksQuery = useDashboardTasksQuery("director");

  const summary = summaryQuery.data?.data;
  const city = summary?.city;
  const taskItems = tasksQuery.data?.data?.items ?? [];
  const isLoading = summaryQuery.isLoading || tasksQuery.isLoading;
  const isError = summaryQuery.isError || tasksQuery.isError;

  const handleRefresh = () => {
    void summaryQuery.refetch();
    void tasksQuery.refetch();
  };

  if (isLoading) {
    return <CityOverviewSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Sparkles size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-brand-dark">Không tải được City Overview</h1>
            <p className="text-sm font-medium text-slate-500">Kiểm tra lại backend dashboard API rồi thử tải lại dữ liệu.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  const stageBreakdown = city?.stageBreakdown ?? [];
  const totalStages = stageBreakdown.reduce((sum, item) => sum + item.projectCount, 0) || 1;
  const recentProjects = city?.recentProjects ?? [];
  const upcomingEvents = city?.upcomingEventsList ?? [];
  const topPartners = city?.topPartners ?? [];
  const cityBrief = {
    activeShare:
      (city?.totalPipelineValue ?? 0) > 0 ? Math.round(((city?.activePipelineValue ?? 0) / (city?.totalPipelineValue ?? 0)) * 100) : 0,
    bottleneckStage: [...stageBreakdown].sort((left, right) => right.projectCount - left.projectCount)[0],
    nextEvent: upcomingEvents[0],
    topPartner: topPartners[0],
  };

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-brand-dark p-6 text-white shadow-2xl shadow-brand-dark/20 md:p-8"
        style={{
          background: "linear-gradient(135deg, hsl(var(--brand-dark)) 0%, hsl(var(--brand-dark-900)) 52%, #0f766e 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-14 top-6 size-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute right-0 top-0 size-52 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 size-36 rounded-full bg-cyan-400/15 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/80 backdrop-blur">
              <MapPinned size={12} />
              Live city overview
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                Tổng quan xúc tiến đầu tư thành phố
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-6 text-white/70 md:text-base">
                Dữ liệu tổng hợp trực tiếp từ partner, pipeline, delegation, event và task để lãnh đạo nhìn nhanh tình hình thành phố.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark transition hover:bg-slate-100"
              >
                <RefreshCw size={14} />
                Tải dữ liệu
              </button>
              <button
                onClick={() => navigate("/reports/city")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                <ArrowUpRight size={14} />
                Xem báo cáo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <HeroStat title="Đối tác" value={String(city?.partners ?? 0)} note="từ backend" icon={<Users size={16} />} />
              <HeroStat title="Pipeline" value={String(city?.pipelineProjects ?? 0)} note="dự án" icon={<Briefcase size={16} />} />
              <HeroStat title="Đoàn công tác" value={String(city?.activeDelegations ?? 0)} note="đang mở" icon={<ClipboardList size={16} />} />
              <HeroStat title="Sự kiện tới" value={String(city?.upcomingEvents ?? 0)} note="đã xếp lịch" icon={<CalendarDays size={16} />} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">KPI trọng tâm</p>
                  <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white">Dòng vốn & tiến độ</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 p-3 text-amber-300 shadow-inner">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricBlock label="Tổng giá trị pipeline" value={formatCurrency(city?.totalPipelineValue)} accent="from-emerald-400/25 to-emerald-500/10" />
                <MetricBlock label="Giá trị đang mở" value={formatCurrency(city?.activePipelineValue)} accent="from-cyan-400/25 to-cyan-500/10" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-brand-dark/40 p-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
                  <span>Pipeline stages</span>
                  <span>{totalStages} dự án</span>
                </div>
                <div className="mt-4 space-y-3">
                  {stageBreakdown.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-xs font-medium text-white/60">
                      Chưa có dữ liệu pipeline.
                    </div>
                  ) : (
                    stageBreakdown.map((item) => (
                      <div key={item.stageId} className="space-y-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-bold text-white/90">{formatDisplayLabel(item.stageName, "Chưa có giai đoạn")}</span>
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{item.projectCount} / {formatCurrency(item.totalValue)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-primary to-cyan-300"
                            style={{ width: `${Math.max(8, (item.projectCount / totalStages) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Strategic snapshot</p>
          <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-brand-dark">Điểm nóng quyết định hôm nay</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
            {cityBrief.activeShare >= 70
              ? "Pipeline đang có tỷ trọng mở tốt, có thể ưu tiên chốt các dự án lớn và giữ nhịp sự kiện đã lên lịch."
              : cityBrief.activeShare >= 40
                ? "Pipeline ở mức cân bằng, cần theo dõi stage chuyển đổi để tránh nghẽn giữa mở mới và chốt deal."
                : "Pipeline đang mỏng, cần tăng tốc tạo cơ hội mới và kiểm soát các stage chậm chuyển đổi."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => navigate("/reports/city")} className="rounded-xl bg-brand-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800">
              Mở báo cáo
            </button>
            <button onClick={() => navigate("/approvals")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50">
              Xem phê duyệt
            </button>
          </div>
        </div>

        <InsightCard title="Tỉ trọng pipeline mở" value={`${cityBrief.activeShare}%`} detail="Phần giá trị còn đang mở so với tổng pipeline" />
        <InsightCard
          title="Stage cần chú ý"
          value={formatDisplayLabel(cityBrief.bottleneckStage?.stageName, "Chưa xác định")}
          detail={cityBrief.bottleneckStage ? `${cityBrief.bottleneckStage.projectCount} dự án, ${formatCurrency(cityBrief.bottleneckStage.totalValue)}` : "Chưa có stage đủ dữ liệu"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          title="Sự kiện gần nhất"
          value={cityBrief.nextEvent ? formatDisplayLabel(cityBrief.nextEvent.title, "Sự kiện chưa đặt tên") : "Chưa có dữ liệu"}
          detail={cityBrief.nextEvent ? `${formatDateTime(cityBrief.nextEvent.startAt)} · ${formatDisplayLabel(cityBrief.nextEvent.locationName, "Chưa gắn địa điểm")}` : "Không có sự kiện sắp tới"}
        />
        <InsightCard
          title="Partner dẫn đầu"
          value={cityBrief.topPartner ? formatDisplayLabel(cityBrief.topPartner.partnerName, "Chưa có partner") : "Chưa có dữ liệu"}
          detail={cityBrief.topPartner ? `${cityBrief.topPartner.projectCount} dự án đang nối · score ${cityBrief.topPartner.score !== null ? cityBrief.topPartner.score.toFixed(2) : "N/A"}` : "Chưa có partner đủ dữ liệu"}
        />
        <InsightCard
          title="Tác vụ cần ưu tiên"
          value={taskItems.filter((task) => task.isOverdue || task.overdue || getPriorityLabel(task.priority) === "Urgent").length.toString()}
          detail="Số task quá hạn hoặc cần xử lý gấp từ feed hiện tại"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PanelCard title="Phân bổ pipeline" subtitle="Stage breakdown theo dữ liệu thật" icon={<Layers3 size={18} />}>
          <div className="space-y-4">
            {stageBreakdown.length === 0 ? (
              <EmptyState label="Chưa có dự án pipeline nào." />
            ) : (
              stageBreakdown.map((item) => (
                <div key={item.stageId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-brand-dark">{formatDisplayLabel(item.stageName, "Chưa có giai đoạn")}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{formatDisplayLabel(item.stageCode, "Không có mã")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-brand-dark">{item.projectCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">dự án</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-dark via-primary to-amber-400"
                      style={{ width: `${Math.max(6, (item.projectCount / totalStages) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Giá trị</span>
                    <span>{formatCurrency(item.totalValue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>

        <PanelCard title="Sự kiện sắp tới" subtitle="Lịch làm việc và khảo sát" icon={<CalendarDays size={18} />}>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <EmptyState label="Chưa có sự kiện nào trong lịch tới." />
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-lg hover:shadow-slate-100/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{formatDateTime(event.startAt)}</p>
                      <h3 className="text-sm font-black uppercase tracking-tight text-brand-dark">{formatDisplayLabel(event.title, "Sự kiện chưa đặt tên")}</h3>
                      <p className="text-[10px] font-medium text-slate-400">
                        {formatDisplayLabel(event.delegationName, "Không gắn đoàn")}
                        {event.locationName ? ` · ${formatDisplayLabel(event.locationName, "Không gắn địa điểm")}` : ""}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 transition group-hover:text-primary" />
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <PanelCard title="Dự án mới cập nhật" subtitle="5 bản ghi gần nhất từ pipeline" icon={<Briefcase size={18} />}>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <EmptyState label="Chưa có dự án nào." />
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-lg hover:shadow-slate-100/50">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{project.projectCode}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{formatDisplayLabel(project.stageName, "Chưa có giai đoạn")}</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-brand-dark">{formatDisplayLabel(project.projectName, "Dự án chưa đặt tên")}</h3>
                      <p className="text-[10px] font-medium text-slate-400">
                        {formatDisplayLabel(project.partnerName, "Chưa gắn partner")}
                        {project.delegationName ? ` · ${formatDisplayLabel(project.delegationName, "Chưa gắn đoàn")}` : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 lg:min-w-[220px]">
                      <MiniMetric label="Giá trị" value={formatCurrency(project.estimatedValue)} />
                      <MiniMetric label="Xác suất" value={project.successProbability !== null ? `${project.successProbability}%` : "N/A"} />
                      <MiniMetric label="Đóng dự kiến" value={formatDateOnly(project.expectedCloseDate)} />
                      <MiniMetric label="Cập nhật" value={formatDateOnly(project.updatedAt)} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>

        <PanelCard title="Đầu việc cần xử lý" subtitle="Task feed từ backend" icon={<ClipboardList size={18} />}>
          <div className="space-y-3">
            {taskItems.length === 0 ? (
              <EmptyState label="Chưa có task nào." />
            ) : (
              taskItems.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-tight text-brand-dark">{formatDisplayLabel(task.title, "Đầu việc chưa đặt tên")}</h3>
                      <span className={cn("rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em]", getPriorityClasses(task.priority))}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>{getTaskStatusLabel(task.status)}</span>
                      <span>·</span>
                      <span>{formatDateOnly(task.dueAt)}</span>
                      {task.isOverdue && <span className="text-rose-600">Quá hạn</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PanelCard title="Đối tác nổi bật" subtitle="Xếp hạng theo score và số dự án" icon={<BadgeDollarSign size={18} />}>
          <div className="space-y-3">
            {topPartners.length === 0 ? (
              <EmptyState label="Chưa có dữ liệu partner." />
            ) : (
              topPartners.map((partner, index) => (
                <div key={partner.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-dark text-sm font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black uppercase tracking-tight text-brand-dark">{partner.partnerName}</p>
                    <p className="text-[10px] font-medium text-slate-400">{partner.projectCount} dự án đang nối</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-brand-dark">{partner.score !== null ? partner.score.toFixed(2) : "N/A"}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">score</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>

        <PanelCard title="Điểm nhấn thành phố" subtitle="Tóm lược vận hành hiện tại" icon={<Building2 size={18} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricBlock label="Tổng dự án" value={String(city?.pipelineProjects ?? 0)} accent="from-brand-dark-900 to-slate-700" />
            <MetricBlock label="Đối tác" value={String(city?.partners ?? 0)} accent="from-primary to-primary/70" />
            <MetricBlock label="Đoàn đang mở" value={String(city?.activeDelegations ?? 0)} accent="from-amber-400 to-amber-300" />
            <MetricBlock label="Sự kiện tới" value={String(city?.upcomingEvents ?? 0)} accent="from-cyan-500 to-cyan-300" />
          </div>
        </PanelCard>
      </section>
    </div>
  );
}

function HeroStat({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/55">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-amber-300">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-[0.24em]">{title}</p>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{note}</p>
    </div>
  );
}

function MetricBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-gradient-to-br p-4", accent)}>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">{label}</p>
      <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function PanelCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-brand-dark">
            <span className="rounded-lg bg-brand-dark p-2 text-white">{icon}</span>
            <h2 className="text-base font-black uppercase tracking-tight">{title}</h2>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-[11px] font-black uppercase tracking-tight text-brand-dark">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm font-medium text-slate-500">{label}</div>;
}

function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className="mt-2 text-lg font-black uppercase tracking-tight text-brand-dark">{value}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function CityOverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-[360px] rounded-[2rem] bg-slate-200/80" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[420px] rounded-[1.75rem] bg-slate-100" />
        <div className="h-[420px] rounded-[1.75rem] bg-slate-100" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[360px] rounded-[1.75rem] bg-slate-100" />
        <div className="h-[360px] rounded-[1.75rem] bg-slate-100" />
      </div>
    </div>
  );
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return currencyFormatter.format(value);
}

function formatDateOnly(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return dateFormatter.format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function formatDisplayLabel(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  const lowered = normalized.toLowerCase();
  if (
    lowered.includes("seed") ||
    lowered.startsWith("ipa_") ||
    lowered.startsWith("name_vi_") ||
    lowered.startsWith("name_") ||
    lowered.startsWith("title_") ||
    lowered.startsWith("project_name_") ||
    lowered.startsWith("partner_name_")
  ) {
    return fallback;
  }

  return normalized;
}

function getTaskStatusLabel(status: string | number | undefined): string {
  const s = Number(status);
  if (s === 1 || status === "In Progress") return "Đang xử lý";
  if (s === 2 || status === "Completed") return "Hoàn thành";
  return "Chưa xử lý";
}

function getPriorityLabel(priority: string | number | undefined): string {
  const p = Number(priority);
  if (p === 3 || priority === "Urgent") return "Urgent";
  if (p === 2 || priority === "High") return "High";
  return "Normal";
}

function getPriorityClasses(priority: string | number | undefined): string {
  const p = Number(priority);
  if (p === 3 || priority === "Urgent") return "bg-rose-50 text-rose-600";
  if (p === 2 || priority === "High") return "bg-amber-50 text-amber-600";
  return "bg-slate-100 text-slate-500";
}
