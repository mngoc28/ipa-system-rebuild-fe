# Báo Cáo Lỗi Tương Tác UI Sâu v2.4.0 (2026-04-16)

Target: http://localhost:5173/
Phạm vi: Kiểm thử UI/UX sâu, click toàn bộ phần tử tương tác (button/icon/link/tab/dropdown), bao gồm cả tính năng chưa hoàn thiện
Phương pháp: Quét luồng thủ công bằng MCP Chrome

## VAI TRÒ: ADMIN

### A-01. Trang users của admin đôi lúc hiển thị 0 bản ghi bất thường
- Phần tử: Bảng dữ liệu users + các bộ đếm
- Vị trí: /admin/users
- Các bước tái hiện:
1. Đăng nhập với role Admin từ Mock QA.
2. Mở trang User Management.
3. Quan sát bộ đếm/bảng ở lần tải đầu tiên.
- Kết quả kỳ vọng: Danh sách user hiện có và số liệu phải tải ổn định.
- Kết quả thực tế: Trang đôi lúc hiển thị toàn bộ bộ đếm = 0 và bảng trống.
- Loại: UI Bug
- Mức độ: Medium

### A-02. Các control chỉ có icon trong action của Master Data không có nhãn
- Phần tử: Nút action theo dòng (icon edit/delete)
- Vị trí: /admin/master-data table row
- Các bước tái hiện:
1. Thêm hoặc tải ít nhất 1 dòng master-data.
2. Quan sát các icon hành động ở cột THAO TÁC.
- Kết quả kỳ vọng: Control phải có nhãn rõ/tooltip/aria-label.
- Kết quả thực tế: Nút chỉ có icon, không có nhãn hiển thị; khó hiểu với người dùng lần đầu.
- Loại: UX Issue
- Mức độ: Medium

### A-03. Thao tác lưu Master Data có trạng thái đang lưu dài và mơ hồ
- Phần tử: Nút Tạo bản ghi trong modal
- Vị trí: /admin/master-data -> Thêm bản ghi mới
- Các bước tái hiện:
1. Click THÊM MỚI BẢN GHI.
2. Điền các trường bắt buộc.
3. Click Tạo bản ghi.
- Kết quả kỳ vọng: Loading phải rõ ràng và có trạng thái thành công/thất bại cụ thể.
- Kết quả thực tế: Nút ở trạng thái Đang lưu... khá lâu; thao tác đóng có cảm giác bị chặn khi đang chờ.
- Loại: UX Issue
- Mức độ: Medium

### A-04. Độ phủ tab/nút ở trung tâm thông báo còn chưa đầy đủ ở cấp trang
- Phần tử: Cụm tab/action thông báo
- Vị trí: /notifications (từ Admin)
- Các bước tái hiện:
1. Vào /notifications.
2. Thử khám phá tab nhanh rồi chuyển ngay qua link sidebar.
- Kết quả kỳ vọng: Ý định của tab vẫn rõ và trạng thái chuyển đổi phải minh bạch.
- Kết quả thực tế: Dễ vô tình rời khỏi ngữ cảnh; phản hồi trạng thái tab còn yếu khi điều hướng nhanh.
- Loại: UX Issue
- Mức độ: Low

## VAI TRÒ: DIRECTOR

### D-01. Các option trong dropdown template báo cáo khó tương tác ổn định
- Phần tử: Các option của dropdown template báo cáo
- Vị trí: /reports/city
- Các bước tái hiện:
1. Mở trang City Reports với role Director.
2. Mở combobox template.
3. Thử chọn option không phải mặc định (ví dụ: Tổng quan KPI).
- Kết quả kỳ vọng: Chọn được option chỉ trong một thao tác rõ ràng.
- Kết quả thực tế: Thao tác chọn có thể lỗi/timeout trong automation; độ ổn định của lựa chọn còn yếu.
- Loại: UI Bug
- Mức độ: Medium

### D-02. Icon action theo từng dòng ở City Reports không có nhãn
- Phần tử: Nút action dạng icon theo từng file báo cáo
- Vị trí: /reports/city -> danh sách file báo cáo
- Các bước tái hiện:
1. Mở City Reports.
2. Kiểm tra từng nút action theo dòng.
3. Click một icon hành động.
- Kết quả kỳ vọng: Nút phải truyền tải rõ mục đích trước khi click.
- Kết quả thực tế: Nút chỉ có icon, không có nhãn hiển thị, gây phải đoán.
- Loại: UX Issue
- Mức độ: Medium

## VAI TRÒ: MANAGER

### M-01. Hàng chờ phê duyệt bị kẹt ở trạng thái loading
- Phần tử: Danh sách phê duyệt + các tab (Đang chờ/Đã duyệt/Từ chối)
- Vị trí: /approvals
- Các bước tái hiện:
1. Đăng nhập với role Manager.
2. Mở Chờ phê duyệt.
3. Click tất cả các tab trạng thái.
- Kết quả kỳ vọng: Danh sách phải tải xong hoặc hiển thị empty-state rõ ràng.
- Kết quả thực tế: UI cứ hiển thị Đang tải yêu cầu phê duyệt... trong khi badge vẫn báo có mục chờ.
- Loại: UI Bug
- Mức độ: High

### M-02. Trang Teams bị kẹt ở trạng thái loading
- Phần tử: Khu vực dữ liệu đội nhóm
- Vị trí: /teams
- Các bước tái hiện:
1. Mở Đội nhóm với role Manager.
2. Chờ sau khi render lần đầu.
- Kết quả kỳ vọng: Danh sách thành viên đội nhóm hoặc empty-state phải xuất hiện.
- Kết quả thực tế: Liên tục hiển thị Đang tải dữ liệu đội nhóm... mà không có phản hồi hoàn tất.
- Loại: UI Bug
- Mức độ: High

### M-03. Icon action trong Báo cáo đơn vị không có nhãn/không rõ nghĩa
- Phần tử: Nút icon trong khu vực LỊCH SỬ BÁO CÁO
- Vị trí: /reports/unit
- Các bước tái hiện:
1. Mở Báo cáo đơn vị.
2. Tìm nút chỉ có icon ở khu vực lịch sử báo cáo.
3. Click vào nó.
- Kết quả kỳ vọng: Tên hành động rõ ràng và kết quả có thể dự đoán.
- Kết quả thực tế: Không có nhãn rõ và mục đích hành động không minh bạch.
- Loại: UX Issue
- Mức độ: Medium

### M-04. Danh sách task dùng nhiều micro-button chỉ có icon mà không có ngữ nghĩa rõ
- Phần tử: Các nút icon nhỏ cạnh mỗi thẻ task
- Vị trí: /tasks (Manager)
- Các bước tái hiện:
1. Mở trang Tasks.
2. Kiểm tra các thẻ task và click các nút icon nhỏ.
- Kết quả kỳ vọng: Mọi nút hành động đều phải cho thấy rõ mục đích.
- Kết quả thực tế: Nhiều control chỉ có icon, rất khó hiểu.
- Loại: UX Issue
- Mức độ: Medium

## VAI TRÒ: STAFF

### S-01. Các tab của form tạo đoàn cho thấy luồng chưa hoàn thiện, chặn thao tác chỉnh sửa bình thường
- Phần tử: Các tab THÔNG TIN CHUNG / THÀNH VIÊN / LỊCH TRÌNH
- Vị trí: /delegations/create
- Các bước tái hiện:
1. Đăng nhập với role Staff.
2. Mở TẠO ĐOÀN.
3. Click theo chuỗi tab THÔNG TIN CHUNG -> THÀNH VIÊN -> LỊCH TRÌNH.
- Kết quả kỳ vọng: Mỗi tab phải có đầy đủ phần nội dung có thể chỉnh sửa.
- Kết quả thực tế: Trang thu gọn thành thông báo Tính năng quản lý lịch trình đang được tích hợp..., làm giảm luồng mong đợi.
- Loại: Missing Feature
- Mức độ: High

### S-02. Các field form có thể trở nên không tương tác sau khi chuyển tab nhiều lần
- Phần tử: Các input của form đoàn
- Vị trí: /delegations/create
- Các bước tái hiện:
1. Mở form tạo đoàn.
2. Chuyển tab nhiều lần.
3. Thử nhập Tên đoàn và Mục tiêu.
- Kết quả kỳ vọng: Input vẫn phải chỉnh sửa được.
- Kết quả thực tế: Tương tác với input có thể lỗi/timeout trong lượt test.
- Loại: UI Bug
- Mức độ: Medium

## CROSS-ROLE / AUTH ENTRY

### C-01. Nút Quên mật khẩu không có kết quả hiển thị
- Phần tử: QUÊN MẬT KHẨU?
- Vị trí: /auth/login
- Các bước tái hiện:
1. Mở trang đăng nhập.
2. Click QUÊN MẬT KHẨU?.
- Kết quả kỳ vọng: Điều hướng tới luồng khôi phục hoặc hiện modal reset.
- Kết quả thực tế: Không có chuyển trang hay phản hồi hiển thị trong lượt test.
- Loại: Missing Feature
- Mức độ: Medium

### C-02. Nút đăng nhập bằng VNeID không có kết quả hiển thị
- Phần tử: ĐĂNG NHẬP BẰNG VNEID
- Vị trí: /auth/login
- Các bước tái hiện:
1. Mở trang đăng nhập.
2. Click nút đăng nhập VNeID.
- Kết quả kỳ vọng: Chuyển sang luồng SSO hoặc hiển thị thông báo không khả dụng rõ ràng.
- Kết quả thực tế: Không có hành động/phản hồi hiển thị trong lượt test.
- Loại: Missing Feature
- Mức độ: Medium

### C-03. Lỗi accessibility lặp lại trên nhiều form
- Phần tử: Nhiều input field
- Vị trí: Các trang liên quan Login/Admin/System/Task/Delegation
- Các bước tái hiện:
1. Điều hướng và tương tác qua nhiều form.
2. Quan sát panel issues / console của trình duyệt.
- Kết quả kỳ vọng: Input phải có id/name và liên kết label đúng.
- Kết quả thực tế: Lặp lại các cảnh báo như:
1. A form field element should have an id or name attribute
2. An element doesn't have an autocomplete attribute
- Loại: UI Bug
- Mức độ: Medium

## Ưu Tiên Sprint Nhanh (Đề Xuất)

1. M-01 Hàng chờ phê duyệt bị kẹt loading
2. M-02 Teams bị kẹt loading
3. S-01 Luồng tab của form tạo đoàn chưa hoàn thiện
4. A-01 Trang users của admin thỉnh thoảng về trạng thái trống bất thường
5. C-01/C-02 Thiếu luồng cho hành động đăng nhập (Quên mật khẩu, VNeID)
6. Sửa accessibility (C-03) + các icon control không có nhãn (A-02, D-02, M-03, M-04)
