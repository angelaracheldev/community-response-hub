// // Filepath = frontend\components\auth\VerifyOtpStep.tsx
// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     ActivityIndicator,
//     StyleSheet,
// } from 'react-native';

// import {
//     verifyFirstLoginOtp,
//     resendFirstLoginOtp,
// } from '../../utils/firstLoginApi';

// type Props = {
//     email: string;
//     onVerified: () => void;
// };



// export default function VerifyOtpStep({
//     email,
//     onVerified,
// }: Props) {
//     const [otp, setOtp] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [resending, setResending] = useState(false);
//     const [error, setError] = useState('');


//     const handleVerify = async () => {

//         if (!otp.trim()) {
//             setError('OTP is required.');
//             return;
//         }
//         console.log("VERIFY DEBUG:", { email, otp });
//         try {
//             setLoading(true);
//             setError('');

//             await verifyFirstLoginOtp(
//                 email,
//                 otp
//             );
//             onVerified();
//         } catch (err: any) {
//             setError(err.message || 'Invalid OTP.');
//         } finally {
//             setLoading(false);
//         }
//     };
//         console.log("VERIFY DEBUG:", { email, otp });
//     const handleResend = async () => {
//         try {
//             setResending(true);
//             await resendFirstLoginOtp();
//             alert('OTP has been sent to your email.');
//         } catch (err: any) {
//             alert(err.message || 'Failed to resend OTP.');
//         } finally {
//             setResending(false);
//         }
//     };
//     console.log("VERIFY DEBUG:", { email, otp });

//     return (
//         <View>
//             <Text style={styles.title}>Verify Your Email</Text>

//             <Text style={styles.description}>
//                 Enter the OTP sent to your email address.
//             </Text>

//             <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="number-pad"
//                 maxLength={6}
//             />

//             {!!error && <Text style={styles.error}>{error}</Text>}

//             <TouchableOpacity
//                 style={styles.primaryButton}
//                 onPress={handleVerify}
//                 disabled={loading}
//             >
//                 {loading ? (
//                     <ActivityIndicator color="#fff" />
//                 ) : (
//                     <Text style={styles.primaryButtonText}>Verify OTP</Text>
//                 )}
//             </TouchableOpacity>

//             <TouchableOpacity
//                 style={styles.linkButton}
//                 onPress={handleResend}
//                 disabled={resending}
//             >
//                 <Text style={styles.linkText}>
//                     {resending ? 'Sending...' : 'Resend OTP'}
//                 </Text>
//             </TouchableOpacity>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     title: {
//         fontSize: 22,
//         fontWeight: '700',
//         marginBottom: 10,
//     },
//     description: {
//         color: '#666',
//         marginBottom: 20,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         paddingHorizontal: 12,
//         paddingVertical: 12,
//         marginBottom: 12,
//     },
//     error: {
//         color: '#dc2626',
//         marginBottom: 12,
//     },
//     primaryButton: {
//         backgroundColor: '#2563eb',
//         borderRadius: 8,
//         paddingVertical: 12,
//         alignItems: 'center',
//     },
//     primaryButtonText: {
//         color: '#fff',
//         fontWeight: '600',
//     },
//     linkButton: {
//         marginTop: 12,
//         alignItems: 'center',
//     },
//     linkText: {
//         color: '#2563eb',
//         fontWeight: '600',
//     },
// });


// Filepath = frontend/components/auth/VerifyOtpStep.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Modal,
} from 'react-native';

import {
    verifyFirstLoginOtp,
    resendFirstLoginOtp,
} from '../../utils/firstLoginApi';

type Props = {
    email: string;
    onVerified: () => void;
};

type StatusModalState = {
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
};

const initialStatusModal: StatusModalState = {
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: undefined,
};

export default function VerifyOtpStep({
    email,
    onVerified,
}: Props) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [statusModal, setStatusModal] = useState<StatusModalState>(initialStatusModal);

    const showStatus = (
        type: 'success' | 'error',
        title: string,
        message: string,
        onConfirm?: () => void
    ) => {
        setStatusModal({ visible: true, type, title, message, onConfirm });
    };

    const closeStatusModal = () => {
        const confirmCallback = statusModal.onConfirm;
        setStatusModal(initialStatusModal);
        confirmCallback?.();
    };

    const handleVerify = async () => {
        if (!otp.trim()) {
            setError('OTP is required.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await verifyFirstLoginOtp(email, otp);

            showStatus(
                'success',
                'Email Verified',
                'Your email has been successfully verified.',
                onVerified
            );
        } catch (err: any) {
            showStatus(
                'error',
                'Verification Failed',
                err.message || 'The OTP you entered is invalid or expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            await resendFirstLoginOtp();
            showStatus(
                'success',
                'OTP Sent',
                'A new OTP has been sent to your email address.'
            );
        } catch (err: any) {
            showStatus(
                'error',
                'Resend Failed',
                err.message || 'Failed to resend OTP. Please try again.'
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <View>
            <Text style={styles.title}>Verify Your Email</Text>

            <Text style={styles.description}>
                Enter the OTP sent to your email address.
            </Text>

            <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerify}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={handleResend}
                disabled={resending}
            >
                <Text style={styles.linkText}>
                    {resending ? 'Sending...' : 'Resend OTP'}
                </Text>
            </TouchableOpacity>

            <StatusModal state={statusModal} onClose={closeStatusModal} />
        </View>
    );
}

// Shared status modal UI (also used in ChangePasswordStep)
export function StatusModal({
    state,
    onClose,
}: {
    state: StatusModalState;
    onClose: () => void;
}) {
    return (
        <Modal
            visible={state.visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.card}>
                    <View
                        style={[
                            modalStyles.iconCircle,
                            state.type === 'success'
                                ? modalStyles.iconCircleSuccess
                                : modalStyles.iconCircleError,
                        ]}
                    >
                        <Text
                            style={[
                                modalStyles.iconText,
                                {
                                    color:
                                        state.type === 'success'
                                            ? '#16a34a'
                                            : '#dc2626',
                                },
                            ]}
                        >
                            {state.type === 'success' ? '✓' : '✕'}
                        </Text>
                    </View>

                    <Text style={modalStyles.title}>{state.title}</Text>
                    <Text style={modalStyles.message}>{state.message}</Text>

                    <TouchableOpacity
                        style={[
                            modalStyles.button,
                            state.type === 'success'
                                ? modalStyles.buttonSuccess
                                : modalStyles.buttonError,
                        ]}
                        onPress={onClose}
                    >
                        <Text style={modalStyles.buttonText}>
                            {state.type === 'success' ? 'Continue' : 'Try Again'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
    },
    description: {
        color: '#666',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
    },
    error: {
        color: '#dc2626',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    linkText: {
        color: '#2563eb',
        fontWeight: '600',
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircleSuccess: {
        backgroundColor: '#dcfce7',
    },
    iconCircleError: {
        backgroundColor: '#fee2e2',
    },
    iconText: {
        fontSize: 28,
        fontWeight: '700',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonSuccess: {
        backgroundColor: '#16a34a',
    },
    buttonError: {
        backgroundColor: '#dc2626',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});