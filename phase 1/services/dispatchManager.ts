import { ServiceRequest, JobOffer, Worker, normalizeCategory } from './mockData';
import { COOPERATIVE_SPLIT } from '@/constants/config';
import { defaultMatchingEngine, ScoredWorker, MatchingWeights } from './matchingEngine';
import { notificationService } from './notificationService';

export interface DispatchSession {
  requestId: string;
  request: ServiceRequest;
  candidates: ScoredWorker[];
  currentIndex: number;
  currentWorker: Worker | null;
  currentOffer: JobOffer | null;
  status: 'searching' | 'notifying' | 'accepted' | 'exhausted';
  expiresAt: number | null; // timestamp when current offer expires
  logs: string[];
}

export class DispatchManager {
  private sessions: Map<string, DispatchSession> = new Map();
  private lockedRequests: Set<string> = new Set(); // Concurrency lock

  /**
   * Initialize a sequential matching and notification dispatch session.
   */
  public createSession(
    request: ServiceRequest,
    workers: Worker[],
    customWeights?: Partial<MatchingWeights>
  ): DispatchSession {
    if (customWeights) {
      defaultMatchingEngine.setWeights(customWeights);
    }

    const reqCategory = normalizeCategory(request.serviceId || request.serviceLabel);
    const eligible = defaultMatchingEngine.filterEligibleWorkers(request, workers);
    const candidates = defaultMatchingEngine.rankWorkers(request, eligible);

    const logs: string[] = [
      `[Dispatch] Initiated request ${request.id} for ${request.serviceLabel} (Category: ${reqCategory.toUpperCase()})`,
      `[Eligibility] Found ${eligible.length} eligible ${reqCategory.toUpperCase()} workers within service radius`,
    ];

    // Backend Category Validation Audit
    const validatedCandidates = candidates.filter(c => {
      const wCat = normalizeCategory(c.worker.primaryCategory || c.worker.skills[0]);
      if (wCat !== reqCategory && !c.worker.skills.some(s => normalizeCategory(s) === reqCategory)) {
        logs.push(`[VALIDATION REJECTED] Worker ${c.worker.name} primary category (${wCat}) does not match request category (${reqCategory})`);
        return false;
      }
      return true;
    });

    validatedCandidates.forEach((c, idx) => {
      logs.push(`[Rank #${idx + 1}] ${c.worker.name} (Category: ${normalizeCategory(c.worker.primaryCategory).toUpperCase()}, Score: ${c.score}/100) — ${c.explanation}`);
    });

    const currentWorker = validatedCandidates[0]?.worker || null;
    const session: DispatchSession = {
      requestId: request.id,
      request,
      candidates: validatedCandidates,
      currentIndex: 0,
      currentWorker,
      currentOffer: validatedCandidates.length > 0 ? this.buildJobOffer(request, validatedCandidates[0]) : null,
      status: validatedCandidates.length > 0 ? 'notifying' : 'exhausted',
      expiresAt: validatedCandidates.length > 0 ? Date.now() + 30000 : null, // 30s response window
      logs,
    };

    if (validatedCandidates.length === 0) {
      logs.push(`[Dispatch] No eligible ${reqCategory.toUpperCase()} workers found in range. Marking exhausted.`);
    } else {
      // Trigger real push notification for eligible worker(s)
      validatedCandidates.forEach(cand => {
        notificationService.sendJobNotification(request, cand.worker).catch(err => {
          console.warn('[Dispatch] Push dispatch error:', err);
        });
      });
      logs.push(`[Notification PUSH] Real-time push notification sent to ${validatedCandidates.length} eligible ${reqCategory.toUpperCase()} worker(s). Primary offer to ${currentWorker?.name} (30s window)`);
    }

    this.sessions.set(request.id, session);
    return session;
  }

  /**
   * Get active dispatch session for a request.
   */
  public getSession(requestId: string): DispatchSession | undefined {
    return this.sessions.get(requestId);
  }

  /**
   * Atomic Concurrency Protection Lock for Job Acceptance.
   * Guarantees only ONE worker can obtain the job.
   */
  public acceptJobAtomic(
    requestId: string,
    workerId: string
  ): { success: boolean; error?: string; session?: DispatchSession } {
    // 1. Transactional Lock check
    if (this.lockedRequests.has(requestId)) {
      return { success: false, error: 'Request is locked. Another worker is currently accepting.' };
    }

    const session = this.sessions.get(requestId);
    if (!session) {
      return { success: false, error: 'Dispatch session not found.' };
    }

    if (session.status === 'accepted') {
      return { success: false, error: 'This job offer has already been accepted by another worker.' };
    }

    if (session.status === 'exhausted') {
      return { success: false, error: 'This dispatch session has expired.' };
    }

    // 2. Verify worker identity matches current notified worker
    if (!session.currentWorker || session.currentWorker.id !== workerId) {
      return { success: false, error: 'Offer is no longer active for your profile.' };
    }

    // 3. Backend Validation: Verify assigned worker's primary service category matches request
    const reqCategory = normalizeCategory(session.request.serviceId || session.request.serviceLabel);
    const workerCategory = normalizeCategory(session.currentWorker.primaryCategory || session.currentWorker.skills[0]);
    if (reqCategory !== workerCategory) {
      session.logs.push(`[BACKEND REJECT] Mismatch detected: Worker ${session.currentWorker.name} (${workerCategory}) cannot accept ${reqCategory} request.`);
      return { success: false, error: 'Category mismatch: You are not categorized for this service.' };
    }

    // Acquire lock & commit atomic assignment
    this.lockedRequests.add(requestId);
    try {
      session.status = 'accepted';
      session.expiresAt = null;
      if (session.currentOffer) {
        session.currentOffer.status = 'accepted';
      }
      notificationService.markAsResponded(requestId, workerId, 'ACCEPTED');
      session.logs.push(`[Accepted] Job assigned to ${session.currentWorker.name} (${workerCategory.toUpperCase()})! Notifications closed.`);
      return { success: true, session };
    } finally {
      this.lockedRequests.delete(requestId);
    }
  }

  /**
   * Decline offer and auto-advance to next eligible candidate.
   */
  public declineAndAdvance(requestId: string, workerId: string): DispatchSession {
    const session = this.sessions.get(requestId);
    if (!session) throw new Error('Session not found');

    if (session.status !== 'notifying' || session.currentWorker?.id !== workerId) {
      return session;
    }

    const declinedWorker = session.currentWorker;
    session.logs.push(`[Declined] ${declinedWorker.name} declined the request.`);
    notificationService.markAsResponded(requestId, workerId, 'DECLINED');

    return this.advanceToNextCandidate(session);
  }

  /**
   * Handle offer timeout and auto-advance to next candidate.
   */
  public timeoutAndAdvance(requestId: string): DispatchSession {
    const session = this.sessions.get(requestId);
    if (!session || session.status !== 'notifying') return session!;

    const timedOutWorker = session.currentWorker;
    session.logs.push(`[Timeout] 30s response window expired for ${timedOutWorker?.name}.`);
    if (timedOutWorker) {
      notificationService.markAsResponded(requestId, timedOutWorker.id, 'EXPIRED');
    }

    return this.advanceToNextCandidate(session);
  }

  private advanceToNextCandidate(session: DispatchSession): DispatchSession {
    const nextIndex = session.currentIndex + 1;
    if (nextIndex < session.candidates.length) {
      const nextCandidate = session.candidates[nextIndex];
      session.currentIndex = nextIndex;
      session.currentWorker = nextCandidate.worker;
      session.currentOffer = this.buildJobOffer(session.request, nextCandidate);
      session.status = 'notifying';
      session.expiresAt = Date.now() + 30000;
      session.logs.push(
        `[Notification] Auto-advanced to candidate #${nextIndex + 1}: ${nextCandidate.worker.name} (30s window)`
      );
    } else {
      session.currentIndex = nextIndex;
      session.currentWorker = null;
      session.currentOffer = null;
      session.status = 'exhausted';
      session.expiresAt = null;
      session.logs.push('[Dispatch] All candidate options exhausted. No worker accepted.');
    }
    return session;
  }

  private buildJobOffer(request: ServiceRequest, scored: ScoredWorker): JobOffer {
    const workerShare = Math.round(request.serviceValue * COOPERATIVE_SPLIT.workerShare);
    const platformShare = Math.round(request.serviceValue * COOPERATIVE_SPLIT.platformShare);

    return {
      id: `jo_${Date.now()}_${scored.worker.id}`,
      requestId: request.id,
      serviceLabel: `${request.serviceLabel} — Service`,
      issueDescription: request.issueDescription,
      customerArea: request.address,
      distance: `${scored.distanceKm} km`,
      travelTime: `~${Math.round(scored.distanceKm * 4)} min`,
      scheduledSlot: request.preferredSlot,
      serviceValue: request.serviceValue,
      workerShare,
      cooperativeContribution: platformShare,
      allocationReason: `Skill match verified • ${scored.distanceKm} km away • Dynamic fairness priority score: ${scored.score}/100`,
      expiresInSeconds: 30,
      status: 'pending',
      urgency: 'normal',
    };
  }
}

export const defaultDispatchManager = new DispatchManager();
