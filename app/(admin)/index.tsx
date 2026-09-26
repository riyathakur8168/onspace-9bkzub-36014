import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/hooks/useApp';
import { MOCK_ADMIN_STATS } from '@/services/mockData';

const STAT_CARDS = [
  { label: 'Live Jobs', key: 'liveJobs', icon: 'bolt', color: Colors.warning },
  { label: "Today's Bookings", key: 'todayBookings', icon: 'calendar-today', color: Colors.info },
  { label: "Today's GMV", key: 'todayGMV', icon: 'currency-rupee', color: Colors.success, prefix: '₹' },
  { label: 'Active Workers', key: 'activeWorkers', icon: 'groups', color: Colors.primary },
  { label: 'Pending Verify', key: 'pendingVerifications', icon: 'verified-user', color: Colors.warning },
  { label: 'Open Disputes', key: 'disputesOpen', icon: 'report-problem', color: Colors.error },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, workersList, approveWorkerVerification, rejectWorkerVerification } = useApp();
  const [showSecondaryContent, setShowSecondaryContent] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSecondaryContent(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const pendingWorkers = workersList.filter(w => w.verificationStatus === 'pending');
  const activeWorkersCount = workersList.filter(w => w.verificationStatus === 'verified' && w.availabilityStatus).length;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Admin Console</Text>
          <Text style={styles.title}>OnePlace Ops</Text>
        </View>
        <Pressable
          onPress={() => {
            logout();
            router.replace('/auth/login');
          }}
          style={styles.logoutBtn}
          accessibilityLabel="Logout"
        >
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Fairness score banner */}
      <View style={styles.fairnessBanner}>
        <View style={styles.fairnessLeft}>
          <MaterialIcons name="balance" size={20} color="#fff" />
          <View style={{ marginLeft: Spacing[3] }}>
            <Text style={styles.fairnessLabel}>Weekly Fairness Score</Text>
            <Text style={styles.fairnessScore}>{MOCK_ADMIN_STATS.weeklyFairnessScore} / 100</Text>
          </View>
        </View>
        <View>
          <Text style={styles.fairnessSub}>Top 10% share</Text>
          <Text style={styles.fairnessDetail}>{MOCK_ADMIN_STATS.topWorkerShareOfJobs}% of jobs</Text>
        </View>
      </View>

      {/* Stat grid */}
      <View style={styles.statGrid}>
        {STAT_CARDS.map(stat => {
          let val = (MOCK_ADMIN_STATS as any)[stat.key];
          if (stat.key === 'pendingVerifications') val = pendingWorkers.length;
          if (stat.key === 'activeWorkers') val = activeWorkersCount || MOCK_ADMIN_STATS.activeWorkers;
          return (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '18' }]}>
                <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.prefix || ''}{typeof val === 'number' && val > 1000 ? val.toLocaleString() : val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Live jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Jobs</Text>
          <View style={styles.liveDot} />
        </View>
        {[
          { worker: 'Rajesh K.', service: 'Plumbing', area: 'Koramangala', status: 'started', value: 800 },
          { worker: 'Suresh P.', service: 'Electrical', area: 'Indiranagar', status: 'en_route', value: 600 },
          { worker: 'Vikram S.', service: 'AC Service', area: 'HSR Layout', status: 'accepted', value: 950 },
        ].map((job, i) => (
          <View key={i} style={styles.liveCard}>
            <View style={styles.liveLeft}>
              <Text style={styles.liveWorker}>{job.worker}</Text>
              <Text style={styles.liveMeta}>{job.service} · {job.area}</Text>
            </View>
            <View style={styles.liveRight}>
              <Badge
                label={job.status === 'started' ? 'In Progress' : job.status === 'en_route' ? 'En Route' : 'Accepted'}
                variant={job.status === 'started' ? 'warning' : 'info'}
                size="sm"
              />
              <Text style={styles.liveValue}>₹{job.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pending verifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verification Queue</Text>
          <Badge label={`${pendingWorkers.length} pending`} variant="warning" size="sm" />
        </View>
        {pendingWorkers.length === 0 ? (
          <View style={styles.emptyVerifyCard}>
            <MaterialIcons name="check-circle" size={24} color={Colors.success} />
            <Text style={styles.emptyVerifyText}>All worker verifications up to date!</Text>
          </View>
        ) : (
          pendingWorkers.map((w) => (
            <View key={w.id} style={styles.verifyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyName}>{w.name}</Text>
                <Text style={styles.verifyMeta}>{w.skills.join(', ')} · {w.serviceArea}</Text>
              </View>
              <View style={styles.verifyActions}>
                <Pressable
                  style={styles.rejectBtn}
                  onPress={() => {
                    rejectWorkerVerification(w.id);
                    Alert.alert('Verification Rejected', `${w.name}'s verification request has been rejected.`);
                  }}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
                <Pressable
                  style={styles.approveBtn}
                  onPress={() => {
                    approveWorkerVerification(w.id);
                    Alert.alert('Worker Approved', `${w.name} is now verified and active.`);
                  }}
                >
                  <Text style={styles.approveText}>Approve</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick actions */}
      {showSecondaryContent && (
        <View style={styles.actionsGrid}>
          {[
            { icon: 'analytics', label: 'Analytics', color: Colors.info, action: () => router.push('/(admin)/fairness') },
            { icon: 'gavel', label: 'Disputes', color: Colors.error, action: () => Alert.alert('Dispute Resolution', '0 unresolved disputes found in active queue.') },
            { icon: 'school', label: 'Training', color: Colors.primary, action: () => Alert.alert('Cooperative Training', 'Cooperative training modules updated for Q3.') },
            { icon: 'account-balance', label: 'Ledger', color: Colors.success, action: () => Alert.alert('Cooperative Ledger', 'Platform allocation pool: ₹42,800 total.') },
          ].map(act => (
            <Pressable
              key={act.label}
              style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }]}
              onPress={act.action}
            >
              <MaterialIcons name={act.icon as any} size={24} color={act.color} />
              <Text style={styles.actionLabel}>{act.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
  },
  label: { fontSize: Typography.sm, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
    borderRadius: Radius.md, backgroundColor: Colors.errorLight,
    borderWidth: 1, borderColor: Colors.errorLight,
  },
  logoutText: { fontSize: Typography.xs, color: Colors.error, fontWeight: Typography.semibold },
  emptyVerifyCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[4], marginBottom: Spacing[2], ...Shadow.sm,
  },
  emptyVerifyText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  fairnessBanner: {
    backgroundColor: Colors.adminColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[4], marginBottom: Spacing[4],
  },
  fairnessLeft: { flexDirection: 'row', alignItems: 'center' },
  fairnessLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.75)' },
  fairnessScore: { fontSize: Typography.xl, fontWeight: Typography.bold, color: '#fff' },
  fairnessSub: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  fairnessDetail: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: '#fff', textAlign: 'right' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing[5], gap: Spacing[2], marginBottom: Spacing[5] },
  statCard: {
    width: '31.5%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[3], alignItems: 'flex-start', ...Shadow.sm,
  },
  statIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[2] },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[5] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  liveCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[3], marginBottom: Spacing[2], ...Shadow.sm,
  },
  liveLeft: {},
  liveWorker: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  liveMeta: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  liveRight: { alignItems: 'flex-end', gap: 4 },
  liveValue: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  verifyCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[3], marginBottom: Spacing[2], ...Shadow.sm,
  },
  verifyName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  verifyMeta: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  verifyActions: { flexDirection: 'row', gap: Spacing[2] },
  rejectBtn: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error },
  rejectText: { fontSize: Typography.xs, color: Colors.error, fontWeight: Typography.semibold },
  approveBtn: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: Radius.md, backgroundColor: Colors.primary },
  approveText: { fontSize: Typography.xs, color: '#fff', fontWeight: Typography.semibold },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing[5], gap: Spacing[2] },
  actionCard: {
    width: '22.5%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[3], alignItems: 'center', gap: Spacing[1], ...Shadow.sm,
  },
  actionLabel: { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.textSecondary, textAlign: 'center' },
});
