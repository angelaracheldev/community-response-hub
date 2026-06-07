export type NotificationIconStyle = {
  symbol: string;
  backgroundColor: string;
  symbolColor: string;
};

export function getNotificationIcon(type: string): NotificationIconStyle {
  switch (type) {
    case 'complaint_assigned':
    case 'new_complaint_submitted':
    case 'complaint_submitted':
      return { symbol: '📋', backgroundColor: '#DBEAFE', symbolColor: '#2563EB' };
    case 'complaint_in_progress':
      return { symbol: '↻', backgroundColor: '#FFEDD5', symbolColor: '#EA580C' };
    case 'complaint_resolved':
    case 'verification_approved':
      return { symbol: '✓', backgroundColor: '#D1FAE5', symbolColor: '#059669' };
    case 'new_resident_registration':
    case 'reverification_submitted':
    case 'verification_rejected':
      return { symbol: '👤', backgroundColor: '#EDE9FE', symbolColor: '#7C3AED' };
    case 'complaint_rejected':
    case 'complaint_cancelled':
      return { symbol: '✕', backgroundColor: '#FEE2E2', symbolColor: '#DC2626' };
    default:
      return { symbol: '📋', backgroundColor: '#F3F4F6', symbolColor: '#6B7280' };
  }
}
