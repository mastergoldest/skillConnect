
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!token) {
            setError("This password reset link is invalid.");
            return;
        }

        if (password.length < 8 || password.length > 128) {
            setError("Password must contain between 8 and 128 characters.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter.");
            return;
        }

        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);

            await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                password,
                confirmPassword,
            });
            setSuccess(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    "Unable to reset your password. Please try again.",
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

                <Link
                    to="/login"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                    <ArrowLeft size={17} />
                    Back to login
                </Link>

                <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5 sm:p-9">

                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {success ? (
                            <CheckCircle2 size={28} />
                        ) : (
                            <ShieldCheck size={28} />
                        )}
                    </div>

                    <h1 className="font-heading text-3xl font-extrabold tracking-tight">
                        {success ? "Password updated!" : "Create a new password"}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {success
                            ? "Your password has been reset successfully. You can now log in using your new password."
                            : "Choose a strong new password for your SkillConnect account."}
                    </p>

                    {error && (
                        <div
                            role="alert"
                            className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        >
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="mt-8 space-y-5">
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-600" size={21} />
                                    <p className="text-sm font-semibold">
                                        Your new password is ready to use.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/login", { replace: true })}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                            >
                                Continue to login
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                            {/* NEW PASSWORD */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    New password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your new password"
                                        className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-muted-foreground">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Confirm new password
                                </label>

                                <div className="relative">
                                    <KeyRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />

                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Enter your password again"
                                        className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle size={18} className="animate-spin" />
                                        Updating password...
                                    </>
                                ) : (
                                    <>
                                        Reset password
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    SkillConnect · Secure Account Recovery
                </p>
            </div>
        </main>
    );
}
