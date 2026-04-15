import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Users, Calendar, Info, TrendingUp, CheckSquare } from "lucide-react";
import { useDelegationDetailQuery } from "@/hooks/useDelegationsQuery";
import { mapDelegationStatus } from "@/dataHelper/delegations.dataHelper";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SharedDelegationDetailProps {
  role: "admin" | "director" | "manager" | "staff";
}

export default function SharedDelegationDetail({ role }: SharedDelegationDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: detailData, isLoading } = useDelegationDetailQuery(id);
  const detailError = detailData === undefined && !isLoading && id ? "Không thể tải chi tiết đoàn công tác." : null;
  const d = detailData?.data;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center spinning">Loading...</div>;
  }

  if (detailError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được chi tiết</p>
        <p className="max-w-md text-sm font-medium text-rose-700">{detailError}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!d) {
    return <div className="p-8 text-center text-slate-500">Đoàn công tác không tồn tại.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10 duration-500 animate-in fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 transition-all hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {d.code}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {format(new Date(d.start_date), "dd/MM/yyyy")} - {format(new Date(d.end_date), "dd/MM/yyyy")}
              </span>
            </div>
            <h1 className="mt-2 font-title text-3xl font-black text-slate-900">{d.name}</h1>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/${role}/delegations/${id}/edit`)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-slate-800"
        >
          <Edit size={16} />
          CHỈNH SỬA HỒ SƠ
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="TỔNG QUAN" icon={<Info size={14} />} />
        <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} label="THÀNH VIÊN" icon={<Users size={14} />} />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} label="LỊCH TRÌNH" icon={<Calendar size={14} />} />
        <TabButton active={activeTab === "outcomes"} onClick={() => setActiveTab("outcomes")} label="KẾT QUẢ" icon={<TrendingUp size={14} />} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
           {activeTab === "overview" && (
             <div className="rounded-xl border border-slate-200 bg-white p-8">
                <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Mục tiêu & Nội dung</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {d.description || "Chưa có mô tả chi tiết."}
                </p>
                <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{mapDelegationStatus(d.status)}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quốc gia</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">N/A</p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === "members" && (
              <div className="space-y-4">
                 {d.members?.map((m: any, i: number) => (
                   <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
                      <div>
                         <p className="text-sm font-bold text-slate-900">{m.full_name}</p>
                         <p className="text-xs text-slate-500">{m.title} - {m.organization_name}</p>
                      </div>
                   </div>
                 )) || <p className="text-center text-slate-400">Chưa có thành viên.</p>}
              </div>
           )}

           {(activeTab === "schedule" || activeTab === "outcomes") && (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 text-slate-400">
                 <CheckSquare size={32} className="mb-2 opacity-20" />
                 <p>Dữ liệu đang được đồng bộ...</p>
              </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cán bộ phụ trách</h4>
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-primary/20" />
                 <div>
                    <p className="text-sm font-bold text-slate-900">Admin System</p>
                    <p className="text-[10px] font-medium text-slate-500">Bộ phận Đầu tư</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

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
