import React from 'react';
import { SubmitComplaintForm } from '../../components/complaint/SubmitComplaintForm';

export default function AdminSubmitComplaintScreen() {
  return (
    <SubmitComplaintForm
      portal="admin"
      activeNavId="complaints"
      requireVerification={false}
      backRoute="/(admin)/complaints"
      backLabel="← Back to Complaints"
      successPrimaryLabel="Manage Complaints"
      successPrimaryRoute="/(admin)/complaints"
      successSecondaryLabel="Back to Dashboard"
      successSecondaryRoute="/(admin)/dashboard"
    />
  );
}
