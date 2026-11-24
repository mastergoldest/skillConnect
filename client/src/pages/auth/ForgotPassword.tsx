
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email: normalizedEmail },
      );

      setSuccess(response.data.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to process your request. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* BACK TO LOGIN */}
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>

        {/* FORM CARD */}
        <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5 sm:p-9">

          {/* ICON */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight">
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            No worries. Enter the email address associated with your
            SkillConnect account and we'll send you instructions to reset
            your password.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {success ? (
            <div
              role="status"
              className="mt-7 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <h2 className="font-bold text-foreground">
                    Request received
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {success}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    If the account exists, check your inbox for the password
                    reset link. Also check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* EMAIL INPUT */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Sending request...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          SkillConnect · Secure Account Recovery
        </p>
      </div>
    </main>
  );
}
