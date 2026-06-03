import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Gatekeeper() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barangay/Subdivision Reporter</Text>
      <Text style={styles.subtitle}>Choose your entry point (MVP Sandbox)</Text>

      {/* Simulation Button 1: Go to Login */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#007AFF' }]} 
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Go to Login / Register</Text>
      </TouchableOpacity>

      {/* Simulation Button 2: Go to Resident App */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#34C759' }]} 
        onPress={() => router.push('/(resident)/home')}
      >
        <Text style={styles.buttonText}>Enter as Resident</Text>
      </TouchableOpacity>

      {/* Simulation Button 3: Go to Admin Dashboard */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#FF9500' }]} 
        onPress={() => router.push('/(admin)/dashboard')}
      >
        <Text style={styles.buttonText}>Enter as Officer Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // shadow for android
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});