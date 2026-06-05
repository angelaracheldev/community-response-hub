import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useResidentVerification } from '../../hooks/useResidentVerification';
import { clearResidentToken } from '../../utils/residentAuth';

export default function ResidentHomeScreen() {
  const router = useRouter();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const { isVerified, firstName, loading } = useResidentVerification();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (registered === '1') {
      setShowWelcome(true);
    }
  }, [registered]);

  useEffect(() => {
    if (!showWelcome) return undefined;

    const timer = setTimeout(() => {
      setShowWelcome(false);
      router.setParams({ registered: '' });
    }, 8000);

    return () => clearTimeout(timer);
  }, [showWelcome, router]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    router.setParams({ registered: '' });
  };

  const emergencyHotlines = [
    { id: 'h1', name: 'Barangay Disaster Command Center', phone: '02-8888-1234' },
    { id: 'h2', name: 'Local Police Station Desk', phone: '0917-555-SAFE' },
    { id: 'h3', name: 'Subdivision Fire Volunteer Brigade', phone: '02-8911-0000' },
  ];

  const faqs = [
    { id: 'f1', q: 'How long does complaint resolution take?', a: 'Standard issues are assessed within 24–48 hours.' },
    { id: 'f2', q: 'What counts as valid evidence?', a: 'Clear, timestamped media captured within community boundaries.' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>
              Hello{firstName ? `, ${firstName}` : ', Resident'} 👋
            </Text>
            <Text style={styles.subWelcome}>Community Response Hub</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await clearResidentToken();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {showWelcome ? (
            <View style={styles.welcomeBanner}>
              <View style={styles.welcomeBannerContent}>
                <Text style={styles.welcomeBannerTitle}>Welcome to Community Response Hub</Text>
                <Text style={styles.welcomeBannerText}>
                  Your account is set up. We received your ID and address — an admin will review
                  them shortly. You can explore the dashboard while you wait.
                </Text>
              </View>
              <TouchableOpacity
                onPress={dismissWelcome}
                style={styles.welcomeDismiss}
                accessibilityLabel="Dismiss welcome message"
              >
                <Text style={styles.welcomeDismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Account Status</Text>

          {loading ? (
            <View style={styles.card}>
              <ActivityIndicator size="small" color="#4f46e5" />
            </View>
          ) : isVerified ? (
            <View style={[styles.card, styles.verifiedCard]}>
              <Text style={styles.cardTitleSuccess}>Verified resident</Text>
              <Text style={styles.cardDesc}>
                Your ID has been approved. You can file incident reports.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, styles.pendingCard]}>
              <Text style={styles.cardTitlePending}>Verification pending</Text>
              <Text style={styles.cardDesc}>
                Your ID and address are under admin review. You cannot submit complaints until
                verification is approved.
              </Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={[styles.actionBox, !isVerified && styles.actionBoxDisabled]}
              onPress={() => router.push('/(resident)/submit-complaint')}
              disabled={!isVerified || loading}
            >
              <Text style={styles.actionBoxIcon}>✍️</Text>
              <Text style={[styles.actionBoxText, !isVerified && styles.actionBoxTextDisabled]}>
                File Report
              </Text>
              {!isVerified ? (
                <Text style={styles.actionBoxHint}>Pending verification</Text>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBox}
              onPress={() => router.push('/(resident)/tracking')}
            >
              <Text style={styles.actionBoxIcon}>🕒</Text>
              <Text style={styles.actionBoxText}>Track Status</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Emergency Direct Hotlines</Text>
          {emergencyHotlines.map((hotline) => (
            <View key={hotline.id} style={styles.hotlineCard}>
              <Text style={styles.hotlineName}>{hotline.name}</Text>
              <TouchableOpacity onPress={() => alert(`Dialing: ${hotline.phone}`)}>
                <Text style={styles.hotlinePhone}>{hotline.phone}</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Frequently Asked Questions</Text>
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
  welcomeBanner: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  welcomeBannerContent: {
    flex: 1,
    paddingRight: 8,
  },
  welcomeBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#312e81',
    marginBottom: 4,
  },
  welcomeBannerText: {
    fontSize: 13,
    color: '#4338ca',
    lineHeight: 18,
  },
  welcomeDismiss: {
    padding: 4,
  },
  welcomeDismissText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
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
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  cardTitleSuccess: {
    fontWeight: '700',
    color: '#065f46',
    fontSize: 15,
    marginBottom: 4,
  },
  cardTitlePending: {
    fontWeight: '700',
    color: '#92400e',
    fontSize: 15,
    marginBottom: 4,
  },
  cardDesc: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
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
  actionBoxDisabled: {
    opacity: 0.65,
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
  actionBoxTextDisabled: {
    color: '#6b7280',
  },
  actionBoxHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
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
