import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getApiBaseUrl } from '@/constants/config';
import { useApp } from '@/hooks/useApp';

export function DevDiagnosticsBanner() {
  const [expanded, setExpanded] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'Connected' | 'Unreachable' | 'Checking...'>('Checking...');
  const { user, role, isLoggedIn } = useApp();
  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${apiUrl}/api/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (isMounted) {
          if (res.ok) {
            setBackendStatus('Connected');
          } else {
            setBackendStatus('Unreachable');
          }
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('Unreachable');
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.headerPill} onPress={() => setExpanded(!expanded)}>
        <View style={[styles.statusDot, { backgroundColor: backendStatus === 'Connected' ? '#10B981' : backendStatus === 'Checking...' ? '#F59E0B' : '#EF4444' }]} />
        <Text style={styles.pillText}>
          DEV DIAGNOSTICS: {isLoggedIn ? `${user?.name} (${role})` : 'Logged Out'}
        </Text>
        <MaterialIcons name={expanded ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={16} color="#ffffff" />
      </Pressable>

      {expanded && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailRow}>
            <Text style={styles.label}>API Base URL: </Text>
            <Text style={styles.value}>{apiUrl}</Text>
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.label}>Authenticated User: </Text>
            <Text style={styles.value}>{isLoggedIn ? `${user?.name} [ID: ${user?.id}]` : 'None (Logged Out)'}</Text>
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.label}>Active Role: </Text>
            <Text style={styles.value}>{role || 'None'}</Text>
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.label}>Backend Status: </Text>
            <Text style={[styles.value, { color: backendStatus === 'Connected' ? '#34D399' : '#F87171' }]}>
              {backendStatus}
            </Text>
          </Text>
          {backendStatus === 'Unreachable' && (
            <Text style={styles.warningNote}>
              ⚠️ Physical phone cannot reach backend. Make sure laptop & phone are on the same Wi-Fi, backend is running on port 5000, and Windows Firewall permits traffic.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 99999,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  detailsBox: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  detailRow: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  label: {
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  value: {
    color: '#F9FAFB',
    fontFamily: 'monospace',
  },
  warningNote: {
    color: '#FBBF24',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
});
