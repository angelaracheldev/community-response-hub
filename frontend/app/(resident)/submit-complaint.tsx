import React from 'react';
import { SubmitComplaintForm } from '../../components/complaint/SubmitComplaintForm';

export default function SubmitComplaintScreen() {
  return (
    <SubmitComplaintForm
      portal="resident"
      activeNavId="submit"
      requireVerification
      backRoute="/(resident)/home"
      backLabel="← Back to Dashboard"
      successPrimaryLabel="View My Complaints"
      successPrimaryRoute="/(resident)/tracking"
      successSecondaryLabel="Return to Home"
      successSecondaryRoute="/(resident)/home"
    />
  );
}
