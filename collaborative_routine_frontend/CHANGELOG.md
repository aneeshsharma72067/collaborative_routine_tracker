# Changelog

## 2025-12-28
- Added an explicit workspace access gate that blocks protected routes until a user selects or creates a workspace, preventing cross-workspace leakage.
- Refactored the workspace store/hook to support persisted selections, manual creation, and error-aware refresh cycles used by the gate UI.
- Updated the protected shell to surface the active workspace selector so operators can switch contexts without leaving the app.
- Introduced workspace member APIs, store, and dashboard panel with an admin-only invite form so operators can audit and manage workspace rosters directly in-product.
- Connected team detail pages to workspace rosters so leads can review members, see role badges, and add teammates via the backend team-member endpoint.
- Enabled team leads to pause or resume rituals, surface next/last session metadata, and view per-ritual session counts from the team detail page.
- Added a session overview strip that highlights schedule, response volume, and status for each ritual session.
- Wired the dashboard sentiment pulse to live per-team averages so submissions immediately refresh the team health score and show real-time context.
- Fixed auth persistence by waiting for store hydration before enforcing protected-route redirects, preventing unwanted login loops on refresh.
