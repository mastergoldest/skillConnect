
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
    CheckCircle2,
    XCircle,
    LoaderCircle,
    MailCheck,
    ArrowRight,
} from "lucide-react";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmail() {
    const { token } = useParams<{ token: string }>();

    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [message, setMessage] = useState(
        "Please wait while we verify your email address."
    );

    const hasVerified = useRef(false);

    useEffect(() => {
        if (!token || hasVerified.current) {
            if (!token) {
                setStatus("error");
                setMessage("The verification link is incomplete.");
            }
            return;
        }

        hasVerified.current = true;

        const verifyEmail = async () => {
            try {
                const response = await axios.post(
                    "http://localhost:5000/api/auth/verify-email",
                    { token },
                    { withCredentials: true }
                );

                setStatus("success");
                setMessage(
                    response.data.message || "Your email has been verified successfully."
                );
            } catch (error: unknown) {
                setStatus("error");

                if (axios.isAxiosError(error)) {
                    setMessage(
                        error.response?.data?.message ||
                        "Verification failed. Your link may have expired or already been used."
                    );
                } else {
                    setMessage("Something went wrong. Please try again.");
                }
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex justify-center">
                    {status === "loading" && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <LoaderCircle className="h-9 w-9 animate-spin" />
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                            <CheckCircle2 className="h-9 w-9" />
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            <XCircle className="h-9 w-9" />
                        </div>
                    )}
                </div>

                <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {status === "loading" && "Verifying your email"}
                    {status === "success" && "Email verified!"}
                    {status === "error" && "Verification unsuccessful"}
                </h1>

                <p className="mb-7 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {message}
                </p>

                {status === "loading" && (
                    <p className="text-xs text-slate-400">
                        Please don't close this page.
                    </p>
                )}

                {status === "success" && (
                    <Link
                        to="/login"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Continue to Login
                        <ArrowRight size={18} />
                    </Link>
                )}

                {status === "error" && (
                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Go to Login
                            <ArrowRight size={18} />
                        </Link>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Having trouble verifying your email? You can request a new verification link to continue.
                        </p>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400 dark:border-slate-800">
                    <MailCheck size={15} />
                    SkillConnect · University of Ilorin
                </div>
            </section>
        </main>
    );
}
