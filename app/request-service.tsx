import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { SERVICE_CATEGORIES } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';

const SLOTS = [
  'Today, 2:00 PM – 4:00 PM',
  'Today, 4:00 PM – 6:00 PM',
  'Tomorrow, 9:00 AM – 11:00 AM',
  'Tomorrow, 11:00 AM – 1:00 PM',
  'Tomorrow, 3:00 PM – 5:00 PM',
];

const PRICE_ESTIMATES: Record<string, number> = {
  plumbing: 600, electrical: 550, carpentry: 700,
  cleaning: 800, appliance: 650, painting: 1200, pest: 900, ac: 750,
};

export default function RequestService() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createRequest, skillsRegistry } = useApp();
  const { showAlert } = useAlert();

  const [selectedCategory, setSelectedCategory] = useState(params.category as string || '');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [step, setStep] = useState(1);

  const activeSkills = skillsRegistry ? skillsRegistry.filter(s => s.isActive) : [];
  const categories = activeSkills.length > 0
    ? activeSkills.map(s => ({ id: s.id, label: s.name, basePrice: s.basePrice || 500 }))
    : SERVICE_CATEGORIES.map(c => ({ id: c.id, label: c.label, basePrice: PRICE_ESTIMATES[c.id] || 600 }));

  const selectedCat = categories.find(c => c.id === selectedCategory);
  const estimatedPrice = selectedCat ? selectedCat.basePrice : (selectedCategory ? (PRICE_ESTIMATES[selectedCategory] || 600) : 0);

  const handleSubmit = () => {
    if (!selectedCategory || !description || !address || !selectedSlot) {
      showAlert('Incomplete Details', 'Please fill in all required fields.');
      return;
    }
    createRequest(selectedCat?.label || selectedCategory, description, address, selectedSlot, estimatedPrice);
    showAlert('Request Submitted', 'We are matching you with the best verified professional for your request.', [
      { text: 'View Bookings', onPress: () => router.replace('/(customer)/bookings' as any) },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing[10] }}
      >
        {/* Steps */}
        <View style={styles.stepBar}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepWrap}>
              <View style={[styles.stepDot, s <= step && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, s <= step && styles.stepDotTextActive]}>{s}</Text>
              </View>
              {s < 3 && <View style={[styles.stepLine, s < step && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {/* Step 1: Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Service</Text>
          <View style={styles.catGrid}>
            {categories.map(cat => (
              <Pressable
                key={cat.id}
                style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
                onPress={() => { setSelectedCategory(cat.id); setStep(Math.max(step, 2)); }}
              >
                <MaterialIcons name="build" size={18} color={selectedCategory === cat.id ? '#fff' : Colors.primary} />
                <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Step 2: Details */}
        {step >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Describe the Issue</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the problem in detail (e.g. kitchen tap dripping, bathroom geyser not heating...)"
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={(t) => { setDescription(t); if (t.length > 10) setStep(Math.max(step, 3)); }}
              textAlignVertical="top"
            />

            <Text style={[styles.sectionTitle, { marginTop: Spacing[4] }]}>Service Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Flat no., building, street, area"
              placeholderTextColor={Colors.textTertiary}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        )}

        {/* Step 3: Slot */}
        {step >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Preferred Time Slot</Text>
            {SLOTS.map(slot => (
              <Pressable
                key={slot}
                style={[styles.slotCard, selectedSlot === slot && styles.slotCardActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <MaterialIcons
                  name={selectedSlot === slot ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={selectedSlot === slot ? Colors.primary : Colors.textTertiary}
                />
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Price summary */}
        {selectedCategory && step >= 2 && (
          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Estimated Service Cost</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base service fee</Text>
              <Text style={styles.priceValue}>₹{estimatedPrice}</Text>
            </View>
            <Text style={styles.priceNote}>* Final price may vary after inspection. No hidden charges.</Text>
          </View>
        )}

        {/* Submit */}
        <View style={styles.submitArea}>
          <Button
            label="Submit Service Request"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            disabled={!selectedCategory || !description || !address || !selectedSlot}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stepBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing[5], paddingHorizontal: Spacing[8],
  },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textTertiary },
  stepDotTextActive: { color: '#fff' },
  stepLine: { width: 60, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary },
  section: { paddingHorizontal: Spacing[5], marginBottom: Spacing[5] },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[1],
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  catChipTextActive: { color: '#fff' },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[3], fontSize: Typography.base,
    color: Colors.textPrimary, minHeight: 100,
    ...Shadow.sm,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    fontSize: Typography.base, color: Colors.textPrimary,
    ...Shadow.sm,
  },
  slotCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    marginBottom: Spacing[2],
  },
  slotCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  slotText: { fontSize: Typography.base, color: Colors.textSecondary },
  slotTextActive: { color: Colors.primary, fontWeight: Typography.medium },
  priceCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    marginHorizontal: Spacing[5], padding: Spacing[4],
    marginBottom: Spacing[4], ...Shadow.sm,
  },
  priceTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  priceLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  priceValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  priceNote: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: Spacing[2] },
  submitArea: { paddingHorizontal: Spacing[5] },
});
