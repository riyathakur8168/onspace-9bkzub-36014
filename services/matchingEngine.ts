import { Worker, ServiceRequest, normalizeCategory } from './mockData';

export interface MatchingWeights {
  proximity: number;      // Locality / distance weight (default: 0.55)
  locality?: number;
  earningsEquity: number; // Fair opportunity / earning balance weight (default: 0.35)
  workloadEquity: number; // Workload equity weight (default: 0.05)
  recency: number;        // Recency weight (default: 0.02)
  rating: number;         // Rating weight (default: 0.03)
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  proximity: 0.55,
  locality: 0.55,
  earningsEquity: 0.35,
  workloadEquity: 0.05,
  recency: 0.02,
  rating: 0.03,
};

export interface ScoredWorker {
  worker: Worker;
  score: number; // 0 - 100
  distanceKm: number;
  breakdown: {
    proximityScore: number;
    earningsEquityScore: number;
    workloadEquityScore: number;
    recencyScore: number;
    ratingScore: number;
  };
  explanation: string;
}

export class MatchingEngine {
  private weights: MatchingWeights;
  private maxRadiusKm: number;

  constructor(weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS, maxRadiusKm: number = 10) {
    this.weights = weights;
    this.maxRadiusKm = maxRadiusKm;
  }

  public setWeights(newWeights: Partial<MatchingWeights>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): MatchingWeights {
    return { ...this.weights };
  }

  /**
   * STEP 1 — HARD SERVICE / SKILL FILTER & ELIGIBILITY CHECK
   * HARD PIPELINE ORDER:
   * 1. HARD Skill / Profession Match (Primary category or registered skills match requested service)
   * 2. Active Account & Online Availability (availabilityStatus === true, not SUSPENDED/INACTIVE)
   * 3. Two-Step Verification Check (verificationState === 'VERIFIED' & adminApprovalStatus === 'APPROVED')
   * 4. Locality / Radius Check
   * 
   * CRITICAL RULE: Fairness & opportunity balancing apply ONLY to workers who pass all HARD eligibility criteria.
   */
  public filterEligibleWorkers(request: ServiceRequest, workers: Worker[]): Worker[] {
    const requiredCategory = normalizeCategory(request.serviceId || request.serviceLabel);
    if (!requiredCategory) return [];

    return workers.filter(worker => {
      // 1. HARD Profession & Skill Match Check
      const primaryCat = normalizeCategory(worker.primaryCategory || '');
      const hasPrimaryMatch = primaryCat === requiredCategory;
      const hasSkillMatch = Array.isArray(worker.skills) && worker.skills.some(skill => normalizeCategory(skill) === requiredCategory);

      if (!hasPrimaryMatch && !hasSkillMatch) {
        return false;
      }

      // 2. Active Account & Availability check (Must be Active & Available/Online)
      if (!worker.availabilityStatus) return false;
      if ((worker as any).status === 'INACTIVE' || (worker as any).status === 'SUSPENDED' || (worker as any).status === 'DEACTIVATED') {
        return false;
      }

      // 3. Verification Check (Must be VERIFIED and APPROVED)
      if (worker.verificationState && worker.verificationState !== 'VERIFIED') return false;
      if (worker.verificationStatus !== 'verified') return false;
      if (worker.adminApprovalStatus && worker.adminApprovalStatus !== 'APPROVED') return false;

      // 4. Distance / Service Area Check
      const dist = this.estimateDistanceKm(request.address, worker.serviceArea);
      if (dist > this.maxRadiusKm) return false;

      return true;
    });
  }

  /**
   * STEP 2 & STEP 3 — LOCALITY RANKING & FAIR OPPORTUNITY / EARNING BALANCE ALLOCATION
   * 
   * Dynamically rank eligible workers based on:
   * 1. Locality Proximity (Customer area vs Worker service area)
   * 2. Opportunity / Earning Balance (Lower recent earnings = Higher fairness priority boost)
   * 3. Workload Equity (Fewer recent completed jobs = Higher allocation priority)
   */
  public rankWorkers(request: ServiceRequest, eligibleWorkers: Worker[]): ScoredWorker[] {
    if (eligibleWorkers.length === 0) return [];

    const earningsList = eligibleWorkers.map(w => w.recentEarnings || 0);
    const maxEarnings = Math.max(...earningsList, 1);
    const minEarnings = Math.min(...earningsList, 0);

    const jobsList = eligibleWorkers.map(w => w.completedJobs || 0);
    const maxJobs = Math.max(...jobsList, 1);

    const scoredList: ScoredWorker[] = eligibleWorkers.map(worker => {
      const distanceKm = this.estimateDistanceKm(request.address, worker.serviceArea);

      // 1. Locality Proximity Score (100 = same locality / 0.5km, decreases with distance)
      const proximityScore = Math.max(0, 100 * (1 - distanceKm / this.maxRadiusKm));

      // 2. Fair Opportunity / Earnings Equity Score (100 = lowest earnings in pool, 0 = highest earnings)
      const currentEarnings = worker.recentEarnings || 0;
      const earningsRange = maxEarnings - minEarnings || 1;
      const earningsEquityScore = 100 * (1 - (currentEarnings - minEarnings) / earningsRange);

      // 3. Workload Equity Score (100 = lowest completed jobs, 0 = highest)
      const currentJobs = worker.completedJobs || 0;
      const workloadEquityScore = 100 * (1 - Math.min(currentJobs / Math.max(maxJobs * 1.5, 1), 1));

      // 4. Recency Score (Workers with lower recent earnings get higher recency score)
      const recencyScore = Math.min(100, Math.max(40, 100 - (currentEarnings / 200)));

      // 5. Rating Score (100 = 5.0 rating)
      const ratingScore = ((worker.rating || 4.5) / 5) * 100;

      const localityWeight = this.weights.locality || this.weights.proximity || 0.40;
      const totalScore = Math.round(
        proximityScore * localityWeight +
        earningsEquityScore * this.weights.earningsEquity +
        workloadEquityScore * this.weights.workloadEquity +
        recencyScore * this.weights.recency +
        ratingScore * this.weights.rating
      );

      const explanation = this.generateExplanation(worker, distanceKm, totalScore, currentEarnings);

      return {
        worker,
        score: totalScore,
        distanceKm,
        breakdown: {
          proximityScore: Math.round(proximityScore),
          earningsEquityScore: Math.round(earningsEquityScore),
          workloadEquityScore: Math.round(workloadEquityScore),
          recencyScore: Math.round(recencyScore),
          ratingScore: Math.round(ratingScore),
        },
        explanation,
      };
    });

    // Sort descending by total allocation score
    return scoredList.sort((a, b) => b.score - a.score);
  }

  /**
   * Estimate distance in km between customer address and worker service area.
   * If customer address & worker service area share matching locality tokens -> 0.5 km (Local).
   * Otherwise -> 8.5 km (Distant).
   */
  public estimateDistanceKm(customerAddress: string, workerArea: string): number {
    if (!customerAddress || !workerArea) return 5.0;

    const cNorm = customerAddress.toLowerCase().trim();
    const wNorm = workerArea.toLowerCase().trim();

    const cTokens = cNorm.split(/[\s,.-]+/).filter(t => t.length > 2);
    const wTokens = wNorm.split(/[\s,.-]+/).filter(t => t.length > 2);

    const hasCommonLocality = cTokens.some(t => wTokens.includes(t));

    if (hasCommonLocality) {
      return 0.5; // Same locality match -> 0.5 km
    }

    return 8.5; // Distant locality -> 8.5 km
  }

  private generateExplanation(worker: Worker, dist: number, score: number, recentEarnings: number): string {
    const parts = [
      `Skill match verified (${worker.skills.slice(0, 2).join(', ')})`,
      `${dist} km away`,
    ];
    if (recentEarnings === 0) {
      parts.push('Fair opportunity priority (₹0 recent earnings)');
    } else {
      parts.push(`Recent earnings: ₹${recentEarnings}`);
    }
    parts.push(`Rating ${worker.rating}★`);
    return parts.join(' • ');
  }
}

export const defaultMatchingEngine = new MatchingEngine();
