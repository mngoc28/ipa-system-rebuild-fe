# ADMIN UAT FIX REPORT - V1

Date: 2026-04-16
Scope: Verify whether the IPA system remains stable, configurable, and manageable from the Admin operator role.

## ADMIN REPORT

### TASK: Manage users, roles, and account state from the Admin portal

* Expected:
  * View the user list with clear role/status labels.
  * Create a new user, edit the user, assign a role, lock/unlock the account, and delete the user when needed.
  * Receive clear feedback when an action succeeds or fails.

* Actual:
  * The user list loaded correctly and reflected changes immediately after create and edit.
  * Creating a user worked, editing the same user worked, and changing the role from `staff` to `manager` was persisted in the table.
  * Lock/unlock was exposed as an available action.
  * The delete action now calls the backend and successfully deletes the selected user from the list.

* Problem:
  * No blocking issue found in this check.

* Impact on system operation:
  * Admin can now manage the user lifecycle end to end from the UI.

### TASK: Verify role-based access control for Admin routes

* Expected:
  * Admin routes should be accessible only to Admin users.
  * Non-admin roles should be blocked from `/admin/*`.

* Actual:
  * After switching the stored role to `Staff`, navigating to `/admin/users` redirected back to the login page.
  * The `/admin` shell correctly enforced role-based access.

* Problem:
  * No blocking issue found in this check.

* Impact on system operation:
  * Access control is working at the route boundary, which is a positive control signal for the Admin portal.

### TASK: Configure system settings and test integration behavior

* Expected:
  * Admin should be able to review and update system settings and see clear save/test feedback.

* Actual:
  * The system settings page loaded successfully.
  * SMTP and Zalo configuration fields were visible.
  * Save/test controls were present and the page did not crash during loading.

* Problem:
  * No blocking issue found in this check.

* Impact on system operation:
  * Basic configuration management is available and stable, though the page is limited to the exposed settings set.

### TASK: Check system maintenance controls on the Admin dashboard

* Expected:
  * Maintenance actions such as cache reset and database backup should initiate a real operational effect or clear confirmation of their backend execution.

* Actual:
  * Clicking `XÓA CACHE RAM` now runs the real cache-clear endpoint and returns success feedback from the backend.
  * `BACKUP DATABASE` is visibly disabled and clearly marked as not yet implemented in the backend.

* Problem:
  * Cache clear is operational.
  * Backup is not yet available as a real operation and is intentionally blocked to avoid false feedback.

* Impact on system operation:
  * Operators can safely run cache maintenance.
  * Backup remains a product gap, but the UI no longer pretends it is available.

## ISSUES LIST

* Title: Backup database action is unavailable in backend
  * Type: Control
  * Severity: Medium

## FINAL SUMMARY

* Verified working:
  * Create user
  * Edit user
  * Assign role and persist it in the list
  * Delete user from the Admin UI
  * Load system settings
  * Enforce Admin-only access to `/admin/*`
  * Create, edit, and delete master-data records
  * Clear cache through the backend maintenance endpoint

* Main operational gaps:
  * Backup database is not yet implemented as a real maintenance action.

* Remaining risk:
  * If operators expect a database backup from the dashboard, they still need a real backend implementation before treating it as production-safe.