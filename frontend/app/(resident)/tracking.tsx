import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackingScreen() {
  const mockComplaints = [
    { id: '1', title: 'Broken Streetlight', status: 'In Progress', date: 'June 01' },
    { id: '2', title: 'Uncollected Trash Block 4', status: 'Pending', date: 'June 03' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Active Status Trackers</Text>
        
        {mockComplaints.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.status}</Text></View>
            </View>
            <Text style={styles.date}>Logged: {item.date}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { width: '100%', maxWidth: 450, alignSelf: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: '#1e40af', fontWeight: '700' },
  date: { color: '#6b7280', fontSize: 12, marginTop: 8 }
});