import { CandidateStatus } from "@/generated/client";
import logger from "@/lib/logger";
import { MockEvaluationService } from "@/lib/mocks/MockEvaluationService";
import { prisma } from "@/lib/prisma";
import { calculateScore, isPriorityCandidate } from "@/lib/scoring";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const evaluationService = new MockEvaluationService();

async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  label: string,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn({ attempt, label, err }, "Queue: retrying after failure");
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
  throw new Error(`All ${retries} retries exhausted for ${label}`);
}

/**
 * In-process orchestration engine.
 * Triggered after a candidate is created. Runs evaluation steps sequentially,
 * updates candidate status at each stage, and finalises with a score.
 */
export async function runEvaluationPipeline(candidateId: string): Promise<void> {
  logger.info({ candidateId }, "Queue: starting evaluation pipeline");

  // --- Step 2: Questionnaire (Q1) ---
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: CandidateStatus.PENDING_Q1 },
  });

  let scoreQ1: number;
  try {
    const result = await withRetry(
      () => evaluationService.triggerQ1(candidateId),
      MAX_RETRIES,
      "Q1",
    );
    scoreQ1 = result.score;
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { scoreQ1 },
    });
    logger.info({ candidateId, scoreQ1 }, "Queue: Q1 score saved");
  } catch (err) {
    logger.error({ candidateId, err }, "Queue: Q1 permanently failed — marking rejected");
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: CandidateStatus.REJECTED },
    });
    return;
  }

  // --- Step 3: Automated Call (Q2) ---
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: CandidateStatus.PENDING_Q2 },
  });

  let scoreQ2: number;
  try {
    const result = await withRetry(
      () => evaluationService.triggerQ2(candidateId),
      MAX_RETRIES,
      "Q2",
    );
    scoreQ2 = result.score;
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { scoreQ2 },
    });
    logger.info({ candidateId, scoreQ2 }, "Queue: Q2 score saved");
  } catch (err) {
    logger.error({ candidateId, err }, "Queue: Q2 permanently failed — marking rejected");
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: CandidateStatus.REJECTED },
    });
    return;
  }

  // --- Step 4: Scoring ---
  const scoreTotal = calculateScore(scoreQ1, scoreQ2);
  const status = isPriorityCandidate(scoreTotal)
    ? CandidateStatus.PRIORITY_QUEUE
    : CandidateStatus.REJECTED;

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { scoreTotal, status },
  });

  logger.info({ candidateId, scoreQ1, scoreQ2, scoreTotal, status }, "Queue: pipeline complete");
}
