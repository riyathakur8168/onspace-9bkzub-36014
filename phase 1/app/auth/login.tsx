import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { authApi } from '@/services/api';
import { Role, ROLES } from '@/constants/config';
import {
  validatePhone,
  checkPasswordStrength,
  validateConfirmPassword,
  validatePincode,
  validateCity,
  validateAddress,
  validateEmail,
  validateFullName,
} from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { registerWithPassword, loginWithPassword, login } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.mode === 'signup' ? 'signup' : 'login'
  );
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES.CUSTOMER);

  // Login Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form Fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');

  // Shared Verification Session State
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');

  // 1. Normal Phone OTP Verification State
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState<string[]>(['', '', '', '', '', '']);
  const phoneInputRefs = useRef<Array<TextInput | null>>([]);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Touch / Blur tracking for inline field errors
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Submission Status
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.mode === 'signup') {
      setMode('signup');
    } else if (searchParams.mode === 'login') {
      setMode('login');
    }
  }, [searchParams.mode]);

  // Resend cooldown timer for Mobile Phone OTP
  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const timer = setInterval(() => {
      setPhoneCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneCooldown]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAadhaarChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 12);
    setAadhaarNumber(cleaned);
  };

  const handleSignupEmailChange = (text: string) => {
    setSignupEmail(text);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(cleaned);
    if (phoneVerified || phoneOtpSent) {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneDigits(['', '', '', '', '', '']);
      setPhoneError(null);
    }
  };

  const handlePincodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(cleaned);
  };

  // Field level validations
  const phoneValidation = validatePhone(phone);
  const passStrength = checkPasswordStrength(signupPassword);
  const confirmVal = validateConfirmPassword(signupPassword, confirmPassword);
  const nameVal = validateFullName(fullName);
  const signupEmailVal = validateEmail(signupEmail);
  const addressVal = validateAddress(address);
  const cityVal = validateCity(city);
  const pincodeVal = validatePincode(pincode);

  // Normal Phone OTP Handlers
  const handleRequestPhoneOTP = async () => {
    if (phoneLoading) return;
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile phone number.');
      showToast('Please enter a valid 10-digit mobile phone number.', 'error');
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const res = await authApi.requestPhoneOtp(cleaned, sessionId || undefined);
      if (res.error) {
        setPhoneError(res.error);
        showToast(res.error, 'error');
        return;
      }

      if (res.data) {
        setSessionId(res.data.session_id);
        setPhoneOtpSent(true);
        setPhoneCooldown(30);
        showToast(res.data.message || 'OTP sent to your mobile phone number.', 'success');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to send OTP. Please try again.';
      setPhoneError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePhoneDigitChange = (text: string, index: number) => {
    setPhoneError(null);
    const cleaned = text.replace(/[^0-9]/g, '');
    const newDigits = [...phoneDigits];
    newDigits[index] = cleaned;
    setPhoneDigits(newDigits);

    if (cleaned && index < 5) {
      phoneInputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d.length === 1) && index === 5) {
      handleVerifyPhoneOTP(newDigits.join(''));
    }
  };

  const handleVerifyPhoneOTP = async (codeString?: string) => {
    if (phoneLoading) return;
    const code = codeString || phoneDigits.join('');
    if (code.length < 6) {
      const errMsg = 'Wrong OTP. Please enter the correct OTP.';
      setPhoneError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const res = await authApi.verifyPhoneOtp(sessionId || '', phone.replace(/\D/g, ''), code);
      if (res.error || !res.data?.success) {
        const errMsg = res.error || 'Wrong OTP. Please enter the correct OTP.';
        setPhoneError(errMsg);
        showToast(errMsg, 'error');
        return;
      }

      setPhoneVerified(true);
      setPhoneOtpSent(false);
      showToast('✓ Mobile phone number verified successfully!', 'success');
    } catch (err: any) {
      const errMsg = err?.message || 'Wrong OTP. Please enter the correct OTP.';
      setPhoneError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Submit Handler for Signup
  const handleSignupSubmit = async () => {
    setFormError(null);
    setFormSuccess(null);

    setTouched({
      name: true,
      email: true,
      phone: true,
      aadhaar: true,
      password: true,
      confirmPassword: true,
      address: true,
      city: true,
      pincode: true,
    });

    if (!nameVal.isValid) { setFormError(nameVal.error!); return; }
    if (aadhaarNumber.replace(/\D/g, '').length !== 12) {
      setFormError('Please enter a valid 12-digit Aadhaar number.');
      showToast('Please enter a valid 12-digit Aadhaar number.', 'error');
      return;
    }
    if (!phoneValidation.isValid) { setFormError(phoneValidation.error!); return; }
    if (!phoneVerified) {
      const msg = 'Please verify your mobile phone number via OTP first.';
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }
    if (!signupEmailVal.isValid) { setFormError(signupEmailVal.error!); return; }
    if (!passStrength.isValid) { setFormError('Password must be at least 8 characters and contain uppercase letters, lowercase letters, numbers, and special characters.'); return; }
    if (!confirmVal.isValid) { setFormError(confirmVal.error!); return; }
    if (!addressVal.isValid) { setFormError(addressVal.error!); return; }
    if (!cityVal.isValid) { setFormError(cityVal.error!); return; }
    if (!pincodeVal.isValid) { setFormError(pincodeVal.error!); return; }

    setLoading(true);
    const res = await registerWithPassword(
      fullName.trim(),
      signupEmail.trim(),
      phone.trim(),
      signupPassword,
      selectedRole,
      address.trim(),
      city.trim(),
      pincode.trim(),
      sessionId || undefined,
      aadhaarNumber.replace(/\D/g, '')
    );
    setLoading(false);

    if (!res.success) {
      setFormError(res.error || 'Registration failed. Please check your information.');
      return;
    }

    setFormSuccess('Account created and verified! Redirecting...');
    setTimeout(() => {
      if (selectedRole === ROLES.CUSTOMER) {
        router.replace('/(customer)');
      } else {
        router.replace('/onboarding/worker');
      }
    }, 600);
  };

  // Submit Handler for Login
  const handleLoginSubmit = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (!email.trim() || !password) {
      setFormError('Please enter your email/phone and password.');
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setFormError(res.error || 'Login failed. Please check credentials.');
      return;
    }

    setFormSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      const userRole = ('role' in res ? res.role : undefined) || selectedRole;
      if (userRole === ROLES.ADMIN) {
        router.replace('/(admin)/workers');
      } else if (userRole === ROLES.WORKER) {
        router.replace('/(worker)');
      } else {
        router.replace('/(customer)');
      }
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* TOP TOAST POPUP OVERLAY */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 8 }]}>
          <View style={[styles.toastContent, toastType === 'error' ? styles.toastError : styles.toastSuccess]}>
            <MaterialIcons
              name={toastType === 'error' ? 'error-outline' : 'check-circle-outline'}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + Spacing[6] }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="handshake" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>OnePlace</Text>
          <Text style={styles.appTagline}>Cooperative Services Platform</Text>
        </View>

        {/* Auth Mode Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
            onPress={() => { setMode('login'); setFormError(null); setFormSuccess(null); }}
          >
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleActiveText]}>Log In</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
            onPress={() => { setMode('signup'); setFormError(null); setFormSuccess(null); }}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleActiveText]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Form Error Banner */}
        {formError && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}

        {/* Form Success Banner */}
        {formSuccess && (
          <View style={styles.successBanner}>
            <MaterialIcons name="check-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.successText}>{formSuccess}</Text>
          </View>
        )}

        {/* MODE: SIGNUP */}
        {mode === 'signup' && (
          <View style={styles.formContainer}>
            {/* Account Type Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Choose Account Type</Text>
              <View style={styles.roleSelectionRow}>
                <Pressable
                  style={[
                    styles.roleOptionCard,
                    selectedRole === ROLES.CUSTOMER && styles.roleOptionCustomerActive
                  ]}
                  onPress={() => setSelectedRole(ROLES.CUSTOMER)}
                >
                  <MaterialIcons
                    name="home-repair-service"
                    size={24}
                    color={selectedRole === ROLES.CUSTOMER ? Colors.customerColor : Colors.textTertiary}
                  />
                  <View style={styles.roleOptionTextWrap}>
                    <Text style={[styles.roleOptionTitle, selectedRole === ROLES.CUSTOMER && { color: Colors.customerColor }]}>
                      Customer
                    </Text>
                    <Text style={styles.roleOptionDesc}>Book verified services</Text>
                  </View>
                  {selectedRole === ROLES.CUSTOMER && (
                    <MaterialIcons name="check-circle" size={18} color={Colors.customerColor} />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.roleOptionCard,
                    selectedRole === ROLES.WORKER && styles.roleOptionWorkerActive
                  ]}
                  onPress={() => setSelectedRole(ROLES.WORKER)}
                >
                  <MaterialIcons
                    name="engineering"
                    size={24}
                    color={selectedRole === ROLES.WORKER ? Colors.workerColor : Colors.textTertiary}
                  />
                  <View style={styles.roleOptionTextWrap}>
                    <Text style={[styles.roleOptionTitle, selectedRole === ROLES.WORKER && { color: Colors.workerColor }]}>
                      Worker
                    </Text>
                    <Text style={styles.roleOptionDesc}>Provide services & earn</Text>
                  </View>
                  {selectedRole === ROLES.WORKER && (
                    <MaterialIcons name="check-circle" size={18} color={Colors.workerColor} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <View style={[styles.inputWrapper, touched.name && !nameVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="person" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textTertiary}
                  value={fullName}
                  onChangeText={setFullName}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                />
              </View>
              {touched.name && !nameVal.isValid && (
                <Text style={styles.inlineErrorText}>{nameVal.error}</Text>
              )}
            </View>

            {/* Contact Mobile Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contact Mobile Phone Number (10 Digits) *</Text>
              <View style={[styles.phoneInputRow, touched.phone && !phoneValidation.isValid && styles.inputWrapperError]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9876543210"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                />
              </View>
              {touched.phone && !phoneValidation.isValid && (
                <Text style={styles.inlineErrorText}>{phoneValidation.error}</Text>
              )}
            </View>

            {/* Aadhaar Number Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Aadhaar Number *</Text>
              <View style={[styles.inputWrapper, touched.aadhaar && aadhaarNumber.replace(/\D/g, '').length !== 12 && styles.inputWrapperError]}>
                <MaterialIcons name="fingerprint" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12-digit Aadhaar number"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChangeText={handleAadhaarChange}
                  onBlur={() => setTouched(prev => ({ ...prev, aadhaar: true }))}
                />
              </View>
              <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 2 }}>
                Used for identification records. No Aadhaar OTP required.
              </Text>
            </View>

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email *</Text>
              <View style={[styles.inputWrapper, touched.email && !signupEmailVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="email" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={signupEmail}
                  onChangeText={handleSignupEmailChange}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                />
              </View>
              {touched.email && !signupEmailVal.isValid && (
                <Text style={styles.inlineErrorText}>{signupEmailVal.error}</Text>
              )}
            </View>

            {/* ================================================== */}
            {/* MOBILE PHONE OTP VERIFICATION CARD */}
            {/* ================================================== */}
            <View style={{ marginVertical: Spacing[2] }}>
              <View style={styles.verificationCard}>
                <View style={styles.verifCardHeader}>
                  <MaterialIcons name="phone-android" size={20} color={Colors.primary} />
                  <Text style={styles.verifCardTitle}>Mobile Phone Verification *</Text>
                  <View style={[styles.statusPill, phoneVerified ? styles.pillSuccess : styles.pillWarning]}>
                    <Text style={[styles.statusPillText, phoneVerified ? styles.pillTextSuccess : styles.pillTextWarning]}>
                      {phoneVerified ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {phoneVerified ? (
                  <View style={styles.verifiedStateBox}>
                    <MaterialIcons name="check-circle" size={20} color="#047857" />
                    <Text style={styles.verifiedStateText}>✓ Mobile phone number verified successfully.</Text>
                  </View>
                ) : (
                  <View style={{ gap: Spacing[2] }}>
                    {!phoneOtpSent ? (
                      <Pressable
                        style={[styles.actionBtn, (phone.replace(/\D/g, '').length !== 10 || phoneLoading) && styles.btnDisabled]}
                        onPress={handleRequestPhoneOTP}
                        disabled={phone.replace(/\D/g, '').length !== 10 || phoneLoading}
                      >
                        {phoneLoading ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.actionBtnText}>Sending OTP...</Text>
                          </View>
                        ) : (
                          <>
                            <MaterialIcons name="send" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Send Mobile OTP</Text>
                          </>
                        )}
                      </Pressable>
                    ) : (
                      <View style={styles.otpDrawerBox}>
                        <Text style={styles.otpInstructionText}>
                          OTP sent to +91 {phone}.
                        </Text>
                        {phoneError && <Text style={styles.inlineErrorText}>{phoneError}</Text>}
                        <View style={styles.otpGrid}>
                          {phoneDigits.map((digit, i) => (
                            <TextInput
                              key={i}
                              ref={ref => { phoneInputRefs.current[i] = ref; }}
                              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                              keyboardType="number-pad"
                              maxLength={1}
                              value={digit}
                              onChangeText={text => handlePhoneDigitChange(text, i)}
                              selectTextOnFocus
                            />
                          ))}
                        </View>
                        <View style={styles.otpActionRow}>
                          <Pressable
                            style={[styles.verifyOtpBtn, (phoneDigits.join('').length < 6 || phoneLoading) && styles.btnDisabled]}
                            onPress={() => handleVerifyPhoneOTP()}
                            disabled={phoneDigits.join('').length < 6 || phoneLoading}
                          >
                            {phoneLoading ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.verifyOtpBtnText}>Verifying OTP...</Text>
                              </View>
                            ) : (
                              <Text style={styles.verifyOtpBtnText}>Verify OTP</Text>
                            )}
                          </Pressable>
                          <Pressable onPress={handleRequestPhoneOTP} disabled={phoneCooldown > 0 || phoneLoading}>
                            <Text style={[styles.resendText, phoneCooldown > 0 && styles.resendDisabled]}>
                              {phoneCooldown > 0 ? `Resend OTP in ${phoneCooldown}s` : 'Resend OTP'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Password Creation */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Create Password *</Text>
              <View style={[styles.inputWrapper, touched.password && !passStrength.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="lock" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password *</Text>
              <View style={[styles.inputWrapper, touched.confirmPassword && !confirmVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="lock" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                />
              </View>
              {touched.confirmPassword && !confirmVal.isValid && (
                <Text style={styles.inlineErrorText}>{confirmVal.error}</Text>
              )}
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address / Locality *</Text>
              <View style={[styles.inputWrapper, touched.address && !addressVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="location-on" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="House No, Street, Colony, Area"
                  placeholderTextColor={Colors.textTertiary}
                  value={address}
                  onChangeText={setAddress}
                  onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                />
              </View>
              {touched.address && !addressVal.isValid && (
                <Text style={styles.inlineErrorText}>{addressVal.error}</Text>
              )}
            </View>

            {/* City & PIN Code Row */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>City *</Text>
                <View style={[styles.inputWrapper, touched.city && !cityVal.isValid && styles.inputWrapperError]}>
                  <MaterialIcons name="location-city" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Bengaluru"
                    placeholderTextColor={Colors.textTertiary}
                    value={city}
                    onChangeText={setCity}
                    onBlur={() => setTouched(prev => ({ ...prev, city: true }))}
                  />
                </View>
                {touched.city && !cityVal.isValid && (
                  <Text style={styles.inlineErrorText}>{cityVal.error}</Text>
                )}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>PIN Code (6 Digits) *</Text>
                <View style={[styles.inputWrapper, touched.pincode && !pincodeVal.isValid && styles.inputWrapperError]}>
                  <MaterialIcons name="markunread-mailbox" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="560034"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={handlePincodeChange}
                    onBlur={() => setTouched(prev => ({ ...prev, pincode: true }))}
                  />
                </View>
                {touched.pincode && !pincodeVal.isValid && (
                  <Text style={styles.inlineErrorText}>{pincodeVal.error}</Text>
                )}
              </View>
            </View>

            {/* Signup Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.btnPressed,
                (!phoneVerified || loading) && styles.btnDisabled
              ]}
              onPress={handleSignupSubmit}
              disabled={loading || !phoneVerified}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {selectedRole === ROLES.CUSTOMER ? 'Complete Customer Account' : 'Continue to Worker Profile'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </Pressable>

            {!phoneVerified ? (
              <Text style={{ fontSize: Typography.xs, color: Colors.error, textAlign: 'center', marginTop: Spacing[1] }}>
                🔒 Complete mobile phone OTP verification above to unlock signup.
              </Text>
            ) : null}

            {/* Secondary Option: Switch to Log In */}
            <Pressable
              style={styles.switchModeRow}
              onPress={() => { setMode('login'); setFormError(null); setFormSuccess(null); }}
            >
              <Text style={styles.switchModeText}>
                Already have an account? <Text style={styles.switchModeHighlight}>Log In</Text>
              </Text>
            </Pressable>
          </View>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address or Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com or 9876543210"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled
              ]}
              onPress={handleLoginSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Log In to Account</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </Pressable>

            {/* Quick Roles Shortcut for Demo */}
            <View style={styles.demoDividerRow}>
              <View style={styles.demoDividerLine} />
              <Text style={styles.demoDividerText}>OR QUICK LOGIN AS</Text>
              <View style={styles.demoDividerLine} />
            </View>

            <View style={styles.demoRoleBtnsRow}>
              <Pressable style={styles.demoRoleBtn} onPress={() => login(ROLES.CUSTOMER)}>
                <MaterialIcons name="person" size={16} color={Colors.customerColor} />
                <Text style={styles.demoRoleBtnText}>Customer</Text>
              </Pressable>
              <Pressable style={styles.demoRoleBtn} onPress={() => login(ROLES.WORKER)}>
                <MaterialIcons name="engineering" size={16} color={Colors.workerColor} />
                <Text style={styles.demoRoleBtnText}>Worker</Text>
              </Pressable>
              <Pressable style={styles.demoRoleBtn} onPress={() => login(ROLES.ADMIN)}>
                <MaterialIcons name="admin-panel-settings" size={16} color={Colors.adminColor} />
                <Text style={styles.demoRoleBtnText}>Admin</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.switchModeRow}
              onPress={() => { setMode('signup'); setFormError(null); setFormSuccess(null); }}
            >
              <Text style={styles.switchModeText}>
                Don't have an account? <Text style={styles.switchModeHighlight}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing[5],
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing[4],
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  appName: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  appTagline: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing[4],
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  toggleActive: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  toggleText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
  },
  toggleActiveText: {
    color: Colors.primary,
  },
  formContainer: {
    gap: Spacing[4],
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    height: 48,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: Spacing[2],
  },
  input: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    height: 48,
  },
  countryCode: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    marginRight: Spacing[2],
  },
  phoneInput: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  roleOptionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  roleOptionCustomerActive: {
    borderColor: Colors.customerColor,
    backgroundColor: '#ECFDF5',
  },
  roleOptionWorkerActive: {
    borderColor: Colors.workerColor,
    backgroundColor: '#FFFBEB',
  },
  roleOptionTextWrap: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  roleOptionDesc: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.errorLight,
    padding: Spacing[3],
    borderRadius: Radius.md,
    marginBottom: Spacing[3],
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.successLight,
    padding: Spacing[3],
    borderRadius: Radius.md,
    marginBottom: Spacing[3],
  },
  successText: {
    fontSize: Typography.xs,
    color: Colors.success,
    flex: 1,
  },
  inlineErrorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Radius.lg,
    marginTop: Spacing[2],
    ...Shadow.md,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  switchModeRow: {
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  switchModeText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  switchModeHighlight: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginVertical: Spacing[4],
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  demoDividerText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.textTertiary,
  },
  demoRoleBtnsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
  },
  demoRoleBtnText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  // Toast Popup Styles
  toastContainer: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.lg,
    maxWidth: '92%',
    ...Shadow.md,
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastSuccess: {
    backgroundColor: '#059669',
  },
  toastText: {
    color: '#ffffff',
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    flexShrink: 1,
  },
  // Verification Card Styles
  verificationCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  verifCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  verifCardTitle: {
    flex: 1,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pillSuccess: {
    backgroundColor: '#D1FAE5',
  },
  pillWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  pillTextSuccess: {
    color: '#047857',
  },
  pillTextWarning: {
    color: '#B45309',
  },
  verifiedStateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: '#ECFDF5',
    padding: Spacing[3],
    borderRadius: Radius.md,
  },
  verifiedStateText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#047857',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  otpInstructionText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing[1],
  },
  otpDrawerBox: {
    backgroundColor: Colors.surface,
    padding: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[2],
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing[2],
  },
  otpInput: {
    width: 40,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    textAlign: 'center',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceTinted,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '30',
  },
  otpActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  verifyOtpBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  verifyOtpBtnText: {
    color: '#fff',
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  resendText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
  resendDisabled: {
    color: Colors.textTertiary,
  },
});
