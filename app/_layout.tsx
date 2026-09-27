import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(customer)" />
            <Stack.Screen name="(worker)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="request-service" options={{ headerShown: true, title: 'Request Service', headerTintColor: '#0D7B6B' }} />
            <Stack.Screen name="booking-detail" options={{ headerShown: true, title: 'Booking Details', headerTintColor: '#0D7B6B' }} />
            <Stack.Screen name="job-detail" options={{ headerShown: true, title: 'Job Details', headerTintColor: '#0D7B6B' }} />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
