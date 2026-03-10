import logger from "@/lib/logger";
import type { EvaluationResult, QuestionnaireService } from "./types";

/**
 * Mock implementation of the two external evaluation services.
 * Scores are configurable via environment variables:
 *   MOCK_Q1_SCORE  — score returned by Service 1 (0-100, default random)
 *   MOCK_Q2_SCORE  — score returned by Service 2 (0-100, default random)
 *   MOCK_Q1_FAIL   — set to "true" to simulate Service 1 being down
 */
export class MockEvaluationService implements QuestionnaireService {
  private getScore(envKey: string): number {
    const raw = process.env[envKey];
    if (raw !== undefined && raw !== "") {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
    }
    return Math.round(Math.random() * 100);
  }

  async triggerQ1(candidateId: string): Promise<EvaluationResult> {
    const shouldFail = process.env.MOCK_Q1_FAIL === "true";

    if (shouldFail) {
      logger.warn({ candidateId }, "MockEvaluationService: Q1 service simulated failure");
      throw new Error("Service 1 (Questionnaire) is unavailable");
    }

    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));
    const score = this.getScore("MOCK_Q1_SCORE");
    logger.info({ candidateId, score }, "MockEvaluationService: Q1 score generated");
    return { candidateId, score };
  }

  async triggerQ2(candidateId: string): Promise<EvaluationResult> {
    // Simulate a longer processing time (e.g., automated call analysis)
    await new Promise((r) => setTimeout(r, 800));
    const score = this.getScore("MOCK_Q2_SCORE");
    logger.info({ candidateId, score }, "MockEvaluationService: Q2 score generated");
    return { candidateId, score };
  }
}
