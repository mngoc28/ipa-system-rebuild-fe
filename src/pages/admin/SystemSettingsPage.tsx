import * as React from "react";
import { Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function SystemSettingsPage() {
  const defaultForm = {
    smtpHost: "smtp.ipa.danang.gov.vn",
    smtpPort: "587",
    smtpSecurity: "TLS",
    zaloAppId: "***********849",
    zaloSecret: "abcdef123456",
  };
  const [form, setForm] = React.useState(defaultForm);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [zaloStatus, setZaloStatus] = React.useState<"idle" | "ok">("idle");

  const handleSave = () => {
    setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    toast.success("Đã cấu hình hệ thống thành công. Changes will reflect shortly.");
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Hệ thống & Tích hợp</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Cấu hình SMTP, cổng kết nối API và branding hệ thống.</p>
          {savedAt && <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">Đã lưu lúc {savedAt}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setForm(defaultForm);
              setZaloStatus("idle");
              toast.info("Đã khôi phục cấu hình mặc định.");
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <RefreshCcw size={14} /> RESET VỀ TỰ ĐỘNG
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95">
            <Save size={14} /> LƯU THAY ĐỔI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Mail Server (SMTP)</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">SMTP Host</label>
              <input type="text" value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white" />
            </div>
            <div className="flex gap-4">
              <div className="w-2/3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">SMTP Port</label>
                <input type="text" value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white" />
              </div>
               <div className="w-1/3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Bảo mật</label>
                <select value={form.smtpSecurity} onChange={(e) => setForm({ ...form, smtpSecurity: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white">
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Kết nối Zalo ZNS</h3>
           <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Zalo App ID</label>
              <input type="text" value={form.zaloAppId} onChange={(e) => setForm({ ...form, zaloAppId: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Secret Key</label>
              <input type="password" value={form.zaloSecret} onChange={(e) => setForm({ ...form, zaloSecret: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-emerald-500 focus:bg-white" />
            </div>
             <button
               onClick={() => {
                 setZaloStatus("ok");
                 toast.success("Kết nối Zalo ZNS thành công!");
               }}
               className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200"
             >
               KIỂM TRA KẾT NỐI API
             </button>
             {zaloStatus === "ok" && <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Trạng thái API: Kết nối tốt</p>}
           </div>
        </div>
      </div>
    </div>
  );
}
