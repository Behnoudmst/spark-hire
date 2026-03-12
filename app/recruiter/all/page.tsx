import SiteHeader from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

function FinalStatusBadge({ status }: { status: string }) {
  if (status === "HUMAN_REVIEWED")
    return <Badge className="bg-green-500/15 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800">Hired</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

const STATUS_VARIANT: Record<string, StatusVariant> = {
  APPLIED: "outline",
  PENDING_Q1: "secondary",
  PENDING_Q2: "secondary",
  SCORED: "secondary",
  PRIORITY_QUEUE: "default",
  REJECTED: "destructive",
  HUMAN_REVIEWED: "outline",
};

export default async function AllCandidatesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const candidates = await prisma.candidate.findMany({
    orderBy: { appliedAt: "desc" },
    include: { jobListing: { select: { id: true, title: true } } },
  });

  return (
    <div className="min-h-[89vh] bg-background">
      <SiteHeader
        backHref="/recruiter"
        backLabel="Dashboard"
      />
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-lg font-semibold mb-4">All Candidates</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Q1</TableHead>
                  <TableHead className="text-right">Q2</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.jobListing ? (
                        <span className="text-foreground text-xs font-medium">{c.jobListing.title}</span>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATUS_VARIANT[c.status] ?? "outline"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.scoreQ1?.toFixed(1) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.scoreQ2?.toFixed(1) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {c.scoreTotal?.toFixed(1) ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <FinalStatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {candidates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No candidates yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
   
    </div>
  );
}
