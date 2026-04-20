# MANAGER UAT FIX REPORT - V1

Date: 2026-04-16
Scope: Evaluate whether the system supports manager overview, staff monitoring, decision-making, and fast actions effectively.

## MANAGER REPORT

### TASK: Check dashboard overview, monitor staff work, open details, and act on approval items

* What you expected:
  * A clear manager dashboard with trustworthy KPIs, readable priorities, and direct access to the most important work items.
  * A way to inspect staff activity or approval items quickly enough to make decisions without extra navigation.
  * Action controls that either open useful detail or perform the intended management action immediately.

* What happened:
  * The dashboard showed multiple summary cards, but several labels and values were not aligned with the actual meaning of the data. Some cards reused the same counters for different business concepts, so the overview was not reliable for decision-making.
  * The main task feed was visible, but it read more like a static list than an actionable management view. There was no obvious drill-down from the overview items into detail or control flow.
  * On the approvals screen, each row had a menu icon, but the available behavior was only a temporary toast message instead of a real detail or management menu.

* Problem:
  * The system does not consistently turn overview data into decision-grade information.
  * The manager has to interpret ambiguous cards and then navigate deeper just to confirm what the numbers mean.
  * Some row-level controls look interactive but do not yet provide useful management actions.

* Impact on management:
  * It slows down decision-making because the dashboard cannot be trusted as a quick summary.
  * It increases navigation cost for routine monitoring, which is inefficient for a busy manager.
  * It reduces confidence when approving or reviewing work because the interface does not always surface the right detail at the right time.

## ISSUES LIST

* Title: Dashboard KPI cards show misleading or reused metrics
  * Type: Visibility
  * Impact: High

* Title: Overview task feed is not directly actionable
  * Type: Control
  * Impact: Medium

* Title: Row options in approvals do not open a real management flow
  * Type: Control
  * Impact: High

* Title: Manager overview lacks a clear decision hierarchy
  * Type: UX
  * Impact: Medium

* Title: Important work items require too much interpretation
  * Type: Visibility
  * Impact: High

## FINAL SUMMARY

* Tasks users can now perform:
  * Review the manager dashboard and identify that the system is trying to surface workload, approvals, and timeline activity.
  * Scan approval rows and see the current status, requester, and deadline.

* UX Improvements:
  * The report highlights where the interface should be simplified: clearer KPI mapping, stronger drill-down, and real row-level actions.
  * A better manager flow should prioritize the few items that need a decision now, not just display counts and placeholders.

* Remaining Risks:
  * If the KPI mapping is not corrected, managers may keep making decisions from misleading totals.
  * If row menus remain placeholder-only, the approvals flow will still waste time even when the data itself is present.