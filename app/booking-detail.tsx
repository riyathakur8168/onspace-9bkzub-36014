import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/hooks/useApp';

const JOB_TIMELINE = [
  { event: 'Request Created', time: '1:15 PM', done: true },
  { event: 'Worker Matched', time: '1:18 PM', done: true },
  { event: 'Worker Accepted', time: '1:22 PM', done: true },
  { event: 'Worker En Route', time: '2:55 PM', done: true },
  { event: 'Job Started (OTP)', time: '3:10 PM', done: true },
  { event: 'Job Completed', time: '--', done: false },
  { event: 'Payment Settled', time: '--', done: false },
];

export default function BookingDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookings } = useApp();
  const booking = bookings.find(b => b.status === 'started') || bookings[0];

  // Action Modals State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Report Issue State
  const [reportCategory, setReportCategory] = useState('Delayed Arrival');
  const [reportText, setReportText] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'worker', text: 'Hello! I am on my way to your location.', time: '2:56 PM' },
    { sender: 'customer', text: 'Great, thanks! Please use Flat 4B entrance.', time: '2:57 PM' },
    { sender: 'worker', text: 'Got it, reaching in 5 mins.', time: '3:05 PM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  if (!booking) return null;

  const handleSubmitReport = () => {
    if (!reportText.trim()) {
      Alert.alert('Missing Details', 'Please describe the issue you encountered.');
      return;
    }
    setSubmittingReport(true);
    setTimeout(() => {
      setSubmittingReport(false);
      setShowReportModal(false);
      setReportText('');
      Alert.alert('Report Submitted', 'Your issue report #REP-4821 has been sent to OnePlace Ops. We will investigate immediately.');
    }, 800);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'customer', text: chatInput.trim(), time: 'Just now' };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'worker', text: 'Received. Working on the task now!', time: 'Just now' }
      ]);
    }, 1200);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[8] }}
    >
      {/* Status header */}
      <View style={styles.statusBanner}>
        <View style={styles.statusPulse} />
        <Text style={styles.statusText}>Job In Progress</Text>
        <Badge label="Started" variant="warning" />
      </View>

      {/* Worker card */}
      {booking.assignedWorker && (
        <View style={styles.workerCard}>
          <Avatar initials={booking.assignedWorker.avatar} size={56} verified />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{booking.assignedWorker.name}</Text>
            <View style={styles.workerMeta}>
              <MaterialIcons name="star" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>{booking.assignedWorker.rating} · {booking.assignedWorker.completedJobs} jobs</Text>
            </View>
            <Text style={styles.workerSkills}>{booking.assignedWorker.skills.join(' · ')}</Text>
          </View>
          <View style={styles.workerActions}>
            <Pressable style={styles.iconBtn} onPress={() => setShowChatModal(true)}>
              <MaterialIcons name="chat" size={20} color={Colors.primary} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => setShowCallModal(true)}>
              <MaterialIcons name="call" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* OTP */}
      {booking.otpCode && booking.status === 'started' && (
        <View style={styles.otpCard}>
          <MaterialIcons name="lock" size={18} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.otpLabel}>Job Start OTP (share with worker)</Text>
            <Text style={styles.otpCode}>{booking.otpCode}</Text>
          </View>
        </View>
      )}

      {/* Service details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Details</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="home-repair-service" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{booking.serviceLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="description" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailLabel}>Issue</Text>
          <Text style={styles.detailValue} numberOfLines={2}>{booking.issueDescription}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue} numberOfLines={2}>{booking.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailLabel}>Slot</Text>
          <Text style={styles.detailValue}>{booking.preferredSlot}</Text>
        </View>
        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <MaterialIcons name="currency-rupee" size={16} color={Colors.textTertiary} />
          <Text style={styles.detailLabel}>Estimated</Text>
          <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: Typography.bold }]}>₹{booking.serviceValue}</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Job Timeline</Text>
        {JOB_TIMELINE.map((event, idx) => (
          <View key={idx} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, !event.done && styles.timelineDotInactive]} />
              {idx < JOB_TIMELINE.length - 1 && (
                <View style={[styles.timelineLine, !event.done && styles.timelineLineInactive]} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineEvent, !event.done && styles.timelineEventInactive]}>{event.event}</Text>
              <Text style={styles.timelineTime}>{event.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button label="Report Issue" variant="secondary" onPress={() => setShowReportModal(true)} style={{ flex: 1 }} />
        <Button label="Mark Complete" variant="accent" onPress={() => router.back()} style={{ flex: 2 }} />
      </View>

      {/* MODAL 1: REPORT ISSUE */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Job Issue</Text>
              <Pressable onPress={() => setShowReportModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Issue Category</Text>
              <View style={styles.categoryChips}>
                {['Delayed Arrival', 'Work Quality Concern', 'Overcharge Dispute', 'Safety Issue'].map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.catChip, reportCategory === cat && styles.catChipActive]}
                    onPress={() => setReportCategory(cat)}
                  >
                    <Text style={[styles.catChipText, reportCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Issue Description</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Explain the problem in detail..."
                value={reportText}
                onChangeText={setReportText}
                multiline
              />

              <Pressable style={styles.modalSubmitBtn} onPress={handleSubmitReport} disabled={submittingReport}>
                {submittingReport ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Issue Report</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CALL WORKER */}
      <Modal visible={showCallModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: Spacing[6] }]}>
            <Avatar initials={booking.assignedWorker?.avatar || 'W'} size={64} verified />
            <Text style={[styles.workerName, { marginTop: 12 }]}>{booking.assignedWorker?.name}</Text>
            <Text style={styles.metaText}>{booking.assignedWorker?.phone || '+91 98765 12345'}</Text>
            <View style={styles.callBadge}>
              <MaterialIcons name="call" size={16} color={Colors.success} />
              <Text style={styles.callBadgeText}>Direct Masked Calling Active</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5] }}>
              <Pressable style={styles.endCallBtn} onPress={() => setShowCallModal(false)}>
                <MaterialIcons name="call-end" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CHAT WORKER */}
      <Modal visible={showChatModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar initials={booking.assignedWorker?.avatar || 'W'} size={32} verified />
                <Text style={styles.modalTitle}>{booking.assignedWorker?.name}</Text>
              </View>
              <Pressable onPress={() => setShowChatModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    styles.chatBubble,
                    msg.sender === 'customer' ? styles.chatBubbleCustomer : styles.chatBubbleWorker
                  ]}
                >
                  <Text style={[styles.chatText, msg.sender === 'customer' && { color: '#fff' }]}>{msg.text}</Text>
                  <Text style={[styles.chatTime, msg.sender === 'customer' && { color: 'rgba(255,255,255,0.7)' }]}>{msg.time}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message to worker..."
                value={chatInput}
                onChangeText={setChatInput}
              />
              <Pressable style={styles.sendChatBtn} onPress={handleSendMessage}>
                <MaterialIcons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.warningLight,
    marginHorizontal: Spacing[5], marginTop: Spacing[4],
    borderRadius: Radius.lg, padding: Spacing[3],
    marginBottom: Spacing[4],
  },
  statusPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.warning },
  statusText: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.accentDark },
  workerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.surface, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4],
    marginBottom: Spacing[4], ...Shadow.sm,
  },
  workerInfo: { flex: 1 },
  workerName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  workerSkills: { fontSize: Typography.xs, color: Colors.primary, marginTop: 2 },
  workerActions: { flexDirection: 'row', gap: Spacing[1] },
  iconBtn: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  otpCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '40',
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    padding: Spacing[4], marginBottom: Spacing[4],
  },
  otpLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.medium },
  otpCode: { fontSize: 32, fontWeight: Typography.bold, color: Colors.primary, letterSpacing: 8 },
  card: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4],
    marginBottom: Spacing[4], ...Shadow.sm,
  },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2],
    paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  detailLabel: { fontSize: Typography.sm, color: Colors.textTertiary, width: 60 },
  detailValue: { fontSize: Typography.sm, color: Colors.textPrimary, flex: 1 },
  timelineRow: { flexDirection: 'row', marginBottom: Spacing[1] },
  timelineLeft: { alignItems: 'center', marginRight: Spacing[3], width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, marginTop: 4 },
  timelineDotInactive: { backgroundColor: Colors.border },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.primary, minHeight: 20, marginTop: 2 },
  timelineLineInactive: { backgroundColor: Colors.border },
  timelineContent: { flex: 1, paddingBottom: Spacing[3] },
  timelineEvent: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  timelineEventInactive: { color: Colors.textTertiary },
  timelineTime: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 1 },
  actions: { flexDirection: 'row', gap: Spacing[2], marginHorizontal: Spacing[5], marginTop: Spacing[2] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing[5], maxHeight: '85%', gap: Spacing[3],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  fieldLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 4 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[2] },
  catChip: { paddingHorizontal: Spacing[3], paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceTinted },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.xs, color: Colors.textSecondary },
  catChipTextActive: { color: '#fff', fontWeight: Typography.bold },
  modalInput: {
    backgroundColor: Colors.surfaceTinted, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing[3], paddingVertical: 10,
    fontSize: Typography.sm, color: Colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.error, height: 48, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing[3],
  },
  modalSubmitText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },
  callBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, marginTop: 12 },
  callBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.success },
  endCallBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
  chatBubble: { maxWidth: '80%', padding: Spacing[3], borderRadius: Radius.lg, marginBottom: 4 },
  chatBubbleCustomer: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 2 },
  chatBubbleWorker: { alignSelf: 'flex-start', backgroundColor: Colors.surfaceTinted, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: Colors.border },
  chatText: { fontSize: Typography.xs, color: Colors.textPrimary, lineHeight: 18 },
  chatTime: { fontSize: 9, color: Colors.textTertiary, marginTop: 2, textAlign: 'right' },
  chatInputRow: { flexDirection: 'row', gap: Spacing[2], alignItems: 'center', paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.divider },
  chatInput: { flex: 1, backgroundColor: Colors.surfaceTinted, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing[3], height: 44, fontSize: Typography.xs },
  sendChatBtn: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
