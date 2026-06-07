import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PageShell } from '../../components/common/PageShell';
import { useResidentVerification } from '../../hooks/useResidentVerification';
import { useComplaintCategories } from '../../hooks/useComplaintCategories';
import {
  createComplaint,
  deleteFailedComplaint,
  formatComplaintStatus,
  uploadComplaintMedia,
} from '../../utils/complaintApi';
import { isAllowedMediaType } from '../../utils/complaintUpload';
import {
  FieldErrors,
  hasFieldErrors,
  validateComplaintForm,
} from '../../utils/validation';

type ComplaintStep = 1 | 2 | 3;

const STEP_SUBTITLES: Record<ComplaintStep, string> = {
  1: 'Describe the issue and attach supporting evidence.',
  2: 'Review your complaint before submitting.',
  3: 'Your complaint has been logged successfully.',
};

export default function SubmitComplaintScreen() {
  const router = useRouter();
  const { isVerified, loading: verificationLoading } = useResidentVerification();
  const { categories, loading: categoriesLoading, error: categoriesError } = useComplaintCategories();

  const [step, setStep] = useState<ComplaintStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [headline, setHeadline] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [evidence, setEvidence] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [submittedReferenceId, setSubmittedReferenceId] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<string>('pending');

  const stepRef = useRef(step);
  stepRef.current = step;

  const selectedCategory = categories.find((c) => c.category_id === categoryId);

  const resetForNewComplaint = useCallback(() => {
    setStep(1);
    setHeadline('');
    setCategoryId(null);
    setDescription('');
    setLocation('');
    setEvidence([]);
    setErrors({});
    setSubmittedComplaintId(null);
    setSubmittedReferenceId(null);
    setSubmittedStatus('pending');
    setIsSubmitting(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (stepRef.current === 3) {
        resetForNewComplaint();
      }
    }, [resetForNewComplaint])
  );

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const inputStyle = (key: string) => [styles.input, errors[key] ? styles.inputError : null];

  const pickEvidence = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your media library to upload evidence.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) return;

    const valid: ImagePicker.ImagePickerAsset[] = [];
    const rejected: string[] = [];

    for (const asset of result.assets) {
      isAllowedMediaType(
  asset.mimeType ?? undefined,
  asset.type ?? undefined
)
    }

    if (rejected.length) {
      Alert.alert(
        'Unsupported file type',
        'Only JPG, JPEG, PNG, MP4, and MOV files are allowed.'
      );
    }

    if (valid.length) {
      setEvidence((prev) => [...prev, ...valid]);
      clearError('evidence');
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinueToReview = () => {
    const nextErrors = validateComplaintForm({
      headline,
      categoryId,
      description,
      location,
      evidenceCount: evidence.length,
    });
    setErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let referenceId: string | null = null;

    try {
      const complaint = await createComplaint({
        categoryId: categoryId!,
        title: headline.trim(),
        description: description.trim(),
        locationText: location.trim(),
      });

      referenceId = complaint.reference_id;

      await uploadComplaintMedia(referenceId, evidence);

      setSubmittedComplaintId(complaint.complaint_id);
      setSubmittedReferenceId(complaint.reference_id);
      setSubmittedStatus(complaint.status);
      setStep(3);
    } catch (error) {
      if (referenceId) {
        try {
          await deleteFailedComplaint(referenceId);
        } catch {
          // Best-effort rollback
        }
      }
      Alert.alert(
        'Submission failed',
        error instanceof Error ? error.message : 'Unable to submit complaint. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    router.replace('/(resident)/home');
  };

  if (verificationLoading) {
    return (
      <PageShell portal="resident" activeNavId="submit" pageTitle="Add Complaint" scrollEnabled={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </PageShell>
    );
  }

  if (!isVerified) {
    return (
      <PageShell portal="resident" activeNavId="submit" pageTitle="Add Complaint" scrollEnabled={false}>
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedTitle}>Verification pending</Text>
          <Text style={styles.blockedText}>
            Your ID is being reviewed by an admin. You cannot submit complaints until your
            residency verification is approved.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(resident)/home')}>
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell portal="resident" activeNavId="submit" pageTitle="Add Complaint" scrollEnabled={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {step < 3 && (
          <TouchableOpacity onPress={handleBack} style={styles.backLink} disabled={isSubmitting}>
            <Text style={styles.backLinkText}>{step === 1 ? '← Back to Dashboard' : '← Edit Complaint'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.stepLabel}>Step {step} of 3</Text>
        <Text style={styles.title}>
          {step === 1 ? 'Add Complaint' : step === 2 ? 'Review Complaint' : 'Complaint Submitted'}
        </Text>
        <Text style={styles.subtitle}>{STEP_SUBTITLES[step]}</Text>

        {step === 1 && (
          <>
            <Text style={styles.label}>Headline</Text>
            <TextInput
              style={inputStyle('headline')}
              placeholder="Brief summary of the issue"
              value={headline}
              onChangeText={(v) => {
                setHeadline(v);
                clearError('headline');
              }}
              maxLength={100}
            />
            {errors.headline ? <Text style={styles.errorText}>{errors.headline}</Text> : null}

            <Text style={styles.label}>Category</Text>
            {categoriesLoading ? (
              <ActivityIndicator color="#4f46e5" style={{ marginVertical: 12 }} />
            ) : categoriesError ? (
              <Text style={styles.errorText}>{categoriesError}</Text>
            ) : (
              <View style={styles.categoryList}>
                {categories.map((cat) => {
                  const selected = categoryId === cat.category_id;
                  return (
                    <TouchableOpacity
                      key={cat.category_id}
                      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                      onPress={() => {
                        setCategoryId(cat.category_id);
                        clearError('categoryId');
                      }}
                    >
                      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                        {cat.category_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[inputStyle('description'), styles.textArea]}
              multiline
              placeholder="Describe what happened and any relevant details"
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                clearError('description');
              }}
              textAlignVertical="top"
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={inputStyle('location')}
              placeholder="Street, block, or landmark"
              value={location}
              onChangeText={(v) => {
                setLocation(v);
                clearError('location');
              }}
            />
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

            <Text style={styles.label}>Evidence</Text>
            <Text style={styles.hint}>Upload at least one photo or video (JPG, PNG, MP4, MOV)</Text>
            <TouchableOpacity style={styles.mediaBtn} onPress={pickEvidence}>
              <Text style={styles.mediaBtnText}>Upload Photo or Video</Text>
            </TouchableOpacity>
            {errors.evidence ? <Text style={styles.errorText}>{errors.evidence}</Text> : null}

            {evidence.length > 0 && (
              <View style={styles.evidenceGrid}>
                {evidence.map((asset, index) => (
                  <View key={`${asset.uri}-${index}`} style={styles.evidenceItem}>
                    {asset.type === 'video' ? (
                      <View style={styles.videoPlaceholder}>
                        <Text style={styles.videoLabel}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: asset.uri }} style={styles.evidenceThumb} />
                    )}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeEvidence(index)}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleContinueToReview}>
              <Text style={styles.primaryBtnText}>Continue to Review</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Headline</Text>
              <Text style={styles.reviewValue}>{headline.trim()}</Text>

              <Text style={styles.reviewLabel}>Category</Text>
              <Text style={styles.reviewValue}>{selectedCategory?.category_name ?? '—'}</Text>

              <Text style={styles.reviewLabel}>Description</Text>
              <Text style={styles.reviewValue}>{description.trim()}</Text>

              <Text style={styles.reviewLabel}>Location</Text>
              <Text style={styles.reviewValue}>{location.trim()}</Text>

              <Text style={styles.reviewLabel}>Evidence ({evidence.length})</Text>
              <View style={styles.evidenceGrid}>
                {evidence.map((asset, index) => (
                  <View key={`review-${asset.uri}-${index}`} style={styles.evidenceItem}>
                    {asset.type === 'video' ? (
                      <View style={styles.videoPlaceholder}>
                        <Text style={styles.videoLabel}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: asset.uri }} style={styles.evidenceThumb} />
                    )}
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Submit Complaint</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep(1)}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryBtnText}>Edit Complaint</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && submittedComplaintId && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Complaint submitted</Text>
              <Text style={styles.successMessage}>
                Your report has been received and is awaiting review.
              </Text>

              <View style={styles.successDetail}>
                <Text style={styles.reviewLabel}>Status</Text>
                <Text style={styles.reviewValue}>{formatComplaintStatus(submittedStatus)}</Text>
              </View>

              <View style={styles.successDetail}>
                <Text style={styles.reviewLabel}>Reference Number</Text>
                <Text style={styles.complaintId} selectable>
                  {submittedReferenceId}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace('/(resident)/tracking')}
            >
              <Text style={styles.primaryBtnText}>View My Complaints</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(resident)/home')}
            >
              <Text style={styles.secondaryBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { width: '100%', paddingBottom: 16 },
  backLink: { marginBottom: 16 },
  backLinkText: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#374151' },
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputError: { borderColor: '#ef4444' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  mediaBtn: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#4f46e5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  mediaBtnText: { color: '#4f46e5', fontWeight: '600' },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipSelected: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  categoryChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  categoryChipTextSelected: { color: '#fff' },
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  evidenceItem: { width: 90 },
  evidenceThumb: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#e5e7eb' },
  videoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  removeBtn: { marginTop: 4, alignItems: 'center' },
  removeBtnText: { fontSize: 11, color: '#ef4444', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.7 },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 12, marginBottom: 4 },
  reviewValue: { fontSize: 15, color: '#111827', lineHeight: 22 },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  successIcon: {
    fontSize: 40,
    color: '#10b981',
    fontWeight: '800',
    marginBottom: 8,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  successMessage: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  successDetail: { alignSelf: 'stretch', marginTop: 16 },
  complaintId: { fontSize: 13, color: '#111827', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  blockedContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  blockedTitle: { fontSize: 22, fontWeight: '800', color: '#92400e', marginBottom: 12 },
  blockedText: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 24 },
});
