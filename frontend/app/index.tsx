import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gatekeeper() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Barangay/Subdivision Reporter</Text>
        <Text style={styles.subtitle}>Choose your entry point (MVP Sandbox)</Text>

        {/* Simulation Button 1: Go to Login */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#007AFF' }]} 
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go to Login / Register</Text>
        </TouchableOpacity>

        {/* Simulation Button 2: Go to Resident App */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#34C759' }]} 
          onPress={() => router.push('/(resident)/home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enter as Resident</Text>
        </TouchableOpacity>

        {/* Simulation Button 3: Go to Admin Landing */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF9500' }]} 
          onPress={() => router.push('/(admin)')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enter as Officer Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 450,         // Locks the width on desktop screens
    alignSelf: 'center',   // Centers the layout structure on the web
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    // Modern shadow setup that won't throw warnings on Expo Web
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});