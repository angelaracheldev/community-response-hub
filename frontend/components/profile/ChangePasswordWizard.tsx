// Filepath = frontend/components/profile/ChangePasswordWizard.tsx

import React, { useState } from 'react';
import { View } from 'react-native';

import VerifyCurrentPasswordStep from './VerifyCurrentPasswordStep';
import NewPasswordStep from './NewPasswordStep';
console.log("VerifyCurrentPasswordStep =", VerifyCurrentPasswordStep);
console.log("NewPasswordStep =", NewPasswordStep);
interface Props {
  onFinished: () => void;
}

export default function ChangePasswordWizard({
  onFinished,
}: Props) {
  const [currentPassword, setCurrentPassword] =
    useState<string | null>(null);

  if (!currentPassword) {
    return (
      <VerifyCurrentPasswordStep
        onVerified={(password) => {
          setCurrentPassword(password);
        }}
      />
    );
  }

  return (
    <View>
      <NewPasswordStep
        currentPassword={currentPassword}
        onFinished={onFinished}
      />
    </View>
  );
}