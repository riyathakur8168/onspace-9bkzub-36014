import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_BOOKINGS } from '@/services/mockData';
import { useAlert } from '@/template';

export default function BookingDetail() {
  const { showAlert } = useAlert();
  const booking = MOCK_BOOKINGS[0];

  const statusSteps = [
    { key: 'accepted', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'en_route', label: 'On the way', icon: 'navigate' },
    { key: 'arrived', label: 'Arrived', icon: 'location' },
    { key: 'started', label: 'In progress', icon: 'construct' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle' },
  ];
  const currentIdx = statusSteps.findIndex(s => s.key === booking.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
        {/* Worker Info */}
        <Card style={styles.workerCard}>
          <View style={styles.workerRow}>
            <Image source={{ uri: booking.workerAvatar }} style={styles.workerAvatar} contentFit="cover" transition={200} />
            <View style={{ flex: 1 }}>
              <Text style={styles.workerName}>{booking.workerName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={Colors.amber} />
                <Text style={styles.ratingText}>{booking.workerRating} · Verified</Text>
              </View>
              <Text style={styles.workerService}>{booking.category} Professional</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => showAlert('Call Masked', 'Direct contact is not available. Use in-app messaging.')}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Status Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Booking Status</Text>
          {statusSteps.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const pending = idx > currentIdx;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, done && styles.dotDone, active && styles.dotActive, pending && styles.dotPending]}>
                    <Ionicons name={done ? 'checkmark' : step.icon as any} size={14} color={pending ? Colors.textSubtle : Colors.white} />
                  </View>
                  {idx < statusSteps.length - 1 && <View style={[styles.timelineLine, done && styles.lineDone]} />}
                </View>
                <Text style={[styles.timelineLabel, active && styles.timelineLabelActive, pending && styles.timelineLabelPending]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* OTP Card */}
        {(booking.status === 'arrived') && (
          <Card style={styles.otpCard}>
            <Text style={styles.otpTitle}>Share OTP with worker to start job</Text>
            <Text style={styles.otpCode}>{booking.otp}</Text>
            <Text style={styles.otpSub}>Valid only when worker is at your location</Text>
          </Card>
        )}

        {/* Job Details */}
        <Card>
          <Text style={styles.cardTitle}>Service Details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Service</Text><Text style={styles.detailVal}>{booking.category} · {booking.subcategory}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Date & Time</Text><Text style={styles.detailVal}>{booking.scheduledDate} · {booking.scheduledTime}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Address</Text><Text style={styles.detailVal}>{booking.address}</Text></View>
          <View style={[styles.detailRow, styles.divider]}>
            <Text style={styles.detailLabel}>Service Value</Text>
            <Text style={styles.detailVal}>₹{booking.serviceValue}</Text>
          </View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Worker earns (85%)</Text><Text style={[styles.detailVal, { color: Colors.primary }]}>₹{booking.workerShare}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Cooperative pool (15%)</Text><Text style={styles.detailVal}>₹{booking.cooperativePool}</Text></View>
        </Card>

        {booking.status !== 'completed' && (
          <Button
            label="Report an Issue"
            onPress={() => showAlert('Support', 'Our support team will contact you within 30 minutes.')}
            variant="outline"
            style={{ marginTop: Spacing.md }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  workerCard: { marginBottom: Spacing.md },
  workerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  workerAvatar: { width: 56, height: 56, borderRadius: 28 },
  workerName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 },
  ratingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  workerService: { fontSize: FontSize.sm, color: Colors.textSubtle },
  callBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  timelineCard: { marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.border },
  dotDone: { backgroundColor: Colors.success },
  dotActive: { backgroundColor: Colors.primary },
  dotPending: { backgroundColor: Colors.border },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.border, minHeight: 24 },
  lineDone: { backgroundColor: Colors.success },
  timelineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingTop: 6, paddingBottom: Spacing.md },
  timelineLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  timelineLabelPending: { color: Colors.textSubtle },
  otpCard: { marginBottom: Spacing.md, backgroundColor: Colors.amberLight, borderColor: Colors.amber, alignItems: 'center' },
  otpTitle: { fontSize: FontSize.sm, color: Colors.amberDark, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  otpCode: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.amberDark, letterSpacing: 8 },
  otpSub: { fontSize: FontSize.xs, color: Colors.amberDark, marginTop: Spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  detailVal: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, flex: 1.5, textAlign: 'right' },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
});
