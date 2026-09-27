import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_BOOKINGS } from '@/services/mockData';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, logout } = useApp();
  const completedBookings = MOCK_BOOKINGS.filter(b => b.status === 'completed').length;
  const totalSpend = MOCK_BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.serviceValue, 0);

  const menuItems = [
    { icon: 'location-outline', label: 'Saved Addresses', arrow: true },
    { icon: 'card-outline', label: 'Payment Methods', arrow: true },
    { icon: 'notifications-outline', label: 'Notifications', arrow: true },
    { icon: 'help-circle-outline', label: 'Help & Support', arrow: true },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Safety', arrow: true },
    { icon: 'information-circle-outline', label: 'About OnePlace', arrow: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
              <Badge label="Verified Customer" variant="success" />
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{MOCK_BOOKINGS.length}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{completedBookings}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>₹{totalSpend}</Text>
              <Text style={styles.statLabel}>Total Spend</Text>
            </View>
          </View>
        </Card>

        {/* Menu */}
        <Card style={styles.menuCard} padded={false}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuBorder]} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.arrow && <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />}
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.md }}>
          <Button label="Switch Role / Log Out" onPress={() => { logout(); router.replace('/'); }} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileCard: { margin: Spacing.lg, marginBottom: 0 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 2 },
  profilePhone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6 },
  editBtn: { padding: Spacing.xs },
  statsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSubtle, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  menuCard: { margin: Spacing.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuIconWrap: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
});
