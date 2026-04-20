import { masterDataApi } from "@/api/masterDataApi";
import { teamsApi } from "@/api/teamsApi";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MultiSelectField } from "@/components/ui/MultiSelectField";
import { SelectField } from "@/components/ui/SelectField";
import { useAdminUsersListQuery } from "@/hooks/useAdminUsersQuery";
import { useDelegationDetailQuery, useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { useDraftUnsavedGuard } from "@/hooks/useDraftUnsavedGuard";
import { usePartnerOptionsQuery, usePartnersListQuery } from "@/hooks/usePartnersQuery";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, FileText, Save, Send, Users, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { DelegationApiItem } from "@/dataHelper/delegations.dataHelper";

type DelegationMemberApi = {
  full_name?: string;
  title?: string;
  organization_name?: string;
  gender?: string;
  identity_number?: string;
  is_vip?: boolean;
};

type DelegationEventApi = {
  id: string | number;
  start_at: string;
  title?: string;
  description?: string;
  location_id?: number;
  staff_id?: number;
  logistics_note?: string;
};

type DelegationChecklistApi = {
  item_name?: string;
  assignee_user_id?: number | string;
  status: number;
};

type DelegationOutcomeApi = {
  rating?: number;
  summary?: string;
  next_steps?: string;
};

type DelegationContactApi = { name?: string; role_name?: string; phone?: string; email?: string; is_primary?: boolean };

type DelegationDetailView = Omit<DelegationApiItem, "members" | "events" | "outcomes" | "checklist" | "contacts" | "partners" | "sectors"> & {
  members?: DelegationMemberApi[];
  events?: DelegationEventApi[];
  outcomes?: DelegationOutcomeApi[];
  checklist?: DelegationChecklistApi[];
  contacts?: DelegationContactApi[];
  partners?: Array<{ id: number }>;
  sectors?: Array<{ id: number }>;
};

type FormMemberItem = {
  fullName: string;
  role: string;
  organizationName: string;
  gender: string;
  identityNumber: string;
  isVip: boolean;
};

type FormChecklistItem = {
  itemName: string;
  assigneeId?: number;
  status: number;
};

type FormScheduleItem = {
  id: string;
  date: string;
  title: string;
  note: string;
  location_id?: number;
  staff_id?: number;
  logistics_note?: string;
};

interface SharedDelegationFormProps {
  role: "admin" | "director" | "manager" | "staff";
}

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
  const { createMutation, updateMutation } = useDelegationsQuery();
  const { options } = usePartnerOptionsQuery();
  const { partners } = usePartnersListQuery({ pageSize: 100 });
  
  const { data: unitsData } = useQuery({
    queryKey: ["org-units"],
    queryFn: () => teamsApi.listUnits(),
  });

  const unitOptions = React.useMemo(() => 
    (unitsData?.data?.items ?? []).map(u => ({ label: u.unitName, value: String(u.id) })),
    [unitsData]
  );

  const partnerOptions = React.useMemo(() => 
    partners.map(p => ({ label: p.name, value: String(p.id) })),
    [partners]
  );

  const { data: sectorsData } = useQuery({
    queryKey: ["master-data-sectors"],
    queryFn: () => masterDataApi.list("sector"),
  });

  const sectorOptions = React.useMemo(() => 
    (sectorsData?.data?.items ?? []).map(s => ({ label: s.name_vi, value: String(s.id) })),
    [sectorsData]
  );

  const { data: locationsData } = useQuery({
    queryKey: ["master-data-locations"],
    queryFn: () => masterDataApi.list("location"),
  });

  const locationOptions = React.useMemo(() => 
    (locationsData?.data?.items ?? []).map(l => ({ label: l.name_vi, value: String(l.id) })),
    [locationsData]
  );

  const { data: usersData } = useAdminUsersListQuery({ pageSize: 100 });
  const countries = options.countries;
  const userOptions = usersData?.data?.items?.map(u => ({ label: u.fullName, value: String(u.id) })) || [];
  const formError = detailData === undefined && isEdit && !isDetailLoading && id ? "Không thể tải dữ liệu chỉnh sửa." : null;

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
    restoreToastMessage: "Đã khôi phục bản nháp chưa lưu.",
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
    if (detailData?.data) {
      const d = detailData.data as DelegationDetailView;
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

  const handleSave = async (overrideStatus?: number) => {
    if (isSubmitting) {
      return;
    }

    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("Vui lòng điền các trường bắt buộc.", { id: "delegation-required-fields" });
      return;
    }

    if (formData.start_date > formData.end_date) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", { id: "delegation-date-range" });
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
          toast.success(finalStatus === 1 ? "Đã gửi hồ sơ chờ phê duyệt." : "Đã cập nhật hồ sơ đoàn.");
          navigate(`/delegations`);
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          clearDraft();
          toast.success(finalStatus === 1 ? "Đã tạo và gửi hồ sơ chờ phê duyệt." : "Đã tạo hồ sơ đoàn (Bản nháp).");
          navigate(`/delegations`);
        }
      });
    }
  };

  if (isEdit && isDetailLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Đang tải dữ liệu hồ sơ..." />
      </div>
    );
  }

  if (formError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được dữ liệu</p>
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
          <h1 className="font-title text-2xl font-black text-slate-900">
            {isEdit ? "Cập nhật Hồ sơ Đoàn" : "Thiết lập Hồ sơ Đoàn"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
              <span className="size-1.5 animate-pulse rounded-full bg-blue-500"></span>
              ĐÃ LƯU BẢN NHÁP
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
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {role === "staff" && (formData.status === 0 || !isEdit) ? (
              <>
                <Send size={16} />
                {isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}
              </>
            ) : (
              <>
                <Save size={16} />
                {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu hồ sơ"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1">
        <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")} icon={<Building2 size={16} />} label="Thông tin chung" />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users size={16} />} label="Thành viên đoàn" />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={<Calendar size={16} />} label="Lịch trình" />
        <TabButton active={activeTab === "checklist"} onClick={() => setActiveTab("checklist")} icon={<Send size={16} />} label="Checklist" />
        {isEdit && <TabButton active={activeTab === "followup"} onClick={() => setActiveTab("followup")} icon={<FileText size={16} />} label="Theo dõi" />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
               <label htmlFor="delegation-name" className="text-xs font-bold uppercase text-slate-500">Tên đoàn công tác *</label>
               <input 
                 id="delegation-name"
                 name="name"
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label htmlFor="delegation-direction" className="text-xs font-bold uppercase text-slate-500">Loại đoàn *</label>
               <SelectField 
                 id="delegation-direction"
                 name="direction"
                 value={formData.direction === 1 ? "inbound" : "outbound"}
                 onValueChange={(v) => setFormData({...formData, direction: v === "inbound" ? 1 : 2})}
                 options={[{label: "Inbound (Đoàn đến)", value: "inbound"}, {label: "Outbound (Đoàn đi)", value: "outbound"}]}
               />
            </div>
             <div className="space-y-2">
                <label htmlFor="delegation-country" className="text-xs font-bold uppercase text-slate-500">Quốc gia *</label>
                <SelectField 
                  id="delegation-country"
                  name="country_id"
                  value={String(formData.country_id)}
                  onValueChange={(v) => setFormData({...formData, country_id: Number(v)})}
                  options={countries.map(c => ({ label: c.label, value: String(c.id) }))}
                  placeholder="Chọn quốc gia..."
                />
             </div>
             <div className="space-y-2">
                <label htmlFor="delegation-unit" className="text-xs font-bold uppercase text-slate-500">Đơn vị chủ trì *</label>
                <SelectField 
                  id="delegation-unit"
                  name="host_unit_id"
                  value={String(formData.host_unit_id)}
                  onValueChange={(v) => setFormData({...formData, host_unit_id: Number(v)})}
                  options={unitOptions}
                  placeholder="Chọn đơn vị..."
                />
             </div>
             <div className="space-y-2">
                <label htmlFor="delegation-potential" className="text-xs font-bold uppercase text-slate-500">Tiềm năng vốn (VND/USD)</label>
                <input 
                  id="delegation-potential"
                  name="investment_potential"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                  value={formData.investment_potential}
                  onChange={(e) => setFormData({...formData, investment_potential: Number(e.target.value)})}
                  placeholder="Nhập số vốn dự kiến..."
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
                  placeholder="Tìm và chọn lĩnh vực..."
                  triggerClassName="h-[48px]"
                />
             </div>

             <div className="mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Thông tin đầu mối (Contact Point)</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-[10px] font-bold text-slate-500">Họ tên người liên hệ *</label>
                    <input 
                      id="contact-name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="Ông/Bà..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-job" className="text-[10px] font-bold text-slate-500">Chức vụ</label>
                    <input 
                      id="contact-job"
                      value={formData.contact_job}
                      onChange={(e) => setFormData({...formData, contact_job: e.target.value})}
                      placeholder="Giám đốc kinh doanh..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-phone" className="text-[10px] font-bold text-slate-500">Số điện thoại/Zalo/WhatsApp</label>
                    <input 
                      id="contact-phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="+84..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-[10px] font-bold text-slate-500">Email</label>
                    <input 
                      id="contact-email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="example@gmail.com" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-2 md:col-span-2">
                <label htmlFor="delegation-partner" className="text-xs font-bold uppercase text-slate-500">Đối tác (Chọn nhiều)</label>
                <MultiSelectField 
                  id="delegation-partner"
                  name="partner_ids"
                  values={formData.partner_ids.map(String)}
                  onValuesChange={(v) => setFormData({...formData, partner_ids: v.map(Number)})}
                  options={partnerOptions}
                  placeholder="Tìm và chọn đối tác..."
                  triggerClassName="h-[48px]"
                />
             </div>
            <div className="space-y-2">
               <label htmlFor="delegation-start-date" className="text-xs font-bold uppercase text-slate-500">Ngày bắt đầu *</label>
               <DatePicker 
                 id="delegation-start-date"
                 name="start_date"
                 date={formData.start_date}
                 setDate={(v) => setFormData({...formData, start_date: v})}
               />
            </div>
            <div className="space-y-2">
               <label htmlFor="delegation-end-date" className="text-xs font-bold uppercase text-slate-500">Ngày kết thúc *</label>
               <DatePicker 
                 id="delegation-end-date"
                 name="end_date"
                 date={formData.end_date}
                 setDate={(v) => setFormData({...formData, end_date: v})}
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
              <label htmlFor="delegation-description" className="text-xs font-bold uppercase text-slate-500">Nội dung</label>
               <textarea 
                 id="delegation-description"
                 name="description"
                 rows={4}
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
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
                <label htmlFor="member-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ tên *</label>
                <input 
                  id="member-name"
                  type="text" 
                  placeholder="Nguyễn Văn A" 
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
                <label htmlFor="member-role" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chức vụ</label>
                <input 
                  id="member-role"
                  type="text" 
                  placeholder="Giám đốc" 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-primary" 
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label htmlFor="member-org" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổ chức/Doanh nghiệp</label>
                <input 
                  id="member-org"
                  type="text" 
                  placeholder="Samsung Electronics" 
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-primary" 
                  value={newMember.organizationName}
                  onChange={(e) => setNewMember({...newMember, organizationName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="member-identity" className="text-[10px] font-black uppercase tracking-widest text-slate-400">CCCD/Passport</label>
                <input 
                  id="member-identity"
                  type="text" 
                  placeholder="B1234567" 
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
                  <span className="text-xs font-bold text-slate-600">Thẻ VIP</span>
                </label>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!newMember.fullName) {
                    toast.error("Vui lòng nhập họ tên thành viên");
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
                className="rounded-lg bg-slate-900 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 lg:col-span-4"
              >
                Thêm vào danh sách
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Tổ chức</th>
                    <th className="px-6 py-4">Định danh</th>
                    <th className="px-6 py-4 text-center">VIP</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.members.map((m, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{m.fullName}</div>
                        <div className="text-xs text-slate-400">{m.role || "Chưa cập nhật chức vụ"}</div>
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
                  setDate={(v) => setScheduleDraft({...scheduleDraft, date: v})} 
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label htmlFor="sched-title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung chính *</label>
                <input 
                  id="sched-title"
                  value={scheduleDraft.title}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, title: e.target.value})}
                  placeholder="Làm việc tại..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" 
                />
              </div>
              <div className="space-y-1 lg:col-span-3">
                <label htmlFor="sched-note" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú</label>
                <textarea
                  id="sched-note"
                  rows={3}
                  value={scheduleDraft.note}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, note: e.target.value})}
                  placeholder="Mô tả chi tiết nội dung làm việc..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-loc" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa điểm</label>
                <SelectField 
                  id="sched-loc" name="l" 
                  value={String(scheduleDraft.location_id || "")}
                  onValueChange={(v) => setScheduleDraft({...scheduleDraft, location_id: Number(v)})}
                  options={locationOptions}
                  placeholder="Chọn địa điểm..."
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-staff" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cán bộ phụ trách</label>
                <SelectField 
                   id="sched-staff" name="s" 
                   value={String(scheduleDraft.staff_id || "")}
                   onValueChange={(v) => setScheduleDraft({...scheduleDraft, staff_id: Number(v)})}
                   options={userOptions}
                   placeholder="Chọn cán bộ..."
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sched-logistics" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hậu cần (Xe, Driver...)</label>
                <input 
                  id="sched-logistics"
                  value={scheduleDraft.logistics_note}
                  onChange={(e) => setScheduleDraft({...scheduleDraft, logistics_note: e.target.value})}
                  placeholder="Xe 7 chỗ, Tài xế A..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" 
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
               {scheduleItems.map(item => (
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
                          {item.location_id && <span>📍 {locationOptions.find(l => l.value === String(item.location_id))?.label}</span>}
                          {item.staff_id && <span>👤 PIC: {userOptions.find(u => u.value === String(item.staff_id))?.label}</span>}
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
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Thêm hạng mục chuẩn bị</h3>
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5">
                     <input id="chk-name" placeholder="Ví dụ: Đặt xe 16 chỗ..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary" />
                     <SelectField 
                        id="chk-pic" name="p" 
                        value={tempChecklistPic}
                        onValueChange={(v) => setTempChecklistPic(v)}
                        options={userOptions}
                        placeholder="Cán bộ phụ trách..."
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
                        className="w-full rounded-lg bg-slate-900 py-2.5 text-[10px] font-black uppercase tracking-widest text-white"
                     >Thêm hạng mục</button>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Danh sách Checklist</h3>
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
                             {item.assigneeId && <span className="text-[10px] text-slate-400">👤 {userOptions.find(u => u.value === String(item.assigneeId))?.label}</span>}
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, checklist_items: formData.checklist_items.filter((_, i) => i !== idx)})}
                            className="p-1 text-slate-300 hover:text-rose-500"
                          >
                            <X size={14} />
                          </button>
                       </div>
                     ))}
                     {formData.checklist_items.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Trống</p>}
                  </div>
               </div>
            </div>
          </div>
        )}
        {activeTab === "followup" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-8 text-center">
               <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600">Đánh giá tiềm năng đoàn</h3>
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
               <p className="text-sm font-medium text-amber-700">Hãy chọn mức độ ưu tiên xử lý sau chuyến thăm</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
               <div className="space-y-2">
                  <label htmlFor="outcome-summary" className="text-xs font-black uppercase tracking-widest text-slate-400">Kết quả đạt được</label>
                  <textarea 
                    id="outcome-summary"
                    rows={6}
                    value={formData.outcome_summary}
                    onChange={(e) => setFormData({...formData, outcome_summary: e.target.value})}
                    placeholder="Ghi tóm tắt kết quả (VD: Đã ký MOU, Cần cung cấp thêm hồ sơ đất đai...)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
                  />
               </div>
               <div className="space-y-2">
                  <label htmlFor="next-steps" className="text-xs font-black uppercase tracking-widest text-slate-400">Nhiệm vụ tiếp theo (Next Steps)</label>
                  <textarea 
                    id="next-steps"
                    rows={6}
                    value={formData.next_steps}
                    onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
                    placeholder="Các công việc cần phân công để duy trì liên hệ..."
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
        description="Bạn có chắc chắn muốn xóa thành viên này khỏi hồ sơ đoàn?"
        confirmText="Xác nhận xóa"
      />

      <ConfirmModal
        isOpen={scheduleToDelete !== null}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={() => {
          if (scheduleToDelete !== null) {
            setScheduleItems(scheduleItems.filter(i => i.id !== scheduleToDelete));
            setScheduleToDelete(null);
            toast.success("Đã xóa đầu mục lịch trình.");
          }
        }}
        title="Xóa lịch trình?"
        description="Bạn có chắc chắn muốn xóa đầu mục lịch trình này?"
        confirmText="Xác nhận xóa"
      />
    </div>
  );
}

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
