import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_WORKERS } from '@/services/mockData';
import { useAlert } from '@/template';

type FilterTab = 'all' | 'verified' | 'pending';

export default function AdminWorkers() {
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = MOCK_WORKERS.filter(w => {
    if (filter === 'verified') return w.verificationStatus === 'verified';
    if (filter === 'pending') return w.verificationStatus === 'pending';
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'verified', label: 'Verified' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workers</Text>
        <Text style={styles.headerSub}>{MOCK_WORKERS.length} total workers</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, filter === t.key && styles.tabActive]} onPress={() => setFilter(t.key)}>
            <Text style={[styles.tabText, filter === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {filtered.map(worker => (
          <Card key={worker.id} style={{ marginBottom: Spacing.md }}>
            <View style={styles.workerRow}>
              <Image source={{ uri: worker.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Badge
                    label={worker.verificationStatus === 'verified' ? 'Verified' : worker.verificationStatus === 'pending' ? 'Pending' : 'Rejected'}
                    variant={worker.verificationStatus === 'verified' ? 'success' : worker.verificationStatus === 'pending' ? 'warning' : 'error'}
                  />
                </View>
                <Text style={styles.workerSkills}>{worker.skills.slice(0, 2).join(', ')}</Text>
                <Text style={styles.workerArea}>{worker.serviceArea}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{worker.completedJobs}</Text>
                <Text style={styles.statLabel}>Jobs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{worker.rating} ⭐</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{worker.recentJobCount}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: worker.isAvailable ? Colors.success : Colors.textSubtle }]}>
                  {worker.isAvailable ? 'Active' : 'Offline'}
                </Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
            {worker.verificationStatus === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => showAlert('Worker Approved', `${worker.name} has been verified and activated.`)}
                >
                  <Ionicons name="checkmark-outline" size={16} color={Colors.white} />
                  <Text style={styles.approveTxt}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => showAlert('Worker Rejected', `${worker.name}'s verification has been rejected. They will be notified.`)}
                >
                  <Text style={styles.rejectTxt}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
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
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  tabActive: { backgroundColor: '#EDE9FE' },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabTextActive: { color: '#7C3AED', fontWeight: FontWeight.semibold },
  workerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  workerName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  workerSkills: { fontSize: FontSize.sm, color: Colors.textSecondary },
  workerArea: { fontSize: FontSize.xs, color: Colors.textSubtle },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textSubtle },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  approveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.success },
  approveTxt: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  rejectBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error },
  rejectTxt: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.semibold },
});
