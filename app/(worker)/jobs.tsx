import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { JobOfferCard } from '@/components/feature/JobOfferCard';
import { useApp } from '@/hooks/useApp';

const FILTERS = ['New Offers', 'Accepted', 'Completed', 'Declined'];

export default function WorkerJobs() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('New Offers');
  const { jobOffers, acceptOffer, declineOffer } = useApp();

  const filtered = jobOffers.filter(o => {
    if (activeFilter === 'New Offers') return o.status === 'pending';
    if (activeFilter === 'Accepted') return o.status === 'accepted';
    if (activeFilter === 'Declined') return o.status === 'declined';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Offers</Text>
        <View style={styles.headerRight}>
          <MaterialIcons name="tune" size={22} color={Colors.textSecondary} />
        </View>
      </View>

      {/* Allocation info */}
      <View style={styles.allocationInfo}>
        <MaterialIcons name="info-outline" size={14} color={Colors.primary} />
        <Text style={styles.allocationText}>
          Offers are matched to your skills, availability, location and recent workload balance.
        </Text>
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
            <MaterialIcons name="work-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No {activeFilter.toLowerCase()}</Text>
            <Text style={styles.emptyText}>Check back soon — offers arrive based on your availability and service area.</Text>
          </View>
        ) : (
          filtered.map(offer => (
            <JobOfferCard
              key={offer.id}
              offer={offer}
              onAccept={() => acceptOffer(offer.id)}
              onDecline={() => declineOffer(offer.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
  },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  headerRight: { padding: Spacing[1] },
  allocationInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2],
    backgroundColor: Colors.primaryLight, marginHorizontal: Spacing[5],
    borderRadius: Radius.md, padding: Spacing[3], marginBottom: Spacing[3],
  },
  allocationText: { flex: 1, fontSize: Typography.xs, color: Colors.primary, lineHeight: 18 },
  filterWrapper: { height: 52 },
  filters: { paddingHorizontal: Spacing[5], gap: Spacing[2], alignItems: 'center' },
  chip: {
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2],
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, height: 36, justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
  empty: { alignItems: 'center', marginTop: Spacing[12], gap: Spacing[2] },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280 },
});
