# Báo Cáo QA Luồng UI/UX - 2026-04-16

URL kiểm thử: http://localhost:5173/
Phạm vi: UI, UX, luồng người dùng, form/input cơ bản, hành vi edge-case
Vai trò đã kiểm thử: admin, director, manager, staff
Tự động hóa trình duyệt: MCP Chrome

## NHẬT KÝ THAO TÁC (Rút gọn)

1. Mở ứng dụng tại localhost và xác minh các trang vào của admin: dashboard, users, master-data, system, audit-log.
2. Kiểm thử form user của admin (thêm user), tìm kiếm với input dài/ký tự đặc biệt, hành vi back/forward/reload.
3. Kiểm thử form tạo master-data với dữ liệu dài/ký tự đặc biệt và hành vi submit.
4. Thu thập log console và network khi điều hướng các trang admin.
5. Chuyển trạng thái role trong localStorage và kiểm thử dashboard/điều hướng của director.
6. Chuyển sang role manager, xác thực menu riêng của manager và truy cập trang tasks.
7. Chuyển sang role staff, kiểm thử luồng tạo đoàn với input rỗng và input dài/ký tự đặc biệt.
8. Kiểm thử hành vi edge-case: double click submit, back/forward, refresh khi đang nhập form, sử dụng nhiều tab.
9. Giả lập viewport mobile và chụp ảnh bằng chứng.

## TÓM TẮT

Chất lượng UI/UX tổng thể ở mức **trung bình**: giao diện đồng nhất và nhiều trang lõi có thể điều hướng, nhưng vẫn còn một số khoảng trống usability ảnh hưởng lớn.

Các vấn đề usability chính:
- Điều hướng trên mobile có thể khiến người dùng bị kẹt phía sau lớp phủ sidebar quá lớn.
- Một số form quan trọng lỗi nhưng xử lý backend chưa rõ ràng (HTTP 400 xuất hiện ở console, giải thích trên UI còn yếu).
- Một số luồng có cảm giác chưa hoàn thiện hoặc đi vào ngõ cụt (loading kéo dài, không có đường hồi phục rõ ràng).
- Lỗi accessibility/label lặp lại nhiều lần, ảnh hưởng độ rõ ràng và khả năng đọc bằng screen-reader.

## DANH SÁCH BUG

### 1) Overlay sidebar mobile che nội dung chính và không thể đóng ổn định
- Các bước tái hiện:
1. Chuyển role sang staff (hoặc role không phải admin có sidebar app).
2. Mở `http://localhost:5173/delegations/create`.
3. Giả lập viewport mobile `390x844` (touch/mobile).
4. Quan sát sidebar overlay che phần lớn form.
5. Nhấn nút toggle menu ở header.
- Kết quả kỳ vọng: Sidebar phải thu gọn/đóng hoàn toàn để nội dung form có thể thao tác.
- Kết quả thực tế: Sidebar vẫn chiếm ưu thế trên nội dung; thao tác đóng không ổn định trong lượt chạy automation.
- Mức độ: High
- Bằng chứng: `tester/screens_staff_mobile_emulated.png`

### 2) Lỗi API Master Data (400) không được truyền đạt rõ trong UI
- Các bước tái hiện:
1. Đăng nhập bằng admin.
2. Vào `/admin/master-data`.
3. Click `THÊM MỚI BẢN GHI`.
4. Nhập dữ liệu và click `Tạo bản ghi`.
- Kết quả kỳ vọng: Hiển thị lỗi validation hoặc API rõ ràng, có thông tin để xử lý.
- Kết quả thực tế: Request tới `GET/POST /api/v1/master-data/countries` trả về 400; phản hồi trên UI yếu/khó hiểu nguyên nhân gốc.
- Mức độ: High
- Bằng chứng (network):
  - `GET http://localhost:8001/api/v1/master-data/countries [400]`
  - `POST http://localhost:8001/api/v1/master-data/countries [400]`

### 3) Mất dữ liệu form không cảnh báo khi điều hướng/reload
- Các bước tái hiện:
1. Với role staff, vào `/delegations/create`.
2. Nhập dữ liệu vào các trường bắt buộc (ví dụ: tên, ghi chú).
3. Bấm Back/Forward hoặc Reload của trình duyệt.
- Kết quả kỳ vọng: Có cảnh báo dữ liệu chưa lưu hoặc cơ chế khôi phục bản nháp.
- Kết quả thực tế: Dữ liệu đã nhập bị mất âm thầm.
- Mức độ: Medium

### 4) Phản hồi toast/lỗi bị lặp khi double-click submit nhanh
- Các bước tái hiện:
1. Mở form tạo đoàn của staff.
2. Để trống các trường bắt buộc.
3. Double-click nhanh `LƯU HỒ SƠ`.
- Kết quả kỳ vọng: Chỉ hiển thị một phản hồi validation và có debounce submit.
- Kết quả thực tế: Toast bị lặp (`Vui lòng điền các trường bắt buộc.` xuất hiện nhiều hơn một lần).
- Mức độ: Medium

### 5) Trang tasks của manager có dấu hiệu kẹt loading vô thời hạn
- Các bước tái hiện:
1. Chuyển sang role manager.
2. Mở `/tasks`.
- Kết quả kỳ vọng: Hiển thị danh sách task hoặc empty-state, loading phải kết thúc rõ ràng.
- Kết quả thực tế: Trang hiển thị `ĐANG ĐỒNG BỘ DỮ LIỆU NHIỆM VỤ...` mà không thấy hoàn tất/thử lại rõ ràng trong lượt kiểm thử.
- Mức độ: Medium

### 6) Thiếu label/định danh field ở nhiều form
- Các bước tái hiện:
1. Di chuyển qua các form admin/staff (users, system settings, delegation form).
2. Kiểm tra browser issues/console.
- Kết quả kỳ vọng: Input có liên kết label đúng và có thuộc tính id/name.
- Kết quả thực tế: Lặp lại các lỗi:
  - `No label associated with a form field`
  - `A form field element should have an id or name attribute`
- Mức độ: Medium

### 7) Nút action chỉ có icon làm giảm độ rõ ràng trên bảng user admin
- Các bước tái hiện:
1. Mở `/admin/users`.
2. Quan sát các control action theo từng dòng trong bảng.
- Kết quả kỳ vọng: Nút có nhãn hành động rõ (tooltip/aria-label/text hiển thị).
- Kết quả thực tế: Nhiều control chỉ có icon gây mơ hồ với người dùng mới.
- Mức độ: Low

### 8) Thiếu hướng dẫn empty-state rõ ràng sau khi lọc mạnh
- Các bước tái hiện:
1. Mở `/admin/users`.
2. Nhập chuỗi tìm kiếm dài/ký tự đặc biệt và áp dụng lọc.
- Kết quả kỳ vọng: Có thông báo empty-state hữu ích và gợi ý bước tiếp theo.
- Kết quả thực tế: Bảng trả về 0 dòng nhưng thiếu hướng dẫn rõ cho người dùng.
- Mức độ: Low

## VẤN ĐỀ UX

1. Người dùng mới có thể bối rối với hành vi redirect theo role (`/director/dashboard`, `/manager/dashboard`, `/staff/dashboard` đều về `/dashboard`) vì ý định URL và route cuối khác nhau.
2. Một số form quan trọng dùng thông báo lỗi chung chung; người dùng khó biết lỗi do validation, network hay rule phía server.
3. Cơ chế chống click nhanh chưa nhất quán; người dùng có thể kích hoạt phản hồi lặp thay vì được hướng dẫn chỉnh đúng.
4. Trên mobile, hành vi sidebar có thể chiếm trọn viewport và làm giảm độ tin cậy của luồng điều hướng.
5. Một số trang hiển thị trạng thái placeholder/no-data nhưng không gợi ý hành động tiếp theo (tạo mới, thử lại, xóa bộ lọc, liên hệ hỗ trợ).

## ĐỀ XUẤT

### Cải thiện UI

1. Cứng hóa hành vi drawer mobile:
- Đảm bảo thao tác một chạm luôn đóng được.
- Bổ sung xử lý click backdrop/ESC.
- Tránh để drawer che các form quan trọng sau điều hướng.

2. Tăng khả năng nhận biết hành động:
- Thêm tooltip + aria-label cho nút chỉ có icon.
- Duy trì nhãn hiển thị cho hành động rủi ro cao (xóa/sửa/reset).

3. Cải thiện component empty-state:
- Thêm mô tả ngắn và một CTA chính (ví dụ: `Tạo mới`, `Xóa bộ lọc`, `Thử lại`).

### Nâng cấp UX

1. Thêm guard dữ liệu chưa lưu cho các trang form.
2. Debounce/lock nút submit để tránh submit lặp và toast trùng.
3. Đưa lỗi backend 4xx vào thông báo inline theo ngữ cảnh, gần field bị ảnh hưởng.
4. Cung cấp fallback nhất quán khi loading timeout (`Đã quá thời gian tải`, `Thử lại`).
5. Tăng độ rõ ràng cho người dùng mới bằng cách hiển thị ngữ cảnh role ở header và giữ nguyên ý định route.

## Bằng Chứng Bổ Sung

Ảnh chụp trong quá trình kiểm thử:
- `tester/screens_director_desktop.png`
- `tester/screens_director_tablet.png`
- `tester/screens_director_mobile.png`
- `tester/screens_staff_mobile_emulated.png`
