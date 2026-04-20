# DIRECTOR UAT REPORT - V1

Date: 2026-04-16
Scope: Evaluate whether the IPA system provides enough insight, visibility, and control for top-level director decisions.

## DIRECTOR REPORT

### SCENARIO: Check system overview, city-level insight, performance monitoring, and drill-down from dashboard to strategic reports

* What you expected:
  * A director dashboard that shows the current system state in seconds.
  * Clear strategic metrics with enough context to understand performance, bottlenecks, and priorities without digging too deep.
  * A logical path from overview to city-level detail and reports when extra analysis is needed.
  * Fast access to high-level actions and summaries that support decisions.

* What happened:
  * The director dashboard did provide a concise overview and clear navigation to city overview and city reports.
  * The city overview page exposed useful operational metrics such as partners, pipeline, delegations, events, pipeline value, stage breakdown, recent projects, upcoming events, and task feed.
  * The city report page showed report templates and run history, but several strategic counters were still zero or not obviously connected to outcome trends.
  * The system required moving across multiple pages to assemble a decision-grade picture, and the highest-level pages still mixed operational snapshots with strategic needs.

* Strategic problem:
  * The system gives visibility, but not consistently enough insight for top-level decision-making.
  * Director-level views are split across dashboard, city overview, and reports, so a true “what is happening now” picture still takes extra interpretation.
  * Important strategic questions like momentum, trend direction, and where the bottleneck is are not answered directly enough.

* Impact on business decision:
  * A director can see that the system is active, but cannot quickly judge whether performance is improving or declining.
  * Decision-making is slowed because the UI emphasizes counts and lists more than trends and exceptions.
  * The lack of clear variance or trend context makes it harder to prioritize interventions, especially when reviewing pipeline and city-level performance.

## ISSUES LIST

* Title: Strategic metrics lack trend context
  * Type: Data
  * Impact: Critical

* Title: Top-level decision view is split across multiple pages
  * Type: Structure
  * Impact: High

* Title: City report page shows zero-value summary fields without explanation
  * Type: Data
  * Impact: High

* Title: Dashboard uses mixed operational and strategic signals
  * Type: Strategic
  * Impact: High

* Title: No immediate bottleneck or exception summary for the director
  * Type: Decision
  * Impact: High

## FINAL SUMMARY

* Tasks users can now perform:
  * Understand that the system provides a director dashboard, a city overview, and a city report area.
  * Review partner, pipeline, delegation, event, and task snapshots at a high level.

* UX Improvements:
  * The current structure does support navigation from overview to deeper strategic pages.
  * The interface would be stronger if it surfaced trends, deltas, and exception summaries directly on the top-level director view.

* Remaining Risks:
  * If trend and variance data stay hidden, directors will still need to interpret raw counts manually.
  * If zero-value fields in the report are not explained, the system may appear incomplete or unreliable even when the data exists elsewhere.