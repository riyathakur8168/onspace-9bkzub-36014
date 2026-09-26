import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'secondary' || variant === 'ghost' ? Colors.primary : Colors.textInverse} />
        : <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>{label}</Text>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.primaryLight,
  },
  destructive: {
    backgroundColor: Colors.error,
  },
  accent: {
    backgroundColor: Colors.accent,
  },
  size_sm: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], minHeight: 36 },
  size_md: { paddingVertical: Spacing[3], paddingHorizontal: Spacing[5], minHeight: 48 },
  size_lg: { paddingVertical: Spacing[4], paddingHorizontal: Spacing[6], minHeight: 56 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  label: { fontWeight: Typography.semibold, letterSpacing: 0.2 },
  label_primary: { color: Colors.textInverse },
  label_secondary: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_destructive: { color: Colors.textInverse },
  label_accent: { color: Colors.textInverse },
  labelSize_sm: { fontSize: Typography.sm },
  labelSize_md: { fontSize: Typography.base },
  labelSize_lg: { fontSize: Typography.lg },
});
