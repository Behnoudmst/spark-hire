"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    CheckCircle,
    SpinnerGap,
    WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";

type SubmissionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; candidateId: string }
  | { status: "error"; message: string };

export default function ApplyPage() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "loading" });

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "Submission failed. Please try again.",
        });
        return;
      }

      setState({ status: "success", candidateId: data.id });
      formRef.current?.reset();
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Back to home
          </Link>
        </Button>

        {state.status === "success" ? (
          <Card>
            <CardHeader>
              <CheckCircle className="size-8 text-primary" weight="fill" />
              <CardTitle>Application Submitted!</CardTitle>
              <CardDescription>
                Your application is being evaluated by our AI engine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">
                Candidate ID:{" "}
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {state.candidateId}
                </code>
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState({ status: "idle" })}
              >
                Submit another application
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Apply Now</CardTitle>
              <CardDescription>
                Submit your application and our AI engine will evaluate your
                profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="resume">Resume</Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    accept="application/pdf"
                    required
                  />
                  <p className="text-xs text-muted-foreground">PDF only</p>
                </div>

                {state.status === "error" && (
                  <Alert variant="destructive">
                    <WarningCircle />
                    <AlertTitle>Submission failed</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={state.status === "loading"}
                  className="w-full"
                >
                  {state.status === "loading" && (
                    <SpinnerGap
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  )}
                  {state.status === "loading"
                    ? "Submitting…"
                    : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
