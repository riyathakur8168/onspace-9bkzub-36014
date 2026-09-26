import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/hooks/useApp';
import { MOCK_EARNINGS, MOCK_WORKERS } from '@/services/mockData';
import { POOL_ALLOCATION } from '@/constants/config';

export default function WorkerEarnings() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const worker = MOCK_WORKERS[0];

  const totalGross = MOCK_EARNINGS.reduce((s, e) => s + e.grossServiceValue, 0);
  const totalNet = MOCK_EARNINGS.reduce((s, e) => s + e.netPayout, 0);
  const totalCoop = MOCK_EARNINGS.reduce((s, e) => s + e.cooperativeContribution, 0);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
      </View>

      {/* Total summary */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Earned (This Month)</Text>
        <Text style={styles.heroAmount}>₹{totalNet.toLocaleString()}</Text>
        <Text style={styles.heroSub}>from ₹{totalGross.toLocaleString()} gross service value</Text>
        <View style={styles.heroSplit}>
          <View style={styles.heroSplitItem}>
            <Text style={styles.heroSplitValue}>₹{totalGross.toLocaleString()}</Text>
            <Text style={styles.heroSplitLabel}>Gross Value</Text>
          </View>
          <View style={styles.heroSplitDivider} />
          <View style={styles.heroSplitItem}>
            <Text style={styles.heroSplitValue}>₹{totalNet.toLocaleString()}</Text>
            <Text style={styles.heroSplitLabel}>Net Payout</Text>
          </View>
          <View style={styles.heroSplitDivider} />
          <View style={styles.heroSplitItem}>
            <Text style={styles.heroSplitValue}>{MOCK_EARNINGS.length}</Text>
            <Text style={styles.heroSplitLabel}>Jobs Done</Text>
          </View>
        </View>
      </View>

      {/* Payout status */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutLeft}>
          <MaterialIcons name="account-balance" size={20} color={Colors.primary} />
          <View style={{ marginLeft: Spacing[2] }}>
            <Text style={styles.payoutLabel}>Next Payout</Text>
            <Text style={styles.payoutAmount}>₹{Math.round(totalNet * 0.6).toLocaleString()}</Text>
          </View>
        </View>
        <Badge label="Processing" variant="warning" />
      </View>

      {/* Cooperative pool breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Cooperative Contribution</Text>
        <Text style={styles.cardSubtitle}>₹{totalCoop.toLocaleString()} this month — reinvested into the cooperative</Text>
        {Object.entries(POOL_ALLOCATION).map(([key, pct]) => (
          <View key={key} style={styles.poolRow}>
            <Text style={styles.poolLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <View style={styles.poolBar}>
              <View style={[styles.poolBarFill, { width: `${pct * 100}%` as any }]} />
            </View>
            <Text style={styles.poolPct}>{Math.round(pct * 100)}%</Text>
          </View>
        ))}
      </View>

      {/* Fairness / Allocation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Allocation & Fairness</Text>
        <View style={styles.fairRow}>
          <MaterialIcons name="balance" size={16} color={Colors.primary} />
          <Text style={styles.fairLabel}>Your allocation score</Text>
          <Text style={styles.fairValue}>87 / 100</Text>
        </View>
        <View style={styles.fairRow}>
          <MaterialIcons name="trending-up" size={16} color={Colors.success} />
          <Text style={styles.fairLabel}>Jobs this week</Text>
          <Text style={styles.fairValue}>4</Text>
        </View>
        <View style={styles.fairRow}>
          <MaterialIcons name="group" size={16} color={Colors.textTertiary} />
          <Text style={styles.fairLabel}>Median in your area</Text>
          <Text style={styles.fairValue}>5 jobs/week</Text>
        </View>
        <View style={styles.fairBox}>
          <Text style={styles.fairBoxText}>
            Lower recent workload increases your allocation priority. Your score means you will receive offers before others with similar skills and higher recent activity.
          </Text>
        </View>
      </View>

      {/* Transaction history */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {MOCK_EARNINGS.map(entry => (
          <View key={entry.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={styles.txIconWrap}>
                <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.txLabel}>{entry.serviceLabel}</Text>
                <Text style={styles.txCustomer}>{entry.customerName} · {entry.date}</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>+₹{entry.workerShare}</Text>
              <Badge
                label={entry.status === 'settled' ? 'Paid' : 'Pending'}
                variant={entry.status === 'settled' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  heroCard: {
    backgroundColor: Colors.primary, marginHorizontal: Spacing[5],
    borderRadius: Radius.xl, padding: Spacing[5], marginBottom: Spacing[4],
  },
  heroLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.75)' },
  heroAmount: { fontSize: 40, fontWeight: Typography.bold, color: '#fff', marginVertical: Spacing[1] },
  heroSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.65)', marginBottom: Spacing[4] },
  heroSplit: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.md, padding: Spacing[3] },
  heroSplitItem: { flex: 1, alignItems: 'center' },
  heroSplitValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#fff' },
  heroSplitLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  heroSplitDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing[2] },
  payoutCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[4], ...Shadow.sm,
  },
  payoutLeft: { flexDirection: 'row', alignItems: 'center' },
  payoutLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  payoutAmount: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[4], ...Shadow.sm,
  },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing[3] },
  poolRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  poolLabel: { fontSize: Typography.sm, color: Colors.textSecondary, width: 80 },
  poolBar: { flex: 1, height: 6, backgroundColor: Colors.divider, borderRadius: Radius.full, overflow: 'hidden' },
  poolBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  poolPct: { fontSize: Typography.xs, color: Colors.textTertiary, width: 30, textAlign: 'right' },
  fairRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  fairLabel: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },
  fairValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  fairBox: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing[3], marginTop: Spacing[3] },
  fairBoxText: { fontSize: Typography.xs, color: Colors.primary, lineHeight: 18 },
  section: { paddingHorizontal: Spacing[5] },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  txCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[3], marginBottom: Spacing[2], ...Shadow.sm,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  txIconWrap: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  txLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  txCustomer: { fontSize: Typography.xs, color: Colors.textTertiary },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.success },
});
