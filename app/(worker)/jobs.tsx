import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/constants/theme';
import { MOCK_JOB_OFFERS, JobOffer } from '@/services/mockData';

export default function WorkerJobs() {
  const router = useRouter();

  const renderOffer = ({ item }: { item: JobOffer }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/job-detail', params: { id: item.id } })}
    >
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={item.serviceIcon as any} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.issueTitle}</Text>
          <Text style={styles.cardCat}>{item.serviceCategory}</Text>
        </View>
        <Text style={styles.earn}>₹{item.workerShare}</Text>
      </View>

      <View style={styles.chips}>
        <View style={styles.chip}>
          <MaterialIcons name="location-on" size={12} color={Colors.textMuted} />
          <Text style={styles.chipText}>{item.customerArea} · {item.distanceKm} km</Text>
        </View>
        <View style={styles.chip}>
          <MaterialIcons name="schedule" size={12} color={Colors.textMuted} />
          <Text style={styles.chipText}>{item.scheduledDate}, {item.scheduledSlot}</Text>
        </View>
        {item.urgency === 'urgent' && (
          <View style={[styles.chip, { backgroundColor: Colors.warningLight }]}>
            <MaterialIcons name="warning" size={12} color={Colors.warning} />
            <Text style={[styles.chipText, { color: Colors.warning, fontWeight: '600' }]}>Urgent</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Available Jobs</Text>
        <Text style={styles.pageSub}>{MOCK_JOB_OFFERS.length} offers waiting</Text>
      </View>
      <FlatList
        data={MOCK_JOB_OFFERS}
        keyExtractor={(i) => i.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { ...Typography.pageTitle, color: Colors.textPrimary },
  pageSub: { ...Typography.bodySmall, color: Colors.textMuted },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardPressed: { opacity: 0.88 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...Typography.bodyMedium, fontWeight: '600', color: Colors.textPrimary },
  cardCat: { ...Typography.caption, color: Colors.textMuted },
  earn: { ...Typography.amountSmall, color: Colors.success },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  chipText: { ...Typography.caption, color: Colors.textSecondary },
});
