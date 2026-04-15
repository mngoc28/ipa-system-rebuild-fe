# UI API Rollout Status

## Assumptions
- FE calls BE through `/api/v1/*` with envelope `{ success, data, meta }`.
- Priority batches: auth/permission -> admin core -> domain modules.
- Current update covers Batch 1 -> Batch 7.

## Coverage Matrix

| Module | Main FE pages | API endpoints | Status |
|---|---|---|---|
| Auth | `auth/LoginPage`, `auth/ChangePasswordFirstTime` | `/auth/login`, `/auth/change-password-first-time`, `/auth/me` | In progress |
| Admin Users | `admin/UserManagementPage` | `/admin/users`, `/admin/users/{id}`, `/admin/users/{id}/lock` | In progress |
| Master Data | `admin/MasterDataPage` | `/master-data/{domain}` | In progress |
| Dashboard | role dashboard pages | `/dashboard/summary`, `/dashboard/tasks` | In progress |
| Delegations | role delegation list/form/detail pages | `/delegations*` | In progress |
| Schedule Events | role schedule pages | `/events*` | In progress |
| Minutes | role minutes pages | `/minutes*` | In progress |
| Tasks | role task pages | `/tasks*` | In progress |
| Documents Files | role documents pages | `/folders*`, `/files*` | In progress |
| Partners CRM | role partner pages | `/partners*` | In progress |
| Approvals | `manager/ApprovalsPage` | `/approvals*` | In progress |
| Notifications | `staff/notifications/NotificationsPage` and reused route | `/notifications*` | In progress |
| Reports | `manager/UnitReportsPage`, `director/CityReportsPage` | `/reports/*` | In progress |
| Pipeline | `director/PipelinePage` | `/pipeline/projects*` | In progress |
| Admin System & Audit | `admin/SystemSettingsPage`, `admin/AuditLogPage` | `/admin/system-settings`, `/admin/audit-logs*`, `/admin/integrations/*/test` | Not started |

## Batch 1 Delivered
- Added React Query provider and shared query client.
- Replaced mock login flow with real `/auth/login` integration.
- Replaced admin users local mock state with API-driven list/create/patch/lock.
- Added typed API envelope contracts and service clients for auth/admin users.

## Batch 2 Delivered
- Integrated dashboard summary and task widgets with `/dashboard/summary` and `/dashboard/tasks`.
- Applied dashboard integration across staff/manager/director/admin dashboard pages.
- Replaced notifications mock state with API-driven list/read/read-all/delete-read flow.
- Added typed API clients for dashboard and notifications modules.

## Batch 3 Delivered
- Integrated delegation list page with `/delegations` (role pages synced).
- Integrated delegation detail page with `/delegations/{id}` fallback-safe mapping.
- Integrated delegation create flow with `/delegations` POST from delegation form.
- Added typed delegation API client and status mapping utility.

## Batch 4 Delivered
- Integrated task list pages with `/tasks` list and `/tasks/{id}/status` patch flow.
- Wired task quick-create and duplicate action to `/tasks` POST with delegation context.
- Integrated minutes list pages with `/minutes` list and `/minutes` POST (create/template/duplicate).
- Integrated minutes detail pages with `/minutes/{id}` detail, `/minutes/{id}/comments`, `/minutes/{id}/versions`, `/minutes/{id}/approve`.
- Synced all task/minutes integrations across staff/manager/director/admin role pages.

## Batch 5 Delivered
- Integrated documents pages with `/folders` + `/files` APIs (list/create folder, list/upload file, rename/share/download-url actions).
- Integrated partners pages with `/partners` APIs (list/create/promote status, add quick contact, score sync action).
- Synced all documents/partners integrations across staff/manager/director/admin role pages.

## Batch 6 Delivered
- Integrated schedule pages with `/events` APIs (list/create/join/request-reschedule) across staff/manager/director/admin.
- Replaced manager approvals mock queue with API-driven `/approvals` list and `/approvals/{id}/decision` actions.
- Added typed API clients for events and approvals domains.

## Batch 7 Delivered
- Restored and integrated `admin/MasterDataPage` with `/master-data/{domain}` list/create/patch/delete flow.
- Integrated reports pages with `/reports/definitions`, `/reports/runs`, `/reports/runs/{id}` run-based workflow.
- Integrated director pipeline page with `/pipeline/projects` list/create and `/pipeline/projects/{id}/stage` stage transition action.
- Added typed API clients for master-data, reports, and pipeline domains.

## Known Gaps / Blockers
- FE currently does not persist refresh token, so automatic refresh flow is incomplete.
- BE does not expose `DELETE /admin/users/{id}` endpoint for real delete action in Admin Users UI.
- Many role pages are duplicated per role; rollout speed improves if shared hooks/components are extracted later.

## Next Batch Proposal
- Batch 8: Admin System Settings + Audit Logs + Integrations.
