import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_BOOKINGS } from '@/services/mockData';
import { useAlert } from '@/template';

const STATUS_STEPS = ['confirmed', 'en_route', 'arrived', 'in_progress', 'completed'];

export default function BookingDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();

  const booking = MOCK_BOOKINGS.find((b) => b.id === id) || MOCK_BOOKINGS[0];
  const currentStep = STATUS_STEPS.indexOf(booking.status);

  const STEP_LABELS = [
    { key: 'confirmed', label: 'Booking Confirmed', icon: 'check-circle' },
    { key: 'en_route', label: 'Worker En Route', icon: 'directions-car' },
    { key: 'arrived', label: 'Worker Arrived', icon: 'location-on' },
    { key: 'in_progress', label: 'Job In Progress', icon: 'build' },
    { key: 'completed', label: 'Completed', icon: 'done-all' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <Text style={styles.headerRef}>{booking.bookingRef}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Service Info */}
        <View style={styles.card}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconWrap}>
              <MaterialIcons name={booking.serviceIcon as any} size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{booking.issueTitle}</Text>
              <Text style={styles.serviceCat}>{booking.serviceCategory}</Text>
            </View>
            <Text style={styles.price}>₹{booking.serviceValue}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={15} color={Colors.textMuted} />
            <Text style={styles.detailText}>{booking.scheduledDate} · {booking.scheduledSlot}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={15} color={Colors.textMuted} />
            <Text style={styles.detailText}>{booking.address}</Text>
          </View>
        </View>

        {/* OTP Banner */}
        {booking.otp && booking.status === 'confirmed' ? (
          <View style={styles.otpCard}>
            <View>
              <Text style={styles.otpTitle}>Share this OTP to start the job</Text>
              <Text style={styles.otpSub}>Only share when the worker arrives at your door</Text>
            </View>
            <Text style={styles.otpCode}>{booking.otp}</Text>
          </View>
        ) : null}

        {/* Worker Card */}
        {booking.workerName ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Your Worker</Text>
            <View style={styles.workerRow}>
              <View style={styles.workerAvatar}>
                <Text style={styles.workerAvatarText}>{booking.workerName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.workerNameRow}>
                  <Text style={styles.workerName}>{booking.workerName}</Text>
                  {booking.workerVerified ? (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={13} color={Colors.primary} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.workerMeta}>
                  <MaterialIcons name="star" size={14} color={Colors.accent} />
                  <Text style={styles.workerMetaText}>{booking.workerRating} · {booking.workerJobsCompleted} jobs</Text>
                </View>
              </View>
              <Pressable
                style={styles.callBtn}
                onPress={() => showAlert('Contact Worker', 'Call masking would connect you securely. Feature coming in production.')}
              >
                <MaterialIcons name="phone" size={18} color={Colors.primary} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Progress Timeline */}
        {booking.status !== 'cancelled' ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Job Progress</Text>
            {STEP_LABELS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]}>
                      <MaterialIcons name={step.icon as any} size={12} color={done ? '#fff' : Colors.gray300} />
                    </View>
                    {i < STEP_LABELS.length - 1 && (
                      <View style={[styles.timelineLine, i < currentStep && styles.timelineLineDone]} />
                    )}
                  </View>
                  <Text style={[styles.timelineLabel, active && styles.timelineLabelActive, done && !active && styles.timelineLabelDone]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Payment Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment Breakdown</Text>
          <View style={styles.payRow}>
            <Text style={styles.payKey}>Service Value</Text>
            <Text style={styles.payVal}>₹{booking.serviceValue}</Text>
          </View>
          {booking.workerShare ? (
            <>
              <View style={styles.payRow}>
                <Text style={styles.payKey}>Worker Earns (85%)</Text>
                <Text style={[styles.payVal, { color: Colors.success }]}>₹{booking.workerShare}</Text>
              </View>
              <View style={styles.payRow}>
                <Text style={styles.payKey}>Cooperative Pool (15%)</Text>
                <Text style={styles.payVal}>₹{booking.serviceValue - booking.workerShare}</Text>
              </View>
            </>
          ) : null}
          <View style={[styles.divider, { marginVertical: Spacing.sm }]} />
          <View style={styles.payRow}>
            <Text style={[styles.payKey, { fontWeight: '700', color: Colors.textPrimary }]}>You Pay</Text>
            <Text style={styles.totalVal}>₹{booking.serviceValue}</Text>
          </View>
        </View>

        {/* Support */}
        <Pressable
          style={styles.supportBtn}
          onPress={() => showAlert('Support', 'Our support team will assist you. Case ID: ' + booking.bookingRef)}
        >
          <MaterialIcons name="support-agent" size={18} color={Colors.textSecondary} />
          <Text style={styles.supportText}>Need help with this booking?</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { padding: 6, marginBottom: 4 },
  headerTitle: { ...Typography.sectionTitle, color: Colors.textPrimary },
  headerRef: { ...Typography.caption, color: Colors.textMuted },
  scroll: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceIconWrap: { width: 46, height: 46, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { ...Typography.bodyLarge, fontWeight: '600', color: Colors.textPrimary },
  serviceCat: { ...Typography.bodySmall, color: Colors.textSecondary },
  price: { ...Typography.amountSmall, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 5 },
  detailText: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  otpCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.warningLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40' },
  otpTitle: { ...Typography.bodyMedium, fontWeight: '700', color: Colors.textPrimary },
  otpSub: { ...Typography.caption, color: Colors.textSecondary },
  otpCode: { fontSize: 32, fontWeight: '800', color: Colors.warning, letterSpacing: 6 },
  sectionLabel: { ...Typography.label, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm },
  workerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  workerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.workerPrimary + '20', alignItems: 'center', justifyContent: 'center' },
  workerAvatarText: { ...Typography.label, fontWeight: '700', color: Colors.workerPrimary },
  workerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workerName: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  verifiedText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  workerMetaText: { ...Typography.bodySmall, color: Colors.textSecondary },
  callBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, minHeight: 40 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: Colors.primary },
  timelineDotActive: { backgroundColor: Colors.primary, ...Shadow.sm },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.gray200, minHeight: 16, marginTop: 2 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineLabel: { ...Typography.bodySmall, color: Colors.textMuted, paddingTop: 3 },
  timelineLabelActive: { color: Colors.textPrimary, fontWeight: '700' },
  timelineLabelDone: { color: Colors.textSecondary },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  payKey: { ...Typography.bodySmall, color: Colors.textSecondary },
  payVal: { ...Typography.bodySmall, fontWeight: '500', color: Colors.textPrimary },
  totalVal: { ...Typography.amountSmall, color: Colors.primary },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  supportText: { ...Typography.label, color: Colors.textSecondary },
});
