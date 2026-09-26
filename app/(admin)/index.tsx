import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_BOOKINGS, MOCK_WORKERS } from '@/services/mockData';

const KPI_CARDS = [
  { label: 'Active Jobs', value: '3', icon: 'work', color: Colors.info, bg: Colors.infoLight },
  { label: 'Workers Online', value: '2', icon: 'person', color: Colors.success, bg: Colors.successLight },
  { label: 'Pending Verif.', value: '1', icon: 'pending', color: Colors.warning, bg: Colors.warningLight },
  { label: 'Today GMV', value: '₹1,280', icon: 'account-balance', color: Colors.adminPrimary, bg: Colors.adminPrimary + '15' },
];

const RECENT_EVENTS = [
  { icon: 'check-circle', color: Colors.success, text: 'Booking OP-2024-0847 confirmed — Suresh Patel assigned', time: '2 min ago' },
  { icon: 'person-add', color: Colors.info, text: 'New worker registration: Mohammed Rafi — KYC pending', time: '18 min ago' },
  { icon: 'payment', color: Colors.primary, text: 'Payout processed for OP-2024-0821 — ₹323 to Rajesh Kumar', time: '1 hr ago' },
  { icon: 'warning', color: Colors.warning, text: 'Booking OP-2024-0798 rated 4.0 — quality flag triggered', time: '3 hr ago' },
];

export default function AdminDashboard() {
  const activeBookings = MOCK_BOOKINGS.filter((b) => ['confirmed', 'en_route', 'in_progress'].includes(b.status));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Admin Dashboard</Text>
            <Text style={styles.pageSub}>OnePlace Operations · Bengaluru Pilot</Text>
          </View>
          <View style={styles.adminBadge}>
            <MaterialIcons name="admin-panel-settings" size={18} color={Colors.adminPrimary} />
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          {KPI_CARDS.map((k) => (
            <View key={k.label} style={[styles.kpiCard, { borderColor: k.color + '30' }]}>
              <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                <MaterialIcons name={k.icon as any} size={20} color={k.color} />
              </View>
              <Text style={styles.kpiValue}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Fairness Snapshot */}
        <View style={styles.fairnessCard}>
          <View style={styles.fairnessHeader}>
            <MaterialIcons name="balance" size={18} color={Colors.adminPrimary} />
            <Text style={styles.fairnessTitle}>Fairness Snapshot (This Week)</Text>
          </View>
          <View style={styles.fairnessMetrics}>
            {[
              { label: 'Workers with ≥1 offer', value: '3/4', good: true },
              { label: 'Top 10% job share', value: '42%', good: true },
              { label: 'Avg idle time', value: '2.1 days', good: true },
              { label: 'Acceptance rate', value: '78%', good: true },
            ].map((m) => (
              <View key={m.label} style={styles.fairnessMetric}>
                <MaterialIcons name={m.good ? 'check-circle' : 'warning'} size={14} color={m.good ? Colors.success : Colors.warning} />
                <Text style={styles.fairnessMetricLabel}>{m.label}</Text>
                <Text style={styles.fairnessMetricVal}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Active Bookings */}
        <Text style={styles.sectionTitle}>Active Bookings</Text>
        {activeBookings.map((b) => (
          <View key={b.id} style={styles.bookingRow}>
            <View style={styles.bookingIconWrap}>
              <MaterialIcons name={b.serviceIcon as any} size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingTitle}>{b.issueTitle}</Text>
              <Text style={styles.bookingMeta}>{b.bookingRef} · {b.workerName}</Text>
            </View>
            <View style={styles.bookingStatusDot} />
          </View>
        ))}

        {/* Activity Feed */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.feedCard}>
          {RECENT_EVENTS.map((e, i) => (
            <React.Fragment key={i}>
              <View style={styles.feedRow}>
                <MaterialIcons name={e.icon as any} size={16} color={e.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedText}>{e.text}</Text>
                  <Text style={styles.feedTime}>{e.time}</Text>
                </View>
              </View>
              {i < RECENT_EVENTS.length - 1 && <View style={styles.feedDivider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary },
  pageSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  adminBadge: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.adminPrimary + '15', alignItems: 'center', justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { width: '47.5%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, ...Shadow.sm, gap: 4 },
  kpiIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  kpiValue: { ...Typography.amountSmall, color: Colors.textPrimary },
  kpiLabel: { ...Typography.caption, color: Colors.textMuted },
  fairnessCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.adminPrimary + '30', ...Shadow.sm, marginBottom: Spacing.md },
  fairnessHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  fairnessTitle: { ...Typography.label, fontWeight: '700', color: Colors.textPrimary },
  fairnessMetrics: { gap: 8 },
  fairnessMetric: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fairnessMetricLabel: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  fairnessMetricVal: { ...Typography.label, fontWeight: '700', color: Colors.textPrimary },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xs, ...Shadow.sm },
  bookingIconWrap: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  bookingTitle: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary },
  bookingMeta: { ...Typography.caption, color: Colors.textMuted },
  bookingStatusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  feedCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.md },
  feedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md },
  feedText: { ...Typography.bodySmall, color: Colors.textPrimary, lineHeight: 18 },
  feedTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 3 },
  feedDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
});
