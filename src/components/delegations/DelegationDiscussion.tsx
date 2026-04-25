import { forwardRef, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Send, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { 
  useDelegationCommentsQuery, 
  useAddDelegationCommentMutation,
  useUpdateDelegationCommentMutation,
  useDeleteDelegationCommentMutation
} from "@/hooks/useDelegationsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "@/api/teamsApi";
import type { DelegationCommentApiItem } from "@/api/delegationsApi";

/** Represents a team member that can be mentioned in a discussion. */
type TeamMemberMention = {
    id: string;
    name: string;
};

// A simple textarea that resizes to fit its content
const PlainTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    return <textarea ref={ref} {...props} />;
  }
);
PlainTextarea.displayName = "PlainTextarea";

/** Props for the DelegationDiscussion component. */
interface DelegationDiscussionProps {
    delegationId: string | number;
}

/**
 * A real-time discussion component for delegation teams.
 * Supports @mentions, rich text rendering for tags, and CRUD for comments.
 * 
 * @param props - Component props following DelegationDiscussionProps interface.
 */
export default function DelegationDiscussion({ delegationId }: DelegationDiscussionProps) {
  const [commentContent, setCommentContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: commentsData, isLoading } = useDelegationCommentsQuery(delegationId.toString());
  const currentUser = useAuthStore((state) => state.user);
  
  // Fetch system users for tagging - filtered by the current user's unit
  const { data: teamData } = useQuery({
    queryKey: ["team-members", mentionQuery, currentUser?.primary_unit_id],
    queryFn: () => teamsApi.getDashboard({ 
      pageSize: 100, 
      search: mentionQuery,
      unitId: currentUser?.primary_unit_id 
    }),
    enabled: !!currentUser,
  });
  const systemUsers = teamData?.members || [];

  const addCommentMutation = useAddDelegationCommentMutation();
  const updateCommentMutation = useUpdateDelegationCommentMutation();
  const deleteCommentMutation = useDeleteDelegationCommentMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of comments
  useEffect(() => {
    if (scrollRef.current && commentsData) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commentsData]);

  // Mention filtering logic - exclude current user and avoid empty names
  const filteredMembers = systemUsers.filter((m: TeamMemberMention) => 
    m.name && 
    m.id?.toString() !== currentUser?.id?.toString()
  ) || [];

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentContent(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const atSignIndex = textBeforeCursor.lastIndexOf("@");

    if (atSignIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atSignIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(textAfterAt);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (member: TeamMemberMention) => {
    if (!inputRef.current) return;
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = commentContent.slice(0, cursorPosition);
    const textAfterCursor = commentContent.slice(cursorPosition);
    const atSignIndex = textBeforeCursor.lastIndexOf("@");

    if (atSignIndex !== -1) {
      const newText =
        commentContent.slice(0, atSignIndex) +
        `@[${member.name}] ` +
        textAfterCursor;
      setCommentContent(newText);
      setShowMentions(false);
      inputRef.current.focus();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { id: delegationId.toString(), content: commentContent },
      {
        onSuccess: () => {
          setCommentContent("");
          setShowMentions(false);
        },
      }
    );
  };

  const handleStartEdit = (comment: DelegationCommentApiItem) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.comment_text);
    // Focus after render
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = (commentId: number) => {
    if (!editContent.trim() || updateCommentMutation.isPending) return;
    
    updateCommentMutation.mutate(
      { id: delegationId.toString(), commentId, content: editContent },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditContent("");
        }
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    
    deleteCommentMutation.mutate({ 
      id: delegationId.toString(), 
      commentId 
    });
  };

  /**
   * Helper to render comment text with highlighted mentions
   * Pattern: @[Name]
   */
  const renderCommentContent = (text: string, isMe: boolean) => {
    if (!text) return null;
    
    // Split by mention pattern @[Any name here]
    const parts = text.split(/(@\[[^\]]+\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@[') && part.endsWith(']')) {
        const name = part.slice(2, -1);
        return (
          <span 
            key={index} 
            className={`font-bold transition-colors ${
              isMe 
                ? "text-white underline decoration-white/30" 
                : "text-primary hover:text-primary/80"
            }`}
          >
            @{name}
          </span>
        );
      }
      return part;
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto rounded-t-xl bg-slate-50/50 p-6">
        {commentsData && commentsData.length > 0 ? (
          <>
            {commentsData.map((comment: DelegationCommentApiItem) => {
              const isMe = comment.commenter?.id === currentUser?.id;
              return (
                <div key={comment.id} className={`group/msg flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                    {comment.commenter?.avatar_url ? (
                      <img src={comment.commenter.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {comment.commenter?.full_name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-tight text-brand-text-dark">
                        {comment.commenter?.full_name || "Người dùng"}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        {format(new Date(comment.created_at), "HH:mm, dd/MM")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div
                        className={`whitespace-pre-wrap break-words rounded-2xl border p-3 text-sm shadow-sm ${
                          isMe
                            ? "rounded-tr-none border-primary bg-primary text-primary-foreground"
                            : "rounded-tl-none border-slate-100 bg-white text-slate-700"
                        } ${editingCommentId === comment.id ? "w-full min-w-[200px]" : ""}`}
                      >
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <PlainTextarea
                              ref={editInputRef}
                              className="min-h-[40px] w-full resize-none border-none bg-transparent text-sm outline-none focus:ring-0"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(Number(comment.id));
                                }
                                if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <div className="flex justify-end gap-1 pt-1 opacity-80">
                              <button 
                                onClick={handleCancelEdit}
                                className="rounded p-1 transition-colors hover:bg-white/20"
                                title="Hủy"
                              >
                                <X size={14} />
                              </button>
                              <button 
                                onClick={() => handleSaveEdit(Number(comment.id))}
                                disabled={!editContent.trim() || updateCommentMutation.isPending}
                                className="rounded p-1 transition-colors hover:bg-white/20 disabled:opacity-50"
                                title="Lưu"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          renderCommentContent(comment.comment_text, isMe)
                        )}
                      </div>

                      {/* Dropdown Menu for Owner */}
                      {isMe && editingCommentId !== comment.id && (
                        <div className="opacity-0 transition-opacity group-hover/msg:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 rounded-full text-slate-400 hover:text-slate-600">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-24">
                              <DropdownMenuItem onClick={() => handleStartEdit(comment)} className="cursor-pointer">
                                <Pencil className="mr-2 size-3.5" />
                                <span>Chỉnh sửa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteComment(Number(comment.id))} 
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-3.5" />
                                <span>Xóa</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-10 text-slate-400 opacity-50">
            <Send size={32} className="mb-2" />
            <p className="text-sm font-bold">Chưa có thảo luận nào.</p>
            <p className="text-xs">Hãy là người đầu tiên để lại tin nhắn.</p>
          </div>
        )}
      </div>

      {/* Comment Input Box */}
      <div className="relative rounded-b-xl border-t border-slate-100 bg-white p-4">
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-4 z-50 mb-2 w-64 rounded-xl border border-slate-100 bg-white p-1 shadow-2xl duration-200 animate-in fade-in slide-in-from-bottom-2">
            <p className="border-b border-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nhắc đến thành viên
            </p>
            <div className="max-h-48 overflow-auto">
              {filteredMembers.map((member) => (
                <button
                  key={member.id || member.name}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={(e) => {
                    e.preventDefault();
                    insertMention(member);
                  }}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                    <span className="text-[8px] font-bold text-slate-400">{member.name.charAt(0)}</span>
                  </div>
                  <span className="flex-1 truncate">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleAddComment} className="relative flex flex-col gap-2">
          <PlainTextarea
            ref={inputRef}
            placeholder="Nhập tin nhắn... (Dùng @ để nhắc đến người khác)"
            className="max-h-[150px] min-h-[60px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 pr-12 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            value={commentContent}
            onChange={handleCommentChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment(e);
              }
            }}
          />
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
            <Button
              type="submit"
              size="sm"
              disabled={!commentContent.trim() || addCommentMutation.isPending}
              className="size-8 rounded-lg bg-primary p-0 text-white shadow-md hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send size={14} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
