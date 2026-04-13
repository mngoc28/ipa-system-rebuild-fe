import { useState } from "react";
import { 
  Search, Filter, Plus, Clock, CheckCircle2, AlertCircle, 
  MessageSquare, Paperclip, MoreVertical, Calendar, Zap, X, Save, Eye, Copy, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Task {
  id: number;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "High" | "Urgent" | "Medium" | "Low";
  delegation: string;
  deadline: string;
  comments: number;
  files: number;
  overdue?: boolean;
}

export default function TaskListPage() {
  const [activeView, setActiveView] = useState("board");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>([
    { id: 1, title: "Chuẩn bị quà tặng lưu niệm (Nón lá & Cà phê)", status: "todo", priority: "High", delegation: "Đoàn Hàn Quốc", deadline: "12/04", comments: 3, files: 1 },
    { id: 2, title: "In ấn bộ tài liệu giới thiệu KCN (Tiếng Nhật)", status: "in-progress", priority: "Urgent", delegation: "Đoàn Nhật Bản", deadline: "Trong ngày", comments: 5, files: 2, overdue: true },
    { id: 3, title: "Gửi thư mời họp cho Sở Kế hoạch Đầu tư", status: "done", priority: "Medium", delegation: "Nội bộ", deadline: "Đã xong", comments: 0, files: 0 },
    { id: 4, title: "Xác nhận thực đơn tiệc tối tại Vinpearl", status: "todo", priority: "Medium", delegation: "Đoàn Singapore", deadline: "15/04", comments: 1, files: 0 },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    delegation: "Nội bộ",
    deadline: ""
  });

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error("Vui lòng nhập tiêu đề nhiệm vụ!");
      return;
    }
    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      status: "todo",
      priority: newTask.priority as any,
      delegation: newTask.delegation,
      deadline: newTask.deadline || "TBD",
      comments: 0,
      files: 0
    };
    setTaskList([task, ...taskList]);
    setIsModalOpen(false);
    setNewTask({ title: "", priority: "Medium", delegation: "Nội bộ", deadline: "" });
    toast.success("Nhiệm vụ mới đã được tạo!");
  };

  const toggleTaskStatus = (id: number) => {
    setTaskList(taskList.map(task => {
      if (task.id === id) {
        const nextStatus: Record<string, "todo" | "in-progress" | "done"> = {
          "todo": "in-progress",
          "in-progress": "done",
          "done": "todo"
        };
        return { ...task, status: nextStatus[task.status] };
      }
      return task;
    }));
    toast.info("Đã cập nhật trạng thái nhiệm vụ");
  };

  const handleTaskDetail = (task: Task) => {
    toast.info(`Chi tiết: ${task.title}`);
  };

  const duplicateTask = (task: Task) => {
    const copiedTask: Task = {
      ...task,
      id: Date.now(),
      title: `(Bản sao) ${task.title}`,
      status: "todo",
      overdue: false,
    };
    setTaskList([copiedTask, ...taskList]);
    toast.success("Đã nhân bản nhiệm vụ.");
  };

  const deleteTask = (task: Task) => {
    setTaskList(taskList.filter((item) => item.id !== task.id));
    toast.success("Đã xóa nhiệm vụ.");
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Nhiệm vụ của tôi</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý các đầu việc được giao và báo cáo tiến độ thực hiện.</p>
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
            <Plus size={16} />
            Thêm việc mới
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsBox label="TỔNG NHIỆM VỤ" value={taskList.length.toString()} icon={<Clock size={16} />} color="navy" />
        <StatsBox label="KHẨN CẤP / QUÁ HẠN" value={taskList.filter(t => t.priority === "Urgent" || t.overdue).length.toString()} icon={<AlertCircle size={16} />} color="rose" />
        <StatsBox label="ĐANG XỬ LÝ" value={taskList.filter(t => t.status === "in-progress").length.toString()} icon={<Zap size={16} />} color="amber" />
        <StatsBox label="HOÀN THÀNH" value={taskList.filter(t => t.status === "done").length.toString()} icon={<CheckCircle2 size={16} />} color="emerald" />
      </div>

      {/* Content View */}
      {activeView === "board" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <BoardColumn title="Cần xử lý" count={taskList.filter(t => t.status === "todo").length} color="slate" onAdd={() => setIsModalOpen(true)}>
            {taskList.filter(t => t.status === "todo").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusToggle={() => toggleTaskStatus(task.id)}
                onDetail={() => handleTaskDetail(task)}
                onDuplicate={() => duplicateTask(task)}
                onDelete={() => deleteTask(task)}
              />
            ))}
          </BoardColumn>
          <BoardColumn title="Đang thực hiện" count={taskList.filter(t => t.status === "in-progress").length} color="amber" onAdd={() => setIsModalOpen(true)}>
            {taskList.filter(t => t.status === "in-progress").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusToggle={() => toggleTaskStatus(task.id)}
                onDetail={() => handleTaskDetail(task)}
                onDuplicate={() => duplicateTask(task)}
                onDelete={() => deleteTask(task)}
              />
            ))}
          </BoardColumn>
          <BoardColumn title="Đã hoàn thành" count={taskList.filter(t => t.status === "done").length} color="emerald" onAdd={() => setIsModalOpen(true)}>
            {taskList.filter(t => t.status === "done").map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusToggle={() => toggleTaskStatus(task.id)}
                onDetail={() => handleTaskDetail(task)}
                onDuplicate={() => duplicateTask(task)}
                onDelete={() => deleteTask(task)}
              />
            ))}
          </BoardColumn>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100 px-4">
            {taskList.map(task => (
              <div key={task.id} className="flex items-center justify-between py-3.5 transition-all hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                      "group flex h-5 w-5 items-center justify-center rounded border transition-all",
                      task.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-primary"
                    )}
                  >
                    {task.status === "done" && <CheckCircle2 size={12} />}
                  </button>
                  <div>
                    <h4 className={cn("text-sm font-bold text-slate-900 uppercase tracking-tight", task.status === "done" && "line-through opacity-50")}>{task.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.delegation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("rounded px-2 py-0.5 text-[9px] font-black uppercase border tracking-widest", task.priority === "Urgent" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-200")}>
                    {task.priority}
                  </span>
                  <button onClick={() => handleTaskDetail(task)} className="rounded border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black text-slate-700 transition-all hover:bg-slate-900 hover:text-white uppercase tracking-widest">Chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl duration-300 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 className="text-sm font-black tracking-widest text-slate-900 uppercase">Thêm nhiệm vụ mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-600 border border-transparent hover:border-slate-100">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-6 p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tiêu đề nhiệm vụ</label>
                <input 
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Tiêu đề đầu việc cần xử lý..."
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleCreateTask()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mức ưu tiên</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-primary/30 focus:bg-white transition-all appearance-none"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                  >
                    <option value="Low">THẤP</option>
                    <option value="Medium">TRUNG BÌNH</option>
                    <option value="High">CAO</option>
                    <option value="Urgent">KHẨN CẤP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hạn chót</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-primary/30 focus:bg-white transition-all"
                    placeholder="VD: 20/04"
                    value={newTask.deadline}
                    onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 drop-shadow-md">
                <button 
                  onClick={handleCreateTask}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/95"
                >
                  <Save size={14} />
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardColumn({ title, count, color, children, onAdd }: any) {
  const colors: any = {
    slate: "bg-slate-100/40 text-slate-500",
    amber: "bg-amber-100/20 text-amber-600",
    emerald: "bg-emerald-100/20 text-emerald-600",
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
          <div className={cn("h-1.5 w-1.5 rounded-full", title.includes("hoàn thành") ? "bg-emerald-500" : "bg-primary")} />
          {title}
        </h3>
        <span className={cn("rounded px-2 py-0.5 text-[10px] font-black border border-slate-200/50 shadow-sm", colors[color])}>{count}</span>
      </div>
      <div className="min-h-[500px] space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/20 p-4 shadow-inner">
        {children}
        <button onClick={onAdd} className="w-full rounded-xl border border-dashed border-slate-200 py-6 text-[10px] font-black text-slate-400 transition-all hover:border-primary/50 hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-primary/5 uppercase tracking-widest active:scale-95">
          + Click để thêm việc mới
        </button>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusToggle,
  onDetail,
  onDuplicate,
  onDelete,
}: {
  task: Task;
  onStatusToggle: () => void;
  onDetail: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div 
      onClick={onStatusToggle}
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
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-500"
                aria-label="Mở menu thao tác nhiệm vụ"
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onDetail}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStatusToggle}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Đổi trạng thái
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Nhân bản
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa nhiệm vụ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h4 className={cn(
          "text-xs font-black leading-snug text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight",
          task.status === "done" && "line-through opacity-40 text-slate-400"
        )}>
          {task.title}
        </h4>

        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[8px] font-black text-slate-400 border border-slate-200">Đ</div>
          <p className="truncate text-[9px] font-black uppercase tracking-widest text-slate-400">{task.delegation}</p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span className="text-[10px] font-bold">{task.comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Paperclip size={12} />
              <span className="text-[10px] font-bold">{task.files}</span>
            </div>
          </div>

          <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest", task.overdue ? "text-rose-500" : "text-slate-400")}>
            <Calendar size={12} />
            {task.deadline}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBox({ label, value, icon, color }: any) {
  const colors: any = {
    navy: "text-slate-900 bg-white border-slate-200 shadow-sm",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
  return (
    <div className={cn("flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md", colors[color])}>
      <div>
        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{label}</p>
        <p className="text-2xl font-black tracking-tighter leading-none mt-1">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400">{icon}</div>
    </div>
  );
}
