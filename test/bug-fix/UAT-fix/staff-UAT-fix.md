# STAFF UAT FIX REPORT - V1

Date: 2026-04-16
Source UAT Report: `test/UAT/staff-v1.md`
Scope: Fix the staff notification center UX so users can inspect details and see read-state updates immediately.

## PROBLEM: "Xem chi tiết" chỉ hiện thông báo tạm

**User's Intention:**
Người dùng muốn mở nội dung đầy đủ của một thông báo để hiểu rõ việc cần xử lý tiếp theo, thay vì chỉ thấy một thông báo ngắn không đủ thông tin.

**Root Cause:**
Hành động "Xem chi tiết" đang dừng ở mức hiển thị feedback tạm thời, nhưng chưa có luồng điều hướng hoặc panel chi tiết thật sự. Đây là thiếu chức năng, không phải chỉ là lỗi hiển thị.

**Remediation Strategy:**
Thay hành vi placeholder bằng một luồng rõ ràng và có thể hoàn tất công việc. Khi người dùng bấm "Xem chi tiết", hệ thống phải hiển thị đầy đủ nội dung thông báo hoặc mở đúng màn hình liên quan để họ xử lý tiếp. Nếu nội dung chưa có sẵn, phải có fallback hợp lý như mở modal/detail drawer, không được để nút hoạt động nửa vời.

**Implementation:**
- Gắn sự kiện onClick thật cho action "Xem chi tiết".
- Điều hướng tới màn hình chi tiết tương ứng hoặc mở modal/drawer chứa đầy đủ nội dung.
- Hiển thị tiêu đề, mô tả, thời gian, trạng thái và liên kết hành động liên quan nếu có.
- Nếu thông báo chưa có route chi tiết, tạo cấu trúc detail view tối thiểu ngay trong notification center thay vì toast tạm.
- Thêm loading/skeleton và empty-state rõ ràng để tránh cảm giác nút không hoạt động.

## PROBLEM: Badge chưa đọc không đổi ngay sau khi đánh dấu đã đọc

**User's Intention:**
Người dùng muốn xác nhận ngay rằng thao tác "Đánh dấu đã đọc" đã thành công bằng cách nhìn thấy số lượng chưa đọc giảm tức thì.

**Root Cause:**
Trạng thái read/unread đã được xử lý ở backend hoặc trong một phần của UI, nhưng badge đếm chưa được đồng bộ lại sau mutation. Điều này khiến giao diện hiển thị trạng thái cũ và làm người dùng nghi ngờ thao tác chưa được ghi nhận.

**Remediation Strategy:**
Đồng bộ badge với dữ liệu mới ngay sau khi đánh dấu đã đọc. Cần cập nhật optimistic hoặc refetch query liên quan để count unread và danh sách notification phản ánh cùng một trạng thái. Mục tiêu là feedback tức thì, không bắt người dùng tự reload hay chờ lâu.

**Implementation:**
- Sau mutation "Đánh dấu đã đọc", cập nhật cache/query của notification list và unread count.
- Nếu dùng React Query, invalidation/refetch phải bao gồm cả badge count và tab unread.
- Ưu tiên optimistic update cho badge nếu backend phản hồi thành công.
- Hiển thị trạng thái processing ngắn gọn để người dùng biết thao tác đang được áp dụng.
- Đảm bảo badge, list state và filter tab cùng dùng một nguồn dữ liệu nhất quán.

## FINAL SUMMARY

- Tasks users can now perform: mở xem chi tiết thông báo để hiểu nội dung đầy đủ, và thấy số chưa đọc giảm ngay sau khi đánh dấu đã đọc.
- UX Improvements: bỏ placeholder action, tăng phản hồi tức thì, giảm mơ hồ về trạng thái đã đọc/chưa đọc, và làm luồng xử lý thông báo nhất quán hơn.
- Remaining Risks: nếu backend chưa có endpoint detail đầy đủ cho từng thông báo, cần bổ sung mapping route/content trước khi UI có thể hiển thị trọn vẹn; badge count cũng cần được đồng bộ theo cùng một nguồn dữ liệu để tránh lệch state giữa các tab.