import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
  TextInput, Modal, Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/hooks/useApp';

const FILTERS = ['All', 'Pending Approval', 'Approved', 'Active'];

export default function AdminWorkers() {
  const insets = useSafeAreaInsets();
  const {
    workersList,
    skillsRegistry,
    approveWorkerAdmin,
    rejectWorkerAdmin,
    reviewWorkerVerification,
    toggleWorkerVerificationStatus,
    addSkill,
    toggleSkillActive,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'workers' | 'skills'>('workers');
  const [activeFilter, setActiveFilter] = useState('All');

  // New Skill Modal State
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [newSkillPrice, setNewSkillPrice] = useState('');

  const filteredWorkers = workersList.filter(w => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending Approval') return w.adminApprovalStatus === 'PENDING' || !w.adminApprovalStatus;
    if (activeFilter === 'Approved') return w.adminApprovalStatus === 'APPROVED';
    if (activeFilter === 'Active') return w.availabilityStatus;
    return true;
  });

  const handleCreateSkill = () => {
    if (!newSkillName.trim()) {
      Alert.alert('Validation Error', 'Skill name is required.');
      return;
    }
    const cat = newSkillCategory.trim() || newSkillName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const price = parseInt(newSkillPrice, 10) || 499;

    addSkill({
      name: newSkillName.trim(),
      category: cat,
      description: newSkillDescription.trim() || undefined,
      basePrice: price,
      isActive: true,
    });

    setNewSkillName('');
    setNewSkillCategory('');
    setNewSkillDescription('');
    setNewSkillPrice('');
    setShowAddSkillModal(false);
    Alert.alert('Skill Added', `Skill "${newSkillName.trim()}" has been added to the active registry.`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Management Console</Text>
        <Text style={styles.sub}>
          {activeTab === 'workers'
            ? `${workersList.length} workers registered · ${workersList.filter(w => w.adminApprovalStatus === 'APPROVED').length} approved`
            : `${skillsRegistry.length} skills in registry · ${skillsRegistry.filter((s: any) => s.isActive).length} active`}
        </Text>
      </View>

      {/* Main Mode Tabs */}
      <View style={styles.tabBarRow}>
        <Pressable
          style={[styles.mainTab, activeTab === 'workers' && styles.mainTabActive]}
          onPress={() => setActiveTab('workers')}
        >
          <MaterialIcons name="people" size={18} color={activeTab === 'workers' ? Colors.adminColor : Colors.textTertiary} />
          <Text style={[styles.mainTabText, activeTab === 'workers' && styles.mainTabTextActive]}>
            Worker Approvals
          </Text>
        </Pressable>

        <Pressable
          style={[styles.mainTab, activeTab === 'skills' && styles.mainTabActive]}
          onPress={() => setActiveTab('skills')}
        >
          <MaterialIcons name="handyman" size={18} color={activeTab === 'skills' ? Colors.adminColor : Colors.textTertiary} />
          <Text style={[styles.mainTabText, activeTab === 'skills' && styles.mainTabTextActive]}>
            Skills & Services
          </Text>
        </Pressable>
      </View>

      {/* WORKERS TAB */}
      {activeTab === 'workers' && (
        <>
          <View style={styles.filterWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {FILTERS.map(f => (
                <Pressable key={f} style={[styles.chip, activeFilter === f && styles.chipActive]} onPress={() => setActiveFilter(f)}>
                  <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {filteredWorkers.map(worker => {
              const vState = worker.verificationState || (worker.verificationStatus === 'verified' ? 'VERIFIED' : 'VERIFICATION_PENDING');
              const isVerified = vState === 'VERIFIED';
              const isUnderReview = vState === 'UNDER_REVIEW';
              const isRejected = vState === 'REJECTED';
              const isReupload = vState === 'RE_UPLOAD_REQUIRED';
              const hasDoc = !!worker.verificationDocument;

              return (
                <View key={worker.id} style={styles.workerCard}>
                  <Avatar initials={worker.avatar} size={48} verified={isVerified} />
                  <View style={styles.workerInfo}>
                    <View style={styles.workerNameRow}>
                      <Text style={styles.workerName}>{worker.name}</Text>
                      <Badge
                        label={isVerified ? 'VERIFIED' : isUnderReview ? 'UNDER REVIEW' : isRejected ? 'REJECTED' : isReupload ? 'RE-UPLOAD' : 'PENDING'}
                        variant={isVerified ? 'success' : isRejected ? 'error' : isUnderReview ? 'primary' : 'warning'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.workerSkills}>{worker.skills.join(' · ')} · {worker.serviceArea}</Text>

                    {/* Submitted Document Box */}
                    {hasDoc ? (
                      <View style={{ backgroundColor: '#F0F9FF', padding: 8, borderRadius: 6, marginVertical: 6, borderWidth: 1, borderColor: Colors.primary + '30' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <MaterialIcons name="picture-as-pdf" size={18} color={Colors.primary} />
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.textPrimary, flex: 1 }} numberOfLines={1}>
                            {worker.verificationDocument?.name || 'Local_Authority_Attestation.pdf'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: Colors.textTertiary, marginTop: 2 }}>
                          Uploaded: {worker.verificationDocument?.uploadedAt || 'Recently'} · Local Authority Stamp Attached
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic', marginVertical: 4 }}>
                        No verification document uploaded yet.
                      </Text>
                    )}

                    {/* Rejection / Reupload reason if present */}
                    {(worker.rejectionReason || worker.adminRejectionReason) && (
                      <Text style={{ fontSize: 11, color: Colors.error, marginTop: 2 }}>
                        Note: {worker.rejectionReason || worker.adminRejectionReason}
                      </Text>
                    )}

                    {/* Society Head Action Controls */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      <Pressable
                        style={[styles.approveBtn, { backgroundColor: isVerified ? Colors.success : Colors.primary }]}
                        onPress={() => {
                          reviewWorkerVerification(worker.id, 'VERIFIED');
                          Alert.alert('Worker Approved!', `${worker.name} is now VERIFIED, added to Active Workers, and visible to customers.`);
                        }}
                      >
                        <MaterialIcons name="check-circle" size={14} color="#fff" />
                        <Text style={styles.approveText}>{isVerified ? 'Verified 🟢' : 'Approve'}</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.rejectBtn, { borderColor: '#D97706', backgroundColor: '#FEF3C7' }]}
                        onPress={() => {
                          Alert.prompt(
                            'Request Re-upload',
                            `Specify what ${worker.name} needs to correct on the verification form:`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Send Request',
                                onPress: (reason?: string) => {
                                  reviewWorkerVerification(worker.id, 'RE_UPLOAD_REQUIRED', reason || 'Stamp or signature missing on attestation form.');
                                  Alert.alert('Request Sent', `Re-upload request sent to ${worker.name}.`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <MaterialIcons name="replay" size={14} color="#B45309" />
                        <Text style={[styles.rejectText, { color: '#B45309' }]}>Request Re-upload</Text>
                      </Pressable>

                      <Pressable
                        style={styles.rejectBtn}
                        onPress={() => {
                          Alert.prompt(
                            'Reject Verification',
                            `Enter rejection reason for ${worker.name}:`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Reject',
                                style: 'destructive',
                                onPress: (reason?: string) => {
                                  reviewWorkerVerification(worker.id, 'REJECTED', reason || 'Invalid local authority attestation.');
                                  Alert.alert('Worker Rejected', `${worker.name}'s verification was marked rejected.`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <MaterialIcons name="block" size={14} color={Colors.error} />
                        <Text style={styles.rejectText}>Reject</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* SKILLS TAB */}
      {activeTab === 'skills' && (
        <View style={{ flex: 1 }}>
          <View style={styles.skillHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Skills & Services Registry</Text>
            <Pressable style={styles.addSkillBtn} onPress={() => setShowAddSkillModal(true)}>
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={styles.addSkillBtnText}>Add Skill</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {skillsRegistry.map((skill: any) => (
              <View key={skill.id} style={styles.skillCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Badge
                      label={skill.isActive ? 'Active' : 'Disabled'}
                      variant={skill.isActive ? 'success' : 'default'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.skillMeta}>
                    ID: {skill.id} · Base Fee: ₹{skill.basePrice || 499}
                  </Text>
                  {skill.description && (
                    <Text style={styles.skillDesc}>{skill.description}</Text>
                  )}
                </View>
                <Switch
                  value={skill.isActive}
                  onValueChange={() => toggleSkillActive(skill.id)}
                  trackColor={{ false: Colors.border, true: Colors.adminColor }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Add Skill Modal */}
      <Modal visible={showAddSkillModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Skill / Service</Text>
              <Pressable onPress={() => setShowAddSkillModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skill / Service Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. RO Technician"
                  placeholderTextColor={Colors.textTertiary}
                  value={newSkillName}
                  onChangeText={setNewSkillName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. appliance"
                  placeholderTextColor={Colors.textTertiary}
                  value={newSkillCategory}
                  onChangeText={setNewSkillCategory}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Base Service Price (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 499"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textTertiary}
                  value={newSkillPrice}
                  onChangeText={setNewSkillPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Short description of service scope..."
                  multiline
                  placeholderTextColor={Colors.textTertiary}
                  value={newSkillDescription}
                  onChangeText={setNewSkillDescription}
                />
              </View>

              <Pressable style={styles.createSkillSubmitBtn} onPress={handleCreateSkill}>
                <Text style={styles.createSkillSubmitText}>Save & Enable Skill</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: Spacing[2] },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  sub: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },
  tabBarRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
    borderRadius: Radius.sm,
    gap: 6,
  },
  mainTabActive: {
    backgroundColor: '#F3F4F6',
  },
  mainTabText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.textTertiary,
  },
  mainTabTextActive: {
    color: Colors.adminColor,
    fontWeight: Typography.bold,
  },
  filterWrapper: { height: 44 },
  filters: { paddingHorizontal: Spacing[5], gap: Spacing[2], alignItems: 'center' },
  chip: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[1], borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, height: 32, justifyContent: 'center' },
  chipActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  chipText: { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
  workerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[2], gap: Spacing[3], ...Shadow.sm },
  workerInfo: { flex: 1 },
  workerNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing[2], marginBottom: 2 },
  workerName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  workerSkills: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4 },
  workerStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing[2] },
  statText: { fontSize: Typography.xs, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  stage2ActionRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1] },
  rejectBtn: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error },
  rejectText: { fontSize: Typography.xs, color: Colors.error, fontWeight: Typography.semibold },
  approveBtn: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: Radius.md, backgroundColor: Colors.adminColor },
  approveText: { fontSize: Typography.xs, color: '#fff', fontWeight: Typography.semibold },
  revokeBtn: { paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.textTertiary },
  revokeText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[2],
  },
  sectionHeaderTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.adminColor,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.md,
    gap: 4,
  },
  addSkillBtnText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[2],
    ...Shadow.sm,
  },
  skillName: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  skillMeta: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  skillDesc: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    ...Shadow.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  modalForm: {
    gap: Spacing[3],
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  modalInput: {
    backgroundColor: Colors.surfaceTinted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontSize: Typography.sm,
    color: Colors.textPrimary,
  },
  createSkillSubmitBtn: {
    backgroundColor: Colors.adminColor,
    paddingVertical: Spacing[3],
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  createSkillSubmitText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#ffffff',
  },
});
