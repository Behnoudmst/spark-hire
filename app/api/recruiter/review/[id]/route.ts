import { CandidateStatus } from "@/generated/client";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { reviewDecisionSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/recruiter/review/{id}:
 *   patch:
 *     summary: Finalise a hire or reject decision for a candidate
 *     description: Marks a PRIORITY_QUEUE candidate as HUMAN_REVIEWED. Requires authentication.
 *     tags:
 *       - Recruiter
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [HIRE, REJECT]
 *     responses:
 *       200:
 *         description: Decision recorded
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json();
  const validation = reviewDecisionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: { status: CandidateStatus.HUMAN_REVIEWED },
  });

  logger.info(
    { candidateId: id, decision: validation.data.decision, reviewerId: session.user?.email },
    "API: recruiter review decision recorded",
  );

  return NextResponse.json({ id: updated.id, status: updated.status, decision: validation.data.decision });
}
