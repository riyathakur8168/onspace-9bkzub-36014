import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_WORKERS, Worker } from '@/services/mockData';
import { useAlert } from '@/template';

const FILTERS = ['All', 'Verified', 'Pending', 'Available'];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Verified', color: Colors.success, bg: Colors.successLight },
  pending: { label: 'KYC Pending', color: Colors.warning, bg: Colors.warningLight },
  rejected: { label: 'Rejected', color: Colors.error, bg: Colors.errorLight },
};

const AVAIL_META: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: Colors.success },
  busy: { label: 'Busy', color: Colors.warning },
  offline: { label: 'Offline', color: Colors.gray400 },
};

export default function AdminWorkers() {
  const [filter, setFilter] = useState('All');
  const { showAlert } = useAlert();

  const filtered = MOCK_WORKERS.filter((w) => {
    if (filter === 'All') return true;
    if (filter === 'Verified') return w.verificationStatus === 'verified';
    if (filter === 'Pending') return w.verificationStatus === 'pending';
    if (filter === 'Available') return w.availabilityStatus === 'available';
    return true;
  });

  const renderWorker = ({ item }: { item: Worker }) => {
    const vMeta = STATUS_META[item.verificationStatus];
    const aMeta = AVAIL_META[item.availabilityStatus];
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => showAlert(item.name, `Skills: ${item.skills.join(', ')}\nArea: ${item.serviceArea}\nJoined: ${item.joinedDate}`)}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{item.name}</Text>
            <Text style={styles.workerPhone}>{item.phone}</Text>
            <View style={styles.skillsRow}>
              {item.skills.map((s) => (
                <View key={s} style={styles.skillChip}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.verifBadge, { backgroundColor: vMeta.bg }]}>
            <Text style={[styles.verifyText, { color: vMeta.color }]}>{vMeta.label}</Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <View style={[styles.availDot, { backgroundColor: aMeta.color }]} />
            <Text style={[styles.metaText, { color: aMeta.color }]}>{aMeta.label}</Text>
          </View>
          {item.jobsCompleted > 0 ? (
            <>
              <Text style={styles.metaSep}>·</Text>
              <MaterialIcons name="star" size={13} color={Colors.accent} />
              <Text style={styles.metaText}>{item.rating}</Text>
              <Text style={styles.metaSep}>·</Text>
              <Text style={styles.metaText}>{item.jobsCompleted} jobs</Text>
              <Text style={styles.metaSep}>·</Text>
              <Text style={styles.metaText}>₹{item.recentEarnings.toLocaleString('en-IN')}/mo</Text>
            </>
          ) : (
            <Text style={styles.newWorker}>New worker</Text>
          )}
        </View>

        {item.verificationStatus === 'pending' && (
          <View style={styles.actionRow}>
            <Pressable style={styles.rejectBtn} onPress={() => showAlert('Reject', 'Worker verification rejected.')}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.approveBtn} onPress={() => showAlert('Approved', `${item.name} has been verified and activated.`)}>
              <MaterialIcons name="check" size={16} color="#fff" />
              <Text style={styles.approveBtnText}>Approve KYC</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Workers</Text>
        <Text style={styles.pageSub}>{MOCK_WORKERS.length} total · {MOCK_WORKERS.filter((w) => w.verificationStatus === 'pending').length} pending KYC</Text>
      </View>

      <View style={styles.filterBar}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderWorker}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary },
  pageSub: { ...Typography.bodySmall, color: Colors.textMuted },
  filterBar: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.adminPrimary, borderColor: Colors.adminPrimary },
  filterText: { ...Typography.label, color: Colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardPressed: { opacity: 0.88 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.adminPrimary + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.label, fontWeight: '700', color: Colors.adminPrimary },
  workerName: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  workerPhone: { ...Typography.caption, color: Colors.textMuted },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  skillChip: { backgroundColor: Colors.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  skillText: { ...Typography.caption, color: Colors.textSecondary },
  verifBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  verifyText: { ...Typography.caption, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  metaText: { ...Typography.caption, color: Colors.textSecondary },
  metaSep: { ...Typography.caption, color: Colors.textMuted },
  newWorker: { ...Typography.caption, color: Colors.textMuted, marginLeft: 4 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  rejectBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  rejectBtnText: { ...Typography.button, color: Colors.error },
  approveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.adminPrimary },
  approveBtnText: { ...Typography.button, color: '#fff' },
});
