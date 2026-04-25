import * as React from "react";
import { Calendar, 
  UserPlus, Send, Trash2, FileIcon, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Drawer, DrawerContent, DrawerHeader, DrawerTitle 
} from "@/components/ui/drawer";
import { 
  useTaskCommentsQuery, 
  useAddCommentMutation, 
  useTaskAttachmentsQuery, 
  useUploadAttachmentMutation, 
  useDeleteAttachmentMutation,
  useUpdateTaskMutation
} from "@/hooks/useTasksQuery";
import type { TaskUiItem } from "@/dataHelper/tasks.dataHelper";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PlainTextarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { teamsApi, type TeamMemberItem } from "@/api/teamsApi";
import { useQuery } from "@tanstack/react-query";
import type { TaskAttachmentApiItem, TaskCommentApiItem } from "@/api/tasksApi";

interface TaskDetailDrawerProps {
  task: TaskUiItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailDrawer({ task, open, onOpenChange }: TaskDetailDrawerProps) {
  const [commentContent, setCommentContent] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: commentsData } = useTaskCommentsQuery(task?.id ? String(task.id) : "", open);
  const { data: attachmentsData } = useTaskAttachmentsQuery(task?.id ? String(task.id) : "");
  const addCommentMutation = useAddCommentMutation();
  const uploadAttachmentMutation = useUploadAttachmentMutation();
  const deleteAttachmentMutation = useDeleteAttachmentMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  // Fetch unit members for mentions and assignees
  const { data: teamData } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => teamsApi.getDashboard(),
  });

  const members = teamData?.members || [];

  const [mentionSearch, setMentionSearch] = React.useState({ query: "", index: 0 });
  const [showMentions, setShowMentions] = React.useState(false);

  const filteredMembers = members.filter((m: TeamMemberItem) => 
    m.name.toLowerCase().includes(mentionSearch.query.toLowerCase())
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setCommentContent(value);

    // Detect @ mention
    const textBeforeCursor = value.substring(0, cursorPosition);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      setShowMentions(true);
      setMentionSearch({ query: match[1], index: match.index! });
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: TeamMemberItem) => {
    const newText = 
      commentContent.substring(0, mentionSearch.index) + 
      `@[${member.name}] ` + 
      commentContent.substring(mentionSearch.index + mentionSearch.query.length + 1);
    setCommentContent(newText);
    setShowMentions(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentContent.trim()) return;

    addCommentMutation.mutate({ taskId: String(task.id), content: commentContent }, {
      onSuccess: () => setCommentContent("")
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!task || !file) return;

    // Check file format (allowed: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, zip)
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'zip'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error("Định dạng file không được hỗ trợ.");
      return;
    }

    uploadAttachmentMutation.mutate({ taskId: task.id, file });
  };

  const handleStatusChange = (newStatus: number) => {
    if (!task) return;
    updateTaskMutation.mutate({ id: task.id, payload: { status: newStatus } });
  };

  if (!task) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col sm:max-w-2xl">
        <DrawerHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border",
                  task.priority === "Khẩn cấp" ? "bg-rose-500 text-white border-rose-600" : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {task.priority}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  ID: #{task.id}
                </span>
              </div>
              <DrawerTitle className="mt-2 text-xl font-black uppercase tracking-tight text-brand-text-dark">
                {task.title}
              </DrawerTitle>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-6">
            <div className="space-y-8 py-6">
              {/* Actions & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
                    value={task.status === "Cần làm" ? 0 : task.status === "Đang xử lý" ? 1 : task.status === "Hoàn thành" ? 2 : 3}
                    onChange={(e) => handleStatusChange(Number(e.target.value))}
                  >
                    <option value={0}>CẦN XỬ LÝ</option>
                    <option value={1}>ĐANG THỰC HIỆN</option>
                    <option value={2}>ĐÃ HOÀN THÀNH</option>
                    <option value={3}>ĐÃ HỦY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hạn chót</p>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    {task.dueAt !== "N/A" ? format(new Date(task.dueAt), "dd/MM/yyyy", { locale: vi }) : "Chưa đặt"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mô tả nhiệm vụ</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700">
                  {task.description || "Không có mô tả chi tiết cho nhiệm vụ này."}
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người thực hiện</p>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase tracking-widest text-primary">
                    <UserPlus size={12} className="mr-1" /> Thêm người
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.assignees.length > 0 ? task.assignees.map(user => (
                    <div key={user.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
                      <div className="flex size-5 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                        {user.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : <span className="text-[8px] font-bold text-slate-400">{user.name.charAt(0)}</span>}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{user.name}</span>
                    </div>
                  )) : (
                    <span className="text-xs italic text-slate-400">Chưa được phân công cho ai.</span>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tệp đính kèm ({attachmentsData?.length || 0})</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[9px] font-black uppercase tracking-widest text-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={12} className="mr-1" /> Tải tệp lên
                  </Button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {attachmentsData?.map((file: TaskAttachmentApiItem) => (
                    <div key={file.id} className="group relative flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary/30 hover:shadow-sm">
                      <div className="flex size-8 items-center justify-center rounded bg-slate-50 text-slate-400">
                        <FileIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-brand-text-dark">{file.file_name}</p>
                        <p className="text-[9px] font-medium text-slate-400">{Math.round(file.file_size / 1024)} KB</p>
                      </div>
                      <button 
                        onClick={() => deleteAttachmentMutation.mutate({ taskId: task.id, attachmentId: String(file.id) })}
                        className="p-1 text-slate-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(!attachmentsData || attachmentsData.length === 0) && (
                    <div className="col-span-full rounded-lg border border-dashed border-slate-200 py-4 text-center">
                      <p className="text-xs italic text-slate-400">Chưa có tệp đính kèm.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thảo luận ({commentsData?.length || 0})</p>
                
                <div className="space-y-6">
                  {commentsData?.map((comment: TaskCommentApiItem) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-sm">
                        {comment.commenter?.avatar_url ? <img src={comment.commenter.avatar_url} alt="" className="size-full object-cover" /> : <span className="text-xs font-bold text-slate-400">{comment.commenter?.full_name?.charAt(0) || "U"}</span>}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight text-brand-text-dark">{comment.commenter?.full_name}</span>
                          <span className="text-[9px] font-medium text-slate-400">
                            {format(new Date(comment.created_at), "HH:mm, dd/MM", { locale: vi })}
                          </span>
                        </div>
                        <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 shadow-sm">
                          {comment.comment_text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="relative border-t bg-white p-4">
            {showMentions && filteredMembers.length > 0 && (
              <div className="absolute bottom-full left-4 z-[60] mb-2 w-64 rounded-xl border border-slate-100 bg-white p-1 shadow-2xl duration-200 animate-in fade-in slide-in-from-bottom-2">
                <p className="border-b border-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Nhắc tên thành viên</p>
                <div className="max-h-48 overflow-auto">
                  {filteredMembers.map(member => (
                    <button
                      key={member.id}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={() => insertMention(member)}
                    >
                      <div className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="size-full object-cover" /> : <span className="text-[8px] font-bold text-slate-400">{member.name.charAt(0)}</span>}
                      </div>
                      <span className="flex-1 truncate">{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleAddComment} className="relative">
              <PlainTextarea
                placeholder="Viết bình luận... (sử dụng @ để nhắc tên)"
                className="min-h-[100px] w-full resize-none rounded-xl border-slate-200 bg-slate-50 pr-12 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-primary/5"
                value={commentContent}
                onChange={handleTextChange}
              />
              <button 
                type="submit"
                className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
                disabled={!commentContent.trim() || addCommentMutation.isPending}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
