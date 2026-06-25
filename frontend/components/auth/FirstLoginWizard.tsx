// Filepath = frontend/components/auth/FirstLoginWizard.tsx

import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

import VerifyOtpStep from './VerifyOtpStep';

import { default as ChangePasswordStep } from './ChangePasswordStep';
import { getFirstLoginStatus } from '../../utils/firstLoginApi';

interface Props {
    visible: boolean;
    email: string;
    onComplete: () => void;
}

type WizardStep =
    | 'loading'
    | 'verifyOtp'
    | 'changePassword'
    | 'done';

export default function FirstLoginWizard({
    visible,
    email,
    onComplete,
}: Props) {


    const [step, setStep] = useState<WizardStep>('loading');
    console.log("PROPS EMAIL:", email);
console.log("STATE EMAIL:", email);
    

    useEffect(() => {
        if (!visible) return;

        setStep('loading');
        initializeWizard();
    }, [visible]);

    useEffect(() => {
    console.log("Wizard email updated:", email);
}, [email]);

    const initializeWizard = async () => {
        try {
            const status = await getFirstLoginStatus();
            console.log('ChangePasswordStep:', ChangePasswordStep);


            const onboarding = status.onboarding;

            const needsOtp =
                !onboarding.is_email_verified;

            const needsPassword =
                onboarding.must_change_password;

            if (needsOtp) {
                setStep('verifyOtp');
                return;
            }

            if (needsPassword) {
                setStep('changePassword');
                return;
            }

            setStep('done');
            onComplete();
        } catch (error) {
            console.error('Failed to initialize first login wizard', error);
        }
    };

    const handleOtpSuccess = async () => {
        const status = await getFirstLoginStatus();

        if (status.onboarding.must_change_password) {
            setStep('changePassword');
        } else {
            setStep('done');
            onComplete();
        }
    };

    const handlePasswordSuccess = () => {
        setStep('done');
        onComplete();
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {step === 'loading' && (
                        <ActivityIndicator size="large" />
                    )}

                    {step === 'verifyOtp' && (
    email ? (
        <VerifyOtpStep email={email} onVerified={handleOtpSuccess} />
    ) : (
        <ActivityIndicator />
    )
)}

                    {step === 'changePassword' && (
                        <ChangePasswordStep
                            onChanged={handlePasswordSuccess}
                        />
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
    },
});