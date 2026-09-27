import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { MOCK_BOOKINGS, SERVICE_CATEGORIES } from '@/services/mockData';

export default function CustomerHome() {
  const router = useRouter();
  const { user } = useApp();
  const activeBooking = MOCK_BOOKINGS.find(b => b.status === 'en_route' || b.status === 'arrived' || b.status === 'started');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name ?? 'Guest'} 👋</Text>
          </View>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
        </View>

        {/* Active Booking Banner */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => router.push('/booking-detail')}
            activeOpacity={0.85}
          >
            <View style={styles.activePulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerLabel}>Active Booking</Text>
              <Text style={styles.activeBannerTitle}>{activeBooking.category} · {activeBooking.subcategory}</Text>
              <Text style={styles.activeBannerSub}>{activeBooking.workerName} is on the way</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you need?</Text>
          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catCard, Shadow.sm]}
                activeOpacity={0.8}
                onPress={() => router.push('/request-service')}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <Text style={styles.catDesc}>{cat.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/bookings')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {MOCK_BOOKINGS.slice(0, 2).map(b => (
            <TouchableOpacity key={b.id} onPress={() => router.push('/booking-detail')} activeOpacity={0.8}>
              <Card style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                  <Image source={{ uri: b.workerAvatar }} style={styles.workerAvatar} contentFit="cover" transition={200} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle}>{b.category} · {b.subcategory}</Text>
                    <Text style={styles.bookingWorker}>{b.workerName}</Text>
                    <Text style={styles.bookingDate}>{b.scheduledDate}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Badge
                      label={b.status === 'en_route' ? 'On the way' : b.status === 'completed' ? 'Completed' : b.status}
                      variant={b.status === 'completed' ? 'success' : b.status === 'en_route' ? 'info' : 'neutral'}
                    />
                    <Text style={styles.bookingValue}>₹{b.serviceValue}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick CTA */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Button label="Book a Service" onPress={() => router.push('/request-service')} size="lg" style={{ width: '100%' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary, margin: Spacing.lg, borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  activePulse: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.amberLight,
  },
  activeBannerLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', fontWeight: FontWeight.semibold, marginBottom: 2 },
  activeBannerTitle: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.semibold },
  activeBannerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catCard: {
    width: '30%', flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', minWidth: 90,
  },
  catIcon: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  catLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'center' },
  catDesc: { fontSize: 10, color: Colors.textSubtle, textAlign: 'center', marginTop: 2 },
  bookingCard: { marginBottom: Spacing.sm },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  workerAvatar: { width: 44, height: 44, borderRadius: 22 },
  bookingTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  bookingWorker: { fontSize: FontSize.sm, color: Colors.textSecondary },
  bookingDate: { fontSize: FontSize.xs, color: Colors.textSubtle },
  bookingValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
