import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ServiceRequest } from '@/services/mockData';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  requested: { label: 'Requested', variant: 'default' },
  matching: { label: 'Finding Worker', variant: 'info' },
  accepted: { label: 'Worker Assigned', variant: 'primary' },
  en_route: { label: 'Worker En Route', variant: 'info' },
  arrived: { label: 'Worker Arrived', variant: 'warning' },
  started: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  payment_settled: { label: 'Paid', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

interface BookingCardProps {
  booking: ServiceRequest;
  onPress?: () => void;
}

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const status = statusConfig[booking.status] || { label: booking.status, variant: 'default' as BadgeVariant };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.serviceLabel}>{booking.serviceLabel}</Text>
          <Text style={styles.slot}>{booking.preferredSlot}</Text>
        </View>
        <Badge label={status.label} variant={status.variant} />
      </View>

      <Text style={styles.description} numberOfLines={2}>{booking.issueDescription}</Text>

      {booking.assignedWorker && (
        <View style={styles.workerRow}>
          <Avatar initials={booking.assignedWorker.avatar} size={32} verified={booking.assignedWorker.verificationStatus === 'verified'} />
          <View style={{ marginLeft: Spacing[2] }}>
            <Text style={styles.workerName}>{booking.assignedWorker.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={13} color={Colors.accent} />
              <Text style={styles.rating}>{booking.assignedWorker.rating}</Text>
            </View>
          </View>
          {booking.status === 'started' && booking.otpCode && (
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>OTP</Text>
              <Text style={styles.otpCode}>{booking.otpCode}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.address} numberOfLines={1}>
          <MaterialIcons name="location-on" size={13} color={Colors.textTertiary} /> {booking.address}
        </Text>
        <Text style={styles.price}>₹{booking.serviceValue}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    ...Shadow.sm,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing[2] },
  serviceLabel: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  slot: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  description: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing[3] },
  workerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.divider, marginBottom: Spacing[2] },
  workerName: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating: { fontSize: Typography.xs, color: Colors.textSecondary },
  otpBox: {
    marginLeft: 'auto' as any,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    alignItems: 'center',
  },
  otpLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },
  otpCode: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.primary, letterSpacing: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  address: { fontSize: Typography.xs, color: Colors.textTertiary, flex: 1 },
  price: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
});
