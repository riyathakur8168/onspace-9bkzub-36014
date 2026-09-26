import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { SERVICE_CATEGORIES } from '@/services/mockData';
import { useAlert } from '@/template';

const SLOTS = ['9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'];
const DAYS = ['Today', 'Tomorrow', 'Mon 29 Sep', 'Tue 30 Sep'];

export default function RequestService() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { showAlert } = useAlert();

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0];

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDay, setSelectedDay] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  const handleSubmit = () => {
    if (!description.trim()) {
      showAlert('Missing Details', 'Please describe the issue before submitting.');
      return;
    }
    if (!address.trim()) {
      showAlert('Address Required', 'Please enter your service address.');
      return;
    }
    if (!selectedSlot) {
      showAlert('Select a Slot', 'Please choose your preferred time slot.');
      return;
    }
    showAlert(
      'Request Submitted',
      'We are matching you with the best available worker. You will be notified shortly.',
      [{ text: 'OK', onPress: () => router.replace('/(customer)/bookings') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Request Service</Text>
            <Text style={styles.headerSub}>{category.name}</Text>
          </View>
          <View style={[styles.catIconWrap, { backgroundColor: category.color + '18' }]}>
            <MaterialIcons name={category.icon as any} size={22} color={category.color} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Urgency Toggle */}
          <Text style={styles.fieldLabel}>Urgency</Text>
          <View style={styles.urgencyRow}>
            {(['normal', 'urgent'] as const).map((u) => (
              <Pressable
                key={u}
                style={[styles.urgencyChip, urgency === u && styles.urgencyChipActive]}
                onPress={() => setUrgency(u)}
              >
                <MaterialIcons
                  name={u === 'urgent' ? 'warning' : 'schedule'}
                  size={16}
                  color={urgency === u ? '#fff' : Colors.textSecondary}
                />
                <Text style={[styles.urgencyText, urgency === u && styles.urgencyTextActive]}>
                  {u === 'urgent' ? 'Urgent' : 'Normal'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Issue Description */}
          <Text style={styles.fieldLabel}>Describe the issue *</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder={`e.g. ${category.description}. Describe what needs to be fixed...`}
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Address */}
          <Text style={styles.fieldLabel}>Service Address *</Text>
          <View style={styles.inputWrap}>
            <MaterialIcons name="location-on" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Flat no., building, area, city..."
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Day Selection */}
          <Text style={styles.fieldLabel}>Preferred Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dayRow}>
              {DAYS.map((d) => (
                <Pressable key={d} style={[styles.dayChip, selectedDay === d && styles.dayChipActive]} onPress={() => setSelectedDay(d)}>
                  <Text style={[styles.dayText, selectedDay === d && styles.dayTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Slot Selection */}
          <Text style={styles.fieldLabel}>Preferred Time Slot</Text>
          <View style={styles.slotGrid}>
            {SLOTS.map((s) => (
              <Pressable key={s} style={[styles.slotChip, selectedSlot === s && styles.slotChipActive]} onPress={() => setSelectedSlot(s)}>
                <Text style={[styles.slotText, selectedSlot === s && styles.slotTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {/* Pricing Note */}
          <View style={styles.priceNote}>
            <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
            <Text style={styles.priceNoteText}>
              Base visit charge from ₹{category.basePrice}. Final price confirmed after inspection. 85% goes directly to your worker.
            </Text>
          </View>

          {/* Summary */}
          {selectedSlot ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Request Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Service</Text>
                <Text style={styles.summaryVal}>{category.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Date</Text>
                <Text style={styles.summaryVal}>{selectedDay}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Time</Text>
                <Text style={styles.summaryVal}>{selectedSlot}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Priority</Text>
                <Text style={[styles.summaryVal, urgency === 'urgent' && { color: Colors.warning, fontWeight: '600' }]}>
                  {urgency === 'urgent' ? 'Urgent' : 'Normal'}
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <Pressable style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Request</Text>
            <MaterialIcons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { padding: 6 },
  headerTitle: { ...Typography.sectionTitle, color: Colors.textPrimary },
  headerSub: { ...Typography.caption, color: Colors.textSecondary },
  catIconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, paddingTop: Spacing.md },
  fieldLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  urgencyRow: { flexDirection: 'row', gap: Spacing.sm },
  urgencyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  urgencyChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  urgencyText: { ...Typography.label, color: Colors.textSecondary },
  urgencyTextActive: { color: '#fff' },
  textArea: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, ...Typography.bodyMedium, color: Colors.textPrimary, minHeight: 100 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm },
  inputIcon: { marginRight: 6 },
  input: { flex: 1, height: 48, ...Typography.bodyMedium, color: Colors.textPrimary },
  dayRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.xs },
  dayChip: { paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { ...Typography.label, color: Colors.textSecondary },
  dayTextActive: { color: '#fff' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slotChip: { paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  slotChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  slotText: { ...Typography.label, color: Colors.textSecondary },
  slotTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  priceNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md },
  priceNoteText: { ...Typography.caption, color: Colors.primaryDark, flex: 1 },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md, ...Shadow.sm },
  summaryTitle: { ...Typography.label, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryKey: { ...Typography.bodySmall, color: Colors.textMuted },
  summaryVal: { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '500' },
  footer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15 },
  submitBtnPressed: { opacity: 0.85 },
  submitText: { ...Typography.button, color: '#fff', fontSize: 16 },
});
