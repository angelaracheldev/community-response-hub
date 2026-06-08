import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { buildVerificationFormData } from '../../utils/verificationUpload';
import {
  fetchMyVerificationDetails,
  submitVerification,
  VerificationStatus,
} from '../../utils/userApi';
import { PageShell } from '../../components/common/PageShell';
import { residentHomeStyles as styles } from '../../styles/app/residentHome';

type SelectedFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
  isImage: boolean;
};

export default function ResidentHomeScreen() {
  const router = useRouter();
  // --- STATE FOR COMMUNITY VERIFICATION ---
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');
  const [rejectionRemarks, setRejectionRemarks] = useState<string>('');
  const [address, setAddress] = useState('');
  const [verificationType, setVerificationType] = useState<string>('ID');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- MOCK DATA FOR FAQS & HOTLINES ---
  const emergencyHotlines = [
    { id: 'h1', name: 'Barangay Disaster Command Center', phone: '02-8888-1234' },
    { id: 'h2', name: 'Local Police Station Desk', phone: '0917-555-SAFE' },
    { id: 'h3', name: 'Subdivision Fire Volunteer Brigade', phone: '02-8911-0000' },
  ];

  const faqs = [
    { id: 'f1', q: 'How long does complaint resolution take?', a: 'Standard issues are assessed within 24–48 hours.' },
    { id: 'f2', q: 'What counts as valid evidence?', a: 'Clear, timestamped media captured within community boundaries.' },
  ];

  // Load verification status on mount
  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const details = await fetchMyVerificationDetails();
      if (details) {
        setVerificationStatus(details.verification_status);
        setRejectionRemarks(details.verification_remarks);
        setAddress(details.verification_address);
        setVerificationType(details.verification_type);
      }
    } catch (error) {
      console.error('Load verification status error:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Pick Document/Image for Proof of Residence
  const pickVerificationDocument = async () => {
    setFileError('');

    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
      copyToCacheDirectory: false,
    });

   if (result.canceled) {
  return;
}

const asset = result.assets[0];

const uri = asset.uri;
const name = asset.name;
const type = (asset.mimeType || '').toLowerCase();
const size = typeof asset.size === 'number' ? asset.size : 0;
    const extension = name.split('.').pop()?.toLowerCase();
    const inferredType = extension === 'pdf'
      ? 'application/pdf'
      : extension === 'png'
      ? 'image/png'
      : extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : '';
    const fileType = type || inferredType;
    const isImage = fileType.startsWith('image/');
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(fileType)) {
      setSelectedFile(null);
      setFileError('Unsupported file type. Upload JPG, JPEG, PNG, or PDF only.');
      return;
    }

    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (size > maxSize) {
      setSelectedFile(null);
      setFileError(isImage ? 'Image must be 5 MB or smaller.' : 'PDF must be 10 MB or smaller.');
      return;
    }

    setSelectedFile({ uri, name, type: fileType, size, isImage });
  };

  // Connected API Verification Call
  const handleVerifyResident = async () => {
    if (!address.trim()) {
      alert('Please enter your address before submitting verification.');
      return;
    }

    if (!selectedFile) {
      setFileError('Verification document is required.');
      return;
    }

    setIsLoading(true);
    setFileError('');

    try {
      const formData = await buildVerificationFormData(address, selectedFile, verificationType);
      await submitVerification(formData);
      setVerificationStatus('pending');
      setRejectionRemarks('');
      setSelectedFile(null);
      alert('Verification document submitted successfully! Please wait for admin review.');
      await loadVerificationStatus();
    } catch (error) {
      console.error('API Verification Request Error:', error);
      setFileError(
        error instanceof Error ? error.message : 'Network connectivity error. Could not upload documents.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell portal="resident" activeNavId="home" pageTitle="Dashboard">
      {isPageLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Profile Account Status</Text>

            {/* APPROVED STATE */}
            {verificationStatus === 'approved' && (
              <View style={[styles.card, styles.verifiedCard]}>
                <Text style={styles.cardTitleSuccess}>🛡️ Account Verified Securely</Text>
                <Text style={styles.cardDesc}>Your address at "{address}" is locked. You have authorization to file official subdivision reports.</Text>
                {verificationType && (
                  <Text style={styles.cardDesc}>Verified with: {verificationType}</Text>
                )}
              </View>
            )}

            {/* PENDING STATE */}
            {verificationStatus === 'pending' && (
              <View style={[styles.card, styles.pendingCard]}>
                <Text style={styles.cardTitlePending}>⏳ Verification Pending</Text>
                <Text style={styles.cardDesc}>Your verification document is awaiting admin approval. This typically takes 24-48 hours. Please check back soon.</Text>
                {verificationType && (
                  <Text style={styles.cardDesc}>Document Type: {verificationType}</Text>
                )}
              </View>
            )}

            {/* REJECTED STATE */}
            {verificationStatus === 'rejected' && (
              <View style={[styles.card, styles.rejectedCard]}>
                <Text style={styles.cardTitleError}>❌ Verification Rejected</Text>
                <Text style={styles.cardDesc}>Your verification was rejected. Please review the reason below and resubmit with the correct information.</Text>
                
                {rejectionRemarks && (
                  <View style={styles.remarksContainer}>
                    <Text style={styles.remarksLabel}>Reason for Rejection:</Text>
                    <Text style={styles.remarksText}>{rejectionRemarks}</Text>
                  </View>
                )}
                
                <TextInput
                  style={styles.input}
                  placeholder="Physical House Address (e.g., Blk 2 Lot 4, Redwood St)"
                  placeholderTextColor="#9ca3af"
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLoading}
                />

                {/* <Text style={styles.fieldLabel}>Address Summary</Text>
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryText}>{address || 'No address entered yet.'}</Text>
                </View> */}

                <Text style={styles.fieldLabel}>Upload Valid Government ID</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickVerificationDocument} disabled={isLoading}>
                  <Text style={styles.uploadButtonText}>
                    {selectedFile ? `✓ ${selectedFile.name}` : '📁 Upload Valid Government ID'}
                  </Text>
                </TouchableOpacity>

                {fileError ? <Text style={styles.errorText}>{fileError}</Text> : null}

                {selectedFile?.isImage && (
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} resizeMode="cover" />
                )}

                {selectedFile && !selectedFile.isImage && (
                  <View style={styles.fileSummary}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>{`${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB PDF`}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.accentButton} onPress={handleVerifyResident} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.accentButtonText}>Submit Registration</Text>
                  )}
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isLoading}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity> */}
              </View>
            )}

            {/* NOT SUBMITTED STATE */}
            {verificationStatus === 'not_submitted' && (
              <View style={[styles.card, styles.actionCard]}>
                <Text style={styles.cardTitleWarning}>⚠️ Verification Required</Text>
                <Text style={styles.cardDesc}>Verify community residency to scale permissions up to high-priority workflows.</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Physical House Address (e.g., Blk 2 Lot 4, Redwood St)"
                  placeholderTextColor="#9ca3af"
                  value={address}
                  onChangeText={setAddress}
                  editable={!isLoading}
                />

                <Text style={styles.fieldLabel}>Address Summary</Text>
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryText}>{address || 'No address entered yet.'}</Text>
                </View>

                <Text style={styles.fieldLabel}>Upload Valid Government ID</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickVerificationDocument} disabled={isLoading}>
                  <Text style={styles.uploadButtonText}>
                    {selectedFile ? `✓ ${selectedFile.name}` : '📁 Upload Valid Government ID'}
                  </Text>
                </TouchableOpacity>

                {fileError ? <Text style={styles.errorText}>{fileError}</Text> : null}

                {selectedFile?.isImage && (
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} resizeMode="cover" />
                )}

                {selectedFile && !selectedFile.isImage && (
                  <View style={styles.fileSummary}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>{`${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB PDF`}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.accentButton} onPress={handleVerifyResident} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.accentButtonText}>Submit Registration</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isLoading}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🚨 Emergency Direct Hotlines</Text>
            {emergencyHotlines.map((hotline) => (
              <View key={hotline.id} style={styles.hotlineCard}>
                <Text style={styles.hotlineName}>{hotline.name}</Text>
                <TouchableOpacity onPress={() => alert(`Dialing: ${hotline.phone}`)}>
                  <Text style={styles.hotlinePhone}>{hotline.phone} 📞</Text>
                </TouchableOpacity>
              </View>
            ))}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>💡 Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqBlock}>
              <Text style={styles.faqQuestion}>Q: {faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </>
      )}
    </PageShell>
  );
}

