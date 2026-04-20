# BÁO CÁO UAT LIÊN VAI TRÒ - V1

Ngày: 16/04/2026
Phạm vi: Kiểm tra cách Staff, Manager, Director và Admin tương tác trên hệ thống IPA bằng bằng chứng browser Chrome MCP.

## BÁO CÁO ADMIN

### NHIỆM VỤ: Staff tạo dữ liệu nghiệp vụ cho các vai trò phía sau

* Kỳ vọng:
  * Staff có thể tạo dữ liệu đầu vào để các vai trò phía sau nhìn thấy.
  * Luồng tạo phải rõ ràng, lưu đúng và giữ lại dữ liệu đã nhập.

* Thực tế:
  * Màn dashboard Staff và trang tạo đoàn đã tải thành công.
  * Form tạo đoàn có sẵn và hiển thị các trường bắt buộc.
  * Khi kiểm tra, các input ngày tháng kiểu native khó thao tác ổn định bằng tự động hóa browser, nên luồng tạo chưa được hoàn tất trong lượt chạy này.

* Vấn đề:
  * Chưa xác nhận được bug sản phẩm ở bước này.
  * Giới hạn chính là thao tác test với control ngày native trong Chrome MCP, không phải lỗi ứng dụng đã được chứng minh.

* Ảnh hưởng tới vận hành hệ thống:
  * Vai trò Staff truy cập được và form nhập liệu đã có, nhưng lượt này chưa xác nhận trọn vẹn việc tạo đoàn end-to-end.

### NHIỆM VỤ: Manager nhận và xử lý công việc phê duyệt

* Kỳ vọng:
  * Manager có thể xem các mục chờ duyệt, mở chi tiết và quyết định duyệt/từ chối.
  * Số lượng phê duyệt phải khớp với trạng thái hàng đợi hiện tại.

* Thực tế:
  * Trang approvals của Manager tải đúng.
  * Bộ đếm hàng đợi hiển thị và trang đã lấy dữ liệu phê duyệt từ backend.
  * Ở trạng thái được kiểm tra, không có item pending, nên không thể thực hiện hành động duyệt/từ chối trực tiếp từ hàng đợi chờ.

* Vấn đề:
  * Chưa xác nhận được bug chặn nào ở bước này.
  * Hàng đợi đang trống, nên trong lượt này không thể kiểm tra trọn vẹn vòng phê duyệt bằng một item pending thật.

* Ảnh hưởng tới vận hành hệ thống:
  * Khu vực phê duyệt của Manager có tồn tại và truy cập được, nhưng lượt này chưa chứng minh được full approval loop với một item pending thực.

### NHIỆM VỤ: Director xem tổng quan chiến lược và báo cáo

* Kỳ vọng:
  * Director xem được tổng quan cấp thành phố và báo cáo chiến lược mà không bị lỗi runtime.
  * Các màn Director phải cung cấp đường dẫn rõ ràng để kiểm soát và đọc insight.

* Thực tế:
  * Các trang chiến lược cho Director đã từng được kiểm tra trên browser và hiển thị thành công sau khi sửa lỗi.
  * Lượt cross-role hiện tại không phát sinh lỗi runtime mới ở nhánh Director.

* Vấn đề:
  * Chưa xác nhận được vấn đề chặn mới ở bước này.

* Ảnh hưởng tới vận hành hệ thống:
  * Các màn Director vẫn sẵn sàng như tầng quyết định cấp cao.

### NHIỆM VỤ: Admin quản lý người dùng, vai trò, cấu hình và điều khiển hệ thống

* Kỳ vọng:
  * Admin có thể quản lý người dùng đầu cuối, gồm tạo, sửa, gán vai trò, khóa/mở khóa và xóa.
  * Admin có thể thay đổi cấu hình hệ thống và dùng các nút bảo trì với tác dụng thật.
  * Quyền Admin phải chỉ dành cho người dùng Admin.

* Thực tế:
  * Route chỉ dành cho Admin hoạt động đúng: khi đổi role lưu trong state sang Staff, truy cập `/admin/users` sẽ bị chuyển hướng ra ngoài.
  * Tạo user, sửa user và gán role hoạt động, danh sách cập nhật ngay sau thao tác.
  * Master data tạo, sửa và xóa đều chạy được trên browser.
  * Các nút bảo trì trên dashboard Admin chỉ sinh toast thông báo, không kích hoạt tác vụ backend thật.
  * Hành động xóa user hiển thị thông báo rằng endpoint chưa tồn tại.

* Vấn đề:
  * Xóa user có hiển thị trên UI nhưng thực tế chưa được triển khai.
  * Các điều khiển bảo trì của Admin là hành động placeholder, không phải thao tác thật.

* Ảnh hưởng tới vận hành hệ thống:
  * Vai trò Admin chưa thể kiểm soát đầy đủ vòng đời người dùng.
  * Người vận hành có thể nghĩ tác vụ bảo trì đã thành công trong khi chỉ thấy một toast thông báo.
  * Đây là một khoảng hở về control đối với vận hành production.

## DANH SÁCH VẤN ĐỀ

* Tiêu đề: Hành động xóa user chưa có hỗ trợ backend
  * Loại: Control
  * Mức độ: High

* Tiêu đề: Các nút bảo trì trên dashboard Admin chỉ là placeholder toast
  * Loại: Control
  * Mức độ: Medium

* Tiêu đề: Luồng tạo đoàn của Staff chưa thể thao tác trọn vẹn bằng browser automation do control ngày native
  * Loại: Stability
  * Mức độ: Low

## TỔNG KẾT

* Đã xác nhận hoạt động tốt:
  * Bảo vệ route Admin
  * Tạo user
  * Sửa user
  * Gán role
  * Tạo/sửa/xóa master data
  * Tải trang system settings
  * Tải trang approvals của Manager
  * Các trang chiến lược của Director vẫn truy cập được

* Khoảng hở vận hành chính:
  * Admin không thể xóa user từ UI vì endpoint backend bị thiếu.
  * Các thao tác bảo trì của Admin trông có vẻ hoạt động nhưng không thực hiện tác vụ hệ thống thật.

* Rủi ro còn lại:
  * Nếu người vận hành dựa vào các nút xóa và bảo trì đang hiển thị, họ có thể nghĩ hệ thống đã controllable đầy đủ trong khi một phần control surface vẫn chỉ là mô phỏng.