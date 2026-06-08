import React, { useState } from 'react';
import { Modal, Text, View, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { cancelComplaintModalStyles as styles } from '../styles/complaint/cancelModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export default function CancelComplaintModal({ visible, onClose, onConfirm }: Props) {
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep('confirm');
    setReason('');
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleContinue = () => {
    setStep('reason');
    setError(null);
  };

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError('Cancellation reason must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel complaint');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {step === 'confirm' ? (
            <>
              <Text style={styles.title}>Cancel Complaint</Text>
              <Text style={styles.message}>
                Are you sure you want to cancel this complaint?{'\n\n'}
                This action cannot be undone.
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
                  <Text style={styles.secondaryButtonText}>No, Keep Complaint</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
                  <Text style={styles.primaryButtonText}>Yes, Continue</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Cancellation Reason</Text>
              <Text style={styles.fieldLabel}>Cancellation Reason *</Text>
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Explain why you are cancelling this complaint"
                multiline
                textAlignVertical="top"
                editable={!submitting}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setStep('confirm')}
                  disabled={submitting}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.dangerButton]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Cancel Complaint</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


