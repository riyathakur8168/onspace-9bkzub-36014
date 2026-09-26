import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_EARNINGS, EarningsEntry } from '@/services/mockData';

const PAYOUT_META: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Paid', color: Colors.success, bg: Colors.successLight },
  processing: { label: 'Processing', color: Colors.warning, bg: Colors.warningLight },
  pending: { label: 'Pending', color: Colors.info, bg: Colors.infoLight },
};

export default function WorkerEarnings() {
  const totalEarnings = MOCK_EARNINGS.reduce((s, e) => s + e.workerShare, 0);
  const totalCoopPool = MOCK_EARNINGS.reduce((s, e) => s + e.cooperativePool, 0);
  const totalServiceValue = MOCK_EARNINGS.reduce((s, e) => s + e.serviceValue, 0);

  const renderEntry = ({ item }: { item: EarningsEntry }) => {
    const meta = PAYOUT_META[item.payoutStatus];
    return (
      <View style={styles.entry}>
        <View style={styles.entryLeft}>
          <View style={styles.entryIcon}>
            <MaterialIcons name={item.serviceIcon as any} size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.entryTitle}>{item.serviceCategory} — {item.customerArea}</Text>
            <Text style={styles.entryRef}>{item.bookingRef} · {item.completedDate}</Text>
          </View>
        </View>
        <View style={styles.entryRight}>
          <Text style={styles.entryAmount}>₹{item.workerShare}</Text>
          <View style={[styles.payoutBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.payoutText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Earnings</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earned (This Month)</Text>
          <Text style={styles.summaryAmount}>₹{totalEarnings.toLocaleString('en-IN')}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemVal}>₹{totalServiceValue.toLocaleString('en-IN')}</Text>
              <Text style={styles.summaryItemLabel}>Gross Service Value</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemVal}>85%</Text>
              <Text style={styles.summaryItemLabel}>Your Share</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemVal}>₹{totalCoopPool.toLocaleString('en-IN')}</Text>
              <Text style={styles.summaryItemLabel}>Coop Pool</Text>
            </View>
          </View>
        </View>

        {/* Coop Pool Explainer */}
        <View style={styles.coopCard}>
          <Text style={styles.coopTitle}>Your 15% Cooperative Contribution</Text>
          <Text style={styles.coopAmount}>₹{totalCoopPool.toLocaleString('en-IN')}</Text>
          <View style={styles.coopItems}>
            {[
              { icon: 'school', label: 'Worker Training', pct: '35%' },
              { icon: 'verified-user', label: 'Safety & Verification', pct: '25%' },
              { icon: 'computer', label: 'Technology', pct: '25%' },
              { icon: 'favorite', label: 'Worker Welfare', pct: '15%' },
            ].map((item) => (
              <View key={item.label} style={styles.coopItem}>
                <MaterialIcons name={item.icon as any} size={14} color={Colors.primary} />
                <Text style={styles.coopItemLabel}>{item.label}</Text>
                <Text style={styles.coopItemPct}>{item.pct}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.entriesCard}>
          {MOCK_EARNINGS.map((entry, i) => (
            <React.Fragment key={entry.id}>
              {renderEntry({ item: entry })}
              {i < MOCK_EARNINGS.length - 1 && <View style={styles.entryDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Earnings Breakdown Note */}
        <View style={styles.breakdownNote}>
          <MaterialIcons name="info-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.breakdownNoteText}>
            Payouts are processed after a 24-hour dispute window. Contact support for any discrepancies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary, paddingTop: Spacing.md, marginBottom: Spacing.md },
  summaryCard: { backgroundColor: Colors.workerPrimary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  summaryLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryItemVal: { ...Typography.bodyLarge, fontWeight: '700', color: '#fff' },
  summaryItemLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  coopCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.sm },
  coopTitle: { ...Typography.label, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  coopAmount: { ...Typography.amountSmall, color: Colors.primary, marginBottom: Spacing.sm },
  coopItems: { gap: 8 },
  coopItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coopItemLabel: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  coopItemPct: { ...Typography.label, color: Colors.textMuted },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.textPrimary, marginBottom: Spacing.sm },
  entriesCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.sm },
  entry: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  entryIcon: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  entryTitle: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary },
  entryRef: { ...Typography.caption, color: Colors.textMuted },
  entryRight: { alignItems: 'flex-end', gap: 4 },
  entryAmount: { ...Typography.amountSmall, fontSize: 16, color: Colors.success },
  payoutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  payoutText: { ...Typography.caption, fontWeight: '600' },
  entryDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  breakdownNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, padding: Spacing.sm },
  breakdownNoteText: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
});
