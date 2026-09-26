import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { MOCK_ADMIN_ALLOCATION, MOCK_ADMIN_STATS } from '@/services/mockData';
import { useApp } from '@/hooks/useApp';

export default function AdminFairness() {
  const insets = useSafeAreaInsets();
  const { activeDispatchSession, matchingWeights, updateMatchingWeights } = useApp();

  const maxJobs = Math.max(...MOCK_ADMIN_ALLOCATION.map(w => w.jobs));

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fairness Analytics</Text>
        <Text style={styles.sub}>Dynamic matching & allocation distribution</Text>
      </View>

      {/* Overall score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreLabel}>Overall Fairness Score</Text>
          <Text style={styles.scoreValue}>{MOCK_ADMIN_STATS.weeklyFairnessScore}</Text>
          <Text style={styles.scoreSub}>out of 100 · Optimal Distribution</Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreCircleText}>{MOCK_ADMIN_STATS.weeklyFairnessScore}%</Text>
        </View>
      </View>

      {/* Key metrics */}
      <View style={styles.metricsRow}>
        {[
          { label: 'Workers with ≥1 offer', value: '94%', icon: 'check-circle', good: true },
          { label: 'Top 10% job share', value: `${MOCK_ADMIN_STATS.topWorkerShareOfJobs}%`, icon: 'warning', good: false },
          { label: 'Acceptance rate', value: '78%', icon: 'thumb-up', good: true },
        ].map(m => (
          <View key={m.label} style={styles.metricCard}>
            <MaterialIcons name={m.icon as any} size={16} color={m.good ? Colors.success : Colors.warning} />
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Real-time Dispatch Audit Log */}
      {activeDispatchSession && (
        <View style={styles.card}>
          <View style={styles.sessionHeader}>
            <MaterialIcons name="radar" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Live Dispatch Engine Log</Text>
          </View>
          <Text style={styles.cardSub}>Request ID: {activeDispatchSession.requestId} ({activeDispatchSession.request.serviceLabel})</Text>

          <View style={styles.logContainer}>
            {activeDispatchSession.logs.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={styles.logText}>{log}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dispatchStatusBadge}>
            <Text style={styles.dispatchStatusText}>
              STATUS: {activeDispatchSession.status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {/* Dynamic Weight Tuning */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dynamic Matching Weights</Text>
        <Text style={styles.cardSub}>Adjust fairness engine signals in real-time</Text>

        {[
          { key: 'earningsEquity', label: 'Earnings Equity Weight', val: matchingWeights.earningsEquity, color: Colors.primary },
          { key: 'proximity', label: 'Proximity Distance Weight', val: matchingWeights.proximity, color: Colors.customerColor },
          { key: 'workloadEquity', label: 'Workload Equity Weight', val: matchingWeights.workloadEquity, color: Colors.workerColor },
          { key: 'recency', label: 'Opportunity Recency Weight', val: matchingWeights.recency, color: Colors.adminColor },
        ].map(item => (
          <View key={item.key} style={styles.weightRow}>
            <Text style={styles.weightLabel}>{item.label}</Text>
            <View style={styles.weightControls}>
              <Pressable
                style={styles.weightBtn}
                onPress={() => updateMatchingWeights({ [item.key]: Math.max(0.05, Number((item.val - 0.05).toFixed(2))) })}
              >
                <Text style={styles.weightBtnText}>-</Text>
              </Pressable>
              <Text style={[styles.weightValText, { color: item.color }]}>{Math.round(item.val * 100)}%</Text>
              <Pressable
                style={styles.weightBtn}
                onPress={() => updateMatchingWeights({ [item.key]: Math.min(0.80, Number((item.val + 0.05).toFixed(2))) })}
              >
                <Text style={styles.weightBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Distribution chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Job Distribution This Week</Text>
        <Text style={styles.cardSub}>Top 5 workers by job count</Text>
        {MOCK_ADMIN_ALLOCATION.map((worker) => (
          <View key={worker.worker} style={styles.distRow}>
            <Text style={styles.distName}>{worker.worker}</Text>
            <View style={styles.distBarWrap}>
              <View style={[styles.distBar, { width: `${(worker.jobs / maxJobs) * 100}%` as any, backgroundColor: Colors.primary }]} />
            </View>
            <Text style={styles.distJobs}>{worker.jobs}</Text>
            <Text style={styles.distEarnings}>₹{worker.earnings.toLocaleString()}</Text>
            <View style={[styles.fairnessPill, { backgroundColor: worker.fairnessIndex > 0.85 ? Colors.successLight : Colors.warningLight }]}>
              <Text style={[styles.fairnessPillText, { color: worker.fairnessIndex > 0.85 ? Colors.success : Colors.accentDark }]}>
                {Math.round(worker.fairnessIndex * 100)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Transparency note */}
      <View style={styles.transparencyCard}>
        <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
        <Text style={styles.transparencyText}>
          Every allocation decision is stored with policy version, candidate features, score and reason codes. Workers can view their allocation explanation in the app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  sub: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },
  scoreCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.adminColor, marginHorizontal: Spacing[5],
    borderRadius: Radius.xl, padding: Spacing[5], marginBottom: Spacing[4],
  },
  scoreLeft: {},
  scoreLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.75)' },
  scoreValue: { fontSize: 48, fontWeight: Typography.bold, color: '#fff' },
  scoreSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.65)' },
  scoreCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreCircleText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#fff' },
  metricsRow: { flexDirection: 'row', gap: Spacing[2], paddingHorizontal: Spacing[5], marginBottom: Spacing[4] },
  metricCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[3], alignItems: 'center', gap: Spacing[1], ...Shadow.sm },
  metricValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  metricLabel: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'center' },
  card: { backgroundColor: Colors.surface, marginHorizontal: Spacing[5], borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[4], ...Shadow.sm },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  cardSub: { fontSize: Typography.sm, color: Colors.textTertiary, marginBottom: Spacing[3] },
  logContainer: { backgroundColor: Colors.surfaceTinted, padding: Spacing[3], borderRadius: Radius.md, gap: 6, marginBottom: Spacing[2] },
  logRow: {},
  logText: { fontSize: Typography.xs, color: Colors.textSecondary, fontFamily: 'monospace' },
  dispatchStatusBadge: { backgroundColor: Colors.primaryLight, alignSelf: 'flex-start', paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: Radius.sm },
  dispatchStatusText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  weightLabel: { fontSize: Typography.sm, color: Colors.textPrimary },
  weightControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  weightBtn: { width: 28, height: 28, borderRadius: Radius.full, backgroundColor: Colors.surfaceTinted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  weightBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  weightValText: { fontSize: Typography.sm, fontWeight: Typography.bold, width: 36, textAlign: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  distName: { width: 72, fontSize: Typography.xs, color: Colors.textSecondary },
  distBarWrap: { flex: 1, height: 8, backgroundColor: Colors.divider, borderRadius: Radius.full, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: Radius.full },
  distJobs: { width: 24, fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'right' },
  distEarnings: { width: 60, fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right' },
  fairnessPill: { width: 32, height: 20, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  fairnessPillText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  transparencyCard: {
    flexDirection: 'row', gap: Spacing[2], alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[4],
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  transparencyText: { flex: 1, fontSize: Typography.sm, color: Colors.primary, lineHeight: 20 },
});
