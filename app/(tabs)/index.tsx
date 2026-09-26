// This file is intentionally minimal - app routing is handled by role-based tab groups
// (customer), (worker), and (admin) each have their own _layout.tsx
import { Redirect } from 'expo-router';

export default function TabsIndex() {
  return <Redirect href="/" />;
}
