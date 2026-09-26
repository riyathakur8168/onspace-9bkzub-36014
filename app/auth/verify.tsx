import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, StatusBar, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, verifyOTP, sendOTP, pendingOTP } = useApp();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [cooldown, setCooldown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 30s Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (text: string, index: number) => {
    setError(null);
    const cleaned = text.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-focus next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (newDigits.every(d => d.length === 1) && index === 5) {
      submitCode(newDigits.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitCode = async (codeString?: string) => {
    const code = codeString || digits.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await verifyOTP(code);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Verification failed. Invalid code.');
      return;
    }

    setSuccessMsg('Identity verified successfully! Redirecting...');
    setTimeout(() => {
      if (user?.role === 'customer') {
        router.replace('/(customer)');
      } else {
        router.replace('/onboarding/worker');
      }
    }, 600);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError(null);
    const res = await sendOTP(user?.email || user?.phone);
    setResending(false);
    if (res.success) {
      setCooldown(30);
      setSuccessMsg(`New 6-digit verification code sent!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing[6], paddingBottom: insets.bottom + Spacing[6] }
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="shield" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit security code to{' '}
          <Text style={{ fontWeight: Typography.bold, color: Colors.textPrimary }}>
            {user?.email || user?.phone || 'your mobile/email'}
          </Text>
        </Text>
        <View style={styles.demoCodeBadge}>
          <MaterialIcons name="vpn-key" size={14} color={Colors.accentDark} />
          <Text style={styles.demoCodeText}>Demo Verification Code: {pendingOTP || '123456'}</Text>
        </View>
      </View>

      {/* Error & Success Banners */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={20} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {successMsg && (
        <View style={styles.successBanner}>
          <MaterialIcons name="check-circle-outline" size={20} color={Colors.success} />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {/* 6-Digit OTP Box Grid */}
      <View style={styles.otpGrid}>
        {digits.map((digit, i) => (
          <TextInput
            key={i}
            ref={ref => { inputRefs.current[i] = ref; }}
            style={[
              styles.otpInput,
              digit ? styles.otpInputFilled : null,
              error ? styles.otpInputError : null
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={text => handleDigitChange(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            autoFocus={i === 0}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Submit Action */}
      <Pressable
        style={({ pressed }) => [
          styles.verifyBtn,
          pressed && styles.btnPressed,
          digits.join('').length < 6 && styles.btnDisabled
        ]}
        onPress={() => submitCode()}
        disabled={loading || digits.join('').length < 6}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Text style={styles.verifyBtnText}>Verify Code & Continue</Text>
            <MaterialIcons name="verified-user" size={20} color="#ffffff" />
          </>
        )}
      </Pressable>

      {/* Resend Cooldown */}
      <View style={styles.resendSection}>
        <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
        <Pressable
          onPress={handleResend}
          disabled={cooldown > 0 || resending}
          style={styles.resendBtn}
        >
          {resending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Verification Code'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
    ...Shadow.sm,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  demoCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
    borderRadius: Radius.md,
    gap: Spacing[1],
    marginTop: Spacing[3],
  },
  demoCodeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.accentDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    width: '100%',
    marginBottom: Spacing[4],
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.error,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    width: '100%',
    marginBottom: Spacing[4],
  },
  successText: {
    fontSize: Typography.sm,
    color: Colors.success,
    flex: 1,
  },
  otpGrid: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginVertical: Spacing[4],
    justifyContent: 'center',
    width: '100%',
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    ...Shadow.sm,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: Radius.md,
    width: '100%',
    gap: Spacing[2],
    marginTop: Spacing[4],
    ...Shadow.sm,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  resendSection: {
    marginTop: Spacing[6],
    alignItems: 'center',
    gap: Spacing[1],
  },
  resendPrompt: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  resendBtn: {
    paddingVertical: Spacing[2],
  },
  resendText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textTertiary,
  },
});
