import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_ADMIN_METRICS } from '@/services/mockData';

function MetricCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card style={[styles.metricCard, { borderTopWidth: 3, borderTopColor: color }]}>
      <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </Card>
  );
}

export default function AdminDashboard() {
  const m = MOCK_ADMIN_METRICS;

  const liveJobs = [
    { id: '1', worker: 'Suresh Patel', category: 'Electrical', status: 'En Route', area: 'Koramangala', eta: '12 min' },
    { id: '2', worker: 'Kavitha Rao', category: 'Cleaning', status: 'In Progress', area: 'Jayanagar', eta: '—' },
    { id: '3', worker: 'Rajesh Kumar', category: 'Plumbing', status: 'Arrived', area: 'Indiranagar', eta: '0 min' },
  ];

  const statusColor: Record<string, string> = {
    'En Route': Colors.info,
    'In Progress': Colors.amber,
    'Arrived': Colors.success,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>OnePlace Cooperative · Bangalore Pilot</Text>
        </LinearGradient>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard icon="flash" label="Active Jobs" value={String(m.totalActiveJobs)} color={Colors.amber} />
          <MetricCard icon="time" label="Pending KYC" value={String(m.pendingVerifications)} color={Colors.error} sub="Needs review" />
          <MetricCard icon="people" label="Workers" value={`${m.activeWorkers}/${m.totalWorkers}`} sub="Active/Total" color={Colors.primary} />
          <MetricCard icon="warning" label="Disputes" value={String(m.disputesPending)} color={Colors.error} sub="Open cases" />
        </View>

        {/* Weekly Stats */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <Card>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weekRow}>
              <View style={styles.weekItem}>
                <Text style={styles.weekVal}>₹{(m.weeklyGMV / 1000).toFixed(0)}K</Text>
                <Text style={styles.weekLabel}>Gross Service Value</Text>
              </View>
              <View style={styles.weekDivider} />
              <View style={styles.weekItem}>
                <Text style={styles.weekVal}>{m.weeklyJobsCompleted}</Text>
                <Text style={styles.weekLabel}>Jobs Completed</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Fairness Snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleOuter}>Fairness Snapshot</Text>
          <Card>
            {[
              { label: 'Workers receiving ≥1 offer/week', val: `${m.workerOfferRate}%`, good: m.workerOfferRate >= 80 },
              { label: 'Avg jobs per active worker', val: m.avgJobsPerWorker.toFixed(1), good: m.avgJobsPerWorker >= 2.5 },
              { label: 'Top 10% job concentration', val: `${m.topConcentration}%`, good: m.topConcentration <= 35 },
            ].map((item, i) => (
              <View key={i} style={[styles.fairRow, i > 0 && styles.fairBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fairLabel}>{item.label}</Text>
                </View>
                <View style={styles.fairRight}>
                  <Text style={[styles.fairVal, { color: item.good ? Colors.success : Colors.error }]}>{item.val}</Text>
                  <Ionicons name={item.good ? 'checkmark-circle' : 'warning'} size={16} color={item.good ? Colors.success : Colors.error} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Live Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleOuter}>Live Jobs</Text>
          {liveJobs.map(job => (
            <Card key={job.id} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.liveRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.liveWorker}>{job.worker}</Text>
                  <Text style={styles.liveCat}>{job.category} · {job.area}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor[job.status] + '20' }]}>
                    <Text style={[styles.statusTxt, { color: statusColor[job.status] }]}>{job.status}</Text>
                  </View>
                  {job.eta !== '—' && <Text style={styles.etaTxt}>ETA: {job.eta}</Text>}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.lg, paddingTop: -Spacing.md, gap: Spacing.sm, marginTop: -Spacing.lg },
  metricCard: { flex: 1, minWidth: '45%', alignItems: 'flex-start' },
  metricIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  metricVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  metricLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metricSub: { fontSize: FontSize.xs, color: Colors.textSubtle },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  sectionTitleOuter: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  weekRow: { flexDirection: 'row', alignItems: 'center' },
  weekItem: { flex: 1, alignItems: 'center' },
  weekVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  weekLabel: { fontSize: FontSize.xs, color: Colors.textSubtle, marginTop: 2 },
  weekDivider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  fairRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  fairBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  fairLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fairRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fairVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveWorker: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  liveCat: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusDot: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  statusTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  etaTxt: { fontSize: FontSize.xs, color: Colors.textSubtle },
});
