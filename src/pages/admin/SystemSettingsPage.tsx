import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { systemSettingsApi, type SystemSettingItem } from "@/api/systemSettingsApi";

type SystemSettingsForm = {
  smtpHost: string;
  smtpPort: string;
  smtpSecurity: "TLS" | "SSL" | "None";
  zaloAppId: string;
  zaloSecret: string;
};

const createDefaultForm = (): SystemSettingsForm => ({
  smtpHost: "smtp.ipa.danang.gov.vn",
  smtpPort: "587",
  smtpSecurity: "TLS",
  zaloAppId: "",
  zaloSecret: "",
});

const resolveForm = (items: SystemSettingItem[]): SystemSettingsForm => {
  const find = (key: string) => items.find((item) => item.key === key);

  return {
    smtpHost: find("smtp_host")?.value || "smtp.ipa.danang.gov.vn",
    smtpPort: find("smtp_port")?.value || "587",
    smtpSecurity: (find("smtp_security")?.value as SystemSettingsForm["smtpSecurity"]) || "TLS",
    zaloAppId: find("zalo_app_id")?.value || "",
    zaloSecret: "",
  };
};

const resolveSavedAt = (items: SystemSettingItem[]): string | null => {
  const timestamps = items.map((item) => item.updated_at).filter((value): value is string => Boolean(value));

  if (timestamps.length === 0) {
    return null;
  }

  const latest = timestamps.sort().at(-1);

  if (!latest) {
    return null;
  }

  return new Date(latest).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<SystemSettingsForm>(createDefaultForm());
  const [initialForm, setInitialForm] = React.useState<SystemSettingsForm>(createDefaultForm());
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [zaloStatus, setZaloStatus] = React.useState<"idle" | "ok" | "error">("idle");

  const settingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => systemSettingsApi.list("mail,zalo"),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { items: Array<{ key: string; value: string }> }) => systemSettingsApi.update(payload),
  });

  const testMutation = useMutation({
    mutationFn: () => systemSettingsApi.testIntegration("zalo"),
  });

  React.useEffect(() => {
    const items = settingsQuery.data?.data?.items;

    if (!items) {
      return;
    }

    const nextForm = resolveForm(items);
    setForm(nextForm);
    setInitialForm(nextForm);
    setSavedAt(resolveSavedAt(items));
  }, [settingsQuery.data]);

  const handleFieldChange = <K extends keyof SystemSettingsForm>(key: K, value: SystemSettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setZaloStatus("idle");
  };

  const handleSave = async () => {
    try {
      const result = await saveMutation.mutateAsync({
        items: [
          { key: "smtp_host", value: form.smtpHost },
          { key: "smtp_port", value: form.smtpPort },
          { key: "smtp_security", value: form.smtpSecurity },
          { key: "zalo_app_id", value: form.zaloAppId },
          { key: "zalo_secret", value: form.zaloSecret },
        ],
      });

      await queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      setInitialForm(form);
      setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      toast.success(`Đã lưu ${result.data.updatedCount} cấu hình.`);
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể lưu cấu hình hệ thống.");
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setZaloStatus("idle");
    toast.info("Đã khôi phục cấu hình đã tải.");
  };

  const handleTestConnection = async () => {
    try {
      const result = await testMutation.mutateAsync();
      setZaloStatus("ok");
      toast.success(result.message || "Kết nối Zalo ZNS thành công!");
    } catch (error) {
      setZaloStatus("error");
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể kiểm tra kết nối API.");
    }
  };

  const isBusy = settingsQuery.isLoading || saveMutation.isPending || testMutation.isPending;

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Hệ thống & Tích hợp</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Cấu hình SMTP, cổng kết nối API và branding hệ thống.</p>
          {settingsQuery.isLoading && <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Đang tải cấu hình...</p>}
          {savedAt && <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">Đã lưu lúc {savedAt}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={isBusy}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={14} /> RESET VỀ TỰ ĐỘNG
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isBusy}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} LƯU THAY ĐỔI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="border-b border-slate-50 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Mail Server (SMTP)</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">SMTP Host</label>
              <input
                type="text"
                value={form.smtpHost}
                onChange={(e) => handleFieldChange("smtpHost", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-2/3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">SMTP Port</label>
                <input
                  type="text"
                  value={form.smtpPort}
                  onChange={(e) => handleFieldChange("smtpPort", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <div className="w-1/3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Bảo mật</label>
                <select
                  value={form.smtpSecurity}
                  onChange={(e) => handleFieldChange("smtpSecurity", e.target.value as SystemSettingsForm["smtpSecurity"])}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="border-b border-slate-50 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Kết nối Zalo ZNS</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Zalo App ID</label>
              <input
                type="text"
                value={form.zaloAppId}
                onChange={(e) => handleFieldChange("zaloAppId", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Secret Key</label>
              <input
                type="password"
                value={form.zaloSecret}
                placeholder="Để trống nếu không thay đổi"
                onChange={(e) => handleFieldChange("zaloSecret", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <button
              onClick={() => void handleTestConnection()}
              disabled={isBusy}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testMutation.isPending ? "Đang kiểm tra..." : "KIỂM TRA KẾT NỐI API"}
            </button>
            {zaloStatus === "ok" && <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Trạng thái API: Kết nối tốt</p>}
            {zaloStatus === "error" && <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Trạng thái API: Cần kiểm tra lại cấu hình</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
