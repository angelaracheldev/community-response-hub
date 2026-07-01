// Filepath = frontend/components/profile/ChangeEmailWizard.tsx

import React, { useState } from 'react';
import { View } from 'react-native';

import VerifyCurrentPasswordStep from './VerifyCurrentPasswordStep';
import EnterNewEmailStep from './EnterNewEmailStep';
import VerifyEmailOtpStep from './VerifyEmailOtpStep';

console.log("VerifyCurrentPasswordStep =", VerifyCurrentPasswordStep);
console.log("EnterNewEmailStep =", EnterNewEmailStep);
console.log("VerifyEmailOtpStep =", VerifyEmailOtpStep);
interface Props {
  onFinished: () => void;
}

type Step =
  | 'verifyPassword'
  | 'enterEmail'
  | 'verifyOtp';

export default function ChangeEmailWizard({
  onFinished,
}: Props) {
  
  const [step, setStep] =
    useState<Step>('verifyPassword');

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newEmail, setNewEmail] =
    useState('');

  switch (step) {
    case 'verifyPassword':
      return (
        <VerifyCurrentPasswordStep
          onVerified={(password) => {
            setCurrentPassword(password);
            setStep('enterEmail');
          }}
        />
      );

    case 'enterEmail':
      return (
        <EnterNewEmailStep
          currentPassword={currentPassword}
          onOtpSent={(email) => {
            setNewEmail(email);
            setStep('verifyOtp');
          }}
        />
      );

    case 'verifyOtp':
      return (
        <VerifyEmailOtpStep
          email={newEmail}
          onVerified={onFinished}
        />
      );

    default:
      return <View />;
  }
}