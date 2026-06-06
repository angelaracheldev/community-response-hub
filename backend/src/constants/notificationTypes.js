const NOTIFICATION_TYPES = [
  'complaint_submitted',
  'complaint_assigned',
  'complaint_in_progress',
  'complaint_resolved',
  'complaint_rejected',
  'complaint_cancelled',
  'verification_approved',
  'verification_rejected',
  'new_complaint_submitted',
  'new_resident_registration',
  'reverification_submitted',
];

const ENTITY_TYPES = ['complaint', 'verification'];

module.exports = {
  NOTIFICATION_TYPES,
  ENTITY_TYPES,
};
