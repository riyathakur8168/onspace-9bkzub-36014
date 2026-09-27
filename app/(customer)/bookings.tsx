import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_BOOKINGS } from '@/services/mockData';

type FilterTab = 'all' | 'active' | 'completed';

export default function CustomerBookings() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = MOCK_BOOKINGS.filter(b => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  const statusLabel: Record<string, string> = {
    en_route: 'On the way', arrived: 'Arrived', started: 'In progress',
    completed: 'Completed', cancelled: 'Cancelled', accepted: 'Confirmed',
  };
  const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'neutral' | 'error'> = {
    en_route: 'info', arrived: 'info', started: 'warning',
    completed: 'success', cancelled: 'error', accepted: 'neutral',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, filter === t.key && styles.tabActive]}
            onPress={() => setFilter(t.key)}
          >
            <Text style={[styles.tabText, filter === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          filtered.map(b => (
            <TouchableOpacity key={b.id} onPress={() => router.push('/booking-detail')} activeOpacity={0.85}>
              <Card style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: b.workerAvatar }} style={styles.avatar} contentFit="cover" transition={200} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{b.category}</Text>
                    <Text style={styles.cardSub}>{b.subcategory}</Text>
                  </View>
                  <Badge label={statusLabel[b.status] ?? b.status} variant={statusVariant[b.status] ?? 'neutral'} />
                </View>
                <View style={styles.divider} />
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>{b.workerName}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>{b.scheduledDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>₹{b.serviceValue}</Text>
                  </View>
                </View>
                {b.rating ? (
                  <View style={styles.ratingRow}>
                    {[1,2,3,4,5].map(s => (
                      <Ionicons key={s} name={s <= (b.rating ?? 0) ? 'star' : 'star-outline'} size={14} color={Colors.amber} />
                    ))}
                    <Text style={styles.reviewText}>{b.review}</Text>
                  </View>
                ) : null}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  tabActive: { backgroundColor: Colors.primaryLight },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  card: { marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  cardSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  cardMeta: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  reviewText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginLeft: 4, flex: 1 },
  empty: { alignItems: 'center', marginTop: 64, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textSubtle },
});
