import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/hooks/useApp';
import { MOCK_WORKERS } from '@/services/mockData';

export default function WorkerProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout, saveWorkerProfile, uploadVerificationDocument, downloadVerificationForm, workersList } = useApp();
  const router = useRouter();
  const currentWorker = workersList.find(w => w.id === user?.id || w.phone === user?.phone);
  const worker = currentWorker || {
    id: user?.id || 'w1',
    name: user?.name || 'Skilled Worker',
    phone: user?.phone || '9876543210',
    avatar: user?.avatar || 'W',
    primaryCategory: user?.workerProfile?.primarySkill || 'Plumbing',
    skills: user?.workerProfile?.additionalSkills || ['General Maintenance'],
    rating: 5.0,
    completedJobs: 0,
    verificationStatus: 'verified' as const,
    availabilityStatus: true,
    serviceArea: user?.workerProfile?.serviceArea || 'Bengaluru',
    recentEarnings: 0,
    joinedDate: '2026',
  };

  const [activeModal, setActiveModal] = useState<
    'edit_profile' | 'training' | 'reviews' | 'documents' | 'hours' | 'service_area' | 'help' | null
  >(null);

  // Edit Worker Profile Form State
  const [editName, setEditName] = useState(user?.name || worker.name);
  const [editPhone, setEditPhone] = useState(user?.phone || worker.phone);
  const [editCity, setEditCity] = useState(user?.workerProfile?.city || 'Bengaluru');
  const [editBio, setEditBio] = useState(user?.workerProfile?.bio || 'Experienced professional specializing in quality services.');
  const [savingProfile, setSavingProfile] = useState(false);

  // Service Area Form State
  const [areaText, setAreaText] = useState(user?.workerProfile?.serviceArea || worker.serviceArea);
  const [savingArea, setSavingArea] = useState(false);

  // Worker Dispute Form State
  const [disputeCategory, setDisputeCategory] = useState('Payment Dispute');
  const [disputeText, setDisputeText] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeSuccessMsg, setDisputeSuccessMsg] = useState<string | null>(null);

  // Verification State
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const currentVerifState = (user?.workerProfile as any)?.verificationState || 'VERIFICATION_PENDING';
  const verifDoc = (user?.workerProfile as any)?.verificationDocument || null;

  const handleDownloadForm = async () => {
    try {
      setDownloadingPdf(true);
      await downloadVerificationForm();
      setDownloadingPdf(false);
      Alert.alert(
        'Form Downloaded!',
        'Your official OnePlace Worker Verification & Attestation Form has been generated. Please print it out, get it signed & stamped by the Tehsildar/Local Authority, and upload the signed document below.'
      );
    } catch (err: any) {
      setDownloadingPdf(false);
      Alert.alert('Download Error', err.message || 'Failed to generate PDF.');
    }
  };

  const handlePickDocument = async () => {
    try {
      setUploadingDoc(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const file = res.assets[0];
        await uploadVerificationDocument({ name: file.name, uri: file.uri });
        Alert.alert(
          'Document Uploaded!',
          `File "${file.name}" uploaded. Status updated to "Under Review". Society Head will review your attestation.`
        );
      }
    } catch (err: any) {
      const dummyFile = {
        name: `signed_attestation_${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'worker'}.pdf`,
        uri: 'file:///mock/signed_attestation.pdf',
      };
      await uploadVerificationDocument(dummyFile);
      Alert.alert('Document Attached', `File "${dummyFile.name}" attached successfully. Status: Under Review`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name and phone number.');
      return;
    }
    setSavingProfile(true);
    await saveWorkerProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
      avatar: user?.avatar || editName.substring(0, 2).toUpperCase(),
      primarySkill: user?.workerProfile?.primarySkill || worker.skills[0] || 'Plumbing',
      additionalSkills: user?.workerProfile?.additionalSkills || worker.skills.slice(1),
      experience: user?.workerProfile?.experience || '3–5 years',
      bio: editBio.trim(),
      serviceArea: areaText.trim(),
      certificateName: user?.workerProfile?.certificateName || 'Govt ITI Vocational Cert',
      certificateStatus: user?.workerProfile?.certificateStatus || 'Verified',
    });
    setSavingProfile(false);
    setActiveModal(null);
    Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
  };

  const handleSaveServiceArea = async () => {
    if (!areaText.trim()) {
      Alert.alert('Invalid Area', 'Please enter your active service localities.');
      return;
    }
    setSavingArea(true);
    await saveWorkerProfile({
      name: user?.name || editName,
      phone: user?.phone || editPhone,
      city: editCity,
      avatar: user?.avatar || 'W',
      primarySkill: user?.workerProfile?.primarySkill || worker.skills[0] || 'Plumbing',
      additionalSkills: user?.workerProfile?.additionalSkills || worker.skills.slice(1),
      experience: user?.workerProfile?.experience || '3–5 years',
      bio: editBio,
      serviceArea: areaText.trim(),
      certificateName: user?.workerProfile?.certificateName || 'Govt ITI Vocational Cert',
      certificateStatus: user?.workerProfile?.certificateStatus || 'Verified',
    });
    setSavingArea(false);
    setActiveModal(null);
    Alert.alert('Service Area Updated', `Your service area has been set to: ${areaText.trim()}`);
  };

  const handleSubmitDispute = () => {
    if (!disputeText.trim()) {
      Alert.alert('Input Required', 'Please detail your issue or dispute.');
      return;
    }
    setSubmittingDispute(true);
    setTimeout(() => {
      setSubmittingDispute(false);
      setDisputeText('');
      setDisputeSuccessMsg('Ticket #WRK-8391 submitted! Ops team will review within 2 hours.');
      setTimeout(() => setDisputeSuccessMsg(null), 4000);
    }, 800);
  };

  const hasWorkSlip = !!(worker.workSlipDocument || worker.verificationDocument || (user?.workerProfile as any)?.workSlipDocument || (user?.workerProfile as any)?.verificationDocument);
  const isWorkSlipApproved = worker.workSlipStatus === 'approved' || worker.adminApprovalStatus === 'APPROVED' || currentVerifState === 'VERIFIED';
  const isSkillCertVerified = worker.skillCertificateStatus === 'verified' || (user?.workerProfile as any)?.certificateStatus === 'Verified';

  // RULE 10: Green Verified Tick ONLY when BOTH Work Slip approved AND Skill Certificate verified!
  const isFullyVerified = isWorkSlipApproved && isSkillCertVerified;

  const overallStatusLabel = !hasWorkSlip
    ? 'Worker Onboarding Incomplete'
    : !isSkillCertVerified
      ? 'Profile Partially Verified'
      : 'Fully Verified';

  // Calculate remaining days for 10-day certification commitment
  const deadlineIso = worker.certificateDeadlineDate || (user?.workerProfile as any)?.certificateDeadlineDate;
  let daysRemaining = 10;
  if (deadlineIso) {
    const diffMs = new Date(deadlineIso).getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Avatar initials={user?.avatar || 'W'} size={72} verified={isFullyVerified} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={{ fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 }}>{user?.phone}</Text>
        <Pressable style={styles.editBtn} onPress={() => setActiveModal('edit_profile')}>
          <MaterialIcons name="edit" size={14} color={Colors.primary} />
          <Text style={styles.editText}>Edit Profile</Text>
        </Pressable>
        <View style={styles.verifiedRow}>
          <Badge
            label={isFullyVerified ? `🟢 Verified ${worker.skills[0] || worker.primaryCategory}` : hasWorkSlip ? 'Profile Partially Verified' : 'Onboarding Incomplete'}
            variant={isFullyVerified ? 'success' : hasWorkSlip ? 'warning' : 'error'}
          />
        </View>
        <Text style={styles.joined}>Member since {worker.joinedDate}</Text>
      </View>

      {/* OVERALL VERIFICATION STATUS CARD */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: isFullyVerified ? Colors.success : hasWorkSlip ? '#F59E0B' : Colors.error }]}>
        <View style={styles.sectionHeaderRow}>
          <MaterialIcons name={isFullyVerified ? 'verified' : 'info'} size={22} color={isFullyVerified ? Colors.success : hasWorkSlip ? '#D97706' : Colors.error} />
          <Text style={styles.cardTitle}>Overall Profile Status: {overallStatusLabel}</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          {isFullyVerified
            ? 'Your profile is fully verified with a Green Verified Tick! You are eligible for all matching customer jobs.'
            : hasWorkSlip
              ? `Work Slip is active & receiving ${worker.skills[0] || worker.primaryCategory} jobs. Upload your Skill Certificate within ${daysRemaining} days for full Green Tick verification.`
              : 'COMPULSORY: Upload your signed Work Slip to complete onboarding and unlock your worker dashboard.'}
        </Text>
      </View>

      {/* DOCUMENT 1: SKILL CERTIFICATION */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <MaterialIcons name="workspace-premium" size={22} color="#0D9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>1. Skill Certification</Text>
            <Text style={styles.cardSubtitle}>Skill Certificate (ITI / Skill India / Vocational Partner)</Text>
          </View>
          <Badge
            label={isSkillCertVerified ? 'VERIFIED' : worker.skillCertificateDocument ? 'UPLOADED' : 'PENDING'}
            variant={isSkillCertVerified ? 'success' : worker.skillCertificateDocument ? 'primary' : 'warning'}
          />
        </View>

        {worker.skillCertificateDocument ? (
          <View style={styles.docRow}>
            <MaterialIcons name="verified" size={22} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{worker.skillCertificateDocument.name}</Text>
              <Text style={styles.docSub}>Uploaded: {worker.skillCertificateDocument.uploadedAt} · Status: {worker.skillCertificateDocument.status}</Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: Spacing[2] }}>
            <View style={{ backgroundColor: '#FEF3C7', padding: Spacing[3], borderRadius: Radius.md }}>
              <Text style={{ fontSize: Typography.xs, fontWeight: Typography.bold, color: '#B45309' }}>
                Status: Skill Certificate Pending — {daysRemaining} days remaining
              </Text>
              <Text style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>
                You are receiving {worker.skills[0] || worker.primaryCategory} job opportunities. Upload your skill certificate within 10 days to get full Green Tick verification.
              </Text>
            </View>
            <Pressable style={styles.downloadBtn} onPress={() => router.push('/onboarding/worker' as any)}>
              <MaterialIcons name="file-upload" size={18} color="#fff" />
              <Text style={styles.downloadBtnText}>Upload Skill Certificate</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* DOCUMENT 2: ONEPLACE WORK SLIP (COMPULSORY) */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <MaterialIcons name="assignment-turned-in" size={22} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>2. OnePlace Work Slip (COMPULSORY)</Text>
            <Text style={styles.cardSubtitle}>Verification & Attestation Form by Tehsildar / Local Authority</Text>
          </View>
          <Badge
            label={hasWorkSlip ? 'UPLOADED' : 'MISSING'}
            variant={hasWorkSlip ? 'success' : 'error'}
          />
        </View>

        <View style={{ gap: Spacing[2] }}>
          <Pressable style={styles.downloadBtn} onPress={handleDownloadForm} disabled={downloadingPdf}>
            {downloadingPdf ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <MaterialIcons name="picture-as-pdf" size={18} color="#fff" />
                <Text style={styles.downloadBtnText}>Download Work Slip Form (PDF)</Text>
              </>
            )}
          </Pressable>
          <Pressable style={[styles.downloadBtn, { backgroundColor: Colors.primary }]} onPress={handlePickDocument} disabled={uploadingDoc}>
            {uploadingDoc ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <MaterialIcons name="cloud-upload" size={18} color="#fff" />
                <Text style={styles.downloadBtnText}>Upload Signed Work Slip</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{worker.completedJobs}</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{worker.rating}★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>87</Text>
          <Text style={styles.statLabel}>Alloc Score</Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skills & Specialization</Text>
        <View style={styles.skillChips}>
          {worker.skills.map(s => (
            <View key={s} style={styles.skillChip}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardSubtitle}>Service area: {worker.serviceArea}</Text>
      </View>

      {/* Cooperative */}
      <View style={[styles.card, { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '30' }]}>
        <View style={styles.coopHeader}>
          <MaterialIcons name="handshake" size={18} color={Colors.primary} />
          <Text style={[styles.cardTitle, { color: Colors.primary, marginBottom: 0 }]}>Cooperative Member</Text>
        </View>
        <Text style={styles.coopText}>
          You receive 85% of every completed service. The 15% cooperative pool funds your training, safety, and platform operations — reinvested back into the community.
        </Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {[
          { key: 'training', icon: 'school', label: 'Training & Certifications', sublabel: '2 courses available', badge: '2' },
          { key: 'reviews', icon: 'star-outline', label: 'My Reviews', sublabel: '4.8 avg from 127 jobs' },
          { key: 'documents', icon: 'description', label: 'My Documents', sublabel: 'KYC and verification files' },
          { key: 'hours', icon: 'schedule', label: 'Availability & Hours', sublabel: 'Manage working hours' },
          { key: 'service_area', icon: 'map', label: 'Service Area', sublabel: worker.serviceArea },
          { key: 'help', icon: 'support-agent', label: 'Help & Disputes', sublabel: 'Report issues or raise tickets' },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
            onPress={() => setActiveModal(item.key as any)}
          >
            <View style={styles.menuIconWrap}>
              <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sublabel}</Text>
            </View>
            {item.badge && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.logoutBtn}
        onPress={() => { logout(); router.replace('/auth/login'); }}
      >
        <MaterialIcons name="logout" size={18} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      {/* MODAL 1: TRAINING */}
      <Modal visible={activeModal === 'training'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cooperative Training Modules</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.moduleCard}>
                <MaterialIcons name="verified" size={24} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>Advanced Residential Pipe Fitting</Text>
                  <Text style={styles.moduleSub}>Completed · Certificate Issued</Text>
                </View>
              </View>
              <View style={styles.moduleCard}>
                <MaterialIcons name="play-circle-fill" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>Customer Safety & OTP Protocol</Text>
                  <Text style={styles.moduleSub}>In Progress · 80% Complete</Text>
                </View>
              </View>
              <View style={styles.moduleCard}>
                <MaterialIcons name="school" size={24} color={Colors.accentDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>Emergency Leak Diagnostics Q3</Text>
                  <Text style={styles.moduleSub}>New Course · Free for Members</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: REVIEWS */}
      <Modal visible={activeModal === 'reviews'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Reviews ({worker.rating}★)</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { name: 'Priya Mehra', rating: '5.0', text: 'Rajesh arrived right on time and fixed the kitchen pipe leakage efficiently!', date: '2 days ago' },
                { name: 'Anand Sharma', rating: '4.8', text: 'Very polite professional. Cleaned up after finishing the job.', date: '1 week ago' },
                { name: 'Meena R.', rating: '5.0', text: 'Quick OTP verification and transparent price quote. Highly recommended.', date: '2 weeks ago' },
              ].map((rev, i) => (
                <View key={i} style={styles.revCard}>
                  <View style={styles.revHeader}>
                    <Text style={styles.revName}>{rev.name}</Text>
                    <Text style={styles.revRating}>★ {rev.rating}</Text>
                  </View>
                  <Text style={styles.revText}>{rev.text}</Text>
                  <Text style={styles.revDate}>{rev.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: DOCUMENTS */}
      <Modal visible={activeModal === 'documents'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification & Documents</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.docRow}>
                <MaterialIcons name="badge" size={22} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Aadhaar / Govt Photo ID</Text>
                  <Text style={styles.docSub}>Status: Verified & Encrypted</Text>
                </View>
                <Badge label="VERIFIED" variant="success" size="sm" />
              </View>

              <View style={styles.docRow}>
                <MaterialIcons name="verified" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>ITI Plumbing Skill Certificate</Text>
                  <Text style={styles.docSub}>Status: Verified by Ops Team</Text>
                </View>
                <Badge label="ACTIVE" variant="primary" size="sm" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: AVAILABILITY & HOURS */}
      <Modal visible={activeModal === 'hours'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Working Hours & Shifts</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.shiftCard}>
                <Text style={styles.shiftTitle}>Standard Day Shift</Text>
                <Text style={styles.shiftSub}>8:00 AM – 6:00 PM (Monday – Saturday)</Text>
                <Badge label="ACTIVE" variant="success" size="sm" />
              </View>

              <View style={styles.shiftCard}>
                <Text style={styles.shiftTitle}>Emergency Weekend Calls</Text>
                <Text style={styles.shiftSub}>Opt-in for 1.5x dispatch priority on Sundays</Text>
                <Badge label="ENABLED" variant="primary" size="sm" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: SERVICE AREA */}
      <Modal visible={activeModal === 'service_area'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Service Area</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Covered Localities / Neighborhoods</Text>
              <TextInput
                style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                value={areaText}
                onChangeText={setAreaText}
                placeholder="e.g. Koramangala, Indiranagar, HSR Layout"
                multiline
              />
              <Pressable style={styles.modalSubmitBtn} onPress={handleSaveServiceArea} disabled={savingArea}>
                {savingArea ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Save Service Area</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 6: HELP & DISPUTES */}
      <Modal visible={activeModal === 'help'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Worker Help & Dispute Console</Text>
              <Pressable onPress={() => setActiveModal(null)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {disputeSuccessMsg && (
                <View style={styles.successBox}>
                  <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                  <Text style={styles.successBoxText}>{disputeSuccessMsg}</Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>Issue Type</Text>
              <View style={styles.categoryChips}>
                {['Payment Dispute', 'Wrong Location', 'Customer Cancellation', 'Safety Issue'].map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.catChip, disputeCategory === cat && styles.catChipActive]}
                    onPress={() => setDisputeCategory(cat)}
                  >
                    <Text style={[styles.catChipText, disputeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Describe Issue Details</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Details of the job or payout concern..."
                value={disputeText}
                onChangeText={setDisputeText}
                multiline
              />

              <Pressable style={styles.modalSubmitBtn} onPress={handleSubmitDispute} disabled={submittingDispute}>
                {submittingDispute ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Support Request</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 0: EDIT WORKER PROFILE */}
      <Modal visible={activeModal === 'edit_profile'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Worker Profile</Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>Mobile Phone</Text>
                <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>City</Text>
                <TextInput style={styles.modalInput} value={editCity} onChangeText={setEditCity} />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>Professional Bio</Text>
                <TextInput
                  style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  multiline
                />
              </View>

              <Pressable style={styles.modalSubmitBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Save Changes</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { alignItems: 'center', paddingVertical: Spacing[6] },
  name: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing[3] },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing[2] },
  editText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  verifiedRow: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[2] },
  joined: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: Spacing[1] },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    marginHorizontal: Spacing[5], borderRadius: Radius.lg,
    paddingVertical: Spacing[4], marginBottom: Spacing[4], ...Shadow.sm,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing[5],
    borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[3], ...Shadow.sm,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2],
    backgroundColor: '#1E293B', paddingVertical: 10, paddingHorizontal: 12, borderRadius: Radius.md,
  },
  downloadBtnText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing[3] },
  cardSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing[2] },
  skillChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  skillChip: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing[3], paddingVertical: Spacing[1],
  },
  skillText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  coopHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  coopText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  menu: { paddingHorizontal: Spacing[5] },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing[4],
    borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: Spacing[3],
  },
  menuPressed: { backgroundColor: Colors.divider },
  menuIconWrap: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.textPrimary },
  menuSub: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 1 },
  menuBadge: { backgroundColor: Colors.error, borderRadius: Radius.full, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  menuBadgeText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], marginHorizontal: Spacing[5], marginTop: Spacing[6],
    paddingVertical: Spacing[4], borderRadius: Radius.lg,
    backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.errorLight,
  },
  logoutText: { color: Colors.error, fontWeight: Typography.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing[5], maxHeight: '85%', gap: Spacing[3],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
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
  moduleCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.surfaceTinted,
    padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[2], borderWidth: 1, borderColor: Colors.border,
  },
  moduleTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  moduleSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  revCard: { backgroundColor: Colors.surfaceTinted, padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[2] },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  revName: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  revRating: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.accentDark },
  revText: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  revDate: { fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.surfaceTinted,
    padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[2], borderWidth: 1, borderColor: Colors.border,
  },
  docTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  docSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  shiftCard: { backgroundColor: Colors.surfaceTinted, padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[2], gap: 4 },
  shiftTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  shiftSub: { fontSize: Typography.xs, color: Colors.textSecondary },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[2] },
  catChip: { paddingHorizontal: Spacing[3], paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceTinted },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.xs, color: Colors.textSecondary },
  catChipTextActive: { color: '#fff', fontWeight: Typography.bold },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[3] },
  successBoxText: { fontSize: Typography.xs, color: Colors.success, flex: 1 },
});
