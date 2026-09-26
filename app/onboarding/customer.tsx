import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export default function CustomerOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, saveCustomerProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setError('Please fill in your name, phone number, city, and primary address.');
      return;
    }

    setLoading(true);
    setError(null);
    await saveCustomerProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
    });
    setLoading(false);
    router.replace('/(customer)' as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + Spacing[6] }
        ]}
      >
        {/* Step Bar */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepLine, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customer Profile Setup</Text>
          <Text style={styles.subtitle}>
            Provide your basic contact & address details so local professionals can reach you.
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>City / Metro Area</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="location-city" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bengaluru"
                placeholderTextColor={Colors.textTertiary}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Primary Service Address</Text>
            <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: Spacing[2] }]}>
              <MaterialIcons name="home" size={20} color={Colors.textTertiary} style={[styles.inputIcon, { marginTop: 2 }]} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Flat / House No, Building, Street Name, Landmark"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Pincode / Postal Code (Optional)</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="pin-drop" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="560034"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
              />
            </View>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Complete & Go to Dashboard</Text>
              <MaterialIcons name="check-circle" size={20} color="#ffffff" />
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  stepActive: {
    backgroundColor: Colors.customerColor,
    width: 24,
  },
  stepDone: {
    backgroundColor: Colors.customerColor,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  header: {
    marginBottom: Spacing[5],
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
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
    marginBottom: Spacing[4],
  },
  errorText: {
    fontSize: Typography.sm,
    color: Colors.error,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing[6],
    ...Shadow.sm,
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceTinted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing[2],
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.customerColor,
    height: 52,
    borderRadius: Radius.md,
    gap: Spacing[2],
    ...Shadow.sm,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
});
