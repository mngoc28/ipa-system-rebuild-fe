# BUG FIX REPORT v1

Date: 2026-04-16
Scope: High + Medium bugs from QA reports
- Source 1: `BUG_ONLY_HIGH_MEDIUM_2026-04-16.md`
- Source 2: `QA_UI_UX_FLOW_REPORT_2026-04-16.md`

## 1) H1 - Mobile sidebar overlay chặn nội dung chính
- Type: UI / State / UX
- Root cause: State mở menu mobile chỉ bật overlay, chưa điều khiển sidebar mobile thực tế; thiếu cơ chế close đồng bộ.
- Fix strategy:
  - Đồng bộ state mobile drawer giữa layout và sidebar.
  - Đóng drawer qua backdrop click, phím ESC, click menu item.
  - Khóa scroll body khi drawer mở.
- Files changed:
  - `src/components/layout/v2/AppShell.tsx`
  - `src/components/layout/v2/AdminLayout.tsx`
  - `src/components/layout/v2/Sidebar.tsx`
  - `src/components/layout/v2/AdminSidebar.tsx`
- Regression check:
  - Mobile mở/đóng ổn định, không còn trạng thái overlay tách rời sidebar.

## 2) H2 - Master Data trả 400 nhưng UI báo lỗi chưa rõ ràng
- Type: API / Validation / UX
- Root cause:
  - Backend thiếu route `master-data` trong API v1.
  - UI chỉ hiển thị toast chung, không map field-level errors.
- Fix strategy:
  - Bổ sung route CRUD `master-data` ở backend.
  - Parse error envelope (`message`, `details`, `errors`) và map inline theo field.
  - Giữ nguyên dữ liệu form khi submit fail.
- Files changed:
  - `../ipa-system-rebuild-be/routes/api.php`
  - `src/pages/admin/MasterDataPage.tsx`
- Regression check:
  - API master-data có route đầy đủ.
  - Form create/edit hiển thị lỗi cụ thể theo field và không mất dữ liệu đã nhập.

## 3) M1 - Mất dữ liệu form khi Back/Forward/Reload
- Type: State / UX
- Root cause: Form delegation chưa có draft persistence và chưa có guard trước unload.
- Fix strategy:
  - Lưu draft localStorage theo key route-role-form.
  - Khôi phục draft khi quay lại form.
  - Thêm `beforeunload` guard khi form dirty.
  - Xóa draft sau submit thành công.
- Files changed:
  - `src/components/delegations/SharedDelegationForm.tsx`
- Regression check:
  - Reload/back-forward có khả năng khôi phục draft, giảm mất dữ liệu im lặng.

## 4) M2 - Double-click submit gây toast lỗi lặp
- Type: UX / Validation / Async state
- Root cause: Submit chưa có chặn pending + toast validation không dedupe.
- Fix strategy:
  - Chặn submit lặp khi mutation đang pending.
  - Disable nút submit trong thời gian xử lý.
  - Dùng toast id để dedupe thông báo validation.
- Files changed:
  - `src/components/delegations/SharedDelegationForm.tsx`
  - `src/components/tasks/SharedTaskList.tsx`
- Regression check:
  - Double-click không còn spam nhiều toast trùng.

## 5) M3 - Trang task role manager kẹt loading
- Type: API / Async / UX
- Root cause: Loading state không có timeout fallback khi request kéo dài.
- Fix strategy:
  - Đặt timeout cho axios client.
  - Thêm loading-timeout state + retry CTA trong tasks page.
- Files changed:
  - `src/api/axiosClient.ts`
  - `src/components/tasks/SharedTaskList.tsx`
- Regression check:
  - Khi request chậm, UI chuyển sang trạng thái quá thời gian và cho phép retry.

## 6) M4 - Nhiều form thiếu label/id-name chuẩn
- Type: UI / Accessibility
- Root cause: Nhiều input/select/textarea chưa có cặp `label`-`id` hoặc thiếu `name`.
- Fix strategy:
  - Bổ sung `htmlFor`-`id`-`name` cho form delegation, tasks modal, master-data form.
  - Mở rộng `SelectField` để nhận `id` và `name`.
- Files changed:
  - `src/components/delegations/SharedDelegationForm.tsx`
  - `src/components/tasks/SharedTaskList.tsx`
  - `src/pages/admin/MasterDataPage.tsx`
  - `src/components/ui/SelectField.tsx`
- Regression check:
  - Giảm cảnh báo accessibility trong các form trọng điểm thuộc phạm vi bug.

## Final summary
- Bugs fixed: 6/6 (High + Medium)
- Approach: xử lý theo root cause, tránh workaround tạm.
- Side effects considered:
  - Không thay đổi API contract hiện có ngoài việc bổ sung route thiếu.
  - Không thay đổi behavior nghiệp vụ cốt lõi của các module khác.

## Remaining risks
- Có thể vẫn còn cảnh báo a11y ở các form khác ngoài phạm vi sprint này.
- Cần chạy e2e full-flow để xác nhận toàn bộ role matrix trên môi trường tích hợp.

## Suggested next improvements
1. Bật lint rule a11y bắt buộc trong CI để ngăn tái phát.
2. Tách reusable hook cho `draft + unsaved guard` dùng chung mọi form create/edit.
3. Thêm e2e test cho các luồng: mobile drawer, master-data validation, task loading timeout/retry.
