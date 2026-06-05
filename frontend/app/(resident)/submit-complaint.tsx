import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResidentVerification } from '../../hooks/useResidentVerification';

export default function SubmitComplaintScreen() {
  const router = useRouter();
  const { isVerified, loading } = useResidentVerification();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [media, setMedia] = useState<string[]>([]);

  const handleUpload = (type: 'photo' | 'video') => {
    setMedia([...media, `${type}_${Date.now()}.jpg`]);
  };

  const handleSubmit = () => {
    if (!title || !details) {
      alert('Please fill out all required fields.');
      return;
    }
    alert('Complaint logged!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isVerified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedTitle}>Verification pending</Text>
          <Text style={styles.blockedText}>
            Your ID is being reviewed by an admin. You cannot submit complaints until your
            residency verification is approved.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(resident)/home')}>
            <Text style={styles.backBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>File an Incident Report</Text>

        <Text style={styles.label}>Headline</Text>
        <TextInput
          style={styles.input}
          placeholder="What is the issue?"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Details</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Describe location markers..."
          value={details}
          onChangeText={setDetails}
        />

        <Text style={styles.label}>Evidence Vault</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => handleUpload('photo')}>
            <Text>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => handleUpload('video')}>
            <Text>Video</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blockedContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  blockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 12,
  },
  blockedText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  container: { width: '100%', maxWidth: 450, alignSelf: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  mediaBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: '#fff', fontWeight: '700' },
});
