import { Building, Cpu, DollarSign, MapPin, Plane, TrendingUp, Users, type LucideIcon } from "lucide-react";

/**
 * Represents a highlight item displayed in the landing page's benefits section.
 */
export interface LandingHighlightItem {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main title of the highlight */
  title: string;
  /** Detailed description or subtext */
  desc: string;
}

/**
 * Represents a step in the investment process shown on the landing page.
 */
export interface LandingStepItem {
  /** Label/Title of the step */
  title: string;
  /** Explanation of what happens in this step */
  desc: string;
}

/**
 * Represents an investment sector category on the landing page.
 */
export interface LandingSectorItem {
  /** Visual icon representing the sector */
  icon: LucideIcon;
  /** Human-readable name of the sector */
  name: string;
  /** Statistical count of projects or other metrics */
  count: string;
  /** Tailwind CSS classes for custom styling */
  color: string;
}

/**
 * Collection of unique selling points/highlights for the landing page.
 */
export const landingHighlights: LandingHighlightItem[] = [
  {
    icon: MapPin,
    title: "Vị trí Chiến lược",
    desc: "Trọng điểm kinh tế miền Trung, sở hữu cảng biển nước sâu và sân bay quốc tế nối liền các tuyến đường huyết mạch Á - Âu.",
  },
  {
    icon: TrendingUp,
    title: "Chính sách Đột phá",
    desc: "Ưu đãi thuế minh bạch, cam kết hỗ trợ toàn diện từ chính quyền địa phương trong suốt vòng đời dự án.",
  },
  {
    icon: Users,
    title: "Nguồn Nhân lực Cao",
    desc: "Tập trung nhiều trường đại học trọng điểm, cung cấp nguồn kỹ sư công nghệ và lao động chất lượng cao cực kỳ dồi dào.",
  },
];

/**
 * Sequential steps of the investment procedure.
 */
export const landingSteps: LandingStepItem[] = [
  { title: "Nghiên cứu vị trí", desc: "Giới thiệu địa điểm, quy hoạch kiến trúc." },
  { title: "Đề xuất dự án", desc: "Thẩm định năng lực và quy mô đầu tư." },
  { title: "Cấp chứng nhận", desc: "Phê duyệt chủ trương và cấp giấy chứng nhận." },
  { title: "Triển khai", desc: "Hỗ trợ thủ tục xây dựng và khởi công." },
];

/**
 * Key investment sectors targeted by the organization.
 */
export const landingSectors: LandingSectorItem[] = [
  { icon: Cpu, name: "Công nghệ Thông tin", count: "142 Dự án", color: "bg-indigo-50 text-indigo-600" },
  { icon: Plane, name: "Du lịch Dịch vụ", count: "89 Dự án", color: "bg-sky-50 text-sky-600" },
  { icon: Building, name: "Bất động sản Công nghiệp", count: "34 Dự án", color: "bg-emerald-50 text-emerald-600" },
  { icon: DollarSign, name: "Tài chính Quốc tế", count: "12 Dự án", color: "bg-amber-50 text-amber-600" },
];
