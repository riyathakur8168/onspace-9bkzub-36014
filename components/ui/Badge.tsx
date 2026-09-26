import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successLight, text: Colors.success },
  warning: { bg: Colors.warningLight, text: Colors.accentDark },
  error: { bg: Colors.errorLight, text: Colors.error },
  info: { bg: Colors.infoLight, text: Colors.info },
  default: { bg: Colors.divider, text: Colors.textSecondary },
  primary: { bg: Colors.primaryLight, text: Colors.primary },
};

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const colors = variantStyles[variant];
  return (
    <View style={[styles.base, size === 'sm' && styles.sm, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing[2],
    alignSelf: 'flex-start',
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing[1] + 2,
  },
  text: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  textSm: {
    fontSize: Typography.xs,
  },
});
