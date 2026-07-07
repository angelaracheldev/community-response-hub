import type { IconName } from '../components/common/AppIcon';

export type NotificationIconStyle = {
  name: IconName;
  backgroundColor: string;
  color: string;
};

export function getNotificationIcon(type: string): NotificationIconStyle {
  switch (type) {
    case 'complaint_assigned':
    case 'complaint_reassigned':
    case 'new_complaint_submitted':
    case 'complaint_submitted':
      return { name: 'clipboard-outline', backgroundColor: '#DBEAFE', color: '#2563EB' };
    case 'complaint_unassigned':
      return { name: 'return-down-back-outline', backgroundColor: '#FEF3C7', color: '#D97706' };
    case 'complaint_in_progress':
      return { name: 'sync-outline', backgroundColor: '#FFEDD5', color: '#EA580C' };
    case 'complaint_resolved':
    case 'verification_approved':
      return { name: 'checkmark', backgroundColor: '#D1FAE5', color: '#059669' };
    case 'new_resident_registration':
    case 'reverification_submitted':
    case 'verification_rejected':
      return { name: 'person-outline', backgroundColor: '#EDE9FE', color: '#7C3AED' };
    case 'complaint_rejected':
    case 'complaint_cancelled':
      return { name: 'close', backgroundColor: '#FEE2E2', color: '#DC2626' };
    default:
      return { name: 'clipboard-outline', backgroundColor: '#F3F4F6', color: '#6B7280' };
  }
}
