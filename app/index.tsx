import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, isVerified, isOnboarded, role, isHydrated } = useApp();

  useEffect(() => {
    if (!isHydrated) return;

    if (isLoggedIn) {
      if (!isVerified) {
        router.replace('/auth/verify');
      } else if (role === 'worker' && !isOnboarded) {
        router.replace('/onboarding/worker');
      } else if (role) {
        router.replace(`/(${role})` as any);
      }
    }
  }, [isHydrated, isLoggedIn, isVerified, isOnboarded, role]);

  if (!isHydrated || isLoggedIn) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header with Brand Logo & Top-Right Login / Sign Up */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <MaterialIcons name="handshake" size={22} color="#ffffff" />
          </View>
          <Text style={styles.logoText}>OnePlace</Text>
        </View>

        <View style={styles.authButtonsRow}>
          <Pressable
            style={({ pressed }) => [styles.loginHeaderBtn, pressed && styles.btnPressed]}
            onPress={() => router.push({ pathname: '/auth/login', params: { mode: 'login' } } as any)}
          >
            <Text style={styles.loginHeaderText}>Login</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.signupHeaderBtn, pressed && styles.btnPressed]}
            onPress={() => router.push({ pathname: '/auth/login', params: { mode: 'signup' } } as any)}
          >
            <Text style={styles.signupHeaderText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.tagBadge}>
            <MaterialIcons name="stars" size={14} color={Colors.primary} />
            <Text style={styles.tagBadgeText}>VERIFIED SERVICE MARKETPLACE</Text>
          </View>

          <Text style={styles.heroTitle}>Connect. Work. Grow.</Text>
          <Text style={styles.heroSubtitle}>
            A platform connecting customers with trusted local service professionals.
          </Text>

          {/* Primary Action */}
          <Pressable
            style={({ pressed }) => [styles.primaryCtaBtn, pressed && styles.btnPressed]}
            onPress={() => router.push({ pathname: '/auth/login', params: { mode: 'signup' } } as any)}
          >
            <Text style={styles.primaryCtaText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconWrap, { backgroundColor: Colors.primaryLight }]}>
              <MaterialIcons name="verified-user" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Verified Professionals</Text>
            <Text style={styles.featureDesc}>
              Background-checked experts for plumbing, electrical, carpentry, cleaning, and more.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="balance" size={24} color={Colors.workerColor} />
            </View>
            <Text style={styles.featureTitle}>Fair Work Allocation</Text>
            <Text style={styles.featureDesc}>
              Equitable dispatch algorithm guaranteeing fair job opportunity distribution.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="security" size={24} color={Colors.customerColor} />
            </View>
            <Text style={styles.featureTitle}>Secure OTP Completion</Text>
            <Text style={styles.featureDesc}>
              Jobs are confirmed & settled using one-time verification codes for safety.
            </Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          OnePlace Platform · Safe, Verified & Equitable Local Services
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  logoText: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  authButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  loginHeaderBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
  },
  loginHeaderText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  signupHeaderBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  signupHeaderText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing[4],
  },
  tagBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: Spacing[2],
  },
  heroSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: Spacing[6],
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    width: '100%',
    height: 52,
    borderRadius: Radius.lg,
    gap: Spacing[2],
    ...Shadow.md,
  },
  primaryCtaText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  featuresGrid: {
    gap: Spacing[4],
    marginBottom: Spacing[6],
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  featureTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  featureDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: Spacing[2],
  },
});
