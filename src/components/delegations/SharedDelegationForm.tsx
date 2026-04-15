import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Info, Building2, Globe, Users, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelegationDetailQuery, useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { SelectField } from "@/components/ui/SelectField";
import { toast } from "sonner";

interface SharedDelegationFormProps {
  role: "admin" | "director" | "manager" | "staff";
}

export default function SharedDelegationForm({ role }: SharedDelegationFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState("basic");

  const { data: detailData, isLoading: isDetailLoading } = useDelegationDetailQuery(id);
  const { createMutation, updateMutation } = useDelegationsQuery();
  const formError = detailData === undefined && isEdit && !isDetailLoading && id ? "Không thể tải dữ liệu chỉnh sửa." : null;

  const [formData, setFormData] = useState({
    name: "",
    direction: 1,
    priority: 2,
    status: 1,
    country_id: 1,
    host_unit_id: 1,
    start_date: "",
    end_date: "",
    objective: "",
    description: "",
  });

  useEffect(() => {
    if (detailData?.data) {
      const d = detailData.data;
      setFormData({
        name: d.name,
        direction: d.direction,
        priority: d.priority,
        status: d.status,
        country_id: d.country_id,
        host_unit_id: d.host_unit_id,
        start_date: d.start_date.split("T")[0],
        end_date: d.end_date.split("T")[0],
        objective: d.objective || "",
        description: d.description || "",
      });
    }
  }, [detailData]);

  const handleSave = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("Vui lòng điền các trường bắt buộc.");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({ id: id!, data: formData }, {
        onSuccess: () => navigate(`/${role}/delegations`)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate(`/${role}/delegations`)
      });
    }
  };

  if (isEdit && isDetailLoading) {
    return <div className="flex h-64 items-center justify-center spinning">Loading...</div>;
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
          <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 transition-all hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-title text-2xl font-black text-slate-900">
            {isEdit ? "Cập nhật Hồ sơ Đoàn" : "Thiết lập Hồ sơ Đoàn"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/95">
            <Save size={16} />
            {isEdit ? "Cập nhật" : "Lưu hồ sơ"}
          </button>
        </div>
      </div>

      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1">
        <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")} icon={<Building2 size={16} />} label="Thông tin chung" />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users size={16} />} label="Thành viên" />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={<Calendar size={16} />} label="Lịch trình" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Tên đoàn công tác *</label>
               <input 
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Loại đoàn *</label>
               <SelectField 
                 value={formData.direction === 1 ? "inbound" : "outbound"}
                 onValueChange={(v) => setFormData({...formData, direction: v === "inbound" ? 1 : 2})}
                 options={[{label: "Inbound (Đoàn đến)", value: "inbound"}, {label: "Outbound (Đoàn đi)", value: "outbound"}]}
               />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Quốc gia</label>
               <input 
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.country_id}
                 onChange={(e) => setFormData({...formData, country_id: parseInt(e.target.value)})}
                 type="number"
               />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Ngày bắt đầu *</label>
               <input 
                 type="date"
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.start_date}
                 onChange={(e) => setFormData({...formData, start_date: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Ngày kết thúc *</label>
               <input 
                 type="date"
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.end_date}
                 onChange={(e) => setFormData({...formData, end_date: e.target.value})}
               />
            </div>
            <div className="md:col-span-2 space-y-2">
               <label className="text-xs font-bold uppercase text-slate-500">Mục tiêu & Nội dung</label>
               <textarea 
                 rows={4}
                 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>
          </div>
        )}

        {activeTab === "members" && (
           <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <Users size={48} className="mb-4 opacity-20" />
              <p>Tính năng quản lý thành viên đang được tích hợp...</p>
           </div>
        )}

        {activeTab === "schedule" && (
           <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>Tính năng quản lý lịch trình đang được tích hợp...</p>
           </div>
        )}
      </div>
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
