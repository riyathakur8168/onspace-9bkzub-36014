import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

const MENU_ITEMS = [
  { icon: 'location-on', label: 'Saved Addresses', sub: 'Manage delivery addresses' },
  { icon: 'payment', label: 'Payment Methods', sub: 'Cards, UPI, wallets' },
  { icon: 'support-agent', label: 'Help & Support', sub: 'FAQs, contact, disputes' },
  { icon: 'privacy-tip', label: 'Privacy & Legal', sub: 'Terms, privacy policy' },
];

export default function CustomerProfile() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{currentUser?.name?.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser?.name}</Text>
            <Text style={styles.userEmail}>{currentUser?.email}</Text>
            <Text style={styles.userPhone}>{currentUser?.phone}</Text>
          </View>
          <Pressable style={styles.editBtn}>
            <MaterialIcons name="edit" size={18} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { value: '2', label: 'Bookings' },
            { value: '4.8', label: 'Avg Rating' },
            { value: '₹1,030', label: 'Total Spent' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                <View style={styles.menuIconWrap}>
                  <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
              </Pressable>
              {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Cooperative Info */}
        <View style={styles.coopCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
          <Text style={styles.coopText}>
            OnePlace is a cooperative-principles platform. 85% of every service value goes directly to the worker. The 15% pool funds training, safety and platform operations.
          </Text>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary, paddingTop: Spacing.md, marginBottom: Spacing.md },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.sm },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { ...Typography.sectionTitle, color: Colors.primary },
  userName: { ...Typography.bodyLarge, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { ...Typography.bodySmall, color: Colors.textSecondary },
  userPhone: { ...Typography.bodySmall, color: Colors.textSecondary },
  editBtn: { padding: 6 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.sm },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { ...Typography.amountSmall, color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  menuCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  menuItemPressed: { backgroundColor: Colors.surfaceAlt },
  menuIconWrap: { width: 38, height: 38, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { ...Typography.bodyMedium, fontWeight: '500', color: Colors.textPrimary },
  menuSub: { ...Typography.caption, color: Colors.textMuted },
  menuDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 70 },
  coopCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  coopText: { ...Typography.bodySmall, color: Colors.primaryDark, flex: 1, lineHeight: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error + '40', backgroundColor: Colors.errorLight },
  logoutText: { ...Typography.button, color: Colors.error },
});
