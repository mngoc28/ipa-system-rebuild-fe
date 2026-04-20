# Phân tích Chuyên sâu Giao diện Nghiệp vụ: Role STAFF (Chuyên viên)

Dưới đây là bản phân tích chi tiết "đến tận cùng" các thành phần giao diện mà một Chuyên viên (Staff) tương tác hàng ngày trong hệ thống IPA.

---

## 1. Module Dashboard (Bảng điều khiển Nghiệp vụ)
**Mục tiêu:** Cung cấp "Tin vắn nghiệp vụ" để chuyên viên bắt đầu ngày làm việc.

### Các Component chính:
*   **Welcome Section:**
    *   **H1 Header:** "Tin vắn nghiệp vụ, [Tên Chuyên viên] 👋". Tạo cảm giác cá nhân hóa.
    *   **Quick Action Button (Zap Icon):** "BÁO CÁO NHANH". Điều hướng trực tiếp đến trang Task để xử lý khẩn cấp.
*   **StatCard Grid (4 Thẻ chỉ số):**
    *   **Thành phần:** `Label`, `Value`, `Note`, `Icon`, `Color`.
    *   **Logic:** Hiển thị 4 nhóm: Đoàn phụ trách (Blue), Việc cần làm (Rose), Lịch cá nhân (Amber), Tài liệu mới (Emerald).
    *   **UX:** Có hiệu ứng `hover:shadow-xl` và `scale-110` cho icon khi di chuột, giúp giao diện "sống động".
*   **Task Feed (Đầu việc trọng tâm):**
    *   **Component `TaskCard` (Mini):** Hiển thị các task có `priority === "urgent"` với viền màu Rose.
    *   **Button "XEM TẤT CẢ":** Nút Text-link uppercase, điều hướng đến Module Task.

---

## 2. Module Task Management (Quản lý Nhiệm vụ)
**File:** `SharedTaskList.tsx` - Đây là nơi chuyên viên dành 40% thời gian làm việc.

### Phân tích Button & End Component:
*   **View Toggle Button Group:**
    *   **Lựa chọn:** Board (Kanban) hoặc List.
    *   **Behavior:** Chuyên viên thường dùng Board để thấy luồng (Flow) và List để tra cứu nhanh.
*   **Button "Thêm việc mới" (Plus Icon):**
    *   **Style:** `bg-primary shadow-lg shadow-primary/20`. Rất nổi bật (Call to Action).
    *   **Trigger:** Mở `Quick Create Modal`.
*   **Quick Create Modal (Form cuối):**
    *   **Input Tiêu đề:** Tự động `autoFocus`.
    *   **Select Priority:** 4 mức (Thấp, Trung bình, Cao, Khẩn cấp).
    *   **Input Date:** Chọn hạn chót.
    *   **Button "Xác nhận lưu" (Save Icon):** Nút rộng 100%, sử dụng `uppercase tracking-[0.3em]` tạo cảm giác đanh thép, chắc chắn.
*   **Kanban Board Component:**
    *   **BoardColumn:** Mỗi cột có Button "Click để thêm việc mới" (Dashed border). Đây là UX cực tốt, cho phép tạo nhanh task đúng trạng thái.
    *   **TaskCard (Detail):**
        *   **Button Toggle Status:** Checkbox tùy biến. Click vào là đổi trạng thái (Todo -> In-progress -> Done).
        *   **Dropdown "MoreVertical":** Chứa nút "Xóa nhiệm vụ" (Rose color - cảnh báo nguy hiểm).
        *   **Indicators:** Icon `MessageSquare` và `Paperclip` (hiện số lượng thảo luận/đính kèm).

---

## 3. Module Quản lý Đoàn (Delegations)
**File:** `SharedDelegationList.tsx`

### Phân tích Button & End Component:
*   **Direction Tabs:** "Đoàn đến (Inbound)" và "Đoàn đi (Outbound)". Phân tách luồng nghiệp vụ lớn.
*   **Button "Xuất dữ liệu" (Download Icon):** Xuất báo cáo Excel/PDF cho các chuyến công tác.
*   **Breadcrumb Nav:** Cho phép quay lại Dashboard nhanh chóng.
*   **Search Bar:** `pl-11` (chừa chỗ cho kính lúp), focus có `ring-primary/5`.
*   **KanbanBoard (Delegation version):** Hiển thị thẻ đoàn công tác với các chỉ số: Quốc gia, Host Unit, Số người tham gia.

---

## 4. Module Pipeline (Xúc tiến Đầu tư)
**File:** `StaffPipelinePage.tsx`

### Phân tích Button & End Component:
*   **Button "TẠO DỰ ÁN":** Sử dụng màu `indigo-600` để phân biệt với các module hành chính khác.
*   **Action "Patch Stage" (Nút chuyển giai đoạn):**
    *   **Logic:** Chuyên viên click để chuyển dự án qua các bước: `lead` -> `contacted` -> `proposal` -> ...
    *   **UX:** Tự động hiện Toast thông báo thành công.
*   **SharedProjectList (Component cuối):**
    *   **Nút "Sửa":** Mở Dialog chỉnh sửa thông tin dự án.
    *   **Nút "Chi tiết":** Xem hồ sơ dự án chuyên sâu.
    *   **Lưu ý:** Role Staff không có nút "Xóa" dự án trong view này để đảm bảo an toàn dữ liệu đầu tư.

---

## Đánh giá từ Persona (Khách hàng Quản lý công):
1.  **Tính sẵn sàng:** Các nút tạo nhanh (`Plus icon`) được đặt ở vị trí "ngón tay cái" hoặc góc trên bên phải, rất dễ thao tác.
2.  **Tính kỷ luật:** Việc hiển thị màu đỏ (Rose) cho các task quá hạn (`Overdue`) đánh mạnh vào tâm lý cần xử lý gấp của cán bộ.
3.  **Tính khoa học:** Việc chia Dashboard thành các Module giúp Staff không bị ngợp. Mỗi button đều có icon đi kèm giúp nhận diện chức năng mà không cần đọc chữ (Visual communication).

> [!TIP]
> **Nhận xét chuyên gia:** Hệ thống đã làm rất tốt việc "Actionable" hóa dữ liệu. Mỗi màn hình đều kết thúc bằng một hoặc nhiều Button hành động rõ ràng, không có màn hình "ngõ cụt".
