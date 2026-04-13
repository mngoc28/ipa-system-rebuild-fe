export default function Procedure() {
  const steps = [
    { title: "Nghiên cứu vị trí", desc: "Giới thiệu địa điểm, quy hoạch kiến trúc." },
    { title: "Đề xuất dự án", desc: "Thẩm định năng lực và quy mô đầu tư." },
    { title: "Cấp chứng nhận", desc: "Phê duyệt chủ trương và cấp giấy chứng nhận." },
    { title: "Triển khai", desc: "Hỗ trợ thủ tục xây dựng và khởi công." },
  ];

  return (
    <section className="bg-slate-900 py-24 text-white">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="mb-16 font-title text-3xl font-black uppercase tracking-tight">Thủ tục Xúc tiến Đầu tư</h2>
        
        <div className="relative mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-4">
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-[75%] -translate-x-1/2 bg-white/10 md:block" />
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-xl font-black text-white shadow-xl shadow-blue-900/50">
                0{idx + 1}
              </div>
              <h4 className="mb-2 font-bold text-slate-100">{step.title}</h4>
              <p className="text-sm text-slate-400 font-sans leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}