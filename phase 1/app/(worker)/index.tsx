import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { JobOfferCard } from '@/components/feature/JobOfferCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/hooks/useApp';
import { MOCK_EARNINGS, normalizeCategory } from '@/services/mockData';
import { JobNotificationRecord } from '@/services/notificationService';

export default function WorkerHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, jobOffers, workersList, workerAvailable, toggleWorkerAvailability, acceptOffer, declineOffer, workerNotifications } = useApp();
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSecondaryContent(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const currentWorker = workersList.find(w => w.id === user?.id || w.phone === user?.phone);
  const verifState = currentWorker?.verificationState || (currentWorker?.verificationStatus === 'verified' ? 'VERIFIED' : 'VERIFICATION_PENDING');

  const hasWorkSlip = !!(
    currentWorker?.workSlipDocument ||
    currentWorker?.verificationDocument ||
    (user?.workerProfile as any)?.workSlipDocument ||
    (user?.workerProfile as any)?.verificationDocument ||
    currentWorker?.workSlipStatus === 'uploaded' ||
    currentWorker?.workSlipStatus === 'approved' ||
    (user?.workerProfile as any)?.workSlipStatus === 'uploaded' ||
    (user?.workerProfile as any)?.workSlipStatus === 'approved'
  );

  const hasSkillCert = !!(
    currentWorker?.skillCertificateDocument ||
    (user?.workerProfile as any)?.skillCertificateDocument ||
    currentWorker?.skillCertificateStatus === 'uploaded' ||
    currentWorker?.skillCertificateStatus === 'verified' ||
    (user?.workerProfile as any)?.certificateStatus === 'Verified' ||
    (user?.workerProfile as any)?.certificateStatus === 'Uploaded' ||
    (user?.workerProfile as any)?.skillCertificateStatus === 'uploaded' ||
    (user?.workerProfile as any)?.skillCertificateStatus === 'verified'
  );

  // Green Verified Tick ONLY when BOTH Work Slip AND Skill Certificate are uploaded/verified
  const isFullyVerified = hasWorkSlip && hasSkillCert;
  const adminRejectionReason = currentWorker?.rejectionReason || currentWorker?.adminRejectionReason;

  const primarySkillName = user?.workerProfile?.primarySkill || currentWorker?.skills?.[0] || 'Plumbing';
  const workerCategory = normalizeCategory(currentWorker?.primaryCategory || primarySkillName);
  const formattedProfession = primarySkillName.charAt(0).toUpperCase() + primarySkillName.slice(1);

  const todayEarnings = MOCK_EARNINGS.slice(0, 1).reduce((s, e) => s + e.workerShare, 0);
  const weekEarnings = MOCK_EARNINGS.reduce((s, e) => s + e.workerShare, 0);

  // Job offers delivered if Work Slip uploaded, even if Skill Certificate is pending
  const pendingOffers = hasWorkSlip ? jobOffers.filter(o => {
    if (o.status !== 'pending') return false;
    const offerCat = normalizeCategory(o.serviceLabel);
    return offerCat === workerCategory || (currentWorker?.skills || []).some(s => normalizeCategory(s) === offerCat);
  }) : [];

  const notifList = (workerNotifications || []) as JobNotificationRecord[];
  const unreadNotifCount = notifList.filter((n: JobNotificationRecord) => n.status === 'SENT' || n.status === 'DELIVERED').length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[4] }]}>
        <View style={styles.headerLeft}>
          <Avatar initials={user?.avatar || 'W'} size={44} verified={isFullyVerified} />
          <View style={{ marginLeft: Spacing[3] }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
          <Pressable style={styles.notifBtn} onPress={() => setShowNotifModal(true)}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textPrimary} />
            {unreadNotifCount > 0 && (
              <View style={styles.notifDot}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', textAlign: 'center' }}>{unreadNotifCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Static Informational Message Banner (Plain text only, not clickable, no navigation) */}
      {hasWorkSlip && !hasSkillCert && (
        <View style={styles.skillCertNoticeBanner}>
          <Text style={styles.skillCertNoticeText}>
            Please upload your skill certificate to complete your profile verification.
          </Text>
        </View>
      )}

      {verifState === 'UNDER_REVIEW' && (
        <View style={[styles.approvalNoticeBannerPending, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
          <MaterialIcons name="fact-check" size={22} color="#1D4ED8" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.approvalNoticeTitlePending, { color: '#1E40AF' }]}>Document Under Review by Society Head</Text>
            <Text style={[styles.approvalNoticeSubPending, { color: '#1E3A8A' }]}>
              Your local authority document has been submitted. Society Head is reviewing it. You will be activated upon approval.
            </Text>
          </View>
        </View>
      )}

      {(verifState === 'REJECTED' || verifState === 'RE_UPLOAD_REQUIRED') && (
        <Pressable style={styles.approvalNoticeBannerRejected} onPress={() => router.push('/(worker)/profile' as any)}>
          <MaterialIcons name="cancel" size={22} color={Colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.approvalNoticeTitleRejected}>
              {verifState === 'REJECTED' ? 'Verification Application Rejected' : 'Document Re-upload Required'}
            </Text>
            <Text style={styles.approvalNoticeSubRejected}>
              {adminRejectionReason || 'Please re-upload a clear form with official seal & stamp.'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={Colors.error} />
        </Pressable>
      )}

      {/* Availability toggle */}
      <View style={[styles.availCard, { backgroundColor: workerAvailable ? Colors.primaryLight : Colors.divider }]}>
        <View>
          <Text style={styles.availTitle}>
            {workerAvailable ? `Available for ${formattedProfession} Jobs` : 'You are offline'}
          </Text>
          <Text style={styles.availSub}>
            {workerAvailable ? `Receiving ${formattedProfession.toLowerCase()} job offers` : 'Toggle to start receiving jobs'}
          </Text>
        </View>
        <Switch
          value={workerAvailable}
          onValueChange={toggleWorkerAvailability}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={workerAvailable ? Colors.surface : Colors.textTertiary}
        />
      </View>

      {/* Today's earnings snapshot */}
      <View style={styles.earningsRow}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Today</Text>
          <Text style={styles.earningsValue}>₹{todayEarnings}</Text>
          <Text style={styles.earningsSub}>1 job</Text>
        </View>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>This Week</Text>
          <Text style={styles.earningsValue}>₹{weekEarnings.toLocaleString()}</Text>
          <Text style={styles.earningsSub}>4 jobs</Text>
        </View>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Completed</Text>
          <Text style={[styles.earningsValue, { color: Colors.primary }]}>4</Text>
          <Text style={styles.earningsSub}>Jobs</Text>
        </View>
      </View>

      {/* Fairness info */}
      <Pressable style={styles.fairnessCard} onPress={() => router.push('/(worker)/earnings' as any)}>
        <MaterialIcons name="balance" size={18} color={Colors.primary} />
        <View style={{ flex: 1, marginLeft: Spacing[2] }}>
          <Text style={styles.fairnessTitle}>{formattedProfession} Allocation Score</Text>
          <Text style={styles.fairnessText}>Score: 87 · Lower recent workload = more offers</Text>
        </View>
        <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
      </Pressable>

      {/* Pending offers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Opportunities</Text>
          {pendingOffers.length > 0 && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>{pendingOffers.length} new</Text>
            </View>
          )}
        </View>
        {workerAvailable ? (
          pendingOffers.length > 0 ? (
            pendingOffers.map(offer => (
              <View key={offer.id} style={{ marginBottom: Spacing[3] }}>
                <JobOfferCard
                  offer={offer}
                  onAccept={async () => {
                    const res = await acceptOffer(offer.id);
                    if (!res.success && res.error) {
                      alert(res.error);
                    }
                  }}
                  onDecline={() => declineOffer(offer.id)}
                />
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F1F5F9',
                    padding: Spacing[2],
                    borderRadius: Radius.md,
                    marginTop: Spacing[1],
                    gap: 4,
                  }}
                  onPress={() => router.push({ pathname: '/job-opportunity', params: { offerId: offer.id } } as any)}
                >
                  <MaterialIcons name="visibility" size={16} color={Colors.primary} />
                  <Text style={{ fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary }}>
                    [View Opportunity Details]
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.emptyOffers}>
              <MaterialIcons name="work-off" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No new {formattedProfession.toLowerCase()} offers right now</Text>
              <Text style={styles.emptySubText}>We will notify you when a matching {formattedProfession.toLowerCase()} job is requested in your area</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyOffers}>
            <MaterialIcons name="toggle-off" size={32} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>You are currently offline</Text>
            <Text style={styles.emptySubText}>Toggle availability above to start receiving {formattedProfession.toLowerCase()} job offers</Text>
          </View>
        )}
      </View>

      {/* Today's schedule */}
      {showSecondaryContent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleTime}>
              <Text style={styles.scheduleTimeText}>3:00 PM</Text>
              <Text style={styles.scheduleTimeText}>5:00 PM</Text>
            </View>
            <View style={styles.scheduleBar} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Plumbing — Pipe Leakage</Text>
              <Text style={styles.scheduleAddress}>Koramangala 5th Block</Text>
              <Badge label="In Progress" variant="warning" size="sm" />
            </View>
          </View>
        </View>
      )}

      {/* WORKER NOTIFICATIONS MODAL */}
      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Worker Notifications</Text>
              <Pressable onPress={() => setShowNotifModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {notifList.length > 0 ? (
                notifList.map((notif: JobNotificationRecord, i: number) => (
                  <Pressable
                    key={notif.id || i}
                    style={[styles.notifCard, (notif.status === 'SENT' || notif.status === 'DELIVERED') && styles.notifCardUnread]}
                    onPress={() => {
                      setShowNotifModal(false);
                      router.push({ pathname: '/job-opportunity', params: { requestId: notif.requestId } } as any);
                    }}
                  >
                    <MaterialIcons
                      name="notifications-active"
                      size={20}
                      color={(notif.status === 'SENT' || notif.status === 'DELIVERED') ? Colors.primary : Colors.textTertiary}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.notifTitle}>{notif.title}</Text>
                        <Badge label={notif.status} variant={notif.status === 'ACCEPTED' ? 'success' : notif.status === 'DECLINED' ? 'error' : 'info'} size="sm" />
                      </View>
                      <Text style={styles.notifBody}>{notif.body}</Text>
                      <Text style={styles.notifTime}>{new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View style={{ padding: Spacing[4], alignItems: 'center' }}>
                  <Text style={{ fontSize: Typography.sm, color: Colors.textTertiary }}>No notifications yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], marginBottom: Spacing[4],
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: Typography.sm, color: Colors.textSecondary },
  name: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  notifBtn: { position: 'relative', padding: Spacing[1] },
  notifDot: {
    position: 'absolute', top: Spacing[1], right: Spacing[1],
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5, borderColor: Colors.background,
  },
  availCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[4], marginBottom: Spacing[4], ...Shadow.sm,
  },
  availTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  availSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  earningsRow: {
    flexDirection: 'row', gap: Spacing[2],
    paddingHorizontal: Spacing[5], marginBottom: Spacing[4],
  },
  earningsCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing[3], alignItems: 'center', ...Shadow.sm,
  },
  earningsLabel: { fontSize: Typography.xs, color: Colors.textTertiary },
  earningsValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  earningsSub: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  fairnessCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    marginHorizontal: Spacing[5], padding: Spacing[3],
    marginBottom: Spacing[5], borderWidth: 1, borderColor: Colors.primary + '30',
  },
  fairnessTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary },
  fairnessText: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[2] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  offerBadge: {
    backgroundColor: Colors.error, borderRadius: Radius.full,
    paddingHorizontal: Spacing[2], paddingVertical: 2,
  },
  offerBadgeText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  emptyOffers: { alignItems: 'center', paddingVertical: Spacing[8], gap: Spacing[2] },
  emptyText: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.textSecondary },
  emptySubText: { fontSize: Typography.sm, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: Spacing[4] },
  scheduleCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing[4], flexDirection: 'row', gap: Spacing[3], ...Shadow.sm,
  },
  scheduleTime: { alignItems: 'center', gap: Spacing[3] },
  scheduleTimeText: { fontSize: Typography.xs, color: Colors.textTertiary, fontWeight: Typography.medium },
  scheduleBar: { width: 3, borderRadius: 2, backgroundColor: Colors.primary, alignSelf: 'stretch' },
  scheduleInfo: { flex: 1, gap: Spacing[1] },
  scheduleLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  scheduleAddress: { fontSize: Typography.xs, color: Colors.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing[5], maxHeight: '80%', gap: Spacing[3],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  notifCard: {
    flexDirection: 'row', gap: Spacing[3], backgroundColor: Colors.surfaceTinted,
    padding: Spacing[3], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  notifCardUnread: { backgroundColor: '#F0F9FF', borderColor: Colors.primary },
  notifTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textPrimary },
  notifBody: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  notifTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  skillCertNoticeBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  skillCertNoticeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: '#92400E',
    lineHeight: 20,
  },
  approvalNoticeBannerPending: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  approvalNoticeTitlePending: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#92400E',
  },
  approvalNoticeSubPending: {
    fontSize: Typography.xs,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  approvalNoticeBannerRejected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[4],
  },
  approvalNoticeTitleRejected: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.error,
  },
  approvalNoticeSubRejected: {
    fontSize: Typography.xs,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 16,
  },
});
