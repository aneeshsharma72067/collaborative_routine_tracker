import { SetMetadata } from '@nestjs/common';

export const TEAM_ALLOW_GUESTS_KEY = 'team_allow_guests';

/**
 * Allow workspace-level members who are not part of the team to access
 * read-only endpoints guarded by TeamGuard.
 */
export const AllowTeamGuests = () => SetMetadata(TEAM_ALLOW_GUESTS_KEY, true);
