import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { SERVICE_CATEGORIES } from '@/constants/config';
import { ServiceCategoryCard } from '@/components/feature/ServiceCategoryCard';
import { BookingCard } from '@/components/feature/BookingCard';
import { useApp } from '@/hooks/useApp';

export default function CustomerHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, bookings } = useApp();
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSecondaryContent(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const activeBooking = bookings.find(b =>
    ['matching', 'accepted', 'en_route', 'arrived', 'started'].includes(b.status)
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: insets.top + Spacing[4] }]}>
        <View>
          <Text style={styles.greeting}>Good afternoon,</Text>
          <Text style={styles.userName}>{user?.name} 👋</Text>
        </View>
        <Pressable style={styles.notifBtn} onPress={() => setShowNotifModal(true)}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      {/* Active booking banner */}
      {activeBooking && (
        <Pressable style={styles.activeBanner} onPress={() => router.push('/booking-detail' as any)}>
          <View style={styles.activeBannerLeft}>
            <View style={styles.activePulse} />
            <View>
              <Text style={styles.activeBannerLabel}>Active Booking</Text>
              <Text style={styles.activeBannerService}>{activeBooking.serviceLabel} — {activeBooking.status === 'started' ? 'In Progress' : 'Worker on the way'}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={Colors.primary} />
        </Pressable>
      )}

      {/* Quick request CTA */}
      <Pressable
        style={styles.requestCTA}
        onPress={() => router.push('/request-service' as any)}
      >
        <View style={styles.requestCTALeft}>
          <MaterialIcons name="search" size={20} color={Colors.textTertiary} />
          <Text style={styles.requestCTAText}>Search services...</Text>
        </View>
        <View style={styles.requestCTABtn}>
          <Text style={styles.requestCTABtnText}>Book Now</Text>
        </View>
      </Pressable>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        <View style={styles.categoriesGrid}>
          {SERVICE_CATEGORIES.map((cat) => (
            <ServiceCategoryCard
              key={cat.id}
              {...cat}
              onPress={() => router.push({ pathname: '/request-service', params: { category: cat.id, label: cat.label } } as any)}
            />
          ))}
        </View>
      </View>

      {/* How it works */}
      {showSecondaryContent && (
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How OnePlace works</Text>
          {[
            { step: '1', text: 'Describe your issue and preferred time', icon: 'edit' },
            { step: '2', text: 'We match you with a verified professional', icon: 'verified-user' },
            { step: '3', text: 'Worker arrives, completes job with OTP', icon: 'check-circle' },
            { step: '4', text: 'Pay securely, rate your experience', icon: 'star' },
          ].map(({ step, text, icon }) => (
            <View key={step} style={styles.howRow}>
              <View style={styles.howStep}><Text style={styles.howStepText}>{step}</Text></View>
              <MaterialIcons name={icon as any} size={16} color={Colors.primary} style={{ marginHorizontal: Spacing[2] }} />
              <Text style={styles.howText}>{text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <Pressable onPress={() => router.push('/(customer)/bookings' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {bookings.slice(0, 2).map((booking) => (
            <BookingCard key={booking.id} booking={booking} onPress={() => router.push('/booking-detail' as any)} />
          ))}
        </View>
      )}

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotifModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { title: 'Worker En Route', body: 'Rajesh K. is on the way to your address for Plumbing repair.', time: '10 mins ago', unread: true },
                { title: 'OTP Generated', body: 'Share OTP 4892 with worker upon arrival to start job.', time: '18 mins ago', unread: true },
                { title: 'Booking Confirmed', body: 'Your request #b102 has been accepted by verified worker.', time: '1 hour ago', unread: false },
              ].map((notif, i) => (
                <View key={i} style={[styles.notifCard, notif.unread && styles.notifCardUnread]}>
                  <MaterialIcons name="notifications" size={20} color={notif.unread ? Colors.primary : Colors.textTertiary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerArea: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing[5], marginBottom: Spacing[4],
  },
  greeting: { fontSize: Typography.sm, color: Colors.textSecondary },
  userName: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  notifBtn: { position: 'relative', padding: Spacing[1] },
  notifDot: {
    position: 'absolute', top: Spacing[1], right: Spacing[1],
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5, borderColor: Colors.background,
  },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[3], marginBottom: Spacing[3],
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  activePulse: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.success,
  },
  activeBannerLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold },
  activeBannerService: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  requestCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[3], marginBottom: Spacing[5],
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.border,
  },
  requestCTALeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flex: 1 },
  requestCTAText: { fontSize: Typography.base, color: Colors.textTertiary },
  requestCTABtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2],
  },
  requestCTABtnText: { color: '#fff', fontWeight: Typography.semibold, fontSize: Typography.sm },
  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[5] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  seeAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  howCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[4], marginBottom: Spacing[5],
    ...Shadow.sm,
  },
  howTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  howRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2] },
  howStep: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  howStepText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  howText: { fontSize: Typography.sm, color: Colors.textSecondary, flex: 1 },
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
});
