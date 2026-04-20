# Phân tích Chuyên sâu Giao diện Nghiệp vụ: Role MANAGER (Trưởng phòng)

Giao diện của Manager được thiết kế như một "Phòng chỉ huy" (Command Center), tập trung vào việc giám sát con người, phê duyệt quy trình và phân tích hiệu suất bộ phận.

---

## 1. Module Approvals (Hàng chờ Phê duyệt)
**Mục tiêu:** Đảm bảo mọi hồ sơ, kế hoạch từ chuyên viên đều được kiểm soát và ra quyết định kịp thời.

### Phân tích Button & End Component:
*   **Status Tab Switcher:**
    *   **Thành phần:** 3 nút (Đang chờ, Đã duyệt, Từ chối) trong một bao `bg-slate-100`.
    *   **Behavior:** Hiển thị số lượng (Counter) ngay trên nhãn giúp Manager biết áp lực công việc hiện tại mà không cần click vào.
*   **Approval Card (Thành phần cốt lõi):**
    *   **Priority Indicator (Badge "KHẨN"):** Tự động xuất hiện nếu `priority === "High"`. Màu Rose nổi bật trên nền trắng.
    *   **Button "Phê duyệt" (CheckCircle2 Icon):** Nút Primary màu xanh, kích thước trung bình, có hiệu ứng `active:scale-95`.
    *   **Button "Từ chối" (XCircle Icon):** Nút viền Rose nhạt, tinh tế nhưng rõ ràng.
*   **Reject Note Area:**
    *   **Component:** `textarea` chỉ xuất hiện ở tab Pending.
    *   **UX:** Ép buộc Manager phải nhập lý do nếu muốn từ chối (gián tiếp qua placeholder), đảm bảo tính minh bạch trong quản lý công.

---

## 2. Module Teams (Đội nhóm & Nhân sự)
**Mục tiêu:** Theo dõi trạng thái làm việc và hiệu suất của từng cán bộ.

### Phân tích Button & End Component:
*   **Button "THÊM THÀNH VIÊN" (UserPlus Icon):**
    *   Sử dụng màu `slate-900` (đen đậm) tạo cảm giác quyền lực và quản trị.
*   **Member Card (Thẻ chuyên viên):**
    *   **Performance Bar:** Thanh tiến độ đa sắc (Emerald > 90%, Blue > 75%, Amber còn lại). Giúp Manager nhận diện ngay ai là "High Performer".
    *   **Status Dot:** Chấm xanh (Văn phòng), Vàng (Công tác), Xám (Nghỉ). Rất quan trọng để điều phối nhân sự nhanh.
*   **Interaction Actions Group:**
    *   3 nút biểu tượng (`Mail`, `MessageSquare`, `Shield`). Cho phép liên lạc hoặc phân quyền nhanh cho cán bộ ngay tại danh sách.
*   **Pagination Component:** Thiết kế chỉnh chu với các trang số và nút "Trước/Sau". Hỗ trợ quản lý khi số lượng nhân sự phòng ban lớn.

---

## 3. Module Unit Reports (Báo cáo Đơn vị)
**Mục tiêu:** Tổng hợp dữ liệu thành kết quả có thể báo cáo lên cấp trên.

### Phân tích Button & End Component:
*   **Button "TẠO BÁO CÁO" (Download Icon):** Kích hoạt tiến trình chạy báo cáo ngầm (Background process).
*   **Monthly KPI Highlight Card:**
    *   Sử dụng màu `slate-950` đen sâu, Typography cực đại ("92.5%").
    *   Đây là component "An tâm" dành cho Manager, tóm tắt mọi công sức của phòng ban trong tháng.
*   **Button "Xem biểu đồ":** Toggle ẩn hiện Panel phân tích chi tiết, giúp màn hình gọn gàng khi không cần xem số liệu trực quan.
*   **Report History List:** Cho phép tải lại các báo cáo đã chạy (`Download` button sẽ thay đổi trạng thái dựa trên `status` của báo cáo).

---

## Đánh giá từ Persona (Khách hàng Quản lý công):
1.  **Tính kiểm soát:** Manager không bị sa lầy vào chi tiết mà tập trung vào các **"Check-point"** và **"KPI"**.
2.  **Tính phản ứng nhanh:** Các status dot và cảnh báo "KHẨN" giúp Manager phản ứng kịp thời với các sự vụ phát sinh.
3.  **Tính minh bạch:** Lưu vết lý do từ chối và lịch sử chạy báo cáo tạo nên một môi trường làm việc công bằng và chuyên nghiệp.

> [!IMPORTANT]
> **Nhận xét chuyên gia:** module Teams là phần ấn tượng nhất. Nó biến quản lý con người từ cảm tính thành số liệu (Performance %, Task count), giúp việc quản lý đơn vị trở nên khoa học và hiện đại hơn rất nhiều.
