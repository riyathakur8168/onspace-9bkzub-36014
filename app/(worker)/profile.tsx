import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MOCK_WORKERS } from '@/services/mockData';

export default function WorkerProfile() {
  const router = useRouter();
  const { user, logout } = useApp();
  const workerData = MOCK_WORKERS[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
              <Badge label={workerData.verificationStatus === 'verified' ? 'Verified Worker' : 'Pending Verification'} variant={workerData.verificationStatus === 'verified' ? 'success' : 'warning'} />
            </View>
          </View>
          <View style={styles.statsRow}>
            {[
              { val: String(workerData.completedJobs), label: 'Jobs Done' },
              { val: String(workerData.rating), label: 'Rating' },
              { val: workerData.isAvailable ? 'Active' : 'Offline', label: 'Status' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Card>

        <Card style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
          <Text style={styles.sectionTitle}>Skills & Services</Text>
          <View style={styles.skillsWrap}>
            {workerData.skills.map((skill, i) => (
              <View key={i} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
          <Text style={styles.sectionTitle}>Service Area</Text>
          <View style={styles.areaRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.areaText}>{workerData.serviceArea}</Text>
          </View>
        </Card>

        <Card style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md }} padded={false}>
          {[
            { icon: 'document-text-outline', label: 'My Documents & KYC', color: Colors.primary },
            { icon: 'school-outline', label: 'Training & Certifications', color: Colors.amber },
            { icon: 'time-outline', label: 'Availability Schedule', color: Colors.success },
            { icon: 'help-circle-outline', label: 'Help & Support', color: Colors.primary },
          ].map((item, i, arr) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i < arr.length - 1 && styles.menuBorder]} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSubtle} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Button label="Switch Role / Log Out" onPress={() => { logout(); router.replace('/'); }} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileCard: { margin: Spacing.lg, marginBottom: Spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 2 },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSubtle, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.border },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  skillPill: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  skillText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  areaText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
});
