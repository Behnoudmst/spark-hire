const WEIGHT_Q1 = 0.4;
const WEIGHT_Q2 = 0.6;
const PRIORITY_THRESHOLD = 75;

/**
 * Calculates the weighted total score.
 * Formula: (scoreQ1 * 0.4) + (scoreQ2 * 0.6)
 */
export function calculateScore(scoreQ1: number, scoreQ2: number): number {
  return scoreQ1 * WEIGHT_Q1 + scoreQ2 * WEIGHT_Q2;
}

export function isPriorityCandidate(scoreTotal: number): boolean {
  return scoreTotal >= PRIORITY_THRESHOLD;
}
