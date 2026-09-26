import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_JOB_OFFERS } from '@/services/mockData';
import { useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';

export default function JobDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const offer = MOCK_JOB_OFFERS.find((o) => o.id === id) || MOCK_JOB_OFFERS[0];

  const handleAccept = () => {
    showAlert(
      'Job Accepted!',
      `You have accepted the ${offer.serviceCategory} job in ${offer.customerArea}. Navigate to the customer location and share the OTP to start.`,
      [{ text: 'Got it', onPress: () => router.replace('/(worker)') }]
    );
  };

  const handleDecline = () => {
    showAlert('Decline Job', 'Please select a reason for declining:', [
      { text: 'Already busy', style: 'default', onPress: () => router.back() },
      { text: 'Too far', style: 'default', onPress: () => router.back() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Offer</Text>
        {offer.urgency === 'urgent' && (
          <View style={styles.urgentTag}>
            <MaterialIcons name="warning" size={14} color={Colors.warning} />
            <Text style={styles.urgentTagText}>Urgent</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Service Header */}
        <View style={styles.card}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceIconWrap}>
              <MaterialIcons name={offer.serviceIcon as any} size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{offer.issueTitle}</Text>
              <Text style={styles.serviceCat}>{offer.serviceCategory}</Text>
            </View>
          </View>
          <Text style={styles.serviceDesc}>{offer.issueDescription}</Text>
        </View>

        {/* Job Details */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Job Details</Text>
          {[
            { icon: 'location-on', label: 'Area', val: `${offer.customerArea} · ${offer.distanceKm} km (~${offer.travelMinutes} min)` },
            { icon: 'schedule', label: 'Date & Time', val: `${offer.scheduledDate} · ${offer.scheduledSlot}` },
          ].map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <MaterialIcons name={row.icon as any} size={16} color={Colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.earningsCard}>
          <Text style={styles.sectionLabel}>Your Earnings</Text>
          <View style={styles.earningsMain}>
            <Text style={styles.earningsAmount}>₹{offer.workerShare}</Text>
            <Text style={styles.earningsLabel}>you earn</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowKey}>Service Value</Text>
            <Text style={styles.earningsRowVal}>₹{offer.serviceValue}</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowKey}>Your Share (85%)</Text>
            <Text style={[styles.earningsRowVal, { color: Colors.success, fontWeight: '700' }]}>₹{offer.workerShare}</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowKey}>Cooperative Pool (15%)</Text>
            <Text style={styles.earningsRowVal}>₹{offer.cooperativePool}</Text>
          </View>
        </View>

        {/* Why you received this */}
        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
            <Text style={styles.reasonTitle}>Why this offer was sent to you</Text>
          </View>
          <Text style={styles.reasonText}>{offer.eligibilityReason}</Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.declineBtn, pressed && { opacity: 0.8 }]} onPress={handleDecline}>
          <Text style={styles.declineBtnText}>Decline</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]} onPress={handleAccept}>
          <MaterialIcons name="check" size={20} color="#fff" />
          <Text style={styles.acceptBtnText}>Accept Job</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { padding: 6 },
  headerTitle: { ...Typography.sectionTitle, color: Colors.textPrimary, flex: 1 },
  urgentTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.warningLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  urgentTagText: { ...Typography.caption, color: Colors.warning, fontWeight: '700' },
  scroll: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.lg },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  serviceIconWrap: { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { ...Typography.sectionTitle, color: Colors.textPrimary },
  serviceCat: { ...Typography.bodySmall, color: Colors.textMuted },
  serviceDesc: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 22 },
  sectionLabel: { ...Typography.label, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  detailLabel: { ...Typography.caption, color: Colors.textMuted },
  detailVal: { ...Typography.bodyMedium, color: Colors.textPrimary },
  earningsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.success + '40', ...Shadow.sm, backgroundColor: Colors.successLight + '60' },
  earningsMain: { alignItems: 'center', paddingVertical: Spacing.md },
  earningsAmount: { fontSize: 40, fontWeight: '800', color: Colors.success },
  earningsLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  earningsDivider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.sm },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  earningsRowKey: { ...Typography.bodySmall, color: Colors.textSecondary },
  earningsRowVal: { ...Typography.bodySmall, color: Colors.textPrimary },
  reasonCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30' },
  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
  reasonTitle: { ...Typography.label, fontWeight: '700', color: Colors.primaryDark },
  reasonText: { ...Typography.bodySmall, color: Colors.primaryDark, lineHeight: 20 },
  footer: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  declineBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  declineBtnText: { ...Typography.button, color: Colors.textSecondary },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.primary },
  acceptBtnText: { ...Typography.button, color: '#fff', fontSize: 16 },
});
