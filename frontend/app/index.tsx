import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appIndexStyles as styles } from '../styles/app/index';

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
        {/* <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#34C759' }]} 
          onPress={() => router.push('/(resident)/home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enter as Resident</Text>
        </TouchableOpacity> */}

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

