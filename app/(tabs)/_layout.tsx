// Redirect to root — role-based routing handled by (customer), (worker), (admin) groups
import { Redirect } from 'expo-router';
export default function TabsLayout() {
  return <Redirect href="/" />;
}
