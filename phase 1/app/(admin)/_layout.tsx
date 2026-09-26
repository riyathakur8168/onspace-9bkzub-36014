import { Tabs, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { ROLES } from '@/constants/config';

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, role, isHydrated, workersList } = useApp();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.adminColor} />
      </View>
    );
  }

  if (!isLoggedIn || role !== ROLES.ADMIN) {
    return <Redirect href="/auth/login" />;
  }

  const pendingCount = workersList.filter(w => w.verificationStatus === 'pending').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
          paddingHorizontal: 16,
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.adminColor,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workers"
        options={{
          title: 'Workers',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="groups" size={size} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      <Tabs.Screen
        name="fairness"
        options={{
          title: 'Fairness',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="balance" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
