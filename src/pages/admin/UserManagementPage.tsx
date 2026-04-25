import * as React from "react";
import { toast } from "sonner";
import { Users, UserPlus, Search, Filter, MoreVertical, ShieldCheck, Mail, Building, UserCheck, Edit2, Trash2, Lock, AlertTriangle, Camera, UserCircle, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SelectField } from "@/components/ui/SelectField";
import { profileApi } from "@/api/profileApi";
import { AvatarCropper } from "@/components/shared/AvatarCropper";
import {
  useAdminUserQuery,
  useAdminUsersListQuery,
  useDeleteAdminUserMutation,
  useCreateAdminUserMutation,
  useLockAdminUserMutation,
  usePatchAdminUserMutation,
  useAdminRolesQuery,
  useAdminUnitsQuery,
  useResetAdminPasswordMutation,
} from "@/hooks/useAdminUsersQuery";
import { MultiSelectField } from "@/components/ui/MultiSelectField";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";

const USER_STATUS_OPTIONS = [
  { label: "Hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
];

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string;
  status: "active" | "inactive";
  avatar?: string;
  locked: boolean;
}

interface UserFormState {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  unitId: string;
  roleIds: string[];
  status: "active" | "inactive";
  password?: string;
  confirmPassword?: string;
}

const defaultCreateForm = (): UserFormState => {
  const timestamp = Date.now();

  return {
    username: `user${timestamp}`,
    fullName: `Người dùng mới #${String(timestamp).slice(-4)}`,
    email: `user${timestamp}@danang.gov.vn`,
    phone: "0900000000",
    unitId: "1", // Default to first unit if possible
    roleIds: ["staff"],
    status: "active",
    password: "",
    confirmPassword: "",
  };
};

const buildEditForm = (user: DisplayUser): UserFormState => ({
  username: user.email.split("@")[0] || `user${user.id}`,
  fullName: user.name,
  email: user.email,
  phone: "0900000000",
  unitId: user.unit === "UNIT-UNKNOWN" ? "1" : user.unit,
  roleIds: user.role ? [user.role.toLowerCase()] : ["staff"],
  status: user.status,
});

const buildEditFormFromApi = (user: {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role_codes?: string[];
  unit: { id: string; unit_code?: string; unit_name?: string } | null;
  status: string;
  locked: boolean;
}): UserFormState => ({
  username: user.email.split("@")[0] || `user${user.id}`,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || "",
  unitId: user.unit?.id ? String(user.unit.id) : "1",
  roleIds: user.role_codes || ["staff"],
  status: user.status === "active" && !user.locked ? "active" : "inactive",
});

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeOnly, setActiveOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [lockOpen, setLockOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<DisplayUser | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = React.useState<DisplayUser | null>(null);
  const [resetTargetUser, setResetTargetUser] = React.useState<DisplayUser | null>(null);
  const [createForm, setCreateForm] = React.useState<UserFormState>(defaultCreateForm());
  const [editForm, setEditForm] = React.useState<UserFormState>(defaultCreateForm());
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);
  const [autoRetriedEmpty, setAutoRetriedEmpty] = React.useState(false);
  const [cropImage, setCropImage] = React.useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: rolesData, isLoading: rolesLoading } = useAdminRolesQuery();
  const { data: unitsData, isLoading: unitsLoading } = useAdminUnitsQuery();

  const roleOptions = React.useMemo(() => {
    const items = rolesData?.data?.items || (Array.isArray(rolesData?.data) ? rolesData.data : []);
    return items.map((r: { name: string; code?: string; id: string | number }) => ({ label: r.name, value: r.code || String(r.id) }));
  }, [rolesData]);

  const unitOptions = React.useMemo(() => {
    const items = unitsData?.data?.items || (Array.isArray(unitsData?.data) ? unitsData.data : []);
    return items.map((u: { unitName?: string; unit_name?: string; id: string | number }) => ({ label: u.unitName || u.unit_name || "Unknown", value: String(u.id) }));
  }, [unitsData]);
  const pageSize = 5;

  const usersQuery = useAdminUsersListQuery({
    keyword: searchTerm || undefined,
    status: activeOnly ? "active" : undefined,
    page,
    pageSize,
  });

  const createMutation = useCreateAdminUserMutation();
  const patchMutation = usePatchAdminUserMutation();
  const lockMutation = useLockAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();
  const resetMutation = useResetAdminPasswordMutation();
  const adminUserQuery = useAdminUserQuery(editingUserId ?? undefined, editOpen);

  const users: DisplayUser[] = React.useMemo(() => {
    const rawUsers = usersQuery.data?.data?.items || [];
    return rawUsers.map((user) => {
      const roleCode = (user.role_codes?.[0] || "admin").toLowerCase();
      const role = roleCode.charAt(0).toUpperCase() + roleCode.slice(1);
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role,
        unit: user.unit?.unit_code || user.unit?.unit_name || user.unit?.id || "UNIT-UNKNOWN",
        status: user.status === "active" && !user.locked ? "active" : "inactive",
        locked: user.locked,
        avatar: user.avatar,
      };
    });
  }, [usersQuery.data]);

  const filteredUsers = users;
  const totalPages = Math.max(1, usersQuery.data?.meta?.totalPages || 1);
  const normalizedPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const inactiveUsers = users.length - activeUsers;
  const units = new Set(users.map((user) => user.unit)).size;
  const isBusy = createMutation.isPending || patchMutation.isPending || lockMutation.isPending || deleteMutation.isPending || resetMutation.isPending;

  React.useEffect(() => {
    if (!usersQuery.isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLoadingTimedOut(true);
    }, 12000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [usersQuery.isLoading]);

  React.useEffect(() => {
    if (searchTerm || activeOnly || page !== 1 || usersQuery.isFetching || autoRetriedEmpty) {
      return;
    }

    if ((usersQuery.data?.data?.items?.length ?? 0) === 0) {
      setAutoRetriedEmpty(true);
      void usersQuery.refetch();
    }
  }, [activeOnly, autoRetriedEmpty, page, searchTerm, usersQuery]);

  React.useEffect(() => {
    if (!createOpen) {
      setCreateForm(defaultCreateForm());
    }
  }, [createOpen]);

  React.useEffect(() => {
    if (editOpen && selectedUser) {
      setEditForm(buildEditForm(selectedUser));
    }
  }, [editOpen, selectedUser]);

  React.useEffect(() => {
    if (!deleteOpen) {
      setDeleteTargetUser(null);
    }
  }, [deleteOpen]);

  React.useEffect(() => {
    if (!resetOpen) {
      setResetTargetUser(null);
    }
  }, [resetOpen]);

  React.useEffect(() => {
    if (editOpen && adminUserQuery.data?.data) {
      setEditForm(buildEditFormFromApi(adminUserQuery.data.data));
    }
  }, [editOpen, adminUserQuery.data]);

  const handleOpenCreate = () => {
    setCreateForm(defaultCreateForm());
    setCreateOpen(true);
  };

  const handleAddUser = async () => {
    if (createForm.password && createForm.password !== createForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        username: createForm.username,
        fullName: createForm.fullName,
        email: createForm.email,
        phone: createForm.phone,
        unitId: createForm.unitId,
        roleIds: createForm.roleIds,
        password: createForm.password || undefined,
      });
      setPage(1);
      setCreateOpen(false);
      toast.success("Đã thêm người dùng mới.");
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể thêm người dùng.");
    }
  };

  const handleOpenEdit = (user: DisplayUser) => {
    setEditingUserId(user.id);
    setSelectedUser(user);
    setEditForm(buildEditForm(user));
    setEditOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) {
      return;
    }

    setEditingUserId(selectedUser.id);
    try {
      await patchMutation.mutateAsync({
        userId: selectedUser.id,
        payload: {
          fullName: editForm.fullName,
          phone: editForm.phone,
          unitId: editForm.unitId,
          roleIds: editForm.roleIds,
          status: editForm.status,
          username: editForm.username,
          email: editForm.email,
        },
      });
      setEditOpen(false);
      setSelectedUser(null);
      toast.success("Đã cập nhật hồ sơ người dùng.");
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể cập nhật người dùng.");
    }
  };

  const handleOpenLock = (user: DisplayUser) => {
    setSelectedUser(user);
    setLockOpen(true);
  };

  const handleOpenDelete = (user: DisplayUser) => {
    setDeleteTargetUser(user);
    setDeleteOpen(true);
  };

  const handleOpenReset = (user: DisplayUser) => {
    setResetTargetUser(user);
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetTargetUser) return;
    try {
      await resetMutation.mutateAsync(resetTargetUser.id);
      setResetOpen(false);
      toast.success(`Đã đặt lại mật khẩu cho ${resetTargetUser.name}.`);
    } catch {
      toast.error("Không thể đặt lại mật khẩu.");
    }
  };

  const handleToggleLock = async () => {
    if (!selectedUser) return;

    try {
      await lockMutation.mutateAsync({ userId: selectedUser.id, locked: !selectedUser.locked });
      setLockOpen(false);
      setSelectedUser(null);
      toast.success("Đã cập nhật trạng thái tài khoản.");
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể cập nhật trạng thái tài khoản.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteTargetUser.id);
      toast.success("Đã xóa người dùng.");
      if (selectedUser?.id === deleteTargetUser.id) {
        setSelectedUser(null);
      }
      setDeleteOpen(false);
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể xóa người dùng.");
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedFile: File) => {
    if (!selectedUser) return;
    
    setIsUploadingAvatar(true);
    try {
      const response = await profileApi.updateUserAvatar(selectedUser.id, croppedFile);
      if (response.data?.avatar_url) {
        toast.success("Đã cập nhật ảnh đại diện người dùng.");
        void usersQuery.refetch();
        if (selectedUser) {
           setSelectedUser({ ...selectedUser, avatar: response.data.avatar_url });
        }
      }
    } catch {
      toast.error("Không thể tải lên ảnh đại diện.");
    } finally {
      setIsUploadingAvatar(false);
      setCropImage(null);
    }
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Quản lý Người dùng</h1>
            <p className="mt-1 text-sm font-medium text-brand-text-dark/60">Phân quyền, quản lý tài khoản cán bộ và đơn vị công tác toàn hệ thống.</p>
          </div>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
          <UserPlus size={16} /> THÊM NGƯỜI DÙNG
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat title="Tổng nhân sự" value={String(users.length)} icon={<UserCheck size={18} />} color="blue" />
        <QuickStat title="Đang hoạt động" value={String(activeUsers)} icon={<ShieldCheck size={18} />} color="emerald" />
        <QuickStat title="Chưa kích hoạt" value={String(inactiveUsers)} icon={<Lock size={18} />} color="amber" />
        <QuickStat title="Phòng ban" value={String(units)} icon={<Building size={18} />} color="dark" />
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-brand-dark/10 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-brand-dark/5 bg-brand-dark/[0.01] p-4 md:flex-row">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Tìm tên, email hoặc đơn vị..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5" 
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveOnly((prev) => !prev)} className={cn("flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm", activeOnly ? "border-primary text-primary" : "border-brand-dark/10 text-brand-text-dark/60 hover:bg-brand-dark/[0.02]") }>
              <Filter size={14} /> LỌC DỮ LIỆU
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Mở thêm tuỳ chọn" title="Mở thêm tuỳ chọn" className="rounded-lg border border-brand-dark/10 bg-white p-2 text-brand-text-dark/40 shadow-sm transition-all hover:bg-brand-dark/[0.02] hover:text-brand-text-dark/70">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem onClick={handleOpenCreate}>Thêm người dùng</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setLoadingTimedOut(false);
                    void usersQuery.refetch();
                  }}
                >
                  Tải lại dữ liệu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSearchTerm("");
                    setActiveOnly(false);
                    setPage(1);
                    setLoadingTimedOut(false);
                  }}
                >
                  Xóa bộ lọc
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {usersQuery.isLoading && !loadingTimedOut && (
          <div className="border-b border-brand-dark/5 p-8 text-xs font-semibold text-brand-text-dark/40">
            <LoadingSpinner label="Đang tải danh sách người dùng..." />
          </div>
        )}

        {usersQuery.isLoading && loadingTimedOut && (
          <div className="border-b border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Đã quá thời gian tải danh sách người dùng</p>
            <div className="mt-2 flex items-center gap-3">
              <span>Vui lòng thử tải lại dữ liệu.</span>
              <button
                onClick={() => {
                  setLoadingTimedOut(false);
                  void usersQuery.refetch();
                }}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {!usersQuery.isLoading && filteredUsers.length === 0 && (
          <div className="border-b border-brand-dark/5 p-4 text-xs font-semibold text-brand-text-dark/40">
            Không có người dùng phù hợp bộ lọc hiện tại.
            <button onClick={() => void usersQuery.refetch()} className="ml-3 text-primary hover:underline">Tải lại dữ liệu</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Thành viên</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Đơn vị / Phòng ban</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedUsers.map((user) => (
                <tr key={user.id} className="group transition-all hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} className="size-9 shrink-0 rounded-lg border border-brand-dark/10 object-cover shadow-sm" alt="" />
                        ) : (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] text-brand-text-dark/40">
                             <UserCircle size={20} />
                          </div>
                        )}
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white", user.status === "active" ? "bg-emerald-500" : "bg-brand-dark/20")} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text-dark transition-colors group-hover:text-primary">{user.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-tight text-brand-text-dark/40">
                          <Mail size={10} className="text-brand-text-dark/20" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-text-dark/60">
                      <Building size={12} className="text-brand-text-dark/20" /> {user.unit}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn(
                      "inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider", 
                      user.role === "Admin" ? "bg-primary/5 text-primary border-primary/10" : "bg-brand-dark/[0.02] text-brand-text-dark/40 border-brand-dark/10"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest", 
                      user.status === "active" ? "text-emerald-600" : "text-brand-text-dark/40"
                    )}>
                      {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-10 transition-opacity group-hover:opacity-100 md:opacity-0">
                      <Button variant="ghost" size="icon" className="text-brand-text-dark/40 hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenReset(user)} title="Cấp lại mật khẩu">
                        <Key size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-brand-text-dark/40 hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(user)}>
                        <Edit2 size={16} />
                      </Button>
                      <button type="button" title={user.locked ? "Mở khóa người dùng" : "Khóa người dùng"} aria-label={user.locked ? "Mở khóa người dùng" : "Khóa người dùng"} onClick={() => handleOpenLock(user)} className="rounded-lg border border-transparent p-2 text-slate-400 transition-all hover:border-amber-100 hover:bg-amber-50 hover:text-amber-600 active:scale-90">
                        <Lock size={14} />
                      </button>
                      <button type="button" title="Xóa người dùng" aria-label="Xóa người dùng" onClick={() => handleOpenDelete(user)} className="rounded-lg border border-transparent p-2 text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 active:scale-90">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between border-t border-brand-dark/5 bg-brand-dark/[0.01] px-6 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
            Hiển thị {pagedUsers.length} trên {usersQuery.data?.meta?.total ?? filteredUsers.length} thành viên
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-md border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-black uppercase text-brand-text-dark/40 transition-all hover:bg-brand-dark/[0.02] disabled:opacity-30"
              disabled={normalizedPage === 1}
            >
              Trước
            </button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (normalizedPage > 3) pages.push("...");
                  
                  const start = Math.max(2, normalizedPage - 1);
                  const end = Math.min(totalPages - 1, normalizedPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }
                  
                  if (normalizedPage < totalPages - 2) pages.push("...");
                  if (!pages.includes(totalPages)) pages.push(totalPages);
                }
                
                return pages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof p === "number" && setPage(p)}
                    disabled={p === "..."}
                    className={cn(
                      "flex h-7 min-w-7 items-center justify-center rounded-md text-[10px] font-black transition-all",
                      p === normalizedPage
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : p === "..."
                        ? "cursor-default text-brand-text-dark/20"
                        : "border border-brand-dark/10 bg-white text-brand-text-dark/60 hover:bg-brand-dark/[0.02]"
                    )}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-md border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-black uppercase text-brand-text-dark/60 transition-all hover:bg-brand-dark/[0.02] disabled:opacity-30"
              disabled={normalizedPage === totalPages}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
            <DialogDescription>Tạo nhanh tài khoản quản trị mới để test luồng admin-users.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username" htmlFor="create-username">
              <input id="create-username" value={createForm.username} onChange={(event) => setCreateForm((prev) => ({ ...prev, username: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Họ và tên" htmlFor="create-fullName">
              <input id="create-fullName" value={createForm.fullName} onChange={(event) => setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Email" htmlFor="create-email">
              <input id="create-email" value={createForm.email} onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Số điện thoại" htmlFor="create-phone">
              <input id="create-phone" value={createForm.phone} onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Đơn vị" htmlFor="create-unitId">
              <SelectField
                id="create-unitId"
                value={createForm.unitId}
                onValueChange={(v) => setCreateForm((prev) => ({ ...prev, unitId: v }))}
                options={unitOptions}
                placeholder={unitsLoading ? "Đang tải đơn vị..." : "Chọn đơn vị"}
                disabled={unitsLoading}
              />
            </Field>
            <Field label="Vai trò" htmlFor="create-roleIds">
              <MultiSelectField
                id="create-roleIds"
                values={createForm.roleIds}
                onValuesChange={(v) => setCreateForm((prev) => ({ ...prev, roleIds: v }))}
                options={roleOptions}
                placeholder={rolesLoading ? "Đang tải vai trò..." : "Chọn vai trò"}
                disabled={rolesLoading}
              />
            </Field>
            <Field label="Mật khẩu (Mặc định: 111111)" htmlFor="create-password">
              <input 
                id="create-password" 
                type="password"
                value={createForm.password} 
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))} 
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" 
                placeholder="Để trống để dùng mật khẩu mặc định"
              />
            </Field>
            <Field label="Xác nhận mật khẩu" htmlFor="create-confirmPassword">
              <input 
                id="create-confirmPassword" 
                type="password"
                value={createForm.confirmPassword} 
                onChange={(event) => setCreateForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} 
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-sm outline-none transition-all focus:ring-4",
                  createForm.password && createForm.confirmPassword && createForm.password !== createForm.confirmPassword 
                    ? "border-rose-500 bg-rose-50 focus:ring-rose-500/10" 
                    : "border-slate-200 focus:border-primary focus:ring-primary/5"
                )} 
                placeholder="Nhập lại mật khẩu"
              />
              {createForm.password && createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                <p className="mt-1 text-[9px] font-bold uppercase text-rose-500">Mật khẩu không khớp</p>
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isBusy}>Hủy</Button>
            <Button type="button" onClick={handleAddUser} disabled={isBusy}>
              {createMutation.isPending ? <LoadingSpinner variant="small" className="mr-2" /> : null}
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật hồ sơ, vai trò và trạng thái cho bản ghi đang chọn.</DialogDescription>
          </DialogHeader>

          <div className="mb-4 flex flex-col items-center justify-center p-4">
               <div className="relative">
                 <div className="relative size-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200">
                   {selectedUser?.avatar ? (
                     <img src={selectedUser.avatar} className="size-full object-cover" alt="User" />
                   ) : (
                     <div className="flex size-full items-center justify-center text-slate-400">
                       <UserCircle size={48} />
                     </div>
                   )}
                   
                   {isUploadingAvatar && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] duration-200 animate-in fade-in">
                      <LoadingSpinner variant="small" />
                      <span className="mt-1 text-center text-[8px] font-black uppercase tracking-tighter text-primary">Tải lên...</span>
                    </div>
                  )}
                 </div>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className={cn(
                    "absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-white transition-all active:scale-95",
                    isUploadingAvatar ? "opacity-50 cursor-not-allowed scale-90" : "hover:scale-110"
                  )}
                 >
                   <Camera size={14} />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleAvatarFileChange} accept="image/*" className="hidden" />
               </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username" htmlFor="edit-username">
              <input id="edit-username" value={editForm.username} onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Họ và tên" htmlFor="edit-fullName">
              <input id="edit-fullName" value={editForm.fullName} onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Email" htmlFor="edit-email">
              <input id="edit-email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            </Field>
            <Field label="Số điện thoại" htmlFor="edit-phone">
              <input id="edit-phone" value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Đơn vị" htmlFor="edit-unitId">
              <SelectField
                id="edit-unitId"
                value={editForm.unitId}
                onValueChange={(v) => setEditForm((prev) => ({ ...prev, unitId: v }))}
                options={unitOptions}
                placeholder={unitsLoading ? "Đang tải đơn vị..." : "Chọn đơn vị"}
                disabled={unitsLoading}
              />
            </Field>
            <Field label="Vai trò" htmlFor="edit-roleIds">
              <MultiSelectField
                id="edit-roleIds"
                values={editForm.roleIds}
                onValuesChange={(v) => setEditForm((prev) => ({ ...prev, roleIds: v }))}
                options={roleOptions}
                placeholder={rolesLoading ? "Đang tải vai trò..." : "Chọn vai trò"}
                disabled={rolesLoading}
              />
            </Field>
            <Field label="Trạng thái" htmlFor="edit-status" className="md:col-span-2">
              <SelectField
                id="edit-status"
                value={editForm.status}
                onValueChange={(v) => setEditForm((prev) => ({ ...prev, status: v as "active" | "inactive" }))}
                options={USER_STATUS_OPTIONS}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isBusy || isUploadingAvatar}>Hủy</Button>
            <Button type="button" onClick={handleEditUser} disabled={isBusy || isUploadingAvatar}>
              {patchMutation.isPending ? <LoadingSpinner variant="small" className="mr-2" /> : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Xác nhận thay đổi trạng thái</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.status === "active" ? "Khóa" : "Mở khóa"} tài khoản ${selectedUser.name}?` : "Xác nhận thao tác này."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLockOpen(false)} disabled={isBusy}>Hủy</Button>
            <Button type="button" onClick={handleToggleLock} disabled={isBusy}>
              {lockMutation.isPending ? <LoadingSpinner variant="small" className="mr-2" /> : null}
              {selectedUser?.locked ? "Mở khóa" : "Khóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-rose-500" /> Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              {deleteTargetUser ? `Xóa ${deleteTargetUser.name} khỏi hệ thống? Thao tác này không thể hoàn tác.` : "Xác nhận thao tác này."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={isBusy}>Hủy</Button>
            <Button type="button" onClick={() => void handleDeleteUser()} disabled={isBusy} variant="destructive">
              {deleteMutation.isPending ? <LoadingSpinner variant="small" className="mr-2" /> : null}
              Xóa người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cropImage} onOpenChange={(open) => !open && setCropImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {cropImage && (
              <AvatarCropper 
                image={cropImage} 
                onCropComplete={onCropComplete} 
                onCancel={() => setCropImage(null)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation */}
      <ConfirmModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetPassword}
        title="Cấp lại mật khẩu?"
        description={
          <span>
            Mật khẩu của người dùng <strong>{resetTargetUser?.name}</strong> sẽ được đặt về mặc định là <strong>111111</strong>.
            Họ có thể thay đổi sau khi đăng nhập.
          </span>
        }
        confirmText="Cấp lại mật khẩu"
        cancelText="Hủy bỏ"
        variant="warning"
      />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("space-y-1.5", className)} htmlFor={htmlFor}>
      <span className="block text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">{label}</span>
      {children}
    </label>
  );
}

function QuickStat({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "amber" | "dark" }) {
  const colors: Record<"blue" | "emerald" | "amber" | "dark", string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20", 
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20", 
    dark: "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100/20" 
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", colors[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-xl font-black leading-none tracking-tight text-brand-dark">{value}</p>
      </div>
    </div>
  );
}

