import { landingSectors } from "@/dataHelper/landing.dataHelper";

export default function Sectors() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/3">
          <h2 className="mb-4 font-title text-3xl font-black uppercase tracking-tight text-slate-900">Lĩnh vực<br/>Trọng điểm</h2>
          <div className="mb-6 h-1 w-16 bg-blue-600"></div>
          <p className="text-slate-600 leading-relaxed font-sans">
            Đà Nẵng tập trung thu hút dòng vốn FDI chất lượng cao, ưu tiên các ngành công nghiệp mũi nhọn có giá trị gia tăng lớn và thân thiện với môi trường.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:w-2/3 lg:grid-cols-2">
          {landingSectors.map((s, idx) => (
            <div key={idx} className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-md cursor-pointer">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${s.color}`}> 
                <s.icon size={26} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{s.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}