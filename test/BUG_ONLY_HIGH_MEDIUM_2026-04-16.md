# Bug-Only Sprint List (High/Medium) - 2026-04-16

Target: http://localhost:5173/
Scope: Chỉ bug mức High và Medium để xử lý sprint nhanh

## Priority Overview

- High: 2
- Medium: 4
- Total: 6

## HIGH

### H1. Mobile sidebar overlay chặn nội dung chính
- Severity: High
- Impact: Người dùng mobile khó hoặc không thể thao tác form cốt lõi.
- Repro:
1. Vào role staff.
2. Mở /delegations/create.
3. Emulate mobile 390x844.
4. Mở/đóng sidebar từ header.
- Expected: Sidebar đóng hoàn toàn, không che form.
- Actual: Sidebar overlay chiếm phần lớn màn hình, đóng không ổn định trong luồng test.
- Quick fix gợi ý:
1. Chuẩn hóa state open/close drawer.
2. Bật đóng bằng backdrop click và phím ESC.
3. Khóa scroll body khi mở, mở lại khi đóng.
- Evidence: tester/screens_staff_mobile_emulated.png

### H2. Master Data trả 400 nhưng UI báo lỗi chưa rõ ràng
- Severity: High
- Impact: User không biết lỗi do field nào hay do rule nào, chặn thao tác tạo bản ghi.
- Repro:
1. Vào admin.
2. Mở /admin/master-data.
3. Chọn THÊM MỚI BẢN GHI.
4. Nhập dữ liệu và submit.
- Expected: Thông báo lỗi cụ thể, có hướng dẫn sửa.
- Actual: API GET/POST /api/v1/master-data/countries trả 400, thông tin lỗi hiển thị yếu.
- Quick fix gợi ý:
1. Parse error payload backend và map lỗi theo field.
2. Hiển thị inline error + toast tóm tắt.
3. Giữ dữ liệu người dùng đã nhập khi submit fail.
- Evidence:
1. GET http://localhost:8001/api/v1/master-data/countries [400]
2. POST http://localhost:8001/api/v1/master-data/countries [400]

## MEDIUM

### M1. Mất dữ liệu form khi Back/Forward/Reload
- Severity: Medium
- Impact: Mất công nhập liệu, tăng tỉ lệ bỏ dở.
- Repro:
1. Vào /delegations/create.
2. Nhập dữ liệu form.
3. Back/Forward hoặc Reload.
- Expected: Có cảnh báo unsaved changes hoặc khôi phục draft.
- Actual: Dữ liệu bị mất im lặng.
- Quick fix gợi ý:
1. beforeunload guard khi form dirty.
2. Lưu draft tạm thời localStorage theo route/form id.
3. Prompt xác nhận trước khi rời trang.

### M2. Double-click submit gây toast lỗi lặp
- Severity: Medium
- Impact: UX nhiễu, người dùng tưởng hệ thống lỗi nặng.
- Repro:
1. Ở /delegations/create để trống field bắt buộc.
2. Double-click LƯU HỒ SƠ.
- Expected: Chỉ một lần validate feedback.
- Actual: Hiện nhiều toast Vui lòng điền các trường bắt buộc.
- Quick fix gợi ý:
1. Disable nút submit trong khi validate/submit.
2. Debounce click submit.
3. Deduplicate toast theo key/message trong khoảng thời gian ngắn.

### M3. Trang task role manager kẹt trạng thái loading
- Severity: Medium
- Impact: Dead-end luồng xử lý việc của manager.
- Repro:
1. Chuyển role manager.
2. Mở /tasks.
- Expected: Có danh sách hoặc empty-state sau khi load xong.
- Actual: Treo tại ĐANG ĐỒNG BỘ DỮ LIỆU NHIỆM VỤ... trong run test.
- Quick fix gợi ý:
1. Thêm timeout cho loading state.
2. Hiển thị retry CTA khi quá thời gian.
3. Log rõ trạng thái request fail/empty/success.

### M4. Nhiều form thiếu label/id-name chuẩn
- Severity: Medium
- Impact: Giảm accessibility và độ rõ ràng thao tác.
- Repro:
1. Đi qua các form admin/staff.
2. Kiểm tra browser issues/console.
- Expected: Input có label association và id/name đầy đủ.
- Actual: Lặp lại cảnh báo:
1. No label associated with a form field
2. A form field element should have an id or name attribute
- Quick fix gợi ý:
1. Bổ sung htmlFor-id cho cặp label-input.
2. Bổ sung name/id chuẩn cho toàn bộ input/select/textarea.
3. Thêm rule lint accessibility để chặn tái phát.

## Suggested Sprint Order

1. H1 Mobile sidebar overlay
2. H2 Master-data error handling 400
3. M3 Manager tasks loading stuck
4. M1 Unsaved form protection
5. M2 Duplicate submit feedback
6. M4 Form label/id-name accessibility
