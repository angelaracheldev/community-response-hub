import type { AppPortal } from './appPortal.config';
import type { OpenNotificationResult } from './notificationApi';

export function getNotificationRoute(
  portal: AppPortal,
  result: OpenNotificationResult
): string | null {
  if (result.entity_type !== 'complaint') {
    return null;
  }

  switch (portal) {
    case 'admin':
      return '/(admin)/complaints';
    case 'resident':
      return result.reference_id
        ? `/(resident)/complaint/${result.reference_id}`
        : null;
    case 'respondent':
      return result.reference_id
        ? `/(respondent)/complaint/${result.reference_id}`
        : null;
    default:
      return null;
  }
}
