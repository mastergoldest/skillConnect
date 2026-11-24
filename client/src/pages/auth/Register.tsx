
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    Mail,
    LockKeyhole,
    UserRound,
    Hash,
    Building2,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        matricNumber: "",
        faculty: "",
        department: "",
        academicLevel: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const {
            fullName,
            email,
            password,
            confirmPassword,
            matricNumber,
            faculty,
            department,
            academicLevel,
        } = formData;

        if (
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !matricNumber.trim() ||
            !faculty.trim() ||
            !department.trim() ||
            !academicLevel
        ) {
            setError("Please complete all required fields.");
            return;
        }

        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${API_URL}/auth/register`, {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                confirmPassword,
                matricNumber: matricNumber.trim().toUpperCase(),
                faculty: faculty.trim(),
                department: department.trim(),
                academicLevel,
            });
            setRegistered(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverMessage = err.response?.data?.message;

                const validationMessage =
                    err.response?.data?.errors?.[0]?.message;

                setError(
                    validationMessage ||
                    serverMessage ||
                    "Registration failed. Please check your information and try again."
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
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-[0.85fr_1.15fr]">

                {/* Left information panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

                    <Link to="/" className="relative z-10 flex items-center gap-2 text-xl font-bold">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                            <Sparkles size={21} />
                        </span>
                        SkillConnect
                    </Link>

                    <div className="relative z-10 max-w-md">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                            Your campus. Your skills. Your opportunities.
                        </p>

                        <h1 className="text-4xl font-bold leading-tight">
                            Your next opportunity starts here.
                        </h1>

                        <p className="mt-5 leading-7 text-white/80">
                            Join the SkillConnect community to discover student talents,
                            find useful services, and connect with people who can help
                            you achieve more.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "Discover talented students",
                                "Showcase your skills and services",
                                "Connect with trusted campus providers",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 size={19} className="shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative z-10 text-sm text-white/60">
                        © {new Date().getFullYear()} SkillConnect
                    </p>
                </section>

                {/* Registration form */}
                <section className="px-5 py-10 sm:px-10 lg:px-12">
                    <div className="mx-auto max-w-xl">

                        <Link
                            to="/"
                            className="mb-8 inline-flex items-center gap-2 text-lg font-bold lg:hidden"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <Sparkles size={19} />
                            </span>
                            SkillConnect
                        </Link>

                        {registered ? (
                            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                                    <Mail size={32} />
                                </div>

                                <h2 className="mt-6 text-2xl font-bold">
                                    Check your email!
                                </h2>

                                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                    Your registration was received. We've sent a verification
                                    link to <strong className="text-foreground">{formData.email}</strong>.
                                    Open the email and follow the link to verify your address.
                                </p>

                                <Link
                                    to="/login"
                                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90"
                                >
                                    Continue to sign in
                                    <ArrowRight size={18} />
                                </Link>

                                <p className="mt-5 text-xs text-muted-foreground">
                                    Check your spam folder if you cannot find the email.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <p className="mb-2 text-sm font-semibold text-primary">
                                        JOIN SKILLCONNECT
                                    </p>

                                    <h2 className="text-3xl font-bold tracking-tight">
                                        Create your account
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        Enter your details to join the University of Ilorin
                                        student community.
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

                                    {/* Personal information */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold">
                                            Personal information
                                        </h3>

                                        <div>
                                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                                                Full name
                                            </label>

                                            <div className="relative">
                                                <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    autoComplete="name"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                                Email address
                                            </label>

                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border" />

                                    {/* Academic information */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold">
                                            Academic information
                                        </h3>

                                        <div>
                                            <label htmlFor="matricNumber" className="mb-2 block text-sm font-medium">
                                                Matriculation number
                                            </label>

                                            <div className="relative">
                                                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="matricNumber"
                                                    name="matricNumber"
                                                    value={formData.matricNumber}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 22/52HL033"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="faculty" className="mb-2 block text-sm font-medium">
                                                Faculty
                                            </label>

                                            <div className="relative">
                                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="faculty"
                                                    name="faculty"
                                                    value={formData.faculty}
                                                    onChange={handleChange}
                                                    placeholder="Enter your faculty"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="department" className="mb-2 block text-sm font-medium">
                                                Department
                                            </label>

                                            <input
                                                id="department"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                placeholder="Enter your department"
                                                disabled={loading}
                                                className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="academicLevel" className="mb-2 block text-sm font-medium">
                                                Current academic level
                                            </label>

                                            <div className="relative">
                                                <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <select
                                                    id="academicLevel"
                                                    name="academicLevel"
                                                    value={formData.academicLevel}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                    className="w-full appearance-none rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="">Select your level</option>
                                                    {["100", "200", "300", "400", "500", "600"].map((level) => (
                                                        <option key={level} value={level}>
                                                            {level} Level
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border" />

                                    {/* Password information */}
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold">
                                            Secure your account
                                        </h3>

                                        <div>
                                            <label htmlFor="password" className="mb-2 block text-sm font-medium">
                                                Password
                                            </label>

                                            <div className="relative">
                                                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Minimum 8 characters"
                                                    autoComplete="new-password"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((value) => !value)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                                                Confirm password
                                            </label>

                                            <div className="relative">
                                                <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter your password again"
                                                    autoComplete="new-password"
                                                    disabled={loading}
                                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword((value) => !value)}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        By creating an account, you agree to provide accurate
                                        student information for verification.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? "Creating account..." : "Create account"}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="mt-8 text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-semibold text-primary hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Register;
