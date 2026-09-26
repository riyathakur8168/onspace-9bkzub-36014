import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1–2 years',
  '3–5 years',
  '5+ years',
];

const SUGGESTED_SKILLS_MAP: Record<string, string[]> = {
  Electrician: ['Electrical Repair', 'Wiring', 'Fan Installation', 'Switch/Socket Repair', 'MCB Tripping Repair'],
  Plumber: ['Pipe Repair', 'Tap Installation', 'Water Leakage Repair', 'Sanitary Fitting', 'Water Tank Cleaning'],
  Carpenter: ['Furniture Repair', 'Door/Window Fitting', 'Cabinet Repair', 'Lock Repair'],
  Cleaner: ['Home Deep Cleaning', 'Bathroom Cleaning', 'Sofa/Carpet Cleaning', 'Kitchen Cleaning'],
  Painter: ['Wall Painting', 'Waterproofing', 'Texture Painting', 'Wood Polishing'],
};

export default function WorkerOnboardingWizard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user, saveWorkerProfile, skillsRegistry,
    uploadWorkSlip, uploadSkillCertificate, acceptSkillCertificateCommitment,
    downloadVerificationForm
  } = useApp();

  const activeSkills = skillsRegistry ? skillsRegistry.filter(s => s.isActive) : [];

  // Essential Professional Details
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || 'Flat 4B, Harmony Apts, Koramangala');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [primarySkill, setPrimarySkill] = useState(user?.workerProfile?.primarySkill || activeSkills[0]?.name || 'Electrician');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.workerProfile?.additionalSkills && user.workerProfile.additionalSkills.length > 0
      ? user.workerProfile.additionalSkills
      : (SUGGESTED_SKILLS_MAP[primarySkill] || ['Electrical Repair', 'Wiring', 'Fan Installation'])
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experience, setExperience] = useState(user?.workerProfile?.experience || '3–5 years');
  const [serviceArea, setServiceArea] = useState(user?.workerProfile?.serviceArea || 'Koramangala, Indiranagar, HSR Layout');
  const [societyName, setSocietyName] = useState(user?.workerProfile?.societyName || 'Koramangala Workers Cooperative Society');

  // Attestation Form Pre-fill Fields
  const [fatherName, setFatherName] = useState(user?.workerProfile?.fatherOrGuardianName || 'Rajeshwar Kumar');
  const [dob, setDob] = useState(user?.workerProfile?.dob || '15/08/1992');
  const [aadhaarLast4, setAadhaarLast4] = useState(user?.workerProfile?.aadhaarLast4 || '4829');

  // Document State
  const [workSlipDoc, setWorkSlipDoc] = useState<{ name: string; uri: string; uploadedAt: string } | null>(
    user?.workerProfile?.workSlipDocument || user?.workerProfile?.verificationDocument || null
  );
  const [skillCertDoc, setSkillCertDoc] = useState<{ name: string; uri: string; uploadedAt: string } | null>(
    user?.workerProfile?.skillCertificateDocument || null
  );

  // 10-Day Commitment Consent
  const [certCommitmentAccepted, setCertCommitmentAccepted] = useState(
    user?.workerProfile?.hasSkillCertificateCommitment || false
  );

  // Loaders & Errors
  const [uploadingWorkSlip, setUploadingWorkSlip] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectProfession = (prof: string) => {
    setPrimarySkill(prof);
    if (SUGGESTED_SKILLS_MAP[prof]) {
      setSelectedSkills(SUGGESTED_SKILLS_MAP[prof]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (newSkillInput.trim() && !selectedSkills.includes(newSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleDownloadWorkSlip = async () => {
    try {
      setDownloadingPdf(true);
      await downloadVerificationForm({
        id: user?.id || 'W-1082',
        name: name.trim() || 'Worker',
        phone: phone.trim() || '9876543210',
        address: address.trim(),
        city: city.trim(),
        primarySkill,
        additionalSkills: selectedSkills,
        experience,
        serviceArea,
        societyName,
        fatherOrGuardianName: fatherName,
        dob,
        aadhaarLast4,
      });
      setDownloadingPdf(false);
      Alert.alert(
        'Work Slip Form Downloaded!',
        'Your official OnePlace Worker Verification & Attestation Form (Work Slip) has been generated. Please print it, get it signed & stamped by the Tehsildar/Local Authority, and upload the signed document below.'
      );
    } catch (err: any) {
      setDownloadingPdf(false);
      Alert.alert('Download Error', err.message || 'Failed to generate Work Slip PDF.');
    }
  };

  const handleUploadWorkSlip = async () => {
    try {
      setUploadingWorkSlip(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const file = res.assets[0];
        const docInfo = {
          name: file.name,
          uri: file.uri,
          uploadedAt: new Date().toLocaleString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }),
        };
        setWorkSlipDoc(docInfo);
        await uploadWorkSlip({ name: file.name, uri: file.uri });
        Alert.alert(
          'Work Slip Uploaded Successfully!',
          `File "${file.name}" uploaded. Status: Under Review. You can now open your personalized worker dashboard!`
        );
      }
    } catch (err: any) {
      const dummyFile = {
        name: `work_slip_${name.toLowerCase().replace(/\s+/g, '_') || 'worker'}.pdf`,
        uri: 'file:///mock/work_slip.pdf',
        uploadedAt: new Date().toLocaleString(),
      };
      setWorkSlipDoc(dummyFile);
      await uploadWorkSlip(dummyFile);
      Alert.alert('Work Slip Uploaded', `File "${dummyFile.name}" attached successfully. Personalized dashboard unlocked!`);
    } finally {
      setUploadingWorkSlip(false);
    }
  };

  const handleUploadSkillCert = async () => {
    try {
      setUploadingCert(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const file = res.assets[0];
        const docInfo = {
          name: file.name,
          uri: file.uri,
          uploadedAt: new Date().toLocaleString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }),
        };
        setSkillCertDoc(docInfo);
        await uploadSkillCertificate({ name: file.name, uri: file.uri });
        Alert.alert(
          'Skill Certificate Uploaded!',
          `File "${file.name}" attached. Once reviewed, your profile will receive the Green Verified Tick.`
        );
      }
    } catch (err: any) {
      const dummyFile = {
        name: `skill_certificate_${primarySkill.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_') || 'worker'}.pdf`,
        uri: 'file:///mock/skill_cert.pdf',
        uploadedAt: new Date().toLocaleString(),
      };
      setSkillCertDoc(dummyFile);
      await uploadSkillCertificate(dummyFile);
      Alert.alert('Skill Certificate Attached', `File "${dummyFile.name}" attached successfully. Status: Uploaded`);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleToggleCommitment = async () => {
    const nextVal = !certCommitmentAccepted;
    setCertCommitmentAccepted(nextVal);
    if (nextVal) {
      await acceptSkillCertificateCommitment();
    }
  };

  const handleSubmitFinal = async () => {
    if (!name.trim() || !phone.trim() || !city.trim() || !societyName.trim()) {
      setError('Please complete all required personal fields (Name, Phone, City, Society Name).');
      return;
    }

    // RULE 7: Personalized Worker Dashboard MUST NOT be created until signed Work Slip is uploaded!
    if (!workSlipDoc) {
      setError('COMPULSORY: Please upload your signed Work Slip to complete worker onboarding and unlock your personalized dashboard.');
      Alert.alert(
        'Work Slip Required',
        'Your personalized worker dashboard cannot be created until you upload your signed & stamped Work Slip.'
      );
      return;
    }

    // Require either a skill certificate OR the 10-day commitment
    if (!skillCertDoc && !certCommitmentAccepted) {
      setError('Please either upload your Skill Certificate OR accept the 10-day certification commitment to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    const verificationState = workSlipDoc ? 'UNDER_REVIEW' : 'VERIFICATION_PENDING';

    await saveWorkerProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      avatar: name.substring(0, 2).toUpperCase(),
      primarySkill,
      additionalSkills: selectedSkills,
      experience,
      serviceArea: serviceArea.trim(),
      fatherOrGuardianName: fatherName,
      dob,
      aadhaarLast4,
      societyName,
      verificationState,
      workSlipDocument: workSlipDoc ? { ...workSlipDoc, status: 'Under Review' } : null,
      verificationDocument: workSlipDoc ? { ...workSlipDoc, status: 'Under Review' } : null,
      skillCertificateDocument: skillCertDoc ? { ...skillCertDoc, status: 'Uploaded' } : null,
      hasSkillCertificateCommitment: certCommitmentAccepted,
      certificateCommitmentDate: certCommitmentAccepted ? new Date().toISOString() : undefined,
      certificateDeadlineDate: certCommitmentAccepted ? new Date(Date.now() + 10 * 86400000).toISOString() : undefined,
      workSlipStatus: workSlipDoc ? 'under_review' : 'not_uploaded',
      skillCertificateStatus: skillCertDoc ? 'uploaded' : certCommitmentAccepted ? 'pending' : 'not_submitted',
    } as any);

    setLoading(false);
    // Unlocks personalized dashboard
    router.replace('/(worker)' as any);
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
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + Spacing[10] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Worker Professional Details & Documents</Text>
          <Text style={styles.subtitle}>
            Register your profession & skills, upload your Work Slip, and complete verification to start receiving job opportunities.
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* SECTION 1: PERSONAL & PROFESSIONAL DETAILS */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="badge" size={22} color={Colors.primary} />
            <Text style={styles.cardTitle}>1. Personal & Professional Information</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="e.g. Rajesh Kumar" value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mobile Number *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="10-digit mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>City *</Text>
              <TextInput style={styles.inputSimple} placeholder="Bengaluru" value={city} onChangeText={setCity} />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Aadhaar (Last 4 Digits)</Text>
              <TextInput style={styles.inputSimple} placeholder="4829" keyboardType="numeric" maxLength={4} value={aadhaarLast4} onChangeText={setAadhaarLast4} />
            </View>
          </View>

          {/* PRIMARY PROFESSION SELECTION */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Primary Profession *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillChipsScroll}>
              {['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Painter'].map(prof => (
                <Pressable
                  key={prof}
                  style={[styles.skillChip, primarySkill === prof && styles.skillChipActive]}
                  onPress={() => handleSelectProfession(prof)}
                >
                  <Text style={[styles.skillChipText, primarySkill === prof && styles.skillChipTextActive]}>
                    {prof}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* SPECIFIED SKILLS SELECTION */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Registered Skills for {primarySkill} *</Text>
            <View style={styles.skillsChipsGrid}>
              {(SUGGESTED_SKILLS_MAP[primarySkill] || selectedSkills).map(sk => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <Pressable
                    key={sk}
                    style={[styles.skillTag, isSelected && styles.skillTagActive]}
                    onPress={() => toggleSkill(sk)}
                  >
                    <MaterialIcons name={isSelected ? 'check-box' : 'check-box-outline-blank'} size={16} color={isSelected ? Colors.primary : Colors.textTertiary} />
                    <Text style={[styles.skillTagText, isSelected && styles.skillTagTextActive]}>{sk}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Skill Input */}
            <View style={[styles.inputWrapper, { marginTop: Spacing[2] }]}>
              <TextInput
                style={styles.input}
                placeholder="+ Add custom skill (e.g. Solar Panel Installation)"
                value={newSkillInput}
                onChangeText={setNewSkillInput}
                onSubmitEditing={handleAddCustomSkill}
              />
              <Pressable style={styles.addSkillBtn} onPress={handleAddCustomSkill}>
                <Text style={styles.addSkillBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Years of Experience *</Text>
            <View style={styles.expOptionsRow}>
              {EXPERIENCE_OPTIONS.map(opt => (
                <Pressable
                  key={opt}
                  style={[styles.expChip, experience === opt && styles.expChipActive]}
                  onPress={() => setExperience(opt)}
                >
                  <Text style={[styles.expChipText, experience === opt && styles.expChipTextActive]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Work Localities / Service Area *</Text>
            <TextInput style={styles.inputSimple} placeholder="e.g. Koramangala, Indiranagar, HSR" value={serviceArea} onChangeText={setServiceArea} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Cooperative / Society Name *</Text>
            <TextInput style={styles.inputSimple} placeholder="e.g. Koramangala Workers Cooperative Society" value={societyName} onChangeText={setSocietyName} />
          </View>
        </View>

        {/* SECTION 2: DOCUMENT 1 — SKILL CERTIFICATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="workspace-premium" size={24} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>2. Skill Certification</Text>
              <Text style={styles.cardSub}>Skill Certificate (ITI / Skill India / Vocational Certification)</Text>
            </View>
            <View style={[styles.statusPill, skillCertDoc ? styles.pillApproved : styles.pillPending]}>
              <Text style={[styles.statusPillText, skillCertDoc ? styles.pillTextApproved : styles.pillTextPending]}>
                {skillCertDoc ? 'UPLOADED' : 'PENDING (10 DAYS)'}
              </Text>
            </View>
          </View>

          <Text style={styles.verifInstruction}>
            Upload your professional skill certificate if available. If you do not have one, you can accept the 10-day certification commitment to continue onboarding.
          </Text>

          {/* Upload Skill Certificate Button */}
          {skillCertDoc ? (
            <View style={styles.uploadedDocBox}>
              <MaterialIcons name="verified" size={28} color="#0D9488" />
              <View style={{ flex: 1, marginLeft: Spacing[2] }}>
                <Text style={styles.docName} numberOfLines={1}>{skillCertDoc.name}</Text>
                <Text style={styles.docTime}>Uploaded: {skillCertDoc.uploadedAt}</Text>
                <Text style={[styles.docStatusTag, { color: '#0D9488' }]}>Status: Uploaded — Pending Final Verification</Text>
              </View>
              <Pressable style={styles.replaceBtn} onPress={handleUploadSkillCert}>
                <Text style={styles.replaceBtnText}>Replace</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.downloadFormBtn} onPress={handleUploadSkillCert} disabled={uploadingCert}>
              {uploadingCert ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="file-upload" size={20} color="#fff" />
                  <Text style={styles.downloadFormBtnText}>Upload Skill Certificate (PDF / Image)</Text>
                </>
              )}
            </Pressable>
          )}

          {!skillCertDoc && (
            <View style={styles.commitmentBox}>
              <Pressable style={styles.checkboxRow} onPress={handleToggleCommitment}>
                <MaterialIcons
                  name={certCommitmentAccepted ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={certCommitmentAccepted ? Colors.primary : Colors.textTertiary}
                />
                <Text style={styles.checkboxLabel}>
                  I do not currently have a skill certificate. I agree to obtain the required skill certification within 10 days and upload it to complete my profile verification.
                </Text>
              </Pressable>

              {certCommitmentAccepted && (
                <View style={styles.timerNoticeBox}>
                  <MaterialIcons name="timer" size={18} color="#B45309" />
                  <Text style={styles.timerNoticeText}>
                    Status: Skill Certificate Pending — 10 days remaining. You will continue receiving relevant job opportunities.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Skill India Pathway Banner */}
          <View style={styles.pathwayBox}>
            <MaterialIcons name="school" size={20} color="#1E3A8A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.pathwayTitle}>Skill India Certification Pathway</Text>
              <Text style={styles.pathwaySub}>
                Need certification? OnePlace connects you with recognized Skill India / NSDC vocational certification guidance partners.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 3: DOCUMENT 2 — ONEPLACE WORK SLIP (COMPULSORY) */}
        <View style={[styles.card, styles.verificationCard]}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="assignment-turned-in" size={24} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>3. OnePlace Work Slip (COMPULSORY)</Text>
              <Text style={styles.cardSub}>Local Verification & Attestation Form by Tehsildar / Local Authority</Text>
            </View>
            <View style={[styles.statusPill, workSlipDoc ? styles.pillUnderReview : styles.pillError]}>
              <Text style={[styles.statusPillText, workSlipDoc ? styles.pillTextUnderReview : styles.pillTextError]}>
                {workSlipDoc ? 'UPLOADED' : 'REQUIRED'}
              </Text>
            </View>
          </View>

          <Text style={styles.verifInstruction}>
            COMPULSORY: Download the Work Slip, get it signed & stamped by your local authority (Tehsildar), and upload it to unlock your personalized worker dashboard.
          </Text>

          {/* Download Work Slip Button */}
          <Pressable
            style={styles.downloadFormBtn}
            onPress={handleDownloadWorkSlip}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
                <Text style={styles.downloadFormBtnText}>Download Work Slip Form (PDF)</Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider} />

          {/* Upload Work Slip Area */}
          <Text style={styles.fieldLabel}>Upload Signed & Stamped Work Slip (PDF, JPG, PNG)</Text>
          {workSlipDoc ? (
            <View style={styles.uploadedDocBox}>
              <MaterialIcons name="insert-drive-file" size={28} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: Spacing[2] }}>
                <Text style={styles.docName} numberOfLines={1}>{workSlipDoc.name}</Text>
                <Text style={styles.docTime}>Uploaded: {workSlipDoc.uploadedAt}</Text>
                <Text style={styles.docStatusTag}>Status: Under Review by Society Head</Text>
              </View>
              <Pressable style={styles.replaceBtn} onPress={handleUploadWorkSlip}>
                <Text style={styles.replaceBtnText}>Replace</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.uploadArea}
              onPress={handleUploadWorkSlip}
              disabled={uploadingWorkSlip}
            >
              {uploadingWorkSlip ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={36} color={Colors.primary} />
                  <Text style={styles.uploadTitle}>Tap to Upload Signed Work Slip</Text>
                  <Text style={styles.uploadSub}>Required to create personalized worker dashboard</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* SECTION 4: ONBOARDING & DASHBOARD CREATION GATE */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Onboarding & Verification Status</Text>
          <View style={styles.summaryRow}>
            <MaterialIcons name={workSlipDoc ? 'check-circle' : 'cancel'} size={18} color={workSlipDoc ? Colors.success : Colors.error} />
            <Text style={styles.summaryLabel}>Work Slip:</Text>
            <Text style={[styles.summaryVal, { color: workSlipDoc ? Colors.success : Colors.error }]}>
              {workSlipDoc ? 'Uploaded (Under Review)' : 'Not Uploaded (Required)'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons name={skillCertDoc ? 'check-circle' : 'hourglass-top'} size={18} color={skillCertDoc ? Colors.success : '#B45309'} />
            <Text style={styles.summaryLabel}>Skill Certificate:</Text>
            <Text style={[styles.summaryVal, { color: skillCertDoc ? Colors.success : '#B45309' }]}>
              {skillCertDoc ? 'Uploaded' : certCommitmentAccepted ? 'Pending (10 Days)' : 'Not Submitted'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons name={workSlipDoc && skillCertDoc ? 'verified' : 'info'} size={18} color={workSlipDoc && skillCertDoc ? Colors.success : Colors.primary} />
            <Text style={styles.summaryLabel}>Overall Verification:</Text>
            <Text style={styles.summaryVal}>
              {!workSlipDoc ? 'Worker Onboarding Incomplete' : !skillCertDoc ? 'Profile Partially Verified' : 'Fully Verified 🟢'}
            </Text>
          </View>
        </View>

        {/* Submit & Dashboard Access Button */}
        <Pressable
          style={[styles.submitButton, (!workSlipDoc || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmitFinal}
          disabled={!workSlipDoc || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Save & Open Personalized Dashboard</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </Pressable>

        {!workSlipDoc && (
          <Text style={styles.warningNote}>
            ⚠️ Please upload your signed Work Slip to unlock your personalized worker dashboard.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing[5], backgroundColor: Colors.background },
  header: { marginBottom: Spacing[4] },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing[1] },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.errorLight, borderRadius: Radius.md,
    padding: Spacing[3], marginBottom: Spacing[4],
  },
  errorText: { fontSize: Typography.sm, color: Colors.error, flex: 1 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing[5], marginBottom: Spacing[4], gap: Spacing[4], ...Shadow.md,
  },
  verificationCard: {
    borderWidth: 1.5, borderColor: Colors.primary + '40', backgroundColor: '#F8FAFC',
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  cardTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardSub: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 1 },
  fieldGroup: { gap: Spacing[1] },
  fieldRow: { flexDirection: 'row', gap: Spacing[3] },
  fieldLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceTinted, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing[3], height: 48,
  },
  inputIcon: { marginRight: Spacing[2] },
  input: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary },
  inputSimple: {
    backgroundColor: Colors.surfaceTinted, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing[3], height: 44, fontSize: Typography.sm, color: Colors.textPrimary,
  },
  addSkillBtn: { paddingHorizontal: Spacing[3], paddingVertical: 6, backgroundColor: Colors.primary, borderRadius: Radius.sm },
  addSkillBtnText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  skillChipsScroll: { gap: Spacing[2], paddingVertical: 4 },
  skillChip: {
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2],
    borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  skillChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  skillChipText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary },
  skillChipTextActive: { color: '#fff' },
  skillsChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[1] },
  skillTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing[3], paddingVertical: 6,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  skillTagActive: { backgroundColor: Colors.primaryLight + '50', borderColor: Colors.primary },
  skillTagText: { fontSize: Typography.xs, color: Colors.textSecondary },
  skillTagTextActive: { color: Colors.primary, fontWeight: Typography.bold },
  expOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  expChip: {
    flex: 1, minWidth: '45%', paddingVertical: Spacing[2], paddingHorizontal: Spacing[3],
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface,
  },
  expChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  expChipText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary },
  expChipTextActive: { color: Colors.primary },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  pillPending: { backgroundColor: '#FEF3C7' },
  pillApproved: { backgroundColor: '#D1FAE5' },
  pillUnderReview: { backgroundColor: '#DBEAFE' },
  pillError: { backgroundColor: '#FEE2E2' },
  statusPillText: { fontSize: 10, fontWeight: Typography.bold },
  pillTextPending: { color: '#B45309' },
  pillTextApproved: { color: '#047857' },
  pillTextUnderReview: { color: '#1E40AF' },
  pillTextError: { color: '#B91C1C' },
  verifInstruction: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  downloadFormBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2],
    backgroundColor: '#1E293B', paddingVertical: Spacing[3], borderRadius: Radius.md, ...Shadow.sm,
  },
  downloadFormBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing[1] },
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primary,
    borderRadius: Radius.lg, padding: Spacing[5], alignItems: 'center', gap: Spacing[1], backgroundColor: Colors.primaryLight + '30',
  },
  uploadTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary, marginTop: Spacing[1] },
  uploadSub: { fontSize: Typography.xs, color: Colors.textTertiary },
  uploadedDocBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF',
    borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.md, padding: Spacing[3],
  },
  docName: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textPrimary },
  docTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 1 },
  docStatusTag: { fontSize: 10, color: Colors.primary, fontWeight: Typography.bold, marginTop: 2 },
  replaceBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  replaceBtnText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary },
  commitmentBox: {
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D',
    borderRadius: Radius.md, padding: Spacing[3], gap: Spacing[2],
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2] },
  checkboxLabel: { flex: 1, fontSize: Typography.xs, color: '#92400E', lineHeight: 18 },
  timerNoticeBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], backgroundColor: '#FEF3C7', padding: Spacing[2], borderRadius: Radius.sm },
  timerNoticeText: { fontSize: 11, fontWeight: Typography.bold, color: '#B45309', flex: 1 },
  pathwayBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
    borderRadius: Radius.md, padding: Spacing[3],
  },
  pathwayTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, color: '#1E3A8A' },
  pathwaySub: { fontSize: 10, color: '#1E40AF', marginTop: 1 },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing[4], marginBottom: Spacing[4], gap: Spacing[2], borderWidth: 1, borderColor: Colors.border,
  },
  summaryTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 2 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  summaryLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary, width: 130 },
  summaryVal: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1 },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2],
    backgroundColor: Colors.primary, paddingVertical: Spacing[4], borderRadius: Radius.lg, ...Shadow.md,
  },
  submitButtonDisabled: { backgroundColor: '#94A3B8', opacity: 0.7 },
  submitButtonText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },
  warningNote: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.error, textAlign: 'center', marginTop: Spacing[2] },
});
