import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, Users, Calendar, MapPin, Globe, FileText, 
  Plus, X, Building2, Info, AlertCircle, PlusCircle, Trash2 
} from "lucide-react";
import { toast } from "sonner";
import { SelectField } from "@/components/ui/SelectField";
import { cn } from "@/lib/utils";

interface Member {
  name: string;
  role: string;
  group: string;
  contact: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  location: string;
}

export default function DelegationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form State
  const [formData, setFormData] = useState({
    name: isEdit ? "Đoàn doanh nghiệp bán dẫn Hàn Quốc (Samsung & Partners)" : "",
    type: "Inbound",
    priority: "High",
    startDate: isEdit ? "2026-04-20" : "",
    endDate: isEdit ? "2026-04-25" : "",
    description: isEdit ? "Khảo sát quỹ đất tại Khu công nghệ cao Đà Nẵng..." : "",
    partner: isEdit ? "Samsung Electronics" : "",
    country: isEdit ? "Hàn Quốc" : "",
  });

  const [members, setMembers] = useState<Member[]>(
    isEdit ? [
      { name: "Lee Jae-yong", role: "Chủ tịch Samsung", group: "Phái đoàn", contact: "+82 10-xxxx-xxxx" },
      { name: "Kim Min-ji", role: "GĐ Dự án Quốc tế", group: "Phái đoàn", contact: "minji@samsung.com" },
    ] : []
  );

  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    isEdit ? [
      { time: "08:30", title: "Đón đoàn tại Sân bay Đà Nẵng", location: "Ga Quốc tế T2" },
      { time: "10:00", title: "Làm việc với UBND Thành phố", location: "Tòa nhà Trung tâm Hành chính" },
    ] : []
  );

  const handleAddMember = () => {
    setMembers([...members, { name: "", role: "", group: "Phái đoàn", contact: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleAddSchedule = () => {
    setSchedule([...schedule, { time: "", title: "", location: "" }]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên phái đoàn!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isEdit ? "Cập nhật hồ sơ thành công!" : "Tạo phái đoàn mới thành công!");
      navigate("/delegations");
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl pb-20 duration-500 animate-in slide-in-from-bottom-4">
      {/* Top Navigation */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-all hover:border-primary/20 hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-title text-2xl font-black tracking-tight text-slate-900">
              {isEdit ? "Cập nhật Hồ sơ Đoàn" : "Thiết lập Hồ sơ Đoàn"}
            </h1>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Cán bộ phụ trách: Trần Thu Hà
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50"
          >
            HỦY BỎ
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/95 disabled:opacity-50"
          >
            {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save size={16} />}
            {isLoading ? "ĐANG LƯU..." : "LƯU HỒ SƠ"}
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1">
        <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")} icon={<Building2 size={16} />} label="Thông tin chung" />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} icon={<Users size={16} />} label="Thành viên" />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={<Calendar size={16} />} label="Lịch trình" />
        <TabButton active={activeTab === "files"} onClick={() => setActiveTab("files")} icon={<FileText size={16} />} label="Tài liệu" />
      </div>

      {/* Form Content Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {activeTab === "basic" && (
          <div className="space-y-8 duration-300 animate-in fade-in">
            <div className="flex items-center gap-3 text-primary">
              <Info size={20} />
              <h3 className="font-title text-sm font-black uppercase tracking-wider">Thông tin định danh</h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <FormField label="Tên phái đoàn / Dự án" required className="md:col-span-2">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên chính thức của đoàn công tác..."
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Loại phái đoàn">
                  <SelectField
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    options={[
                      { label: "Inbound (Vào)", value: "Inbound" },
                      { label: "Outbound (Ra)", value: "Outbound" },
                    ]}
                  />
                </FormField>
                <FormField label="Mức ưu tiên">
                  <SelectField
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    options={[
                      { label: "Rất cao", value: "High" },
                      { label: "Trung bình", value: "Medium" },
                      { label: "Thấp", value: "Low" },
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Quốc gia / Lãnh thổ">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-5 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white" 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </FormField>

              <FormField label="Đối tác chiến lược">
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-5 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white" 
                    value={formData.partner}
                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                  />
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Ngày bắt đầu">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </FormField>

                <FormField label="Ngày kết thúc">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:bg-white"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Mục tiêu & Nội dung làm việc">
              <textarea
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-relaxed outline-none transition-all focus:border-primary focus:bg-white"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả tóm tắt mục tiêu, dự kiến kết quả..."
              />
            </FormField>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-8 duration-300 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <Users size={20} />
                <h3 className="font-title text-sm font-black uppercase tracking-wider">Danh sách thành viên ({members.length})</h3>
              </div>
              <button 
                onClick={handleAddMember}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800"
              >
                <Plus size={14} /> THÊM THÀNH VIÊN
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, i) => (
                <div key={i} className="group relative rounded-lg border border-slate-200 bg-slate-50 p-6 transition-all hover:border-primary/20">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <FormField label="Họ và tên">
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                        value={member.name}
                        onChange={(e) => handleMemberChange(i, "name", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Chức vụ">
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                        value={member.role}
                        onChange={(e) => handleMemberChange(i, "role", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Tổ chức">
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                        value={member.group}
                        onChange={(e) => handleMemberChange(i, "group", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Liên hệ">
                      <div className="flex items-center gap-2">
                        <input 
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                          value={member.contact}
                          onChange={(e) => handleMemberChange(i, "contact", e.target.value)}
                        />
                        <button 
                          onClick={() => handleRemoveMember(i)}
                          className="p-2 text-slate-300 transition-colors hover:text-rose-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </FormField>
                  </div>
                </div>
              ))}

              {members.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                  <p className="text-sm font-medium">Chưa có thành viên nào được thêm.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-8 duration-300 animate-in fade-in">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <Calendar size={20} />
                <h3 className="font-title text-sm font-black uppercase tracking-wider">Lịch trình chi tiết ({schedule.length})</h3>
              </div>
              <button 
                onClick={handleAddSchedule}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800"
              >
                <Plus size={14} /> THÊM MỐC LỊCH TRÌNH
              </button>
            </div>

            <div className="space-y-4">
              {schedule.map((item, i) => (
                <div key={i} className="group relative flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6 transition-all hover:border-primary/20">
                   <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField label="Thời gian (HH:mm)">
                      <input 
                        type="time"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                        value={item.time}
                        onChange={(e) => handleScheduleChange(i, "time", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Nội dung hoạt động">
                      <input 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                        value={item.title}
                        onChange={(e) => handleScheduleChange(i, "title", e.target.value)}
                        placeholder="VD: Đón đoàn tại sân bay..."
                      />
                    </FormField>
                    <FormField label="Địa điểm">
                      <div className="flex items-center gap-2">
                        <input 
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                          value={item.location}
                          onChange={(e) => handleScheduleChange(i, "location", e.target.value)}
                        />
                        <button 
                          onClick={() => handleRemoveSchedule(i)}
                          className="p-2 text-slate-300 transition-colors hover:text-rose-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-8 duration-300 animate-in fade-in">
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-slate-100">
               <PlusCircle size={48} className="mb-4 opacity-20" />
               <p className="text-sm font-bold">Kéo thả tài liệu vào đây hoặc click để chọn file</p>
               <p className="mt-2 text-[10px] font-medium uppercase tracking-widest opacity-50">Hỗ trợ PDF, DOCX, XLSX (Max 10MB)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
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

function FormField({ label, children, required, className }: any) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="ml-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
