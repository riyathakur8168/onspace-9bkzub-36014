import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_BOOKINGS, Booking } from '@/services/mockData';

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  matching: { label: 'Finding worker', color: Colors.info, bg: Colors.infoLight, icon: 'search' },
  confirmed: { label: 'Worker assigned', color: Colors.primary, bg: Colors.primaryLight, icon: 'check-circle' },
  en_route: { label: 'On the way', color: Colors.warning, bg: Colors.warningLight, icon: 'directions-car' },
  arrived: { label: 'Worker arrived', color: Colors.warning, bg: Colors.warningLight, icon: 'location-on' },
  in_progress: { label: 'In progress', color: Colors.success, bg: Colors.successLight, icon: 'build' },
  completed: { label: 'Completed', color: Colors.success, bg: Colors.successLight, icon: 'done-all' },
  cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.errorLight, icon: 'cancel' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const filtered = MOCK_BOOKINGS.filter((b) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['matching', 'confirmed', 'en_route', 'arrived', 'in_progress'].includes(b.status);
    if (filter === 'Completed') return b.status === 'completed';
    if (filter === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const renderBooking = ({ item }: { item: Booking }) => {
    const meta = STATUS_META[item.status] || STATUS_META.matching;
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push({ pathname: '/booking-detail', params: { id: item.id } })}
      >
        <View style={styles.cardTop}>
          <View style={[styles.catIcon, { backgroundColor: Colors.primaryLight }]}>
            <MaterialIcons name={item.serviceIcon as any} size={22} color={Colors.primary} />
          </View>
          <View style={styles.cardMain}>
            <Text style={styles.cardTitle}>{item.issueTitle}</Text>
            <Text style={styles.cardRef}>{item.bookingRef}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <MaterialIcons name={meta.icon as any} size={13} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="person" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.workerName || 'Matching...'}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.scheduledDate}, {item.scheduledSlot}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Service value</Text>
          <Text style={styles.price}>₹{item.serviceValue}</Text>
          {item.status === 'confirmed' && item.otp ? (
            <View style={styles.otpWrap}>
              <Text style={styles.otpLabel}>Start OTP</Text>
              <Text style={styles.otpCode}>{item.otp}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Bookings</Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="event-busy" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySub}>Your {filter.toLowerCase()} bookings will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary },
  filterBar: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterScroll: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { ...Typography.label, color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardPressed: { opacity: 0.88 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  catIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1 },
  cardTitle: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  cardRef: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { ...Typography.caption, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  cardMeta: { gap: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { ...Typography.bodySmall, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  priceLabel: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  price: { ...Typography.amountSmall, color: Colors.textPrimary },
  otpWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: Spacing.md, backgroundColor: Colors.warningLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.sm },
  otpLabel: { ...Typography.caption, color: Colors.warning, fontWeight: '600' },
  otpCode: { ...Typography.sectionTitle, color: Colors.warning, letterSpacing: 3 },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.sectionTitle, color: Colors.textSecondary },
  emptySub: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
});
