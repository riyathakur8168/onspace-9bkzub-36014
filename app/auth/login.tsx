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
  const { registerWithPassword, loginWithPassword, sendOTP, verifyOTP, pendingOTP, login } = useApp();

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
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');

  // Inline Phone Verification State
  const [showOtpDrawer, setShowOtpDrawer] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [cooldown, setCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

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

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handler for phone number edits -> invalidates previous OTP verification
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(cleaned);
    if (phoneVerified || showOtpDrawer) {
      setPhoneVerified(false);
      setShowOtpDrawer(false);
      setOtpSuccess(null);
      setOtpError(null);
      setDigits(['', '', '', '', '', '']);
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

  // Inline OTP Handlers
  const handleRequestOTP = async () => {
    if (!phoneValidation.isValid) {
      setOtpError(phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    const res = await sendOTP(phone);
    setOtpLoading(false);

    if (!res.success) {
      setOtpError(res.error || 'Failed to send OTP. Please try again.');
      return;
    }

    setShowOtpDrawer(true);
    setCooldown(30);
    setOtpSuccess(`6-digit code sent to +91 ${phone}`);
  };

  const handleDigitChange = (text: string, index: number) => {
    setOtpError(null);
    const cleaned = text.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d.length === 1) && index === 5) {
      handleVerifyInlineOTP(newDigits.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyInlineOTP = async (codeString?: string) => {
    const code = codeString || digits.join('');
    if (code.length < 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    const res = await verifyOTP(code, phone);
    setOtpLoading(false);

    if (!res.success) {
      setOtpError(res.error || 'Invalid verification code.');
      return;
    }

    setPhoneVerified(true);
    setShowOtpDrawer(false);
    setOtpSuccess('Phone number verified successfully!');
  };

  // Submit Handler for Signup
  const handleSignupSubmit = async () => {
    setFormError(null);
    setFormSuccess(null);

    // Touch all fields to show any missing errors
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      address: true,
      city: true,
      pincode: true,
    });

    if (!nameVal.isValid) { setFormError(nameVal.error!); return; }
    if (!signupEmailVal.isValid) { setFormError(signupEmailVal.error!); return; }
    if (!phoneValidation.isValid) { setFormError(phoneValidation.error!); return; }
    if (!phoneVerified) { setFormError('Please verify your mobile phone number with OTP first.'); return; }
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
      phoneVerified
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
      setFormError(res.error || 'Login failed. Please check your credentials.');
      return;
    }

    const userRole = (res as any).role || (res as any).user?.role;
    if (userRole === ROLES.WORKER) {
      router.replace('/(worker)');
    } else if (userRole === ROLES.ADMIN) {
      router.replace('/(admin)');
    } else {
      router.replace('/(customer)');
    }
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
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + Spacing[8] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="handshake" size={28} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>OnePlace</Text>
          <Text style={styles.brandSubtitle}>
            {mode === 'login'
              ? 'Welcome back to your service community'
              : 'Join OnePlace for fair & verified local services'}
          </Text>
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
              <Text style={styles.fieldLabel}>Full Name</Text>
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

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, touched.email && !signupEmailVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="email" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                />
              </View>
              {touched.email && !signupEmailVal.isValid && (
                <Text style={styles.inlineErrorText}>{signupEmailVal.error}</Text>
              )}
            </View>

            {/* Mobile Phone Number with Inline OTP Verification */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Mobile Phone Number (10 Digits)</Text>
                {phoneVerified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                    <Text style={styles.verifiedBadgeText}>Phone Verified</Text>
                  </View>
                )}
              </View>

              <View style={[
                styles.phoneInputRow,
                touched.phone && !phoneValidation.isValid && styles.inputWrapperError,
                phoneVerified && styles.phoneInputRowVerified
              ]}>
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
                {!phoneVerified && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.verifyPhoneBtn,
                      (!phoneValidation.isValid || otpLoading) && styles.verifyPhoneBtnDisabled,
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={handleRequestOTP}
                    disabled={!phoneValidation.isValid || otpLoading}
                  >
                    {otpLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.verifyPhoneBtnText}>Verify</Text>
                    )}
                  </Pressable>
                )}
              </View>

              {touched.phone && !phoneValidation.isValid && (
                <Text style={styles.inlineErrorText}>{phoneValidation.error}</Text>
              )}

              {/* Inline OTP Section */}
              {showOtpDrawer && !phoneVerified && (
                <View style={styles.inlineOtpDrawer}>
                  <View style={styles.otpHeaderRow}>
                    <MaterialIcons name="shield" size={18} color={Colors.primary} />
                    <Text style={styles.otpDrawerTitle}>Enter 6-Digit Verification Code</Text>
                  </View>
                  <Text style={styles.otpDrawerSub}>
                    Sent to +91 {phone}. <Text style={{ fontWeight: Typography.bold, color: Colors.accentDark }}>Demo Code: {pendingOTP || '123456'}</Text>
                  </Text>

                  {otpError && (
                    <Text style={styles.inlineErrorText}>{otpError}</Text>
                  )}
                  {otpSuccess && (
                    <Text style={styles.inlineSuccessText}>{otpSuccess}</Text>
                  )}

                  <View style={styles.otpGrid}>
                    {digits.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={ref => { inputRefs.current[i] = ref; }}
                        style={[
                          styles.otpInput,
                          digit ? styles.otpInputFilled : null,
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

                  <View style={styles.otpActionRow}>
                    <Pressable
                      style={[styles.verifyOtpBtn, digits.join('').length < 6 && styles.btnDisabled]}
                      onPress={() => handleVerifyInlineOTP()}
                      disabled={digits.join('').length < 6 || otpLoading}
                    >
                      {otpLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.verifyOtpBtnText}>Verify OTP Code</Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={handleRequestOTP}
                      disabled={cooldown > 0 || otpLoading}
                    >
                      <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Password Creation with Real-time Checklist */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Create Password</Text>
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

              {/* Password Requirement Checklist */}
              {signupPassword.length > 0 && (
                <View style={styles.passwordChecklist}>
                  <View style={styles.checkItem}>
                    <MaterialIcons
                      name={passStrength.hasMinLength ? 'check-circle' : 'cancel'}
                      size={14}
                      color={passStrength.hasMinLength ? Colors.success : Colors.textTertiary}
                    />
                    <Text style={[styles.checkText, passStrength.hasMinLength && styles.checkTextActive]}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <MaterialIcons
                      name={passStrength.hasUppercase ? 'check-circle' : 'cancel'}
                      size={14}
                      color={passStrength.hasUppercase ? Colors.success : Colors.textTertiary}
                    />
                    <Text style={[styles.checkText, passStrength.hasUppercase && styles.checkTextActive]}>
                      Uppercase letter (A-Z)
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <MaterialIcons
                      name={passStrength.hasLowercase ? 'check-circle' : 'cancel'}
                      size={14}
                      color={passStrength.hasLowercase ? Colors.success : Colors.textTertiary}
                    />
                    <Text style={[styles.checkText, passStrength.hasLowercase && styles.checkTextActive]}>
                      Lowercase letter (a-z)
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <MaterialIcons
                      name={passStrength.hasDigit ? 'check-circle' : 'cancel'}
                      size={14}
                      color={passStrength.hasDigit ? Colors.success : Colors.textTertiary}
                    />
                    <Text style={[styles.checkText, passStrength.hasDigit && styles.checkTextActive]}>
                      One numeric digit (0-9)
                    </Text>
                  </View>
                  <View style={styles.checkItem}>
                    <MaterialIcons
                      name={passStrength.hasSpecial ? 'check-circle' : 'cancel'}
                      size={14}
                      color={passStrength.hasSpecial ? Colors.success : Colors.textTertiary}
                    />
                    <Text style={[styles.checkText, passStrength.hasSpecial && styles.checkTextActive]}>
                      Special character (!@#$%^&*-_)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, touched.confirmPassword && !confirmVal.isValid && styles.inputWrapperError]}>
                <MaterialIcons name="lock-clock" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
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
              <Text style={styles.fieldLabel}>Address / Locality</Text>
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
                <Text style={styles.fieldLabel}>City</Text>
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
                <Text style={styles.fieldLabel}>PIN Code (6 Digits)</Text>
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
              disabled={loading}
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
          </View>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address or Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com or 9876543210"
                  placeholderTextColor={Colors.textTertiary}
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
              style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
              onPress={handleLoginSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Log In to Dashboard</Text>
                  <MaterialIcons name="login" size={20} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: Spacing[4],
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
    ...Shadow.md,
  },
  brandTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 280,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.full,
    padding: 4,
    marginVertical: Spacing[3],
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: Radius.full,
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
    fontWeight: Typography.bold,
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
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  successText: {
    fontSize: Typography.xs,
    color: Colors.success,
    flex: 1,
  },
  formContainer: {
    gap: Spacing[3],
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.success,
  },
  roleSelectionRow: {
    gap: Spacing[2],
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing[3],
    gap: Spacing[3],
  },
  roleOptionCustomerActive: {
    borderColor: Colors.customerColor,
    backgroundColor: '#EFF6FF',
  },
  roleOptionWorkerActive: {
    borderColor: Colors.workerColor,
    backgroundColor: '#ECFDF5',
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
    fontSize: Typography.xs,
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
    height: 46,
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
    paddingLeft: Spacing[3],
    paddingRight: 4,
    height: 46,
  },
  phoneInputRowVerified: {
    borderColor: Colors.success,
    backgroundColor: '#F0FDF4',
  },
  countryCode: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  verifyPhoneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  verifyPhoneBtnDisabled: {
    backgroundColor: Colors.border,
  },
  verifyPhoneBtnText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  inlineOtpDrawer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing[3],
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 6,
    gap: 6,
    ...Shadow.sm,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpDrawerTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  otpDrawerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  otpGrid: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginVertical: 4,
  },
  otpInput: {
    width: 38,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceTinted,
    textAlign: 'center',
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  otpActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  verifyOtpBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[3],
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  verifyOtpBtnText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  resendText: {
    fontSize: 11,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textTertiary,
  },
  passwordChecklist: {
    backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.sm,
    padding: Spacing[2],
    gap: 4,
    marginTop: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  checkTextActive: {
    color: Colors.success,
    fontWeight: Typography.semibold,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  inlineErrorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 2,
  },
  inlineSuccessText: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.md,
    gap: Spacing[2],
    marginTop: Spacing[2],
    ...Shadow.sm,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
});
