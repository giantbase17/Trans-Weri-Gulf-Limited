import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/lib/site";
import { bootstrapAdmin, fetchMyRoles } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: `Staff Login | ${site.name}` }],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void navigate({ to: "/admin" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) {
          setCanResendConfirmation(
            error.message.toLowerCase().includes("confirm") ||
              error.message.toLowerCase().includes("not confirmed"),
          );
          const message = error.message.toLowerCase();
          throw new Error(
            message.includes("confirm") || message.includes("not confirmed")
              ? "Confirm your email address before signing in."
              : error.message,
          );
        }
        if (data.user) {
          const roles = await fetchMyRoles(data.user.id);
          if (roles.length === 0) {
            try {
              await bootstrapAdmin(data.user.id);
            } catch {
              throw new Error(
                "Your account is valid, but the first-admin database migration has not been applied yet.",
              );
            }
          }
        }
        toast.success("Signed in successfully.");
        await navigate({ to: "/admin" });
        return;
      }

      const emailRedirectTo =
        typeof window === "undefined"
          ? undefined
          : `${window.location.origin}/auth`;
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: fullName },
          ...(emailRedirectTo ? { emailRedirectTo } : {}),
        },
      });
      if (error) throw error;

      if (data.session && data.user) {
        let claimed = false;
        try {
          claimed = await bootstrapAdmin(data.user.id);
        } catch {
          throw new Error(
            "Account created, but admin setup is incomplete. Apply the first-admin Supabase migration, then sign in again.",
          );
        }
        toast.success(
          claimed
            ? "Account created. You are now the first administrator."
            : "Account created. An existing administrator must assign your role.",
        );
        await navigate({ to: "/admin" });
      } else {
        setVerificationPending(true);
        setPassword("");
        toast.success("Verification email sent.");
        setMode("login");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("A new confirmation email has been sent.");
  }

  async function sendPasswordReset() {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }
    setBusy(true);
    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      redirectTo ? { redirectTo } : {},
    );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResetSent(true);
    toast.success("Password reset instructions sent.");
  }

  async function checkVerification() {
    setBusy(true);
    const { data, error } = await supabase.auth.getSession();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Email verified. Opening operations...");
      await navigate({ to: "/admin" });
      return;
    }
    toast.error("Email is not verified yet. Open the confirmation link first.");
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-none bg-background text-foreground shadow-2xl">
        <CardContent className="p-8">
          <span className="block h-1 w-10 rounded-full bg-signal" />
          <h2 className="mt-4 text-3xl font-extrabold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your fleet operations"
              : "Set yourself up as the first administrator."}
          </p>

          {verificationPending && (
            <div className="mt-6 rounded-lg border border-field/30 bg-field/5 p-4 text-sm">
              <p className="font-bold text-field">Verification email sent</p>
              <p className="mt-2 text-muted-foreground">
                Check{" "}
                <strong className="text-foreground">{email}</strong> and open
                the confirmation link. Then return here.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="field"
                  className="w-full"
                  disabled={busy || !email}
                  onClick={() => void checkVerification()}
                >
                  I have verified my email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={busy || !email}
                  onClick={() => void resendConfirmation()}
                >
                  Resend verification email
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="full-name" className="font-semibold">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Full name"
                    className="pl-9"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="staff-email" className="font-semibold">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-password" className="font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="pl-9 pr-9"
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-semibold text-brand hover:underline"
                  disabled={busy}
                  onClick={() => void sendPasswordReset()}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>

            {mode === "login" && canResendConfirmation && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy || !email}
                onClick={() => void resendConfirmation()}
              >
                Resend confirmation email
              </Button>
            )}

            {resetSent && mode === "login" && (
              <p className="rounded-md bg-field/10 px-3 py-2 text-sm text-field">
                Check your inbox for password reset instructions.
              </p>
            )}
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="inline-flex items-center gap-2 font-semibold text-brand hover:underline"
            >
              {mode === "login" ? (
                <UserPlus className="h-4 w-4" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {mode === "login" ? "Create first admin" : "Back to sign in"}
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
            >
              Public site <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
