import { COMPANY_NAME } from "@/lib/brand";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </p>
        <Link
          href="/privacy"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-3"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
