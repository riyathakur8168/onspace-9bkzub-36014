import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { MOCK_WORKERS } from '@/services/mockData';

export default function WorkerProfile() {
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const worker = MOCK_WORKERS.find((w) => w.id === 'w1') || MOCK_WORKERS[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>My Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{currentUser?.name?.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{currentUser?.name}</Text>
            <Text style={styles.userPhone}>{currentUser?.phone}</Text>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color={Colors.primary} />
              <Text style={styles.verifiedText}>KYC Verified</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: String(worker.jobsCompleted), label: 'Jobs Done' },
            { value: String(worker.rating), label: 'Rating' },
            { value: `₹${(worker.recentEarnings / 1000).toFixed(1)}K`, label: 'This Month' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills & Services</Text>
          <View style={styles.skillsRow}>
            {worker.skills.map((s) => (
              <View key={s} style={styles.skillChip}>
                <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Service Area */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Service Area</Text>
          <View style={styles.areaRow}>
            <MaterialIcons name="location-on" size={16} color={Colors.primary} />
            <Text style={styles.areaText}>{worker.serviceArea}</Text>
          </View>
          <Text style={styles.areaNote}>Radius: 10 km from your registered address</Text>
        </View>

        {/* Training */}
        <View style={styles.trainingCard}>
          <View style={styles.trainingHeader}>
            <MaterialIcons name="school" size={18} color={Colors.primary} />
            <Text style={styles.trainingTitle}>Training & Certifications</Text>
          </View>
          <Text style={styles.trainingText}>Complete training modules to unlock higher-value job categories and improve your allocation score.</Text>
          <Pressable style={styles.trainingBtn}>
            <Text style={styles.trainingBtnText}>View Available Courses</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={() => { logout(); router.replace('/'); }}>
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary, paddingTop: Spacing.md, marginBottom: Spacing.md },
  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, marginBottom: Spacing.sm },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.workerPrimary + '20', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { ...Typography.sectionTitle, color: Colors.workerPrimary },
  userName: { ...Typography.bodyLarge, fontWeight: '700', color: Colors.textPrimary },
  userPhone: { ...Typography.bodySmall, color: Colors.textSecondary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, ...Shadow.sm },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { ...Typography.amountSmall, color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, ...Shadow.sm },
  sectionTitle: { ...Typography.label, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.successLight, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.full },
  skillText: { ...Typography.label, color: Colors.success, fontWeight: '600' },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  areaText: { ...Typography.bodyMedium, color: Colors.textPrimary },
  areaNote: { ...Typography.caption, color: Colors.textMuted },
  trainingCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: Spacing.sm },
  trainingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
  trainingTitle: { ...Typography.label, fontWeight: '700', color: Colors.primaryDark },
  trainingText: { ...Typography.bodySmall, color: Colors.primaryDark, lineHeight: 20, marginBottom: Spacing.sm },
  trainingBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 9, alignItems: 'center' },
  trainingBtnText: { ...Typography.button, color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error + '40', backgroundColor: Colors.errorLight },
  logoutText: { ...Typography.button, color: Colors.error },
});
