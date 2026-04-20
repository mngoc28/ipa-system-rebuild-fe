import * as React from "react";
import { ArrowLeft, ExternalLink, Mail, MapPin, Star, Building2, Clock3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getNextPartnerStatus, getPartnerStatusValue, mapPartnerStatus } from "@/dataHelper/partners.dataHelper";
import { usePartnerDetailQuery, usePromotePartnerStatusMutation } from "@/hooks/usePartnersQuery";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PartnerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const detailQuery = usePartnerDetailQuery(id);
  const promoteMutation = usePromotePartnerStatusMutation();
  const partner = detailQuery.data?.data;

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Đang tải chi tiết đối tác..." />
      </div>
    );
  }

  if (detailQuery.isError || !partner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được chi tiết</p>
        <p className="max-w-md text-sm font-medium text-rose-700">Không thể tải thông tin đối tác từ hệ thống.</p>
        <button
          onClick={() => navigate("/partners")}
          className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentStatusValue = getPartnerStatusValue(mapPartnerStatus(partner.status));
  const nextStatusValue = getNextPartnerStatus(currentStatusValue);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 duration-500 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/partners")} title="Quay lại" aria-label="Quay lại" className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400 transition-all hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {partner.partnerCode}
              </span>
              <span className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest", partner.status === 2 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                {mapPartnerStatus(partner.status)}
              </span>
            </div>
            <h1 className="mt-3 font-title text-3xl font-black text-slate-900">{partner.partnerName}</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Chi tiết hồ sơ đối tác, liên hệ và hoạt động gần đây.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => promoteMutation.mutate({ id: partner.id, status: currentStatusValue })}
            disabled={nextStatusValue === null || promoteMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary shadow-sm transition-all hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiến cấp {nextStatusValue === null ? "(đã tối đa)" : `lên ${mapPartnerStatus(nextStatusValue)}`}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
            <Mail size={14} /> Gửi email
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-slate-800">
            <ExternalLink size={14} /> Mở hồ sơ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Quốc gia" value={partner.countryName || "N/A"} icon={<MapPin size={16} />} />
        <MetricCard label="Lĩnh vực" value={partner.sectorName || "N/A"} icon={<Building2 size={16} />} />
        <MetricCard label="Điểm đánh giá" value={`${Number(partner.score ?? 0).toFixed(1)} / 5`} icon={<Star size={16} />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Thông tin tổng quan</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {partner.createdAt ? formatDateTime(partner.createdAt) : "N/A"}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoRow label="Website" value={partner.website || "Chưa cập nhật"} />
              <InfoRow label="Mã đối tác" value={partner.partnerCode} />
              <InfoRow label="Quốc gia" value={partner.countryName || "N/A"} />
              <InfoRow label="Lĩnh vực" value={partner.sectorName || "N/A"} />
            </div>
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{partner.notes || "Chưa có ghi chú."}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Liên hệ</h2>
            <div className="mt-4 space-y-3">
              {(partner.contacts ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có đầu mối liên hệ.</p>
              ) : (
                partner.contacts!.map((contact) => (
                  <div key={contact.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">{contact.fullName}</p>
                        <p className="text-xs text-slate-500">{contact.title || "Chưa có chức danh"}</p>
                      </div>
                      {contact.isPrimary && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">Chính</span>}
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                      <p>Email: {contact.email || "N/A"}</p>
                      <p>Điện thoại: {contact.phone || "N/A"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/50">
              <Clock3 size={14} /> Hoạt động gần đây
            </div>
            <div className="mt-4 space-y-3">
              {(partner.recentInteractions ?? []).length === 0 ? (
                <p className="text-sm text-white/70">Chưa có lịch sử tương tác.</p>
              ) : (
                partner.recentInteractions!.map((interaction) => (
                  <div key={interaction.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Loại {interaction.interactionType}</p>
                    <p className="mt-2 text-sm font-bold text-white/90">{interaction.summary || "Không có mô tả."}</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-white/30">{interaction.interactionAt || "N/A"}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Tóm tắt</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Trạng thái hiện tại: <span className="font-black text-slate-900">{mapPartnerStatus(partner.status)}</span></p>
              <p>Số liên hệ: <span className="font-black text-slate-900">{partner.contacts?.length ?? 0}</span></p>
              <p>Tương tác gần đây: <span className="font-black text-slate-900">{partner.recentInteractions?.length ?? 0}</span></p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}