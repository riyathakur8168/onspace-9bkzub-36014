import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize } from '@/constants/theme';

// Placeholder — the (tabs) group is not used in this project
// Navigation is handled by (customer), (worker), and (admin) groups
export default function TabsIndex() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={styles.center}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: FontSize.md, color: Colors.textSubtle },
});
