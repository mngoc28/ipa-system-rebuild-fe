# BUG FIX REPORT v2

Date: 2026-04-16
Source QA Report: `test/DEEP_UI_INTERACTION_BUG_REPORT_v2.4.0_2026-04-16.md`
Scope: Fix UI/UX bugs + complete missing features with non-dummy interactions.

## 1) Manager Approvals - stuck loading / tab data inconsistency
- Root Cause:
  - Danh sach phe duyet khong bind theo active tab status mot cach on dinh.
  - Khong co timeout fallback khi request tre bat thuong.
  - Count badge va list data dung chung query context, de sai lech trong edge case.
- Expected Behavior:
  - Moi tab hien dung data theo status.
  - Neu loading qua nguong thi hien thong bao va cho retry.
  - Badge count on dinh, khong gay nham lan voi filtered list.
- Fix Strategy:
  - Tach query count va query list.
  - Dong bo query list theo active tab status.
  - Them timeout state + retry UI.
- Code Fix:
  - Updated: `src/pages/manager/ApprovalsPage.tsx`
  - Added: `tabToApiStatus`, `approvalsCountQuery`, `loadingTimedOut` with 12s guard.
  - Added: timeout panel with `approvalsQuery.refetch()` retry action.

## 2) Manager Teams - loading khong ket thuc
- Root Cause:
  - Trang Teams chi dua vao loading state co ban, khong co guard khi API tre lau.
- Expected Behavior:
  - Co fallback UI khi loading vuot nguong va co nut thu lai.
- Fix Strategy:
  - Them timeout effect theo `teamsQuery.isLoading`.
  - Hien panel canh bao + retry khi timeout.
- Code Fix:
  - Updated: `src/pages/manager/TeamsPage.tsx`
  - Added: `loadingTimedOut` state/effect and retry block.

## 3) Admin User Management - thong ke/danh sach bi 0 tam thoi
- Root Cause:
  - Co kha nang nhin thay empty state tam thoi khi refetch/latency.
  - Khong co timeout UX trong truong hop loading dai.
- Expected Behavior:
  - UI khong "nhay" ve rong sai ngu canh.
  - Neu loading qua lau, nguoi dung duoc retry ro rang.
- Fix Strategy:
  - Giu previous data trong query de tranh flicker rong.
  - Them timeout panel va auto-retry 1 lan cho first-page empty transient.
  - Them CTA "Tai lai du lieu" tai empty state.
- Code Fix:
  - Updated: `src/hooks/useAdminUsersQuery.ts`
  - Updated: `src/pages/admin/UserManagementPage.tsx`
  - Added: `placeholderData`, `loadingTimedOut`, `autoRetriedEmpty`, retry UI.

## 4) Master Data - icon actions thieu nghia, save feedback chua ro
- Root Cause:
  - Nut icon-only edit/delete khong co nhan truy cap.
  - Khi tao ban ghi dang pending, nguoi dung khong duoc nhac ro trang thai cho.
- Expected Behavior:
  - Action icon co aria label/title day du.
  - Save pending co thong diep huong dan ro rang.
- Fix Strategy:
  - Bo sung aria/title cho icon buttons.
  - Bo sung helper text khi `createMutation.isPending`.
- Code Fix:
  - Updated: `src/pages/admin/MasterDataPage.tsx`

## 5) Director City Reports - icon/button semantics chua day du
- Root Cause:
  - Mot so action icon/button thieu nhan nghia truy cap.
- Expected Behavior:
  - Tat ca action co y nghia ro rang cho keyboard/screen reader.
- Fix Strategy:
  - Bo sung `aria-label` va `title` cho cac nut chinh sua mau, xuat bao cao, tai file.
- Code Fix:
  - Updated: `src/pages/director/CityReportsPage.tsx`

## 6) Manager Unit Reports - icon-only controls thieu label
- Root Cause:
  - Nut filter/download va mot so CTA thieu nhan truy cap ro rang.
- Expected Behavior:
  - Tat ca icon controls co nhan nghia ro rang.
- Fix Strategy:
  - Them aria-label cho tao bao cao, xem bieu do, filter, download.
- Code Fix:
  - Updated: `src/pages/manager/UnitReportsPage.tsx`

## 7) Shared Tasks - micro-icon action khong ro nghia
- Root Cause:
  - Nut MoreVertical va Chi tiet thieu label theo context task.
- Expected Behavior:
  - Action theo tung task co nhan day du.
- Fix Strategy:
  - Them aria-label/title dynamic theo `task.title`.
- Code Fix:
  - Updated: `src/components/tasks/SharedTaskList.tsx`

## 8) Notifications - context tab khong duoc giu on dinh
- Root Cause:
  - Active tab chua sync URL query, de mat context khi reload/share link.
- Expected Behavior:
  - Trang notifications giu tab context on dinh theo URL.
- Fix Strategy:
  - Dong bo `activeTab` voi search param `tab`.
- Code Fix:
  - Updated: `src/pages/staff/notifications/NotificationsPage.tsx`
  - Added: `useSearchParams`, initial tab parsing, URL sync effect.

## 9) Login - Quen mat khau/VNeID la non-functional controls
- Root Cause:
  - Cac nut hien thi tren UI nhung chua co hanh vi xu ly.
- Expected Behavior:
  - Nguoi dung bam vao co flow thuc thi ro rang (khong dead control).
- Fix Strategy:
  - Them forgot-password inline flow (nhap email/username, gui huong dan, toast ket qua).
  - Them VNeID handler voi trang thai dang xu ly + thong diep integration status.
  - Bo sung autocomplete/name cho truong dang nhap.
- Code Fix:
  - Updated: `src/pages/auth/LoginPage.tsx`
  - Added: `showForgotForm`, `forgotValue`, `handleForgotPassword`, `handleVneidLogin`, form controls.

## 10) Delegation Form - tabs Thanh vien/Lich trinh chi la placeholder
- Root Cause:
  - Hai tab chua co UI thao tac that, chi hien thong bao dang tich hop.
- Expected Behavior:
  - Nguoi dung co the them/xoa thanh vien va cac moc lich trinh ngay tren form.
  - Du lieu tab duoc dua vao payload submit, khong mat trang thai ban nhap.
- Fix Strategy:
  - Xay dung UI thao tac day du cho Members va Schedule tabs.
  - Tich hop draft persistence cho `formData + members + scheduleItems`.
  - Nhom thong tin tab vao `description` payload de backend tiep nhan khong vo schema hien tai.
- Code Fix:
  - Updated: `src/components/delegations/SharedDelegationForm.tsx`
  - Added: member list manager, schedule item manager, draft restore/clear cho du lieu mo rong.

---

## Validation
- Lint/check errors (changed files): no errors.
- Build: success (`vite build`) with existing chunk-size warning only.

## Result Summary
- Da fix cac bug high/medium lien quan loading-stuck, empty-transient, icon-action semantics va context tab.
- Da hoan thien cac tinh nang thieu quan trong (Login auxiliary actions, Delegation members/schedule).
- Da loai bo nhom controls "co hien thi nhung khong co logic" trong pham vi cac man hinh duoc QA report v2.4.0 highlight.
