import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { UserRole } from '@/services/types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface RoleCardProps {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
}

function RoleCard({ role, title, subtitle, icon, color, bgColor, onPress }: RoleCardProps) {
  return (
    <TouchableOpacity style={[styles.roleCard, Shadow.md]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.roleIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.roleText}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSubtle} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { login, user } = useApp();

  useEffect(() => {
    if (user) {
      if (user.role === 'customer') router.replace('/(customer)');
      else if (user.role === 'worker') router.replace('/(worker)');
      else if (user.role === 'admin') router.replace('/(admin)');
    }
  }, [user]);

  const handleRoleSelect = (role: UserRole) => {
    login(role);
  };

  const roles: RoleCardProps[] = [
    {
      role: 'customer',
      title: 'I need a service',
      subtitle: 'Book verified local professionals',
      icon: 'home-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      onPress: () => handleRoleSelect('customer'),
    },
    {
      role: 'worker',
      title: 'I am a service worker',
      subtitle: 'Find jobs, track earnings, grow',
      icon: 'construct-outline',
      color: Colors.amber,
      bgColor: Colors.amberLight,
      onPress: () => handleRoleSelect('worker'),
    },
    {
      role: 'admin',
      title: 'Cooperative Admin',
      subtitle: 'Manage workers, monitor platform',
      icon: 'shield-checkmark-outline',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      onPress: () => handleRoleSelect('admin'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="layers" size={24} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>OnePlace</Text>
        </View>
        <Text style={styles.tagline}>Cooperative Local Services</Text>
        <Text style={styles.description}>
          Verified professionals. Fair allocation.{'\n'}Transparent earnings for everyone.
        </Text>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>85% to Workers</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Fair Allocation</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Verified Pros</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>DEMO — Select your role</Text>
        {roles.map(r => (
          <RoleCard key={r.role} {...r} />
        ))}
        <Text style={styles.disclaimer}>
          This is a demo build. Data is mocked for preview purposes.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  logoIcon: {
    width: 40, height: 40, borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white },
  tagline: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: Spacing.sm },
  description: { fontSize: FontSize.lg, fontWeight: FontWeight.medium, color: Colors.white, lineHeight: 26, marginBottom: Spacing.lg },
  pillRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.white },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSubtle,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  roleIcon: {
    width: 52, height: 52, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  roleText: { flex: 1 },
  roleTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  roleSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  disclaimer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textSubtle,
    marginTop: Spacing.sm,
  },
});
