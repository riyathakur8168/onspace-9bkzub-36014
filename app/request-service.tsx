import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { SERVICE_CATEGORIES } from '@/services/mockData';
import { useAlert } from '@/template';

const URGENCY_OPTIONS = [
  { key: 'normal', label: 'Normal', desc: 'Within 24–48 hours', icon: 'time-outline' },
  { key: 'urgent', label: 'Urgent', desc: 'As soon as possible', icon: 'flash-outline' },
];

const TIME_SLOTS = ['8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'];

export default function RequestService() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showAlert('Request Submitted!', 'We are finding the best available professional for you. You will be notified once matched.', [
        { text: 'View Bookings', onPress: () => { router.back(); router.push('/(customer)/bookings'); } },
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1500);
  };

  const canProceed = step === 1 ? !!category : step === 2 ? description.length >= 10 : !!timeSlot;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          {[1,2,3].map(s => (
            <View key={s} style={[styles.progressStep, step >= s && styles.progressStepActive]} />
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 32 }}>
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>What service do you need?</Text>
              <Text style={styles.stepSub}>Select the category that best matches your issue</Text>
              {SERVICE_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.optionCard, category === cat.id && styles.optionCardActive, Shadow.sm]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, category === cat.id && styles.optionLabelActive]}>{cat.label}</Text>
                    <Text style={styles.optionDesc}>{cat.description}</Text>
                  </View>
                  {category === cat.id && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Describe the issue</Text>
              <Text style={styles.stepSub}>The more detail you provide, the better we can match you</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Issue description *</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder="e.g. Circuit breaker in kitchen keeps tripping every morning. Needs inspection."
                  placeholderTextColor={Colors.textSubtle}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{description.length} / 500</Text>
              </View>
              <Text style={styles.inputLabel}>Urgency</Text>
              <View style={styles.urgencyRow}>
                {URGENCY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.urgencyCard, urgency === opt.key && styles.urgencyCardActive]}
                    onPress={() => setUrgency(opt.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={opt.icon as any} size={20} color={urgency === opt.key ? Colors.primary : Colors.textSubtle} />
                    <Text style={[styles.urgencyLabel, urgency === opt.key && styles.urgencyLabelActive]}>{opt.label}</Text>
                    <Text style={styles.urgencyDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Choose a time slot</Text>
              <Text style={styles.stepSub}>Select your preferred appointment window</Text>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotCard, timeSlot === slot && styles.slotCardActive]}
                  onPress={() => setTimeSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time-outline" size={18} color={timeSlot === slot ? Colors.primary : Colors.textSubtle} />
                  <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>{slot}</Text>
                  {timeSlot === slot && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
              {/* Summary */}
              <Card style={{ marginTop: Spacing.lg }}>
                <Text style={styles.summaryTitle}>Request Summary</Text>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Category</Text><Text style={styles.summaryVal}>{SERVICE_CATEGORIES.find(c => c.id === category)?.label}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Urgency</Text><Text style={styles.summaryVal}>{urgency === 'urgent' ? 'Urgent (ASAP)' : 'Normal (24–48h)'}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Slot</Text><Text style={styles.summaryVal}>{timeSlot || '—'}</Text></View>
                <View style={[styles.summaryRow, { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border }]}>
                  <Text style={styles.summaryLabel}>Fair allocation</Text>
                  <Text style={[styles.summaryVal, { color: Colors.primary }]}>✓ Worker earns 85%</Text>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <Button label="Back" onPress={() => setStep(s => s - 1)} variant="outline" style={{ flex: 1 }} />
          )}
          {step < 3 ? (
            <Button label="Continue" onPress={() => setStep(s => s + 1)} disabled={!canProceed} style={{ flex: 2 }} />
          ) : (
            <Button label="Submit Request" onPress={handleSubmit} loading={submitting} disabled={!canProceed} style={{ flex: 2 }} />
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  progressBar: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressStepActive: { backgroundColor: Colors.primary },
  stepTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  stepSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  optionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  catIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  optionLabelActive: { color: Colors.primary },
  optionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  inputWrap: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  textArea: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md,
    color: Colors.textPrimary, minHeight: 120,
  },
  charCount: { fontSize: FontSize.xs, color: Colors.textSubtle, textAlign: 'right', marginTop: 4 },
  urgencyRow: { flexDirection: 'row', gap: Spacing.sm },
  urgencyCard: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, gap: 4,
  },
  urgencyCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  urgencyLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  urgencyLabelActive: { color: Colors.primary },
  urgencyDesc: { fontSize: FontSize.xs, color: Colors.textSubtle, textAlign: 'center' },
  slotCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  slotCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  slotText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  slotTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  summaryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.lg, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
