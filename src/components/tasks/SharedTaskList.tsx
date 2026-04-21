import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Plus, Clock, CheckCircle2, AlertCircle, 
  MessageSquare, Paperclip, MoreVertical, Calendar, Zap, Save, Eye, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/SelectField";
import { MultiSelectField } from "@/components/ui/MultiSelectField";
import { 
  useTasksListQuery, 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation 
} from "@/hooks/useTasksQuery";
import type { TaskUiItem, TaskStatus } from "@/dataHelper/tasks.dataHelper";
import TaskDetailDrawer from "./TaskDetailDrawer";
import { teamsApi } from "@/api/teamsApi";
import { useQuery } from "@tanstack/react-query";
import { useDelegationsQuery } from "@/hooks/useDelegationsQuery";

const TASK_PRIORITY_OPTIONS = [
  { label: "THẤP", value: "0" },
  { label: "TRUNG BÌNH", value: "1" },
  { label: "CAO", value: "2" },
  { label: "KHẨN CẤP", value: "3" },
];

const taskLoadingTimeoutMs = Number(import.meta.env.VITE_TASK_LOADING_TIMEOUT_MS ?? 12000);

export default function SharedTaskList() {
  const [activeView, setActiveView] = React.useState("board");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskUiItem | null>(null);
  const [searchTerm] = React.useState("");
  const [statusFilter] = React.useState<number | undefined>(undefined);
  const [page] = React.useState(1);
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTaskId = searchParams.get("taskId");

  const { tasks, tasksQuery, meta } = useTasksListQuery({
    search: searchTerm,
    status: statusFilter,
    page: page,
  });

  const { data: teamData } = useQuery({
    queryKey: ["team-members-for-tasks"],
    queryFn: () => teamsApi.getDashboard(),
  });

  const { delegationsQuery } = useDelegationsQuery({ per_page: 100 });

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const deleteMutation = useDeleteTaskMutation();
  const taskErrorMessage = tasksQuery.error instanceof Error ? tasksQuery.error.message : "Không thể tải danh sách nhiệm vụ.";

  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    priority: 1, // Medium
    dueAt: "",
    assignee_ids: [] as string[],
    delegation_id: "",
  });

  const memberOptions = (teamData?.data?.members || []).map(m => ({
    label: m.name,
    value: String(m.id),
  }));

  const delegationOptions = (delegationsQuery.data?.data?.items || []).map((d: { id: string | number; delegationName?: string; title?: string }) => ({
    label: d.delegationName || d.title || "Đoàn không tên",
    value: String(d.id),
  }));

  React.useEffect(() => {
    if (!tasksQuery.isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLoadingTimedOut(true);
    }, taskLoadingTimeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [tasksQuery.isLoading]);

  // Handle URL taskId
  React.useEffect(() => {
    if (urlTaskId && tasks.length > 0 && !selectedTask) {
      const task = tasks.find(t => String(t.id) === urlTaskId);
      if (task) {
        setSelectedTask(task);
        // Clear param to avoid re-opening on manual closure
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("taskId");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [urlTaskId, tasks, selectedTask, searchParams, setSearchParams]);

  const handleCreateTask = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!newTask.title) {
      toast.error("Vui lòng nhập tiêu đề nhiệm vụ!", { id: "tasks-required-title" });
      return;
    }
    createMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      due_at: newTask.dueAt || undefined,
      assignee_ids: newTask.assignee_ids.map(Number),
      delegation_id: newTask.delegation_id ? Number(newTask.delegation_id) : undefined,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewTask({ title: "", description: "", priority: 1, dueAt: "", assignee_ids: [], delegation_id: "" });
      }
    });
  };

  const handleToggleStatus = (task: TaskUiItem) => {
    const statusMap: Record<TaskStatus, number> = {
      Todo: 1,       // -> In-progress
      "In-progress": 2, // -> Done
      Done: 0,        // -> Todo
      Canceled: 1,    // -> In-progress
    };
    updateMutation.mutate({ id: task.id, payload: { status: statusMap[task.status] } });
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Nhiệm vụ hệ thống</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý và theo dõi tiến độ công việc tập trung.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setActiveView("board")}
              className={cn("rounded-md px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all", activeView === "board" ? "bg-white text-primary shadow-sm" : "text-slate-500")}
            >
              Bảng Kanban
            </button>
            <button
              onClick={() => setActiveView("list")}
              className={cn("rounded-md px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all", activeView === "list" ? "bg-white text-primary shadow-sm" : "text-slate-500")}
            >
              Danh sách
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95"
          >
            <Plus size={16} /> Thêm việc mới
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsBox label="TỔNG NHIỆM VỤ" value={meta?.total?.toString() ?? "0"} icon={<Clock size={16} />} color="navy" />
        <StatsBox label="KHẨN CẤP / QUÁ HẠN" value={tasks.filter(t => t.priority === "Urgent" || t.isOverdue).length.toString()} icon={<AlertCircle size={16} />} color="rose" />
        <StatsBox label="ĐANG XỬ LÝ" value={tasks.filter(t => t.status === "In-progress").length.toString()} icon={<Zap size={16} />} color="amber" />
        <StatsBox label="HOÀN THÀNH" value={tasks.filter(t => t.status === "Done").length.toString()} icon={<CheckCircle2 size={16} />} color="emerald" />
      </div>

      {/* Content View */}
      {tasksQuery.isLoading && !loadingTimedOut ? (
          <div className="flex h-40 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Đang đồng bộ dữ liệu nhiệm vụ...</div>
      ) : tasksQuery.isLoading && loadingTimedOut ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Đã quá thời gian tải dữ liệu</p>
          <p className="max-w-md text-sm font-medium text-amber-800">Hệ thống chưa phản hồi trong thời gian kỳ vọng. Vui lòng thử tải lại danh sách nhiệm vụ.</p>
          <button
            onClick={() => {
              setLoadingTimedOut(false);
              void tasksQuery.refetch();
            }}
            className="rounded-lg bg-amber-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-amber-700"
          >
            Thử lại
          </button>
        </div>
      ) : tasksQuery.isError ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được dữ liệu</p>
          <p className="max-w-md text-sm font-medium text-rose-700">{taskErrorMessage}</p>
          <button
            onClick={() => tasksQuery.refetch()}
            className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
          >
            Thử lại
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Chưa có nhiệm vụ nào</p>
          <p className="max-w-md text-sm text-slate-500">Tạo nhiệm vụ mới để bắt đầu theo dõi tiến độ công việc.</p>
        </div>
      ) : activeView === "board" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <BoardColumn title="Cần xử lý" count={tasks.filter(t => t.status === "Todo").length} color="slate" onAdd={() => setIsModalOpen(true)}>
            {tasks.filter(t => t.status === "Todo").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
                onStatusToggle={() => handleToggleStatus(task)}
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            ))}
          </BoardColumn>
          <BoardColumn title="Đang thực hiện" count={tasks.filter(t => t.status === "In-progress").length} color="amber" onAdd={() => setIsModalOpen(true)}>
            {tasks.filter(t => t.status === "In-progress").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
                onStatusToggle={() => handleToggleStatus(task)}
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            ))}
          </BoardColumn>
          <BoardColumn title="Đã hoàn thành" count={tasks.filter(t => t.status === "Done").length} color="emerald" onAdd={() => setIsModalOpen(true)}>
            {tasks.filter(t => t.status === "Done").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
                onStatusToggle={() => handleToggleStatus(task)}
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            ))}
          </BoardColumn>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100 px-4">
            {tasks.map(task => (
              <div key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="flex cursor-pointer items-center justify-between py-3.5 transition-all hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(task); }}
                    className={cn(
                      "group flex h-5 w-5 items-center justify-center rounded border transition-all",
                      task.status === "Done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-primary"
                    )}
                  >
                    {task.status === "Done" && <CheckCircle2 size={12} />}
                  </button>
                  <div>
                    <h4 className={cn("text-sm font-bold text-brand-text-dark uppercase tracking-tight", task.status === "Done" && "line-through opacity-50")}>{task.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giao bởi: {task.creator}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {task.assignees.length > 0 && (
                    <div className="flex -space-x-2">
                       {task.assignees.slice(0, 3).map(user => (
                         <div key={user.id} className="flex size-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100">
                           {user.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : <span className="text-[8px] font-bold text-slate-400">{user.name.charAt(0)}</span>}
                         </div>
                       ))}
                       {task.assignees.length > 3 && (
                         <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-black text-slate-500">
                           +{task.assignees.length - 3}
                         </div>
                       )}
                    </div>
                  )}
                  <span className={cn("rounded px-2 py-0.5 text-[9px] font-black uppercase border tracking-widest", task.priority === "Urgent" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-200")}>
                    {task.priority}
                  </span>
                  <button aria-label={`Xem chi tiết nhiệm vụ ${task.title}`} className="rounded border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-brand-dark-900 hover:text-white">Chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[95vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-none p-0 shadow-2xl sm:rounded-2xl">
          <DialogHeader className="border-b border-slate-100 bg-slate-50 px-6 py-5 text-left">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-brand-text-dark">
              Thêm nhiệm vụ mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-6 p-6">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tiêu đề nhiệm vụ</label>
              <input
                id="task-title"
                name="title"
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
                placeholder="Tiêu đề đầu việc cần xử lý..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-desc" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mô tả công việc</label>
              <textarea
                id="task-desc"
                className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-primary/30 focus:bg-white"
                placeholder="Nội dung chi tiết hồ sơ, yêu cầu..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="task-priority" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mức ưu tiên</label>
                <SelectField
                  id="task-priority"
                  value={String(newTask.priority)}
                  onValueChange={(v) => setNewTask({ ...newTask, priority: Number(v) })}
                  options={TASK_PRIORITY_OPTIONS}
                  triggerClassName="h-[50px] font-bold"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-due-at" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hạn chót</label>
                <input
                  id="task-due-at"
                  name="dueAt"
                  type="date"
                  className="h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-primary/30 focus:bg-white"
                  value={newTask.dueAt}
                  onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="task-assignees" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phân công cho</label>
                <MultiSelectField
                  id="task-assignees"
                  values={newTask.assignee_ids}
                  onValuesChange={(v) => setNewTask({ ...newTask, assignee_ids: v })}
                  options={memberOptions}
                  placeholder="Chọn thành viên..."
                  triggerClassName="h-[50px] font-bold"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-delegation" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Liên kết Hồ sơ Đoàn</label>
                <SelectField
                  id="task-delegation"
                  value={newTask.delegation_id}
                  onValueChange={(v) => setNewTask({ ...newTask, delegation_id: v })}
                  options={delegationOptions}
                  placeholder="Chọn hồ sơ đoàn (nếu có)..."
                  triggerClassName="h-[50px] font-bold"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
              >
                <Save size={14} />
                Xác nhận lưu
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer 
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}

function BoardColumn({ title, count, color, children, onAdd }: { title: string; count: number; color: "slate" | "amber" | "emerald"; children: React.ReactNode; onAdd: () => void }) {
  const colors: Record<"slate" | "amber" | "emerald", string> = {
    slate: "bg-slate-100/40 text-slate-500",
    amber: "bg-amber-100/20 text-amber-600",
    emerald: "bg-emerald-100/20 text-emerald-600",
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-text-dark">
          <div className={cn("h-1.5 w-1.5 rounded-full", title.includes("hoàn thành") ? "bg-emerald-500" : "bg-primary")} />
          {title}
        </h3>
        <span className={cn("rounded px-2 py-0.5 text-[10px] font-black border border-slate-200/50 shadow-sm", colors[color])}>{count}</span>
      </div>
      <div className="min-h-[400px] space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/20 p-4 shadow-inner">
        {children}
        <button onClick={onAdd} className="w-full rounded-xl border border-dashed border-slate-200 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-primary/50 hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95">
          + Click để thêm việc mới
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick, onStatusToggle, onDelete }: { task: TaskUiItem; onClick: () => void; onStatusToggle: () => void; onDelete: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between">
          <span className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest border", 
            task.priority === "Urgent" ? "bg-rose-500 text-white border-rose-600" : "bg-slate-50 text-slate-400 border-slate-100"
          )}>
            {task.priority}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label={`Mở tùy chọn nhiệm vụ ${task.title}`} title={`Mở tùy chọn nhiệm vụ ${task.title}`} onClick={(e) => e.stopPropagation()} className="rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100">
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onClick}><Eye className="mr-2 size-4" /> Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem onClick={onStatusToggle}><CheckCircle2 className="mr-2 size-4" /> Đổi trạng thái</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600"><Trash2 className="mr-2 size-4" /> Xóa nhiệm vụ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h4 className={cn("text-xs font-black leading-snug text-brand-text-dark transition-colors group-hover:text-primary uppercase tracking-tight", task.status === "Done" && "line-through opacity-40 text-slate-400")}>
          {task.title}
        </h4>

        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 truncate text-[9px] font-black uppercase tracking-widest text-slate-400">
             <Clock size={10} /> {task.creator}
          </p>
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((user) => (
              <div key={user.id} className="flex size-5 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm">
                {user.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : <span className="text-[7px] font-bold text-slate-400">{user.name.charAt(0)}</span>}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="flex size-5 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[7px] font-black text-slate-500">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex items-center gap-1"><MessageSquare size={12} /> <span className="text-[10px] font-bold">{task.commentsCount}</span></div>
            <div className="flex items-center gap-1"><Paperclip size={12} /> <span className="text-[10px] font-bold">{task.attachmentsCount}</span></div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest", task.isOverdue ? "text-rose-500" : "text-slate-400")}>
            <Calendar size={12} /> {task.dueAt}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBox({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: "navy" | "rose" | "amber" | "emerald" }) {
  const colors: Record<"navy" | "rose" | "amber" | "emerald", string> = {
    navy: "text-brand-text-dark bg-white border-slate-200 shadow-sm",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
  return (
    <div className={cn("flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md", colors[color])}>
      <div>
        <p className="mb-1 text-[9px] font-black uppercase leading-none tracking-[0.2em] opacity-60">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none tracking-tighter">{value}</p>
      </div>
      <div className="flex size-10 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm">{icon}</div>
    </div>
  );
}
