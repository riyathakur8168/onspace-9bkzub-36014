import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  ScrollView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { UserRole } from '@/services/mockData';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    image: require('@/assets/images/onboarding-1.png'),
    title: 'Verified Local Professionals',
    subtitle: 'Connect with skilled, background-verified workers in your neighbourhood — plumbers, electricians, carpenters and more.',
  },
  {
    image: require('@/assets/images/onboarding-2.png'),
    title: 'Fair Opportunity Allocation',
    subtitle: 'Every eligible worker gets a fair chance. Our transparent matching considers skill, availability, distance and recent workload — not just ratings.',
  },
  {
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Clear Earnings & Cooperative Pool',
    subtitle: 'Workers earn 85% of every job. The 15% cooperative pool funds training, safety, technology and worker welfare.',
  },
];

const ROLES = [
  { key: 'customer' as UserRole, label: 'I need services', sub: 'Book verified professionals', icon: 'home-repair-service', color: Colors.customerPrimary },
  { key: 'worker' as UserRole, label: 'I am a worker', sub: 'Find jobs, track earnings', icon: 'engineering', color: Colors.workerPrimary },
  { key: 'admin' as UserRole, label: 'Admin / Cooperative', sub: 'Manage platform & workers', icon: 'admin-panel-settings', color: Colors.adminPrimary },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [step, setStep] = useState<'slides' | 'role'>('slides');
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToSlide = (index: number) => {
    setSlide(index);
    scrollRef.current?.scrollTo({ x: W * index, animated: true });
  };

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      goToSlide(slide + 1);
    } else {
      setStep('role');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    if (role === 'customer') router.replace('/(customer)');
    else if (role === 'worker') router.replace('/(worker)');
    else router.replace('/(admin)');
  };

  if (step === 'role') {
    return (
      <SafeAreaView style={styles.roleContainer}>
        <View style={styles.roleHeader}>
          <View style={styles.logoMark}>
            <MaterialIcons name="place" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>OnePlace</Text>
          <Text style={styles.roleSubheading}>How will you use OnePlace?</Text>
          <Text style={styles.roleCaption}>You can switch roles from your profile later.</Text>
        </View>

        <View style={styles.roleList}>
          {ROLES.map((r) => (
            <Pressable
              key={r.key}
              style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
              onPress={() => handleRoleSelect(r.key)}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: r.color + '18' }]}>
                <MaterialIcons name={r.icon as any} size={28} color={r.color} />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={styles.roleLabel}>{r.label}</Text>
                <Text style={styles.roleSub}>{r.sub}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.mockNote}>DEMO MODE — No real account needed</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.slideScroll}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width: W }]}>
            <Image
              source={s.image}
              style={styles.slideImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.slideGradient} />
            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{s.title}</Text>
              <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.controls} edges={['bottom']}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goToSlide(i)}>
              <View style={[styles.dot, i === slide && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Pressable style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{slide === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
        {slide < SLIDES.length - 1 && (
          <Pressable onPress={() => setStep('role')}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slideScroll: { flex: 1 },
  slide: { flex: 1, position: 'relative' },
  slideImage: { ...StyleSheet.absoluteFillObject },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    backgroundImage: undefined,
  },
  slideContent: {
    position: 'absolute',
    bottom: 160,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  slideTitle: {
    ...Typography.pageTitle,
    fontSize: 26,
    color: '#fff',
    marginBottom: Spacing.sm,
  },
  slideSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 24, backgroundColor: '#fff' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    width: '100%',
    justifyContent: 'center',
  },
  nextBtnPressed: { opacity: 0.85 },
  nextBtnText: { ...Typography.button, color: '#fff', fontSize: 16 },
  skipText: { ...Typography.label, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // Role step
  roleContainer: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg },
  roleHeader: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  logoMark: {
    width: 56, height: 56, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoText: { ...Typography.pageTitle, fontSize: 26, color: Colors.textPrimary, marginBottom: Spacing.xs },
  roleSubheading: { ...Typography.sectionTitle, color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.xs },
  roleCaption: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  roleList: { gap: Spacing.sm, marginTop: Spacing.md },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleCardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  roleIconWrap: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  roleTextWrap: { flex: 1 },
  roleLabel: { ...Typography.bodyLarge, fontWeight: '600', color: Colors.textPrimary },
  roleSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  mockNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
});
