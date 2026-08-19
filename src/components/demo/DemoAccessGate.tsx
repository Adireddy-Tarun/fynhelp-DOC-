import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

/**
 * Demo data is pilot-only.
 *
 * The seeded demo workspace exists purely for internal feature testing, bug
 * hunting, UI review and security probing. Regular users (signed out or signed
 * in) must never see it — they get a locked notice instead of seeded numbers.
 *
 * Backend enforcement lives in RLS (`public.is_demo_viewer()`); this gate is
 * only the UI half so nobody lands on an empty-looking dashboard.
 */
export const PILOT_EMAILS = ["adireddytarun@fynhelp.com"];

export function isPilotTester(email?: string | null) {
  return !!email && PILOT_EMAILS.includes(email.toLowerCase());
}

export default function DemoAccessGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPilotTester(user?.email)) return <Outlet />;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Demo workspace is private</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The sample company data is reserved for FynHelp's internal pilot testing account.
          Sign in to your own workspace to see your live numbers.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Sign in
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
