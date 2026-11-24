
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/auth/login`,
        {
          email: normalizedEmail,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Retrieve the authenticated user's account information.
      const authenticatedUser = await refreshUser();

      if (!authenticatedUser) {
        setError(
          "Your sign-in was accepted, but we couldn't load your account. Please try again."
        );
        return;
      }

      setPassword("");

      // Redirect according to the user's account type.
      if (authenticatedUser.accountType === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Unable to sign in. Please check your details and try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[80vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-2">

        {/* Left panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={21} />
              </span>
              SkillConnect
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Discover. Connect. Grow.
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Your skills can take you further.
            </h1>

            <p className="mt-5 text-base leading-7 text-white/80">
              Connect with talented students, discover useful services, and
              turn your skills into meaningful opportunities within the
              University of Ilorin community.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <ShieldCheck className="shrink-0" size={25} />
              <p className="text-sm leading-6 text-white/90">
                A student-focused community built around skills, trust, and
                meaningful connections.
              </p>
            </div>
          </div>

          <p className="relative z-10 text-sm text-white/60">
            © {new Date().getFullYear()} SkillConnect
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-lg font-bold text-foreground lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles size={19} />
              </span>
              SkillConnect
            </Link>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-primary">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enter your account details to continue to SkillConnect.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <span className="text-xs text-muted-foreground">
                    Keep your password secure
                  </span>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-primary transition-colors hover:underline pt-1"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
