import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput,
  ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/hooks/useApp';

export default function CustomerProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout, bookings, saveCustomerProfile } = useApp();
  const router = useRouter();

  // Active Modal State
  const [activeModal, setActiveModal] = useState<
    'edit_profile' | 'orders' | 'addresses' | 'payments' | 'help' | 'about' | null
  >(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCity, setEditCity] = useState(user?.customerProfile?.city || 'Bengaluru');
  const [editAddress, setEditAddress] = useState(user?.customerProfile?.address || 'Flat 4B, Harmony Apartments, Koramangala');
  const [editPincode, setEditPincode] = useState(user?.customerProfile?.pincode || '560034');
  const [savingProfile, setSavingProfile] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 'a1', label: 'Home', address: user?.customerProfile?.address || 'Flat 4B, Harmony Apartments, Koramangala', pincode: '560034', isDefault: true },
    { id: 'a2', label: 'Office', address: 'Suite 302, Cyber Tower, Indiranagar', pincode: '560038', isDefault: false },
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrText, setNewAddrText] = useState('');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Help & Support State
  const [supportCategory, setSupportCategory] = useState('Booking Issue');
  const [supportText, setSupportText] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSuccessMsg, setSupportSuccessMsg] = useState<string | null>(null);

  const completedJobs = bookings.filter(b => ['completed', 'payment_settled', 'closed'].includes(b.status)).length;
  const totalSpent = bookings.filter(b => ['completed', 'payment_settled'].includes(b.status)).reduce((s, b) => s + b.serviceValue, 0);

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name and phone number.');
      return;
    }
    setSavingProfile(true);
    await saveCustomerProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
      address: editAddress.trim(),
      pincode: editPincode.trim(),
    });
    setSavingProfile(false);
    setActiveModal(null);
    Alert.alert('Profile Updated', 'Your profile details have been updated successfully.');
  };

  const handleAddAddress = () => {
    if (!newAddrLabel.trim() || !newAddrText.trim()) {
      Alert.alert('Invalid Address', 'Please provide a label (e.g. Work) and full address.');
      return;
    }
    setSavedAddresses(prev => [
      ...prev,
      { id: `a_${Date.now()}`, label: newAddrLabel.trim(), address: newAddrText.trim(), pincode: '560001', isDefault: false }
    ]);
    setNewAddrLabel('');
    setNewAddrText('');
    setShowAddAddressForm(false);
    Alert.alert('Address Saved', 'New address added to your saved locations.');
  };

  const handleSubmitSupport = () => {
    if (!supportText.trim()) {
      Alert.alert('Missing Input', 'Please describe your support issue.');
      return;
    }
    setSubmittingSupport(true);
    setTimeout(() => {
      setSubmittingSupport(false);
      setSupportText('');
      setSupportSuccessMsg('Support ticket submitted! Ticket #OP-9482. Our team will contact you shortly.');
      setTimeout(() => setSupportSuccessMsg(null), 4000);
    }, 800);
  };

  const handleMenuClick = (label: string) => {
    if (label === 'Order History') {
      setActiveModal('orders');
    } else if (label === 'Saved Addresses') {
      setActiveModal('addresses');
    } else if (label === 'Payment Methods') {
      setActiveModal('payments');
    } else if (label === 'Help & Support') {
      setActiveModal('help');
    } else if (label === 'About OnePlace') {
      setActiveModal('about');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Profile hero */}
      <View style={styles.profileHero}>
        <Avatar initials={user?.avatar || 'U'} size={72} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <Pressable style={styles.editBtn} onPress={() => setActiveModal('edit_profile')}>
          <MaterialIcons name="edit" size={14} color={Colors.primary} />
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedJobs}</Text>
          <Text style={styles.statLabel}>Services Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Cooperative info */}
      <Card variant="tinted" style={styles.coopCard}>
        <View style={styles.coopHeader}>
          <MaterialIcons name="handshake" size={20} color={Colors.primary} />
          <Text style={styles.coopTitle}>Your Community Impact</Text>
        </View>
        <Text style={styles.coopText}>
          Every service you book supports the OnePlace platform — funding worker training, safety, and community operations.
        </Text>
      </Card>

      {/* Menu */}
      <View style={styles.menu}>
        {[
          { icon: 'receipt-long', label: 'Order History', sublabel: 'View all past service requests' },
          { icon: 'location-on', label: 'Saved Addresses', sublabel: 'Manage your service locations' },
          { icon: 'payment', label: 'Payment Methods', sublabel: 'Cards, UPI, wallets' },
          { icon: 'support-agent', label: 'Help & Support', sublabel: 'Raise a dispute or get assistance' },
          { icon: 'info-outline', label: 'About OnePlace', sublabel: 'Cooperative model, transparency' },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
            onPress={() => handleMenuClick(item.label)}
          >
            <View style={styles.menuIconWrap}>
              <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sublabel}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutBtn}
        onPress={() => { logout(); router.replace('/auth/login'); }}
      >
        <MaterialIcons name="logout" size={18} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      {/* MODAL 1: EDIT PROFILE */}
      <Modal visible={activeModal === 'edit_profile'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Customer Profile</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mobile Phone</Text>
                <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput style={styles.modalInput} value={editCity} onChangeText={setEditCity} />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Default Address</Text>
                <TextInput style={styles.modalInput} value={editAddress} onChangeText={setEditAddress} multiline />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PIN Code</Text>
                <TextInput style={styles.modalInput} value={editPincode} onChangeText={setEditPincode} keyboardType="number-pad" maxLength={6} />
              </View>

              <Pressable
                style={styles.modalSubmitBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Save Changes</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: ORDER HISTORY */}
      <Modal visible={activeModal === 'orders'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order & Booking History</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {bookings.map(booking => (
                <View key={booking.id} style={styles.addressCard}>
                  <View style={styles.addressHeaderRow}>
                    <MaterialIcons name="receipt-long" size={20} color={Colors.primary} />
                    <Text style={styles.addressTag}>{booking.serviceLabel}</Text>
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>{booking.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.addressBody}>{booking.issueDescription}</Text>
                  <Text style={styles.addressPin}>
                    Slot: {booking.preferredSlot} · Amount: ₹{booking.serviceValue}
                  </Text>
                  {booking.assignedWorker && (
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
                      Assigned Professional: {booking.assignedWorker.name}
                    </Text>
                  )}
                  <Pressable
                    style={{ marginTop: 8, alignSelf: 'flex-end' }}
                    onPress={() => {
                      setActiveModal(null);
                      router.push({ pathname: '/booking-detail', params: { id: booking.id } });
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.primary }}>View Details →</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: SAVED ADDRESSES */}
      <Modal visible={activeModal === 'addresses'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Addresses</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {savedAddresses.map(addr => (
                <View key={addr.id} style={styles.addressCard}>
                  <View style={styles.addressHeaderRow}>
                    <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                    <Text style={styles.addressTag}>{addr.label}</Text>
                    {addr.isDefault && <View style={styles.defaultPill}><Text style={styles.defaultPillText}>DEFAULT</Text></View>}
                  </View>
                  <Text style={styles.addressBody}>{addr.address}</Text>
                  <Text style={styles.addressPin}>PIN: {addr.pincode}</Text>
                </View>
              ))}

              {showAddAddressForm ? (
                <View style={styles.addAddrBox}>
                  <Text style={styles.fieldLabel}>Address Label (e.g. Work, Parents)</Text>
                  <TextInput style={styles.modalInput} placeholder="Work" value={newAddrLabel} onChangeText={setNewAddrLabel} />
                  <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Full Address</Text>
                  <TextInput style={styles.modalInput} placeholder="House/Flat No, Street, Area" value={newAddrText} onChangeText={setNewAddrText} multiline />
                  <View style={styles.formBtnRow}>
                    <Pressable style={styles.cancelBtn} onPress={() => setShowAddAddressForm(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.addBtn} onPress={handleAddAddress}>
                      <Text style={styles.addBtnText}>Save Address</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.addNewAddrBtn} onPress={() => setShowAddAddressForm(true)}>
                  <MaterialIcons name="add" size={20} color={Colors.primary} />
                  <Text style={styles.addNewAddrText}>Add New Location</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: PAYMENT METHODS */}
      <Modal visible={activeModal === 'payments'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Methods</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.payCard}>
                <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>UPI (GPay / PhonePe / Paytm)</Text>
                  <Text style={styles.paySub}>priya@okicici · Linked & Verified</Text>
                </View>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
              </View>

              <View style={styles.payCard}>
                <MaterialIcons name="credit-card" size={24} color={Colors.textPrimary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>HDFC Visa Credit Card</Text>
                  <Text style={styles.paySub}>•••• •••• •••• 4821</Text>
                </View>
              </View>

              <View style={styles.payCard}>
                <MaterialIcons name="payments" size={24} color={Colors.accentDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>Cash on Service Completion</Text>
                  <Text style={styles.paySub}>Pay directly to worker after OTP verification</Text>
                </View>
              </View>

              <Pressable style={styles.addNewAddrBtn} onPress={() => Alert.alert('Add Payment Method', 'Select UPI ID or Credit/Debit Card to link.')}>
                <MaterialIcons name="add" size={20} color={Colors.primary} />
                <Text style={styles.addNewAddrText}>Add New Payment Option</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: HELP & SUPPORT */}
      <Modal visible={activeModal === 'help'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support Console</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {supportSuccessMsg && (
                <View style={styles.successBox}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                  <Text style={styles.successBoxText}>{supportSuccessMsg}</Text>
                </View>
              )}

              <Text style={styles.sectionHeaderTitle}>Raise Support Ticket</Text>

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryChips}>
                {['Booking Issue', 'Payment Problem', 'Quality Dispute', 'App Support'].map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.catChip, supportCategory === cat && styles.catChipActive]}
                    onPress={() => setSupportCategory(cat)}
                  >
                    <Text style={[styles.catChipText, supportCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Describe Your Issue</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Explain what went wrong or ask a question..."
                value={supportText}
                onChangeText={setSupportText}
                multiline
              />

              <Pressable style={styles.modalSubmitBtn} onPress={handleSubmitSupport} disabled={submittingSupport}>
                {submittingSupport ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Support Request</Text>}
              </Pressable>

              <Text style={[styles.sectionHeaderTitle, { marginTop: 20 }]}>Frequently Asked Questions</Text>
              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>How does pricing work?</Text>
                <Text style={styles.faqA}>All prices are transparent and estimated upfront. 85% goes directly to the worker.</Text>
              </View>
              <View style={styles.faqCard}>
                <Text style={styles.faqQ}>How do I cancel a booking?</Text>
                <Text style={styles.faqA}>You can cancel anytime before the worker arrives via the Active Booking screen.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ABOUT ONEPLACE */}
      <Modal visible={activeModal === 'about'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About OnePlace Platform</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.aboutBanner}>
                <MaterialIcons name="handshake" size={32} color={Colors.primary} />
                <Text style={styles.aboutTagline}>Fair & Transparent Service Cooperative</Text>
              </View>

              <Text style={styles.aboutParagraph}>
                OnePlace is built on a worker-first, customer-friendly model. Unlike standard aggregator platforms, we ensure transparent pricing, zero hidden markups, and fair workload allocation.
              </Text>

              <View style={styles.aboutPillar}>
                <MaterialIcons name="verified" size={20} color={Colors.success} />
                <Text style={styles.pillarText}>85% Direct Worker Earnings Payout</Text>
              </View>

              <View style={styles.aboutPillar}>
                <MaterialIcons name="shield" size={20} color={Colors.primary} />
                <Text style={styles.pillarText}>Cooperative Worker Safety Net & Upskilling Fund</Text>
              </View>

              <View style={styles.aboutPillar}>
                <MaterialIcons name="lock" size={20} color={Colors.accentDark} />
                <Text style={styles.pillarText}>OTP Verified Job Completion Guarantee</Text>
              </View>

              <Text style={styles.versionText}>App Version: 1.0.0 (Build 2026.09)</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHero: { alignItems: 'center', paddingVertical: Spacing[6], paddingHorizontal: Spacing[5] },
  name: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing[3] },
  phone: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing[2] },
  editText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    paddingVertical: Spacing[4], marginBottom: Spacing[4],
    ...Shadow.sm,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  coopCard: { marginHorizontal: Spacing[5], marginBottom: Spacing[4] },
  coopHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  coopTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.primary },
  coopText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing[2] },
  menu: { paddingHorizontal: Spacing[5] },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[4],
    borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: Spacing[3],
  },
  menuPressed: { backgroundColor: Colors.divider },
  menuIconWrap: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.textPrimary },
  menuSub: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], marginHorizontal: Spacing[5], marginTop: Spacing[6],
    paddingVertical: Spacing[4], borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.errorLight,
    backgroundColor: Colors.errorLight,
  },
  logoutText: { color: Colors.error, fontWeight: Typography.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing[5], maxHeight: '85%', gap: Spacing[3],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  fieldGroup: { marginBottom: Spacing[3] },
  fieldLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
  modalInput: {
    backgroundColor: Colors.surfaceTinted, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing[3], paddingVertical: 10,
    fontSize: Typography.sm, color: Colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary, height: 48, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing[3],
  },
  modalSubmitText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },
  addressCard: {
    backgroundColor: Colors.surfaceTinted, borderRadius: Radius.md, padding: Spacing[3],
    marginBottom: Spacing[2], borderWidth: 1, borderColor: Colors.border,
  },
  addressHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: 4 },
  addressTag: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1 },
  defaultPill: { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultPillText: { fontSize: 9, fontWeight: Typography.bold, color: Colors.success },
  addressBody: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  addressPin: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  addNewAddrBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2],
    paddingVertical: Spacing[3], borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight, marginTop: Spacing[2],
  },
  addNewAddrText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
  addAddrBox: { backgroundColor: Colors.surfaceTinted, padding: Spacing[3], borderRadius: Radius.md, marginTop: Spacing[2] },
  formBtnRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[3] },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary },
  addBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  addBtnText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: '#fff' },
  payCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.md, padding: Spacing[3], marginBottom: Spacing[2], borderWidth: 1, borderColor: Colors.border,
  },
  payTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  paySub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionHeaderTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing[2] },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[2] },
  catChip: { paddingHorizontal: Spacing[3], paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceTinted },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.xs, color: Colors.textSecondary },
  catChipTextActive: { color: '#fff', fontWeight: Typography.bold },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[3] },
  successBoxText: { fontSize: Typography.xs, color: Colors.success, flex: 1 },
  faqCard: { backgroundColor: Colors.surfaceTinted, padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[2] },
  faqQ: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textPrimary },
  faqA: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  aboutBanner: { alignItems: 'center', gap: Spacing[2], marginVertical: Spacing[3] },
  aboutTagline: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  aboutParagraph: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing[3] },
  aboutPillar: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: 6 },
  pillarText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textPrimary },
  versionText: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing[4] },
});
