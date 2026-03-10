import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpenText,
  Lightning,
  MagnifyingGlass,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 bg-background">
      <div className="flex flex-col items-center gap-2 text-center">
        <Lightning data-icon weight="fill" className="size-10 text-primary" />
        <h1 className="text-3xl font-semibold tracking-tight">Spark-Hire</h1>
        <p className="text-muted-foreground text-sm">
          Automated Recruitment Orchestration Engine
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Choose your destination</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full justify-start gap-3">
            <Link href="/apply">
              <UserCircle data-icon="inline-start" weight="regular" />
              Apply for a Position
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3"
          >
            <Link href="/recruiter">
              <MagnifyingGlass data-icon="inline-start" weight="regular" />
              Recruiter Dashboard
            </Link>
          </Button>
          <Separator />
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-3"
          >
            <Link href="/api-docs">
              <BookOpenText data-icon="inline-start" weight="regular" />
              API Documentation
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
