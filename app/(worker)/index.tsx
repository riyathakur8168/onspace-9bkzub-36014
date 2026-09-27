import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { MOCK_JOB_OFFERS, MOCK_BOOKINGS } from '@/services/mockData';
import { useAlert } from '@/template';

export default function WorkerHome() {
  const { user } = useApp();
  const { showAlert } = useAlert();
  const [isAvailable, setIsAvailable] = useState(true);
  const todayEarnings = 2040;
  const todayJobs = 2;
  const pendingOffers = MOCK_JOB_OFFERS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
          </View>
          <View style={styles.availRow}>
            <Text style={[styles.availLabel, { color: isAvailable ? Colors.success : Colors.textSubtle }]}>
              {isAvailable ? 'Available' : 'Offline'}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Today Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="cash-outline" size={20} color={Colors.amber} />
            <Text style={styles.statVal}>₹{todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.statVal}>{todayJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            <Text style={styles.statVal}>{pendingOffers.length}</Text>
            <Text style={styles.statLabel}>New Offers</Text>
          </Card>
        </View>

        {/* Job Offers */}
        {pendingOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Job Opportunities</Text>
            {pendingOffers.map(offer => (
              <Card key={offer.id} style={styles.offerCard}>
                <View style={styles.offerTop}>
                  <View style={[styles.offerCatIcon, { backgroundColor: Colors.amberLight }]}>
                    <Ionicons name="flash" size={20} color={Colors.amber} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerTitle}>{offer.category} · {offer.subcategory}</Text>
                    <Text style={styles.offerArea}>{offer.customerArea}</Text>
                  </View>
                  <View style={styles.earningsBox}>
                    <Text style={styles.earningsVal}>₹{offer.workerShare}</Text>
                    <Text style={styles.earningsLabel}>you earn</Text>
                  </View>
                </View>
                <View style={styles.offerMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>{offer.scheduledDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>{offer.scheduledTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate-outline" size={13} color={Colors.textSubtle} />
                    <Text style={styles.metaText}>{offer.distance}</Text>
                  </View>
                </View>
                <View style={styles.allocationBox}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
                  <Text style={styles.allocationText}>{offer.allocationReason}</Text>
                </View>
                <View style={styles.offerActions}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => showAlert('Job Declined', 'You have declined this opportunity. It will be offered to the next eligible worker.')}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => showAlert('Job Accepted!', 'Navigate to the customer location. Share your OTP when you arrive.', [{ text: 'Got it' }])}
                  >
                    <Text style={styles.acceptBtnText}>Accept Job</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Performance</Text>
          <Card>
            {[
              { label: 'Rating', val: '4.8 ⭐', color: Colors.amber },
              { label: 'Completed Jobs', val: '142', color: Colors.primary },
              { label: 'Acceptance Rate', val: '91%', color: Colors.success },
              { label: 'On-time Arrival', val: '96%', color: Colors.success },
            ].map((item, i) => (
              <View key={i} style={[styles.perfRow, i > 0 && styles.perfBorder]}>
                <Text style={styles.perfLabel}>{item.label}</Text>
                <Text style={[styles.perfVal, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  greeting: { fontSize: FontSize.xs, color: Colors.textSecondary },
  userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  availLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.lg, paddingBottom: 0 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: Spacing.sm },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textSubtle, textAlign: 'center' },
  section: { padding: Spacing.lg, paddingBottom: 0 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  offerCard: { marginBottom: Spacing.md },
  offerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  offerCatIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  offerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  offerArea: { fontSize: FontSize.sm, color: Colors.textSecondary },
  earningsBox: { alignItems: 'flex-end' },
  earningsVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  earningsLabel: { fontSize: FontSize.xs, color: Colors.textSubtle },
  offerMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  allocationBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  allocationText: { fontSize: FontSize.xs, color: Colors.primary, flex: 1, lineHeight: 18 },
  offerActions: { flexDirection: 'row', gap: Spacing.sm },
  declineBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.error, alignItems: 'center',
  },
  declineBtnText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.semibold },
  acceptBtn: {
    flex: 2, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  acceptBtnText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  perfBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  perfLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  perfVal: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
