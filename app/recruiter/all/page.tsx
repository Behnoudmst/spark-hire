import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

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
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/recruiter">
            <ArrowLeft data-icon="inline-start" />
            Back to Priority Queue
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">All Candidates</h1>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Q1</TableHead>
                  <TableHead className="text-right">Q2</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
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
                  </TableRow>
                ))}
                {candidates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
