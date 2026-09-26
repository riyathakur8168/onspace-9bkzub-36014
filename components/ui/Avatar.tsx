import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  verified?: boolean;
}

const avatarColors = [
  '#1A6B5A', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#EF4444', '#06B6D4',
];

function getColor(initials: string): string {
  const index = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % avatarColors.length;
  return avatarColors[index];
}

export function Avatar({ initials, size = 44, color, verified }: AvatarProps) {
  const bg = color || getColor(initials);
  const fontSize = size * 0.36;

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
        <Text style={[styles.text, { fontSize }]}>{initials}</Text>
      </View>
      {verified && (
        <View style={[styles.verifiedBadge, {
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: (size * 0.32) / 2,
          bottom: 0, right: 0,
        }]}>
          <Text style={{ fontSize: size * 0.18, color: '#fff' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: Typography.bold,
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
});
