# Phân tích Chuyên sâu Giao diện Nghiệp vụ: Role DIRECTOR (Lãnh đạo)

Giao diện của Director được thiết kế theo triết lý **"Hệ điều hành Thành phố"**. Mọi thành phần đều hướng tới việc cung cấp cái nhìn toàn cảnh (Bird's-eye view) để hỗ trợ ra quyết định chiến lược.

---

## 1. Module City Overview (Tổng quan Thành phố)
**Mục tiêu:** Cung cấp "nhịp đập" thời gian thực của các hoạt động xúc tiến đầu tư toàn thành phố.

### Phân tích Button & End Component:
*   **Hero Section (Strategic Stat Cards):**
    *   Sử dụng Glassmorphism (nền mờ) trên nền Gradient tối (Đen - Xanh Teal).
    *   **KPI Trọng tâm:** "Dòng vốn & tiến độ" được đặt trong một card riêng biệt với MetricBlock lớn, giúp Lãnh đạo biết ngay tổng giá trị dòng vốn FDI đang chảy vào thành phố là bao nhiêu.
*   **Pipeline Stage Breakdown (Linear Progress):**
    *   Thanh tiến trình đa sắc (`amber-300` -> `primary` -> `cyan-300`).
    *   Đây là end-component quan trọng giúp đánh giá "sức khỏe" của quy trình xúc tiến: liệu dự án có đang bị kẹt ở giai đoạn nào không?
*   **Action Group:**
    *   Button "Tải dữ liệu" và "Xem báo cáo" được thiết kế tối giản nhưng sang trọng (Sử dụng icon `RefreshCw` và `ArrowUpRight`).

---

## 2. Module City Reports (Báo cáo Chiến lược)
**Mục tiêu:** Phân tích dữ liệu lịch sử và đưa ra dự báo tương lai.

### Phân tích Button & End Component:
*   **Top KPI Grid:**
    *   4 Card lớn đại diện cho 4 chỉ số sinh mệnh: Dự án mới, Vốn FDI, Vốn nội, Chỉ số PCI.
    *   Sử dụng màu sắc phân biệt (Blue, Emerald, Purple, Amber) giúp tránh nhầm lẫn khi đọc số liệu vĩ mô.
*   **Báo cáo Chiến lược Panel (Tập tin):**
    *   Không chỉ là danh sách file, mỗi item hiển thị cả Dung lượng (File size) và Trạng thái (Run status).
    *   Button "CHỈNH SỬA MẪU" cho thấy quyền hạn cao nhất của Director trong việc định hình cách thức báo cáo dữ liệu.
*   **Forecast Panel (Dự báo vận hành):**
    *   **Visual:** Card màu `slate-950` cực kỳ premium.
    *   **Logic:** Cung cấp thông tin mang tính dự báo (Headline & Detail). Đây là tính năng "Smart" hỗ trợ lãnh đạo không chỉ nhìn quá khứ mà còn đoán định tương lai.

---

## Đánh giá từ Persona (Khách hàng Quản lý công):
1.  **Tính Tổng hợp (Aggregated):** Lãnh đạo không cần xem từng Task của chuyên viên, họ xem "Tổng dự án", "Tổng vốn". Giao diện đã lọc bỏ hoàn toàn các tiểu tiết gây nhiễu.
2.  **Tính Biểu tượng (Iconic):** Việc sử dụng Card "Điểm nhấn thành phố" với các Icon ý nghĩa (`Globe`, `Zap`, `ShieldCheck`) giúp thông tin được tiếp nhận nhanh qua thị giác.
3.  **Tính Sẵn sàng (High-Availability):** Button "Tải lại dữ liệu" xuất hiện ở vị trí dễ nhìn nhất, đảm bảo lãnh đạo luôn được tiếp cận với số liệu mới nhất trước mỗi cuộc họp quan trọng.

> [!TIP]
> **Nhận xét chuyên gia:** Component "MetricBlock" trong City Overview là một điểm sáng về UI/UX. Nó biến những con số khô khan thành những khối dữ liệu có chiều sâu, tạo cảm giác tin cậy và chuyên nghiệp cho một hệ thống cấp thành phố.
