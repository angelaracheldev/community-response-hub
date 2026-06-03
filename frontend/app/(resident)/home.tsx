import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ResidentHomeScreen() {
  const router = useRouter();

  // --- STATE FOR COMMUNITY VERIFICATION ---
  const [isVerified, setIsVerified] = useState(false);
  const [houseAddress, setHouseAddress] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  // --- MOCK DATA FOR FAQS & HOTLINES ---
  const emergencyHotlines = [
    { id: 'h1', name: 'Barangay Disaster Command Center', phone: '02-8888-1234' },
    { id: 'h2', name: 'Local Police Station Desk', phone: '0917-555-SAFE' },
    { id: 'h3', name: 'Subdivision Fire Volunteer Brigade', phone: '02-8911-0000' },
  ];

  const faqs = [
    { id: 'f1', q: 'How long does complaint resolution take?', a: 'Standard municipal/barangay issues are assessed within 24–48 hours.' },
    { id: 'f2', q: 'What counts as valid photo/video evidence?', a: 'Clear, timestamped media captured within the boundaries of the community compound.' },
  ];

  const handleVerifyResident = () => {
    if (!houseAddress || !verificationToken) {
      alert('Please enter your house address and verification security token.');
      return;
    }
    setIsVerified(true);
    alert('Profile successfully matched and Verified!');
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
              <Text style={styles.cardDesc}>Your address at "{houseAddress}" is locked. You have authorization to file official subdivision reports.</Text>
            </View>
          ) : (
            <View style={[styles.card, styles.actionCard]}>
              <Text style={styles.cardTitleWarning}>⚠️ Verification Required</Text>
              <Text style={styles.cardDesc}>Verify community residency to scale permissions up to high-priority workflows.</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Physical House Address (e.g., Blk 2 Lot 4, Redwood St)"
                placeholderTextColor="#9ca3af"
                value={houseAddress}
                onChangeText={setHouseAddress}
              />
              <TextInput
                style={styles.input}
                placeholder="Verification Token (Admin issued)"
                placeholderTextColor="#9ca3af"
                value={verificationToken}
                onChangeText={setVerificationToken}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.accentButton} onPress={handleVerifyResident}>
                <Text style={styles.accentButtonText}>Submit Verification Dossier</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* QUICK LINKS (Navigates directly to your separated pages) */}
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
              <TouchableOpacity onPress={() => alert(`Dialing phone routing to: ${hotline.phone}`)}>
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
    maxWidth: 450, // Matches your web constraint setup across pages
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