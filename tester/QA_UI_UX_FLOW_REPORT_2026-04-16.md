# QA UI/UX Flow Report - 2026-04-16

Target URL: http://localhost:5173/
Scope: UI, UX, user flow, form/input basic, edge-case behavior
Roles tested: admin, director, manager, staff
Browser automation: MCP Chrome

## ACTION LOG (Condensed)

1. Opened app at localhost and verified admin landing pages: dashboard, users, master-data, system, audit-log.
2. Tested admin user form (add user), search with long/special input, back/forward/reload behavior.
3. Tested master-data create form with long/special values and submit behavior.
4. Collected console and network logs while navigating admin pages.
5. Switched role state in localStorage and tested director dashboard/navigation.
6. Switched to manager role, validated manager-only menu and visited tasks page.
7. Switched to staff role, tested create delegation flow with empty and long/special input.
8. Tested edge behaviors: double click submit, back/forward, refresh during form work, multi-tab usage.
9. Emulated mobile viewport and captured screenshot evidence.

## SUMMARY

Overall UI/UX quality is **moderate**: visual style is consistent and many core pages are navigable, but there are several high-impact usability gaps.

Major usability issues:
- Mobile navigation can trap users behind an oversized sidebar overlay.
- Critical forms fail with unclear backend error handling (HTTP 400 surfaced in console, weak in-UI explanation).
- Some flows feel unfinished or dead-end (loading states with no clear recovery path).
- Repeated accessibility/labeling problems affect clarity and screen-reader readiness.

## BUG LIST

### 1) Mobile sidebar overlay blocks core content and cannot be dismissed reliably
- Steps to reproduce:
1. Set role to staff (or any non-admin role with app sidebar).
2. Open `http://localhost:5173/delegations/create`.
3. Emulate mobile viewport `390x844` (touch/mobile).
4. Observe sidebar overlay covering large part of form.
5. Tap menu toggle in header.
- Expected result: Sidebar should fully collapse/close, leaving form content accessible.
- Actual result: Sidebar remains dominant over content; close interaction is not reliable in automation run.
- Severity: High
- Evidence: `tester/screens_staff_mobile_emulated.png`

### 2) Master Data API errors (400) are not communicated clearly in UI flow
- Steps to reproduce:
1. Login as admin.
2. Go to `/admin/master-data`.
3. Click `THÊM MỚI BẢN GHI`.
4. Enter data and click `Tạo bản ghi`.
- Expected result: Clear validation or API error message with actionable detail.
- Actual result: Requests hit `GET/POST /api/v1/master-data/countries` returning 400; UI feedback is weak/unclear for root cause.
- Severity: High
- Evidence (network):
  - `GET http://localhost:8001/api/v1/master-data/countries [400]`
  - `POST http://localhost:8001/api/v1/master-data/countries [400]`

### 3) Form progress loss without warning on navigation/reload
- Steps to reproduce:
1. As staff, go to `/delegations/create`.
2. Enter data in required fields (e.g., name, notes).
3. Press browser Back/Forward or Reload.
- Expected result: Unsaved changes warning or draft recovery.
- Actual result: Entered form data is lost silently.
- Severity: Medium

### 4) Duplicate toast/error feedback on rapid double-click submit
- Steps to reproduce:
1. Open staff create delegation form.
2. Leave required fields empty.
3. Double-click `LƯU HỒ SƠ` quickly.
- Expected result: Single validation feedback and debounced submit.
- Actual result: Duplicate toasts shown (`Vui lòng điền các trường bắt buộc.` appears more than once).
- Severity: Medium

### 5) Manager tasks page appears stuck in indefinite loading state
- Steps to reproduce:
1. Switch to manager role.
2. Open `/tasks`.
- Expected result: Task list or empty-state with resolved loading indicator.
- Actual result: Page shows `ĐANG ĐỒNG BỘ DỮ LIỆU NHIỆM VỤ...` with no obvious completion/retry in tested run.
- Severity: Medium

### 6) Missing labels/field identifiers in multiple forms
- Steps to reproduce:
1. Navigate across admin/staff forms (users, system settings, delegation form).
2. Check browser issues/console.
- Expected result: Inputs should have proper label association and id/name attributes.
- Actual result: Repeated issues:
  - `No label associated with a form field`
  - `A form field element should have an id or name attribute`
- Severity: Medium

### 7) Icon-only action buttons reduce action clarity in admin user table
- Steps to reproduce:
1. Open `/admin/users`.
2. Observe row action controls in the table.
- Expected result: Buttons should expose explicit action labels (tooltip/aria-label/visible text).
- Actual result: Several icon-only controls are ambiguous to first-time users.
- Severity: Low

### 8) No explicit empty-state guidance after aggressive filtering
- Steps to reproduce:
1. Open `/admin/users`.
2. Enter long/special search text and apply filter.
- Expected result: Helpful empty-state message with next-step guidance.
- Actual result: Table returns 0 rows without clear user guidance.
- Severity: Low

## UX ISSUES

1. New users may be confused by role redirection behavior (`/director/dashboard`, `/manager/dashboard`, `/staff/dashboard` resolving to `/dashboard`) because URL intent and final route differ.
2. Some critical forms rely on generic error text; users do not know whether issue is validation, network, or server rule.
3. Rapid-click protection is inconsistent; users can trigger repeated feedback rather than guided correction.
4. On mobile, sidebar behavior can dominate the viewport and reduce confidence in navigation flow.
5. Some pages show placeholder/no-data states but do not suggest next actions (create, retry, clear filter, contact support).

## SUGGESTIONS

### UI improvements

1. Implement robust mobile drawer behavior:
- Ensure one-tap close always works.
- Add backdrop click/ESC handling.
- Prevent drawer from blocking critical forms after navigation.

2. Improve action discoverability:
- Add tooltips + aria-labels for icon-only buttons.
- Keep visible labels for high-risk actions (delete/edit/reset).

3. Improve empty-state components:
- Add short explanation and one primary CTA (e.g., `Tạo mới`, `Xóa bộ lọc`, `Thử lại`).

### UX enhancements

1. Add unsaved-changes guard for form pages.
2. Debounce/lock submit button to prevent duplicate submissions and duplicate toasts.
3. Surface backend 4xx errors in contextual inline messages near affected fields.
4. Provide consistent loading-timeout fallback (`Đã quá thời gian tải`, `Thử lại`).
5. Improve first-time clarity by making role context explicit in header and preserving route intent.

## Additional Evidence

Screenshots captured during test:
- `tester/screens_director_desktop.png`
- `tester/screens_director_tablet.png`
- `tester/screens_director_mobile.png`
- `tester/screens_staff_mobile_emulated.png`
