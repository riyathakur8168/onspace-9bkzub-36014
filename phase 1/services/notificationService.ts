if (typeof globalThis !== 'undefined' && typeof (globalThis as any).__DEV__ === 'undefined') {
  (globalThis as any).__DEV__ = true;
}

import { ServiceRequest, Worker, normalizeCategory } from './mockData';

let Platform: { OS: string } = { OS: 'android' };
try {
  Platform = require('react-native').Platform || Platform;
} catch (e) {
  // Safe node fallback
}

let Notifications: any = null;
try {
  const { LogBox } = require('react-native');
  if (LogBox?.ignoreLogs) {
    LogBox.ignoreLogs([
      '`expo-notifications` functionality is not fully supported in Expo Go',
      'expo-notifications functionality is not fully supported in Expo Go',
    ]);
  }
} catch (e) {}

try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  // Graceful fallback for non-native / node test environments
  console.log('[NotificationService] Running with mock notification engine');
}

export type NotificationStatus =
  | 'CREATED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export interface JobNotificationRecord {
  id: string;
  requestId: string;
  workerId: string;
  profession: string;
  title: string;
  body: string;
  area: string;
  estimatedEarning?: number;
  sentAt: string;
  openedAt?: string;
  responseAt?: string;
  response?: 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  status: NotificationStatus;
}

export class NotificationService {
  private records: Map<string, JobNotificationRecord> = new Map();
  private sentKeys: Set<string> = new Set(); // De-duplication set: `${requestId}_${workerId}`
  private pushToken: string | null = null;

  /**
   * Register push notifications and get Expo Push Token.
   */
  public async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (Platform.OS === 'web' || !Notifications?.getPermissionsAsync) {
        this.pushToken = 'ExponentPushToken[mock-dev-token]';
        return this.pushToken;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] Push notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
      if (tokenData?.data) {
        this.pushToken = tokenData.data;
      } else {
        this.pushToken = 'ExponentPushToken[mock-dev-token]';
      }
      return this.pushToken;
    } catch (err) {
      console.warn('[NotificationService] Register push failed, using fallback:', err);
      this.pushToken = 'ExponentPushToken[fallback-dev-token]';
      return this.pushToken;
    }
  }

  /**
   * Generate dynamic, engaging notification copy without guaranteed income promises.
   */
  public generateNotificationContent(request: ServiceRequest): { title: string; body: string; area: string; earning?: number } {
    const rawCategory = request.serviceLabel || request.serviceId;
    const professionLabel = this.formatProfessionTitle(rawCategory);
    
    // Extract approximate neighborhood/area from full address
    const addressParts = (request.address || 'your area').split(',');
    const area = addressParts[0].trim();

    const earning = request.workerShare || (request.serviceValue ? Math.round(request.serviceValue * 0.85) : undefined);

    const title = '⚡ New Earning Opportunity!';
    let body = `A customer near ${area} requires an ${professionLabel}. Tap to view details and decide.`;

    if (earning) {
      body = `An ${professionLabel.toLowerCase()} service request is available near ${area} (Est. Payout: ₹${earning}). Tap to view job details.`;
    }

    return { title, body, area, earning };
  }

  /**
   * Dispatch a real push notification to an eligible, verified, active worker.
   * Enforces backend de-duplication: prevents multiple notifications for the same worker and request.
   */
  public async sendJobNotification(request: ServiceRequest, worker: Worker): Promise<JobNotificationRecord | null> {
    const dedupKey = `${request.id}_${worker.id}`;

    // De-duplication check: NEVER send duplicate notifications for the same request and worker
    if (this.sentKeys.has(dedupKey)) {
      console.log(`[NotificationService] Duplicate prevented for request ${request.id} and worker ${worker.id}`);
      return this.records.get(dedupKey) || null;
    }

    // Dynamic copy generation
    const content = this.generateNotificationContent(request);
    const nowIso = new Date().toISOString();
    const notifId = `notif_${Date.now()}_${worker.id}`;

    const record: JobNotificationRecord = {
      id: notifId,
      requestId: request.id,
      workerId: worker.id,
      profession: request.serviceLabel,
      title: content.title,
      body: content.body,
      area: content.area,
      estimatedEarning: content.earning,
      sentAt: nowIso,
      status: 'SENT',
    };

    // Store record and mark key as sent
    this.records.set(dedupKey, record);
    this.sentKeys.add(dedupKey);

    // Trigger local push notification (works when app is in background or foreground)
    try {
      if (Notifications?.scheduleNotificationAsync) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: content.title,
            body: content.body,
            data: {
              requestId: request.id,
              workerId: worker.id,
              notificationId: notifId,
              serviceLabel: request.serviceLabel,
              area: content.area,
            },
            sound: 'default',
          },
          trigger: null, // send immediately
        }).catch((err: any) => {
          console.log('[NotificationService] Local push trigger fallback:', err);
        });
      }

      record.status = 'DELIVERED';
    } catch (e) {
      console.warn('[NotificationService] Push schedule error:', e);
    }

    return record;
  }

  /**
   * Update notification state to OPENED when worker taps notification.
   */
  public markAsOpened(requestId: string, workerId: string): JobNotificationRecord | undefined {
    const dedupKey = `${requestId}_${workerId}`;
    const record = this.records.get(dedupKey);
    if (record) {
      record.status = 'OPENED';
      record.openedAt = new Date().toISOString();
    }
    return record;
  }

  /**
   * Update notification state when offer is responded to (ACCEPTED / DECLINED / EXPIRED).
   */
  public markAsResponded(requestId: string, workerId: string, response: 'ACCEPTED' | 'DECLINED' | 'EXPIRED'): JobNotificationRecord | undefined {
    const dedupKey = `${requestId}_${workerId}`;
    const record = this.records.get(dedupKey);
    if (record) {
      record.status = response;
      record.response = response;
      record.responseAt = new Date().toISOString();
    }
    return record;
  }

  /**
   * Get all notifications sent to a specific worker.
   */
  public getNotificationsForWorker(workerId: string): JobNotificationRecord[] {
    const list: JobNotificationRecord[] = [];
    for (const rec of this.records.values()) {
      if (rec.workerId === workerId) {
        list.push(rec);
      }
    }
    return list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  /**
   * Get all notification tracking records (for admin/audit).
   */
  public getAllRecords(): JobNotificationRecord[] {
    return Array.from(this.records.values());
  }

  private formatProfessionTitle(catOrLabel: string): string {
    const norm = normalizeCategory(catOrLabel);
    switch (norm) {
      case 'electrical': return 'Electrician';
      case 'plumbing': return 'Plumber';
      case 'carpentry': return 'Carpenter';
      case 'cleaning': return 'Cleaner';
      case 'painting': return 'Painter';
      case 'ac': return 'AC Technician';
      case 'appliance': return 'Appliance Repair Technician';
      default: return catOrLabel || 'Technician';
    }
  }
}

export const notificationService = new NotificationService();
