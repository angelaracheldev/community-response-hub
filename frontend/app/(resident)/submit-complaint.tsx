import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubmitComplaintScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [details, setDetails] = useState('');
  const [media, setMedia] = useState<string[]>([]);

  const handleUpload = (type: 'photo' | 'video') => {
    setMedia([...media, `${type}_${Date.now()}.jpg`]);
  };

  const handleSubmit = () => {
    if (!title || !details) return alert('Please fill fields');
    alert('Complaint logged!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>File an Incident Report</Text>
        
        <Text style={styles.label}>Headline</Text>
        <TextInput style={styles.input} placeholder="What is the issue?" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Details</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Describe location markers..." value={details} onChangeText={setDetails} />

        <Text style={styles.label}>Evidence Vault</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => handleUpload('photo')}><Text>📸 Photo</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => handleUpload('video')}><Text>🎥 Video</Text></TouchableOpacity>
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
  container: { width: '100%', maxWidth: 450, alignSelf: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  mediaBtn: { flex: 1, backgroundColor: '#fff', borderStyle: 'dashed', borderWidth: 1, borderColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontWeight: '700' }
});