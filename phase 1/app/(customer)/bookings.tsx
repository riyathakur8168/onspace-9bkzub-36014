import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { BookingCard } from '@/components/feature/BookingCard';
import { useApp } from '@/hooks/useApp';

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

export default function CustomerBookings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookings } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = bookings.filter(b => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return ['matching', 'accepted', 'en_route', 'arrived', 'started'].includes(b.status);
    if (activeFilter === 'Completed') return ['completed', 'payment_settled', 'closed'].includes(b.status);
    if (activeFilter === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Your service bookings will appear here.</Text>
          </View>
        ) : (
          filtered.map(b => (
            <BookingCard key={b.id} booking={b} onPress={() => router.push('/booking-detail' as any)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  filterWrapper: { height: 56 },
  filters: { paddingHorizontal: Spacing[5], gap: Spacing[2], alignItems: 'center' },
  chip: {
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    height: 36, justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
  empty: { alignItems: 'center', marginTop: Spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[3] },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing[2] },
});
