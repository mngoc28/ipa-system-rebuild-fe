# Phân tích Chuyên sâu Giao diện Nghiệp vụ: Role ADMIN (Quản trị viên)

Giao diện của Admin được thiết kế theo phong cách **"Technical Excellence"**. Nó ưu tiên sự chính xác, khả năng bao quát hệ thống và các công cụ can thiệp sâu vào dữ liệu nền.

---

## 1. Module User Management (Quản lý Nhân sự)
**Mục tiêu:** Cấp phát quyền hạn và giám sát trạng thái tài khoản cán bộ.

### Phân tích Button & End Component:
*   **User Table (Thành phần trung tâm):**
    *   **Avatar & Status Indicator:** Hiển thị ảnh đại diện đi kèm một "dot" xanh/xám. Đây là UX kinh điển giúp Admin nhận diện nhanh trạng thái "Sẵn sàng" của người dùng.
    *   **Action Group (Edit/Lock/Trash):** Được ẩn đi (opacity-0) và chỉ hiện lên khi hover vào dòng. Cách làm này giúp bảng dữ liệu bớt rối mắt nhưng vẫn đầy đủ tính năng khi cần.
*   **QuickStat Grid:**
    *   Sử dụng các màu sắc phân cấp: Blue (Tổng), Emerald (Hoạt động), Amber (Khóa). Giúp Admin nắm bắt nhanh "sức khỏe" của người dùng.

---

## 2. Module Audit Log (Nhật ký Hệ thống)
**Mục tiêu:** Đảm bảo tính minh bạch và khả năng truy vết (Traceability) mọi hành động của người dùng.

### Phân tích Button & End Component:
*   **Log Timeline Node:**
    *   Mỗi bản ghi được gắn một Icon `Activity` nằm trên một trục dọc. Màu sắc của Node (`success`, `warning`, `info`, `system`) giúp Admin lọc thông tin bằng mắt cực nhanh.
*   **AI Security Sidebar:**
    *   Thiết kế Card tối màu (`slate-950`) với hiệu ứng Glow mờ. Component này tạo cảm giác hệ thống đang được bảo vệ bởi các thuật toán AI tiên tiến 24/7.
*   **Infrastructure Health Bars:**
    *   Thanh tiến độ hiển thị "Compute Load" và "Database Engine". Đây là end-component dành riêng cho dân kỹ thuật/admin để kiểm tra xem hệ thống có đang bị quá tải khi chạy báo cáo không.

---

## 3. Module Master Data (Quản trị Danh mục)
**Mục tiêu:** Định nghĩa các tham số nền (Quốc gia, Loại hình đoàn, Mức độ ưu tiên).

### Phân tích Button & End Component:
*   **Vertical Category Sidebar:** 
    *   Mỗi tab danh mục đều có Counter hiển thị số lượng bản ghi thực tế. Khi Admin click vào, Sidebar chuyển màu Primary nổi bật, tạo sự tập trung cao độ.
*   **Data Key Badge:**
    *   Cột "Định danh (Key)" sử dụng font Monospace (`font-mono`) trong một khối xám nhạt, thể hiện đây là dữ liệu mang tính lập trình/cấu hình cao.
*   **Button "GỬI YÊU CẦU IT":**
    *   Một nút chức năng thú vị, cho thấy Admin có thể tương tác với bộ phận kỹ thuật ngay trên giao diện nếu cần bổ sung trường dữ liệu phức tạp.

---

## Đánh giá từ Persona (Khách hàng Quản lý công):
1.  **Tính Bảo mật (Security-First):** Sự hiện diện của Audit Log và tính năng Lock tài khoản mang lại sự an tâm tuyệt đối về mặt vận hành.
2.  **Tính Hệ thống (Systematic):** Mọi danh mục từ Quốc gia đến Loại sự kiện đều có thể cấu hình được, giúp hệ thống IPA không bị cứng nhắc mà luôn linh hoạt theo thực tế.
3.  **Tính Thẩm mỹ Kỹ thuật:** Giao diện Administrative thường khô khan, nhưng IPA đã làm rất tốt khi sử dụng Iconography hiện đại và Dashboard Health-check sinh động.

> [!CAUTION]
> **Lưu ý Admin:** Module Master Data là "trái tim" của hệ thống. Thay đổi Code ở đây có thể ảnh hưởng đến Logic tính toán FDI và Báo cáo chiến lược của Director.
