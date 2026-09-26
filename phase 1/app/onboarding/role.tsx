import React from 'react';
import { Redirect } from 'expo-router';

export default function RoleSelectionScreen() {
  return <Redirect href="/auth/login?mode=signup" />;
}
