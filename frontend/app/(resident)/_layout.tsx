import { Tabs } from 'expo-router';
import { useWindowDimensions, Platform } from 'react-native';
import { useResidentVerification } from '../../hooks/useResidentVerification';

export default function ResidentLayout() {
  const { width } = useWindowDimensions();
  const { isVerified, loading } = useResidentVerification();

  const canReport = loading || isVerified;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        headerShown: false,
        tabBarStyle: {
          width: '100%',
          maxWidth: 450,
          alignSelf: 'center',
          ...Platform.select({
            web: {
              position: width > 450 ? 'fixed' : 'relative',
              bottom: width > 450 ? 16 : 0,
              left: width > 450 ? '50%' : 'auto',
              transform: width > 450 ? [{ translateX: '-50%' }] : [],
              borderRadius: width > 450 ? 16 : 0,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            } as object,
          }),
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Dashboard' }} />
      <Tabs.Screen
        name="submit-complaint"
        options={{
          title: 'Report Issue',
          href: canReport ? undefined : null,
        }}
      />
      <Tabs.Screen name="tracking" options={{ title: 'Track Status' }} />
    </Tabs>
  );
}
