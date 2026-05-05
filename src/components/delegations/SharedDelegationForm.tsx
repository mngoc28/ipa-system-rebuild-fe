import type { AdminUser } from "@/api/adminUsersApi";
import { MasterDataItem } from "@/api/masterDataApi";
import { OrgUnitItem } from "@/api/teamsApi";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MultiSelectField } from "@/components/ui/MultiSelectField";
import { SelectField } from "@/components/ui/SelectField";
import { PlainTextarea } from "@/components/ui/textarea";
import type { DelegationApiItem } from "@/dataHelper/delegations.dataHelper";
import type { PartnerOptionItem } from "@/dataHelper/partners.dataHelper";
import { useAdminUsersListQuery } from "@/hooks/useAdminUsersQuery";
import { useDelegationDetailQuery, useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { useDraftUnsavedGuard } from "@/hooks/useDraftUnsavedGuard";
import { useInitQuery } from "@/hooks/useInitQuery";
import { useLocationsQuery, useSectorsQuery, useUnitsQuery } from "@/hooks/useMasterDataHooks";
import { usePartnerOptionsQuery, usePartnersListQuery } from "@/hooks/usePartnersQuery";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";
import { ArrowLeft, Building2, Calendar, FileText, Save, Send, Users, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

/** Represents a member of a delegation as received from or sent to the API. */
type DelegationMemberApi = {
    full_name?: string;
    title?: string;
    organization_name?: string;
    gender?: string;
    identity_number?: string;
    is_vip?: boolean;
};

/** Represents an event or schedule item in a delegation. */
type DelegationEventApi = {
    id: string | number;
    start_at: string;
    title?: string;
    description?: string;
    location_id?: number;
    staff_id?: number;
    logistics_note?: string;
};

/** Represents a checklist item assigned to a delegation. */
type DelegationChecklistApi = {
    item_name?: string;
    assignee_user_id?: number | string;
    status: number;
};

/** Represents the results and next steps for a delegation. */
type DelegationOutcomeApi = {
    rating?: number;
    summary?: string;
    next_steps?: string;
};

/** External contact point for the delegation partners. */
type DelegationContactApi = { 
    name?: string; 
    role_name?: string; 
    phone?: string; 
    email?: string; 
    is_primary?: boolean 
};

/** Extended view model for delegation details including related entities. */
type DelegationDetailView = Omit<DelegationApiItem, "members" | "events" | "outcomes" | "checklist" | "contacts" | "partners" | "sectors"> & {
  members?: DelegationMemberApi[];
  events?: DelegationEventApi[];
  outcomes?: DelegationOutcomeApi[];
  checklist?: DelegationChecklistApi[];
  contacts?: DelegationContactApi[];
  partners?: Array<{ id: number }>;
  sectors?: Array<{ id: number }>;
};

/** local UI state for a delegation member in the form. */
type FormMemberItem = {
  fullName: string;
  role: string;
  organizationName: string;
  gender: string;
  identityNumber: string;
  isVip: boolean;
};

/** Item in the delegation checklist local UI state. */
type FormChecklistItem = {
    itemName: string;
    assigneeId?: number;
    status: number;
};

/** Schedule/Event item for the delegation visit local UI state. */
type FormScheduleItem = {
    id: string;
    date: string;
    title: string;
    note: string;
    location_id?: number;
    staff_id?: number;
    logistics_note?: string;
};

/** Props for the SharedDelegationForm component. */
interface SharedDelegationFormProps {
    role: "admin" | "director" | "manager" | "staff";
}

/**
 * A comprehensive form for creating or editing delegation records.
 * Supports multi-tab organization: Basic Info, Members, Schedule, Checklist, and Follow-up.
 * Includes auto-saving draft functionality to prevent data loss.
 * 
 * @param props - Component props following SharedDelegationFormProps interface.
 */
export default function SharedDelegationForm({ role }: SharedDelegationFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState("basic");
  const [newMember, setNewMember] = useState({
    fullName: "",
    gender: "",
    role: "",
    organizationName: "",
    identityNumber: "",
    isVip: false
  });
  
  // Deletion States
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  const { data: detailData, isLoading: isDetailLoading } = useDelegationDetailQuery(id);
  const { createMutation, updateMutation } = useDelegationsQuery(undefined, false);
  
  // Wait for app-init to finish before enabling master data hooks to ensure cache is used
  const { isSuccess: isInitReady } = useInitQuery();
  
  // 1. Critical Master Data (Small, cached for 1 hour)
  const { options, optionsQuery } = usePartnerOptionsQuery(isInitReady);
  const { data: unitsData } = useUnitsQuery(isInitReady);
  const { data: sectorsData } = useSectorsQuery(isInitReady);
  const { data: locationsData } = useLocationsQuery(isInitReady);

  // 2. Heavy Data Lists (Staggered/Lazy loaded)
  // - Fetch partners ONLY after critical options are loaded to avoid queueing
  const { partners } = usePartnersListQuery({ pageSize: 100 }, isInitReady && optionsQuery.isSuccess);

  // - Fetch users ONLY when entering tabs that actually need them (Checklist/Schedule)
  const isUserListNeeded = activeTab === "schedule" || activeTab === "checklist";
  const usersQuery = useAdminUsersListQuery({ pageSize: 100 }, isInitReady && optionsQuery.isSuccess && isUserListNeeded);
  const staffList = usersQuery.data?.items || [];

  const unitOptions = React.useMemo(() => 
    (unitsData ?? []).map((u: OrgUnitItem) => ({ label: u.unitName || "Unknown", value: String(u.id) })),
    [unitsData]
  );

  const sectorOptions = React.useMemo(() => 
    (sectorsData ?? []).map((s: MasterDataItem) => ({ label: s.name_vi || s.name_en || "Unknown", value: String(s.id) })),
    [sectorsData]
  );

  const partnerOptions = React.useMemo(() => 
    partners.map(p => ({ label: p.name, value: String(p.id) })),
    [partners]
  );

  const locationOptions = React.useMemo(() => 
    (locationsData ?? []).map((l: MasterDataItem) => ({ label: l.name_vi || l.name_en || "Unknown", value: String(l.id) })),
    [locationsData]
  );

  const countries = options.countries;

  const userOptions = React.useMemo(() => 
    (staffList ?? []).map((u: AdminUser) => ({ label: u.fullName || "Unknown", value: String(u.id) })),
    [staffList]
  );
  const formError = detailData === undefined && isEdit && !isDetailLoading && id ? "Unable to load delegation record for editing." : null;

  const [formData, setFormData] = useState({
    name: "",
    direction: 1,
    priority: 2,
    status: 0,
    country_id: 0,
    partner_ids: [] as number[],
    host_unit_id: 0,
    start_date: "",
    end_date: "",
    objective: "",
    description: "",
    investment_potential: 0,
    sector_ids: [] as number[],
    members: [] as Array<{ 
      fullName: string; 
      role: string; 
      organizationName: string;
      gender: string;
      identityNumber: string;
      isVip: boolean;
    }>,
    checklist_items: [] as Array<FormChecklistItem>,
    rating: 0,
    outcome_summary: "",
    next_steps: "",
    contact_name: "",
    contact_job: "",
    contact_phone: "",
    contact_email: "",
  });
  const [formErrors, setFormErrors] = useState<Set<string>>(new Set());
  const [tempChecklistPic, setTempChecklistPic] = useState<string>("");
  const [scheduleItems, setScheduleItems] = useState<FormScheduleItem[]>([]);
  const [scheduleDraft, setScheduleDraft] = useState({ 
    date: "", 
    title: "", 
    note: "",
    location_id: undefined as number | undefined,
    staff_id: undefined as number | undefined,
    logistics_note: ""
  });

  const initialFormData = useMemo(() => ({
    name: "",
    direction: 1,
    priority: 2,
    status: 1,
    country_id: 0,
    partner_ids: [] as number[],
    host_unit_id: 0,
    start_date: "",
    end_date: "",
    objective: "",
    description: "",
    members: [] as { fullName: string; role: string }[],
  }), []);
  const initialScheduleItems = useMemo(() => [] as Array<{ id: string; date: string; title: string; note: string }>, []);

  const draftStorageKey = useMemo(
    () => `ipa:delegation-form:draft:${role}:${isEdit ? id : "create"}`,
    [id, isEdit, role],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { clearDraft, isDirty } = useDraftUnsavedGuard({
    enabled: true, // Always enable for both create and edit
    storageKey: draftStorageKey,
    value: {
      formData,
      scheduleItems,
    },
    initialValue: {
      formData: initialFormData,
      scheduleItems: initialScheduleItems,
    },
    isSubmitting,
    restoreToastMessage: "Bản nháp đã được khôi phục.",
    restoreToastId: "delegation-form-draft-restored",
    onRestore: (draftValue) => {
      const normalized = draftValue as {
        formData?: typeof formData;
        scheduleItems?: typeof scheduleItems;
      } & typeof formData;

      if (normalized.formData) {
        setFormData((prev) => ({ ...prev, ...normalized.formData }));
      } else {
        // Fallback for older draft format
        const rest = { ...(normalized as Record<string, unknown>) };
        delete rest.scheduleItems;
        setFormData((prev) => ({ ...prev, ...(rest as Partial<typeof formData>) }));
      }

      if (Array.isArray(normalized.scheduleItems)) {
        setScheduleItems(normalized.scheduleItems);
      }
    },
  });

  useEffect(() => {
    if (detailData) {
      const d = detailData as DelegationDetailView;
      const contacts = Array.isArray(d.contacts) ? d.contacts : [];
      const primaryContact = contacts.find((c) => c?.is_primary) || contacts[0] || {};
      const nextFormData = {
        name: d.name,
        direction: d.direction,
        priority: d.priority,
        status: d.status,
        country_id: d.country_id,
        partner_ids: d.partners?.map((p) => p.id) || d.partner_ids || [],
        host_unit_id: d.host_unit_id,
        start_date: d.start_date.split("T")[0],
        end_date: d.end_date.split("T")[0],
        objective: d.objective || "",
        description: d.description || "",
        investment_potential: d.investment_potential || 0,
        sector_ids: d.sectors?.map((s) => s.id) || d.sector_ids || [],
        members: (d.members || []).map((m): FormMemberItem => ({
          fullName: m.full_name || "",
          role: m.title || "",
          organizationName: m.organization_name || "",
          gender: m.gender || "",
          identityNumber: m.identity_number || "",
          isVip: !!m.is_vip
        })),
        checklist_items: d.checklist?.map((c): FormChecklistItem => ({
          itemName: c.item_name || "",
          assigneeId: c.assignee_user_id === undefined ? undefined : Number(c.assignee_user_id),
          status: c.status
        })) || [],
        rating: d.outcomes?.[0]?.rating || 0,
        outcome_summary: d.outcomes?.[0]?.summary || "",
        next_steps: d.outcomes?.[0]?.next_steps || "",
        contact_name: primaryContact.name || "",
        contact_job: primaryContact.role_name || "",
        contact_phone: primaryContact.phone || "",
        contact_email: primaryContact.email || "",
      };
      setFormData(nextFormData);
      
      if (d.events) {
        setScheduleItems(d.events.map((e): FormScheduleItem => ({
          id: String(e.id),
          date: e.start_at.split("T")[0],
          title: e.title || "",
          note: e.description || "",
          location_id: e.location_id,
          staff_id: e.staff_id,
          logistics_note: e.logistics_note || ""
        })));
      }
    }
  }, [detailData]);

  /**
   * Validates and submits the delegation form data to the server.
   * Handles both creation of new records and updating existing ones.
   * 
   * @param overrideStatus - Optional status ID to override the current form status (e.g., submitting for approval).
   */
  const handleSave = async (overrideStatus?: number) => {
    const newErrors = new Set<string>();
    if (!formData.name) newErrors.add("name");
    if (!formData.start_date) newErrors.add("start_date");
    if (!formData.end_date) newErrors.add("end_date");
    if (!formData.host_unit_id) newErrors.add("host_unit_id");
    if (!formData.country_id) newErrors.add("country_id");
    if (!formData.direction) newErrors.add("direction");

    setFormErrors(newErrors);

    if (newErrors.size > 0) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (*).", { id: "delegation-required-fields" });
      // If error in basic info, switch to basic tab
      if (newErrors.has("name") || newErrors.has("start_date") || newErrors.has("end_date") || newErrors.has("host_unit_id") || newErrors.has("country_id")) {
        setActiveTab("basic");
      }
      return;
    }

    if (formData.start_date > formData.end_date) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", { id: "delegation-date-range" });
      setFormErrors(prev => new Set([...prev, "start_date", "end_date"]));
      setActiveTab("basic");
      return;
    }

    const finalStatus = overrideStatus || formData.status;

    const payload = {
      ...formData,
      status: finalStatus,
      description: formData.description.trim(),
      partner_ids: formData.partner_ids,
      sector_ids: formData.sector_ids,
      investment_potential: formData.investment_potential,
      members: formData.members.map(m => ({
        fullName: m.fullName,
        role: m.role,
        gender: m.gender,
        identityNumber: m.identityNumber,
        organizationName: m.organizationName,
        isVip: m.isVip
      })),
      schedule_items: scheduleItems.map((item) => ({
        date: item.date,
        title: item.title,
        note: item.note,
        location_id: item.location_id,
        staff_id: item.staff_id,
        logistics_note: item.logistics_note,
      })),
      checklist_items: formData.checklist_items.map(item => ({
        itemName: item.itemName,
        assigneeId: item.assigneeId,
        status: item.status
      })),
      rating: formData.rating,
      outcome: {
        rating: formData.rating,
        summary: formData.outcome_summary,
        next_steps: formData.next_steps,
      },
      contacts: formData.contact_name?.trim() ? [
        {
          contact_name: formData.contact_name,
          contact_job: formData.contact_job,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
        }
      ] : [],
    };

    if (isEdit) {
      updateMutation.mutate({ id: id!, data: payload }, {
        onSuccess: () => {
          clearDraft();
          toast.success(finalStatus === 1 ? "Hồ sơ đoàn công tác đã được gửi phê duyệt." : "Cập nhật hồ sơ đoàn công tác thành công.");
          navigate(`/delegations`);
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          clearDraft();
          toast.success(finalStatus === 1 ? "Hồ sơ đoàn công tác đã được tạo và gửi phê duyệt." : "Hồ sơ đoàn công tác đã được tạo (Bản nháp).");
          navigate(`/delegations`);
        }
      });
    }
  };

  if (isEdit && isDetailLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Đang tải dữ liệu đoàn công tác..." />
      </div>
    );
  }

  if (formError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Lỗi tải dữ liệu</p>
        <p className="max-w-md text-sm font-medium text-rose-700">{formError}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-20 duration-500 animate-in slide-in-from-bottom-4">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} title="Quay lại" aria-label="Quay lại" className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 transition-all hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-title text-2xl font-black text-brand-text-dark">
            {isEdit ? "Cập nhật thông tin đoàn công tác" : "Thiết lập đoàn công tác mới"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
              <span className="size-1.5 animate-pulse rounded-full bg-blue-500"></span>
              ĐÃ LƯU NHÁP
            </span>
          )}
          {(!isEdit || formData.status === 0) && (
            <button
              onClick={() => handleSave(0)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-60"
            >
              <Save size={16} />
              Lưu nháp
            </button>
          )}
          
          <button
            onClick={() => handleSave(role === "staff" ? 1 : formData.status)}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {role === "staff" && (formData.status === 0 || !isEdit) ? (
              <>
                <Send size={16} />
                {isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}
              </>
            ) : (
              <>
                <Save size={16} />
                {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật thay đổi" : "Lưu thông tin"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1">
        <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")} icon={<Building2 size={16} />} label="Thông tin chung" />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users size={16} />} label="Thành viên" />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={<Calendar size={16} />} label="Lịch trình" />
        <TabButton active={activeTab === "checklist"} onClick={() => setActiveTab("checklist")} icon={<Send size={16} />} label="Danh sách công việc" />
        {isEdit && <TabButton active={activeTab === "followup"} onClick={() => setActiveTab("followup")} icon={<FileText size={16} />} label="Theo dõi sau đoàn" />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
               <label htmlFor="delegation-name" className="text-xs font-bold uppercase text-slate-500">
                 Tên đoàn công tác <span className="text-rose-500">*</span>
               </label>
               <Input 
                 id="delegation-name"
                 name="name"
                 hasError={formErrors.has("name")}
                 className="h-[48px] border-slate-200 bg-slate-50 font-bold focus:bg-white"
                 value={formData.name}
                 onChange={(e) => {
                   setFormData({...formData, name: e.target.value});
                   if (formErrors.has("name")) {
                     const next = new Set(formErrors);
                     next.delete("name");
                     setFormErrors(next);
                   }
                 }}
               />
            </div>
            <div className="space-y-2">
               <label htmlFor="delegation-direction" className="text-xs font-bold uppercase text-slate-500">Loại hình đoàn *</label>
               <SelectField 
                 id="delegation-direction"
                 name="direction"
                 hasError={formErrors.has("direction")}
                 value={formData.direction === 1 ? "inbound" : "outbound"}
                 onValueChange={(v) => {
                   setFormData({...formData, direction: v === "inbound" ? 1 : 2});
                   if (formErrors.has("direction")) {
                     const next = new Set(formErrors);
                     next.delete("direction");
                     setFormErrors(next);
                   }
                 }}
                 options={[{label: "Inbound (Arrival)", value: "inbound"}, {label: "Outbound (Departure)", value: "outbound"}]}
               />
            </div>
             <div className="space-y-2">
                <label htmlFor="delegation-country" className="text-xs font-bold uppercase text-slate-500">Quốc gia *</label>
                <SelectField 
                  id="delegation-country"
                  name="country_id"
                  hasError={formErrors.has("country_id")}
                  value={String(formData.country_id)}
                  onValueChange={(v) => {
                    setFormData({...formData, country_id: Number(v)});
                    if (formErrors.has("country_id")) {
                      const next = new Set(formErrors);
                      next.delete("country_id");
                      setFormErrors(next);
                    }
                  }}
                  options={countries.map((c: PartnerOptionItem) => ({ label: c.label, value: String(c.id) }))}
                  placeholder="Chọn quốc gia..."
                />
             </div>
             <div className="space-y-2">
                <label htmlFor="delegation-unit" className="text-xs font-bold uppercase text-slate-500">Đơn vị chủ trì *</label>
                <SelectField 
                  id="delegation-unit"
                  name="host_unit_id"
                  hasError={formErrors.has("host_unit_id")}
                  value={String(formData.host_unit_id)}
                  onValueChange={(v) => {
                    setFormData({...formData, host_unit_id: Number(v)});
                    if (formErrors.has("host_unit_id")) {
                      const next = new Set(formErrors);
                      next.delete("host_unit_id");
                      setFormErrors(next);
                    }
                  }}
                  options={unitOptions}
                  placeholder="Chọn đơn vị..."
                />
             </div>
             <div className="space-y-2">
                <label htmlFor="delegation-potential" className="text-xs font-bold uppercase text-slate-500">Tiềm năng đầu tư (VND/USD)</label>
                <input 
                  id="delegation-potential"
                  name="investment_potential"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                  value={formData.investment_potential}
                  onChange={(e) => setFormData({...formData, investment_potential: Number(e.target.value)})}
                  placeholder="Nhập số tiền dự kiến..."
                />
             </div>
             <div className="space-y-2 md:col-span-2">
                <label htmlFor="delegation-sectors" className="text-xs font-bold uppercase text-slate-500">Lĩnh vực quan tâm</label>
                <MultiSelectField 
                  id="delegation-sectors"
                  name="sector_ids"
                  values={formData.sector_ids.map(String)}
                  onValuesChange={(v) => setFormData({...formData, sector_ids: v.map(Number)})}
                  options={sectorOptions}
                  placeholder="Tìm kiếm và chọn lĩnh vực..."
                  triggerClassName="h-[48px]"
                />
             </div>

             <div className="mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Đầu mối liên hệ chính</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-[10px] font-bold text-slate-500">Họ và tên *</label>
                    <input 
                      id="contact-name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="Mr/Ms..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-job" className="text-[10px] font-bold text-slate-500">Chức vụ / Vị trí</label>
                    <input 
                      id="contact-job"
                      value={formData.contact_job}
                      onChange={(e) => setFormData({...formData, contact_job: e.target.value})}
                      placeholder="Sales Manager..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-phone" className="text-[10px] font-bold text-slate-500">Số điện thoại / WhatsApp</label>
                    <input 
                      id="contact-phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="+..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-[10px] font-bold text-slate-500">Địa chỉ Email</label>
                    <input 
                      id="contact-email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="example@email.com" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-2 md:col-span-2">
                <label htmlFor="delegation-partner" className="text-xs font-bold uppercase text-slate-500">Đối tác</label>
                <MultiSelectField 
                  id="delegation-partner"
                  name="partner_ids"
                  values={formData.partner_ids.map(String)}
                  onValuesChange={(v) => setFormData({...formData, partner_ids: v.map(Number)})}
                  options={partnerOptions}
                  placeholder="Tìm kiếm và chọn đối tác..."
                  triggerClassName="h-[48px]"
                />
             </div>
            <div className="space-y-2">
               <label htmlFor="delegation-start-date" className="text-xs font-bold uppercase text-slate-500">Ngày bắt đầu *</label>
               <DatePicker 
                 id="delegation-start-date"
                 name="start_date"
                 hasError={formErrors.has("start_date")}
                 date={formData.start_date}
                 setDate={(v) => {
                   setFormData({...formData, start_date: v});
                   if (formErrors.has("start_date")) {
                     const next = new Set(formErrors);
                     next.delete("start_date");
                     setFormErrors(next);
                   }
                 }}
               />
            </div>
            <div className="space-y-2">
               <label htmlFor="delegation-end-date" className="text-xs font-bold uppercase text-slate-500">Ngày kết thúc *</label>
               <DatePicker 
                 id="delegation-end-date"
                 name="end_date"
                 hasError={formErrors.has("end_date")}
                 date={formData.end_date}
                 setDate={(v) => {
                   setFormData({...formData, end_date: v});
                   if (formErrors.has("end_date")) {
                     const next = new Set(formErrors);
                     next.delete("end_date");
                     setFormErrors(next);
                   }
                 }}
               />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="delegation-objective" className="text-xs font-bold uppercase text-slate-500">Mục tiêu</label>
              <textarea 
                id="delegation-objective"
                name="objective"
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                value={formData.objective}
                onChange={(e) => setFormData({...formData, objective: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="delegation-description" className="text-xs font-bold uppercase text-slate-500">Nội dung chi tiết</label>
               <PlainTextarea 
                 id="delegation-description"
                 name="description"
                 className="min-h-[120px] bg-slate-50 font-bold focus:bg-white"
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 lg:col-span-2">
                <label htmlFor="member-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên *</label>
                <input 
                  id="member-name"
                  type="text" 
                  placeholder="Enter name..." 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-primary" 
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="member-gender" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giới tính</label>
                <SelectField 
                  id="member-gender"
                  value={newMember.gender}
                  onValueChange={(v) => setNewMember({...newMember, gender: v})}
                  options={[
                    { label: "Nam", value: "male" },
                    { label: "Nữ", value: "female" },
                    { label: "Khác", value: "other" }
                  ]}
                  placeholder="Chọn..."
                  triggerClassName="h-[38px] px-4 py-2 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="member-role" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chức vụ / Vị trí</label>
                <input 
                  id="member-role"
                  type="text" 
                  placeholder="VD: Giám đốc..." 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-primary" 
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label htmlFor="member-org" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cơ quan / Doanh nghiệp</label>
                <input 
                  id="member-org"
                  type="text" 
                  placeholder="Tên công ty..." 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-primary" 
                  value={newMember.organizationName}
                  onChange={(e) => setNewMember({...newMember, organizationName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="member-identity" className="text-[10px] font-black uppercase tracking-widest text-slate-400">CMND / Hộ chiếu</label>
                <input 
                  id="member-identity"
                  type="text" 
                  placeholder="Số định danh..." 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm outline-none focus:border-primary" 
                  value={newMember.identityNumber}
                  onChange={(e) => setNewMember({...newMember, identityNumber: e.target.value})}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="size-4 rounded border-slate-300 text-primary focus:ring-primary" 
                    checked={newMember.isVip}
                    onChange={(e) => setNewMember({...newMember, isVip: e.target.checked})}
                  />
                  <span className="text-xs font-bold text-slate-600">Thành viên VIP</span>
                </label>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!newMember.fullName) {
                    toast.error("Vui lòng nhập tên thành viên.");
                    return;
                  }

                  setFormData({
                    ...formData,
                    members: [...formData.members, { ...newMember }]
                  });

                  // Reset state
                  setNewMember({
                    fullName: "",
                    role: "",
                    organizationName: "",
                    gender: "",
                    identityNumber: "",
                    isVip: false
                  });
                }}
                className="rounded-lg bg-brand-dark-900 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 lg:col-span-4"
              >
                Thêm thành viên vào danh sách
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Thông tin thành viên</th>
                    <th className="px-6 py-4">Cơ quan / Đơn vị</th>
                    <th className="px-6 py-4">Định danh</th>
                    <th className="px-6 py-4 text-center">VIP</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.members.map((m: FormMemberItem, idx: number) => (
                    <tr key={idx} className="group hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{m.fullName}</div>
                        <div className="text-xs text-slate-400">{m.role || "Chưa có chức vụ"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{m.organizationName || "-"}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{m.identityNumber || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {m.isVip && <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">⭐</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setMemberToDelete(idx)}
                          className="rounded-lg p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.members.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">Chưa có thành viên nào được thêm.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="sched-date" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày *</label>
                <DatePicker 
                  id="sched-date" name="d" date={scheduleDraft.date} 
                  setDate={(v: string) => setScheduleDraft({...scheduleDraft, date: v})} 
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label htmlFor="sched-title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung hoạt động chính *</label>
                <input 
                  id="sched-title"
                  value={scheduleDraft.title}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, title: e.target.value})}
                  placeholder="VD: Họp tại..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" 
                />
              </div>
              <div className="space-y-1 lg:col-span-3">
                <label htmlFor="sched-note" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú / Chi tiết</label>
                <textarea
                  id="sched-note"
                  rows={3}
                  value={scheduleDraft.note}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, note: e.target.value})}
                  placeholder="Mô tả chi tiết hoạt động..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-loc" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa điểm</label>
                <SelectField 
                  id="sched-loc" name="l" 
                  value={String(scheduleDraft.location_id || "")}
                  onValueChange={(v: string) => setScheduleDraft({...scheduleDraft, location_id: Number(v)})}
                  options={locationOptions}
                  placeholder="Chọn địa điểm..."
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-staff" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cán bộ phụ trách</label>
                <SelectField 
                   id="sched-staff" name="s" 
                   value={String(scheduleDraft.staff_id || "")}
                   onValueChange={(v: string) => setScheduleDraft({...scheduleDraft, staff_id: Number(v)})}
                   options={userOptions}
                   placeholder="Chọn cán bộ..."
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-logistics" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hậu cần (Xe, Lái xe...)</label>
                <input 
                  id="sched-logistics"
                  value={scheduleDraft.logistics_note}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, logistics_note: e.target.value})}
                  placeholder="Thông tin xe, tên tài xế..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" 
                />
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!scheduleDraft.date || !scheduleDraft.title) return;
                  setScheduleItems([...scheduleItems, {
                    ...scheduleDraft,
                    id: String(Date.now())
                  }]);
                  setScheduleDraft({ date: "", title: "", note: "", location_id: undefined, staff_id: undefined, logistics_note: "" });
                }}
                className="rounded-lg bg-primary py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 lg:col-span-3"
              >
                Thêm vào lịch trình
              </button>
            </div>

            <div className="space-y-3">
               {scheduleItems.map((item: FormScheduleItem) => (
                 <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
                    <div className="flex shrink-0 items-center justify-center rounded-lg bg-slate-50 px-4 py-2 text-center">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-slate-400">{formatDate(item.date).split('/')[2]}</span>
                          <span className="font-title text-lg font-black text-primary">{formatDate(item.date).split('/')[0]}/{formatDate(item.date).split('/')[1]}</span>
                       </div>
                    </div>
                    <div className="flex-1 space-y-1">
                       <h4 className="font-bold text-slate-800">{item.title}</h4>
                        {item.note ? <p className="text-sm text-slate-600">{item.note}</p> : null}
                       <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          {item.location_id && <span>📍 {locationOptions.find((l: { value: string }) => l.value === String(item.location_id))?.label}</span>}
                          {item.staff_id && <span>👤 Cán bộ phụ trách: {userOptions.find((u: { value: string }) => u.value === String(item.staff_id))?.label}</span>}
                          {item.logistics_note && <span>🚚 {item.logistics_note}</span>}
                       </div>
                    </div>
                    <button 
                      onClick={() => setScheduleToDelete(item.id)}
                      className="shrink-0 p-2 text-slate-300 hover:text-rose-500"
                    >
                      <X size={18} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Thêm mục chuẩn bị</h3>
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5">
                     <input id="chk-name" placeholder="VD: Đặt xe 16 chỗ..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" />
                     <SelectField 
                        id="chk-pic" name="p" 
                        value={tempChecklistPic}
                        onValueChange={(v) => setTempChecklistPic(v)}
                        options={userOptions}
                        placeholder="Giao cho..."
                     />
                     <button 
                        onClick={() => {
                          const name = (document.getElementById('chk-name') as HTMLInputElement).value;
                          if (!name) return;
                          setFormData({
                            ...formData,
                            checklist_items: [...formData.checklist_items, {
                              itemName: name,
                              assigneeId: tempChecklistPic ? Number(tempChecklistPic) : undefined,
                              status: 0
                            }]
                          });
                          (document.getElementById('chk-name') as HTMLInputElement).value = '';
                          setTempChecklistPic("");
                        }}
                        className="w-full rounded-lg bg-brand-dark-900 py-2.5 text-[10px] font-black uppercase tracking-widest text-white"
                     >Thêm nhiệm vụ</button>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tổng hợp danh sách công việc</h3>
                  <div className="space-y-2">
                     {formData.checklist_items.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                          <input 
                            type="checkbox" 
                            checked={item.status === 1} 
                            onChange={(e) => {
                              const newList = [...formData.checklist_items];
                              newList[idx].status = e.target.checked ? 1 : 0;
                              setFormData({...formData, checklist_items: newList});
                            }}
                            className="size-4 rounded text-primary focus:ring-primary" 
                          />
                          <div className="flex-1">
                             <p className={cn("text-sm font-medium", item.status === 1 ? "text-slate-400 line-through" : "text-slate-700")}>{item.itemName}</p>
                             {item.assigneeId && <span className="text-[10px] text-slate-400">👤 {userOptions.find((u: { value: string; label: string }) => u.value === String(item.assigneeId))?.label}</span>}
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, checklist_items: formData.checklist_items.filter((_, i) => i !== idx)})}
                            className="p-1 text-slate-300 hover:text-rose-500"
                          >
                            <X size={14} />
                          </button>
                       </div>
                     ))}
                     {formData.checklist_items.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Chưa có đầu việc nào trong checklist.</p>}
                  </div>
               </div>
            </div>
          </div>
        )}
        {activeTab === "followup" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-8 text-center">
               <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600">Đánh giá đoàn công tác</h3>
               <div className="mb-4 flex justify-center gap-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                     key={star}
                     type="button"
                     onClick={() => setFormData({ ...formData, rating: star })}
                     className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                   >
                     {star <= formData.rating ? '⭐' : '☆'}
                   </button>
                 ))}
               </div>
               <p className="text-sm font-medium text-amber-700">Vui lòng chọn mức độ ưu tiên xử lý sau đoàn</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
               <div className="space-y-2">
                  <label htmlFor="outcome-summary" className="text-xs font-black uppercase tracking-widest text-slate-400">Kết quả đạt được</label>
                  <textarea 
                    id="outcome-summary"
                    rows={6}
                    value={formData.outcome_summary}
                    onChange={(e) => setFormData({...formData, outcome_summary: e.target.value})}
                    placeholder="Tóm tắt kết quả (VD: Đã ký MOU, Đã gửi hồ sơ đất đai...)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
                  />
               </div>
               <div className="space-y-2">
                  <label htmlFor="next-steps" className="text-xs font-black uppercase tracking-widest text-slate-400">Các bước tiếp theo / Cần thực hiện</label>
                  <textarea 
                    id="next-steps"
                    rows={6}
                    value={formData.next_steps}
                    onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
                    placeholder="Các nhiệm vụ cần phân công để duy trì kết nối..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
                  />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={memberToDelete !== null}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete !== null) {
            setFormData({
              ...formData,
              members: formData.members.filter((_, i) => i !== memberToDelete)
            });
            setMemberToDelete(null);
            toast.success("Đã xóa thành viên khỏi danh sách.");
          }
        }}
        title="Xóa thành viên?"
        description="Bạn có chắc chắn muốn xóa thành viên này khỏi hồ sơ đoàn công tác?"
        confirmText="Xác nhận xóa"
      />

      <ConfirmModal
        isOpen={scheduleToDelete !== null}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={() => {
          if (scheduleToDelete !== null) {
            setScheduleItems(scheduleItems.filter(i => i.id !== scheduleToDelete));
            setScheduleToDelete(null);
            toast.success("Đã xóa lịch trình.");
          }
        }}
        title="Xóa mục lịch trình?"
        description="Bạn có chắc chắn muốn xóa mục lịch trình này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận xóa"
      />
    </div>
  );
}

/** Specialized button for navigation tabs in the delegation form. */
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-lg px-6 py-3 text-[11px] font-bold uppercase tracking-wider transition-all",
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
