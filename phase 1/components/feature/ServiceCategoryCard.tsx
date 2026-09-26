import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

interface ServiceCategoryCardProps {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export function ServiceCategoryCard({ label, icon, color, onPress }: ServiceCategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityLabel={`Request ${label} service`}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon as any} size={26} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    alignItems: 'center',
    width: '23%',
    ...Shadow.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  iconWrap: {
    width: 52, height: 52,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
