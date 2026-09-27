import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_LEDGER } from '@/services/mockData';

export default function WorkerEarnings() {
  const totalEarned = MOCK_LEDGER.reduce((s, e) => s + e.workerShare, 0);
  const totalService = MOCK_LEDGER.reduce((s, e) => s + e.serviceValue, 0);
  const totalCoop = MOCK_LEDGER.reduce((s, e) => s + e.cooperativeContribution, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings Ledger</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sumMain}>
            <Text style={styles.sumLabel}>Total Earned</Text>
            <Text style={styles.sumVal}>₹{totalEarned.toLocaleString()}</Text>
            <Text style={styles.sumSub}>Your 85% share of service value</Text>
          </View>
          <View style={styles.sumRow}>
            <View style={styles.sumItem}>
              <Text style={styles.sumItemVal}>₹{totalService.toLocaleString()}</Text>
              <Text style={styles.sumItemLabel}>Gross Service Value</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={styles.sumItemVal}>₹{totalCoop.toLocaleString()}</Text>
              <Text style={styles.sumItemLabel}>Cooperative Pool (15%)</Text>
            </View>
          </View>
        </View>

        {/* Cooperative Pool Info */}
        <Card style={styles.coopCard}>
          <View style={styles.coopRow}>
            <View style={[styles.coopIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.coopTitle}>Your Cooperative Contribution: ₹{totalCoop}</Text>
              <Text style={styles.coopSub}>Reinvested into training, safety, tech and worker welfare</Text>
            </View>
          </View>
          {[
            { label: 'Worker Training', pct: '35%' },
            { label: 'Safety & Verification', pct: '25%' },
            { label: 'Technology & Support', pct: '25%' },
            { label: 'Worker Welfare Reserve', pct: '15%' },
          ].map((item, i) => (
            <View key={i} style={styles.coopBreakRow}>
              <Text style={styles.coopBreakLabel}>{item.label}</Text>
              <Text style={styles.coopBreakPct}>{item.pct}</Text>
            </View>
          ))}
        </Card>

        {/* Ledger Entries */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {MOCK_LEDGER.map(entry => (
          <Card key={entry.id} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.entryTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryTitle}>{entry.category} · {entry.subcategory}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.entryEarnings}>+₹{entry.workerShare}</Text>
                <Badge label={entry.status === 'paid' ? 'Paid' : 'Pending'} variant={entry.status === 'paid' ? 'success' : 'warning'} />
              </View>
            </View>
            <View style={styles.entryFooter}>
              <Text style={styles.entryMeta}>Service: ₹{entry.serviceValue}</Text>
              <Text style={styles.entryMeta}>Coop: ₹{entry.cooperativeContribution}</Text>
              {entry.payoutDate && <Text style={styles.entryMeta}>Paid: {entry.payoutDate}</Text>}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  summaryCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
  },
  sumMain: { alignItems: 'center', marginBottom: Spacing.lg },
  sumLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  sumVal: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white },
  sumSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sumRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.md, padding: Spacing.md },
  sumItem: { flex: 1, alignItems: 'center' },
  sumItemVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  sumItemLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 2 },
  sumDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: Spacing.sm },
  coopCard: { marginBottom: Spacing.lg },
  coopRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.md },
  coopIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  coopTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  coopSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  coopBreakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderTopWidth: 1, borderTopColor: Colors.border },
  coopBreakLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  coopBreakPct: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  entryTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs },
  entryTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  entryDate: { fontSize: FontSize.xs, color: Colors.textSubtle },
  entryEarnings: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  entryFooter: { flexDirection: 'row', gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.xs },
  entryMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
