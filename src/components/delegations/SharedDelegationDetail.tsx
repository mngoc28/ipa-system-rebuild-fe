import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit, Users, Calendar, Info, CheckSquare, FileText } from "lucide-react";
import { useDelegationDetailQuery, useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { mapDelegationStatus } from "@/dataHelper/delegations.dataHelper";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Check, X, RotateCcw, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DelegationDiscussion from "./DelegationDiscussion";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/SelectField";
import { DatePicker } from "@/components/ui/DatePicker";
import { Plus, Trash2, Edit2, Star } from "lucide-react";
import { useAdminUsersListQuery } from "@/hooks/useAdminUsersQuery";
import { useQuery } from "@tanstack/react-query";
import { masterDataApi } from "@/api/masterDataApi";
import type { DelegationApiItem } from "@/dataHelper/delegations.dataHelper";

/** API representation of a delegation member. */
type DelegationMemberApi = {
  /** The member's full name. */
  full_name?: string;
  /** The member's job title or role. */
  title?: string;
  /** The organization the member belongs to. */
  organization_name?: string;
  /** The gender of the member. */
  gender?: string;
  /** Identity card or passport number. */
  identity_number?: string;
  /** Whether the member has VIP status. */
  is_vip?: boolean;
};

/** API representation of a delegation event/schedule item. */
type DelegationEventApi = {
  /** Unique identifier for the event. */
  id: string | number;
  /** Starting date/time in ISO format. */
  start_at: string;
  /** Title of the event. */
  title?: string;
  /** Detailed description of the event. */
  description?: string;
  /** ID of the location from master data. */
  location_id?: number;
  /** ID of the staff member in charge. */
  staff_id?: number;
  /** Notes regarding logistics (e.g., transport). */
  logistics_note?: string;
  /** Associated location object. */
  location?: { name_vi?: string; name?: string };
  /** Associated staff object. */
  staff?: { name?: string };
};

/** API representation of a checklist item. */
type DelegationChecklistApi = {
  /** Unique identifier for the checklist item. */
  id?: string | number;
  /** Name of the task or item. */
  item_name?: string;
  /** Fallback name field. */
  name?: string;
  /** ID of the user assigned to this task. */
  assignee_user_id?: number | string;
  /** Completion status (e.g., 0 for pending, 2 for completed). */
  status: number;
};

/** API representation of a delegation outcome. */
type DelegationOutcomeApi = {
  /** Unique identifier for the outcome. */
  id?: string | number;
  /** Star rating (1-5). */
  rating?: number;
  /** Numeric score (often same as rating). */
  score?: number;
  /** Summary of the outcome. */
  summary?: string;
  /** Fallback summary field. */
  outcome_summary?: string;
  /** Content details. */
  content?: string;
  /** General notes. */
  note?: string;
  /** Planned next steps. */
  next_steps?: string;
  /** Fallback next steps field. */
  nextSteps?: string;
};

type DelegationSectorApi = { id: number; name_vi?: string; name?: string };
type DelegationContactApi = { name?: string; role_name?: string; phone?: string; email?: string; is_primary?: boolean };
type DelegationPartnerApi = { id: number; partner_name?: string; name?: string };

type DelegationDetailView = Omit<DelegationApiItem, "members" | "events" | "outcomes" | "checklist" | "sectors" | "contacts" | "partners"> & {
  members?: DelegationMemberApi[];
  events?: DelegationEventApi[];
  outcomes?: DelegationOutcomeApi[];
  checklist?: DelegationChecklistApi[];
  sectors?: DelegationSectorApi[];
  contacts?: DelegationContactApi[];
  partners?: DelegationPartnerApi[];
};

/** Internal state for an item currently being edited in a modal. */
type DelegationEditingItem = {
  /** Index in the list when editing an existing item. */
  _index?: number;
  /** Unique identifier for the item. */
  id?: string | number;
  /** Full name for members. */
  fullName?: string;
  /** Job title or role for members. */
  role?: string;
  /** Organization name for members. */
  organizationName?: string;
  /** Gender for members. */
  gender?: string;
  /** ID number for members. */
  identityNumber?: string;
  /** VIP status for members. */
  isVip?: boolean;
  /** Date for schedule items. */
  date?: string;
  /** Title for schedule items. */
  title?: string;
  /** Description or notes for schedule items. */
  note?: string;
  /** Location ID for schedule items. */
  location_id?: number;
  /** Staff ID for schedule items. */
  staff_id?: number;
  /** Logistics notes for schedule items. */
  logistics_note?: string;
  /** Item name for checklists. */
  itemName?: string;
  /** Assignee ID for checklists. */
  assigneeId?: number;
  /** Status for checklists. */
  status?: number;
  /** Rating for outcomes. */
  rating?: number;
  /** Summary for outcomes. */
  summary?: string;
  /** Next steps for outcomes. */
  next_steps?: string;
};

type DelegationMemberPayload = {
  full_name: string;
  title: string;
  organization_name: string;
  gender: string;
  identity_number: string;
  is_vip: boolean;
};

type DelegationEventPayload = {
  date: string;
  title: string;
  note: string;
  location_id?: number;
  staff_id?: number;
  logistics_note?: string;
};

type DelegationChecklistPayload = {
  item_name: string;
  assignee_user_id?: number;
  status: number;
};

/** Props for the SharedDelegationDetail component. */
interface SharedDelegationDetailProps {
  /** The current user's role, which determines available actions (e.g., approval). */
  role: "admin" | "director" | "manager" | "staff";
}

/**
 * A comprehensive view for managing and displaying delegation details.
 * Modular tabs provide access to overview, members, schedule, checklist, followup, and discussions.
 * 
 * @param props - Component props following SharedDelegationDetailProps interface.
 */
export default function SharedDelegationDetail({ role }: SharedDelegationDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
      // Wait a bit for the content to render then scroll
      setTimeout(() => {
        tabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.search, location.pathname]);

  const { data: detailData, isLoading, refetch } = useDelegationDetailQuery(id);
  const { updateMutation } = useDelegationsQuery();
  const detailError = detailData === undefined && !isLoading && id ? "Unable to load delegation details." : null;
  const d = detailData?.data as DelegationDetailView | undefined;

  // Master Data & Users for forms
  const { data: usersData } = useAdminUsersListQuery({ pageSize: 100 });
  const userOptions = usersData?.data?.items?.map(u => ({ label: u.fullName, value: String(u.id) })) || [];
  
  const ownerUser = usersData?.data?.items?.find(u => String(u.id) === String(d?.owner_user_id));

  const { data: locationsData } = useQuery({
    queryKey: ["master-data-locations"],
    queryFn: () => masterDataApi.list("location"),
  });
  const locationOptions = (locationsData?.data?.items ?? []).map(l => ({ label: l.name_vi, value: String(l.id) }));

  // Modal States
  const [modalType, setModalType] = useState<"add-member" | "edit-member" | "add-schedule" | "edit-schedule" | "add-checklist" | "edit-checklist" | "edit-outcome" | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "member" | "schedule" | "checklist"; index: number } | null>(null);

  // Form States
  const [editingItem, setEditingItem] = useState<DelegationEditingItem | null>(null);

  const handleOpenAddModal = (type: typeof modalType) => {
    setModalType(type);
    if (type === "add-member") {
      setEditingItem({ fullName: "", role: "", organizationName: "", gender: "male", identityNumber: "", isVip: false });
    } else if (type === "add-schedule") {
      setEditingItem({ date: new Date().toISOString().split("T")[0], title: "", note: "", location_id: undefined, staff_id: undefined, logistics_note: "" });
    } else if (type === "add-checklist") {
      setEditingItem({ itemName: "", assigneeId: undefined, status: 0 });
    }
  };

  const handleOpenEditModal = (type: typeof modalType, item: DelegationEditingItem, index: number) => {
    setModalType(type);
    setEditingItem({ ...item, _index: index });
  };

  const handleSaveSubItem = async () => {
    if (!d || !editingItem) return;

    const payload: Record<string, unknown> = {};
    const { _index, ...itemProps } = editingItem;

    if (modalType?.includes("member")) {
      const members = (d.members || []).map<DelegationMemberPayload>((m) => ({
        full_name: m.full_name || "",
        title: m.title || "",
        organization_name: m.organization_name || "",
        gender: m.gender || "",
        identity_number: m.identity_number || "",
        is_vip: !!m.is_vip
      }));

      if (modalType === "add-member") {
        members.push({
          full_name: itemProps.fullName || "",
          title: itemProps.role || "",
          organization_name: itemProps.organizationName || "",
          gender: itemProps.gender || "",
          identity_number: itemProps.identityNumber || "",
          is_vip: !!itemProps.isVip,
        });
      } else {
        const index = _index ?? -1;
        if (index >= 0) {
          members[index] = {
            full_name: itemProps.fullName || "",
            title: itemProps.role || "",
            organization_name: itemProps.organizationName || "",
            gender: itemProps.gender || "",
            identity_number: itemProps.identityNumber || "",
            is_vip: !!itemProps.isVip,
          };
        }
      }
      payload.members = members;
    } 
    else if (modalType?.includes("schedule")) {
      const schedule_items = (d.events || []).map<DelegationEventPayload>((e) => ({
        date: e.start_at?.split("T")[0] || "",
        title: e.title || "",
        note: e.description || "",
        location_id: e.location_id,
        staff_id: e.staff_id,
        logistics_note: e.logistics_note
      }));

      if (modalType === "add-schedule") {
        schedule_items.push({
          date: itemProps.date || "",
          title: itemProps.title || "",
          note: itemProps.note || "",
          location_id: itemProps.location_id,
          staff_id: itemProps.staff_id,
          logistics_note: itemProps.logistics_note,
        });
      } else {
        const index = _index ?? -1;
        if (index >= 0) {
          schedule_items[index] = {
            date: itemProps.date || "",
            title: itemProps.title || "",
            note: itemProps.note || "",
            location_id: itemProps.location_id,
            staff_id: itemProps.staff_id,
            logistics_note: itemProps.logistics_note,
          };
        }
      }
      payload.schedule_items = schedule_items;
    }
    else if (modalType?.includes("checklist")) {
      const checklist_items = (d.checklist || []).map<DelegationChecklistPayload>((c) => ({
        item_name: c.item_name || "",
        assignee_user_id: typeof c.assignee_user_id === "string" ? Number(c.assignee_user_id) : c.assignee_user_id,
        status: c.status
      }));

      if (modalType === "add-checklist") {
        checklist_items.push({
          item_name: itemProps.itemName || "",
          assignee_user_id: itemProps.assigneeId,
          status: itemProps.status ?? 0,
        });
      } else {
        const index = _index ?? -1;
        if (index >= 0) {
          checklist_items[index] = {
            item_name: itemProps.itemName || "",
            assignee_user_id: itemProps.assigneeId,
            status: itemProps.status ?? 0,
          };
        }
      }
      payload.checklist_items = checklist_items;
    }
    else if (modalType === "edit-outcome") {
      payload.outcome = {
        rating: itemProps.rating,
        summary: itemProps.summary,
        next_steps: itemProps.next_steps
      };
    }

    try {
      await updateMutation.mutateAsync({ id: d.id, data: payload });
      toast.success("Data updated successfully");
      setModalType(null);
      setEditingItem(null);
      refetch();
    } catch {
      // toast.error handled by mutation
    }
  };

  const handleConfirmDelete = async () => {
    if (!d || !deleteTarget) return;

    const payload: Record<string, unknown> = {};
    const idx = deleteTarget.index;

    if (deleteTarget.type === "member") {
      const members = (d.members || []).filter((_, i: number) => i !== idx).map((m) => ({
        fullName: m.full_name,
        role: m.title,
        organizationName: m.organization_name,
        gender: m.gender,
        identityNumber: m.identity_number,
        isVip: !!m.is_vip
      }));
      payload.members = members;
    } 
    else if (deleteTarget.type === "schedule") {
      const schedule_items = (d.events || []).filter((_, i: number) => i !== idx).map((e) => ({
        date: e.start_at.split("T")[0],
        title: e.title,
        note: e.description,
        location_id: e.location_id,
        staff_id: e.staff_id,
        logistics_note: e.logistics_note
      }));
      payload.schedule_items = schedule_items;
    }
    else if (deleteTarget.type === "checklist") {
      const checklist_items = (d.checklist || []).filter((_, i: number) => i !== idx).map((c) => ({
        itemName: c.item_name,
        assigneeId: c.assignee_user_id,
        status: c.status
      }));
      payload.checklist_items = checklist_items;
    }

    try {
      await updateMutation.mutateAsync({ id: d.id, data: payload });
      toast.success("Item deleted successfully");
      setIsConfirmDeleteOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch {
      // toast.error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Loading delegation data..." />
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Failed to load details</p>
        <p className="max-w-md text-sm font-medium text-rose-700">{detailError}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!d) {
    return <div className="p-8 text-center text-slate-500">Delegation does not exist.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10 duration-500 animate-in fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} title="Go back" aria-label="Go back" className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 transition-all hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {d.code}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {formatDate(d.start_date)} - {formatDate(d.end_date)}
              </span>
            </div>
            <h1 className="mt-2 font-title text-3xl font-black text-slate-900">{d.name}</h1>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/delegations/${id}/edit`)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-slate-800"
        >
          <Edit size={16} />
          CHỈNH SỬA HỒ SƠ
        </button>
      </div>

      <ApprovalActionBar role={role} delegation={d} onUpdate={() => navigate(0)} />

      <div ref={tabRef} className="flex gap-4 border-b border-slate-200">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="OVERVIEW" icon={<Info size={14} />} />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} label="MEMBERS" icon={<Users size={14} />} />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} label="SCHEDULE" icon={<Calendar size={14} />} />
        <TabButton active={activeTab === "checklist"} onClick={() => setActiveTab("checklist")} label="CHECKLIST" icon={<CheckSquare size={14} />} />
        <TabButton active={activeTab === "followup"} onClick={() => setActiveTab("followup")} label="FOLLOW-UP" icon={<FileText size={14} />} />
        <TabButton active={activeTab === "discussion"} onClick={() => setActiveTab("discussion")} label="DISCUSSION" icon={<MessageSquare size={14} />} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="rounded-xl border border-slate-200 bg-white p-8">
                  <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Objectives & Content</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {d.description || "No detailed description available."}
                  </p>
                  
                  <div className="mt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sectors</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {d.sectors?.length ? d.sectors.map((s) => (
                        <span key={s.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {s.name || s.name_vi}
                        </span>
                      )) : <span className="text-xs italic text-slate-400">No sectors defined</span>}
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-100 pt-8 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{mapDelegationStatus(d.status)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Country</p>
                      <p className="mt-1 inline-flex w-fit items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-900">
                        <CountryFlag countryName={d.country?.name_vi || ""} />
                        {d.country?.name_en || d.country?.name_vi || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Host Unit</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{d.host_unit?.unit_name || d.host_unit_id || "N/A"}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner</p>
                       <p className="mt-1 text-sm font-bold text-slate-900">
                         {d.partners && d.partners.length > 0 
                           ? d.partners.map((p) => p.partner_name || p.name).join(", ") 
                           : (d.objective || "N/A")}
                       </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investment Potential</p>
                      <p className="mt-1 text-sm font-bold text-emerald-600">
                        {d.investment_potential ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.investment_potential) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-8">
                  <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {d.contacts?.length ? d.contacts.map((c, idx: number) => (
                      <div key={idx} className="space-y-3 rounded-lg border border-slate-50 bg-slate-50/50 p-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.role_name || "N/A"}</p>
                        </div>
                        <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2 text-xs">
                          <p className="flex items-center gap-2 text-slate-600">
                            <span className="font-bold opacity-50">Phone:</span> {c.phone || "N/A"}
                          </p>
                          <p className="flex items-center gap-2 text-slate-600">
                            <span className="font-bold opacity-50">Email:</span> {c.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-4 text-center">
                        <p className="text-xs italic text-slate-400">No contact information available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

           {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleOpenAddModal("add-member")}
                    className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
                  >
                    <Plus size={14} />
                    Add Member
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   {d.members?.map((m, i: number) => (
                     <div key={i} className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400">
                              {m.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{m.full_name}</p>
                              <p className="text-xs text-slate-500">{m.title || "Role not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {m.is_vip ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-600 ring-1 ring-inset ring-amber-200">
                                VIP
                              </span>
                            ) : null}
                            <button 
                              onClick={() => handleOpenEditModal("edit-member", { 
                                fullName: m.full_name, 
                                role: m.title, 
                                organizationName: m.organization_name,
                                gender: m.gender,
                                identityNumber: m.identity_number,
                                isVip: !!m.is_vip
                              }, i)}
                              className="rounded-lg p-2 text-slate-300 transition-all hover:bg-slate-100 hover:text-primary"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setDeleteTarget({ type: "member", index: i });
                                setIsConfirmDeleteOpen(true);
                              }}
                              className="rounded-lg p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-400 opacity-70">Organization:</span> {m.organization_name || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                             <p>
                               <span className="font-semibold text-slate-400 opacity-70">Gender:</span> {m.gender || "N/A"}
                             </p>
                             {m.identity_number && (
                               <p>
                                 <span className="font-semibold text-slate-400 opacity-70">CCCD/PP:</span> {m.identity_number}
                               </p>
                             )}
                          </div>
                        </div>
                     </div>
                   )) || <p className="text-center text-slate-400">No members found.</p>}
                </div>
              </div>
           )}

           {activeTab === "schedule" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                   <button 
                     onClick={() => handleOpenAddModal("add-schedule")}
                     className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
                   >
                     <Plus size={14} />
                     Add Schedule
                   </button>
                </div>
                {d.events?.length ? (
                  d.events.map((event, i: number) => (
                    <div key={event.id} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                              Schedule
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {formatDate(event.start_at)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{event.title || "No Title"}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {event.location ? <span>📍 {event.location.name_vi || event.location.name}</span> : event.location_id ? <span>📍 Location #{event.location_id}</span> : null}
                            {event.staff ? <span>👤 {event.staff.name}</span> : event.staff_id ? <span>👤 PIC #{event.staff_id}</span> : null}
                            {event.logistics_note ? <span>🚚 {event.logistics_note}</span> : null}
                          </div>
                          {event.description ? <p className="text-sm leading-relaxed text-slate-600">{event.description}</p> : null}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                           <button 
                             onClick={() => handleOpenEditModal("edit-schedule", {
                               id: event.id,
                               date: event.start_at?.split("T")[0] || "",
                               title: event.title || "",
                               note: event.description || "",
                               location_id: event.location_id,
                               staff_id: event.staff_id,
                               logistics_note: event.logistics_note
                             }, i)}
                             className="rounded-lg p-2 text-slate-300 transition-all hover:bg-slate-100 hover:text-primary"
                             title="Edit schedule"
                           >
                             <Edit2 size={14} />
                           </button>
                           <button 
                             onClick={() => {
                               setDeleteTarget({ type: "schedule", index: i });
                               setIsConfirmDeleteOpen(true);
                             }}
                             className="rounded-lg p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                             title="Delete schedule"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No schedule items found." />
                )}
              </div>
           )}

           {activeTab === "checklist" && (
              <div className="space-y-6">
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Checklist</h3>
                    <button 
                      onClick={() => handleOpenAddModal("add-checklist")}
                      className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all hover:bg-emerald-100"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>
                  {d.checklist?.length ? (
                    <div className="space-y-3">
                      {d.checklist.map((item, index: number) => (
                        <div key={item.id ?? index} className="group rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-slate-100/50">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                               <p className="text-sm font-bold text-slate-900">{item.item_name || item.name || "No Title"}</p>
                               <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button 
                                    onClick={() => handleOpenEditModal("edit-checklist", {
                                      itemName: item.item_name || "",
                                      assigneeId: typeof item.assignee_user_id === "string" ? Number(item.assignee_user_id) : item.assignee_user_id,
                                      status: item.status
                                    }, index)}
                                    className="rounded-md p-1 text-slate-300 hover:bg-white hover:text-primary"
                                    title="Edit item"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setDeleteTarget({ type: "checklist", index });
                                      setIsConfirmDeleteOpen(true);
                                    }}
                                    className="rounded-md p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                                    title="Delete item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                               </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {item.status !== undefined && item.status !== null ? `Status: ${item.status === 2 ? "Completed" : "In Progress"}` : ""}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {item.assignee_user_id && (
                              <span>👤 PIC: {userOptions.find(u => u.value === String(item.assignee_user_id))?.label || `#${item.assignee_user_id}`}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No checklist items found.</p>
                  )}
                </section>
              </div>
           )}

           {activeTab === "followup" && (
              <div className="space-y-6">
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Outcomes & Monitoring</h3>
                    <button 
                      onClick={() => {
                        const outcome = d.outcomes?.[0] || {};
                        handleOpenEditModal("edit-outcome", {
                          rating: outcome.rating || 0,
                          summary: outcome.summary || "",
                          next_steps: outcome.next_steps || ""
                        }, 0);
                      }}
                      className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all hover:bg-emerald-100"
                    >
                      <Edit2 size={14} />
                      Edit Outcome
                    </button>
                  </div>
                  {d.outcomes?.length ? (
                    <div className="space-y-4">
                      {d.outcomes.map((outcome, index: number) => {
                        const summary = outcome.summary || outcome.outcome_summary || outcome.content || outcome.note;
                        const nextSteps = outcome.next_steps || outcome.nextSteps;
                        const rating = outcome.rating ?? outcome.score;

                        return (
                          <div key={outcome.id ?? index} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Outcome Assessment
                              </span>
                              {rating !== undefined && rating !== null ? (
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={cn("text-sm", i < rating ? "text-amber-400" : "text-slate-300")}>★</span>
                                  ))}
                                  <span className="ml-2 text-xs font-bold text-slate-400">({rating}/5)</span>
                                </div>
                              ) : null}
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {summary && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Achieved Results</p>
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{summary}</p>
                                </div>
                              )}
                              {nextSteps && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Tasks</p>
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-500">{nextSteps}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No monitoring information available.</p>
                  )}
                </section>
              </div>
           )}

           {activeTab === "discussion" && (
             <div className="flex max-h-[600px] flex-col">
               <DelegationDiscussion delegationId={d.id} />
             </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Person in Charge</h4>
              <div className="flex items-center gap-3">
                 {ownerUser?.avatar || d.owner?.avatar_url ? (
                   <img 
                     src={ownerUser?.avatar || d.owner?.avatar_url} 
                     alt={ownerUser?.fullName || d.owner?.full_name} 
                     className="size-10 rounded-full object-cover ring-2 ring-white"
                   />
                 ) : (
                   <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                     {(ownerUser?.fullName || d.owner?.full_name || "A").charAt(0)}
                   </div>
                 )}
                 <div>
                    <p className="text-sm font-bold text-slate-900">{ownerUser?.fullName || d.owner?.full_name || "System Admin"}</p>
                    <p className="text-[10px] font-medium text-slate-500">{d.host_unit?.unit_name || ownerUser?.unit?.unit_name || "Investment Department"}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

        {/* 1. Member Modal */}
      <Dialog open={modalType?.includes("member")} onOpenChange={() => setModalType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalType === "add-member" ? "Add Member" : "Edit Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1">
              <label htmlFor="member-fullname" className="text-[10px] font-black uppercase text-slate-400">Full Name *</label>
              <Input 
                id="member-fullname"
                value={editingItem?.fullName}
                onChange={(e) => setEditingItem({...editingItem, fullName: e.target.value})}
                placeholder="John Doe" 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-gender" className="text-[10px] font-black uppercase text-slate-400">Gender</label>
              <SelectField 
                id="member-gender"
                value={editingItem?.gender || ""}
                onValueChange={(v) => setEditingItem({...editingItem, gender: v})}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" }
                ]}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-role" className="text-[10px] font-black uppercase text-slate-400">Role</label>
              <Input 
                id="member-role"
                value={editingItem?.role}
                onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                placeholder="Manager" 
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="member-org" className="text-[10px] font-black uppercase text-slate-400">Organization/Enterprise</label>
              <Input 
                id="member-org"
                value={editingItem?.organizationName}
                onChange={(e) => setEditingItem({...editingItem, organizationName: e.target.value})}
                placeholder="Samsung Electronics" 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-identity" className="text-[10px] font-black uppercase text-slate-400">ID/Passport</label>
              <Input 
                id="member-identity"
                value={editingItem?.identityNumber}
                onChange={(e) => setEditingItem({...editingItem, identityNumber: e.target.value})}
                placeholder="B1234567" 
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input 
                  type="checkbox" 
                  className="size-4 rounded border-slate-300 text-primary focus:ring-primary" 
                  checked={editingItem?.isVip}
                  onChange={(e) => setEditingItem({...editingItem, isVip: e.target.checked})}
                />
                <span className="text-xs font-bold text-slate-600">VIP Card</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button onClick={handleSaveSubItem} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Schedule Modal */}
      <Dialog open={modalType?.includes("schedule")} onOpenChange={() => setModalType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalType === "add-schedule" ? "Add Schedule Milestone" : "Edit Schedule"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <label htmlFor="edit-sched-date" className="text-[10px] font-black uppercase text-slate-400">Date *</label>
              <DatePicker 
                id="edit-sched-date" date={editingItem?.date}
                setDate={(v) => setEditingItem({...editingItem, date: v})}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="edit-sched-title" className="text-[10px] font-black uppercase text-slate-400">Main Content *</label>
              <Input 
                id="edit-sched-title"
                value={editingItem?.title}
                onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                placeholder="Meeting at..." 
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="edit-sched-note" className="text-[10px] font-black uppercase text-slate-400">Detailed Notes</label>
              <Textarea 
                id="edit-sched-note"
                value={editingItem?.note}
                onChange={(e) => setEditingItem({...editingItem, note: e.target.value})}
                rows={3}
                placeholder="Describe work content..."
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-sched-loc" className="text-[10px] font-black uppercase text-slate-400">Location</label>
              <SelectField 
                id="edit-sched-loc"
                value={String(editingItem?.location_id || "")}
                onValueChange={(v) => setEditingItem({...editingItem, location_id: Number(v)})}
                options={locationOptions}
                placeholder="Select location..."
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-sched-staff" className="text-[10px] font-black uppercase text-slate-400">Person in Charge</label>
              <SelectField 
                id="edit-sched-staff"
                value={String(editingItem?.staff_id || "")}
                onValueChange={(v) => setEditingItem({...editingItem, staff_id: Number(v)})}
                options={userOptions}
                placeholder="Select staff..."
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label htmlFor="edit-sched-logistics" className="text-[10px] font-black uppercase text-slate-400">Logistics</label>
              <Input 
                id="edit-sched-logistics"
                value={editingItem?.logistics_note}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem({...editingItem, logistics_note: e.target.value})}
                placeholder="Transport, pick-up..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button onClick={handleSaveSubItem} disabled={updateMutation.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Checklist Modal */}
      <Dialog open={modalType?.includes("checklist")} onOpenChange={() => setModalType(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalType === "add-checklist" ? "Add Task" : "Edit Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-1">
              <label htmlFor="edit-checklist-name" className="text-[10px] font-black uppercase text-slate-400">Task Name *</label>
              <Input 
                id="edit-checklist-name"
                value={editingItem?.itemName}
                onChange={(e) => setEditingItem({...editingItem, itemName: e.target.value})}
                placeholder="Prepare documents..." 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-checklist-assignee" className="text-[10px] font-black uppercase text-slate-400">Person in Charge</label>
              <SelectField 
                id="edit-checklist-assignee"
                value={String(editingItem?.assigneeId || "")}
                onValueChange={(v) => setEditingItem({...editingItem, assigneeId: Number(v)})}
                options={userOptions}
                placeholder="Select person..."
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-checklist-status" className="text-[10px] font-black uppercase text-slate-400">Status</label>
              <SelectField 
                id="edit-checklist-status"
                value={String(editingItem?.status)}
                onValueChange={(v) => setEditingItem({...editingItem, status: Number(v)})}
                options={[
                  { label: "In Progress", value: "0" },
                  { label: "Completed", value: "2" },
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button onClick={handleSaveSubItem} disabled={updateMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Outcome Modal */}
      <Dialog open={modalType === "edit-outcome"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Outcome & Monitoring</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <span id="outcome-rating-label" className="text-[10px] font-black uppercase text-slate-400">General Rating (1-5 stars)</span>
              <div className="flex gap-2" role="group" aria-labelledby="outcome-rating-label">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setEditingItem({ ...editingItem, rating: star })}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={28}
                      className={cn(
                        "transition-colors",
                        star <= (editingItem?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="edit-outcome-summary" className="text-[10px] font-black uppercase text-slate-400">Achieved Results</label>
              <Textarea 
                id="edit-outcome-summary"
                value={editingItem?.summary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingItem({...editingItem, summary: e.target.value})}
                rows={4}
                placeholder="Summarize key results..."
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-outcome-nextsteps" className="text-[10px] font-black uppercase text-slate-400">Next Tasks</label>
              <Textarea 
                id="edit-outcome-nextsteps"
                value={editingItem?.next_steps}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingItem({...editingItem, next_steps: e.target.value})}
                rows={4}
                placeholder="Tasks to follow up after the delegation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button onClick={handleSaveSubItem} disabled={updateMutation.isPending}>Save Outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        description="This action cannot be undone. Are you sure you want to delete this item from the list?"
      />
    </div>
  );
}

/** Simple component to display a message when a list is empty. */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 text-slate-400">
      <CheckSquare size={32} className="mb-2 opacity-20" />
      <p>{message}</p>
    </div>
  );
}

/** Specialized button for navigation tabs in delegation details. */
function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-b-2 pb-4 pt-2 text-[10px] font-black uppercase tracking-widest transition-all",
        active ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Action bar for reviewing and approving delegations.
 * Visible only to Manager role when delegation is in review status.
 */
function ApprovalActionBar({ role, delegation, onUpdate }: { role: string; delegation: DelegationDetailView; onUpdate: () => void }) {
  const [remark, setRemark] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);
  
  const { updateMutation } = useDelegationsQuery();

  // ONLY allow Manager to see approval buttons per requirement
  if (role !== "manager" || delegation.status !== 1) {
    return null;
  }

  const handleAction = async (status: number) => {
    if ((status === 6 || status === 2) && !isExpanding) {
      setPendingStatus(status);
      setIsExpanding(true);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: delegation.id,
        data: {
          status,
          approval_remark: remark
        }
      });
      toast.success("Approval status updated successfully.");
      onUpdate();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-1 duration-500 animate-in slide-in-from-top-4">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/10 bg-white text-primary shadow-sm">
            <CheckSquare size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Approve Portfolio</h4>
            <p className="text-sm font-bold text-slate-900">Please review the portfolio and make a decision.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction(3)}
            disabled={updateMutation.isPending}
            className="group flex items-center gap-3 rounded-xl bg-emerald-600 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <Check size={16} />
            APPROVE
          </button>
          
          <button
            onClick={() => handleAction(2)}
            disabled={updateMutation.isPending}
            className="group flex items-center gap-3 rounded-xl bg-amber-500 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-600"
          >
            <RotateCcw size={16} />
            REQUEST EDIT
          </button>

          <button
            onClick={() => handleAction(6)}
            disabled={updateMutation.isPending}
            className="group flex items-center gap-3 rounded-xl bg-rose-500 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-600"
          >
            <X size={16} />
            REJECT
          </button>
        </div>
      </div>

      {isExpanding && (
        <div className="border-t border-primary/10 bg-white/50 p-6 duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Feedback Remark (Required)</span>
            </div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter specific reasons for the rejection or edit request..."
              className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white p-4 text-sm ring-primary/20 transition-all focus:border-primary focus:outline-none focus:ring-4"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsExpanding(false)}
                className="rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(pendingStatus!)}
                disabled={updateMutation.isPending || !remark.trim()}
                className="flex items-center gap-3 rounded-lg bg-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                <Send size={14} />
                CONFIRM SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
