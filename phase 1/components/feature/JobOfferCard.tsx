import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobOffer } from '@/services/mockData';

interface JobOfferCardProps {
  offer: JobOffer;
  onAccept: () => void;
  onDecline: () => void;
}

export function JobOfferCard({ offer, onAccept, onDecline }: JobOfferCardProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <View style={[styles.card, offer.urgency === 'urgent' && styles.urgentBorder]}>
      {offer.urgency === 'urgent' && (
        <View style={styles.urgentBanner}>
          <MaterialIcons name="flash-on" size={14} color="#fff" />
          <Text style={styles.urgentText}>Urgent Request</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.serviceIcon}>
          <MaterialIcons name="home-repair-service" size={22} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.serviceLabel}>{offer.serviceLabel}</Text>
          <Text style={styles.slot}>{offer.scheduledSlot}</Text>
        </View>
        <Badge label={offer.status === 'pending' ? 'New' : offer.status} variant={offer.status === 'pending' ? 'warning' : 'success'} />
      </View>

      {/* Issue */}
      <Text style={styles.description} numberOfLines={2}>{offer.issueDescription}</Text>

      {/* Location & Distance */}
      <View style={styles.row}>
        <MaterialIcons name="location-on" size={15} color={Colors.textTertiary} />
        <Text style={styles.metaText}>{offer.customerArea}</Text>
        <View style={styles.dot} />
        <MaterialIcons name="directions-walk" size={15} color={Colors.textTertiary} />
        <Text style={styles.metaText}>{offer.distance} · {offer.travelTime}</Text>
      </View>

      {/* Earnings breakdown */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Service Value</Text>
          <Text style={styles.earningsValue}>₹{offer.serviceValue}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.earningsRow}>
          <Text style={[styles.earningsLabel, { color: Colors.primary, fontWeight: Typography.semibold }]}>Your Earnings</Text>
          <Text style={styles.earningsHighlight}>₹{offer.workerShare}</Text>
        </View>
      </View>

      {/* Allocation Reason */}
      <Pressable onPress={() => setShowReason(!showReason)} style={styles.reasonToggle}>
        <MaterialIcons name="info-outline" size={15} color={Colors.primary} />
        <Text style={styles.reasonToggleText}>Why was this offered to you?</Text>
        <MaterialIcons name={showReason ? 'expand-less' : 'expand-more'} size={16} color={Colors.primary} />
      </Pressable>
      {showReason && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>{offer.allocationReason}</Text>
        </View>
      )}

      {/* Actions */}
      {offer.status === 'pending' && (
        <View style={styles.actions}>
          <Button label="Decline" variant="secondary" onPress={onDecline} style={styles.declineBtn} />
          <Button label="Accept Job" variant="primary" onPress={onAccept} style={styles.acceptBtn} />
        </View>
      )}
      {offer.status === 'accepted' && (
        <View style={styles.acceptedBanner}>
          <MaterialIcons name="check-circle" size={18} color={Colors.success} />
          <Text style={styles.acceptedText}>Job Accepted</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    ...Shadow.md,
  },
  urgentBorder: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    marginBottom: Spacing[2],
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgentText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.semibold },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2], gap: Spacing[2] },
  serviceIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  serviceLabel: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  slot: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  description: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing[3] },
  metaText: { fontSize: Typography.sm, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border, marginHorizontal: 2 },
  earningsCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[3],
  },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  earningsLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  earningsValue: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  earningsHighlight: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing[1] },
  reasonToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing[2] },
  reasonToggleText: { flex: 1, fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  reasonBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing[3],
    marginBottom: Spacing[3],
  },
  reasonText: { fontSize: Typography.sm, color: Colors.primary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  declineBtn: { flex: 1 },
  acceptBtn: { flex: 2 },
  acceptedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], paddingVertical: Spacing[2],
    backgroundColor: Colors.successLight, borderRadius: Radius.md,
  },
  acceptedText: { color: Colors.success, fontWeight: Typography.semibold, fontSize: Typography.base },
});
