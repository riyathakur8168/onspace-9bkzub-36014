import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { SERVICE_CATEGORIES, MOCK_BOOKINGS } from '@/services/mockData';

export default function CustomerHome() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [search, setSearch] = useState('');

  const activeBooking = MOCK_BOOKINGS.find((b) => b.status === 'confirmed' || b.status === 'en_route' || b.status === 'in_progress');
  const filtered = SERVICE_CATEGORIES.filter((c) =>
    search === '' || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === 'confirmed') return Colors.info;
    if (status === 'en_route') return Colors.warning;
    if (status === 'in_progress') return Colors.success;
    return Colors.textMuted;
  };

  const statusLabel = (status: string) => {
    if (status === 'confirmed') return 'Worker assigned';
    if (status === 'en_route') return 'Worker on the way';
    if (status === 'in_progress') return 'Job in progress';
    return status;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.greetingSub}>What do you need help with today?</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Active Booking Banner */}
        {activeBooking ? (
          <Pressable style={styles.activeBanner} onPress={() => router.push({ pathname: '/booking-detail', params: { id: activeBooking.id } })}>
            <View style={styles.activeBannerLeft}>
              <MaterialIcons name={activeBooking.serviceIcon as any} size={24} color={Colors.primary} />
              <View>
                <Text style={styles.activeBannerTitle}>{activeBooking.issueTitle}</Text>
                <View style={styles.activeBannerRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(activeBooking.status) }]} />
                  <Text style={[styles.activeBannerStatus, { color: statusColor(activeBooking.status) }]}>
                    {statusLabel(activeBooking.status)}
                  </Text>
                </View>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.primary} />
          </Pressable>
        ) : null}

        {/* Quick Promo Strip */}
        <View style={styles.promoStrip}>
          <MaterialIcons name="verified-user" size={16} color={Colors.primary} />
          <Text style={styles.promoText}>All workers are background-verified · 85% earnings go directly to workers</Text>
        </View>

        {/* Services Grid */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.servicesGrid}>
          {filtered.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.serviceCardPressed]}
              onPress={() => router.push({ pathname: '/request-service', params: { categoryId: cat.id } })}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: cat.color + '18' }]}>
                <MaterialIcons name={cat.icon as any} size={26} color={cat.color} />
              </View>
              <Text style={styles.serviceName}>{cat.name}</Text>
              <Text style={styles.servicePrice}>From ₹{cat.basePrice}</Text>
            </Pressable>
          ))}
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How OnePlace Works</Text>
        <View style={styles.stepsCard}>
          {[
            { icon: 'description', label: 'Describe your issue', sub: 'Add photos, preferred time, address' },
            { icon: 'people', label: 'We match fairly', sub: 'Eligible, nearby, lower-workload workers get priority' },
            { icon: 'check-circle', label: 'Job done, pay digitally', sub: 'OTP start & end, instant receipt' },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumWrap}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <MaterialIcons name={step.icon as any} size={22} color={Colors.primary} style={styles.stepIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
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
  greetingSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, marginBottom: Spacing.md, ...Shadow.sm },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, height: 44, ...Typography.bodyMedium, color: Colors.textPrimary },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  activeBannerTitle: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.primaryDark },
  activeBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  activeBannerStatus: { ...Typography.caption, fontWeight: '600' },
  promoStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 8, marginBottom: Spacing.md },
  promoText: { ...Typography.caption, color: Colors.primaryDark, flex: 1 },
  sectionTitle: { ...Typography.sectionTitle, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  serviceCard: { width: '30.5%', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  serviceCardPressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  serviceIconWrap: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  serviceName: { ...Typography.label, color: Colors.textPrimary, textAlign: 'center' },
  servicePrice: { ...Typography.caption, color: Colors.textMuted },
  stepsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  stepNumWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNum: { ...Typography.caption, fontWeight: '700', color: Colors.primary },
  stepIcon: { marginTop: 0 },
  stepLabel: { ...Typography.bodySmall, fontWeight: '600', color: Colors.textPrimary },
  stepSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
});
