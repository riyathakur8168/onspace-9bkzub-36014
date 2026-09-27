import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_JOB_OFFERS } from '@/services/mockData';
import { useAlert } from '@/template';

type FilterTab = 'offers' | 'scheduled' | 'history';

export default function WorkerJobs() {
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<FilterTab>('offers');

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'offers', label: 'Offers' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'history', label: 'History' },
  ];

  const historyJobs = [
    { id: 'j1', category: 'Electrical', sub: 'Fan Installation', date: '2026-09-20', earnings: 552, status: 'completed' },
    { id: 'j2', category: 'Electrical', sub: 'Wiring Inspection', date: '2026-09-15', earnings: 935, status: 'completed' },
    { id: 'j3', category: 'Electrical', sub: 'Panel Upgrade', date: '2026-09-10', earnings: 2040, status: 'completed' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, filter === t.key && styles.tabActive]} onPress={() => setFilter(t.key)}>
            <Text style={[styles.tabText, filter === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {filter === 'offers' && MOCK_JOB_OFFERS.map(offer => (
          <Card key={offer.id} style={{ marginBottom: Spacing.md }}>
            <View style={styles.offerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerTitle}>{offer.category} · {offer.subcategory}</Text>
                <Text style={styles.offerMeta}>{offer.customerArea} · {offer.scheduledDate}</Text>
                <Text style={styles.offerMeta}>{offer.scheduledTime}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.offerEarnings}>₹{offer.workerShare}</Text>
                <Text style={styles.earningsLabel}>you earn</Text>
              </View>
            </View>
            <View style={styles.allocationBox}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.primary} />
              <Text style={styles.allocationText}>{offer.allocationReason}</Text>
            </View>
            <View style={styles.offerBtns}>
              <TouchableOpacity style={styles.declineBtn} onPress={() => showAlert('Declined', 'Job declined and passed to next eligible worker.')}>
                <Text style={styles.declineTxt}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => showAlert('Accepted!', 'Navigate to customer. OTP required on arrival.')}>
                <Text style={styles.acceptTxt}>Accept</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {filter === 'scheduled' && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyText}>No scheduled jobs today</Text>
            <Text style={styles.emptySubtext}>Accept an offer to see it here</Text>
          </View>
        )}

        {filter === 'history' && historyJobs.map(job => (
          <Card key={job.id} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.histRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.histTitle}>{job.category} · {job.sub}</Text>
                <Text style={styles.histDate}>{job.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Badge label="Completed" variant="success" />
                <Text style={styles.histEarnings}>₹{job.earnings}</Text>
              </View>
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
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  tabActive: { backgroundColor: Colors.amberLight },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.amberDark, fontWeight: FontWeight.semibold },
  offerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  offerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  offerMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  offerEarnings: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  earningsLabel: { fontSize: FontSize.xs, color: Colors.textSubtle },
  allocationBox: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  allocationText: { fontSize: 11, color: Colors.primary, flex: 1, lineHeight: 17 },
  offerBtns: { flexDirection: 'row', gap: Spacing.sm },
  declineBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error, alignItems: 'center' },
  declineTxt: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.semibold },
  acceptBtn: { flex: 2, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  acceptTxt: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  histRow: { flexDirection: 'row', alignItems: 'center' },
  histTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  histDate: { fontSize: FontSize.xs, color: Colors.textSubtle },
  histEarnings: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  empty: { alignItems: 'center', marginTop: 64, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textSubtle },
});
