import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { resolveComplaintModalStyles as styles } from '../../styles/complaint/resolveModal';
import { isAllowedMediaType } from '../../utils/complaintUpload';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (remarks: string, assets: ImagePicker.ImagePickerAsset[]) => Promise<void>;
};

export default function ResolveComplaintModal({ visible, onClose, onConfirm }: Props) {
  const [remarks, setRemarks] = useState('');
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRemarks('');
    setAssets([]);
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePickEvidence = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const validAssets = result.assets.filter((asset) =>
      isAllowedMediaType(asset.mimeType ?? undefined, asset.type)
    );

    if (!validAssets.length) {
      setError('Only JPG, JPEG, PNG, MP4, and MOV files are supported.');
      return;
    }

    setAssets((current) => [...current, ...validAssets]);
    setError(null);
  };

  const handleRemoveAsset = (index: number) => {
    setAssets((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    const trimmed = remarks.trim();
    if (trimmed.length < 10) {
      setError('Resolution remarks must be at least 10 characters.');
      return;
    }

    if (!assets.length) {
      setError('At least one photo or video is required as resolution evidence.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(trimmed, assets);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resolve complaint');
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
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Mark as Resolved</Text>
            <Text style={styles.subtitle}>
              Provide resolution remarks and upload proof that the issue has been fixed.
            </Text>

            <Text style={styles.fieldLabel}>Resolution Remarks *</Text>
            <TextInput
              style={styles.input}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              textAlignVertical="top"
              editable={!submitting}
            />

            <Text style={styles.fieldLabel}>Resolution Evidence *</Text>
            <Text style={styles.hint}>Supported formats: JPG, JPEG, PNG, MP4, MOV</Text>

            {assets.length ? (
              <View style={styles.evidenceList}>
                {assets.map((asset, index) => (
                  <View key={`${asset.uri}-${index}`} style={styles.evidenceItem}>
                    <Text style={styles.evidenceName} numberOfLines={1}>
                      {asset.fileName ?? (asset.type === 'video' ? 'Video evidence' : 'Photo evidence')}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveAsset(index)} disabled={submitting}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.addEvidenceButton}
              onPress={handlePickEvidence}
              disabled={submitting}
            >
              <Text style={styles.addEvidenceButtonText}>Add Photo or Video</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleClose} disabled={submitting}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Submit Resolution</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
