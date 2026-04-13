import { MapPin, TrendingUp, Users } from "lucide-react";

export default function About() {
  const highlights = [
    {
      icon: MapPin,
      title: "Vị trí Chiến lược",
      desc: "Trọng điểm kinh tế miền Trung, sở hữu cảng biển nước sâu và sân bay quốc tế nối liền các tuyến đường huyết mạch Á - Âu."
    },
    {
      icon: TrendingUp,
      title: "Chính sách Đột phá",
      desc: "Ưu đãi thuế minh bạch, cam kết hỗ trợ toàn diện từ chính quyền địa phương trong suốt vòng đời dự án."
    },
    {
      icon: Users,
      title: "Nguồn Nhân lực Cao",
      desc: "Tập trung nhiều trường đại học trọng điểm, cung cấp nguồn kỹ sư công nghệ và lao động chất lượng cao cực kỳ dồi dào."
    }
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-title text-3xl font-black uppercase tracking-tight text-slate-900">Vì sao chọn Đà Nẵng?</h2>
          <div className="mx-auto h-1 w-20 bg-blue-600"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-slate-100">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <item.icon size={24} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="font-sans leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}