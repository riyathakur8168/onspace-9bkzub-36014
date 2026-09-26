import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { normalizeCategory } from '@/services/mockData';

export default function JobOpportunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { offerId, requestId } = useLocalSearchParams<{ offerId?: string; requestId?: string }>();
  const { user, jobOffers, activeDispatchSession, acceptOffer, declineOffer, workersList } = useApp();
  const [accepted, setAccepted] = useState(false);

  // Find matching job offer
  const currentOffer = jobOffers.find(o => o.id === offerId || (requestId && o.requestId === requestId)) || activeDispatchSession?.currentOffer || jobOffers[0];

  const currentWorker = workersList.find(w => w.id === user?.id || w.phone === user?.phone);
  const isWorkerVerified = currentWorker?.verificationState === 'VERIFIED' || currentWorker?.verificationStatus === 'verified';
  const workerCategory = normalizeCategory(currentWorker?.primaryCategory || user?.workerProfile?.primarySkill);
  const offerCategory = currentOffer ? normalizeCategory(currentOffer.serviceLabel) : '';

  // Backend Security Check: Is worker eligible for this offer?
  const isEligible = isWorkerVerified && workerCategory === offerCategory;

  const handleAccept = () => {
    if (!currentOffer) return;

    if (!isEligible) {
      Alert.alert(
        'Ineligible Worker',
        'Backend Security: You are not authorized or verified to accept this job offer.'
      );
      return;
    }

    const res = acceptOffer(currentOffer.id);
    if (res.success) {
      setAccepted(true);
      Alert.alert(
        '⚡ Job Accepted Successfully!',
        'You have been assigned this job. Customer contact details are now unlocked.',
        [
          {
            text: 'View Job Details',
            onPress: () => router.push({ pathname: '/booking-detail', params: { id: currentOffer.requestId } } as any),
          },
        ]
      );
    } else {
      Alert.alert('Unable to Accept Offer', res.error || 'This offer may have expired or been assigned to another worker.');
    }
  };

  const handleDecline = () => {
    if (!currentOffer) return;
    declineOffer(currentOffer.id);
    Alert.alert('Offer Declined', 'This opportunity has been passed to the next eligible worker.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!currentOffer) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <MaterialIcons name="error-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorTitle}>Opportunity Expired or Not Found</Text>
        <Text style={styles.errorSub}>This job offer may have been taken by another worker or timed out.</Text>
        <Button label="Back to Dashboard" onPress={() => router.replace('/(worker)')} style={{ marginTop: Spacing[4] }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3] }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Opportunity Details</Text>
        <Badge label="Live Opportunity" variant="warning" />
      </View>

      {/* Main Earning Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroBadgeTitle}>⚡ EARNING OPPORTUNITY</Text>
          <View style={styles.urgencyPill}>
            <MaterialIcons name="timer" size={14} color="#D97706" />
            <Text style={styles.urgencyText}>30s Offer Window</Text>
          </View>
        </View>

        <Text style={styles.serviceTitle}>{currentOffer.serviceLabel}</Text>

        <View style={styles.payoutBox}>
          <Text style={styles.payoutLabel}>Your Net Earning Share</Text>
          <Text style={styles.payoutAmount}>₹{currentOffer.workerShare}</Text>
          <Text style={styles.payoutSub}>
            Gross value: ₹{currentOffer.serviceValue} • 85% worker share algorithm
          </Text>
        </View>
      </View>

      {/* Security & Verification Status Card */}
      <View style={[styles.card, !isEligible && styles.cardWarning]}>
        <View style={styles.cardRow}>
          <MaterialIcons
            name={isEligible ? 'verified-user' : 'gpp-bad'}
            size={22}
            color={isEligible ? Colors.primary : Colors.error}
          />
          <View style={{ flex: 1, marginLeft: Spacing[2] }}>
            <Text style={styles.cardRowTitle}>
              {isEligible ? 'Backend Qualification Verified' : 'Ineligible Worker Profile'}
            </Text>
            <Text style={styles.cardRowSub}>
              {isEligible
                ? `Active & Verified status confirmed for ${currentOffer.serviceLabel}`
                : 'Worker status is unverified, inactive, or profession mismatch'}
            </Text>
          </View>
        </View>
      </View>

      {/* Job Details Section */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Service & Issue Summary</Text>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="build" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Service Required</Text>
            <Text style={styles.detailValue}>{currentOffer.serviceLabel}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="description" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Issue Description</Text>
            <Text style={styles.detailValue}>{currentOffer.issueDescription || 'Standard service request'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Scheduled Slot</Text>
            <Text style={styles.detailValue}>{currentOffer.scheduledSlot}</Text>
          </View>
        </View>
      </View>

      {/* Location & Privacy Shield Section */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Location & Privacy</Text>

        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Approximate Location / Area</Text>
            <Text style={styles.detailValue}>{currentOffer.customerArea}</Text>
            <Text style={styles.privacyNote}>
              🔒 Exact flat number & customer phone contact are protected until job acceptance.
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="near-me" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Distance & Estimated Travel Time</Text>
            <Text style={styles.detailValue}>
              {currentOffer.distance} ({currentOffer.travelTime})
            </Text>
          </View>
        </View>
      </View>

      {/* Fairness & Allocation System Reason */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Fairness & Match Priority</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>Why you received this offer</Text>
            <Text style={styles.detailValue}>{currentOffer.allocationReason}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {accepted ? (
          <View style={styles.acceptedBanner}>
            <MaterialIcons name="check-circle" size={28} color="#059669" />
            <Text style={styles.acceptedText}>Job Accepted! Redirection to booking...</Text>
          </View>
        ) : (
          <>
            <Button
              label="⚡ Accept Opportunity"
              onPress={handleAccept}
              disabled={!isEligible}
              style={{ backgroundColor: isEligible ? Colors.primary : Colors.textTertiary }}
            />
            <Button
              label="Decline"
              variant="secondary"
              onPress={handleDecline}
              style={{ marginTop: Spacing[2], borderColor: Colors.border }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: Spacing[6] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
  },
  backBtn: { padding: Spacing[1] },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  heroCard: {
    marginHorizontal: Spacing[5],
    backgroundColor: '#0F172A',
    borderRadius: Radius.xl,
    padding: Spacing[5],
    marginBottom: Spacing[4],
    ...Shadow.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  heroBadgeTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#38BDF8',
    letterSpacing: 1,
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 4,
  },
  urgencyText: { fontSize: Typography.xs, color: '#92400E', fontWeight: Typography.bold },
  serviceTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: '#FFFFFF', marginBottom: Spacing[4] },
  payoutBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.lg,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  payoutLabel: { fontSize: Typography.xs, color: '#94A3B8' },
  payoutAmount: { fontSize: 32, fontWeight: Typography.bold, color: '#34D399', marginVertical: Spacing[1] },
  payoutSub: { fontSize: Typography.xs, color: '#64748B' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing[5],
    padding: Spacing[4],
    marginBottom: Spacing[4],
    gap: Spacing[3],
    ...Shadow.sm,
  },
  cardWarning: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardRowTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardRowSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionHeading: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary, marginBottom: Spacing[1] },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3] },
  detailLabel: { fontSize: Typography.xs, color: Colors.textTertiary },
  detailValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, marginTop: 1 },
  privacyNote: { fontSize: Typography.xs, color: '#0284C7', marginTop: Spacing[1], fontStyle: 'italic' },
  actionsContainer: { paddingHorizontal: Spacing[5], marginTop: Spacing[2] },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#D1FAE5',
    padding: Spacing[4],
    borderRadius: Radius.lg,
    justifyContent: 'center',
  },
  acceptedText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#065F46' },
  errorTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing[3] },
  errorSub: { fontSize: Typography.sm, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing[1] },
});
