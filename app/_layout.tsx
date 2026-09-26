import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AlertProvider } from '@/template';
import { AppProvider } from '@/contexts/AppContext';
import { DevDiagnosticsBanner } from '@/components/DevDiagnosticsBanner';

LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
]);

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if called multiple times */
});

export default function RootLayout() {
  return (
    <AppProvider>
      <AlertProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/verify" />
            <Stack.Screen name="onboarding/role" />
            <Stack.Screen name="onboarding/customer" />
            <Stack.Screen name="onboarding/worker" />
            <Stack.Screen name="(customer)" />
            <Stack.Screen name="(worker)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="booking-detail" options={{ headerShown: true, title: 'Booking Details', headerTintColor: '#1A6B5A' }} />
            <Stack.Screen name="request-service" options={{ headerShown: true, title: 'New Request', headerTintColor: '#1A6B5A' }} />
          </Stack>
          <DevDiagnosticsBanner />
        </SafeAreaProvider>
      </AlertProvider>
    </AppProvider>
  );
}
