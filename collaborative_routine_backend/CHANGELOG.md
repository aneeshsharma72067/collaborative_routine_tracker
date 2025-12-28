## [2025-12-28]
### Added
- Initialized refactor log for the Team Rituals & Health Management platform transition.
- Introduced a dedicated users repository abstraction to support modular data access.
- Added shared enums for workspace roles, team roles, ritual metadata, and session status.
- Implemented the new workspaces module with DTOs, repositories, guard, and controller.
- Delivered the teams module covering entities, repositories, guards, and team management flows.
- Added the rituals domain layer with entity, repository, service, and guarded controller endpoints.
- Built the ritual sessions module with scheduling cron jobs, repository, and REST endpoints.
- Implemented ritual response upsert flow with validation, repository, and guarded API routes.
- Delivered the sentiment tracking module with score submission, averages, and a weekly cleanup job.
- Added the workspace dashboard module to expose aggregated ritual, session, and sentiment metrics.
- Added utility scripts (`scripts/reset-database.ts`, `scripts/inspect-tables.ts`) to reset and inspect the Postgres schema during the refactor.

### Changed
- Updated the `users` entity to match the new authentication schema (password hashing column and audit timestamps).
- Simplified registration to capture only name, email, and password while returning the new profile payload.
- Refactored authentication services to rely on the shared users repository for persistence.
- Documented assumption that weekly sentiment resets clear future-dated snapshots to reopen submission windows.
- Rewired the Nest application module to load the redesigned domain modules and the global scheduler.
- Updated API documentation metadata to reflect the new domain and controller tags.

### Removed
- Deleted legacy modules tied to groups, routines, and activity tracking ahead of the new domain model implementation.
