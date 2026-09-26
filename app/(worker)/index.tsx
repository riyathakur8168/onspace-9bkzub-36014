import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { MOCK_JOB_OFFERS, MOCK_EARNINGS } from '@/services/mockData';

export default function WorkerHome() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [isAvailable, setIsAvailable] = useState(true);

  const pendingOffers = MOCK_JOB_OFFERS.filter((j) => j.status === 'pending');
  const todayEarnings = MOCK_EARNINGS.reduce((sum, e) => {
    if (e.completedDate === '26 Sep 2024') return sum + e.workerShare;
    return sum;
  }, 0);
  const weekEarnings = MOCK_EARNINGS.reduce((sum, e) => sum + e.workerShare, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser?.name?.split(' ')[0]}</Text>
            <Text style={styles.greetingSub}>Ready to earn today?</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textSecondary} />
            {pendingOffers.length > 0 && <View style={styles.notifDot} />}
          </Pressable>
        </View>

        {/* Availability Toggle */}
        <View style={[styles.availCard, { borderColor: isAvailable ? Colors.success + '60' : Colors.border }]}>
          <View style={styles.availLeft}>
            <View style={[styles.availDot, { backgroundColor: isAvailable ? Colors.success : Colors.gray400 }]} />
            <View>
              <Text style={styles.availTitle}>{isAvailable ? 'Available for Jobs' : 'Offline'}</Text>
              <Text style={styles.availSub}>{isAvailable ? 'You will receive job offers' : 'Toggle on to start receiving offers'}</Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: Colors.gray200, true: Colors.success + '60' }}
            thumbColor={isAvailable ? Colors.success : Colors.gray400}
          />
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsSectionTitle}>This Week</Text>
          <Text style={styles.earningsAmount}>₹{weekEarnings.toLocaleString('en-IN')}</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>{MOCK_EARNINGS.length}</Text>
              <Text style={styles.earningsItemLabel}>Jobs done</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>85%</Text>
              <Text style={styles.earningsItemLabel}>Your share</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemVal}>₹{(weekEarnings * 0.15 / 0.85).toFixed(0)}</Text>
              <Text style={styles.earningsItemLabel}>Coop pool</Text>
            </View>
          </View>
        </View>

        {/* New Offers */}
        {pendingOffers.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Opportunities</Text>
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>{pendingOffers.length} new</Text>
              </View>
            </View>
            {pendingOffers.map((offer) => (
              <Pressable
                key={offer.id}
                style={({ pressed }) => [styles.offerCard, pressed && styles.offerCardPressed]}
                onPress={() => router.push({ pathname: '/job-detail', params: { id: offer.id } })}
              >
                {offer.urgency === 'urgent' && (
                  <View style={styles.urgentBanner}>
                    <MaterialIcons name="warning" size={13} color={Colors.warning} />
                    <Text style={styles.urgentText}>Urgent — expires in {offer.expiresInMinutes} min</Text>
                  </View>
                )}
                <View style={styles.offerTop}>
                  <View style={styles.offerIconWrap}>
                    <MaterialIcons name={offer.serviceIcon as any} size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerTitle}>{offer.issueTitle}</Text>
                    <Text style={styles.offerCat}>{offer.serviceCategory}</Text>
                  </View>
                  <View style={styles.offerAmountWrap}>
                    <Text style={styles.offerAmount}>₹{offer.workerShare}</Text>
                    <Text style={styles.offerAmountLabel}>you earn</Text>
                  </View>
                </View>
                <View style={styles.offerMeta}>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="location-on" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{offer.customerArea} · {offer.distanceKm} km</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="schedule" size={13} color={Colors.textMuted} />
                    <Text style={styles.metaChipText}>{offer.scheduledDate}, {offer.scheduledSlot}</Text>
                  </View>
                </View>
                <View style={styles.reasonWrap}>
                  <MaterialIcons name="info-outline" size={13} color={Colors.primary} />
                  <Text style={styles.reasonText}>{offer.eligibilityReason}</Text>
                </View>
                <View style={styles.offerActions}>
                  <Pressable style={styles.declineBtn} onPress={() => {}}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </Pressable>
                  <Pressable style={styles.acceptBtn} onPress={() => router.push({ pathname: '/job-detail', params: { id: offer.id } })}>
                    <Text style={styles.acceptBtnText}>View & Accept</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.noOffersCard}>
            <MaterialIcons name="work-off" size={36} color={Colors.textMuted} />
            <Text style={styles.noOffersTitle}>No new offers right now</Text>
            <Text style={styles.noOffersSub}>{isAvailable ? 'Stay available — offers will appear here' : 'Turn on availability to receive offers'}</Text>
          </View>
        )}

        {/* Fairness Explanation */}
        <View style={styles.fairnessCard}>
          <Text style={styles.fairnessTitle}>How you get offers</Text>
          <Text style={styles.fairnessText}>
            Offers are matched based on your skills, availability, distance, and recent workload. Workers with lower recent earnings among eligible candidates receive priority — ensuring fair opportunity distribution.
          </Text>
          <Pressable>
            <Text style={styles.fairnessLink}>Learn more about allocation →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  greeting: { ...Typography.pageTitle, color: Colors.textPrimary },
  greetingSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  notifBtn: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error, borderWidth: 2, borderColor: Colors.background },
  availCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, marginBottom: Spacing.sm, ...Shadow.sm },
  availLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  availTitle: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  availSub: { ...Typography.caption, color: Colors.textSecondary },
  earningsCard: { backgroundColor: Colors.workerPrimary, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  earningsSectionTitle: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  earningsAmount: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: Spacing.md },
  earningsRow: { flexDirection: 'row', alignItems: 'center' },
  earningsItem: { flex: 1, alignItems: 'center' },
  earningsItemVal: { ...Typography.sectionTitle, color: '#fff' },
  earningsItemLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
  earningsDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.textPrimary },
  offerBadge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  offerBadgeText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  offerCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.sm },
  offerCardPressed: { opacity: 0.88 },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.warningLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 5, marginBottom: Spacing.sm },
  urgentText: { ...Typography.caption, color: Colors.warning, fontWeight: '600' },
  offerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  offerIconWrap: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  offerTitle: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  offerCat: { ...Typography.caption, color: Colors.textMuted },
  offerAmountWrap: { alignItems: 'flex-end' },
  offerAmount: { ...Typography.amountSmall, color: Colors.success },
  offerAmountLabel: { ...Typography.caption, color: Colors.textMuted },
  offerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  metaChipText: { ...Typography.caption, color: Colors.textSecondary },
  reasonWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  reasonText: { ...Typography.caption, color: Colors.primaryDark, flex: 1 },
  offerActions: { flexDirection: 'row', gap: Spacing.sm },
  declineBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  declineBtnText: { ...Typography.button, color: Colors.textSecondary },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.primary },
  acceptBtnText: { ...Typography.button, color: '#fff' },
  noOffersCard: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  noOffersTitle: { ...Typography.sectionTitle, color: Colors.textSecondary },
  noOffersSub: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.lg },
  fairnessCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: Spacing.md },
  fairnessTitle: { ...Typography.label, fontWeight: '700', color: Colors.primaryDark, marginBottom: Spacing.xs },
  fairnessText: { ...Typography.bodySmall, color: Colors.primaryDark, lineHeight: 20 },
  fairnessLink: { ...Typography.label, color: Colors.primary, marginTop: Spacing.sm },
});
