import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';

const DISTRIBUTION_DATA = [
  { name: 'Suresh Patel', pct: 38, earnings: 18450, jobs: 12 },
  { name: 'Rajesh Kumar', pct: 29, earnings: 12300, jobs: 9 },
  { name: 'Anand Sharma', pct: 24, earnings: 9870, jobs: 7 },
  { name: 'Mohammed Rafi', pct: 9, earnings: 0, jobs: 0 },
];

const POLICY_SIGNALS = [
  { label: 'Skill Match', weight: 'Hard eligibility requirement', icon: 'build', type: 'hard' },
  { label: 'Availability', weight: 'Hard eligibility requirement', icon: 'schedule', type: 'hard' },
  { label: 'Distance / Route', weight: '20% weight', icon: 'location-on', type: 'soft' },
  { label: 'Recent Workload', weight: '25% weight (negative)', icon: 'trending-down', type: 'balance' },
  { label: 'Reliability', weight: '20% weight', icon: 'thumb-up', type: 'soft' },
  { label: 'Quality / Rating', weight: 'Min threshold + 15% weight', icon: 'star', type: 'soft' },
  { label: 'Response Time', weight: '10% weight', icon: 'timer', type: 'soft' },
  { label: 'Training / Cert.', weight: 'Category eligibility / 10% weight', icon: 'school', type: 'soft' },
];

export default function AdminFairness() {
  const topWorkerShare = DISTRIBUTION_DATA[0].pct;
  const workersWithOffers = DISTRIBUTION_DATA.filter((w) => w.jobs > 0).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Fairness Analytics</Text>
        <Text style={styles.pageSub}>Allocation policy v1.0 · Rolling 7-day window</Text>

        {/* Health Indicators */}
        <View style={styles.healthGrid}>
          {[
            { label: 'Workers w/ offers', value: `${workersWithOffers}/${DISTRIBUTION_DATA.length}`, status: 'ok', icon: 'people' },
            { label: 'Top 10% job share', value: `${topWorkerShare}%`, status: topWorkerShare > 50 ? 'warn' : 'ok', icon: 'bar-chart' },
            { label: 'Earnings Gini', value: '0.31', status: 'ok', icon: 'balance' },
            { label: 'Acceptance rate', value: '78%', status: 'ok', icon: 'check-circle' },
          ].map((h) => (
            <View key={h.label} style={[styles.healthCard, { borderColor: h.status === 'ok' ? Colors.success + '30' : Colors.warning + '30' }]}>
              <MaterialIcons name={h.icon as any} size={18} color={h.status === 'ok' ? Colors.success : Colors.warning} />
              <Text style={styles.healthVal}>{h.value}</Text>
              <Text style={styles.healthLabel}>{h.label}</Text>
            </View>
          ))}
        </View>

        {/* Job Distribution */}
        <Text style={styles.sectionTitle}>Job Distribution by Worker</Text>
        <View style={styles.distCard}>
          {DISTRIBUTION_DATA.map((w) => (
            <View key={w.name} style={styles.distRow}>
              <View style={styles.distAvatar}>
                <Text style={styles.distAvatarText}>{w.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.distNameRow}>
                  <Text style={styles.distName}>{w.name}</Text>
                  <Text style={styles.distPct}>{w.pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${w.pct}%`, backgroundColor: w.pct > 35 ? Colors.warning : Colors.primary }]} />
                </View>
                <Text style={styles.distMeta}>{w.jobs} jobs · ₹{w.earnings.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Allocation Policy */}
        <Text style={styles.sectionTitle}>Current Allocation Policy v1.0</Text>
        <View style={styles.policyCard}>
          {POLICY_SIGNALS.map((s) => (
            <View key={s.label} style={styles.policyRow}>
              <MaterialIcons name={s.icon as any} size={16} color={s.type === 'hard' ? Colors.info : s.type === 'balance' ? Colors.adminPrimary : Colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.policyLabel}>{s.label}</Text>
                <Text style={styles.policyWeight}>{s.weight}</Text>
              </View>
              <View style={[styles.policyTypeBadge, {
                backgroundColor: s.type === 'hard' ? Colors.infoLight : s.type === 'balance' ? Colors.adminPrimary + '15' : Colors.surfaceAlt
              }]}>
                <Text style={[styles.policyTypeText, {
                  color: s.type === 'hard' ? Colors.info : s.type === 'balance' ? Colors.adminPrimary : Colors.textMuted
                }]}>
                  {s.type === 'hard' ? 'Required' : s.type === 'balance' ? 'Fairness' : 'Quality'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Principle */}
        <View style={styles.principleCard}>
          <MaterialIcons name="info-outline" size={16} color={Colors.adminPrimary} />
          <Text style={styles.principleText}>
            The allocation policy ensures every eligible, available and appropriately skilled worker gets fair access to demand. Quality and customer safety constraints are non-negotiable and override opportunity balancing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary, paddingTop: Spacing.md },
  pageSub: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.md },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  healthCard: { width: '47.5%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, ...Shadow.sm, alignItems: 'center', gap: 4 },
  healthVal: { ...Typography.amountSmall, fontSize: 20, color: Colors.textPrimary },
  healthLabel: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.textPrimary, marginBottom: Spacing.sm },
  distCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.md, gap: Spacing.md },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  distAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.adminPrimary + '15', alignItems: 'center', justifyContent: 'center' },
  distAvatarText: { ...Typography.caption, fontWeight: '700', color: Colors.adminPrimary },
  distNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  distName: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary },
  distPct: { ...Typography.label, fontWeight: '700', color: Colors.textPrimary },
  barTrack: { height: 6, backgroundColor: Colors.gray200, borderRadius: 3, marginBottom: 3 },
  barFill: { height: 6, borderRadius: 3 },
  distMeta: { ...Typography.caption, color: Colors.textMuted },
  policyCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.md },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  policyLabel: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary },
  policyWeight: { ...Typography.caption, color: Colors.textMuted },
  policyTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  policyTypeText: { ...Typography.caption, fontWeight: '600' },
  principleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.adminPrimary + '10', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.adminPrimary + '20' },
  principleText: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
});
