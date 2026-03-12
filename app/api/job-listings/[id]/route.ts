import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { jobListingSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();

    // Toggle-only call (just isActive boolean)
    if (Object.keys(body).length === 1 && "isActive" in body) {
      const listing = await prisma.jobListing.update({
        where: { id },
        data: { isActive: body.isActive },
      });
      logger.info({ listingId: id, isActive: listing.isActive }, "API: job listing toggled");
      return NextResponse.json(listing);
    }

    // Full update — validate all editable fields
    const validation = jobListingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 },
      );
    }
    const listing = await prisma.jobListing.update({
      where: { id },
      data: validation.data,
    });
    logger.info({ listingId: id }, "API: job listing updated");
    return NextResponse.json(listing);
  } catch (err) {
    logger.error({ err }, "API: PATCH /api/job-listings/[id] error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.jobListing.delete({ where: { id } });
    logger.info({ listingId: id }, "API: job listing deleted");
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ err }, "API: DELETE /api/job-listings/[id] error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
