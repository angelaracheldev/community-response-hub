import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { API_BASE } from '../../utils/apiConfig';

const BASE_URL = API_BASE;

export default function ResidentHomeScreen() {
  const router = useRouter();

  // --- STATE FOR COMMUNITY VERIFICATION ---
  const [isVerified, setIsVerified] = useState(false);
  const [address, setAddress] = useState('');
  const [verificationType, setVerificationType] = useState('Utility Bill'); // Defaulting type matching your API requirements
  const [imageUri, setImageUri] = useState(null); // Local URI for selected verification file
  const [isLoading, setIsLoading] = useState(false);

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

  // Pick Document/Image for Proof of Residence
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Connected API Verification Call
  const handleVerifyResident = async () => {
    if (!address || !imageUri) {
      alert('Please fill out your address and upload a proof of residence image.');
      return;
    }

    setIsLoading(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');

      // 1. Construct Multipart Form Data Payload matching Swagger specifications
      const formData = new FormData();
      formData.append('verificationType', verificationType);
      formData.append('address', address);

      // Extract details out of imageUri to mimic binary upload stream
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      // 2. Make Network Call using multipart headers
      const response = await fetch(`${BASE_URL}/resident/verify`, { // Verify your exact path prefix endpoint here
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Pass Auth token if endpoint is protected
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        alert('Verification payload submitted successfully!');
      } else {
        alert(data.message || 'Verification submission failed.');
      }
    } catch (error) {
      console.error('API Verification Request Error:', error);
      alert('Network connectivity error. Could not upload documents.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
        {/* Profile Navigation Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Hello, Resident 👋</Text>
            <Text style={styles.subWelcome}>Marikina Sandbox Ecosystem</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* FEATURE 1: COMMUNITY VERIFICATION */}
          <Text style={styles.sectionTitle}>Profile Account Status</Text>
          {isVerified ? (
            <View style={[styles.card, styles.verifiedCard]}>
              <Text style={styles.cardTitleSuccess}>🛡️ Account Verified Securely</Text>
              <Text style={styles.cardDesc}>Your address at "{address}" is locked. You have authorization to file official subdivision reports.</Text>
            </View>
          ) : (
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

              {/* Upload Proof of Residence Button */}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={isLoading}>
                <Text style={styles.uploadButtonText}>
                  {imageUri ? '✓ Media Attached' : '📁 Upload Proof of Residence'}
                </Text>
              </TouchableOpacity>

              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              )}

              <TouchableOpacity style={styles.accentButton} onPress={handleVerifyResident} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.accentButtonText}>Submit Verification</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* QUICK LINKS */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Action Hub</Text>
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(resident)/submit-complaint')}>
              <Text style={styles.actionBoxIcon}>✍️</Text>
              <Text style={styles.actionBoxText}>File Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/(resident)/tracking')}>
              <Text style={styles.actionBoxIcon}>🕒</Text>
              <Text style={styles.actionBoxText}>Track Status</Text>
            </TouchableOpacity>
          </View>

          {/* FEATURE 2: EMERGENCY HOTLINES */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🚨 Emergency Direct Hotlines</Text>
          {emergencyHotlines.map((hotline) => (
            <View key={hotline.id} style={styles.hotlineCard}>
              <Text style={styles.hotlineName}>{hotline.name}</Text>
              <TouchableOpacity onPress={() => alert(`Dialing: ${hotline.phone}`)}>
                <Text style={styles.hotlinePhone}>{hotline.phone} 📞</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* FEATURE 3: FAQS */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>💡 Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqBlock}>
              <Text style={styles.faqQuestion}>Q: {faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subWelcome: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  verifiedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  actionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  cardTitleSuccess: {
    fontWeight: '700',
    color: '#065f46',
    fontSize: 15,
    marginBottom: 4,
  },
  cardTitleWarning: {
    fontWeight: '700',
    color: '#92400e',
    fontSize: 15,
    marginBottom: 4,
  },
  cardDesc: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  accentButton: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  accentButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
  },
  actionBoxIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  hotlineCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  hotlineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  hotlinePhone: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '700',
  },
  faqBlock: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
});