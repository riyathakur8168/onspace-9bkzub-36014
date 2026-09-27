import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_ADMIN_METRICS, MOCK_WORKERS } from '@/services/mockData';

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function AdminFairness() {
  const m = MOCK_ADMIN_METRICS;

  const workerDistribution = MOCK_WORKERS.map(w => ({
    name: w.name.split(' ')[0],
    jobs: w.recentJobCount,
    earnings: w.recentEarnings,
  })).sort((a, b) => b.jobs - a.jobs);

  const maxJobs = Math.max(...workerDistribution.map(w => w.jobs));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fairness Analytics</Text>
        <Text style={styles.headerSub}>7-day rolling window · Pilot zone</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {/* Health Score */}
        <Card style={styles.healthCard}>
          <View style={styles.healthTop}>
            <View>
              <Text style={styles.healthLabel}>Allocation Health</Text>
              <Text style={styles.healthScore}>Good</Text>
            </View>
            <View style={styles.healthIcon}>
              <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
            </View>
          </View>
          <Text style={styles.healthSub}>
            87% of eligible workers received at least one offer this week. Top 10% hold 28% of job value — within acceptable range.
          </Text>
        </Card>

        {/* Fairness KPIs */}
        <Card style={{ marginBottom: Spacing.md }}>
          <Text style={styles.sectionTitle}>Fairness KPIs</Text>
          {[
            { label: 'Worker offer rate (≥1 offer/week)', val: `${m.workerOfferRate}%`, target: '≥ 80%', ok: m.workerOfferRate >= 80 },
            { label: 'Avg jobs per active worker', val: m.avgJobsPerWorker.toFixed(1), target: '≥ 2.5', ok: m.avgJobsPerWorker >= 2.5 },
            { label: 'Top-10% job concentration', val: `${m.topConcentration}%`, target: '≤ 35%', ok: m.topConcentration <= 35 },
            { label: 'Active workers this week', val: `${m.activeWorkers}/${m.totalWorkers}`, target: '≥ 60%', ok: (m.activeWorkers / m.totalWorkers) >= 0.6 },
          ].map((kpi, i) => (
            <View key={i} style={[styles.kpiRow, i > 0 && styles.kpiBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiTarget}>Target: {kpi.target}</Text>
              </View>
              <View style={styles.kpiRight}>
                <Text style={[styles.kpiVal, { color: kpi.ok ? Colors.success : Colors.error }]}>{kpi.val}</Text>
                <Ionicons name={kpi.ok ? 'checkmark-circle' : 'close-circle'} size={18} color={kpi.ok ? Colors.success : Colors.error} />
              </View>
            </View>
          ))}
        </Card>

        {/* Job Distribution */}
        <Card style={{ marginBottom: Spacing.md }}>
          <Text style={styles.sectionTitle}>Job Distribution This Week</Text>
          {workerDistribution.map(w => (
            <BarRow key={w.name} label={w.name} value={w.jobs} max={maxJobs} color={Colors.primary} />
          ))}
        </Card>

        {/* Policy Info */}
        <Card style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            <Text style={styles.policyTitle}>Active Allocation Policy v1.0</Text>
          </View>
          <Text style={styles.policyDesc}>
            Workers are ranked by: Skill match → Availability → Distance → Reliability → Quality Gate → Opportunity Balance (recent jobs/earnings)
          </Text>
          {[
            { signal: 'Skill match', weight: 'Hard eligibility' },
            { signal: 'Availability', weight: 'Hard eligibility' },
            { signal: 'Distance / travel', weight: '15%' },
            { signal: 'Reliability score', weight: '20%' },
            { signal: 'Quality / rating', weight: '20%' },
            { signal: 'Opportunity balance', weight: '25%' },
            { signal: 'Response time', weight: '20%' },
          ].map((row, i) => (
            <View key={i} style={[styles.policyRow, i > 0 && styles.policyBorder]}>
              <Text style={styles.policySignal}>{row.signal}</Text>
              <Text style={styles.policyWeight}>{row.weight}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  healthCard: { backgroundColor: Colors.successLight, borderColor: Colors.success, marginBottom: Spacing.md },
  healthTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  healthLabel: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semibold },
  healthScore: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.success },
  healthIcon: {},
  healthSub: { fontSize: FontSize.sm, color: Colors.success, lineHeight: 20 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  kpiRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  kpiBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  kpiLabel: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 2 },
  kpiTarget: { fontSize: FontSize.xs, color: Colors.textSubtle },
  kpiRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kpiVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  barValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  barTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  policyCard: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary + '40' },
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  policyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  policyDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  policyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  policyBorder: { borderTopWidth: 1, borderTopColor: Colors.primary + '25' },
  policySignal: { fontSize: FontSize.sm, color: Colors.textSecondary },
  policyWeight: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
});
